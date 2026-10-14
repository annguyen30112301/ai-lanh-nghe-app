import type { APIRoute } from "astro";
import { randomId, safeEqual } from "../../../lib/crypto";
import { db, now } from "../../../lib/db";
import { fail, json, readJson, route } from "../../../lib/http";
import { createSession } from "../../../lib/session";
import { otpHash } from "../../../lib/otp";

export const prerender = false;

export const POST: APIRoute = route(async ({ request, cookies, url }) => {
  const b = await readJson<{ email?: string; code?: string }>(request);
  const email = (b.email ?? "").trim().toLowerCase();
  const code = (b.code ?? "").replace(/\D/g, "");
  if (code.length !== 6) fail(400, "Mã gồm 6 chữ số. Bạn kiểm tra lại email nhé.");

  const t = now();
  const row = await db().prepare("SELECT rowid AS rid, code_hash, attempts FROM otp_codes WHERE email = ? AND expires_at > ? ORDER BY expires_at DESC LIMIT 1")
    .bind(email, t).first<{ rid: number; code_hash: string; attempts: number }>();
  if (!row) fail(400, "Mã đã hết hạn. Bạn bấm “Gửi lại mã”.");
  if (row!.attempts >= 5) fail(429, "Nhập sai quá 5 lần. Bạn bấm “Gửi lại mã” để nhận mã mới.");
  if (!safeEqual(row!.code_hash, await otpHash(email, code))) {
    await db().prepare("UPDATE otp_codes SET attempts = attempts + 1 WHERE rowid = ?").bind(row!.rid).run();
    fail(400, `Mã chưa đúng. Bạn còn ${4 - row!.attempts} lần thử.`);
  }
  await db().prepare("DELETE FROM otp_codes WHERE email = ?").bind(email).run();

  let user = await db().prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: string }>();
  let isNew = false;
  if (!user) {
    isNew = true;
    const uid = "u_" + randomId(10), oid = "org_" + randomId(10);
    await db().batch([
      db().prepare("INSERT INTO users (id, email, name, created_at) VALUES (?, ?, NULL, ?)").bind(uid, email, t),
      db().prepare("INSERT INTO organizations (id, name, plan, seats) VALUES (?, ?, 'personal', 1)").bind(oid, "Cá nhân – " + email.split("@")[0]),
      db().prepare("INSERT INTO members (org_id, user_id, role, status) VALUES (?, ?, 'admin', 'active')").bind(oid, uid),
      db().prepare("INSERT INTO trial_usage (user_id, used) VALUES (?, 0)").bind(uid)
    ]);
    user = { id: uid };
  } else {
    // người được mời: kích hoạt seat ở lần đăng nhập đầu
    await db().prepare("UPDATE members SET status = 'active' WHERE user_id = ? AND status = 'invited'").bind(user.id).run();
  }
  await createSession(cookies, user.id, request.headers.get("user-agent") ?? "", url.protocol === "https:");

  const ai = await db().prepare(
    "SELECT 1 AS ok FROM members m JOIN ai_keys c ON c.org_id = m.org_id WHERE m.user_id = ? AND m.status = 'active' LIMIT 1"
  ).bind(user.id).first();
  return json({ ok: true, is_new: isNew, next: ai ? "/app/tinh-huong/" : "/app/ket-noi-ai/" });
});
