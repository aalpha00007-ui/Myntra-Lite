"use client";
// Home: search, categories, banners, "Still deciding?" (your wishlist) and "Picked for your fit".
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNav, HeaderIcons, Icon, Loading, Photo, ProductCard, Proto, SizeDetailsSheet, toggleWishlist, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { useMe } from "@/lib/useMe";
import type { ProductCard as Card } from "@/lib/types";

const CIRCLES: [string, string, string][] = [
  ["Men", "/shop?dept=men", "shirt3"], ["Women", "/shop?dept=women", "dress"], ["Ethnic", "/shop?dept=women&sub=Ethnic%20Wear", "kurta2"],
  ["Jeans", "/shop?dept=men&sub=Jeans", "jeans"], ["Footwear", "/shop?dept=footwear", "sneaker2"], ["Blazers", "/shop?dept=men&sub=Blazers", "blazer"],
  ["Hoodies", "/shop?dept=men&sub=Hoodies%20%26%20Sweaters", "grey-pullover-hoodie"], ["Heels", "/shop?dept=footwear&sub=Heels", "sandal"],
  ["Loafers", "/shop?dept=footwear&sub=Loafers", "loafer2"],
];

export default function Home() {
  const router = useRouter();
  const me = useMe();
  const [products, setProducts] = useState<Card[] | null>(null);
  const [q, setQ] = useState("");
  const [fitOpen, setFitOpen] = useState(false);
  const [toast, show] = useToast();

  const load = () => api<{ products: Card[] }>("/api/products").then((r) => r.ok && setProducts(r.data.products));
  useEffect(() => { load(); }, []);

  async function heart(p: Card) {
    const now = await toggleWishlist(p);
    if (now === null) return;
    setProducts((list) => list?.map((x) => (x.id === p.id ? { ...x, wishlisted: now } : x)) ?? null);
    show(now ? "Added to wishlist · Fit Twin will suggest your size" : "Removed from wishlist");
  }

  const photoOf = (id: string) => products?.find((p) => p.id === id)?.photo;
  const wished = products?.filter((p) => p.wishlisted) ?? [];
  const rest = products?.filter((p) => !p.wishlisted) ?? [];

  return (
    <>
      <header className="hdr">
        <span className="logo">Myntra-Lite<small>learning project</small></span>
        <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/shop?q=${encodeURIComponent(q)}`); }}>
          <Icon.search /><input id="q" type="search" placeholder="Search for shirts, kurtas, shoes" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <HeaderIcons />
      </header>
      <Proto />
      {!products ? <Loading /> : (
        <>
          <div className="cats">
            {CIRCLES.map(([label, href, id]) => (
              <Link key={label} href={href} className="cat"><span className="c">{photoOf(id) ? <Photo id={photoOf(id)!} alt={label} w={200} crop={["loafer2", "sneaker2", "sandal"].includes(id) ? "" : "faces,center"} /> : null}</span>{label}</Link>
            ))}
          </div>
          <div className="banners">
            {[
              ["#14958f,#0f6e6a", "New · Fit Twin", "Find your size from buyers like you", "On every item in your wishlist", "/wishlist", "dress"],
              ["#9e2a2b,#5e1516", "Wedding edit", "Kurta sets for the season", "Cotton, embroidery, easy fits", "/shop?dept=women&sub=Ethnic%20Wear", "kurta"],
              ["#3b4a6b,#1f273b", "Workwear", "Blazers that fit the shoulders", "Check Fit Twin before you buy", "/shop?dept=men&sub=Blazers", "blazer"],
            ].map(([bg, k, h, s, href, id]) => (
              <Link key={k} href={href} className="bn" style={{ background: `linear-gradient(120deg,${bg})` }}>
                <span className="tx"><span className="k">{k}</span><span className="h">{h}</span><span className="s">{s}</span></span>
                <span className="ar">{photoOf(id) ? <Photo id={photoOf(id)!} alt="" w={300} /> : null}</span>
              </Link>
            ))}
          </div>
          {wished.length > 0 && (
            <>
              <div className="secttl"><h2>Still deciding?</h2><Link href="/wishlist" className="link">Wishlist ({wished.length})</Link></div>
              <div className="rail">{wished.map((p) => <ProductCard key={p.id} p={p} onHeart={heart} />)}</div>
            </>
          )}
          <div className="secttl">
            <h2>Picked for your fit</h2>
            <button type="button" className="link" onClick={() => setFitOpen(true)}>{me?.isExample ? "Add your size" : "Size details"}</button>
          </div>
          <div className="grid">{rest.map((p) => <ProductCard key={p.id} p={p} onHeart={heart} />)}</div>
        </>
      )}
      <SizeDetailsSheet open={fitOpen} onClose={() => setFitOpen(false)} onSaved={() => { load(); show("Size details saved. Fit Twin updated."); }} />
      {toast}
      <BottomNav active="home" />
    </>
  );
}
