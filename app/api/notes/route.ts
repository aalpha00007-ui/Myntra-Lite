// POST /api/notes { productId, body } - "what would you still need to know?" (shown on the results page, without names)
import { setSessionCookie, userOrGuest } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const b = await readJson(request);
  const productId = typeof b?.productId === "string" ? b.productId : "";
  const body = typeof b?.body === "string" ? b.body.trim() : "";
  if (body.length < 1 || body.length > 300) return fail(400, "Write a note of up to 300 characters.");
  const sql = db();
  if ((await sql`SELECT 1 FROM products WHERE id = ${productId}`).length === 0) return fail(400, "That product does not exist.");
  const { user, newToken } = await userOrGuest();
  await sql`INSERT INTO notes (user_id, product_id, body) VALUES (${user.id}, ${productId}, ${body})`;
  return setSessionCookie(ok({ saved: true }, 201), newToken);
}
