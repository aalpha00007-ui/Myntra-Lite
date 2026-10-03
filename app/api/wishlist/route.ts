// No login needed: a guest account is created the first time you save something.
// GET    /api/wishlist                 - your wishlist (with Fit Twin sizes)
// POST   /api/wishlist { productId }   - save an item
// DELETE /api/wishlist?productId=x     - remove it (recorded as "not for me" for the test results)
import { currentUser, setSessionCookie, userOrGuest } from "@/lib/auth";
import { productCards } from "@/lib/catalog";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

async function list(userId: number) {
  const rows = await db()`SELECT product_id FROM wishlist_items WHERE user_id = ${userId} ORDER BY added_at DESC`;
  const ids = rows.map((r) => String(r.product_id));
  if (ids.length === 0) return [];
  const cards = await productCards(userId, ids);
  return ids.map((id) => cards.find((c) => c.id === id)).filter((c) => c !== undefined);
}

export async function GET() {
  const user = await currentUser();
  if (!user) return ok({ products: [] });
  return ok({ products: await list(user.id) });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const sql = db();
  const exists = await sql`SELECT 1 FROM products WHERE id = ${productId}`;
  if (exists.length === 0) return fail(400, "That product does not exist.");
  const { user, newToken } = await userOrGuest();
  const added = await sql`
    INSERT INTO wishlist_items (user_id, product_id) VALUES (${user.id}, ${productId})
    ON CONFLICT DO NOTHING RETURNING product_id`;
  if (added.length > 0) await sql`INSERT INTO events (user_id, product_id, action) VALUES (${user.id}, ${productId}, 'wishlisted')`;
  return setSessionCookie(ok({ products: await list(user.id) }), newToken);
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) return ok({ products: [] });
  const productId = new URL(request.url).searchParams.get("productId") ?? "";
  const sql = db();
  const removed = await sql`DELETE FROM wishlist_items WHERE user_id = ${user.id} AND product_id = ${productId} RETURNING product_id`;
  if (removed.length > 0) await sql`INSERT INTO events (user_id, product_id, action) VALUES (${user.id}, ${productId}, 'unwishlisted')`;
  return ok({ products: await list(user.id) });
}
