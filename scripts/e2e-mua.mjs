// Chạy thử luồng mua: vào từ nút Dùng thử của website → đặt mua (chưa đăng nhập thì bị chặn) → thanh toán mô phỏng
// → license cấp ngay → trang Tài khoản. Chụp màn hình từng bước.
// CHROME=/đường/dẫn/chrome node scripts/e2e-mua.mjs [baseUrl] [outDir] [email] [goi]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const BASE = process.argv[2] || "http://localhost:4321";
const OUT = process.argv[3] || "shots-app";
const EMAIL = process.argv[4] || "thu3@ailanhnghe.demo";
const GOI = process.argv[5] || "personal";
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: Number(process.env.W || 1440), height: Number(process.env.H || 900) });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });
const clickText = async (txt) => {
  const ok = await page.evaluate((t) => { const el = [...document.querySelectorAll("button,a")].find((b) => b.textContent.trim().includes(t) && !b.disabled); if (el) { el.click(); return true; } return false; }, txt);
  if (!ok) throw new Error("Không thấy nút: " + txt);
};
const text = () => page.evaluate(() => document.body.innerText);
const go = (p) => page.goto(BASE + p, { waitUntil: "load", timeout: 60000 });

// 1. Chưa đăng nhập: bước 1 của đặt mua yêu cầu đăng nhập
await go(`/dat-mua/?goi=${GOI}&seat=12`); await wait(2000); await shot("m1-dat-mua-chua-dang-nhap");
await clickText("Đăng nhập để tiếp tục"); await page.waitForNavigation({ timeout: 30000 }); await wait(1500);
console.log("chuyển sang:", page.url());
// 2. Đăng nhập, quay lại đúng đơn
await page.type("#email", EMAIL);
await clickText("Gửi mã đăng nhập"); await wait(1500);
await clickText("mã của bạn là"); await page.waitForNavigation({ timeout: 30000 }); await wait(2500);
console.log("sau đăng nhập:", page.url());
await clickText("Tiếp tục"); await wait(1200);
await page.type("#name", "Nguyễn Thử"); await page.type("#phone", "0903123456");
if (GOI !== "personal") {
  await page.type("#company", "Công ty Thử"); await page.type("#tax", "0312345678");
  await page.type("#invoiceEmail", "ketoan@congty.vn"); await page.type("#address", "12 Nguyễn Văn Bảo, Gò Vấp");
}
await shot("m2-thong-tin");
await clickText("Tiếp tục"); await wait(1200);
// 3. Thanh toán mô phỏng: loading rồi thành công
await clickText("Thanh toán"); await wait(900); await shot("m3-dang-thanh-toan");
await wait(3500); await shot("m4-thanh-cong");
console.log("thành công:", (await text()).includes("Đặt mua thành công"));
// 4. Trang Tài khoản: license đang hiệu lực
await go("/app/tai-khoan/"); await wait(2000); await shot("m5-tai-khoan");
console.log("license hiệu lực:", (await text()).includes("Đang hiệu lực"));
// 5. Website → nút Dùng thử khi đã đăng nhập: vào thẳng app
await go("/app/dang-nhap/?from=site"); await wait(2500);
console.log("dùng thử khi đã đăng nhập →", page.url());
await browser.close();
console.log("ok");
