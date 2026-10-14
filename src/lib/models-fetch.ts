// Gọi API danh sách mô hình của nhà cung cấp bằng key của khách. Cache 1 giờ trong bộ nhớ, không ghi D1.
import { env } from "cloudflare:workers";
import { decryptSecret } from "./crypto";
import { db } from "./db";
import { fail, HttpError } from "./http";
import { mergeModels, modelKey, modelUsage, normalizeGemini, normalizeOpenAI, normalizeOpenRouter, usdVnd, type ModelInfo } from "./models";

const TTL = 3600_000;
const cache = new Map<string, { at: number; list: ModelInfo[] }>();

async function get(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) {
    console.error("models_upstream", new URL(url).host, res.status);
    fail(502, res.status === 401 || res.status === 403
      ? "Key AI không còn hợp lệ nên chưa lấy được danh sách mô hình. Bạn gắn lại key nhé."
      : "Chưa lấy được danh sách mô hình từ nhà cung cấp AI. Bạn thử lại sau ít phút.", "models_upstream");
  }
  return res.json();
}

export async function listModels(provider: string, key: string): Promise<ModelInfo[]> {
  switch (provider) {
    case "openrouter":
      return normalizeOpenRouter(await get("https://openrouter.ai/api/v1/models", { authorization: `Bearer ${key}` }));
    case "openai":
      return normalizeOpenAI(await get("https://api.openai.com/v1/models", { authorization: `Bearer ${key}` }));
    case "gemini": {
      const all: Parameters<typeof normalizeGemini>[0] = [];
      let token = "";
      for (let page = 0; page < 10; page++) {
        const j = (await get(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`, { "x-goog-api-key": key })) as { models?: typeof all; nextPageToken?: string };
        all.push(...(j.models ?? []));
        if (!(token = j.nextPageToken ?? "")) break;
      }
      return normalizeGemini(all);
    }
    default:
      return [];
  }
}

export interface OrgKey { provider: string; source: string; key_last4: string; verified_at: number | null }
export interface ModelChoice { provider: string; model: string; allow_fallback: number; fallback_provider: string | null; fallback_model: string | null }

/** Các AI khách đã kết nối (mỗi nhà cung cấp một key). */
export const getKeys = async (orgId: string) =>
  (await db().prepare("SELECT provider, source, key_last4, verified_at FROM ai_keys WHERE org_id = ? ORDER BY provider").bind(orgId).all<OrgKey>()).results;
export const getChoice = (orgId: string) =>
  db().prepare("SELECT provider, model, allow_fallback, fallback_provider, fallback_model FROM ai_model_choice WHERE org_id = ?").bind(orgId).first<ModelChoice>();

/** Danh sách mô hình của MỘT key (cache theo org + nhà cung cấp + key). */
async function keyModels(orgId: string, k: OrgKey): Promise<ModelInfo[]> {
  const ck = `${orgId}:${k.provider}:${k.key_last4}:${k.verified_at ?? 0}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.at < TTL) return hit.list;
  const row = await db().prepare("SELECT key_ciphertext, key_iv FROM ai_keys WHERE org_id = ? AND provider = ?").bind(orgId, k.provider).first<{ key_ciphertext: string; key_iv: string }>();
  if (!row) return [];
  const list = await listModels(k.provider, await decryptSecret(env.KEY_ENC_SECRET, row.key_ciphertext, row.key_iv));
  for (const c of cache.keys()) if (c.startsWith(`${orgId}:${k.provider}:`)) cache.delete(c);
  cache.set(ck, { at: Date.now(), list });
  return list;
}

/**
 * Gộp mô hình của mọi AI khách đã kết nối, sắp theo tên.
 * Một key lỗi không làm mất danh sách của key khác: lỗi trả riêng theo nhà cung cấp.
 */
export async function orgModels(orgId: string, keys?: OrgKey[]) {
  const ks = keys ?? (await getKeys(orgId));
  const settled = await Promise.allSettled(ks.map((k) => keyModels(orgId, k)));
  const errors: { provider: string; message: string }[] = [];
  settled.forEach((r, i) => {
    if (r.status === "rejected") errors.push({ provider: ks[i].provider, message: r.reason instanceof HttpError ? r.reason.message : "Chưa lấy được danh sách mô hình." });
  });
  return { models: mergeModels(settled.map((r) => (r.status === "fulfilled" ? r.value : []))), errors };
}

/** Thống kê lượt theo mô hình thực chạy (runs.provider + runs.model) + chi phí ước tính. Lỗi lấy giá thì vẫn trả số lượt. */
export async function usageByModel(orgId: string, where: string, ...binds: unknown[]) {
  const rows = await db().prepare(
    `SELECT provider, model, COUNT(*) AS runs, SUM(tokens_in) AS tokens_in, SUM(tokens_out) AS tokens_out FROM runs
     WHERE ${where} AND result_at IS NOT NULL AND model IS NOT NULL GROUP BY provider, model`
  ).bind(...binds).all<{ provider: string | null; model: string; runs: number; tokens_in: number | null; tokens_out: number | null }>();
  const list = rows.results.length ? (await orgModels(orgId).catch(() => ({ models: [] as ModelInfo[] }))).models : [];
  return modelUsage(rows.results, new Map(list.map((m) => [modelKey(m.provider, m.id), m])), usdVnd(env.USD_VND));
}
