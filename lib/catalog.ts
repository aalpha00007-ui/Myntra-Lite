// Server-side reads shared by the APIs. Everything here is computed from stored facts.
import { db } from "@/lib/db";
import { analyse, EXAMPLE_PROFILE, reviewSummary, reviewView, SIZE_LABEL, SIZES, type ReviewFact } from "@/lib/fit";
import { deliveryFor, inr } from "@/lib/money";
import type { Bag, OrderView, Profile, ProductCard, ProductDetail, SizeSystem } from "@/lib/types";

type ProductRow = {
  id: string; gender: string; department: "men" | "women" | "footwear"; sub: string; brand: string; name: string;
  price: number; size_system: SizeSystem; photo: string; colour: string; rating: string; review_count: number;
};

export async function profileFor(userId: number | null): Promise<{ profile: Profile; isExample: boolean }> {
  if (!userId) return { profile: EXAMPLE_PROFILE, isExample: true };
  const rows = await db()`SELECT height_cm, build, top_size, waist, shoe, fit_pref FROM size_profiles WHERE user_id = ${userId}`;
  if (rows.length === 0) return { profile: EXAMPLE_PROFILE, isExample: true };
  const r = rows[0];
  return {
    profile: { heightCm: Number(r.height_cm), build: r.build, top: r.top_size, waist: r.waist, shoe: r.shoe, pref: r.fit_pref },
    isExample: false,
  };
}

async function productRows(ids?: string[]): Promise<ProductRow[]> {
  const sql = db();
  const rows = ids
    ? await sql`
        SELECT p.*, ROUND(AVG(r.rating)::numeric, 1)::text AS rating, COUNT(r.id)::int AS review_count
        FROM products p LEFT JOIN reviews r ON r.product_id = p.id
        WHERE p.id = ANY(${ids}::text[]) GROUP BY p.id`
    : await sql`
        SELECT p.*, ROUND(AVG(r.rating)::numeric, 1)::text AS rating, COUNT(r.id)::int AS review_count
        FROM products p LEFT JOIN reviews r ON r.product_id = p.id
        GROUP BY p.id ORDER BY p.department, p.sub, p.id`;
  return rows as ProductRow[];
}

async function reviewFacts(ids: string[]): Promise<Map<string, ReviewFact[]>> {
  const rows = await db()`
    SELECT id, product_id, height_cm, build, usual_size, kept_size, fit, rating, body, has_photo,
           GREATEST(0, EXTRACT(DAY FROM NOW() - created_at))::int AS days_ago
    FROM reviews WHERE product_id = ANY(${ids}::text[]) ORDER BY created_at DESC`;
  const map = new Map<string, ReviewFact[]>();
  for (const r of rows) {
    const list = map.get(r.product_id) ?? [];
    list.push({
      id: Number(r.id), height_cm: Number(r.height_cm), build: r.build, usual_size: r.usual_size, kept_size: r.kept_size,
      fit: r.fit, rating: Number(r.rating), body: r.body, has_photo: Boolean(r.has_photo), days_ago: Number(r.days_ago),
    });
    map.set(r.product_id, list);
  }
  return map;
}

async function wishlistedIds(userId: number | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db()`SELECT product_id FROM wishlist_items WHERE user_id = ${userId}`;
  return new Set(rows.map((r) => String(r.product_id)));
}

function card(p: ProductRow, reviews: ReviewFact[], profile: Profile, wished: Set<string>): ProductCard {
  const { summary } = analyse(p.size_system, reviews, profile);
  return {
    id: p.id, brand: p.brand, name: p.name, price: p.price, priceLabel: inr(p.price), photo: p.photo, colour: p.colour,
    department: p.department, sub: p.sub, rating: p.rating ?? "0", reviewCount: Number(p.review_count),
    sizeLabel: SIZE_LABEL[p.size_system], fit: summary, wishlisted: wished.has(p.id),
  };
}

export async function productCards(userId: number | null, ids?: string[]): Promise<ProductCard[]> {
  const rows = await productRows(ids);
  if (rows.length === 0) return [];
  const [{ profile }, reviews, wished] = await Promise.all([profileFor(userId), reviewFacts(rows.map((r) => r.id)), wishlistedIds(userId)]);
  return rows.map((p) => card(p, reviews.get(p.id) ?? [], profile, wished));
}

export async function productDetail(id: string, userId: number | null): Promise<ProductDetail | null> {
  const rows = await productRows([id]);
  if (rows.length === 0) return null;
  const p = rows[0];
  const [{ profile }, reviews, wished] = await Promise.all([profileFor(userId), reviewFacts([id]), wishlistedIds(userId)]);
  const list = reviews.get(id) ?? [];
  const { detail, likeYou, basis } = analyse(p.size_system, list, profile);
  const likeSet = new Set(likeYou.map((r) => r.id));
  const all = await productCards(userId);
  const similar = all.filter((c) => c.id !== id && c.department === p.department).slice(0, 8);
  return {
    ...card(p, list, profile, wished),
    sizes: SIZES[p.size_system],
    fitDetail: detail,
    summary: reviewSummary(detail, basis),
    reviewsLikeYou: likeYou.map((r) => reviewView(r, true)),
    reviewsAll: list.map((r) => reviewView(r, likeSet.has(r.id))),
    photoReviews: list.filter((r) => r.has_photo).length,
    similar,
  };
}

// The size Fit Twin is showing this user for one product right now.
export async function suggestedFor(productId: string, userId: number | null): Promise<string | null> {
  const d = await productDetail(productId, userId);
  return d ? d.fitDetail.suggested : null;
}

export async function bagView(userId: number | null): Promise<Bag> {
  if (!userId) return { loggedIn: false, lines: [], count: 0, totalPriceLabel: inr(0), deliveryLabel: "FREE", totalLabel: inr(0) };
  const rows = await db()`
    SELECT b.product_id, b.size, b.qty, p.brand, p.name, p.photo, p.price, p.size_system
    FROM bag_items b JOIN products p ON p.id = b.product_id
    WHERE b.user_id = ${userId} ORDER BY b.added_at`;
  const cards = rows.length ? await productCards(userId, rows.map((r) => String(r.product_id))) : [];
  const sug = new Map(cards.map((c) => [c.id, c.fit.suggested]));
  const total = rows.reduce((s, r) => s + Number(r.price) * Number(r.qty), 0);
  const fee = deliveryFor(total);
  return {
    loggedIn: true,
    lines: rows.map((r) => ({
      productId: r.product_id, brand: r.brand, name: r.name, photo: r.photo, size: r.size, qty: Number(r.qty),
      sizes: SIZES[r.size_system as SizeSystem], sizeLabel: SIZE_LABEL[r.size_system as SizeSystem],
      suggested: sug.get(r.product_id) ?? r.size, lineTotalLabel: inr(Number(r.price) * Number(r.qty)),
    })),
    count: rows.reduce((s, r) => s + Number(r.qty), 0),
    totalPriceLabel: inr(total),
    deliveryLabel: fee === 0 ? "FREE" : inr(fee),
    totalLabel: inr(total + fee),
  };
}

const PAY_LABEL: Record<string, string> = { cod: "Cash on delivery", upi: "UPI", card: "Card", netbanking: "Net banking" };
const dateLabel = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

export async function ordersView(userId: number, orderId?: number): Promise<OrderView[]> {
  const sql = db();
  const orders = orderId
    ? await sql`SELECT * FROM orders WHERE user_id = ${userId} AND id = ${orderId}`
    : await sql`SELECT * FROM orders WHERE user_id = ${userId} ORDER BY placed_at DESC LIMIT 30`;
  if (orders.length === 0) return [];
  const items = await sql`
    SELECT oi.*, p.photo FROM order_items oi JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ANY(${orders.map((o) => Number(o.id))}::int[])`;
  return orders.map((o) => {
    const lines = items.filter((i) => Number(i.order_id) === Number(o.id));
    const total = lines.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0) + Number(o.delivery_fee);
    const placed = new Date(o.placed_at);
    return {
      id: Number(o.id),
      placedLabel: dateLabel(placed),
      deliveryByLabel: "Delivery by " + dateLabel(new Date(placed.getTime() + 4 * 864e5)),
      paymentLabel: PAY_LABEL[o.payment_method] ?? o.payment_method,
      shipTo: `${o.ship_name}, ${o.ship_line}, ${o.ship_city} - ${o.ship_pin}`,
      lines: lines.map((i) => ({
        productId: i.product_id, brand: i.brand, name: i.name, photo: i.photo, size: i.size, qty: Number(i.qty),
        tookFitTwin: i.shown_suggested !== null && i.shown_suggested === i.size, lineTotalLabel: inr(Number(i.price) * Number(i.qty)),
      })),
      totalLabel: inr(total),
    };
  });
}
