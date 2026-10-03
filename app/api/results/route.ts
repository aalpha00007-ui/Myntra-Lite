// GET /api/results - the prototype test results, computed from wishlist items, orders and events.
// North-star metric: of the items testers wishlisted, the share they went on to buy.
// The CI test account (username ci-test) is left out so automated runs don't count as testers.
import { db } from "@/lib/db";
import { ok } from "@/lib/http";
import type { Results } from "@/lib/types";

export const dynamic = "force-dynamic";
const CI_USER = "ci-test";
const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}%` : "–");

export async function GET() {
  const sql = db();
  // One row per (tester, product) they ever wishlisted, with what happened next.
  const pairs = await sql`
    SELECT w.user_id, w.product_id, p.name,
      EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
              WHERE o.user_id = w.user_id AND oi.product_id = w.product_id) AS ordered,
      EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
              WHERE o.user_id = w.user_id AND oi.product_id = w.product_id AND oi.size = oi.shown_suggested) AS fit_twin,
      EXISTS (SELECT 1 FROM events e WHERE e.user_id = w.user_id AND e.product_id = w.product_id AND e.action = 'unsure') AS unsure,
      EXISTS (SELECT 1 FROM events e WHERE e.user_id = w.user_id AND e.product_id = w.product_id AND e.action IN ('not_for_me','unwishlisted'))
        AND NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
              WHERE o.user_id = w.user_id AND oi.product_id = w.product_id) AS not_for_me
    FROM (SELECT DISTINCT e.user_id, e.product_id FROM events e JOIN users u ON u.id = e.user_id
          WHERE e.action = 'wishlisted' AND u.username IS DISTINCT FROM ${CI_USER} AND u.phone IS DISTINCT FROM '9000000000') w
    JOIN products p ON p.id = w.product_id`;
  const testers = await sql`SELECT COUNT(DISTINCT e.user_id)::int AS n FROM events e JOIN users u ON u.id = e.user_id WHERE u.username IS DISTINCT FROM ${CI_USER} AND u.phone IS DISTINCT FROM '9000000000'`;
  const notes = await sql`
    SELECT n.body, p.name, n.created_at FROM notes n JOIN products p ON p.id = n.product_id JOIN users u ON u.id = n.user_id
    WHERE u.username IS DISTINCT FROM ${CI_USER} AND u.phone IS DISTINCT FROM '9000000000' ORDER BY n.created_at DESC LIMIT 12`;

  const ordered = pairs.filter((r) => r.ordered);
  const byProduct = new Map<string, typeof pairs>();
  for (const r of pairs) byProduct.set(r.name, [...(byProduct.get(r.name) ?? []), r]);

  const results: Results = {
    testers: Number(testers[0].n),
    wishlistedItems: pairs.length,
    orderedFromWishlist: ordered.length,
    conversionLabel: pct(ordered.length, pairs.length),
    fitTwinShareLabel: pct(ordered.filter((r) => r.fit_twin).length, ordered.length),
    unsure: pairs.filter((r) => r.unsure && !r.ordered).length,
    notForMe: pairs.filter((r) => r.not_for_me).length,
    rows: [...byProduct.entries()]
      .map(([name, rs]) => {
        const o = rs.filter((r) => r.ordered);
        return { name, wishlisted: rs.length, ordered: o.length, conversionLabel: pct(o.length, rs.length),
          fitTwinLabel: pct(o.filter((r) => r.fit_twin).length, o.length), unsure: rs.filter((r) => r.unsure && !r.ordered).length };
      })
      .sort((a, b) => b.wishlisted - a.wishlisted),
    notes: notes.map((n) => ({ product: n.name, body: n.body,
      whenLabel: new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) })),
  };
  return ok(results);
}
