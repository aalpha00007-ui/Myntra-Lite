"use client";
// DEMO login for evaluators. Nobody needs it to shop - guests can wishlist, use the bag and order.
// Any username works; the password is always demo1234 (the backend checks it).
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loading, Proto, TopBar } from "@/components/ui";
import { api } from "@/lib/api";

const DEMO_USER = "demo";
const DEMO_PASSWORD = "demo1234";

function Login() {
  const next = useSearchParams().get("next") || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function logIn(u: string, p: string) {
    setBusy(true); setError(null);
    const r = await api("/api/auth/login", { method: "POST", body: { username: u, password: p } });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not log in.");
    window.location.href = next.startsWith("/") ? next : "/";
  }
  return (
    <>
      <TopBar title="Log in" />
      <Proto />
      <form className="login" onSubmit={(e) => { e.preventDefault(); logIn(username, password); }}>
        <h1>Log in (demo)</h1>
        <p className="muted">You don&apos;t need an account to shop. Log in only to keep your wishlist under a name. Anything you saved as a guest comes with you.</p>
        <div className="twin" style={{ margin: "14px 0" }}>
          <div className="lbl">Demo credentials</div>
          <div style={{ marginTop: 4 }}>Username: <b className="mono">{DEMO_USER}</b> (or any name you like) · Password: <b className="mono">{DEMO_PASSWORD}</b></div>
          <button type="button" className="obtn" style={{ marginTop: 10 }} disabled={busy} onClick={() => logIn(DEMO_USER, DEMO_PASSWORD)}>Use demo account</button>
        </div>
        <div className="fields">
          <label htmlFor="l-user">Username<input id="l-user" autoComplete="username" maxLength={20} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. tester1" required /></label>
          <label htmlFor="l-pass">Password<input id="l-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo1234" required /></label>
        </div>
        {error ? <div className="err" style={{ margin: "12px 0" }}>{error}</div> : null}
        <button className="pbtn" type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<Loading />}><Login /></Suspense>;
}
