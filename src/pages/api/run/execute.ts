import type { APIRoute } from "astro";
import { callAI, resolveKey, trialLeft, useTrial } from "../../../lib/ai-gateway";
import { db, now } from "../../../lib/db";
import { fail, json, readJson, route } from "../../../lib/http";
import { unmaskDeep } from "../../../lib/mask";
import { mockResult } from "../../../lib/mock";
import { filesText, maskAll, type RunBody } from "../../../lib/run";
import { requireAuth } from "../../../lib/session";
import { buildPrompt, getSkill, parseJson, validateResult, type RunResult } from "../../../lib/skills";
import { ownRun } from "../../../lib/telemetry";
import type { ExecuteResponse } from "../../../content/types";

export const prerender = false;

export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user, org } = await requireAuth(cookies);
  const b = await readJson<RunBody>(request);
  const run = await ownRun(b.run_id ?? "", user.id);
  const skill = getSkill(run.scenario_id) ?? fail(404, "Tình huống không tồn tại.");
  const m = maskAll(skill, b);
  const key = await resolveKey(org.org_id, user.id);
  const submitted = now();
  await db().prepare("UPDATE runs SET submitted_at = ?, status = 'submitted', masked_items = ? WHERE id = ?").bind(submitted, m.summary.total, run.id).run();

  const prompt = buildPrompt(skill, m.fields, filesText(m.files));
  const mock = () => mockResult(skill, m.fields, m.files);
  let tin = 0, tout = 0, parsed: unknown = null, err: string | null = "chưa chạy", model = key.model, provider: string = key.provider;
  for (let attempt = 0; attempt < 2 && err; attempt++) {
    const user2 = attempt === 0 ? prompt.user : `${prompt.user}\n\nLần trả lời trước chưa đúng cấu trúc (${err}). Hãy trả lại DUY NHẤT một JSON đúng cấu trúc đã nêu.`;
    const reply = await callAI(key, prompt.system, user2, mock);
    tin += reply.tokens_in; tout += reply.tokens_out; model = reply.model; provider = reply.provider;
    parsed = parseJson(reply.text);
    err = validateResult(skill, parsed, skill.output.kind === "table" ? m.files.length : 0);
  }
  if (err) {
    await db().prepare("UPDATE runs SET status = 'error', tokens_in = ?, tokens_out = ?, provider = ?, model = ? WHERE id = ?").bind(tin, tout, provider, model, run.id).run();
    fail(502, "AI trả kết quả chưa đúng mẫu sau 2 lần thử. Bạn bấm “Chạy lại” hoặc rút gọn tài liệu.", "bad_output");
  }
  if (key.via_trial) await useTrial(user.id);
  const resultAt = now();
  await db().prepare("UPDATE runs SET result_at = ?, tokens_in = ?, tokens_out = ?, via_trial = ?, provider = ?, model = ?, status = 'result' WHERE id = ?")
    .bind(resultAt, tin, tout, key.via_trial ? 1 : 0, provider, model, run.id).run();

  const masked = parsed as RunResult;
  const body: ExecuteResponse = {
    result: unmaskDeep(masked, m.map), result_masked: masked, kind: skill.output.kind,
    masked_items: m.summary.total, via_trial: key.via_trial,
    trial_left: key.via_trial ? await trialLeft(user.id) : null,
    provider, model, seconds: Math.round((resultAt - submitted) / 1000)
  };
  return json(body);
});
