# AI Lành Nghề – Web App (demo)

Đồ án Thương mại điện tử UEH – Nhóm 02. Ứng dụng web làm việc theo nghề, bắt đầu từ nghề **Mua hàng**:
chọn việc → điền vài ô → tải file → **che dữ liệu nhạy cảm** → AI của chính người dùng làm theo quy trình → checklist → xuất Excel/Word → đo thời gian tiết kiệm.

Tài liệu: [`docs/HANDOFF_AI-LanhNghe-App.md`](docs/HANDOFF_AI-LanhNghe-App.md) (Web App) · [`docs/WEBSITE_PLAN_AI-LanhNghe.md`](docs/WEBSITE_PLAN_AI-LanhNghe.md) (Website). Đọc skill `brand-motion-web` trước khi làm giao diện.

Stack: Astro 7 + React 19 (islands) + Tailwind 4 + Motion + Phosphor · Cloudflare **Workers** (static assets) + D1 · WebCrypto AES-256-GCM · Resend · OpenRouter PKCE / Gemini.

> Ghi chú so với HANDOFF: `@astrojs/cloudflare` v14 (bản hỗ trợ Astro 7) chỉ deploy lên **Workers**, không còn Pages.
> Gói Free vẫn 10 ms CPU/request; trang tĩnh phục vụ từ static assets (không tốn CPU). Lệnh deploy là `wrangler deploy`.

## Chạy ở máy

```bash
npm install
cp .dev.vars.example .dev.vars        # điền KEY_ENC_SECRET, SESSION_SECRET (32 byte base64)
npm run db:migrate:local
npm run db:seed:local                 # Cơ khí Tân Phú 15 seat + ~120 lượt mẫu + 8 tài khoản thử
npm run dev                           # http://localhost:4321
```

- Không có key AI và `AI_MOCK=1` → kết quả **mô phỏng** (để thử giao diện).
- Email đuôi `@ailanhnghe.demo` (vd. `lan@…`, `hung@…`, `thu1@…`–`thu8@…`) nhận mã OTP ngay trên màn hình, không gửi mail.
- `npm test` – test lớp che dữ liệu (Vitest).
- `node scripts/e2e.mjs` – chạy trọn luồng bằng Chrome cài sẵn, chụp 8 màn hình.
- `node scripts/make-seed.mjs` / `node scripts/make-demo-data.mjs` – sinh lại seed và bộ báo giá giả trong `public/demo-data/`.

## Deploy (GitHub Actions → Cloudflare)

Một lần, trên máy có đăng nhập Cloudflare:

```bash
npx wrangler login
npx wrangler d1 create ai-lanh-nghe          # đã tạo: id nằm trong wrangler.jsonc
```

GitHub → Settings → Secrets and variables → Actions:

| Secret | Ghi chú |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token quyền *Workers Scripts: Edit* + *D1: Edit* |
| `CLOUDFLARE_ACCOUNT_ID` | |
| `KEY_ENC_SECRET`, `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `RESEND_API_KEY` | không bắt buộc (không có thì chỉ đăng nhập được bằng tài khoản demo) |
| `TRIAL_API_KEY` | key cho 5 lượt dùng thử: key Gemini miễn phí (AIza…) hoặc key OpenRouter |

Variable `TRIAL_PROVIDER` = `gemini` nếu `TRIAL_API_KEY` là key Gemini (mặc định `openrouter`). Tùy chọn `OPENROUTER_MODEL` (vd. một mô hình `:free`).

Variable `APP_ORIGIN` = URL thật sau lần deploy đầu (vd. `https://ai-lanh-nghe-app.<subdomain>.workers.dev`) – dùng cho callback OpenRouter.

Push `main` → Actions tự test, build, migrate D1, deploy, đồng bộ secrets.

Nạp dữ liệu mẫu lên D1 thật: Actions → **Nạp dữ liệu mẫu** → Run workflow → gõ `XOA-VA-NAP`. Mốc thời gian được tạo lại tính từ hôm nay (chạy lại trước buổi báo cáo).

## Cấu trúc

```
src/content/      vi.ts (toàn bộ chữ), types.ts
src/skills/       procurement/*.json – định nghĩa tình huống + prompt (chỉ import ở server)
src/lib/          mask.ts (che/bỏ che), crypto.ts, session.ts, ai-gateway.ts, openrouter.ts, run.ts, stats.ts…
                  files.ts, export.ts, client.ts (chạy ở trình duyệt)
src/pages/api/    auth/*, ai/*, run/*, dashboard/*, admin/seats, me, scenarios, baseline
src/pages/app/    dang-nhap, ket-noi-ai, tinh-huong, lam-viec, bang-dieu-khien, quan-tri, xac-thuc-thiet-bi
src/islands/      WorkSession, MaskPreview, ResultView, Checklist, ConnectAI, Dashboard, Business, HeroDay…
migrations/       0001_init.sql   ·   db/seed.sql
```

Không lưu file, nội dung hay kết quả: bảng `runs` chỉ có mốc thời gian và số đếm. Prompt hệ thống và key không bao giờ trả về trình duyệt.
