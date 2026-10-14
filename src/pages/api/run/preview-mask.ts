import type { APIRoute } from "astro";
import { fail, json, readJson, route } from "../../../lib/http";
import { maskAll, previewSegments, type RunBody } from "../../../lib/run";
import { requireAuth } from "../../../lib/session";
import { getSkill } from "../../../lib/skills";
import { ownRun } from "../../../lib/telemetry";
import type { PreviewResponse } from "../../../content/types";

export const prerender = false;
// Không lưu gì: chỉ trả bản đã che để người dùng xem trước.
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user } = await requireAuth(cookies);
  const b = await readJson<RunBody>(request);
  const run = await ownRun(b.run_id ?? "", user.id);
  const skill = getSkill(run.scenario_id) ?? fail(404, "Tình huống không tồn tại.");
  const r = maskAll(skill, b);
  const body: PreviewResponse = {
    blocks: [
      { title: "Thông tin bạn nhập", ...previewSegments(r.fieldSegments) },
      ...r.files.map((f, i) => ({ title: `Tệp ${i + 1} · ${f.name}`, ...previewSegments(f.segments) }))
    ],
    total: r.summary.total,
    byKind: r.summary.byKind
  };
  return json(body);
});
