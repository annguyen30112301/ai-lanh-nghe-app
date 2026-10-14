// Danh sách mô hình để khách tự chọn: chuẩn hóa từ API của nhà cung cấp, tính giá ước tính mỗi lượt.
// Thuần hàm, không gọi mạng (phần gọi mạng ở models-fetch.ts) để kiểm thử bằng JSON mẫu.
import tested from "../skills/tested-models.json";
import { MODEL_PRICES } from "./model-prices";

export interface ModelInfo {
  /** AI (key) của khách phục vụ mô hình này: openrouter | gemini | openai */
  provider: string;
  id: string;
  name: string;
  /** hãng làm mô hình (OpenRouter: phần trước dấu /) */
  vendor: string;
  contextLength: number | null;
  /** USD / 1 triệu token, null khi không rõ giá */
  priceIn: number | null;
  priceOut: number | null;
  jsonOk: boolean;
  tested: boolean;
  /** "3/3" khi đã qua bộ kiểm thử gói nghề */
  testScore: string | null;
  /** lý do không cho chọn, null = chọn được */
  locked: string | null;
}

export const MIN_CONTEXT = 32_000;
/** Một lượt điển hình: ~6.000 token vào, ~2.000 token ra. */
export const RUN_TOKENS = { in: 6_000, out: 2_000 };
export const LOCK = {
  json: "Không trả được dữ liệu dạng bảng ổn định.",
  context: "Không đủ dài cho 3 báo giá."
};

interface TestedEntry { id: string; date?: string; passed: number; total: number }
const TESTED = new Map((tested.models as TestedEntry[]).map((x) => [x.id, x]));

function finish(m: Omit<ModelInfo, "tested" | "testScore" | "locked">): ModelInfo {
  const t = TESTED.get(m.id);
  const locked = !m.jsonOk ? LOCK.json : m.contextLength !== null && m.contextLength < MIN_CONTEXT ? LOCK.context : null;
  return { ...m, tested: !!t, testScore: t ? `${t.passed}/${t.total}` : null, locked };
}

const byName = (a: ModelInfo, b: ModelInfo) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }) || a.id.localeCompare(b.id) || a.provider.localeCompare(b.provider);
/** Khóa duy nhất trên mọi AI của khách (cùng tên mô hình có thể có ở hai nhà cung cấp). */
export const modelKey = (provider: string, id: string) => `${provider}:${id}`;
/** Gộp danh sách của nhiều AI khách đã kết nối, sắp theo tên A→Z (không theo hãng). */
export const mergeModels = (lists: ModelInfo[][]) => lists.flat().sort(byName);
const perMillion = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 1e6 * 1e4) / 1e4 : null;
};

interface ORModel { id: string; name?: string; context_length?: number | null; pricing?: { prompt?: string; completion?: string }; supported_parameters?: string[] }
/** OpenRouter: chỉ giữ mô hình ngữ cảnh ≥ 32k; jsonOk khi hỗ trợ response_format/structured_outputs. */
export function normalizeOpenRouter(j: { data?: ORModel[] }): ModelInfo[] {
  return (j.data ?? [])
    .filter((m) => m?.id && (m.context_length ?? 0) >= MIN_CONTEXT)
    .map((m) => {
      const params = m.supported_parameters ?? [];
      return finish({
        provider: "openrouter", id: m.id, name: m.name || m.id, vendor: m.id.split("/")[0],
        contextLength: m.context_length ?? null,
        priceIn: perMillion(m.pricing?.prompt), priceOut: perMillion(m.pricing?.completion),
        jsonOk: params.includes("response_format") || params.includes("structured_outputs")
      });
    })
    .sort(byName);
}

interface GModel { name: string; displayName?: string; inputTokenLimit?: number; supportedGenerationMethods?: string[] }
const GEMINI_SKIP = /embedding|aqa|imagen|veo|tts|native-audio|live/i;
/** Gemini: chỉ dòng gemini-* có generateContent (bỏ Gemma, embedding, aqa, imagen…). Giá lấy từ bảng tĩnh. */
export function normalizeGemini(models: GModel[]): ModelInfo[] {
  return models
    .filter((m) => m?.name?.startsWith("models/gemini") && m.supportedGenerationMethods?.includes("generateContent") && !GEMINI_SKIP.test(m.name))
    .map((m) => {
      const id = m.name.replace(/^models\//, "");
      const p = MODEL_PRICES[id];
      return finish({
        provider: "gemini", id, name: m.displayName || id, vendor: "google",
        contextLength: m.inputTokenLimit ?? null, priceIn: p?.in ?? null, priceOut: p?.out ?? null,
        jsonOk: true
      });
    })
    .sort(byName);
}

/** Chỉ mô hình chat của OpenAI (gpt-*, o1/o3/o4…, chatgpt-*, kể cả bản fine-tune ft:gpt-*). */
const OPENAI_CHAT = /^(ft:)?(gpt-|o\d|chatgpt-)/i;
const OPENAI_SKIP = /embedding|tts|whisper|dall-e|moderation|realtime|audio|transcribe|image|search|babbage|davinci|computer-use/i;
/** OpenAI: bỏ mô hình không phải chat. API không trả giá và ngữ cảnh: lấy từ bảng tĩnh nếu có. */
export function normalizeOpenAI(j: { data?: { id: string }[] }): ModelInfo[] {
  return (j.data ?? [])
    .filter((m) => m?.id && OPENAI_CHAT.test(m.id) && !OPENAI_SKIP.test(m.id))
    .map((m) => {
      const p = MODEL_PRICES[m.id];
      return finish({ provider: "openai", id: m.id, name: m.id, vendor: "openai", contextLength: p?.context ?? null, priceIn: p?.in ?? null, priceOut: p?.out ?? null, jsonOk: true });
    })
    .sort(byName);
}

/** Giá ước tính mỗi lượt (đồng), làm tròn 10 đ. null khi không rõ giá. */
export function pricePerRun(m: Pick<ModelInfo, "priceIn" | "priceOut">, usdVnd: number): number | null {
  if (m.priceIn === null || m.priceOut === null) return null;
  return Math.round(((RUN_TOKENS.in * m.priceIn + RUN_TOKENS.out * m.priceOut) / 1e6) * usdVnd / 10) * 10;
}

/** "1.230 đ" hoặc "—". */
export const formatVnd = (v: number | null) => (v === null ? "—" : `${v.toLocaleString("vi-VN")} đ`);

/** Chi phí ước tính (đồng) cho số token đã dùng; null khi không rõ giá. */
export function usageCost(tokensIn: number, tokensOut: number, m: Pick<ModelInfo, "priceIn" | "priceOut"> | undefined, usdVnd: number): number | null {
  if (!m || m.priceIn === null || m.priceOut === null) return null;
  return Math.round(((tokensIn * m.priceIn + tokensOut * m.priceOut) / 1e6) * usdVnd);
}

export interface ModelUsageRow { provider: string | null; model: string; runs: number; tokens_in: number; tokens_out: number; cost: number | null }
/** Gộp thống kê lượt theo (runs.provider, runs.model), kèm chi phí ước tính. prices: khóa modelKey(provider, id). */
export function modelUsage(rows: { provider: string | null; model: string; runs: number; tokens_in: number | null; tokens_out: number | null }[], prices: Map<string, Pick<ModelInfo, "priceIn" | "priceOut">>, usdVnd: number): ModelUsageRow[] {
  return rows.map((r) => {
    const tin = r.tokens_in ?? 0, tout = r.tokens_out ?? 0;
    const known = prices.get(modelKey(r.provider ?? "", r.model)) ?? (MODEL_PRICES[r.model] ? { priceIn: MODEL_PRICES[r.model].in, priceOut: MODEL_PRICES[r.model].out } : undefined);
    return { provider: r.provider, model: r.model, runs: r.runs, tokens_in: tin, tokens_out: tout, cost: usageCost(tin, tout, known, usdVnd) };
  }).sort((a, b) => b.runs - a.runs);
}

/** Tỷ giá USD → VND dùng để ước tính (cấu hình USD_VND). */
export const usdVnd = (raw: string | undefined) => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 26_000;
};

/** Tên hiển thị của AI khách kết nối. */
export const PROVIDER_LABEL: Record<string, string> = { openrouter: "OpenRouter", gemini: "Google Gemini", openai: "OpenAI", mock: "Mô phỏng" };
