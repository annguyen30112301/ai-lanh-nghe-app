import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { fail, json, readJson, route } from "../../../lib/http";
import { getKeys, orgModels } from "../../../lib/models-fetch";
import { canManageAI, requireAuth } from "../../../lib/session";

export const prerender = false;

interface Body { provider?: string; model?: string; allow_fallback?: boolean; fallback_provider?: string | null; fallback_model?: string | null }

/** Lưu mô hình khách chọn (và mô hình dự phòng nếu khách cho phép đổi khi quá tải; dự phòng có thể thuộc AI khác của khách). */
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const a = await requireAuth(cookies);
  if (!canManageAI(a)) fail(403, "Chỉ quản trị viên được đổi mô hình AI của công ty.");
  const b = await readJson<Body>(request);
  const keys = await getKeys(a.org.org_id);
  if (!keys.length) fail(409, "Bạn chưa kết nối AI.", "no_ai");
  const { models } = await orgModels(a.org.org_id, keys);
  const pick = (provider: string | null | undefined, id: string | null | undefined, what: string) => {
    const m = models.find((x) => x.provider === provider && x.id === id)
      ?? fail(400, `${what} không có trong các AI bạn đã kết nối. Bạn tải lại danh sách rồi chọn lại.`);
    if (m.locked) fail(400, `Không chọn được ${m.name}: ${m.locked}`);
    return m;
  };
  const main = pick(b.provider, b.model, "Mô hình");
  const allow = !!b.allow_fallback;
  const fb = allow ? pick(b.fallback_provider, b.fallback_model, "Mô hình dự phòng") : null;
  if (fb && fb.provider === main.provider && fb.id === main.id) fail(400, "Mô hình dự phòng phải khác mô hình chính.");
  await db().prepare(
    `INSERT INTO ai_model_choice (org_id, provider, model, allow_fallback, fallback_provider, fallback_model) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(org_id) DO UPDATE SET provider = excluded.provider, model = excluded.model, allow_fallback = excluded.allow_fallback,
       fallback_provider = excluded.fallback_provider, fallback_model = excluded.fallback_model`
  ).bind(a.org.org_id, main.provider, main.id, allow ? 1 : 0, fb?.provider ?? null, fb?.id ?? null).run();
  return json({ ok: true });
});
