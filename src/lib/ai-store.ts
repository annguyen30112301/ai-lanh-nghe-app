import { env } from "cloudflare:workers";
import { encryptSecret } from "./crypto";
import { db, now } from "./db";

export async function saveConnection(orgId: string, source: "openrouter_oauth" | "gemini_key" | "company_key", provider: string, key: string) {
  const { ciphertext, iv } = await encryptSecret(env.KEY_ENC_SECRET, key);
  await db().prepare(
    `INSERT INTO ai_connections (org_id, source, provider, key_ciphertext, key_iv, key_last4, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(org_id) DO UPDATE SET source = excluded.source, provider = excluded.provider, key_ciphertext = excluded.key_ciphertext,
       key_iv = excluded.key_iv, key_last4 = excluded.key_last4, verified_at = excluded.verified_at`
  ).bind(orgId, source, provider, ciphertext, iv, key.slice(-3), now()).run();
}
