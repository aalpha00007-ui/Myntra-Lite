// One helper for every screen: call an API, get back { ok, status, data }.
export async function api<T>(url: string, init?: { method?: string; body?: unknown }) {
  try {
    const res = await fetch(url, {
      method: init?.method ?? "GET",
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: data as T & { error?: string; code?: string } };
  } catch {
    return { ok: false, status: 0, data: { error: "Could not reach the server. Check your connection." } as T & { error?: string; code?: string } };
  }
}
