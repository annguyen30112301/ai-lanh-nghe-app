// Gọi API danh sách mô hình của nhà cung cấp bằng key của khách. Cache 1 giờ trong bộ nhớ, không ghi D1.
import { env } from "cloudflare:workers";
import { decryptSecret } from "./crypto";
import { db } from "./db";
import { fail } from "./http";
import { modelUsage, normalizeGemini, normalizeOpenAI, normalizeOpenRouter, usdVnd, type ModelInfo } from "./models";

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

export interface OrgConnection { provider: string; key_last4: string; verified_at: number | null; model: string | null; allow_fallback: number; fallback_model: string | null }

export const getConnection = (orgId: string) =>
  db().prepare("SELECT provider, key_last4, verified_at, model, allow_fallback, fallback_model FROM ai_connections WHERE org_id = ?").bind(orgId).first<OrgConnection>();

/** Danh sách mô hình của kết nối AI tổ chức (cache theo org + key). */
export async function orgModels(orgId: string, c?: OrgConnection | null): Promise<ModelInfo[]> {
  const conn = c ?? (await getConnection(orgId)) ?? fail(409, "Bạn chưa kết nối AI.", "no_ai");
  const ck = `${orgId}:${conn.provider}:${conn.key_last4}:${conn.verified_at ?? 0}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.at < TTL) return hit.list;
  const row = await db().prepare("SELECT key_ciphertext, key_iv FROM ai_connections WHERE org_id = ?").bind(orgId).first<{ key_ciphertext: string; key_iv: string }>();
  if (!row) return fail(409, "Bạn chưa kết nối AI.", "no_ai");
  const list = await listModels(conn.provider, await decryptSecret(env.KEY_ENC_SECRET, row.key_ciphertext, row.key_iv));
  for (const k of cache.keys()) if (k.startsWith(orgId + ":")) cache.delete(k);
  cache.set(ck, { at: Date.now(), list });
  return list;
}

/** Thống kê lượt theo mô hình thực chạy (runs.model) + chi phí ước tính. Lỗi lấy giá thì vẫn trả số lượt. */
export async function usageByModel(orgId: string, where: string, ...binds: unknown[]) {
  const rows = await db().prepare(
    `SELECT model, COUNT(*) AS runs, SUM(tokens_in) AS tokens_in, SUM(tokens_out) AS tokens_out FROM runs
     WHERE ${where} AND result_at IS NOT NULL AND model IS NOT NULL GROUP BY model`
  ).bind(...binds).all<{ model: string; runs: number; tokens_in: number | null; tokens_out: number | null }>();
  const list = rows.results.length ? await orgModels(orgId).catch(() => [] as ModelInfo[]) : [];
  return modelUsage(rows.results, new Map(list.map((m) => [m.id, m])), usdVnd(env.USD_VND));
}
