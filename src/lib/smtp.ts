// Gửi email qua SMTP (mặc định Gmail, cổng 465 TLS) bằng TCP socket của Cloudflare Workers.
// Dùng khi chưa có tên miền riêng: Gmail gửi được tới mọi địa chỉ, miễn phí (giới hạn ~500 thư/ngày).
// Phần giao thức tách khỏi socket để kiểm thử bằng máy chủ giả (tests/smtp.test.ts).

export interface Mail { fromName: string; to: string; subject: string; text: string; html: string }
export interface SmtpConfig { host: string; port: number; user: string; pass: string }
export interface Duplex { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array>; close(): Promise<void> | void }
export type Opener = (host: string, port: number) => Promise<Duplex>;

const enc = new TextEncoder();
const dec = new TextDecoder();

/** base64 của chuỗi UTF-8 (btoa chỉ nhận latin1). */
export function b64(s: string): string {
  let bin = "";
  for (const byte of enc.encode(s)) bin += String.fromCharCode(byte);
  return btoa(bin);
}
const wrap76 = (s: string) => s.replace(/.{1,76}/g, (m) => m + "\r\n");
const word = (s: string) => `=?UTF-8?B?${b64(s)}?=`;

/** Dựng thư MIME multipart/alternative (chữ + HTML), mọi phần mã hóa base64 nên không cần dot-stuffing. */
export function buildMessage(from: string, m: Mail, date = new Date(), id = crypto.randomUUID()): string {
  const boundary = "alt_" + id.replace(/-/g, "");
  const domain = from.split("@")[1] ?? "localhost";
  return [
    `From: ${word(m.fromName)} <${from}>`,
    `To: <${m.to}>`,
    `Subject: ${word(m.subject)}`,
    `Date: ${date.toUTCString().replace("GMT", "+0000")}`,
    `Message-ID: <${id}@${domain}>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(b64(m.text)),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    wrap76(b64(m.html)),
    `--${boundary}--`,
    ""
  ].join("\r\n");
}

class Conn {
  private buf = "";
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  constructor(private sock: Duplex) {
    this.reader = sock.readable.getReader();
    this.writer = sock.writable.getWriter();
  }
  /** Đọc một phản hồi SMTP (có thể nhiều dòng "250-…", kết thúc ở dòng "250 …"). */
  async reply(): Promise<{ code: number; text: string }> {
    for (;;) {
      const lines = this.buf.split("\r\n");
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{3} /.test(lines[i]) || /^\d{3}$/.test(lines[i])) {
          const text = lines.slice(0, i + 1).join("\n");
          this.buf = lines.slice(i + 1).join("\r\n");
          return { code: Number(lines[i].slice(0, 3)), text };
        }
      }
      const { value, done } = await this.reader.read();
      if (done) throw new Error("SMTP: máy chủ đóng kết nối");
      this.buf += dec.decode(value, { stream: true });
    }
  }
  async send(line: string) { await this.writer.write(enc.encode(line + "\r\n")); }
  async expect(line: string | null, ok: number[]) {
    if (line !== null) await this.send(line);
    const r = await this.reply();
    if (!ok.includes(r.code)) throw new Error(`SMTP ${r.code}: ${r.text.slice(0, 200)}`);
    return r;
  }
  async close() {
    try { this.reader.releaseLock(); this.writer.releaseLock(); } catch { /* bỏ qua */ }
    try { await this.sock.close(); } catch { /* bỏ qua */ }
  }
}

/** Gửi một thư. Ném lỗi nếu máy chủ từ chối ở bất kỳ bước nào. */
export async function sendSmtp(cfg: SmtpConfig, m: Mail, open: Opener, timeoutMs = 15_000): Promise<void> {
  const sock = await open(cfg.host, cfg.port);
  const c = new Conn(sock);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error("SMTP: quá thời gian")), timeoutMs); });
  try {
    await Promise.race([timeout, (async () => {
      await c.expect(null, [220]);
      await c.expect("EHLO ailanhnghe", [250]);
      await c.expect("AUTH PLAIN " + b64(`\u0000${cfg.user}\u0000${cfg.pass}`), [235]);
      await c.expect(`MAIL FROM:<${cfg.user}>`, [250]);
      await c.expect(`RCPT TO:<${m.to}>`, [250, 251]);
      await c.expect("DATA", [354]);
      await c.expect(buildMessage(cfg.user, m) + "\r\n.", [250]);
      await c.send("QUIT").catch(() => {});
    })()]);
  } finally {
    clearTimeout(timer);
    await c.close();
  }
}
