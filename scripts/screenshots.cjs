// Takes real screenshots of the live Myntra-Lite app for the case-study deck.
// Uses the ci-test account (excluded from the results page) and removes what it saved afterwards.
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "https://myntra-lite.vercel.app";
const SAVE = ["classic-white-sneakers", "yellow-floral-midi-dress", "kurta"]; // kurta saved last, so it shows first

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const api = (path, method = "GET", body) =>
    page.evaluate(async ([p, m, b]) => {
      const r = await fetch(p, { method: m, headers: { "content-type": "application/json" }, body: b ? JSON.stringify(b) : undefined });
      return r.json().catch(() => ({}));
    }, [path, method, body]);

  await page.goto(BASE, { waitUntil: "networkidle" });
  await api("/api/auth/login", "POST", { username: "ci-test", password: "demo1234" });
  await api("/api/profile", "PUT", { heightCm: 165, build: "regular", top: "M", waist: "30", shoe: "8", pref: "regular" });
  const before = await api("/api/wishlist");
  const had = new Set((before.products || []).map((p) => p.id));
  for (const id of SAVE) await api("/api/wishlist", "POST", { productId: id });

  const shot = async (name, opts = {}) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `shots/${name}.png`, ...opts });
    console.log("saved", name);
  };

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await shot("home");
  await page.goto(`${BASE}/wishlist`, { waitUntil: "networkidle" });
  await shot("wishlist");
  await page.locator("button.mtb").first().click();
  await page.getByText(/Fit Twin suggests/i).first().waitFor({ timeout: 20000 });
  await shot("sizesheet");
  await page.goto(`${BASE}/product/kurta`, { waitUntil: "networkidle" });
  await shot("product");
  await shot("product-full", { fullPage: true });
  await page.getByText(/buyers with a build like yours/i).first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -260));
  await shot("product-fit");
  await page.goto(`${BASE}/results`, { waitUntil: "networkidle" });
  await shot("results", { fullPage: true });

  for (const id of SAVE) if (!had.has(id)) await api(`/api/wishlist?productId=${id}`, "DELETE");
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
