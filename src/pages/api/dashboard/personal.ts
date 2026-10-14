import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { json, route } from "../../../lib/http";
import { requireAuth } from "../../../lib/session";
import { usageByModel } from "../../../lib/models-fetch";
import { minutesOf, scenarioNames, summarize, weekly, type StatRun } from "../../../lib/stats";

export const prerender = false;
export const GET: APIRoute = route(async ({ cookies }) => {
  const { user, org } = await requireAuth(cookies);
  const [runs, base, models] = await Promise.all([
    db().prepare("SELECT user_id, scenario_id, opened_at, result_at, exported_at, masked_items FROM runs WHERE user_id = ? ORDER BY opened_at DESC LIMIT 500").bind(user.id).all<StatRun>(),
    db().prepare("SELECT scenario_id, manual_minutes FROM baselines WHERE user_id = ?").bind(user.id).all<{ scenario_id: string; manual_minutes: number }>(),
    usageByModel(org.org_id, "user_id = ?", user.id)
  ]);
  const baselines = Object.fromEntries(base.results.map((b) => [b.scenario_id, b.manual_minutes]));
  const names = scenarioNames();
  return json({
    ...summarize(runs.results, baselines),
    weekly: weekly(runs.results),
    baselines,
    models,
    recent: runs.results.filter((r) => r.result_at).slice(0, 8).map((r) => ({
      scenario: names[r.scenario_id] ?? r.scenario_id, at: r.opened_at, minutes: minutesOf(r), exported: !!r.exported_at
    }))
  });
});
