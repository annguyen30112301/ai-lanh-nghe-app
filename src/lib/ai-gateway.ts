// AI Gateway: gọi AI của chính người dùng/doanh nghiệp. Không log prompt, không log key.
import { env } from "cloudflare:workers";
import { decryptSecret } from "./crypto";
import { db } from "./db";
import { fail } from "./http";

export type Provider = "openrouter" | "gemini" | "openai" | "mock";
export interface AIKey { provider: Provider; key: string; via_trial: boolean }
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

/** Chọn nguồn AI: kết nối của tổ chức → lượt dùng thử → (local) mô phỏng. */
export async function resolveKey(orgId: string, userId: string): Promise<AIKey> {
  const c = await db().prepare("SELECT provider, key_ciphertext, key_iv FROM ai_connections WHERE org_id = ?").bind(orgId)
    .first<{ provider: Provider; key_ciphertext: string; key_iv: string }>();
  if (c) return { provider: c.provider, key: await decryptSecret(env.KEY_ENC_SECRET, c.key_ciphertext, c.key_iv), via_trial: false };
  if ((await trialLeft(userId)) > 0) {
    if (env.TRIAL_API_KEY) return { provider: (env.TRIAL_PROVIDER as Provider) || "openrouter", key: env.TRIAL_API_KEY, via_trial: true };
    if (mockEnabled()) return { provider: "mock", key: "", via_trial: true };
  }
  if (mockEnabled()) return { provider: "mock", key: "", via_trial: false };
  return fail(402, "Bạn đã dùng hết 5 lượt thử. Kết nối AI của bạn để làm tiếp – chỉ mất 1 phút.", "no_ai");
}

const ERR: Record<number, string> = {
  400: "AI từ chối yêu cầu. Bạn thử rút gọn tài liệu rồi chạy lại.",
  401: "Key AI không còn hợp lệ. Vào mục Kết nối AI để gắn lại.",
  402: "Tài khoản AI đã hết tín dụng. Nạp thêm ở nhà cung cấp AI rồi chạy lại.",
  403: "Key AI không có quyền dùng mô hình này. Vào mục Kết nối AI để kiểm tra.",
  429: "AI đang quá tải hoặc đã chạm hạn mức. Bạn chờ khoảng 1 phút rồi chạy lại.",
  503: "Máy chủ AI đang quá tải (thường chỉ vài phút). Bạn bấm “Chạy lại” sau ít phút."
};
/** Ghi mã lỗi + thông báo lỗi của nhà cung cấp (không có key, không có nội dung) rồi báo người dùng. */
async function upstreamFail(provider: string, res: Response, mapped = res.status): Promise<never> {
  const body = (await res.text().catch(() => "")).slice(0, 400);
  const msg = body.match(/"message"\s*:\s*"([^"]{0,260})/)?.[1] ?? "";
  console.error("ai_upstream", provider, res.status, msg);
  return fail(502, (ERR[mapped] ?? "AI không phản hồi. Bạn chạy lại sau ít phút.") + ` (mã ${res.status}${msg ? ": " + msg.slice(0, 220) : ""})`, "ai_upstream");
}

async function chatCompletions(url: string, key: string, model: string, system: string, user: string): Promise<AIReply> {
  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "HTTP-Referer": env.APP_ORIGIN, "X-Title": "AI Lanh Nghe" },
    body: JSON.stringify({ model, temperature: 0.2, max_tokens: 4000, response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    signal: AbortSignal.timeout(150_000)
  });
  if (!res.ok) await upstreamFail(url.includes("openrouter") ? "openrouter" : "openai", res);
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
  return { text: j.choices?.[0]?.message?.content ?? "", tokens_in: j.usage?.prompt_tokens ?? 0, tokens_out: j.usage?.completion_tokens ?? 0 };
}

// Khi mô hình chính quá tải (503/429) hoặc không còn cấp (404), thử lần lượt mô hình dự phòng.
const GEMINI_FALLBACKS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"];

async function gemini(key: string, system: string, user: string): Promise<AIReply> {
  const models = [...new Set([env.GEMINI_MODEL || "gemini-3.8-flash", ...GEMINI_FALLBACKS])];
  let res: Response | null = null;
  for (const [i, model] of models.entries()) {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 16384, responseMimeType: "application/json", thinkingConfig: { thinkingLevel: "low" } }
      }),
      signal: AbortSignal.timeout(150_000)
    });
    if (res.ok || ![404, 429, 500, 503].includes(res.status)) break;
    console.error("ai_fallback", model, res.status);
    if (i < models.length - 1) await new Promise((r) => setTimeout(r, 800));
  }
  res = res!;
  if (!res.ok) await upstreamFail("gemini", res);
  const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[]; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } };
  return {
    text: j.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("") ?? "",
    tokens_in: j.usageMetadata?.promptTokenCount ?? 0, tokens_out: j.usageMetadata?.candidatesTokenCount ?? 0
  };
}

export async function callAI(k: AIKey, system: string, user: string, mock: () => unknown): Promise<AIReply> {
  try { return await callProvider(k, system, user, mock); }
  catch (e) {
    if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
      console.error("ai_timeout", k.provider);
      return fail(504, "AI trả lời quá lâu (hơn 2 phút). Bạn bấm “Chạy lại” hoặc bỏ bớt file.", "ai_timeout");
    }
    throw e;
  }
}

async function callProvider(k: AIKey, system: string, user: string, mock: () => unknown): Promise<AIReply> {
  switch (k.provider) {
    case "openrouter": return chatCompletions("https://openrouter.ai/api/v1/chat/completions", k.key, env.OPENROUTER_MODEL || "anthropic/claude-sonnet-5.5", system, user);
    case "openai": return chatCompletions("https://api.openai.com/v1/chat/completions", k.key, env.OPENAI_MODEL || "gpt-4.1-mini", system, user);
    case "gemini": return gemini(k.key, system, user);
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
