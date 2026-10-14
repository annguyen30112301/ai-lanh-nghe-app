import type { APIRoute } from "astro";
import { mockEnabled, trialLeft } from "../../lib/ai-gateway";
import { db } from "../../lib/db";
import { json, route } from "../../lib/http";
import { requireAuth } from "../../lib/session";
import type { MeResponse } from "../../content/types";

export const prerender = false;
export const GET: APIRoute = route(async ({ cookies }) => {
  const { user, org } = await requireAuth(cookies);
  const ai = await db().prepare("SELECT source, provider, key_last4, verified_at FROM ai_connections WHERE org_id = ?").bind(org.org_id)
    .first<NonNullable<MeResponse["ai"]>>();
  const body: MeResponse = {
    user, org: { id: org.org_id, name: org.name, plan: org.plan, role: org.role, seats: org.seats },
    ai: ai ?? null, trial_left: await trialLeft(user.id), mock: mockEnabled()
  };
  return json(body);
});
