import type { APIRoute } from "astro";
import { randomId } from "../../../lib/crypto";
import { db, now } from "../../../lib/db";
import { fail, json, readJson, route } from "../../../lib/http";
import { requireAuth } from "../../../lib/session";
import { getSkill } from "../../../lib/skills";

export const prerender = false;
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user, org } = await requireAuth(cookies);
  const { scenario_id } = await readJson<{ scenario_id?: string }>(request);
  const skill = getSkill(scenario_id ?? "") ?? fail(404, "Tình huống không tồn tại.");
  const id = "r_" + randomId(12);
  await db().prepare("INSERT INTO runs (id, user_id, org_id, scenario_id, opened_at, checklist_total, status) VALUES (?, ?, ?, ?, ?, ?, 'opened')")
    .bind(id, user.id, org.org_id, skill.id, now(), skill.checklist.length).run();
  return json({ run_id: id });
});
