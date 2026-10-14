import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { env } from "cloudflare:workers";
import { callAI, resolveKey, type AIKey } from "../src/lib/ai-gateway";
import { encryptSecret } from "../src/lib/crypto";
import { HttpError } from "../src/lib/http";

const E = env as unknown as Record<string, unknown>;
const SECRET = btoa("0123456789abcdef0123456789abcdef");

/** D1 giả: các key AI của tổ chức, mô hình đã chọn, số lượt thử đã dùng. */
function fakeDb(keys: Record<string, unknown>[], choice: Record<string, unknown> | null = null, trialUsed = 0) {
  return {
    prepare(sql: string) {
      const st = {
        bind: () => st,
        first: async () => (sql.includes("FROM ai_model_choice") ? choice : sql.includes("FROM trial_usage") ? { used: trialUsed } : null),
        run: async () => ({ success: true, results: [], meta: {} }),
        all: async () => ({ success: true, results: sql.includes("FROM ai_keys") ? keys : [], meta: {} })
      };
      return st;
    }
  };
}
async function aiKey(provider: string, plain: string) {
  const { ciphertext, iv } = await encryptSecret(SECRET, plain);
  return { provider, key_ciphertext: ciphertext, key_iv: iv };
}
const choice = (over: Record<string, unknown> = {}) =>
  ({ provider: "openrouter", model: "zeta/big-model", allow_fallback: 0, fallback_provider: null, fallback_model: null, ...over });

const ok = (content = '{"ok":true}') => new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }), { status: 200 });
const overloaded = () => new Response(JSON.stringify({ error: { message: "overloaded" } }), { status: 503 });
const sentModels = (f: ReturnType<typeof vi.fn>) => f.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string).model);
const mock = () => ({ ok: true });

beforeEach(() => {
  for (const k of Object.keys(E)) delete E[k];
  Object.assign(E, { KEY_ENC_SECRET: SECRET, APP_ORIGIN: "http://localhost" });
});
afterEach(() => vi.unstubAllGlobals());

describe("resolveKey", () => {
  it("chặn chạy khi đã kết nối AI nhưng chưa chọn mô hình", async () => {
    E.DB = fakeDb([await aiKey("openrouter", "sk-or-1")], null);
    const e = await resolveKey("o1", "u1").catch((x) => x);
    expect(e).toBeInstanceOf(HttpError);
    expect((e as HttpError).code).toBe("no_model");
  });
  it("chặn chạy khi mô hình đã chọn thuộc AI không còn kết nối", async () => {
    E.DB = fakeDb([await aiKey("gemini", "AIza-1")], choice());
    expect(((await resolveKey("o1", "u1").catch((x) => x)) as HttpError).code).toBe("no_model");
  });
  it("dùng đúng key của AI chứa mô hình đã chọn khi khách kết nối nhiều AI", async () => {
    E.DB = fakeDb([await aiKey("openrouter", "sk-or-1"), await aiKey("gemini", "AIza-1")], choice({ provider: "gemini", model: "gemini-2.5-flash" }));
    expect(await resolveKey("o1", "u1")).toMatchObject({ provider: "gemini", key: "AIza-1", model: "gemini-2.5-flash", fallback: null, via_trial: false });
  });
  it("chỉ có dự phòng khi khách cho phép; dự phòng có thể ở AI khác", async () => {
    const keys = [await aiKey("openrouter", "sk-or-1"), await aiKey("gemini", "AIza-1")];
    E.DB = fakeDb(keys, choice({ fallback_provider: "gemini", fallback_model: "gemini-2.5-flash" }));
    expect((await resolveKey("o1", "u1")).fallback).toBeNull();
    E.DB = fakeDb(keys, choice({ allow_fallback: 1, fallback_provider: "gemini", fallback_model: "gemini-2.5-flash" }));
    expect((await resolveKey("o1", "u1")).fallback).toEqual({ provider: "gemini", key: "AIza-1", model: "gemini-2.5-flash" });
  });
  it("lượt dùng thử chạy trên TRIAL_MODEL do nhóm cấu hình", async () => {
    Object.assign(E, { DB: fakeDb([]), TRIAL_API_KEY: "trial-key", TRIAL_PROVIDER: "gemini", TRIAL_MODEL: "gemini-trial" });
    expect(await resolveKey("o1", "u1")).toMatchObject({ provider: "gemini", model: "gemini-trial", via_trial: true });
  });
  it("AI_MOCK vẫn chạy được khi không có key", async () => {
    Object.assign(E, { DB: fakeDb([], null, 5), AI_MOCK: "1" });
    const k = await resolveKey("o1", "u1");
    expect(k).toMatchObject({ provider: "mock", model: "mock" });
    const r = await callAI(k, "sys", "user", mock);
    expect(JSON.parse(r.text)).toEqual({ ok: true });
    expect(r.model).toBe("mock");
  });
});

describe("callAI", () => {
  const key = (over: Partial<AIKey> = {}): AIKey => ({ provider: "openrouter", key: "k", via_trial: false, model: "zeta/big-model", fallback: null, ...over });

  it("gửi đúng mô hình đã lưu", async () => {
    const f = vi.fn(async () => ok());
    vi.stubGlobal("fetch", f);
    const r = await callAI(key(), "s", "u", mock);
    expect(sentModels(f)).toEqual(["zeta/big-model"]);
    expect(r).toMatchObject({ model: "zeta/big-model", tokens_in: 10, tokens_out: 5 });
  });
  it("không tự đổi mô hình khi allow_fallback = 0 và báo lỗi rõ tên mô hình", async () => {
    const f = vi.fn(async () => overloaded());
    vi.stubGlobal("fetch", f);
    const e = (await callAI(key(), "s", "u", mock).catch((x) => x)) as HttpError;
    expect(f).toHaveBeenCalledTimes(1);
    expect(e.message).toContain("Mô hình zeta/big-model đang quá tải. Thử lại sau hoặc đổi mô hình.");
  });
  it("đổi đúng MỘT lần sang mô hình dự phòng khi được phép, và báo mô hình thực chạy", async () => {
    const f = vi.fn().mockResolvedValueOnce(overloaded()).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", f);
    const r = await callAI(key({ fallback: { provider: "openrouter", key: "k", model: "beta/structured" } }), "s", "u", mock);
    expect(sentModels(f)).toEqual(["zeta/big-model", "beta/structured"]);
    expect(r).toMatchObject({ provider: "openrouter", model: "beta/structured" });
  });
  it("dự phòng cũng quá tải thì dừng, không thử thêm", async () => {
    const f = vi.fn(async () => overloaded());
    vi.stubGlobal("fetch", f);
    const e = (await callAI(key({ fallback: { provider: "openrouter", key: "k", model: "beta/structured" } }), "s", "u", mock).catch((x) => x)) as HttpError;
    expect(f).toHaveBeenCalledTimes(2);
    expect(e.message).toContain("beta/structured");
  });
  it("lỗi khác quá tải (401) không đổi mô hình", async () => {
    const f = vi.fn(async () => new Response("{}", { status: 401 }));
    vi.stubGlobal("fetch", f);
    await expect(callAI(key({ fallback: { provider: "openrouter", key: "k", model: "beta/structured" } }), "s", "u", mock)).rejects.toBeInstanceOf(HttpError);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("dự phòng ở AI khác: gọi đúng nhà cung cấp và key của AI đó", async () => {
    const sse = 'data: {"candidates":[{"content":{"parts":[{"text":"{}"}]}}]}\n\n';
    const f = vi.fn().mockResolvedValueOnce(overloaded()).mockResolvedValueOnce(new Response(sse, { status: 200 }));
    vi.stubGlobal("fetch", f);
    const r = await callAI(key({ fallback: { provider: "gemini", key: "AIza-1", model: "gemini-2.5-flash" } }), "s", "u", mock);
    expect(String(f.mock.calls[1][0])).toContain("generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:");
    expect((f.mock.calls[1][1] as RequestInit).headers).toMatchObject({ "x-goog-api-key": "AIza-1" });
    expect(r).toMatchObject({ provider: "gemini", model: "gemini-2.5-flash" });
  });
  it("mô hình không nhận response_format: gửi lại không có tham số đó", async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: "response_format is not supported" } }), { status: 400 }))
      .mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", f);
    await callAI(key(), "s", "u", mock);
    const bodies = f.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string));
    expect(bodies[0].response_format).toBeDefined();
    expect(bodies[1].response_format).toBeUndefined();
  });
  it("Gemini gọi đúng mô hình trong URL", async () => {
    const sse = 'data: {"candidates":[{"content":{"parts":[{"text":"{\\"a\\":1}"}]}}],"usageMetadata":{"promptTokenCount":7,"candidatesTokenCount":3}}\n\n';
    const f = vi.fn(async (_url: string, _init?: RequestInit) => new Response(sse, { status: 200 }));
    vi.stubGlobal("fetch", f);
    const r = await callAI(key({ provider: "gemini", model: "gemini-2.5-flash" }), "s", "u", mock);
    expect(String(f.mock.calls[0][0])).toContain("/models/gemini-2.5-flash:streamGenerateContent");
    expect(r).toMatchObject({ text: '{"a":1}', tokens_in: 7, tokens_out: 3, model: "gemini-2.5-flash" });
  });
});
