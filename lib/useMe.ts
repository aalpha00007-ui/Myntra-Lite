"use client";
// Shared "who am I" state for headers and badges. Any screen can call refreshMe() after a change.
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Me } from "@/lib/types";

export const refreshMe = () => window.dispatchEvent(new Event("ml:refresh"));

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const load = useCallback(() => {
    api<Me>("/api/me").then((r) => {
      if (r.ok) setMe(r.data);
    });
  }, []);
  useEffect(() => {
    load();
    window.addEventListener("ml:refresh", load);
    return () => window.removeEventListener("ml:refresh", load);
  }, [load]);
  return me;
}

// Send the user to the login screen and bring them back here afterwards.
export function goLogin() {
  const next = window.location.pathname + window.location.search;
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
}
