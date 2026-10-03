// Who is calling? Reads the session cookie and looks the user up in the database.
// Nobody has to log in: the first time a visitor saves something, a guest account is
// created for them automatically. The demo login only exists to switch to a named account.
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "ml_session";
export const DEMO_PASSWORD = "demo1234";

export type User = { id: number; name: string; username: string | null; is_guest: boolean };

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db()`
    SELECT u.id, u.name, u.username, u.is_guest
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
  `;
  return rows.length > 0 ? (rows[0] as User) : null;
}

export async function startSession(userId: number): Promise<string> {
  const token = randomUUID();
  await db()`INSERT INTO sessions (token, user_id) VALUES (${token}, ${userId})`;
  return token;
}

// The current user, or a brand-new guest. newToken is set when a guest was just created.
export async function userOrGuest(): Promise<{ user: User; newToken: string | null }> {
  const user = await currentUser();
  if (user) return { user, newToken: null };
  const [guest] = await db()`INSERT INTO users (name, is_guest) VALUES ('Guest', TRUE) RETURNING id, name, username, is_guest`;
  return { user: guest as User, newToken: await startSession(Number(guest.id)) };
}

export function setSessionCookie(res: NextResponse, token: string | null) {
  if (!token) return res;
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return res;
}
