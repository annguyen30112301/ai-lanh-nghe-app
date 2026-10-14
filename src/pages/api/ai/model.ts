import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { fail, json, readJson, route } from "../../../lib/http";
import { getConnection, orgModels } from "../../../lib/models-fetch";
import { canManageAI, requireAuth } from "../../../lib/session";

export const prerender = false;

/** Lưu mô hình khách chọn (và mô hình dự phòng nếu khách cho phép đổi khi quá tải). */
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const a = await requireAuth(cookies);
  if (!canManageAI(a)) fail(403, "Chỉ quản trị viên được đổi mô hình AI của công ty.");
  const b = await readJson<{ model?: string; allow_fallback?: boolean; fallback_model?: string | null }>(request);
  const c = (await getConnection(a.org.org_id)) ?? fail(409, "Bạn chưa kết nối AI.", "no_ai");
  const list = await orgModels(a.org.org_id, c);
  const pick = (id: string | null | undefined, what: string) => {
    const m = list.find((x) => x.id === id) ?? fail(400, `${what} không có trong tài khoản AI của bạn. Bạn tải lại danh sách rồi chọn lại.`);
    if (m.locked) fail(400, `Không chọn được ${m.name}: ${m.locked}`);
    return m.id;
  };
  const model = pick(b.model, "Mô hình");
  const allow = !!b.allow_fallback;
  const fallback = allow ? pick(b.fallback_model, "Mô hình dự phòng") : null;
  if (fallback === model) fail(400, "Mô hình dự phòng phải khác mô hình chính.");
  await db().prepare("UPDATE ai_connections SET model = ?, allow_fallback = ?, fallback_model = ? WHERE org_id = ?")
    .bind(model, allow ? 1 : 0, fallback, a.org.org_id).run();
  return json({ ok: true, model, allow_fallback: allow, fallback_model: fallback });
});
