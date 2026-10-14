import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { choiceOut } from "../../../lib/choice";
import { fail, json, route } from "../../../lib/http";
import { usdVnd } from "../../../lib/models";
import { getChoice, getKeys, orgModels } from "../../../lib/models-fetch";
import { canManageAI, requireAuth } from "../../../lib/session";
import type { ModelsResponse } from "../../../content/types";

export const prerender = false;

/** Mô hình của mọi AI khách đã kết nối, gộp và sắp theo tên. Không chọn sẵn, không gắn nhãn khuyên dùng. */
export const GET: APIRoute = route(async ({ cookies }) => {
  const a = await requireAuth(cookies);
  const keys = await getKeys(a.org.org_id);
  if (!keys.length) fail(409, "Bạn chưa kết nối AI.", "no_ai");
  const [{ models, errors }, choice] = await Promise.all([orgModels(a.org.org_id, keys), getChoice(a.org.org_id)]);
  const body: ModelsResponse = {
    providers: keys.map((k) => k.provider), models, errors, usd_vnd: usdVnd(env.USD_VND),
    current: choiceOut(choice), can_edit: canManageAI(a)
  };
  return json(body);
});
