import { describe, expect, it } from "vitest";
import { formatVnd, LOCK, mergeModels, modelUsage, normalizeGemini, normalizeOpenAI, normalizeOpenRouter, pricePerRun } from "../src/lib/models";

const openrouter = {
  data: [
    { id: "zeta/big-model", name: "Zeta: Big", context_length: 200_000, pricing: { prompt: "0.000003", completion: "0.000015" }, supported_parameters: ["temperature", "response_format"] },
    { id: "acme/tiny", name: "Acme: Tiny", context_length: 8_192, pricing: { prompt: "0", completion: "0" }, supported_parameters: ["response_format"] },
    { id: "alpha/plain", name: "Alpha: Plain", context_length: 64_000, pricing: { prompt: "0.0000001", completion: "0.0000004" }, supported_parameters: ["temperature"] },
    { id: "beta/structured", name: "Beta: Structured", context_length: 128_000, pricing: { prompt: "-1", completion: "-1" }, supported_parameters: ["structured_outputs"] }
  ]
};

describe("normalizeOpenRouter", () => {
  const list = normalizeOpenRouter(openrouter);
  it("bỏ mô hình ngữ cảnh < 32k và sắp theo tên A→Z (không theo hãng)", () => {
    expect(list.map((m) => m.id)).toEqual(["alpha/plain", "beta/structured", "zeta/big-model"]);
  });
  it("đổi giá USD/token thành USD/1 triệu token; giá âm → null", () => {
    const big = list.find((m) => m.id === "zeta/big-model")!;
    expect([big.priceIn, big.priceOut, big.vendor, big.contextLength]).toEqual([3, 15, "zeta", 200_000]);
    const b = list.find((m) => m.id === "beta/structured")!;
    expect([b.priceIn, b.priceOut]).toEqual([null, null]);
  });
  it("jsonOk khi có response_format hoặc structured_outputs; không có thì khóa kèm lý do", () => {
    expect(list.find((m) => m.id === "beta/structured")!.locked).toBeNull();
    const plain = list.find((m) => m.id === "alpha/plain")!;
    expect(plain.jsonOk).toBe(false);
    expect(plain.locked).toBe(LOCK.json);
  });
  it("không có nhãn khuyên dùng; tested = false khi chưa qua bộ kiểm thử", () => {
    for (const m of list) { expect(m.tested).toBe(false); expect(m.testScore).toBeNull(); expect(Object.keys(m)).not.toContain("recommended"); }
  });
});

describe("normalizeGemini", () => {
  const list = normalizeGemini([
    { name: "models/gemini-2.5-flash", displayName: "Gemini 2.5 Flash", inputTokenLimit: 1_048_576, supportedGenerationMethods: ["generateContent", "countTokens"] },
    { name: "models/text-embedding-004", displayName: "Embedding", inputTokenLimit: 2048, supportedGenerationMethods: ["embedContent"] },
    { name: "models/aqa", displayName: "AQA", inputTokenLimit: 7168, supportedGenerationMethods: ["generateContent"] },
    { name: "models/imagen-4.0-generate", displayName: "Imagen", supportedGenerationMethods: ["predict"] },
    { name: "models/gemma-3-27b-it", displayName: "Gemma 3 27B", inputTokenLimit: 131_072, supportedGenerationMethods: ["generateContent"] },
    { name: "models/gemini-small-ctx", displayName: "Gemini Small", inputTokenLimit: 16_000, supportedGenerationMethods: ["generateContent"] },
    { name: "models/gemini-new-unpriced", displayName: "Gemini New", inputTokenLimit: 1_000_000, supportedGenerationMethods: ["generateContent"] }
  ]);
  it("chỉ giữ mô hình Gemini có generateContent (bỏ Gemma, embedding, aqa, imagen), bỏ tiền tố models/", () => {
    expect(list.map((m) => m.id)).toEqual(["gemini-2.5-flash", "gemini-new-unpriced", "gemini-small-ctx"]);
  });
  it("giá lấy từ bảng tĩnh, không có thì null", () => {
    expect(list[0].priceIn).toBe(0.3);
    expect(list.find((m) => m.id === "gemini-new-unpriced")!.priceIn).toBeNull();
  });
  it("khóa mô hình ngữ cảnh < 32k", () => {
    expect(list.find((m) => m.id === "gemini-small-ctx")!.locked).toBe(LOCK.context);
    expect(list[0].locked).toBeNull();
  });
});

describe("normalizeOpenAI", () => {
  const list = normalizeOpenAI({ data: ["gpt-4.1-mini", "text-embedding-3-small", "tts-1", "whisper-1", "dall-e-3", "omni-moderation-latest", "gpt-x-unknown", "o4-mini", "gpt-4o-realtime-preview", "babbage-002", "sora-2"].map((id) => ({ id })) });
  it("chỉ giữ mô hình chat của OpenAI (bỏ embedding, tts, whisper, dall-e, moderation, realtime…)", () => {
    expect(list.map((m) => m.id)).toEqual(["gpt-4.1-mini", "gpt-x-unknown", "o4-mini"]);
  });
  it("giá + ngữ cảnh từ bảng tĩnh nếu có, không thì null (vẫn chọn được)", () => {
    expect([list[0].priceIn, list[0].priceOut, list[0].contextLength]).toEqual([0.4, 1.6, 1_047_576]);
    expect([list[1].priceIn, list[1].contextLength, list[1].locked]).toEqual([null, null, null]);
  });
});

describe("gộp nhiều AI của khách", () => {
  it("mỗi mô hình mang nhà cung cấp của key; gộp lại sắp theo tên, không theo hãng", () => {
    const merged = mergeModels([
      normalizeOpenRouter(openrouter),
      normalizeGemini([{ name: "models/gemini-2.5-flash", displayName: "Gemini 2.5 Flash", inputTokenLimit: 1_048_576, supportedGenerationMethods: ["generateContent"] }])
    ]);
    expect(merged.map((m) => `${m.provider}:${m.id}`)).toEqual(["openrouter:alpha/plain", "openrouter:beta/structured", "gemini:gemini-2.5-flash", "openrouter:zeta/big-model"]);
  });
});

describe("giá mỗi lượt", () => {
  it("(6.000 × giá vào + 2.000 × giá ra) / 1e6 × tỷ giá, làm tròn 10 đ", () => {
    // (6000×3 + 2000×15)/1e6 = 0,048 USD × 26.000 = 1.248 → 1.250
    expect(pricePerRun({ priceIn: 3, priceOut: 15 }, 26_000)).toBe(1250);
    expect(pricePerRun({ priceIn: 0, priceOut: 0 }, 26_000)).toBe(0);
  });
  it("giá null → null → hiện “—”", () => {
    expect(pricePerRun({ priceIn: null, priceOut: 1 }, 26_000)).toBeNull();
    expect(formatVnd(null)).toBe("—");
    expect(formatVnd(1250)).toBe("1.250 đ");
  });
  it("thống kê theo mô hình: chi phí theo token thực dùng, mô hình lạ → null", () => {
    const rows = modelUsage([
      { provider: "openrouter", model: "a/x", runs: 2, tokens_in: 1_000_000, tokens_out: 100_000 },
      { provider: "mock", model: "mock", runs: 5, tokens_in: 10, tokens_out: null }
    ], new Map([["openrouter:a/x", { priceIn: 1, priceOut: 10 }]]), 25_000);
    expect(rows[0]).toEqual({ provider: "mock", model: "mock", runs: 5, tokens_in: 10, tokens_out: 0, cost: null });
    expect(rows[1].cost).toBe(50_000); // (1 + 1) USD × 25.000
  });
});
