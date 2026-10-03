// Who is calling? Reads the session cookie and looks the user up in the database.
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "ml_session";

export type User = { id: number; name: string; phone: string };

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db()`
    SELECT u.id, u.name, u.phone
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
  `;
  return rows.length > 0 ? (rows[0] as User) : null;
}
