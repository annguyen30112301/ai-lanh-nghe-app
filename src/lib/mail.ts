// Chọn đường gửi email đăng nhập.
// 1) SMTP (Gmail của nhóm, mật khẩu ứng dụng) nếu có SMTP_USER + SMTP_PASS: gửi được tới MỌI địa chỉ, không cần tên miền.
// 2) Resend nếu có RESEND_API_KEY: chỉ gửi được tới mọi địa chỉ khi MAIL_FROM thuộc tên miền đã xác minh;
//    với onboarding@resend.dev, Resend chỉ cho gửi tới email chủ tài khoản Resend.
import { env } from "cloudflare:workers";
import { connect } from "cloudflare:sockets";
import { sendSmtp, type Mail, type Opener } from "./smtp";

const openTls: Opener = async (host, port) => {
  const s = connect({ hostname: host, port }, { secureTransport: "on", allowHalfOpen: false });
  await s.opened;
  return s;
};

export function mailConfigured(): boolean {
  return !!((env.SMTP_USER && env.SMTP_PASS) || env.RESEND_API_KEY);
}

export async function sendMail(m: Mail): Promise<void> {
  if (env.SMTP_USER && env.SMTP_PASS) {
    await sendSmtp({ host: env.SMTP_HOST || "smtp.gmail.com", port: Number(env.SMTP_PORT || 465), user: env.SMTP_USER, pass: env.SMTP_PASS.replace(/\s+/g, "") }, m, openTls);
    return;
  }
  if (!env.RESEND_API_KEY) throw new Error("mail: chưa cấu hình");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [m.to], subject: m.subject, text: m.text, html: m.html })
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
