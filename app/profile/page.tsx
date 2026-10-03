"use client";
// Profile: "Shopping for ...", Basics / Size Details chips, Orders, Wishlist, results, log out.
import Link from "next/link";
import { useState } from "react";
import { BottomNav, Icon, Loading, Proto, SizeDetailsSheet, TopBar, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { useMe } from "@/lib/useMe";

export default function Profile() {
  const me = useMe();
  const [fitOpen, setFitOpen] = useState(false);
  const [toast, show] = useToast();
  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  const p = me?.profile;
  return (
    <>
      <TopBar title={<span style={{ color: "var(--muted)", fontWeight: 600 }}>Profile</span>} />
      <Proto />
      {!me ? <Loading /> : (
        <div className="profwrap">
          <div className="shopfor">
            <h2>Shopping for {me.user ? me.user.name : "Guest"}</h2>
            <div className="avs">
              {me.user ? (
                <span className="av"><span className="c me">{me.user.initial}<span>Admin</span></span>{me.user.name}</span>
              ) : (
                <Link href="/login?next=/profile" className="av"><span className="c me">G<span>Log in</span></span>Guest</Link>
              )}
            </div>
          </div>
          <div className="pchips">
            {me.user ? <span className="pchip">{me.user.phone}</span> : <Link href="/login?next=/profile" className="pchip">Log in <Icon.chev /></Link>}
            <button type="button" className="pchip hl" onClick={() => setFitOpen(true)}>Size Details <Icon.chev /></button>
            <Link href="/results" className="pchip">Fit Twin results <Icon.chev /></Link>
          </div>
          <div className="tiles">
            <Link href="/orders" className="tile"><Icon.box /><span>Orders</span><Icon.chev /></Link>
            <Link href="/wishlist" className="tile"><Icon.heart /><span>Wishlist</span><Icon.chev /></Link>
            <Link href="/results" className="tile"><Icon.chart /><span>Test results</span><Icon.chev /></Link>
            <Link href="/bag" className="tile"><Icon.bag /><span>Bag</span><Icon.chev /></Link>
          </div>
          <div className="plist">
            <button type="button" onClick={() => setFitOpen(true)}><Icon.ruler />
              <span className="tx"><b>Fit Twin</b><span className="newtag">NEW</span>
                <small>{me.isExample ? "Example fit in use. Add your size details." : `${p?.heightCm} cm · top ${p?.top} · waist ${p?.waist} · UK ${p?.shoe} · ${p?.build}`}</small></span><Icon.chev /></button>
            <button type="button" onClick={() => show("Myntra-Lite is a student learning project, not affiliated with Myntra. Brands and reviews are demo data; photos are from Unsplash.")}><Icon.info />
              <span className="tx"><b>About Myntra-Lite</b><small>What this prototype is and what data it uses</small></span><Icon.chev /></button>
            {me.user ? <button type="button" onClick={logout}><Icon.logout /><span className="tx"><b>Log out</b><small>{me.user.phone}</small></span><Icon.chev /></button> : null}
          </div>
        </div>
      )}
      <SizeDetailsSheet open={fitOpen} onClose={() => setFitOpen(false)} onSaved={() => show("Size details saved. Fit Twin updated.")} />
      {toast}
      <BottomNav active="profile" />
    </>
  );
}
