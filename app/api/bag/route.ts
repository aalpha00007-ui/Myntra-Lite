// GET    /api/bag                                        - your bag with price details worked out
// POST   /api/bag { productId, size, fromWishlist? }     - add (or re-size) an item; moving from the wishlist removes it there
// PATCH  /api/bag { productId, size?, qty? }             - change size or quantity
// DELETE /api/bag?productId=x                            - remove it
import { currentUser } from "@/lib/auth";
import { bagView, suggestedFor } from "@/lib/catalog";
import { db } from "@/lib/db";
import { SIZES } from "@/lib/fit";
import { fail, ok, readJson } from "@/lib/http";
import type { SizeSystem } from "@/lib/types";

export const dynamic = "force-dynamic";

async function sizesOf(productId: string): Promise<string[] | null> {
  const rows = await db()`SELECT size_system FROM products WHERE id = ${productId}`;
  return rows.length ? SIZES[rows[0].size_system as SizeSystem] : null;
}

export async function GET() {
  const user = await currentUser();
  return ok(await bagView(user?.id ?? null));
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to add items to your bag.");
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const productId = typeof body.productId === "string" ? body.productId : "";
  const size = typeof body.size === "string" ? body.size : "";
  const sizes = await sizesOf(productId);
  if (!sizes) return fail(400, "That product does not exist.");
  if (!sizes.includes(size)) return fail(400, `Size must be one of ${sizes.join(", ")}.`);

  const sql = db();
  const shown = await suggestedFor(productId, user.id);
  await sql`
    INSERT INTO bag_items (user_id, product_id, size, qty) VALUES (${user.id}, ${productId}, ${size}, 1)
    ON CONFLICT (user_id, product_id) DO UPDATE SET size = EXCLUDED.size`;
  await sql`INSERT INTO events (user_id, product_id, action, size, shown_suggested) VALUES (${user.id}, ${productId}, 'added_to_bag', ${size}, ${shown})`;
  if (body.fromWishlist === true) await sql`DELETE FROM wishlist_items WHERE user_id = ${user.id} AND product_id = ${productId}`;
  return ok(await bagView(user.id));
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in first.");
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const productId = typeof body.productId === "string" ? body.productId : "";
  const sql = db();
  const inBag = await sql`SELECT 1 FROM bag_items WHERE user_id = ${user.id} AND product_id = ${productId}`;
  if (inBag.length === 0) return fail(404, "That item is not in your bag.");
  if (body.size !== undefined) {
    const sizes = (await sizesOf(productId)) ?? [];
    if (typeof body.size !== "string" || !sizes.includes(body.size)) return fail(400, `Size must be one of ${sizes.join(", ")}.`);
    await sql`UPDATE bag_items SET size = ${body.size} WHERE user_id = ${user.id} AND product_id = ${productId}`;
  }
  if (body.qty !== undefined) {
    const qty = Number(body.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 5) return fail(400, "Quantity must be between 1 and 5.");
    await sql`UPDATE bag_items SET qty = ${qty} WHERE user_id = ${user.id} AND product_id = ${productId}`;
  }
  return ok(await bagView(user.id));
}

export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in first.");
  const productId = new URL(request.url).searchParams.get("productId") ?? "";
  await db()`DELETE FROM bag_items WHERE user_id = ${user.id} AND product_id = ${productId}`;
  return ok(await bagView(user.id));
}
