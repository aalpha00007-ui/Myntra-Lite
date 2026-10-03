// POST /api/auth/login  { username, password }
// DEMO login for evaluators: any username works and the password is always demo1234 (checked here).
// Anything a guest already saved (wishlist, bag, size details, orders) moves into the account.
import { cookies } from "next/headers";
import { currentUser, DEMO_PASSWORD, SESSION_COOKIE, setSessionCookie, startSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^[a-z0-9._-]{3,20}$/.test(username)) return fail(400, "Username must be 3-20 letters, numbers, dots, dashes or underscores.");
  if (password !== DEMO_PASSWORD) return fail(400, `Wrong password. (Demo password is ${DEMO_PASSWORD}.)`);

  const sql = db();
  const [user] = await sql`
    INSERT INTO users (name, username, is_guest) VALUES (${username}, ${username}, FALSE)
    ON CONFLICT (username) DO UPDATE SET name = users.name
    RETURNING id, name, username`;
  const uid = Number(user.id);

  const before = await currentUser();
  if (before && before.is_guest && before.id !== uid) {
    const g = before.id;
    await sql`INSERT INTO wishlist_items (user_id, product_id, added_at) SELECT ${uid}, product_id, added_at FROM wishlist_items WHERE user_id = ${g} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO bag_items (user_id, product_id, size, qty, added_at) SELECT ${uid}, product_id, size, qty, added_at FROM bag_items WHERE user_id = ${g} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO size_profiles (user_id, height_cm, build, top_size, waist, shoe, fit_pref, updated_at)
              SELECT ${uid}, height_cm, build, top_size, waist, shoe, fit_pref, updated_at FROM size_profiles WHERE user_id = ${g} ON CONFLICT DO NOTHING`;
    for (const t of ["addresses", "orders", "events", "notes"]) await sql.query(`UPDATE ${t} SET user_id = $1 WHERE user_id = $2`, [uid, g]);
    await sql`DELETE FROM users WHERE id = ${g}`;
  }

  const old = (await cookies()).get(SESSION_COOKIE)?.value;
  if (old) await sql`DELETE FROM sessions WHERE token = ${old}`;
  return setSessionCookie(ok({ user: { name: user.name, username: user.username } }), await startSession(uid));
}
