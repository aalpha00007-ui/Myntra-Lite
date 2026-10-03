// GET /api/me - who is logged in, their size details (or the example ones), and badge counts.
import { currentUser } from "@/lib/auth";
import { profileFor } from "@/lib/catalog";
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import type { Me } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  const { profile, isExample } = await profileFor(user?.id ?? null);
  let wishlistCount = 0;
  let bagCount = 0;
  if (user) {
    const [c] = await db()`
      SELECT (SELECT COUNT(*) FROM wishlist_items WHERE user_id = ${user.id})::int AS w,
             (SELECT COALESCE(SUM(qty), 0) FROM bag_items WHERE user_id = ${user.id})::int AS b`;
    wishlistCount = Number(c.w);
    bagCount = Number(c.b);
  }
  const me: Me = {
    user: user ? { name: user.name, phone: user.phone, initial: user.name.charAt(0).toUpperCase() } : null,
    profile, isExample, wishlistCount, bagCount,
  };
  return ok(me);
}
