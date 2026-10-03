"use client";
// DEMO login: name + mobile number + OTP. No SMS is sent; the OTP is always 1234 and the backend checks it.
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loading, Proto, TopBar } from "@/components/ui";
import { api } from "@/lib/api";

function Login() {
  const next = useSearchParams().get("next") || "/";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setBusy(true); setError(null);
    const r = await api("/api/auth/login", { method: "POST", body: { name, phone, otp } });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Could not log in.");
    window.location.href = next.startsWith("/") ? next : "/";
  }
  return (
    <>
      <TopBar title="Log in" />
      <Proto />
      <form className="login" onSubmit={submit}>
        <h1>Log in or sign up</h1>
        <p className="muted">Demo login: no SMS is sent. Use OTP <b>1234</b>.</p>
        <div className="fields">
          <label htmlFor="l-name">First name<input id="l-name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label htmlFor="l-phone">Mobile number<input id="l-phone" inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
          <label htmlFor="l-otp">OTP<input id="l-otp" inputMode="numeric" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} required /></label>
        </div>
        {error ? <div className="err" style={{ margin: "12px 0" }}>{error}</div> : null}
        <button className="pbtn" type="submit" disabled={busy}>{busy ? "Logging in…" : "Continue"}</button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<Loading />}><Login /></Suspense>;
}
