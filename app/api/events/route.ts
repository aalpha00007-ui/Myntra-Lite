// POST /api/events { productId, action: "unsure" | "not_for_me" } - a wishlister's answer on the product page.
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in first.");
  const b = await readJson(request);
  const productId = typeof b?.productId === "string" ? b.productId : "";
  const action = b?.action;
  if (action !== "unsure" && action !== "not_for_me") return fail(400, "Action must be unsure or not_for_me.");
  const sql = db();
  if ((await sql`SELECT 1 FROM products WHERE id = ${productId}`).length === 0) return fail(400, "That product does not exist.");
  await sql`INSERT INTO events (user_id, product_id, action) VALUES (${user.id}, ${productId}, ${action})`;
  return ok({ recorded: action });
}
