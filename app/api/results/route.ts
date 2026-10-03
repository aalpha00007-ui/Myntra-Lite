// GET /api/results - the prototype test results, computed from wishlist items, orders and events.
// North-star metric (as defined in the case study): of the testers who wishlisted something, the share who bought
// a wishlisted item within 30 days of saving it. Fit Twin's outcome: the share of wishlisted items added to the
// bag within 14 days. Item-level conversion is shown too.
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
      EXISTS (SELECT 1 FROM events x WHERE x.user_id = w.user_id AND x.product_id = w.product_id
              AND x.action IN ('added_to_bag','ordered') AND x.created_at BETWEEN w.first_at AND w.first_at + INTERVAL '14 days') AS decided14,
      EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
              WHERE o.user_id = w.user_id AND oi.product_id = w.product_id
              AND o.placed_at BETWEEN w.first_at AND w.first_at + INTERVAL '30 days') AS bought30,
      EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
              WHERE o.user_id = w.user_id AND oi.product_id = w.product_id) AS ordered,
      EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
              WHERE o.user_id = w.user_id AND oi.product_id = w.product_id AND oi.size = oi.shown_suggested) AS fit_twin,
      EXISTS (SELECT 1 FROM events e WHERE e.user_id = w.user_id AND e.product_id = w.product_id AND e.action = 'unsure') AS unsure,
      EXISTS (SELECT 1 FROM events e WHERE e.user_id = w.user_id AND e.product_id = w.product_id AND e.action IN ('not_for_me','unwishlisted'))
        AND NOT EXISTS (SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
              WHERE o.user_id = w.user_id AND oi.product_id = w.product_id) AS not_for_me
    FROM (SELECT e.user_id, e.product_id, MIN(e.created_at) AS first_at FROM events e JOIN users u ON u.id = e.user_id
          WHERE e.action = 'wishlisted' AND u.username IS DISTINCT FROM ${CI_USER} AND u.phone IS DISTINCT FROM '9000000000'
          GROUP BY e.user_id, e.product_id) w
    JOIN products p ON p.id = w.product_id`;
  const testers = await sql`SELECT COUNT(DISTINCT e.user_id)::int AS n FROM events e JOIN users u ON u.id = e.user_id WHERE u.username IS DISTINCT FROM ${CI_USER} AND u.phone IS DISTINCT FROM '9000000000'`;
  const notes = await sql`
    SELECT n.body, p.name, n.created_at FROM notes n JOIN products p ON p.id = n.product_id JOIN users u ON u.id = n.user_id
    WHERE u.username IS DISTINCT FROM ${CI_USER} AND u.phone IS DISTINCT FROM '9000000000' ORDER BY n.created_at DESC LIMIT 12`;

  const ordered = pairs.filter((r) => r.ordered);
  const byProduct = new Map<string, typeof pairs>();
  for (const r of pairs) byProduct.set(r.name, [...(byProduct.get(r.name) ?? []), r]);

  const wishlisters = new Set(pairs.map((r) => Number(r.user_id)));
  const buyers = new Set(pairs.filter((r) => r.bought30).map((r) => Number(r.user_id)));

  const results: Results = {
    testers: Number(testers[0].n),
    wishlisters: wishlisters.size,
    wishlistersWhoBought: buyers.size,
    northStarLabel: pct(buyers.size, wishlisters.size),
    decisionRateLabel: pct(pairs.filter((r) => r.decided14).length, pairs.length),
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
