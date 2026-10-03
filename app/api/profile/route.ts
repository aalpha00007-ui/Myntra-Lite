// GET /api/profile - your Size Details (example values until you save your own)
// PUT /api/profile { heightCm, build, top, waist, shoe, pref } - save them; Fit Twin uses them everywhere
import { currentUser } from "@/lib/auth";
import { profileFor } from "@/lib/catalog";
import { db } from "@/lib/db";
import { parseProfile } from "@/lib/fit";
import { fail, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return ok(await profileFor(user?.id ?? null));
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to save your size details.");
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const p = parseProfile(body);
  if (typeof p === "string") return fail(400, p);
  await db()`
    INSERT INTO size_profiles (user_id, height_cm, build, top_size, waist, shoe, fit_pref, updated_at)
    VALUES (${user.id}, ${p.heightCm}, ${p.build}, ${p.top}, ${p.waist}, ${p.shoe}, ${p.pref}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET height_cm = EXCLUDED.height_cm, build = EXCLUDED.build, top_size = EXCLUDED.top_size,
      waist = EXCLUDED.waist, shoe = EXCLUDED.shoe, fit_pref = EXCLUDED.fit_pref, updated_at = NOW()`;
  return ok(await profileFor(user.id));
}
