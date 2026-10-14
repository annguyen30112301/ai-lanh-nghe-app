import { env } from "cloudflare:workers";

export const db = () => env.DB;
export const now = () => Date.now();

export interface User { id: string; email: string; name: string | null }
export interface Membership { org_id: string; role: "admin" | "member"; name: string; plan: "personal" | "business" | "business_plus"; seats: number }

/** Tổ chức đang dùng: ưu tiên doanh nghiệp, sau đó cá nhân. */
export async function primaryMembership(userId: string) {
  return db().prepare(
    `SELECT m.org_id, m.role, o.name, o.plan, o.seats FROM members m JOIN organizations o ON o.id = m.org_id
     WHERE m.user_id = ? AND m.status = 'active' ORDER BY CASE o.plan WHEN 'personal' THEN 1 ELSE 0 END LIMIT 1`
  ).bind(userId).first<Membership>();
}
