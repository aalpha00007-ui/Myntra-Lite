"use client";
// Bag -> Address -> Payment (demo) -> order placed. Price details always come from GET /api/bag.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNav, Loading, Photo, TopBar, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { goLogin, refreshMe } from "@/lib/useMe";
import type { Address, Bag } from "@/lib/types";

const PAYMENTS: [string, string, string][] = [
  ["cod", "Cash on delivery", "Pay when the order arrives"],
  ["upi", "UPI", "Demo only - no UPI ID is asked for"],
  ["card", "Credit / Debit card", "Demo only - no card details are asked for"],
  ["netbanking", "Net banking", "Demo only - no bank login"],
];

function Steps({ n }: { n: number }) {
  return (
    <div className="steps">
      {["BAG", "ADDRESS", "PAYMENT"].map((s, i) => (
        <span key={s} style={{ display: "contents" }}>{i > 0 ? <i /> : null}<span className={i <= n ? "on" : ""}>{s}</span></span>
      ))}
    </div>
  );
}

export default function BagPage() {
  const router = useRouter();
  const [bag, setBag] = useState<Bag | null>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", line: "", city: "", pin: "", kind: "Home" });
  const [pay, setPay] = useState("cod");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, show] = useToast();

  useEffect(() => { api<Bag>("/api/bag").then((r) => r.ok && setBag(r.data)); }, []);
  useEffect(() => {
    if (step !== 1) return;
    api<{ addresses: Address[] }>("/api/addresses").then((r) => {
      if (r.status === 401) return goLogin();
      if (r.ok) { setAddresses(r.data.addresses); if (r.data.addresses.length) setAddressId(r.data.addresses[0].id); }
    });
  }, [step]);

  async function change(method: "PATCH" | "DELETE", productId: string, body?: { size?: string; qty?: number }) {
    const r = method === "DELETE"
      ? await api<Bag>(`/api/bag?productId=${encodeURIComponent(productId)}`, { method })
      : await api<Bag>("/api/bag", { method, body: { productId, ...body } });
    if (r.status === 401) return goLogin();
    if (!r.ok) return setError(r.data.error ?? "Something went wrong.");
    setBag(r.data);
    refreshMe();
  }
  async function toWishlist(productId: string) {
    await api("/api/wishlist", { method: "POST", body: { productId } });
    await change("DELETE", productId);
    show("Moved to wishlist");
  }
  async function saveAddress() {
    setError(null);
    const r = await api<{ address: Address }>("/api/addresses", { method: "POST", body: form });
    if (!r.ok) return setError(r.data.error ?? "Could not save the address.");
    setAddresses((a) => [...a, r.data.address]);
    setAddressId(r.data.address.id);
  }
  async function placeOrder() {
    setBusy(true); setError(null);
    const r = await api<{ orderId: number }>("/api/orders", { method: "POST", body: { addressId, paymentMethod: pay } });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not place the order.");
    refreshMe();
    router.push(`/orders?placed=${r.data.orderId}`);
  }

  if (!bag) return <><TopBar title="Shopping bag" /><Loading /></>;
  if (!bag.loggedIn) {
    return (
      <>
        <TopBar title="Shopping bag" />
        <div className="empty"><h2>Log in to see your bag</h2><p className="muted">Your bag is saved to your account.</p>
          <Link href="/login?next=/bag" className="obtn" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>Log in</Link></div>
        <BottomNav active="bag" />
      </>
    );
  }
  if (bag.lines.length === 0) {
    return (
      <>
        <TopBar title="Shopping bag" />
        <div className="empty"><h2>Hey, it feels so light!</h2><p className="muted">There is nothing in your bag. Let&apos;s add some items.</p>
          <Link href="/wishlist" className="obtn" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>Add items from wishlist</Link></div>
        <BottomNav active="bag" />
      </>
    );
  }

  const priceBox = (
    <div className="pd">
      <h3>Price details ({bag.count} item{bag.count === 1 ? "" : "s"})</h3>
      <div className="r"><span>Total price</span><span>{bag.totalPriceLabel}</span></div>
      <div className="r"><span>Delivery</span><span>{bag.deliveryLabel === "FREE" ? <span style={{ color: "var(--good)", fontWeight: 700 }}>FREE</span> : bag.deliveryLabel}</span></div>
      <div className="r t"><span>Total amount</span><span>{bag.totalLabel}</span></div>
    </div>
  );
  const action = (label: string, onClick: () => void, disabled = false) => (
    <div className="bar act">
      <div className="tot">{bag.totalLabel}<small>{bag.count} item{bag.count === 1 ? "" : "s"}</small></div>
      <button type="button" className="b" onClick={onClick} disabled={disabled}>{label}</button>
    </div>
  );

  return (
    <>
      <TopBar title={["Shopping bag", "Address", "Payment"][step]} sub={step === 0 ? `${bag.count} item${bag.count === 1 ? "" : "s"}` : undefined} />
      <Steps n={step} />
      {error ? <div className="err">{error}</div> : null}
      <div className="bagwrap">
        <div className="main">
          {step === 0 && bag.lines.map((l) => (
            <div className="line" key={l.productId}>
              <Link href={`/product/${l.productId}`} className="pimg"><Photo id={l.photo} alt={l.name} w={200} /></Link>
              <div>
                <div className="brand">{l.brand}</div>
                <div className="muted" style={{ fontSize: ".88rem" }}>{l.name}</div>
                <div className="sel">
                  <label className="muted" style={{ fontSize: ".8rem" }}>{l.sizeLabel === "size" ? "Size" : l.sizeLabel === "waist" ? "Waist" : "UK"}{" "}
                    <select aria-label="Size" value={l.size} onChange={(e) => change("PATCH", l.productId, { size: e.target.value })}>{l.sizes.map((s) => <option key={s}>{s}</option>)}</select>
                  </label>
                  <label className="muted" style={{ fontSize: ".8rem" }}>Qty{" "}
                    <select aria-label="Quantity" value={l.qty} onChange={(e) => change("PATCH", l.productId, { qty: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}</select>
                  </label>
                </div>
                {l.size === l.suggested ? <span className="twinchip" style={{ margin: "6px 0 0" }}>Fit Twin size</span> : <span className="twinchip warn" style={{ margin: "6px 0 0" }}>Fit Twin suggests {l.suggested}</span>}
                <div className="price" style={{ marginTop: 6 }}>{l.lineTotalLabel}</div>
                <div className="muted" style={{ fontSize: ".78rem" }}>14 days return available</div>
                <div className="lineacts">
                  <button type="button" onClick={() => change("DELETE", l.productId)}>Remove</button>
                  <button type="button" onClick={() => toWishlist(l.productId)}>Move to wishlist</button>
                </div>
              </div>
            </div>
          ))}

          {step === 1 && (
            <>
              {addresses.map((a) => (
                <button type="button" key={a.id} className="payopt" role="radio" aria-checked={addressId === a.id} onClick={() => setAddressId(a.id)}>
                  <span className="rd" /><span><b>{a.name} · {a.kind}</b><small>{a.line}, {a.city} - {a.pin}</small></span>
                </button>
              ))}
              <div className="addr">
                <b style={{ marginBottom: 10 }}>{addresses.length ? "Add another address" : "Add a delivery address"}</b>
                <div className="fields">
                  <label htmlFor="a-name" className="full">Name<input id="a-name" maxLength={40} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                  <label htmlFor="a-line" className="full">Address<input id="a-line" maxLength={120} value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} /></label>
                  <label htmlFor="a-city">City<input id="a-city" maxLength={40} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
                  <label htmlFor="a-pin">Pincode<input id="a-pin" inputMode="numeric" maxLength={6} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} /></label>
                </div>
                <button type="button" className="obtn" style={{ marginTop: 12 }} onClick={saveAddress}>Save address</button>
              </div>
              <div className="demo-note">This is a demo shop. Please use a made-up address.</div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="demo-note">Prototype checkout: no payment is taken and no card, UPI or bank details are asked for.</div>
              <div role="radiogroup" aria-label="Payment method">
                {PAYMENTS.map(([k, n, s]) => (
                  <button key={k} type="button" className="payopt" role="radio" aria-checked={pay === k} onClick={() => setPay(k)}>
                    <span className="rd" /><span><b>{n}</b><small>{s}</small></span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="side">
          {priceBox}
          {step === 0 && action("Place order", () => setStep(1))}
          {step === 1 && action("Continue", () => (addressId ? setStep(2) : setError("Add a delivery address first.")))}
          {step === 2 && action(busy ? "Placing…" : "Place order (demo)", placeOrder, busy)}
          {step > 0 ? <button type="button" className="link" style={{ display: "block", margin: "8px 16px" }} onClick={() => setStep((step - 1) as 0 | 1)}>Back</button> : null}
        </div>
      </div>
      {toast}
    </>
  );
}
