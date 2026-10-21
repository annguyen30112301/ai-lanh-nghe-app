import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { mockEnabled, trialLeft } from "../../lib/ai-gateway";
import { choiceOut } from "../../lib/choice";
import { json, route } from "../../lib/http";
import { isLicensed } from "../../lib/license";
import { getChoice, getKeys } from "../../lib/models-fetch";
import { requireAuth } from "../../lib/session";
import type { MeResponse } from "../../content/types";

export const prerender = false;
export const GET: APIRoute = route(async ({ cookies }) => {
  const { user, org } = await requireAuth(cookies);
  const [keys, choice] = await Promise.all([getKeys(org.org_id), getChoice(org.org_id)]);
  const body: MeResponse = {
    user, org: { id: org.org_id, name: org.name, plan: org.plan, role: org.role, seats: org.seats },
    license: { active: isLicensed(org.expires_at), expires_at: org.expires_at },
    ai: keys.length ? { keys, choice: choiceOut(choice) } : null,
    trial_left: await trialLeft(user.id),
    trial_model: env.TRIAL_API_KEY ? env.TRIAL_MODEL || null : null, mock: mockEnabled()
  };
  return json(body);
});
