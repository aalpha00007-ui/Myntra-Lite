// GET  /api/orders?id=12                          - your orders (or one), totals computed from the items
// POST /api/orders { addressId, paymentMethod }   - place the bag as an order. DEMO: no money moves.
import { currentUser } from "@/lib/auth";
import { ordersView, suggestedFor } from "@/lib/catalog";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";
import { deliveryFor } from "@/lib/money";

export const dynamic = "force-dynamic";
const METHODS = ["cod", "upi", "card", "netbanking"];

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to see your orders.");
  const id = Number(new URL(request.url).searchParams.get("id"));
  const orders = await ordersView(user.id, Number.isInteger(id) && id > 0 ? id : undefined);
  return ok({ orders });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to place an order.");
  const b = await readJson(request);
  if (!b) return fail(400, "Request body must be valid JSON.");
  const addressId = Number(b.addressId);
  const method = typeof b.paymentMethod === "string" ? b.paymentMethod : "";
  if (!METHODS.includes(method)) return fail(400, "Choose a payment method: cod, upi, card or netbanking.");

  const sql = db();
  const addr = await sql`SELECT * FROM addresses WHERE id = ${Number.isInteger(addressId) ? addressId : 0} AND user_id = ${user.id}`;
  if (addr.length === 0) return fail(400, "Choose a delivery address.");
  const bag = await sql`
    SELECT b.product_id, b.size, b.qty, p.brand, p.name, p.price
    FROM bag_items b JOIN products p ON p.id = b.product_id WHERE b.user_id = ${user.id}`;
  if (bag.length === 0) return fail(400, "Your bag is empty.");

  const itemsTotal = bag.reduce((s, r) => s + Number(r.price) * Number(r.qty), 0);
  const a = addr[0];
  const [order] = await sql`
    INSERT INTO orders (user_id, ship_name, ship_line, ship_city, ship_pin, payment_method, delivery_fee)
    VALUES (${user.id}, ${a.name}, ${a.line}, ${a.city}, ${a.pin}, ${method}, ${deliveryFor(itemsTotal)}) RETURNING id`;

  for (const r of bag) {
    const shown = await suggestedFor(r.product_id, user.id);
    const wished = await sql`SELECT 1 FROM events WHERE user_id = ${user.id} AND product_id = ${r.product_id} AND action = 'wishlisted' LIMIT 1`;
    await sql`
      INSERT INTO order_items (order_id, product_id, brand, name, price, size, qty, shown_suggested, from_wishlist)
      VALUES (${order.id}, ${r.product_id}, ${r.brand}, ${r.name}, ${r.price}, ${r.size}, ${r.qty}, ${shown}, ${wished.length > 0})`;
    await sql`INSERT INTO events (user_id, product_id, action, size, shown_suggested) VALUES (${user.id}, ${r.product_id}, 'ordered', ${r.size}, ${shown})`;
  }
  await sql`DELETE FROM bag_items WHERE user_id = ${user.id}`;
  return ok({ orderId: Number(order.id) }, 201);
}
