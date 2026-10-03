"use client";
// Product page: Fit Twin panel, size chips, review summary, reviews from buyers like you, "not ready yet?", similar items.
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HeaderIcons, Icon, Loading, Photo, ProductCard, SizeChips, SizeDetailsSheet, TopBar, toggleWishlist, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { goLogin, refreshMe } from "@/lib/useMe";
import type { ProductCard as Card, ProductDetail } from "@/lib/types";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<ProductDetail | null>(null);
  const [missing, setMissing] = useState(false);
  const [size, setSize] = useState("");
  const [tab, setTab] = useState<"like" | "all">("like");
  const [showAll, setShowAll] = useState(false);
  const [fitOpen, setFitOpen] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [toast, show] = useToast();

  const load = useCallback(() => {
    api<ProductDetail>(`/api/products/${id}`).then((r) => {
      if (r.status === 404) return setMissing(true);
      if (r.ok) { setP(r.data); setSize(r.data.fitDetail.suggested); }
    });
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (missing) return <><TopBar title="Not found" /><div className="empty"><h2>That product doesn't exist</h2><Link href="/" className="obtn">Go home</Link></div></>;
  if (!p) return <><TopBar title="" /><Loading /></>;

  const f = p.fitDetail;
  const list = tab === "like" && p.reviewsLikeYou.length ? p.reviewsLikeYou : p.reviewsAll;
  const shown = showAll ? list : list.slice(0, 4);
  const crop = p.department === "footwear" ? "" : "faces,center";

  async function addToBag() {
    const r = await api("/api/bag", { method: "POST", body: { productId: p!.id, size } });
    if (r.status === 401) return goLogin();
    if (!r.ok) return show(r.data.error ?? "Could not add to bag.");
    refreshMe();
    show(`Added to bag · ${size === f.suggested ? "Fit Twin size " : "size "}${size}`);
  }
  async function wish() {
    const now = await toggleWishlist(p!);
    if (now !== null) setP({ ...p!, wishlisted: now });
  }
  async function decide(action: "unsure" | "not_for_me") {
    const r = await api("/api/events", { method: "POST", body: { productId: p!.id, action } });
    if (r.status === 401) return goLogin();
    show(action === "unsure" ? "Noted: still unsure" : "Noted: not for me");
  }
  async function sendNote() {
    if (!note.trim()) return setMsg("Write a short note first.");
    const r = await api("/api/notes", { method: "POST", body: { productId: p!.id, body: note } });
    if (r.status === 401) return goLogin();
    setMsg(r.ok ? "Note sent. Thank you." : r.data.error ?? "Could not send the note.");
    if (r.ok) setNote("");
  }
  async function similarHeart(c: Card) {
    const now = await toggleWishlist(c);
    if (now !== null) setP({ ...p!, similar: p!.similar.map((x) => (x.id === c.id ? { ...x, wishlisted: now } : x)) });
  }

  return (
    <>
      <TopBar title={p.brand} right={<HeaderIcons />} />
      <div className="pdp">
        <div className="left">
          <div className="gal">
            {["faces,center", "top", "bottom", "entropy"].map((c, i) => (
              <div className="gi" key={c}><Photo id={p.photo} alt={`${p.brand} ${p.name} photo ${i + 1}`} crop={p.department === "footwear" && i === 0 ? "" : c} w={720} /></div>
            ))}
            <div className="rate">{p.rating} <span>★</span><em>{p.reviewCount}</em></div>
          </div>
        </div>
        <div className="right">
          <section className="sec">
            <h1>{p.brand} <span>{p.name}</span></h1>
            <div className="big">{p.priceLabel}</div>
            <div className="tax">inclusive of all taxes</div>
          </section>

          <section className="sec">
            <div className="twin">
              <div className="lbl">Fit Twin · your {p.sizeLabel}</div>
              <div className="row">
                <div className="sz">{f.suggested}</div>
                <div className="why">
                  {f.usingLikeYou ? <><b>{f.agree} of {f.likeYou}</b> buyers with a build like yours {f.movedWords}.</> : <>Based on all {f.basis} buyers: <b>{f.agree}</b> {f.movedWords}.</>}
                  <span className={`conf ${f.weak ? "warn" : ""}`}>{f.confidence}</span>
                </div>
              </div>
              <div className="fitbar" aria-hidden="true">
                <span className="s" style={{ width: `${f.pct.small}%` }} /><span className="t" style={{ width: `${f.pct.true}%` }} /><span className="l" style={{ width: `${f.pct.large}%` }} />
              </div>
              <div className="fitkey"><span>Ran small <b>{f.pct.small}%</b></span><span>True to size <b>{f.pct.true}%</b></span><span>Ran large <b>{f.pct.large}%</b></span></div>
              {!f.usingLikeYou ? <div className="lowdata">Fewer than 3 reviewers share your build, so this uses all buyers.</div> : null}
            </div>
            <div className="sh" style={{ marginTop: 16 }}><h2>Select {p.sizeLabel}</h2><button type="button" className="link" onClick={() => setFitOpen(true)}>Size details</button></div>
            <SizeChips sizes={p.sizes} usual={f.usual} suggested={f.suggested} value={size} onPick={setSize} wide={p.sizeLabel !== "size"} />
            <div className="sizenote">Underlined: your usual {p.sizeLabel} ({f.usual}). {size !== f.suggested ? `You picked ${size}; buyers like you suggest ${f.suggested}.` : ""}</div>
          </section>

          <section className="sec">
            <div className="ai">
              <div className="sh" style={{ margin: 0 }}><h2>What buyers like you say</h2></div>
              <ul>{p.summary.map((s) => <li key={s}>{s}</li>)}</ul>
              <div className="ai-src">Summarised from {f.basis} reviews{f.usingLikeYou ? " by buyers with a build like yours" : ""}.</div>
            </div>
          </section>

          <section className="sec">
            <div className="sh"><h2>Ratings &amp; reviews</h2><span className="muted" style={{ fontSize: ".8rem" }}>{p.photoReviews} with photos</span></div>
            <div className="tabs" role="tablist">
              <button type="button" role="tab" className="tab" aria-selected={tab === "like" && p.reviewsLikeYou.length > 0} disabled={!p.reviewsLikeYou.length} onClick={() => { setTab("like"); setShowAll(false); }}>Buyers like you ({p.reviewsLikeYou.length})</button>
              <button type="button" role="tab" className="tab" aria-selected={tab === "all" || !p.reviewsLikeYou.length} onClick={() => { setTab("all"); setShowAll(false); }}>All ({p.reviewsAll.length})</button>
            </div>
            {shown.map((r) => (
              <div className="rv" key={r.id}>
                <div className="top"><span className={`stars ${r.rating < 4 ? "mid" : ""}`}>{r.rating} ★</span><span className="fitp">{r.fitLabel}</span>{r.likeYou ? <span className="liku">Like you</span> : null}</div>
                <p>{r.body}</p>
                {r.hasPhoto ? <div className="rph"><Photo id={p.photo} alt="Customer photo" crop={crop} w={160} /><small>Photo · demo</small></div> : null}
                <div className="who">{r.who}</div>
              </div>
            ))}
            {list.length > 4 ? <button type="button" className="link" style={{ marginTop: 8 }} onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer" : `View all ${list.length} reviews`}</button> : null}
          </section>

          <section className="sec">
            <div className="sh"><h2>Not ready yet?</h2></div>
            <div className="row2">
              <button type="button" className="obtn" onClick={() => decide("unsure")}>Still unsure</button>
              <button type="button" className="obtn" onClick={() => decide("not_for_me")}>Not for me</button>
            </div>
            <label htmlFor="missing" className="msg" style={{ display: "block", marginTop: 12 }}>What would you still need to know? (optional, shared with the test team without your name)</label>
            <textarea id="missing" maxLength={300} placeholder="For example: how the fabric feels, sleeve length" value={note} onChange={(e) => setNote(e.target.value)} />
            <button type="button" className="obtn" style={{ marginTop: 8 }} onClick={sendNote}>Send note</button>
            {msg ? <div className="msg">{msg}</div> : null}
          </section>

          <div className="bar act">
            <button type="button" className={`w ${p.wishlisted ? "on" : ""}`} onClick={wish}><Icon.heart filled={p.wishlisted} />{p.wishlisted ? "Wishlisted" : "Wishlist"}</button>
            <button type="button" className="b" onClick={addToBag}><Icon.bag />Add to bag · {size}</button>
          </div>
        </div>
      </div>
      <div className="secttl"><h2>Similar products</h2></div>
      <div className="rail" style={{ paddingBottom: 16 }}>{p.similar.map((c) => <ProductCard key={c.id} p={c} onHeart={similarHeart} />)}</div>
      <SizeDetailsSheet open={fitOpen} onClose={() => setFitOpen(false)} onSaved={() => { load(); show("Size details saved. Fit Twin updated."); }} />
      {toast}
    </>
  );
}
