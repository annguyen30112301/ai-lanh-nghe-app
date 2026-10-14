import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { randomDigits } from "../../../lib/crypto";
import { otpHash } from "../../../lib/otp";
import { db, now } from "../../../lib/db";
import { fail, json, readJson, route } from "../../../lib/http";
import { mailConfigured, sendMail } from "../../../lib/mail";

export const prerender = false;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z0-9-]{2,}$/i;

export const POST: APIRoute = route(async ({ request, url }) => {
  const { email: raw } = await readJson<{ email?: string }>(request);
  const email = (raw ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) fail(400, "Email chưa đúng. Ví dụ: lan.nguyen@congty.vn");

  const t = now();
  const recent = await db().prepare("SELECT COUNT(*) AS n FROM otp_codes WHERE email = ? AND expires_at > ?").bind(email, t - 50 * 6e4).first<{ n: number }>();
  if ((recent?.n ?? 0) >= 5) fail(429, "Bạn đã xin mã 5 lần trong 1 giờ. Chờ ít phút rồi thử lại.");

  const code = randomDigits(6);
  await db().prepare("INSERT INTO otp_codes (email, code_hash, expires_at) VALUES (?, ?, ?)").bind(email, await otpHash(email, code), t + 10 * 6e4).run();

  const isDemo = email.endsWith("@" + env.DEMO_EMAIL_DOMAIN);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (isDemo || (isLocal && !mailConfigured())) {
    if (isLocal) console.log(`[OTP] ${email}: ${code}`);
    return json({ ok: true, demo_code: code });
  }
  if (!mailConfigured()) fail(503, "Hệ thống chưa cấu hình gửi email. Bạn dùng tài khoản demo hoặc báo nhóm phát triển.");

  try {
    await sendMail({
      fromName: "AI Lành Nghề", to: email, subject: `Mã đăng nhập AI Lành Nghề: ${code}`,
      text: `Mã đăng nhập của bạn là ${code}. Mã có hiệu lực 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:18px;color:#201F1D"><p>Mã đăng nhập AI Lành Nghề của bạn:</p><p style="font-size:34px;font-weight:700;letter-spacing:8px;color:#5A3B0A">${code}</p><p>Mã có hiệu lực 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p></div>`
    });
  } catch (e) {
    console.error("otp_mail_failed", String(e));
    fail(502, "Chưa gửi được email. Bạn kiểm tra lại địa chỉ hoặc thử lại sau 1 phút.");
  }
  return json({ ok: true });
});
