import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { fail, json, readJson, route } from "../../lib/http";
import { DEVICE_LIMIT, deviceName, isLicensed } from "../../lib/license";
import { listDevices, requireAuth, revokeDevice } from "../../lib/session";
import type { AstroCookies } from "astro";

export const prerender = false;

async function body(cookies: AstroCookies) {
  const { user, org } = await requireAuth(cookies);
  const [history, devices] = await Promise.all([
    db().prepare("SELECT id, order_id, plan, seats, valid_from, valid_to FROM licenses WHERE org_id = ? ORDER BY created_at DESC LIMIT 20").bind(org.org_id).all(),
    listDevices(cookies, user.id)
  ]);
  return {
    email: user.email,
    license: { org_name: org.name, plan: org.plan, seats: org.seats, role: org.role, expires_at: org.expires_at, active: isLicensed(org.expires_at) },
    history: history.results,
    devices: devices.map((d) => ({ ...d, name: deviceName(d.ua), ua: undefined })),
    device_limit: DEVICE_LIMIT
  };
}

/** Gói & license của tổ chức đang dùng, lịch sử cấp license, thiết bị đang đăng nhập. */
export const GET: APIRoute = route(async ({ cookies }) => json(await body(cookies)));

/** Đăng xuất một thiết bị khác. */
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user } = await requireAuth(cookies);
  const b = await readJson<{ action?: string; rid?: number }>(request);
  if (b.action !== "signout" || !Number.isInteger(b.rid)) fail(400, "Thao tác không hợp lệ.");
  await revokeDevice(user.id, b.rid!);
  return json(await body(cookies));
});
