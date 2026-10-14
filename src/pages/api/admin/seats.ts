import type { APIRoute } from "astro";
import { randomId } from "../../../lib/crypto";
import { db, now } from "../../../lib/db";
import { fail, json, readJson, route } from "../../../lib/http";
import { requireAdmin } from "../../../lib/session";

export const prerender = false;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z0-9-]{2,}$/i;

async function list(orgId: string) {
  const r = await db().prepare(
    `SELECT u.id, u.email, u.name, m.role, m.status,
       (SELECT COUNT(*) FROM runs x WHERE x.user_id = u.id AND x.org_id = m.org_id AND x.result_at IS NOT NULL) AS runs,
       (SELECT MAX(opened_at) FROM runs x WHERE x.user_id = u.id AND x.org_id = m.org_id) AS last_at
     FROM members m JOIN users u ON u.id = m.user_id WHERE m.org_id = ? AND m.status != 'revoked'
     ORDER BY CASE m.role WHEN 'admin' THEN 0 ELSE 1 END, u.name`
  ).bind(orgId).all();
  return r.results;
}

async function invite(orgId: string, seats: number, email: string, name: string) {
  if (!EMAIL.test(email)) fail(400, "Email chưa đúng định dạng.");
  const used = await db().prepare("SELECT COUNT(*) AS n FROM members WHERE org_id = ? AND status IN ('active','invited')").bind(orgId).first<{ n: number }>();
  if ((used?.n ?? 0) >= seats) fail(409, `Đã dùng hết ${seats} seat. Thu hồi một seat hoặc mua thêm.`);
  let u = await db().prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>();
  if (!u) {
    u = { id: "u_" + randomId(10) };
    await db().prepare("INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)").bind(u.id, email, name || null, now()).run();
  }
  // MVP: không gửi email mời thật. Người được mời đăng nhập bằng email này là vào được.
  await db().prepare("INSERT INTO members (org_id, user_id, role, status) VALUES (?, ?, 'member', 'invited') ON CONFLICT(org_id, user_id) DO UPDATE SET status = 'invited'")
    .bind(orgId, u.id).run();
}

export const GET: APIRoute = route(async ({ cookies }) => {
  const { org } = await requireAdmin(cookies);
  return json({ seats: org.seats, members: await list(org.org_id) });
});

export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user, org } = await requireAdmin(cookies);
  const b = await readJson<{ action?: string; email?: string; name?: string; user_id?: string }>(request);
  const email = (b.email ?? "").trim().toLowerCase(), name = (b.name ?? "").trim().slice(0, 80);
  const revoke = async (id?: string) => {
    if (!id) fail(400, "Thiếu người cần thu hồi.");
    if (id === user.id) fail(400, "Bạn không thể tự thu hồi seat của mình.");
    await db().prepare("UPDATE members SET status = 'revoked' WHERE org_id = ? AND user_id = ? AND role = 'member'").bind(org.org_id, id).run();
  };
  if (b.action === "invite") await invite(org.org_id, org.seats, email, name);
  else if (b.action === "revoke") await revoke(b.user_id);
  else if (b.action === "transfer") { await revoke(b.user_id); await invite(org.org_id, org.seats, email, name); }
  else fail(400, "Thao tác không hợp lệ.");
  return json({ ok: true, seats: org.seats, members: await list(org.org_id) });
});
