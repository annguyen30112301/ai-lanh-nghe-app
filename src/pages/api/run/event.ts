import type { APIRoute } from "astro";
import { fail, json, readJson, route } from "../../../lib/http";
import { requireAuth } from "../../../lib/session";
import { ownRun, recordEvent } from "../../../lib/telemetry";

export const prerender = false;
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user } = await requireAuth(cookies);
  const b = await readJson<{ run_id?: string; type?: string; value?: number }>(request);
  if (!["edit", "check", "export"].includes(b.type ?? "")) fail(400, "Loại sự kiện không hợp lệ.");
  const run = await ownRun(b.run_id ?? "", user.id);
  await recordEvent(run, b.type as "edit" | "check" | "export", Number(b.value) || 0);
  return json({ ok: true });
});
