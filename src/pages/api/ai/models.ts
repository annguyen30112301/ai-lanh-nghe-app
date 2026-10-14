import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { fail, json, route } from "../../../lib/http";
import { usdVnd } from "../../../lib/models";
import { getConnection, orgModels } from "../../../lib/models-fetch";
import { canManageAI, requireAuth } from "../../../lib/session";
import type { ModelsResponse } from "../../../content/types";

export const prerender = false;

/** Danh sách mô hình trong tài khoản AI của khách, sắp theo tên. Không chọn sẵn, không gắn nhãn khuyên dùng. */
export const GET: APIRoute = route(async ({ cookies }) => {
  const a = await requireAuth(cookies);
  const c = (await getConnection(a.org.org_id)) ?? fail(409, "Bạn chưa kết nối AI.", "no_ai");
  const body: ModelsResponse = {
    provider: c.provider, models: await orgModels(a.org.org_id, c), usd_vnd: usdVnd(env.USD_VND),
    current: { model: c.model, allow_fallback: !!c.allow_fallback, fallback_model: c.fallback_model },
    can_edit: canManageAI(a)
  };
  return json(body);
});
