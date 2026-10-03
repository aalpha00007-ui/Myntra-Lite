"use client";
// Orders. After checkout the app lands here with ?placed=ID and shows the confirmation on top.
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BottomNav, Icon, Loading, Photo, TopBar } from "@/components/ui";
import { api } from "@/lib/api";
import { goLogin } from "@/lib/useMe";
import type { OrderView } from "@/lib/types";

function Orders() {
  const placed = Number(useSearchParams().get("placed"));
  const [orders, setOrders] = useState<OrderView[] | null>(null);
  useEffect(() => {
    api<{ orders: OrderView[] }>("/api/orders").then((r) => {
      if (r.status === 401) return goLogin();
      if (r.ok) setOrders(r.data.orders);
    });
  }, []);
  const just = orders?.find((o) => o.id === placed);
  return (
    <>
      <TopBar title="Orders" sub={orders ? `${orders.length} order${orders.length === 1 ? "" : "s"}` : ""} />
      {!orders ? <Loading /> : (
        <div className="ordwrap">
          {just ? (
            <div className="done">
              <div className="tick"><Icon.check /></div>
              <h2>Order placed (demo)</h2>
              <p className="muted">Order #{just.id} · {just.paymentLabel} · {just.deliveryByLabel}</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}><Link href="/" className="obtn">Continue shopping</Link></div>
            </div>
          ) : null}
          {orders.length === 0 ? <div className="empty"><h2>No orders yet</h2><p className="muted">Orders you place appear here.</p></div> : orders.map((o) => (
            <div className="pd" key={o.id}>
              <h3>Order #{o.id} · {o.placedLabel} · {o.paymentLabel}</h3>
              {o.lines.map((l) => (
                <div className="line" key={l.productId} style={{ borderBottom: "1px solid var(--line)", padding: "10px 0", gridTemplateColumns: "64px minmax(0,1fr)" }}>
                  <Link href={`/product/${l.productId}`} className="pimg"><Photo id={l.photo} alt={l.name} w={160} /></Link>
                  <div>
                    <div className="brand">{l.brand}</div><div className="muted" style={{ fontSize: ".86rem" }}>{l.name}</div>
                    <div style={{ fontSize: ".85rem", marginTop: 2 }}>Size {l.size} · Qty {l.qty} · {l.lineTotalLabel}</div>
                    {l.tookFitTwin ? <span className="twinchip" style={{ margin: "6px 0 0" }}>Fit Twin size</span> : null}
                  </div>
                </div>
              ))}
              <div className="r" style={{ fontSize: ".85rem", color: "var(--muted)" }}><span>{o.deliveryByLabel}</span><span>{o.shipTo}</span></div>
              <div className="r t"><span>Total</span><span>{o.totalLabel}</span></div>
            </div>
          ))}
        </div>
      )}
      <BottomNav active="profile" />
    </>
  );
}

export default function OrdersPage() {
  return <Suspense fallback={<Loading />}><Orders /></Suspense>;
}
