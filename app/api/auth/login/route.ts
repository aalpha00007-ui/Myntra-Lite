// POST /api/auth/login  { name, phone, otp }
// DEMO sign-in: no SMS is ever sent. The OTP is always 1234 and the backend checks it.
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";

const DEMO_OTP = "1234";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const otp = typeof body.otp === "string" ? body.otp.trim() : "";

  if (name === "" || name.length > 40) return fail(400, "Please enter your name (up to 40 characters).");
  if (!/^[6-9]\d{9}$/.test(phone)) return fail(400, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.");
  if (otp !== DEMO_OTP) return fail(400, "Incorrect OTP. (Demo OTP is 1234.)");

  const sql = db();
  const [user] = await sql`
    INSERT INTO users (name, phone) VALUES (${name}, ${phone})
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name, phone
  `;
  const token = randomUUID();
  await sql`INSERT INTO sessions (token, user_id) VALUES (${token}, ${user.id})`;

  const res = ok({ user });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
