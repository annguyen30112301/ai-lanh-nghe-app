import { env } from "cloudflare:workers";
import { encryptSecret } from "./crypto";
import { db, now } from "./db";

/** Lưu key của một nhà cung cấp. Khách có thể kết nối nhiều AI; gắn lại key cùng nhà cung cấp thì thay key cũ, giữ mô hình đã chọn. */
export async function saveConnection(orgId: string, source: "openrouter_oauth" | "gemini_key" | "company_key", provider: string, key: string) {
  const { ciphertext, iv } = await encryptSecret(env.KEY_ENC_SECRET, key);
  await db().prepare(
    `INSERT INTO ai_keys (org_id, provider, source, key_ciphertext, key_iv, key_last4, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(org_id, provider) DO UPDATE SET source = excluded.source, key_ciphertext = excluded.key_ciphertext,
       key_iv = excluded.key_iv, key_last4 = excluded.key_last4, verified_at = excluded.verified_at`
  ).bind(orgId, provider, source, ciphertext, iv, key.slice(-3), now()).run();
}

/** Gỡ key một nhà cung cấp. Mô hình chính thuộc AI đó thì bỏ lựa chọn; dự phòng thuộc AI đó thì tắt dự phòng. */
export async function removeConnection(orgId: string, provider: string) {
  await db().batch([
    db().prepare("DELETE FROM ai_keys WHERE org_id = ? AND provider = ?").bind(orgId, provider),
    db().prepare("DELETE FROM ai_model_choice WHERE org_id = ? AND provider = ?").bind(orgId, provider),
    db().prepare("UPDATE ai_model_choice SET allow_fallback = 0, fallback_provider = NULL, fallback_model = NULL WHERE org_id = ? AND fallback_provider = ?").bind(orgId, provider)
  ]);
}
