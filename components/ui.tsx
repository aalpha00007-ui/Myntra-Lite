"use client";
// Shared building blocks: icons, photo, headers, bottom nav, product card, sheets, toast.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { api } from "@/lib/api";
import { goLogin, refreshMe, useMe } from "@/lib/useMe";
import type { ProductCard as Card, ProductDetail, Profile } from "@/lib/types";

// ---------- icons ----------
const Svg = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
export const Icon = {
  back: () => <Svg size={24}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>,
  heart: ({ filled = false }: { filled?: boolean }) => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20s-7.5-4.6-9.5-9C1 7.6 3.2 4.5 6.5 4.5c2.2 0 3.6 1.3 4.5 2.6.9-1.3 2.3-2.6 4.5-2.6 3.3 0 5.5 3.1 4 6.5-2 4.4-7.5 9-7.5 9z" />
    </svg>
  ),
  bag: () => <Svg><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></Svg>,
  home: () => <Svg><path d="M4 11l8-6 8 6v9H4z" /><path d="M10 20v-5h4v5" /></Svg>,
  grid: () => <Svg><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></Svg>,
  user: () => <Svg><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" /></Svg>,
  x: () => <Svg size={14}><path d="M6 6l12 12M18 6L6 18" /></Svg>,
  search: () => <Svg size={18}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></Svg>,
  chev: () => <Svg size={18}><path d="M9 6l6 6-6 6" /></Svg>,
  pencil: () => <Svg><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" /></Svg>,
  box: () => <Svg><path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5z" /><path d="M3 7.5l9 4.5 9-4.5M12 12v9" /></Svg>,
  chart: () => <Svg><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Svg>,
  ruler: () => <Svg><path d="M3 17L17 3l4 4L7 21z" /><path d="M7 13l2 2M10 10l2 2M13 7l2 2" /></Svg>,
  info: () => <Svg><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>,
  logout: () => <Svg><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></Svg>,
  check: () => <Svg size={32}><path d="M5 12l5 5 9-10" /></Svg>,
};

// ---------- photo (free Unsplash photos) ----------
export function Photo({ id, alt, crop = "faces,center", w = 600 }: { id: string; alt: string; crop?: string; w?: number }) {
  const [broken, setBroken] = useState(false);
  const h = Math.round((w * 4) / 3);
  return (
    <div className="photo">
      {broken ? (
        <span className="ph">Photo unavailable</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70${crop ? `&crop=${crop}` : ""}`} alt={alt} loading="lazy" onError={() => setBroken(true)} />
      )}
    </div>
  );
}

export const Proto = () => (
  <div className="proto">Myntra-Lite is a learning project, not affiliated with Myntra · demo products and reviews · photos from Unsplash</div>
);
export const Loading = ({ text = "Loading…" }: { text?: string }) => <div className="loading">{text}</div>;

// ---------- headers + nav ----------
export function WebHeader() {
  const me = useMe();
  const router = useRouter();
  const [q, setQ] = useState("");
  const nav: [string, string][] = [["Men", "/shop?dept=men"], ["Women", "/shop?dept=women"], ["Footwear", "/shop?dept=footwear"], ["Categories", "/categories"]];
  return (
    <header className="web">
      <Link href="/" className="logo" aria-label="Myntra-Lite home">Myntra-Lite<small>learning project</small></Link>
      <nav className="wnav" aria-label="Departments">
        {nav.map(([label, href]) => (
          <Link key={label} href={href} style={{ fontWeight: 800, fontSize: ".9rem", letterSpacing: ".04em", textTransform: "uppercase", padding: "28px 0" }}>{label}</Link>
        ))}
        <Link href="/wishlist" style={{ fontWeight: 800, fontSize: ".9rem", letterSpacing: ".04em", textTransform: "uppercase", padding: "28px 0" }}>Fit Twin<sup style={{ color: "var(--accent)", fontSize: ".62rem", marginLeft: 3 }}>NEW</sup></Link>
      </nav>
      <form className="wsearch" role="search" onSubmit={(e) => { e.preventDefault(); router.push(`/shop?q=${encodeURIComponent(q)}`); }}>
        <Icon.search />
        <input id="wq" type="search" placeholder="Search for products and brands" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <div className="wico">
        <Link href="/profile" style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: ".78rem", fontWeight: 700 }}><Icon.user />Profile</Link>
        <Link href="/wishlist" style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: ".78rem", fontWeight: 700, position: "relative" }}>
          <Icon.heart />Wishlist{me && me.wishlistCount > 0 ? <span className="badge">{me.wishlistCount}</span> : null}
        </Link>
        <Link href="/bag" style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: ".78rem", fontWeight: 700, position: "relative" }}>
          <Icon.bag />Bag{me && me.bagCount > 0 ? <span className="badge">{me.bagCount}</span> : null}
        </Link>
      </div>
    </header>
  );
}

export function TopBar({ title, sub, back = true, right }: { title: ReactNode; sub?: string; back?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="hdr">
      {back && (
        <button type="button" className="ico" aria-label="Back" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}>
          <Icon.back />
        </button>
      )}
      <div className="t"><b>{title}</b>{sub ? <small>{sub}</small> : null}</div>
      {right}
    </header>
  );
}

export function HeaderIcons() {
  const me = useMe();
  return (
    <>
      <Link href="/wishlist" className="ico" aria-label="Wishlist"><Icon.heart />{me && me.wishlistCount > 0 ? <span className="badge">{me.wishlistCount}</span> : null}</Link>
      <Link href="/bag" className="ico" aria-label="Bag"><Icon.bag />{me && me.bagCount > 0 ? <span className="badge">{me.bagCount}</span> : null}</Link>
    </>
  );
}

export function BottomNav({ active }: { active: "home" | "cats" | "wishlist" | "bag" | "profile" }) {
  const me = useMe();
  const tabs: [typeof active, string, string, ReactNode, number][] = [
    ["home", "Home", "/", <Icon.home key="h" />, 0],
    ["cats", "Categories", "/categories", <Icon.grid key="c" />, 0],
    ["wishlist", "Wishlist", "/wishlist", <Icon.heart key="w" />, me?.wishlistCount ?? 0],
    ["bag", "Bag", "/bag", <Icon.bag key="b" />, me?.bagCount ?? 0],
    ["profile", "Profile", "/profile", <Icon.user key="p" />, 0],
  ];
  return (
    <nav className="bar nav" aria-label="Main">
      {tabs.map(([k, label, href, icon, n]) => (
        <Link key={k} href={href} aria-current={active === k ? "page" : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 0 6px", fontSize: ".68rem", fontWeight: 600, color: active === k ? "var(--accent)" : "var(--muted)", position: "relative" }}>
          {icon}{label}{n > 0 ? <span className="badge" style={{ right: "26%" }}>{n}</span> : null}
        </Link>
      ))}
    </nav>
  );
}

// ---------- product card ----------
export function ProductCard({ p, mode = "shop", onHeart, onRemove, onMoveToBag }: {
  p: Card; mode?: "shop" | "wish"; onHeart?: (p: Card) => void; onRemove?: (p: Card) => void; onMoveToBag?: (p: Card) => void;
}) {
  const crop = p.department === "footwear" ? "" : "faces,center";
  return (
    <article className="card">
      <div className="pimg">
        <Link href={`/product/${p.id}`} aria-label={`${p.brand} ${p.name}`}><Photo id={p.photo} alt={`${p.brand} ${p.name}`} crop={crop} w={480} /></Link>
        <span className="rt">{p.rating} <span>★</span> | {p.reviewCount}</span>
        {mode === "wish" ? (
          <button type="button" className="x" aria-label={`Remove ${p.name} from wishlist`} onClick={() => onRemove?.(p)}><Icon.x /></button>
        ) : (
          <button type="button" className="hrt" aria-pressed={p.wishlisted} aria-label={p.wishlisted ? "Remove from wishlist" : "Add to wishlist"} onClick={() => onHeart?.(p)}><Icon.heart filled={p.wishlisted} /></button>
        )}
      </div>
      <Link href={`/product/${p.id}`} className="info">
        <div className="brand">{p.brand}</div><div className="nm">{p.name}</div><div className="price">{p.priceLabel}</div>
      </Link>
      <span className={`twinchip ${p.fit.weak || !p.fit.usingLikeYou ? "warn" : ""}`}>
        Your {p.sizeLabel}: {p.fit.suggested}{p.fit.usingLikeYou ? ` · ${p.fit.likeYou} like you` : ""}
      </span>
      {mode === "wish" ? <button type="button" className="mtb" onClick={() => onMoveToBag?.(p)}>Move to bag</button> : null}
    </article>
  );
}

// Heart toggle used on shop/home cards. Returns the updated wishlisted flag, or null if the user must log in.
export async function toggleWishlist(p: Card): Promise<boolean | null> {
  const r = p.wishlisted
    ? await api(`/api/wishlist?productId=${encodeURIComponent(p.id)}`, { method: "DELETE" })
    : await api("/api/wishlist", { method: "POST", body: { productId: p.id } });
  if (r.status === 401) { goLogin(); return null; }
  refreshMe();
  return r.ok ? !p.wishlisted : p.wishlisted;
}

// ---------- toast + sheet ----------
export function useToast(): [ReactNode, (t: string) => void] {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = (t: string) => {
    setText(t);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(null), 2400);
  };
  return [text ? <div className="toast" role="status">{text}</div> : null, show];
}

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}

// ---------- Size Details (the shopper's fit profile) ----------
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export function SizeDetailsSheet({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setError(null);
    api<{ profile: Profile }>("/api/profile").then((r) => { if (r.ok) setP(r.data.profile); });
  }, [open]);
  const set = (k: keyof Profile, v: string) => setP((old) => (old ? { ...old, [k]: k === "heightCm" ? Number(v) : v } : old));
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!p) return;
    setBusy(true);
    const r = await api("/api/profile", { method: "PUT", body: p });
    setBusy(false);
    if (r.status === 401) return goLogin();
    if (!r.ok) return setError(r.data.error ?? "Could not save.");
    refreshMe();
    onSaved?.();
    onClose();
  }
  const sel = (id: keyof Profile, label: string, opts: string[], full = false) => (
    <label htmlFor={`p-${id}`} className={full ? "full" : undefined}>{label}
      <select id={`p-${id}`} value={p ? String(p[id]) : ""} onChange={(e) => set(id, e.target.value)}>
        {opts.map((o) => <option key={o} value={o}>{cap(o)}</option>)}
      </select>
    </label>
  );
  return (
    <Sheet open={open} onClose={onClose}>
      <h2>Size details</h2>
      <div className="sub">Fit Twin uses these to find buyers with a build like yours.</div>
      {!p ? <Loading /> : (
        <form onSubmit={save}>
          <div className="fields">
            <label htmlFor="p-heightCm">Height (cm)<input id="p-heightCm" type="number" min={140} max={200} value={p.heightCm} onChange={(e) => set("heightCm", e.target.value)} required /></label>
            {sel("build", "Build", ["slim", "regular", "broad"])}
            {sel("top", "Usual top size", ["XS", "S", "M", "L", "XL", "XXL"])}
            {sel("waist", "Usual waist (in)", ["28", "30", "32", "34", "36"])}
            {sel("shoe", "Usual shoe (UK)", ["6", "7", "8", "9", "10", "11"])}
            {sel("pref", "I like clothes to feel", ["snug", "regular", "relaxed"])}
          </div>
          {error ? <div className="err">{error}</div> : null}
          <button className="pbtn" type="submit" disabled={busy}>{busy ? "Saving…" : "Save size details"}</button>
        </form>
      )}
    </Sheet>
  );
}

// ---------- choose a size and add to bag (from the wishlist) ----------
export function SizeSheet({ productId, onClose, onAdded }: { productId: string | null; onClose: () => void; onAdded: (msg: string) => void }) {
  const [d, setD] = useState<ProductDetail | null>(null);
  const [size, setSize] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setD(null); setError(null);
    if (!productId) return;
    api<ProductDetail>(`/api/products/${productId}`).then((r) => { if (r.ok) { setD(r.data); setSize(r.data.fitDetail.suggested); } });
  }, [productId]);
  async function add() {
    if (!d) return;
    const r = await api("/api/bag", { method: "POST", body: { productId: d.id, size, fromWishlist: true } });
    if (r.status === 401) return goLogin();
    if (!r.ok) return setError(r.data.error ?? "Could not add to bag.");
    refreshMe();
    onClose();
    onAdded(`Added to bag · ${size === d.fitDetail.suggested ? "Fit Twin size " : "size "}${size}`);
  }
  return (
    <Sheet open={productId !== null} onClose={onClose}>
      {!d ? <Loading /> : (
        <>
          <h2>Select {d.sizeLabel}</h2>
          <div className="sub">{d.brand} · {d.name} · {d.priceLabel}</div>
          <div className="twin" style={{ marginBottom: 14 }}>
            <div className="lbl">Fit Twin suggests {d.fitDetail.suggested}</div>
            <div className="why" style={{ marginTop: 4, fontSize: ".88rem" }}>
              {d.fitDetail.agree} of {d.fitDetail.basis} {d.fitDetail.usingLikeYou ? "buyers like you" : "buyers"} {d.fitDetail.movedWords}.{" "}
              <span className={`conf ${d.fitDetail.weak ? "warn" : ""}`}>{d.fitDetail.confidence}</span>
            </div>
          </div>
          <SizeChips sizes={d.sizes} usual={d.fitDetail.usual} suggested={d.fitDetail.suggested} value={size} onPick={setSize} wide={d.department === "footwear" || d.sizeLabel === "waist"} />
          {error ? <div className="err">{error}</div> : null}
          <button type="button" className="pbtn" onClick={add}>Add to bag · {size}</button>
          <Link href={`/product/${d.id}`} className="link" style={{ display: "block", textAlign: "center", marginTop: 14 }}>See reviews from buyers like you</Link>
        </>
      )}
    </Sheet>
  );
}

export function SizeChips({ sizes, usual, suggested, value, onPick, wide }: { sizes: string[]; usual: string; suggested: string; value: string; onPick: (s: string) => void; wide: boolean }) {
  return (
    <div className="sizes" role="group" aria-label="Sizes">
      {sizes.map((z) => (
        <button key={z} type="button" className={`chip ${wide ? "wide" : ""} ${z === usual ? "usual" : ""}`} aria-pressed={z === value} onClick={() => onPick(z)}>
          {z}{z === suggested ? <span className="tw">FIT TWIN</span> : null}
        </button>
      ))}
    </div>
  );
}
