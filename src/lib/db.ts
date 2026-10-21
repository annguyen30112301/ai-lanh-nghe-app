import { env } from "cloudflare:workers";

export const db = () => env.DB;
export const now = () => Date.now();

export interface User { id: string; email: string; name: string | null }
export interface Membership { org_id: string; role: "admin" | "member"; name: string; plan: "personal" | "business" | "business_plus"; seats: number; expires_at: number | null }

/** Tổ chức đang dùng: ưu tiên tổ chức còn license, rồi doanh nghiệp trước cá nhân. */
export async function primaryMembership(userId: string) {
  return db().prepare(
    `SELECT m.org_id, m.role, o.name, o.plan, o.seats, o.expires_at FROM members m JOIN organizations o ON o.id = m.org_id
     WHERE m.user_id = ? AND m.status = 'active'
     ORDER BY CASE WHEN o.expires_at > ? THEN 0 ELSE 1 END, CASE o.plan WHEN 'personal' THEN 1 ELSE 0 END, o.expires_at DESC LIMIT 1`
  ).bind(userId, now()).first<Membership>();
}
