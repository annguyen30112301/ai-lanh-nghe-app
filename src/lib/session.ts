import type { AstroCookies } from "astro";
import { env } from "cloudflare:workers";
import { hmac, randomId, safeEqual } from "./crypto";
import { db, now, primaryMembership, type Membership, type User } from "./db";
import { fail } from "./http";
import { DEVICE_LIMIT, sessionsOverLimit } from "./license";

const COOKIE = "alnh_s";
const TTL = 30 * 864e5;
const secret = () => env.SESSION_SECRET || fail(500, "Thiếu cấu hình SESSION_SECRET.");

/**
 * Tạo phiên mới. Tài khoản thường giữ tối đa DEVICE_LIMIT phiên: phiên dùng lâu nhất bị đẩy ra (đánh dấu, không xóa,
 * để thiết bị đó biết lý do). Tài khoản demo dùng chung nên không giới hạn. Trả số thiết bị bị đăng xuất.
 */
export async function createSession(cookies: AstroCookies, userId: string, device: string, secure: boolean, unlimited = false) {
  const id = randomId(32), t = now();
  await db().prepare("INSERT INTO sessions (id, user_id, expires_at, device, created_at, last_seen) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, userId, t + TTL, device.slice(0, 120), t, t).run();
  cookies.set(COOKIE, `${id}.${await hmac(secret(), id)}`, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: TTL / 1000 });
  if (unlimited) return 0;
  const live = (await db().prepare(
    "SELECT rowid AS rid, COALESCE(last_seen, created_at, 0) AS seen FROM sessions WHERE user_id = ? AND expires_at > ? AND revoked_at IS NULL"
  ).bind(userId, t).all<{ rid: number; seen: number }>()).results;
  const out = sessionsOverLimit(live);
  if (out.length) await db().batch(out.map((x) => db().prepare("UPDATE sessions SET revoked_at = ?, revoked_reason = 'device_limit' WHERE rowid = ?").bind(t, x.rid)));
  return out.length;
}

export async function destroySession(cookies: AstroCookies) {
  const id = await sessionId(cookies);
  if (id) await db().prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
  cookies.delete(COOKIE, { path: "/" });
}

async function sessionId(cookies: AstroCookies) {
  const raw = cookies.get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig || !safeEqual(sig, await hmac(secret(), id))) return null;
  return id;
}

export interface Auth { user: User; org: Membership }

const SEEN_EVERY = 5 * 6e4;

/** Bắt buộc đăng nhập; trả user + tổ chức đang dùng. */
export async function requireAuth(cookies: AstroCookies): Promise<Auth> {
  const id = await sessionId(cookies);
  if (!id) return fail(401, "Bạn cần đăng nhập để tiếp tục.", "auth");
  const t = now();
  const row = await db().prepare(
    "SELECT u.id, u.email, u.name, s.revoked_reason, s.last_seen FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?"
  ).bind(id, t).first<User & { revoked_reason: string | null; last_seen: number | null }>();
  if (!row) return fail(401, "Phiên đăng nhập đã hết hạn. Bạn đăng nhập lại nhé.", "auth");
  if (row.revoked_reason === "device_limit") return fail(401, `Tài khoản vừa đăng nhập trên thiết bị khác nên thiết bị này đã bị đăng xuất (mỗi tài khoản tối đa ${DEVICE_LIMIT} thiết bị). Bạn đăng nhập lại nếu đây là thiết bị của bạn.`, "auth_device");
  if (row.revoked_reason) return fail(401, "Thiết bị này đã được đăng xuất từ một thiết bị khác. Bạn đăng nhập lại nhé.", "auth");
  if (!row.last_seen || t - row.last_seen > SEEN_EVERY) await db().prepare("UPDATE sessions SET last_seen = ? WHERE id = ?").bind(t, id).run();
  const user: User = { id: row.id, email: row.email, name: row.name };
  const org = await primaryMembership(user.id);
  if (!org) return fail(403, "Tài khoản chưa thuộc tổ chức nào. Liên hệ quản trị viên.", "org");
  return { user, org };
}

/** Các thiết bị đang đăng nhập của tài khoản (không trả mã phiên ra trình duyệt). */
export async function listDevices(cookies: AstroCookies, userId: string) {
  const cur = await sessionId(cookies);
  const r = await db().prepare(
    "SELECT rowid AS rid, id, device, created_at, last_seen FROM sessions WHERE user_id = ? AND expires_at > ? AND revoked_at IS NULL ORDER BY COALESCE(last_seen, created_at, 0) DESC"
  ).bind(userId, now()).all<{ rid: number; id: string; device: string | null; created_at: number | null; last_seen: number | null }>();
  return r.results.map((x) => ({ rid: x.rid, ua: x.device ?? "", created_at: x.created_at, last_seen: x.last_seen, current: x.id === cur }));
}

/** Đăng xuất một thiết bị khác của chính tài khoản này. */
export async function revokeDevice(userId: string, rid: number) {
  await db().prepare("UPDATE sessions SET revoked_at = ?, revoked_reason = 'user' WHERE rowid = ? AND user_id = ? AND revoked_at IS NULL").bind(now(), rid, userId).run();
}

export async function requireAdmin(cookies: AstroCookies) {
  const a = await requireAuth(cookies);
  if (a.org.role !== "admin" || a.org.plan === "personal") fail(403, "Chỉ quản trị viên doanh nghiệp xem được mục này.", "admin");
  return a;
}

/** Ai được đổi kết nối AI của tổ chức: chủ tài khoản cá nhân hoặc quản trị viên doanh nghiệp. */
export function canManageAI(a: Auth) {
  return a.org.role === "admin";
}
