// Chạy thử trọn luồng app bằng Chrome cài sẵn + chụp 8 màn hình.
// node scripts/e2e.mjs [baseUrl] [outDir] [email]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const BASE = process.argv[2] || "http://localhost:4321";
const OUT = process.argv[3] || "shots-app";
const EMAIL = process.argv[4] || "thu2@ailanhnghe.demo";
const SC = process.env.SC || "so-sanh-bao-gia";
mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: Number(process.env.W || 1440), height: Number(process.env.H || 900) });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
page.on("console", (m) => m.type() === "error" && console.log("CONSOLE", m.text()));
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });
const clickText = async (txt) => {
  const ok = await page.evaluate((t) => { const el = [...document.querySelectorAll("button,a")].find((b) => b.textContent.trim().includes(t) && !b.disabled); if (el) { el.click(); return true; } return false; }, txt);
  if (!ok) throw new Error("Không thấy nút: " + txt);
};
const go = (p) => page.goto(BASE + p, { waitUntil: "load", timeout: 60000 });

await go("/app/dang-nhap/"); await wait(1500);
await page.type("#email", EMAIL); await shot("1-dang-nhap");
await clickText("Gửi mã đăng nhập"); await wait(1500);
await clickText("mã của bạn là"); await page.waitForNavigation({ timeout: 30000 }); await wait(2000);
console.log("sau đăng nhập:", page.url());
await go("/app/ket-noi-ai/"); await wait(2000); await shot("2-ket-noi-ai");
await go("/app/tinh-huong/"); await wait(2000); await shot("3-tinh-huong");
await go(`/app/lam-viec/?s=${SC}`); await wait(2500);
await clickText("Tiếp tục").catch(() => {}); await wait(400);
const err1 = await page.evaluate(() => document.querySelector("[role=alert]")?.textContent); console.log("báo lỗi khi bỏ trống:", err1);
// nạp dữ liệu mẫu ở bước tài liệu (tự điền luôn ô bước 1)
await page.evaluate(() => {}); 
const steps = await page.$$eval("ol[aria-label='Các bước'] li", (l) => l.length);
// quay về bước 1 nếu cần là không cần: dữ liệu mẫu tự điền
// đi tới bước tài liệu bằng cách điền tạm
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("Quay lại")); b?.click(); });
await wait(300);
// điền bước 1 bằng dữ liệu mẫu: nhảy thẳng qua nút demo cần bước 2 → điền nhanh các ô bắt buộc
await page.evaluate(() => {
  for (const el of document.querySelectorAll("input.field, textarea.field")) {
    const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set; set.call(el, el.placeholder.replace(/^Ví dụ: /, "") || "x"); el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  document.querySelectorAll("[role=radiogroup]").forEach((g) => g.querySelector("[role=radio]")?.click());
});
await wait(300); await shot("4a-lam-viec-buoc1");
await clickText("Tiếp tục"); await wait(800);
if (steps === 3) {
  await clickText("Dùng bộ báo giá mẫu").catch(() => clickText("Chưa có file"));
  await wait(5000); await shot("4b-lam-viec-tai-lieu");
  console.log("files:", await page.$$eval("ul[aria-live=polite] li", (l) => l.map((x) => x.textContent.slice(0, 60))));
  await clickText("Tiếp tục"); await wait(800);
}
await shot("4c-lam-viec-che");
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /^Bắt đầu/.test(b.textContent.trim()))?.click());
await wait(1600); await shot("4d-che-du-lieu");
await page.waitForFunction(() => document.querySelector("#res-title") || document.querySelector("[role=alert]"), { timeout: 120000 });
await wait(2500);
const alert = await page.evaluate(() => document.querySelector("[role=alert]")?.textContent);
if (alert) console.log("LỖI:", alert);
await shot("5a-ket-qua");
const n = await page.$$eval("button[role=checkbox]", (b) => b.length);
for (let i = 0; i < n; i++) { await page.evaluate((i) => document.querySelectorAll("button[role=checkbox]")[i].click(), i); await wait(150); }
await wait(800); await shot("5b-checklist-du");
const client = await page.createCDPSession();
await client.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: OUT }).catch(() => {});
await clickText("Xuất"); await wait(3000);
console.log("đã xuất:", await page.evaluate(() => document.body.innerText.includes("Đã xuất file")));
await go("/app/bang-dieu-khien/"); await wait(3000); await shot("6-bang-dieu-khien");
await go("/app/xac-thuc-thiet-bi/"); await wait(1500); await shot("8-xac-thuc-thiet-bi");
await browser.close();
console.log("ok");
