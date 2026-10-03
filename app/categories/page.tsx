"use client";
// Categories: departments on the left, sub-categories on the right.
import Link from "next/link";
import { useEffect, useState } from "react";
import { BottomNav, HeaderIcons, Photo, Proto, TopBar } from "@/components/ui";
import { api } from "@/lib/api";
import type { ProductCard } from "@/lib/types";

const DEPTS = [
  { id: "men", name: "Men", subs: [["Shirts", "shirt3"], ["T-Shirts", "tee2"], ["Hoodies & Sweaters", "grey-pullover-hoodie"], ["Jackets", "blue-denim-trucker-jacket"], ["Blazers", "blazer"], ["Ethnic Wear", "blue-cotton-kurta-set"], ["Trousers", "cargo"], ["Shorts", "olive-chino-shorts"], ["Jeans", "jeans"]] },
  { id: "women", name: "Women", subs: [["Dresses", "dress"], ["Tops", "white-casual-top"], ["Ethnic Wear", "kurta2"], ["Jeans", "mid-rise-blue-jeans"], ["Trousers", "wtrous"], ["Skirts", "skirt"], ["Blazers", "grey-tailored-blazer"]] },
  { id: "footwear", name: "Footwear", subs: [["Sneakers", "sneaker2"], ["Boots", "boot"], ["Loafers", "loafer2"], ["Formal Shoes", "brown-leather-oxfords"], ["Heels", "sandal"], ["Sandals & Flats", "woven-multicolour-sandals"]] },
];

export default function Categories() {
  const [dept, setDept] = useState("men");
  const [photos, setPhotos] = useState<Record<string, string>>({});
  useEffect(() => {
    api<{ products: ProductCard[] }>("/api/products").then((r) => {
      if (r.ok) setPhotos(Object.fromEntries(r.data.products.map((p) => [p.id, p.photo])));
    });
  }, []);
  const d = DEPTS.find((x) => x.id === dept)!;
  return (
    <>
      <TopBar title="Categories" back={false} right={<HeaderIcons />} />
      <Proto />
      <div className="catwrap">
        <nav className="catnav" aria-label="Departments">
          {DEPTS.map((x) => (
            <button key={x.id} type="button" aria-current={x.id === dept ? "true" : "false"} onClick={() => setDept(x.id)}>{x.name}</button>
          ))}
        </nav>
        <div className="subgrid">
          {d.subs.map(([label, id]) => (
            <Link key={label} href={`/shop?dept=${d.id}&sub=${encodeURIComponent(label)}`} className="sub">
              <span className="c">{photos[id] ? <Photo id={photos[id]} alt={label} w={240} crop={d.id === "footwear" ? "" : "faces,center"} /> : null}</span>{label}
            </Link>
          ))}
          <Link href={`/shop?dept=${d.id}`} className="shopall">View all {d.name.toLowerCase()}</Link>
        </div>
      </div>
      <BottomNav active="cats" />
    </>
  );
}
