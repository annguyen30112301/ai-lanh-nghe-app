// Chụp màn hình QA bằng Chrome cài sẵn: node scripts/shots.mjs [baseUrl] [outDir]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const BASE = process.argv[2] || "http://localhost:4321";
const OUT = process.argv[3] || "shots";
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox"] });
const sizes = { d: { width: 1440, height: 900 }, m: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pages = (process.env.PAGES || "/,/cach-hoat-dong/,/goi-nghe/,/bang-gia/,/an-toan/,/app/dang-nhap/").split(",");
for (const [k, vp] of Object.entries(sizes)) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  for (const p of pages) {
    await page.goto(BASE + p, { waitUntil: "load", timeout: 60000 });
    await wait(1500);
    const name = (p.replace(/\//g, "_").replace(/^_|_$/g, "") || "home") + "-" + k;
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: process.env.FULL === "1" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) console.log("NGANG", name, overflow);
    if (p === "/" && process.env.HERO !== "0") {
      for (const f of [0.22, 0.38, 0.55, 0.7, 0.95]) {
        await page.evaluate((f) => { const el = document.querySelector("[class*='h-[340vh]']"); window.scrollTo(0, (el.offsetHeight - innerHeight) * f); }, f);
        await wait(1200);
        await page.screenshot({ path: `${OUT}/hero-${Math.round(f * 100)}-${k}.png` });
      }
    }
  }
  await page.close();
}
await browser.close();
console.log("ok", OUT);
