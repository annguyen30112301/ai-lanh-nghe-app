# AI Lành Nghề – Web App: tài liệu bàn giao cho Claude Code

> Dán file này vào thư mục gốc của repo (hoặc đọc nó đầu phiên). Đây là nguồn sự thật cho phiên làm việc.
> Repo: https://github.com/annguyen30112301/ai-lanh-nghe-app (đang trống, nhánh `main`).
> Người làm: Royan (Nguyễn Hoàng Ân). Ngôn ngữ giao diện: **tiếng Việt**. Chỉ giao diện **sáng** (light).
> Skill cần dùng: **`brand-motion-web`** (hệ thiết kế + hiệu ứng rút từ dự án Stroke360). Đọc skill trước khi viết giao diện.

---

## 0. Bối cảnh trong 1 phút

- Đồ án môn Thương mại điện tử (UEH), Nhóm 02. Sản phẩm: **AI Lành Nghề** – ứng dụng web làm việc theo nghề cho người lao động có chuyên môn (khách hàng trọng tâm 40–55 tuổi), bắt đầu từ **nghề Mua hàng**.
- **Định nghĩa dùng thống nhất ở mọi nơi:**
  > AI Lành Nghề là ứng dụng web làm việc theo nghề. Người lao động chọn đúng việc cần làm, điền vài thông tin, tải file lên; app dùng **AI của chính doanh nghiệp/người dùng** (kết nối một lần) để làm theo quy trình nghề do chuyên gia đóng gói, trả kết quả theo mẫu kèm checklist tự kiểm, và đo được thời gian tiết kiệm.
- Hướng cũ “Connector cắm skill vào ChatGPT” **đã bỏ**. Không viết chữ “Connector” ở bất kỳ đâu trong UI.
- Khách **tự trả phí AI** (qua key/tài khoản của họ). AI Lành Nghề thu phí gói nghề: Business 690.000 đ, Business Plus 990.000 đ /người/năm; Cá nhân 0 đ (dùng thử) / 690.000 đ/năm; Tinh chỉnh 1:1: 800.000 đ/lần; Custom 25–80 triệu đ.
- Website cũ (HTML thuần, GitHub Pages): `https://annguyen30112301.github.io/ai-lanh-nghe/`, mã nguồn ở repo https://github.com/annguyen30112301/ai-lanh-nghe nhánh `main` (bản trên máy Royan đã cũ, dừng 16/09) (các trang: index, goi-nghe, nghe-mua-hang, nghe-giang-day, bang-gia, gio-hang, thanh-toan, an-toan, tai-nguyen, dung-thu, do-gio, bang-dieu-khien). Dùng làm **nguồn nội dung**; giao diện làm mới theo skill.

## 1. Mốc thời gian (cứng)

| Ngày | Mốc |
|---|---|
| 16/10 | Khung dự án deploy được lên Cloudflare (trang chủ + đăng nhập chạy) |
| 17/10 | Bảng chi phí kỹ thuật (mục 12) gửi phần tài chính |
| **20/10** | **Demo chạy trọn 1 luồng Mua hàng** (mục 11 – Definition of Done) |
| 23/10 | Ảnh chụp 8 màn hình sạch (dữ liệu giả) cho báo cáo |
| 26/10 | Trang chủ + “Cách hoạt động” + video demo 90 giây |
| 28/10 20h | **Khóa demo** – không deploy sau mốc này |
| 30/10 18h | Báo cáo online, demo trực tiếp ≤ 2 phút |

Nguyên tắc phạm vi: **làm demo đủ để chứng minh**, không làm sản phẩm hoàn chỉnh. Nếu 18/10 chưa xong luồng “So sánh báo giá” thì bỏ tình huống 3.

## 2. Stack và hạ tầng (đã chốt)

- **Astro 7** + **React 19** (islands) + **Tailwind CSS 4** + **Motion** (`motion`) + **Phosphor Icons** – giống Stroke360 (xem skill).
- **Cloudflare Pages** + adapter `@astrojs/cloudflare` (kiểm tra phiên bản tương thích Astro 7).
  - Trang marketing và vỏ app: **prerender** (tĩnh).
  - API: `src/pages/api/**.ts` chạy trên Workers runtime (`export const prerender = false`).
  - Lý do: Workers Free có **10 ms CPU/request** (chờ mạng không tính) → không render SSR nặng, **không parse file trên server**.
- **D1** (SQLite) cho dữ liệu. **Không dùng R2** ở MVP (không lưu file).
- **WebCrypto AES-256-GCM** để mã hóa API key (không cần thư viện).
- **Resend** gửi mã OTP đăng nhập qua email (kiểm tra hạn mức miễn phí hiện tại). Khi chạy local: in mã OTP ra console.
- **OpenRouter** (OAuth PKCE) để người dùng kết nối AI một chạm; **Gemini API** cho phương án dán key miễn phí.
- **Deploy:** GitHub Actions → `wrangler pages deploy` khi push `main`. Không deploy tay.

### Biến môi trường / Secrets (Royan tự dán vào GitHub Secrets + Cloudflare)

| Tên | Dùng cho |
|---|---|
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions deploy |
| `KEY_ENC_SECRET` | 32 byte base64 – khóa AES-GCM mã hóa API key |
| `SESSION_SECRET` | ký cookie phiên |
| `RESEND_API_KEY`, `MAIL_FROM` | gửi OTP |
| `TRIAL_PROVIDER`, `TRIAL_API_KEY` | key của nhóm cho 5 lượt dùng thử (OpenRouter hoặc Gemini) |
| `APP_ORIGIN` | ví dụ `https://ai-lanh-nghe-app.pages.dev` (dùng cho callback OpenRouter) |

Không bao giờ commit secret. Có `.dev.vars.example` liệt kê tên biến.

## 3. Cấu trúc thư mục đề xuất

```
src/
  content/       vi.ts (toàn bộ chữ), types.ts
  skills/        procurement/*.json   ← Skill Engine: định nghĩa tình huống (chỉ import ở server)
  lib/           crypto.ts, session.ts, db.ts, mask.ts, ai-gateway.ts, openrouter.ts, telemetry.ts
  pages/
    index.astro, cach-hoat-dong.astro, goi-nghe.astro, bang-gia.astro, an-toan.astro
    app/ (vỏ app tĩnh: dang-nhap, ket-noi-ai, tinh-huong, lam-viec, ket-qua, bang-dieu-khien, quan-tri)
    api/ (auth/*, ai/*, run/*, dashboard/*, admin/*)
  islands/       React: WorkSession, MaskPreview, ResultTable, Checklist, ConnectAI, Dashboard…
  components/    Icon, Words, Counter, PageIntro, Photo
  layouts/       Base.astro (marketing), AppShell.astro (app)
  styles/        global.css (token theo skill, màu AI Lành Nghề)
migrations/      0001_init.sql
.github/workflows/deploy.yml
wrangler.toml (binding D1 = DB)
```

## 4. Dữ liệu (D1) – `migrations/0001_init.sql`

```sql
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, created_at INTEGER NOT NULL);
CREATE TABLE otp_codes (email TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, attempts INTEGER DEFAULT 0);
CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL, device TEXT);
CREATE TABLE organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, plan TEXT NOT NULL CHECK(plan IN ('personal','business','business_plus')), seats INTEGER DEFAULT 1, expires_at INTEGER);
CREATE TABLE members (org_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','member')), status TEXT NOT NULL DEFAULT 'active', PRIMARY KEY (org_id, user_id));
CREATE TABLE ai_connections (org_id TEXT PRIMARY KEY, source TEXT NOT NULL CHECK(source IN ('openrouter_oauth','gemini_key','company_key')), provider TEXT NOT NULL, key_ciphertext TEXT NOT NULL, key_iv TEXT NOT NULL, key_last4 TEXT NOT NULL, verified_at INTEGER);
CREATE TABLE oauth_states (state TEXT PRIMARY KEY, user_id TEXT NOT NULL, code_verifier TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE trial_usage (user_id TEXT PRIMARY KEY, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE baselines (user_id TEXT NOT NULL, scenario_id TEXT NOT NULL, manual_minutes INTEGER NOT NULL, PRIMARY KEY (user_id, scenario_id));
-- KHÔNG có cột nội dung. Dashboard tính từ bảng này.
CREATE TABLE runs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, org_id TEXT NOT NULL, scenario_id TEXT NOT NULL,
  opened_at INTEGER, submitted_at INTEGER, result_at INTEGER, exported_at INTEGER,
  edits INTEGER DEFAULT 0, checklist_done INTEGER DEFAULT 0, checklist_total INTEGER DEFAULT 0,
  masked_items INTEGER DEFAULT 0, tokens_in INTEGER, tokens_out INTEGER, via_trial INTEGER DEFAULT 0, status TEXT);
CREATE INDEX runs_org ON runs(org_id, opened_at);
```
Seed: 1 org cá nhân demo, 1 org doanh nghiệp giả “Cơ khí Tân Phú” 15 seat với ~120 runs mẫu trải 4 tuần (cho Business Dashboard).

## 5. API

| Method | Path | Việc |
|---|---|---|
| POST | /api/auth/request-otp | {email} → tạo mã 6 số, băm SHA-256, hết hạn 10 phút, gửi Resend. Giới hạn 5 lần/giờ/email |
| POST | /api/auth/verify-otp | {email, code} → tạo user/org cá nhân nếu mới, set cookie phiên (HttpOnly, Secure, SameSite=Lax) |
| POST | /api/auth/logout | |
| GET | /api/me | user, org, vai trò, trạng thái kết nối AI (chỉ `source`, `provider`, `key_last4`), số lượt thử còn |
| GET | /api/ai/connect | tạo `state` + `code_verifier` (PKCE S256), lưu `oauth_states`, redirect `https://openrouter.ai/auth?callback_url=…&code_challenge=…&code_challenge_method=S256` |
| GET | /api/ai/callback | nhận `code`, POST `https://openrouter.ai/api/v1/auth/keys` {code, code_verifier, code_challenge_method}, mã hóa key, lưu, redirect `/app/tinh-huong/` |
| POST | /api/ai/key | {source:'gemini_key'|'company_key', key} → gọi thử 1 request rất nhỏ, ok thì mã hóa + lưu. Chỉ admin được gắn `company_key` |
| DELETE | /api/ai/key | gỡ kết nối |
| GET | /api/scenarios | danh sách tình huống (id, tên, mô tả, ô nhập, checklist, phút tham chiếu) – **không trả prompt** |
| POST | /api/run/start | {scenario_id} → tạo run, `opened_at` |
| POST | /api/run/preview-mask | {run_id, fields, file_texts, marked_terms[]} → trả bản đã che + bảng đếm (không lưu) |
| POST | /api/run/execute | {run_id, fields, file_texts, marked_terms[]} → che → ghép prompt từ skill JSON → gọi AI Gateway → bỏ che → trả kết quả (JSON có cấu trúc). Cập nhật `submitted_at`, `result_at`, token, `via_trial` |
| POST | /api/run/event | {run_id, type:'edit'|'check'|'export', value} → cập nhật đếm |
| POST | /api/baseline | {scenario_id, manual_minutes} |
| GET | /api/dashboard/personal | số lượt, thời gian TB/tình huống, phút tiết kiệm ước tính, tình huống dùng nhiều |
| GET | /api/dashboard/business | (admin) mức áp dụng theo người & tuần, top tình huống, tổng phút tiết kiệm |
| GET/POST | /api/admin/seats | danh sách, mời (không gửi mail thật ở MVP), thu hồi, chuyển seat |

Mọi route kiểm tra phiên. Route `org` kiểm tra membership. Trả lỗi tiếng Việt rõ ràng.

## 6. Skill Engine – định dạng tình huống

`src/skills/procurement/so-sanh-bao-gia.json` (tương tự cho `thu-thuong-luong.json`, `tom-tat-ho-so-ncc.json`):

```json
{
  "id": "so-sanh-bao-gia",
  "name": "So sánh báo giá",
  "summary": "Đặt các báo giá cạnh nhau theo cùng tiêu chí và đề xuất nhà cung cấp.",
  "manual_minutes_ref": 45,
  "inputs": [
    { "key": "item", "label": "Bạn đang mua gì?", "type": "text", "example": "Thép tấm SS400 dày 10mm" },
    { "key": "priority", "label": "Ưu tiên của bạn", "type": "select", "options": ["Giá thấp nhất", "Giao nhanh", "Thanh toán linh hoạt", "Cân bằng"] },
    { "key": "quotes", "label": "Tải báo giá (Excel hoặc PDF có chữ)", "type": "files", "min": 2, "max": 4 }
  ],
  "system": "…(prompt hệ thống: vai trò chuyên viên mua hàng VN, quy tắc, không bịa số, đánh dấu chỗ thiếu dữ liệu)…",
  "template": "…(mẫu prompt có {item} {priority} {quotes_text})…",
  "output": { "kind": "table", "columns": ["Tiêu chí", "NCC_1", "NCC_2", "NCC_3"], "rows_required": ["Đơn giá", "Tổng giá trị", "Điều khoản thanh toán", "Thời gian giao", "Bảo hành", "Rủi ro"], "extras": ["de_xuat", "thu_thuong_luong_goi_y"] },
  "checklist": ["Đơn vị tính đã giống nhau", "Giá đã cùng điều kiện VAT", "Đã kiểm tra thời hạn hiệu lực báo giá", "Điều khoản thanh toán đã đọc kỹ", "Đề xuất có lý do rõ ràng", "Không còn thông tin mật trong file xuất"]
}
```

- File JSON **chỉ import ở server** (`src/lib`/API). `GET /api/scenarios` lọc bỏ `system`, `template`.
- Yêu cầu AI trả **JSON** theo `output` (kiểm tra schema, lỗi thì thử lại 1 lần, vẫn lỗi thì báo người dùng).
- Nội dung nghiệp vụ 3 tình huống: viết nháp, cần người có kinh nghiệm mua hàng duyệt trước 19/10.

## 7. Lớp ẩn danh (`src/lib/mask.ts`)

- Quy tắc regex (tiếng Việt): số điện thoại VN, email, mã số thuế (10 hoặc 10-3 chữ số), CCCD (12 số), số tài khoản (9–16 số liền), số tiền kèm “đ/VNĐ/triệu” (tùy chọn – mặc định **không** che giá vì cần để so sánh; người dùng tự đánh dấu nếu muốn).
- Từ người dùng đánh dấu (tên nhà cung cấp, tên công ty, người liên hệ) → thay bằng nhãn ổn định `[NCC_1]`, `[CONG_TY]`, `[NGUOI_1]`…
- Trả `{ masked_text, map }`; sau khi AI trả kết quả thì `unmask` bằng `map` (chỉ trong bộ nhớ request, **không lưu**).
- Viết test cho mask/unmask (Vitest).

## 8. Đọc file (phía trình duyệt)

- Excel: SheetJS → chuyển mỗi sheet thành bảng chữ (TSV) – giới hạn ~200 dòng/file.
- PDF: `pdfjs-dist` lấy lớp chữ; nếu không có chữ → báo “Hãy tải file Excel hoặc PDF có thể chọn chữ”.
- Chỉ gửi **văn bản đã trích** lên API, không gửi file.

## 9. Xuất file

- Bảng so sánh → Excel (SheetJS, phía trình duyệt). Thư thương lượng / tóm tắt → Word (`docx` npm, phía trình duyệt).
- Nút Xuất **chỉ bật khi tick đủ checklist**. Gửi `run/event export`.

## 10. Giao diện

**Đọc skill `brand-motion-web` trước.** Token cho AI Lành Nghề:

| Token | Giá trị | Ghi chú |
|---|---|---|
| `--accent` | `#5A3B0A` (nâu) | nút chính, điều hướng |
| `--accent-2` | `#7D5411` (vàng đồng) | trạng thái “đã duyệt”, checklist |
| `--paper` | `#FAF3EC` | **chỉ** nền vùng làm việc (bàn làm việc) |
| `--canvas` | `#F6F5F3` / `--raised` `#FFFFFF` | nền app, bảng |
| `--ink` | `#201F1D` | chữ |
| `--masked` | `#1F5E4A` (xanh lá đậm) | **chỉ** dùng cho dữ liệu đã che |
| `--urgent` | đỏ gạch đậm | lỗi/cảnh báo, không dùng trang trí |
| Font | **Lexend** (@fontsource/lexend, hỗ trợ tiếng Việt) | thân chữ ≥ 18px, một họ chữ |

Không: nền kem phủ toàn trang, serif tiêu đề, eyebrow chữ in hoa, thẻ giống hệt nhau, chế độ tối.

**Màn hình app (8):**
1. Đăng nhập (email → OTP 6 ô).
2. Kết nối AI: nút lớn “Kết nối AI một chạm (OpenRouter)”; phụ: “Dùng key Gemini miễn phí” (dán key + hướng dẫn 3 bước), admin: “Gắn key công ty”. Hiện trạng thái `••••x9f`.
3. Chọn tình huống: 3 tình huống Mua hàng (ghi “thường mất ~45 phút”), các nghề khác “sắp ra mắt”.
4. Làm việc: form tối đa 3 bước (slide giữa bước như `PackagePicker`), tải file, đánh dấu tên cần che; **khung xem trước “Dữ liệu sẽ gửi lên AI”**.
5. Kết quả + checklist + xuất.
6. Personal Dashboard.
7. Business Dashboard + quản lý seat (dữ liệu seed).
8. Xác thực thiết bị mới (SMS OTP) – **chỉ giao diện**.

**Khoảnh khắc chuyển động (theo skill: dồn vào nơi trả lời hành động người dùng):**
- **Che dữ liệu (điểm nhấn của demo):** bấm “Bắt đầu so sánh” → khung xem trước mở ra; từng tên/thông tin nhạy cảm **chuyển dần thành nhãn màu `--masked`** (layout animation, lệch nhịp 60–80 ms), bộ đếm “Đã che 7 thông tin” chạy lên. Sau đó trạng thái “Đang gửi lên AI của công ty bạn”.
- **Kết quả về:** bảng hiện từng dòng; nhãn `[NCC_1]` đổi lại tên thật (crossfade).
- **Checklist:** tick có phản hồi lò xo; đủ thì nút Xuất “bật” lên (layout + màu).
- **Dashboard:** `Counter` đếm lên một lần.
- **Trang chủ:** hero kể chuyện theo cuộn “Sáng thứ Hai của chị Lan” (khuôn `HeroDay`: đồng hồ 08:00 → 08:18; 3 báo giá → che dữ liệu → bảng → xuất) – **khoảnh khắc chủ đạo duy nhất** của trang; `ComparePanel` “ChatGPT tự dùng ↔ AI Lành Nghề”; `Counter` cho số liệu.
- Chuyển trang: View Transitions + `nav-pill`. Tôn trọng `prefers-reduced-motion`. Không fade-up cho mọi khối.

**Website (marketing + TMĐT):** làm theo file **`WEBSITE_PLAN_AI-LanhNghe.md`** (sơ đồ trang, nội dung từng trang, lỗi nội dung site cũ phải sửa, mốc riêng). Website cũ giữ nguyên, thêm banner chuyển hướng sang website mới.

## 11. Definition of Done (kiểm 20/10)

- [ ] Đăng ký mới → dùng thử 1 lượt → **kết nối OpenRouter một chạm** (và thử dán key Gemini) → chạy đủ 3 tình huống không lỗi.
- [ ] Xuất Word/Excel mở được bình thường.
- [ ] Khung xem trước cho thấy dữ liệu đã che; kết quả hiện lại tên thật.
- [ ] Dashboard hiện đúng lượt và thời gian vừa chạy.
- [ ] Tab Network: **không thấy API key hay prompt hệ thống** trong bất kỳ phản hồi nào.
- [ ] Điện thoại: xem kết quả và dashboard ổn.
- [ ] Link công khai mở được ở cửa sổ ẩn danh. Lighthouse Accessibility ≥ 90.

## 12. Bảng chi phí kỹ thuật (gửi 17/10) – mỗi dòng có nguồn + ngày truy cập

Phát triển MVP (tuần công × đơn giá) · Cloudflare (gói trả phí khi chạy thật) · D1 · Resend · SMS OTP (nhà cung cấp VN, đơn giá/tin) · tên miền · token cho lượt dùng thử (đo token TB/lượt trong demo × giá) · phí AI khách trả qua OpenRouter cho 1 lượt điển hình. Kết quả cần: **hạ tầng bình quân/seat/năm** (đang tạm 70.000 đ).

## 13. Bộ dữ liệu giả cho thử nghiệm A/B (20/10)

`public/demo-data/`: 3 báo giá (2 Excel, 1 PDF có chữ) cho cùng mặt hàng thép tấm, 3 nhà cung cấp giả (tên, MST, SĐT, email giả); 1 hồ sơ năng lực NCC (PDF); 1 bối cảnh thương lượng. Không dùng dữ liệu thật. 6–8 tài khoản thử có sẵn lượt dùng thử.

## 14. Không làm

- Không thanh toán thật, không SMS thật, không gửi email mời seat thật.
- Không lưu nội dung hội thoại/kết quả/file. Không log prompt hay key.
- Không đăng nhập bằng tài khoản ChatGPT Plus / Claude Pro của khách.
- Không dùng dịch vụ có thể tự tạm dừng khi ít dùng (link phải sống đến khi có điểm).
- Không tự viết lại nội dung giá/định nghĩa khác mục 0.

## 15. Thứ tự làm đề xuất

1. Khung Astro + Tailwind + token + Base/AppShell + deploy Actions (lên được trang trắng có thương hiệu).
2. D1 + migrations + auth OTP + phiên.
3. AI Gateway: mã hóa key, dán key Gemini, OpenRouter PKCE, trial 5 lượt.
4. Skill Engine + 3 JSON + `/api/scenarios`.
5. Màn hình làm việc: form, đọc file, đánh dấu tên, mask preview (+ hiệu ứng che).
6. Execute + kết quả + checklist + xuất.
7. Telemetry + Personal Dashboard; seed + Business Dashboard + seats.
8. Website theo `WEBSITE_PLAN_AI-LanhNghe.md` (khung + Bảng giá làm sớm 14–16/10; các trang còn lại 21–25/10).
9. Màn hình SMS OTP (UI), dọn dẹp, kiểm DoD, chụp 8 màn hình.

Sau mỗi bước: commit nhỏ, push để Actions deploy, mở link kiểm tra.
