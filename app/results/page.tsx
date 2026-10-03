"use client";
// Prototype test results: wishlist -> purchase conversion and Fit Twin usage, computed live from the database.
import { useEffect, useState } from "react";
import { BottomNav, Loading, TopBar } from "@/components/ui";
import { api } from "@/lib/api";
import type { Results } from "@/lib/types";

export default function ResultsPage() {
  const [r, setR] = useState<Results | null>(null);
  useEffect(() => { api<Results>("/api/results").then((x) => x.ok && setR(x.data)); }, []);
  return (
    <>
      <TopBar title="Fit Twin test results" sub="Live, from every tester" />
      {!r ? <Loading /> : (
        <>
          <p className="muted" style={{ padding: "12px 12px 0", fontSize: ".88rem", margin: 0 }}>
            North-star metric: of the items testers saved to their wishlist, how many they went on to buy.
          </p>
          <div className="stats">
            {[[r.conversionLabel, "Wishlist → purchase"], [r.fitTwinShareLabel, "Bought in the Fit Twin size"], [String(r.testers), "Testers"],
              [String(r.wishlistedItems), "Items wishlisted"], [String(r.orderedFromWishlist), "Wishlisted items bought"], [String(r.unsure), "Still unsure"],
              [String(r.notForMe), "Not for me / removed"]].map(([v, l]) => (
              <div className="stat" key={l}><div className="n mono">{v}</div><div className="l">{l}</div></div>
            ))}
          </div>
          <div className="tw-wrap">
            <table>
              <thead><tr><th>Item</th><th>Wishlisted</th><th>Bought</th><th>Conversion</th><th>Fit Twin size</th><th>Unsure</th></tr></thead>
              <tbody>
                {r.rows.length === 0 ? <tr><td colSpan={6} className="muted">No wishlist activity yet.</td></tr> : r.rows.map((x) => (
                  <tr key={x.name}><td>{x.name}</td><td className="num">{x.wishlisted}</td><td className="num">{x.ordered}</td><td className="num">{x.conversionLabel}</td><td className="num">{x.fitTwinLabel}</td><td className="num">{x.unsure}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="h3">Still missing, in testers&apos; words</h3>
          <ul className="notes">
            {r.notes.length === 0 ? <li className="muted" style={{ listStyle: "none", marginLeft: -18 }}>No notes yet.</li> : r.notes.map((n, i) => <li key={i}><b>{n.product}:</b> {n.body} <span className="muted">({n.whenLabel})</span></li>)}
          </ul>
        </>
      )}
      <BottomNav active="profile" />
    </>
  );
}
