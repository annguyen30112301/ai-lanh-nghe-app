import type { AstroCookies } from "astro";
import { env } from "cloudflare:workers";
import { hmac, randomId, safeEqual } from "./crypto";
import { db, now, primaryMembership, type Membership, type User } from "./db";
import { fail } from "./http";

const COOKIE = "alnh_s";
const TTL = 30 * 864e5;
const secret = () => env.SESSION_SECRET || fail(500, "Thiếu cấu hình SESSION_SECRET.");

export async function createSession(cookies: AstroCookies, userId: string, device: string, secure: boolean) {
  const id = randomId(32);
  await db().prepare("INSERT INTO sessions (id, user_id, expires_at, device) VALUES (?, ?, ?, ?)").bind(id, userId, now() + TTL, device.slice(0, 120)).run();
  cookies.set(COOKIE, `${id}.${await hmac(secret(), id)}`, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: TTL / 1000 });
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

/** Bắt buộc đăng nhập; trả user + tổ chức đang dùng. */
export async function requireAuth(cookies: AstroCookies): Promise<Auth> {
  const id = await sessionId(cookies);
  if (!id) return fail(401, "Bạn cần đăng nhập để tiếp tục.", "auth");
  const user = await db().prepare(
    "SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?"
  ).bind(id, now()).first<User>();
  if (!user) return fail(401, "Phiên đăng nhập đã hết hạn. Bạn đăng nhập lại nhé.", "auth");
  const org = await primaryMembership(user.id);
  if (!org) return fail(403, "Tài khoản chưa thuộc tổ chức nào. Liên hệ quản trị viên.", "org");
  return { user, org };
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
