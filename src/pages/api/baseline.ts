import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { fail, json, readJson, route } from "../../lib/http";
import { requireAuth } from "../../lib/session";
import { getSkill } from "../../lib/skills";

export const prerender = false;
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user } = await requireAuth(cookies);
  const b = await readJson<{ scenario_id?: string; manual_minutes?: number }>(request);
  if (!getSkill(b.scenario_id ?? "")) fail(400, "Tình huống không tồn tại.");
  const m = Math.round(Number(b.manual_minutes));
  if (!(m >= 1 && m <= 600)) fail(400, "Số phút phải từ 1 đến 600.");
  await db().prepare("INSERT INTO baselines (user_id, scenario_id, manual_minutes) VALUES (?, ?, ?) ON CONFLICT(user_id, scenario_id) DO UPDATE SET manual_minutes = excluded.manual_minutes")
    .bind(user.id, b.scenario_id, m).run();
  return json({ ok: true });
});
