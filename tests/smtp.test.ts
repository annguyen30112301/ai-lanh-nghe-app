import { describe, expect, it } from "vitest";
import { b64, buildMessage, sendSmtp, type Duplex, type Opener } from "../src/lib/smtp";

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Máy chủ SMTP giả giống Gmail: trả lời theo từng lệnh, ghi lại mọi thứ client gửi. */
function fakeServer(opts: { authOk?: boolean } = {}) {
  const log: string[] = [];
  let data = "";
  const toClient = new TransformStream<Uint8Array, Uint8Array>({}, { highWaterMark: 64 }, { highWaterMark: 64 });
  const w = toClient.writable.getWriter();
  const say = (s: string) => w.write(enc.encode(s + "\r\n"));
  let inData = false;
  let pending = "";
  const fromClient = new WritableStream<Uint8Array>({
    async write(chunk) {
      pending += dec.decode(chunk);
      let i: number;
      while ((i = pending.indexOf("\r\n")) >= 0) {
        const line = pending.slice(0, i); pending = pending.slice(i + 2);
        if (inData) {
          if (line === ".") { inData = false; await say("250 2.0.0 OK queued"); } else data += line + "\r\n";
          continue;
        }
        log.push(line);
        const cmd = line.split(" ")[0].toUpperCase();
        if (cmd === "EHLO") { await say("250-smtp.gmail.com at your service"); await say("250-AUTH LOGIN PLAIN"); await say("250 SMTPUTF8"); }
        else if (cmd === "AUTH") await say(opts.authOk === false ? "535 5.7.8 Username and Password not accepted" : "235 2.7.0 Accepted");
        else if (cmd === "MAIL" || cmd === "RCPT") await say("250 2.1.0 OK");
        else if (cmd === "DATA") { inData = true; await say("354 Go ahead"); }
        else if (cmd === "QUIT") await say("221 2.0.0 closing");
      }
    }
  });
  const open: Opener = async () => {
    await say("220 smtp.gmail.com ESMTP ready");
    const sock: Duplex = { readable: toClient.readable, writable: fromClient, close: () => {} };
    return sock;
  };
  return { open, log, data: () => data };
}

const cfg = { host: "smtp.gmail.com", port: 465, user: "nhom02@gmail.com", pass: "abcd efgh ijkl mnop".replace(/\s/g, "") };
const mail = { fromName: "AI Lành Nghề", to: "thay.giao@ueh.edu.vn", subject: "Mã đăng nhập AI Lành Nghề: 123456", text: "Mã của bạn là 123456.", html: "<p>Mã: <b>123456</b></p>" };

describe("SMTP", () => {
  it("gửi đủ các bước và đúng người nhận", async () => {
    const s = fakeServer();
    await sendSmtp(cfg, mail, s.open);
    expect(s.log[0]).toBe("EHLO ailanhnghe");
    expect(s.log[1]).toBe("AUTH PLAIN " + b64("\u0000nhom02@gmail.com\u0000abcdefghijklmnop"));
    expect(s.log).toContain("MAIL FROM:<nhom02@gmail.com>");
    expect(s.log).toContain("RCPT TO:<thay.giao@ueh.edu.vn>");
    expect(s.data()).toContain("Subject: =?UTF-8?B?" + b64(mail.subject) + "?=");
    expect(s.data()).toContain(b64(mail.text));
  });

  it("báo lỗi rõ khi Gmail từ chối mật khẩu", async () => {
    const s = fakeServer({ authOk: false });
    await expect(sendSmtp(cfg, mail, s.open)).rejects.toThrow(/535/);
  });

  it("thư có tiếng Việt mã hóa đúng, không có dòng bắt đầu bằng dấu chấm", () => {
    const msg = buildMessage("nhom02@gmail.com", { ...mail, text: ".bắt đầu bằng dấu chấm" }, new Date(0), "00000000-0000-0000-0000-000000000000");
    expect(msg).toContain("From: =?UTF-8?B?" + b64("AI Lành Nghề") + "?= <nhom02@gmail.com>");
    expect(msg.split("\r\n").some((l) => l.startsWith("."))).toBe(false);
    const part = msg.split("Content-Transfer-Encoding: base64\r\n\r\n")[1].split("\r\n\r\n")[0].replace(/\r\n/g, "");
    expect(new TextDecoder().decode(Uint8Array.from(atob(part), (c) => c.charCodeAt(0)))).toBe(".bắt đầu bằng dấu chấm");
  });
});
