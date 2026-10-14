import type { APIRoute } from "astro";
import { json, route } from "../../../lib/http";
import { destroySession } from "../../../lib/session";

export const prerender = false;
export const POST: APIRoute = route(async ({ cookies }) => {
  await destroySession(cookies);
  return json({ ok: true });
});
