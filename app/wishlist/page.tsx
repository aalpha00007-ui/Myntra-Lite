"use client";
// Wishlist: every saved item shows the Fit Twin size; "Move to bag" opens a size sheet with the suggestion pre-selected.
import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomNav, HeaderIcons, Icon, Loading, ProductCard, Proto, SizeDetailsSheet, SizeSheet, TopBar, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { goLogin, refreshMe, useMe } from "@/lib/useMe";
import type { ProductCard as Card } from "@/lib/types";

export default function Wishlist() {
  const me = useMe();
  const [data, setData] = useState<{ products: Card[] } | null>(null);
  const [filter, setFilter] = useState("All");
  const [moving, setMoving] = useState<string | null>(null);
  const [fitOpen, setFitOpen] = useState(false);
  const [toast, show] = useToast();

  const load = () => api<{ products: Card[] }>("/api/wishlist").then((r) => r.ok && setData(r.data));
  useEffect(() => { load(); }, []);

  async function remove(p: Card) {
    const r = await api<{ products: Card[] }>(`/api/wishlist?productId=${encodeURIComponent(p.id)}`, { method: "DELETE" });
    if (r.status === 401) return goLogin();
    if (r.ok) { setData(r.data); refreshMe(); show("Removed from wishlist"); }
  }

  const groups = data ? ["All", ...new Set(data.products.map((p) => p.sub))] : ["All"];
  const items = data?.products.filter((p) => filter === "All" || p.sub === filter) ?? [];

  return (
    <>
      <TopBar
        title="Wishlist"
        sub={data ? `${data.products.length} item${data.products.length === 1 ? "" : "s"}` : ""}
        right={<><button type="button" className="ico" aria-label="Edit size details" onClick={() => setFitOpen(true)}><Icon.pencil /></button><HeaderIcons /></>}
      />
      <Proto />
      {!data ? <Loading /> : data.products.length === 0 ? (
        <div className="empty"><h2>Your wishlist is empty</h2><p className="muted">Tap the heart on any item to save it here.</p><Link href="/" className="obtn">Continue shopping</Link></div>
      ) : (
        <>
          <div className="hscroll">
            <span className="coll">Collections</span>
            {groups.map((g) => <button key={g} type="button" className="fchip" aria-pressed={g === filter} onClick={() => setFilter(g)}>{g}</button>)}
          </div>
          <div className="notice">
            <div><div className="ttl">Not sure about the size? <span>Ask Fit Twin.</span></div>
              <div className="sub">{me?.isExample ? "Using an example fit. Add your size details for better matches." : "Matched to your size details."}</div></div>
            <button type="button" className="go" onClick={() => setFitOpen(true)}>{me?.isExample ? "Add fit" : "Edit"}</button>
          </div>
          <div className="grid wishgrid">
            {items.map((p) => <ProductCard key={p.id} p={p} mode="wish" onRemove={remove} onMoveToBag={(c) => setMoving(c.id)} />)}
          </div>
        </>
      )}
      <SizeSheet productId={moving} onClose={() => setMoving(null)} onAdded={(m) => { show(m); load(); }} />
      <SizeDetailsSheet open={fitOpen} onClose={() => setFitOpen(false)} onSaved={() => { load(); show("Size details saved. Fit Twin updated."); }} />
      {toast}
      <BottomNav active="wishlist" />
    </>
  );
}
