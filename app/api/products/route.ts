// GET /api/products?dept=men|women|footwear&sub=Shirts&q=linen&sort=popular|fit|low|high&brand=A,B&price=lt1500|1500-2500|gt2500
// Every card carries the Fit Twin size for whoever is asking.
import { currentUser } from "@/lib/auth";
import { productCards } from "@/lib/catalog";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dept = url.searchParams.get("dept");
  const sub = url.searchParams.get("sub");
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const sort = url.searchParams.get("sort") ?? "popular";
  const brands = (url.searchParams.get("brand") ?? "").split(",").map((b) => b.trim()).filter(Boolean);
  const price = url.searchParams.get("price");

  const user = await currentUser();
  let cards = await productCards(user?.id ?? null);
  if (dept) cards = cards.filter((c) => c.department === dept);
  if (sub) cards = cards.filter((c) => c.sub === sub);
  if (q) cards = cards.filter((c) => `${c.brand} ${c.name} ${c.sub}`.toLowerCase().includes(q));
  const scope = cards; // brand list is offered before brand/price filters apply
  if (brands.length) cards = cards.filter((c) => brands.includes(c.brand));
  if (price === "lt1500") cards = cards.filter((c) => c.price < 1500);
  if (price === "1500-2500") cards = cards.filter((c) => c.price >= 1500 && c.price <= 2500);
  if (price === "gt2500") cards = cards.filter((c) => c.price > 2500);

  const rank = { "Strong match": 2, "Good match": 1, "Mixed signals": 0 } as const;
  cards = [...cards].sort((a, b) =>
    sort === "low" ? a.price - b.price
    : sort === "high" ? b.price - a.price
    : sort === "fit" ? rank[b.fit.confidence] - rank[a.fit.confidence] || b.fit.likeYou - a.fit.likeYou
    : Number(b.rating) - Number(a.rating) || b.reviewCount - a.reviewCount
  );

  const brandCounts = [...new Set(scope.map((c) => c.brand))].sort().map((b) => ({ brand: b, count: scope.filter((c) => c.brand === b).length }));
  return ok({ products: cards, brands: brandCounts });
}
