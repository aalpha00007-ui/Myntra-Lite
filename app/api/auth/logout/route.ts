// POST /api/auth/logout - forget this session.
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";
import { ok } from "@/lib/http";

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await db()`DELETE FROM sessions WHERE token = ${token}`;
  const res = ok({ success: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
