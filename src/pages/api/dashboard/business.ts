import type { APIRoute } from "astro";
import { db, now } from "../../../lib/db";
import { json, route } from "../../../lib/http";
import { requireAdmin } from "../../../lib/session";
import { summarize, weekly, type StatRun } from "../../../lib/stats";

export const prerender = false;
export const GET: APIRoute = route(async ({ cookies }) => {
  const { org } = await requireAdmin(cookies);
  const since = now() - 28 * 864e5;
  const [runs, members] = await Promise.all([
    db().prepare("SELECT user_id, scenario_id, opened_at, result_at, exported_at, masked_items FROM runs WHERE org_id = ? AND opened_at > ?").bind(org.org_id, since).all<StatRun>(),
    db().prepare("SELECT u.id, u.name, u.email, m.role, m.status FROM members m JOIN users u ON u.id = m.user_id WHERE m.org_id = ? AND m.status != 'revoked' ORDER BY m.role, u.name")
      .bind(org.org_id).all<{ id: string; name: string | null; email: string; role: string; status: string }>()
  ]);
  const people = members.results.map((m) => {
    const mine = runs.results.filter((r) => r.user_id === m.id);
    return { id: m.id, name: m.name ?? m.email, role: m.role, status: m.status, weeks: weekly(mine).map((w) => w.count), total: mine.filter((r) => r.result_at).length };
  }).sort((a, b) => b.total - a.total);
  const s = summarize(runs.results);
  return json({
    org: { name: org.name, plan: org.plan, seats: org.seats },
    ...s,
    weekly: weekly(runs.results),
    active_people: people.filter((p) => p.total > 0).length,
    seats_used: people.length,
    people
  });
});
