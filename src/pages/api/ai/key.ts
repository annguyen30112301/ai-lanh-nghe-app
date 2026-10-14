import type { APIRoute } from "astro";
import { verifyKey, type Provider } from "../../../lib/ai-gateway";
import { removeConnection, saveConnection } from "../../../lib/ai-store";
import { fail, json, readJson, route } from "../../../lib/http";
import { canManageAI, requireAuth } from "../../../lib/session";

export const prerender = false;

export const POST: APIRoute = route(async ({ request, cookies }) => {
  const a = await requireAuth(cookies);
  if (!canManageAI(a)) fail(403, "Kết nối AI của công ty do quản trị viên quản lý.");
  const b = await readJson<{ source?: string; key?: string; provider?: string }>(request);
  const key = (b.key ?? "").trim();
  if (key.length < 20 || /\s/.test(key)) fail(400, "Key chưa đúng định dạng. Bạn sao chép lại toàn bộ key, không kèm khoảng trắng.");
  let provider: Provider;
  if (b.source === "gemini_key") provider = "gemini";
  else if (b.source === "company_key") {
    if (a.org.plan === "personal") fail(403, "Chỉ tài khoản doanh nghiệp mới gắn được key công ty.");
    provider = (["openrouter", "gemini", "openai"].includes(b.provider ?? "") ? b.provider : "openrouter") as Provider;
  } else return fail(400, "Nguồn key không hợp lệ.");
  await verifyKey(provider, key);
  await saveConnection(a.org.org_id, b.source, provider, key);
  return json({ ok: true, provider, key_last4: key.slice(-3) });
});

/** Gỡ một AI đã kết nối (theo nhà cung cấp). Các AI khác giữ nguyên. */
export const DELETE: APIRoute = route(async ({ request, cookies }) => {
  const a = await requireAuth(cookies);
  if (!canManageAI(a)) fail(403, "Kết nối AI của công ty do quản trị viên quản lý.");
  const { provider } = await readJson<{ provider?: string }>(request);
  if (!["openrouter", "gemini", "openai"].includes(provider ?? "")) fail(400, "Bạn chọn AI cần gỡ.");
  await removeConnection(a.org.org_id, provider!);
  return json({ ok: true });
});
