// npm run db:setup  -> creates the tables and demo catalogue if they aren't there yet (safe to re-run)
// npm run db:reset  -> drops everything and starts fresh (deletes all users, wishlists, orders and test results!)

import { readFileSync, appendFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { catalogue } from "./seed-data.mjs";

function fail(err) {
  const msg = String(err?.message ?? err).replace(/postgres(ql)?:\/\/\S+/g, "postgresql://***");
  if (process.env.GITHUB_ACTIONS) console.log(`::error::Database setup failed: ${msg}`);
  console.error(err);
  process.exit(1);
}
process.on("unhandledRejection", fail);
process.on("uncaughtException", fail);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Put it in .env.local (locally) or in your environment.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL.trim());
const reset = process.argv.includes("--reset");

const ALL_TABLES = [
  "notes", "events", "order_items", "orders", "addresses", "bag_items", "wishlist_items",
  "size_profiles", "sessions", "users", "reviews", "products",
];

function statements(file) {
  return readFileSync(new URL(file, import.meta.url), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

function values(rows) {
  const params = [];
  const groups = rows.map((row) => {
    const ph = row.map((v) => {
      params.push(v);
      return `$${params.length}`;
    });
    return `(${ph.join(",")})`;
  });
  return { text: groups.join(","), params };
}

const [{ ready }] = await sql.query("SELECT to_regclass('public.notes') IS NOT NULL AS ready");

let seeded = false;
if (ready && !reset) {
  console.log("Tables already exist - leaving your data alone. (Use npm run db:reset to start over.)");
} else {
  if (reset) console.log("Reset requested: dropping everything...");
  for (const t of ALL_TABLES) await sql.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
  for (const s of statements("./schema.sql")) await sql.query(s);
  console.log("Created tables:", ALL_TABLES.slice().reverse().join(", "));

  const items = catalogue();
  const prod = values(items.map((p) => [p.id, p.gender, p.department, p.sub, p.brand, p.name, p.price, p.sizeSystem, p.photo, p.colour]));
  await sql.query(
    `INSERT INTO products (id, gender, department, sub, brand, name, price, size_system, photo, colour) VALUES ${prod.text}`,
    prod.params
  );

  let reviewCount = 0;
  for (const p of items) {
    const rv = values(p.reviews.map((r) => [p.id, r.h, r.build, r.usual, r.kept, r.fit, r.rating, r.text, r.photo, r.days]));
    await sql.query(
      `INSERT INTO reviews (product_id, height_cm, build, usual_size, kept_size, fit, rating, body, has_photo, created_at)
       SELECT v.pid, v.h::int, v.build, v.usual, v.kept, v.fit, v.rating::int, v.body, v.photo::boolean, NOW() - (v.days::int * INTERVAL '1 day')
       FROM (VALUES ${rv.text}) AS v(pid, h, build, usual, kept, fit, rating, body, photo, days)`,
      rv.params.map(String)
    );
    reviewCount += p.reviews.length;
  }
  console.log(`Seeded: ${items.length} products and ${reviewCount} reviews`);
  seeded = true;
}

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `seeded=${seeded}\n`);

console.table(
  await sql.query(`
    SELECT p.department, COUNT(DISTINCT p.id)::int AS products, COUNT(r.id)::int AS reviews
    FROM products p JOIN reviews r ON r.product_id = p.id
    GROUP BY p.department ORDER BY p.department`)
);
console.log("No suggested_size, average_rating or order_total columns - Fit Twin and totals are computed on request.");
