"use client";
// Product listing: department / sub-category / search, with sort chips and (on desktop) a filter sidebar.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BottomNav, HeaderIcons, Loading, ProductCard, TopBar, toggleWishlist, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import type { ProductCard as Card } from "@/lib/types";

const SORTS: [string, string][] = [["popular", "Popular"], ["fit", "Best fit for me"], ["low", "Price: low to high"], ["high", "Price: high to low"]];
const PRICES: [string, string][] = [["lt1500", "Under ₹1,500"], ["1500-2500", "₹1,500 to ₹2,500"], ["gt2500", "Above ₹2,500"]];
const DEPT_NAME: Record<string, string> = { men: "Men", women: "Women", footwear: "Footwear" };

function Shop() {
  const router = useRouter();
  const sp = useSearchParams();
  const dept = sp.get("dept") ?? "";
  const sub = sp.get("sub") ?? "";
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "popular";
  const brand = sp.get("brand") ?? "";
  const price = sp.get("price") ?? "";
  const [data, setData] = useState<{ products: Card[]; brands: { brand: string; count: number }[] } | null>(null);
  const [toast, show] = useToast();

  useEffect(() => {
    setData(null);
    api<{ products: Card[]; brands: { brand: string; count: number }[] }>(`/api/products?${sp.toString()}`).then((r) => r.ok && setData(r.data));
  }, [sp]);

  const setParam = (k: string, v: string) => {
    const next = new URLSearchParams(sp.toString());
    if (v) next.set(k, v); else next.delete(k);
    router.replace(`/shop?${next.toString()}`);
  };
  const brands = brand ? brand.split(",") : [];
  const toggleBrand = (b: string) => setParam("brand", (brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b]).join(","));

  async function heart(p: Card) {
    const now = await toggleWishlist(p);
    if (now === null) return;
    setData((d) => (d ? { ...d, products: d.products.map((x) => (x.id === p.id ? { ...x, wishlisted: now } : x)) } : d));
    show(now ? "Added to wishlist · Fit Twin will suggest your size" : "Removed from wishlist");
  }

  const title = q ? `Results for "${q}"` : sub || DEPT_NAME[dept] || "All products";
  const count = data ? `${data.products.length} items` : "";
  return (
    <>
      <TopBar title={title} sub={count} right={<HeaderIcons />} />
      <div className="plphead donly"><h1>{title} <span className="muted" style={{ fontWeight: 400 }}>- {count}</span></h1></div>
      <div className="hscroll" role="group" aria-label="Sort">
        {SORTS.map(([k, l]) => <button key={k} type="button" className="fchip" aria-pressed={sort === k} onClick={() => setParam("sort", k === "popular" ? "" : k)}>{l}</button>)}
      </div>
      {!data ? <Loading /> : (
        <div className="plpwrap">
          <aside className="filters" aria-label="Filters">
            <div className="fg" style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              {brand || price ? <button type="button" className="link" onClick={() => { const n = new URLSearchParams(sp.toString()); n.delete("brand"); n.delete("price"); router.replace(`/shop?${n.toString()}`); }}>Clear all</button> : null}
            </div>
            <div className="fg"><h3>Brand</h3>
              {data.brands.map((b) => (
                <label key={b.brand}><input type="checkbox" checked={brands.includes(b.brand)} onChange={() => toggleBrand(b.brand)} />{b.brand} <span className="cnt">({b.count})</span></label>
              ))}
            </div>
            <div className="fg"><h3>Price</h3>
              {PRICES.map(([k, l]) => <label key={k}><input type="radio" name="price" checked={price === k} onChange={() => setParam("price", k)} />{l}</label>)}
            </div>
          </aside>
          <div className="grid">
            {data.products.length === 0 ? <p className="muted">No items match. Try another search or clear the filters.</p> : data.products.map((p) => <ProductCard key={p.id} p={p} onHeart={heart} />)}
          </div>
        </div>
      )}
      {toast}
      <BottomNav active="cats" />
    </>
  );
}

export default function ShopPage() {
  return <Suspense fallback={<Loading />}><Shop /></Suspense>;
}
