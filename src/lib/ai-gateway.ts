// AI Gateway: gọi AI của chính người dùng/doanh nghiệp. Không log prompt, không log key.
import { env } from "cloudflare:workers";
import { decryptSecret } from "./crypto";
import { db } from "./db";
import { fail } from "./http";

export type Provider = "openrouter" | "gemini" | "openai" | "mock";
/** Một mô hình cụ thể trên một AI của khách (provider + key). */
export interface AITarget { provider: Provider; key: string; model: string }
/** model: mô hình khách đã chọn (hoặc TRIAL_MODEL cho lượt thử); fallback: chỉ có khi khách cho phép đổi, có thể thuộc AI khác của khách. */
export interface AIKey extends AITarget { via_trial: boolean; fallback: AITarget | null }
export interface AIReply { text: string; tokens_in: number; tokens_out: number }

export const TRIAL_LIMIT = 5;
export const mockEnabled = () => env.AI_MOCK === "1";

export async function trialLeft(userId: string) {
  const r = await db().prepare("SELECT used FROM trial_usage WHERE user_id = ?").bind(userId).first<{ used: number }>();
  return Math.max(0, TRIAL_LIMIT - (r?.used ?? 0));
}
export async function useTrial(userId: string) {
  await db().prepare("INSERT INTO trial_usage (user_id, used) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET used = used + 1").bind(userId).run();
}

/** Chọn nguồn AI: AI khách đã kết nối (bắt buộc đã chọn mô hình) → lượt dùng thử → (local) mô phỏng. */
/**
 * Chưa có license (hoặc đã hết hạn): chỉ chạy bằng lượt thử của hệ thống, kể cả khi tổ chức đã kết nối AI riêng.
 * Có license: dùng AI của khách như trước.
 */
export async function resolveKey(orgId: string, userId: string, licensed = true): Promise<AIKey> {
  if (!licensed) {
    const k = await trialKey(userId);
    return k ?? fail(402, `Bạn đã dùng hết ${TRIAL_LIMIT} lượt thử. Mua gói Mua hàng để dùng tiếp với AI của bạn.`, "no_license");
  }
  const keys = (await db().prepare("SELECT provider, key_ciphertext, key_iv FROM ai_keys WHERE org_id = ?").bind(orgId)
    .all<{ provider: Provider; key_ciphertext: string; key_iv: string }>()).results;
  if (keys.length) {
    const c = await db().prepare("SELECT provider, model, allow_fallback, fallback_provider, fallback_model FROM ai_model_choice WHERE org_id = ?").bind(orgId)
      .first<{ provider: Provider; model: string; allow_fallback: number; fallback_provider: Provider | null; fallback_model: string | null }>();
    const main = c && keys.find((k) => k.provider === c.provider);
    if (!c || !main) return fail(409, "Chưa chọn mô hình AI. Vào mục Kết nối AI để chọn mô hình rồi chạy lại.", "no_model");
    const target = async (provider: Provider, model: string): Promise<AITarget | null> => {
      const k = keys.find((x) => x.provider === provider);
      return k ? { provider, model, key: await decryptSecret(env.KEY_ENC_SECRET, k.key_ciphertext, k.key_iv) } : null;
    };
    const fb = c.allow_fallback && c.fallback_provider && c.fallback_model && !(c.fallback_provider === c.provider && c.fallback_model === c.model)
      ? await target(c.fallback_provider, c.fallback_model) : null;
    return { ...(await target(c.provider, c.model))!, via_trial: false, fallback: fb };
  }
  const trial = await trialKey(userId);
  if (trial) return trial;
  if (mockEnabled()) return { provider: "mock", key: "", via_trial: false, model: "mock", fallback: null };
  return fail(402, "Bạn đã dùng hết 5 lượt thử. Kết nối AI của bạn để làm tiếp – chỉ mất 1 phút.", "no_ai");
}

/** Key cho lượt thử của hệ thống; null khi đã hết lượt hoặc chưa cấu hình. */
async function trialKey(userId: string): Promise<AIKey | null> {
  if ((await trialLeft(userId)) <= 0) return null;
  if (env.TRIAL_API_KEY) {
    const model = env.TRIAL_MODEL || fail(500, "Thiếu cấu hình TRIAL_MODEL cho lượt dùng thử.");
    const provider = (env.TRIAL_PROVIDER as Provider) || "openrouter";
    const fallback = env.TRIAL_FALLBACK_MODEL ? { provider, key: env.TRIAL_API_KEY, model: env.TRIAL_FALLBACK_MODEL } : null;
    return { provider, key: env.TRIAL_API_KEY, via_trial: true, model, fallback };
  }
  if (mockEnabled()) return { provider: "mock", key: "", via_trial: true, model: "mock", fallback: null };
  return null;
}

const ERR: Record<number, string> = {
  400: "AI từ chối yêu cầu. Bạn thử rút gọn tài liệu rồi chạy lại.",
  401: "Key AI không còn hợp lệ. Vào mục Kết nối AI để gắn lại.",
  402: "Tài khoản AI đã hết tín dụng. Nạp thêm ở nhà cung cấp AI rồi chạy lại.",
  403: "Key AI không có quyền dùng mô hình này. Vào mục Kết nối AI để kiểm tra.",
  404: "Nhà cung cấp không còn mô hình này. Vào mục Kết nối AI để chọn mô hình khác.",
  429: "AI đang quá tải hoặc đã chạm hạn mức. Bạn chờ khoảng 1 phút rồi chạy lại.",
  503: "Máy chủ AI đang quá tải (thường chỉ vài phút). Bạn bấm “Chạy lại” sau ít phút."
};
/** Lỗi quá tải: chỉ đổi mô hình khi khách đã cho phép. */
const OVERLOAD = [429, 503];

class UpstreamError extends Error {
  constructor(public status: number, public detail: string, public model: string) { super(detail); }
}
/** Ghi mã lỗi + thông báo lỗi của nhà cung cấp (không có key, không có nội dung). */
async function upstreamError(provider: string, model: string, res: Response): Promise<never> {
  const body = (await res.text().catch(() => "")).slice(0, 400);
  const msg = body.match(/"message"\s*:\s*"([^"]{0,260})/)?.[1] ?? "";
  console.error("ai_upstream", provider, model, res.status, msg);
  throw new UpstreamError(res.status, msg, model);
}
function upstreamFail(k: AIKey, e: UpstreamError): never {
  const base = OVERLOAD.includes(e.status) && !k.via_trial
    ? `Mô hình ${e.model} đang quá tải. Thử lại sau hoặc đổi mô hình.`
    : ERR[e.status] ?? "AI không phản hồi. Bạn chạy lại sau ít phút.";
  return fail(502, base + ` (mã ${e.status}${e.detail ? ": " + e.detail.slice(0, 220) : ""})`, "ai_upstream");
}
/** Đọc thân lỗi 400 (không tiêu thụ res) để quyết định gửi lại với ít tham số hơn. */
const badParam = async (res: Response, re: RegExp) => res.status === 400 && re.test(await res.clone().text().catch(() => ""));

async function chatCompletions(provider: string, url: string, key: string, model: string, system: string, user: string): Promise<AIReply> {
  const send = (jsonMode: boolean) => fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "HTTP-Referer": env.APP_ORIGIN, "X-Title": "AI Lanh Nghe" },
    body: JSON.stringify({ model, temperature: 0.2, max_tokens: 4000, ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    signal: AbortSignal.timeout(150_000)
  });
  let res = await send(true);
  // Mô hình không nhận response_format: gửi lại không có tham số đó; prompt đã yêu cầu JSON và kết quả vẫn được bóc + kiểm tra schema.
  if (await badParam(res, /response_format|json_object|json mode/i)) res = await send(false);
  if (!res.ok) await upstreamError(provider, model, res);
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
  return { text: j.choices?.[0]?.message?.content ?? "", tokens_in: j.usage?.prompt_tokens ?? 0, tokens_out: j.usage?.completion_tokens ?? 0 };
}

async function gemini(key: string, model: string, system: string, user: string): Promise<AIReply> {
  const send = (thinking: boolean) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 16384, responseMimeType: "application/json", ...(thinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}) }
    }),
    signal: AbortSignal.timeout(150_000)
  });
  let res = await send(true);
  // Mô hình không có chế độ suy nghĩ (hoặc dùng tham số khác): gửi lại không kèm thinkingConfig.
  if (await badParam(res, /thinking/i)) res = await send(false);
  if (!res.ok) await upstreamError("gemini", model, res);
  // Đọc SSE: ghép phần chữ (bỏ phần "thought"), lấy usage ở gói cuối.
  type Chunk = { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "", text = "", tin = 0, tout = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buf += value;
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      try {
        const c = JSON.parse(line.slice(5)) as Chunk;
        for (const p of c.candidates?.[0]?.content?.parts ?? []) if (!p.thought && p.text) text += p.text;
        if (c.usageMetadata) { tin = c.usageMetadata.promptTokenCount ?? tin; tout = c.usageMetadata.candidatesTokenCount ?? tout; }
      } catch { /* gói lỗi, bỏ qua */ }
    }
    if (done) break;
  }
  return { text, tokens_in: tin, tokens_out: tout };
}

/** Gọi đúng mô hình đã chọn. Quá tải (429/503) thì chỉ thử lại MỘT lần bằng mô hình dự phòng khách đã chọn. */
export async function callAI(k: AIKey, system: string, user: string, mock: () => unknown): Promise<AIReply & { provider: Provider; model: string }> {
  try {
    try { return { ...(await callModel(k, system, user, mock)), provider: k.provider, model: k.model }; }
    catch (e) {
      if (!(e instanceof UpstreamError) || !OVERLOAD.includes(e.status) || !k.fallback) throw e;
      console.error("ai_fallback", k.provider, k.model, "->", k.fallback.provider, k.fallback.model, e.status);
      return { ...(await callModel(k.fallback, system, user, mock)), provider: k.fallback.provider, model: k.fallback.model };
    }
  } catch (e) {
    if (e instanceof UpstreamError) return upstreamFail(k, e);
    if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
      console.error("ai_timeout", k.provider);
      return fail(504, "AI trả lời quá lâu (hơn 2 phút). Bạn bấm “Chạy lại” hoặc bỏ bớt file.", "ai_timeout");
    }
    throw e;
  }
}

async function callModel(t: AITarget, system: string, user: string, mock: () => unknown): Promise<AIReply> {
  switch (t.provider) {
    case "openrouter": return chatCompletions("openrouter", "https://openrouter.ai/api/v1/chat/completions", t.key, t.model, system, user);
    case "openai": return chatCompletions("openai", "https://api.openai.com/v1/chat/completions", t.key, t.model, system, user);
    case "gemini": return gemini(t.key, t.model, system, user);
    case "mock": {
      await new Promise((r) => setTimeout(r, 1400));
      return { text: JSON.stringify(mock()), tokens_in: Math.round((system.length + user.length) / 3.2), tokens_out: 900 };
    }
  }
}

/** Gọi thử rất nhỏ (không tốn token) để xác nhận key. */
export async function verifyKey(provider: Provider, key: string) {
  const r =
    provider === "openrouter" ? await fetch("https://openrouter.ai/api/v1/key", { headers: { authorization: `Bearer ${key}` } })
    : provider === "gemini" ? await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", { headers: { "x-goog-api-key": key } })
    : await fetch("https://api.openai.com/v1/models", { headers: { authorization: `Bearer ${key}` } });
  if (!r.ok) fail(400, r.status === 429 ? ERR[429] : "Key không đúng hoặc đã bị thu hồi. Bạn kiểm tra lại rồi dán lần nữa.", "bad_key");
}
