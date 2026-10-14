import { env } from "cloudflare:workers";
import { encryptSecret } from "./crypto";
import { db, now } from "./db";

/** Lưu key. Đổi nhà cung cấp thì mô hình cũ không còn dùng được nên xóa để khách chọn lại. */
export async function saveConnection(orgId: string, source: "openrouter_oauth" | "gemini_key" | "company_key", provider: string, key: string) {
  const { ciphertext, iv } = await encryptSecret(env.KEY_ENC_SECRET, key);
  await db().prepare(
    `INSERT INTO ai_connections (org_id, source, provider, key_ciphertext, key_iv, key_last4, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(org_id) DO UPDATE SET source = excluded.source, provider = excluded.provider, key_ciphertext = excluded.key_ciphertext,
       key_iv = excluded.key_iv, key_last4 = excluded.key_last4, verified_at = excluded.verified_at,
       model = CASE WHEN ai_connections.provider = excluded.provider THEN ai_connections.model END,
       fallback_model = CASE WHEN ai_connections.provider = excluded.provider THEN ai_connections.fallback_model END,
       allow_fallback = CASE WHEN ai_connections.provider = excluded.provider THEN ai_connections.allow_fallback ELSE 0 END`
  ).bind(orgId, source, provider, ciphertext, iv, key.slice(-3), now()).run();
}
