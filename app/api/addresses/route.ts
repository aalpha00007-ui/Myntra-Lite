// GET  /api/addresses                              - your saved addresses
// POST /api/addresses { name, line, city, pin, kind } - add one (demo app: use a made-up address)
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in first.");
  const rows = await db()`SELECT id, name, line, city, pin, kind FROM addresses WHERE user_id = ${user.id} ORDER BY id`;
  return ok({ addresses: rows });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in first.");
  const b = await readJson(request);
  if (!b) return fail(400, "Request body must be valid JSON.");
  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = s(b.name), line = s(b.line), city = s(b.city), pin = s(b.pin), kind = s(b.kind) || "Home";
  if (!name || name.length > 40) return fail(400, "Enter a name (up to 40 characters).");
  if (line.length < 5 || line.length > 120) return fail(400, "Enter the address line (5 to 120 characters).");
  if (!city || city.length > 40) return fail(400, "Enter a city.");
  if (!/^[1-9]\d{5}$/.test(pin)) return fail(400, "Pincode must be 6 digits.");
  if (!["Home", "Work"].includes(kind)) return fail(400, "Address type must be Home or Work.");
  const [address] = await db()`
    INSERT INTO addresses (user_id, name, line, city, pin, kind) VALUES (${user.id}, ${name}, ${line}, ${city}, ${pin}, ${kind})
    RETURNING id, name, line, city, pin, kind`;
  return ok({ address }, 201);
}
