import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { json, route } from "../../lib/http";
import { requireAuth } from "../../lib/session";
import { publicScenarios } from "../../lib/skills";

export const prerender = false;
export const GET: APIRoute = route(async ({ cookies }) => {
  const { user } = await requireAuth(cookies);
  const base = await db().prepare("SELECT scenario_id, manual_minutes FROM baselines WHERE user_id = ?").bind(user.id).all<{ scenario_id: string; manual_minutes: number }>();
  const mine = Object.fromEntries(base.results.map((r) => [r.scenario_id, r.manual_minutes]));
  return json({ scenarios: publicScenarios(), baselines: mine });
});
