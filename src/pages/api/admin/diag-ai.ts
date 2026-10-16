import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { fail, json, route } from "../../../lib/http";
import { requireAuth } from "../../../lib/session";

export const prerender = false;

/**
 * Chẩn đoán đường gọi AI của lượt dùng thử (chỉ tài khoản demo quản trị).
 * Trả về nơi Worker đang chạy và mã trạng thái + thời gian của vài lệnh gọi rất nhỏ. Không trả key, không trả nội dung.
 */
export const GET: APIRoute = route(async ({ cookies }) => {
  const a = await requireAuth(cookies);
  if (!a.user.email.endsWith("@" + env.DEMO_EMAIL_DOMAIN) || a.org.role !== "admin") fail(403, "Không có quyền.");
  const key = env.TRIAL_API_KEY ?? "";
  const model = env.TRIAL_MODEL || "gemini-3.8-flash";
  const out: Record<string, unknown> = { provider: env.TRIAL_PROVIDER, model, has_key: !!key };
  const timed = async (name: string, f: () => Promise<Response>, read = true) => {
    const t = Date.now();
    try {
      const r = await f();
      const body = read ? (await r.text()).slice(0, 300) : "";
      out[name] = { status: r.status, ms: Date.now() - t, body: r.ok ? body.slice(0, 120) : body };
    } catch (e) { out[name] = { error: String(e).slice(0, 200), ms: Date.now() - t }; }
  };
  await timed("egress", () => fetch("https://www.cloudflare.com/cdn-cgi/trace"));
  if (env.TRIAL_PROVIDER === "gemini") {
    const base = "https://generativelanguage.googleapis.com/v1beta";
    const h = { "x-goog-api-key": key, "content-type": "application/json" };
    const body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Trả lời đúng một chữ: ok" }] }], generationConfig: { maxOutputTokens: 20 } });
    await timed("list", () => fetch(`${base}/models?pageSize=1`, { headers: h, signal: AbortSignal.timeout(20_000) }));
    await timed("generate", () => fetch(`${base}/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: h, body, signal: AbortSignal.timeout(40_000) }));
    await timed("stream", () => fetch(`${base}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, { method: "POST", headers: h, body, signal: AbortSignal.timeout(40_000) }));
  }
  return json(out);
});
