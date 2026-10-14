# Kế hoạch làm lại website AI Lành Nghề (khuôn Stroke360 + sửa theo góp ý)

> Dùng cùng `HANDOFF_AI-LanhNghe-App.md` và skill **`brand-motion-web`**. File này chỉ nói về **website** (phần giới thiệu, bán hàng, TMĐT). Web App (`/app/`) theo file HANDOFF.
> Repo: https://github.com/annguyen30112301/ai-lanh-nghe-app · Website và Web App nằm chung một dự án Astro, chung hệ thiết kế, deploy Cloudflare Pages.
> Website cũ (nguồn nội dung, **không** sửa tiếp): repo https://github.com/annguyen30112301/ai-lanh-nghe, nhánh `main` (commit `a8c9d7f`, 04/10/2026) – chạy tại https://annguyen30112301.github.io/ai-lanh-nghe/
> **Lấy nội dung từ GitHub, không lấy từ thư mục trên máy** (`TMĐT/source code website/ai-lanh-nghe/` dừng ở 16/09, thiếu giỏ hàng, bộ tính tiền, video, sửa giá ngày 01/10).
> Cập nhật 14/10/2026: đối chiếu lại với bản GitHub (mục 0, mục 3, mục 4, mục 5.4, 5.6, 5.7, mục 9).

---

## 0. Trạng thái repo website cũ (kiểm 14/10/2026)

**Nhánh:** `main` mới nhất 04/10 (“Cập nhật Video 2 bản mới (2:01) và phụ đề”). Ba nhánh `claude/*`:

| Nhánh | Tình trạng | Xử lý |
|---|---|---|
| `claude/affectionate-pascal-ofsc0f` | Đã gộp vào `main` (PR #1, 01/10) | Xóa được |
| `claude/laughing-ptolemy-rotwa4` | Không khác `main` | Xóa được |
| `claude/wizardly-allen-n9fvnf` | Chưa gộp: `docs/ke-hoach-backend.md` (24–25/09), kế hoạch backend theo hướng **Connector + extension** – đã lỗi thời | Không gộp. Chỉ tham khảo phần OTP và đo phiên làm việc nếu cần |

**Những gì site cũ đã có, nên mang sang site mới (không làm lại từ đầu):**

| Thành phần | Tệp | Giá trị cho site mới |
|---|---|---|
| **Bộ tính tiền** (gói nghề, seat, ưu đãi quy mô và mở rộng nghề, mua thêm theo ngày còn lại, gia hạn) + **kiểm thử** | `assets/js/tinh-tien.js`, `tests/tinh-tien.test.js` (chạy `node --test`) | Chuyển sang TypeScript `src/lib/pricing.ts`, giữ nguyên bộ test. Dùng cho Bảng giá, Đặt mua, và phía máy chủ khi cấp license |
| **Giỏ hàng** cá nhân / doanh nghiệp (nhóm seat, hóa đơn từng dòng, “Xem từng bước”) | `gio-hang.html`, `assets/js/gio-hang.js` | Gộp vào wizard `/dat-mua/` (bước 1) |
| **Bàn thử việc**: 6 tình huống mockup, mỗi tình huống có **lỗi cài sẵn** khách phải tự bắt, checklist chỉ tick được khi đã sửa | `dung-thu.html`, `assets/js/dung-thu*.js` | Giữ thành trang `/dung-thu/` (không cần đăng nhập). Chính là bằng chứng “checklist + con người duyệt” cho câu hỏi “hơn ChatGPT ở đâu”. Nút cuối dẫn sang `/app/` |
| **Video 2** giới thiệu (2:01, phụ đề .vtt, poster) | `assets/video/` | Nhúng lại ở `/nghe/mua-hang/`; khi có video demo Web App 90 giây thì video 2 lùi xuống |
| **Danh mục nghề**: 31 gói, 155 tình huống (5 loại việc/gói), tìm kiếm không dấu, xem trước, nút đăng ký qua Google Form (33 lựa chọn) | `assets/data/nghe.json`, `assets/js/nghe-tiep-theo.js` | Giữ làm khối **“Nghề đang lấy ý kiến”** ở `/goi-nghe/` (thu khách tiềm năng), nhưng đổi trạng thái (xem W5) |
| **Bảng điều khiển doanh nghiệp** 5 màn hình (mức áp dụng, theo nhân sự, trước–sau, hàng chờ kiểm duyệt, tuân thủ) | `bang-dieu-khien.html`, `site.js` (`STAFF`, `QUEUE`) | Port thành island ở `/doanh-nghiep/` và làm mẫu cho Business Dashboard của app |
| Ảnh đã nén WebP (27 ảnh) + logo | `assets/img/` | Dùng lại qua component `Photo`; ảnh AI ghi chú nguồn |

**Đã tốt hơn bản trên máy (không cần sửa nữa):** giá thấp nhất đã là 690.000 / 800.000 (không còn 590/600 ở Bảng giá); đã có **Business Plus 990.000 đ** và Custom 25–80 triệu; số liệu giả đã gắn nhãn “Số liệu minh họa”.

## 1. Mục tiêu

1. Người xem hiểu **trong 30 giây đầu**: AI Lành Nghề là gì, chạy ở đâu, khác ChatGPT ở đâu (góp ý lớn nhất của thầy và 5 nhóm).
2. Thể hiện đủ **khía cạnh TMĐT** để chấm mục “Hệ thống đề xuất”: xem gói → so giá → đặt mua → thanh toán (mô phỏng) → nhận license → vào app.
3. Mọi con số, giá, định nghĩa **khớp báo cáo**. Không còn số liệu không có nguồn.
4. Giao diện chuyên nghiệp, chuyển động tốt theo khuôn Stroke360, ít chữ, dễ đọc cho người 40+.

## 2. Góp ý liên quan đến website và cách xử lý

| Góp ý | Nguồn | Xử lý trên website mới |
|---|---|---|
| Chưa rõ chức năng hệ thống; web chưa thể hiện các chức năng chính; video chưa rõ chức năng AI; chưa có layout | Thầy | Trang **Cách hoạt động** (sơ đồ + hành trình 6 bước + demo che dữ liệu chạy được). Hero trang chủ kể chuyện một lượt làm việc thật. Nút vào **Web App** thật. Nhúng video demo 90 giây. |
| Dạy khóa học hay phần mềm AI? | N1 | Câu định nghĩa ngay hero + khối “AI Lành Nghề không phải là…”. |
| Hơn ChatGPT/Claude/Gemini ở đâu? | N1, N3, N5, N6 | `ComparePanel` “ChatGPT tự dùng ↔ AI Lành Nghề” trên trang chủ; kết quả thử nghiệm A/B (khi có). |
| Giao diện nhiều chữ, nhiều chi tiết nhỏ | N1 | Mỗi khối 1 ý chính; chữ thân ≥ 18px; chi tiết đưa vào accordion `.qa`. |
| Một mục web nhiều nội dung, trang dài | N3 | Tách trang, thu gọn bằng accordion; trang Gói nghề bỏ danh sách 30 nghề. |
| Nên cho xem layout trước để dễ hình dung | N5 | Hero trang chủ chính là màn hình app đang chạy (khung laptop/điện thoại). |
| Chia sẻ tài khoản, nhiều máy | N4, N6 | Trang An toàn: mục “Một tài khoản – một người” (7 lớp, nói rõ phần nào là thiết kế). |
| Dữ liệu qua API nước ngoài, 100% an toàn? Sổ tay không miễn trừ trách nhiệm | N1, N4 | Trang An toàn viết lại: luồng dữ liệu, cái gì được che, cái gì **không lưu**, ai chịu trách nhiệm gì; **không cam kết 100%**. |
| Ngành nào thực sự cần AI? | N4 | Trang Gói nghề: 5 tiêu chí chọn nghề + vì sao Mua hàng trước. |
| Kế toán dùng AI rủi ro | N6 | Gỡ Kế toán khỏi danh sách “đang bán/giá đề xuất”. |
| Đối tượng 40+ có trả tiền không, sao không Gen Z | N4 | Trang Doanh nghiệp: mua theo phòng ban/vị trí; trang Hỏi đáp trả lời thẳng. |
| Tổng hợp câu hỏi các nhóm | N1–N6 | Trang **Hỏi đáp**: 11 câu hỏi của lớp, viết lại thành câu hỏi của khách, trả lời ngắn (nguồn: mục 9 file Kế hoạch GĐ2). |
| Khía cạnh pháp lý của dự án | Thầy (tiêu chí) | Trang **Điều khoản** và **Chính sách dữ liệu**; chân trang có thông tin người bán (dạng demo) theo yêu cầu website TMĐT. |
| Ghi nguồn cho số liệu và hình AI tạo | Thầy | Mỗi số liệu có chú thích nguồn + link; hình AI ghi “ảnh minh họa do AI tạo”. |

## 3. Lỗi nội dung trên website cũ phải sửa (đối chiếu bản GitHub 04/10)

| # | Chỗ | Trên GitHub hiện tại | Sửa ở site mới |
|---|---|---|---|
| W1 | `nghe-mua-hang`, `nghe-giang-day` | “Đã có **1.200+** người làm Mua hàng tin dùng · **4.8/5**”, “**900+** giáo viên đang dùng · 4.8/5”, có nhãn nhỏ “Số liệu minh họa” | **Xóa hẳn.** Nhãn minh họa không đủ: số người dùng và điểm đánh giá của sản phẩm chưa ra mắt vẫn đọc như lời chứng thực thật. |
| W2 | `index` (khối Chúng tôi là ai) | “15+ năm kinh nghiệm”, “6 nhóm nghề đang triển khai”, “20+ tình huống mỗi gói” (có nhãn minh họa) | Xóa; chỉ giữ “25 tình huống trong gói Mua hàng”. |
| W3 | `index` (2 chỗ), `nghe-mua-hang` (2 chỗ + bảng “Chạy trên AI nào”: Gemini Gem / Custom GPT / Claude Skill), `bang-gia` (“Tệp cấu hình AI theo nghề + sổ tay”, “Giá chưa gồm phí ChatGPT, Claude…”) | Mô hình cũ: cài cấu hình vào trợ lý AI, “không phải một phần mềm riêng”, “không cần phần mềm mới” | Viết lại theo Web App: làm việc trong app AI Lành Nghề, dùng AI của chính bạn (kết nối một chạm / key Gemini / key công ty). |
| W4 | `bang-gia`, `thanh-toan` | Đúng mức chính (690/800/990/Custom). Còn lệch: README ghi Tinh chỉnh cá nhân **1.490.000 đ/năm** trong khi trang ghi **800.000 đ/lần**; bảng giá đề xuất cho Hành chính, Nhân sự, Kế toán, Marketing, Quản lý; Tinh chỉnh doanh nghiệp 3–4 triệu | Giữ: Cá nhân 0 / 690.000 đ/năm; Tinh chỉnh 800.000 đ/lần; Business 690.000; Business Plus 990.000; Custom 25–80 triệu. **Bỏ giá đề xuất cho nghề chưa mở.** Ưu đãi quy mô và mở rộng nghề: giữ (báo cáo 2.3.1 có “chiết khấu theo quy mô… mua nhiều nghề hoặc số lượng tài khoản lớn”) nhưng chỉ minh họa trên Mua hàng. Gói Cá nhân Plus 1.490.000: **chờ nhóm chốt**. Tinh chỉnh doanh nghiệp: chờ nhóm chốt hoặc ghi “theo báo giá”. |
| W5 | `index`, `goi-nghe`, `bang-gia`, `nghe.json` | Mua hàng và **Giảng dạy “Đang mở”** (Giảng dạy có trang riêng, 3 tình huống dùng thử, nhưng giá “đang cập nhật”); 7 gói “đang đóng gói” (gồm Kế toán, Bán hàng, Marketing…); 24 gói “sắp mở” | Mua hàng = đang mở. Giảng dạy, Hành chính – Nhân sự = “sắp ra mắt” (xem mục Cần chốt). 29 gói còn lại đổi trạng thái thành **“đang lấy ý kiến”**, bỏ “đang đóng gói” (khớp lộ trình ≈ 2 nghề/năm và ngân sách chuyên gia). Kế toán: ghi rõ chỉ hỗ trợ việc ngoài phần mềm kế toán. |
| W6 | `index`, `bang-dieu-khien` | “**4%** tìm lại được việc đúng chuyên môn”, “12 tháng trung bình” – nguồn ghi chung chung “TopCV, báo cáo 2025–2026” | Chỉ dùng số có trong báo cáo kèm nguồn chính xác (TopCV 2026: 19% và 58% cần khoảng 12 tháng; METR; Accenture; Pew). 4% không có trong báo cáo → bỏ hoặc tìm nguồn gốc. |
| W7 | `index` (5 tình huống), `nghe-mua-hang` | “Trước đây 3 giờ 30 → Với AI 1 giờ”… | Ghi “ví dụ minh họa”; khi có kết quả A/B thì thay bằng số thật kèm n. |
| W8 | `nghe-mua-hang` FAQ | “Gói chạy trên Custom GPT, Gem…”, “có thể bắt đầu trên nền tảng miễn phí” | Viết lại theo 3 cách kết nối AI. Video 2 có câu “Cảnh trên Gemini là bản mẫu do nhóm dựng” → giữ ghi chú, thêm “bản theo mô hình cũ” hoặc thay bằng video Web App. |
| W9 | `bang-dieu-khien` | “Giờ tiết kiệm (đo qua **Connector**, có xác nhận)” (3 chỗ); công cụ “Gemini (gói doanh nghiệp)” | Đổi thành “đo trong app”; công cụ ghi “AI của công ty (qua key)”. |
| W10 | Toàn site | Nút “Đăng nhập” không dẫn đâu; giỏ hàng lưu `localStorage`; “Tiếp tục thanh toán” dẫn tới `thanh-toan.html` bản cũ (4 bước, chưa nối giỏ) | Đăng nhập → `/app/dang-nhap/`; giỏ + thanh toán gộp thành `/dat-mua/` dùng chung `pricing.ts`. |
| W11 | Toàn site | Be Vietnam Pro, bảng màu cũ, nhiều carousel ‹ ›, nút nổi “Dùng thử” giữa đáy màn hình | Theo skill: Lexend, token mới, bỏ carousel thừa; “Dùng thử” chuyển vào tab bar điện thoại và nút header. |
| W12 | `README.md` repo cũ | Mô tả bậc Cơ bản / Tinh chỉnh 1.490.000 đ/năm, khác trang Bảng giá | Không sửa repo cũ; README site mới ghi đúng giá. |

## 4. Sơ đồ trang mới

```
/                    Trang chủ
/cach-hoat-dong/     Cách hoạt động (sơ đồ, hành trình, demo che dữ liệu)
/nghe/mua-hang/      Gói nghề Mua hàng (đang mở)
/goi-nghe/           Danh mục nghề + tiêu chí chọn nghề + lộ trình (Giảng dạy, HC-NS sắp ra mắt)
/doanh-nghiep/       Giải pháp doanh nghiệp: Business Dashboard demo, quản lý seat, Custom 4 bước
/bang-gia/           Bảng giá + tự tính thời gian/chi phí (thay trang Đo giờ)
/dung-thu/           Bàn thử việc (mockup, không cần đăng nhập): 3 tình huống Mua hàng có lỗi cài sẵn – port từ site cũ
/dat-mua/            Đặt mua 4 bước (mô phỏng TMĐT): giỏ/gói → hóa đơn → thanh toán → nhận license
/an-toan/            An toàn & dữ liệu
/hoi-dap/            Hỏi đáp (câu hỏi của khách = câu hỏi của lớp)
/dieu-khoan/         Điều khoản dịch vụ (rút gọn, demo)
/chinh-sach-du-lieu/ Chính sách dữ liệu (rút gọn, demo)
/app/...             Web App (theo HANDOFF)
```
Điều hướng desktop (header capsule): Trang chủ · Cách hoạt động · Gói nghề · Doanh nghiệp · Bảng giá · An toàn · [Dùng thử miễn phí].
Tab bar điện thoại: Trang chủ · Cách hoạt động · Bảng giá · Dùng thử · Thêm (sheet: Gói nghề, Doanh nghiệp, An toàn, Hỏi đáp, Điều khoản).

**Chuyển trang cũ → mới:** index→`/`; goi-nghe→`/goi-nghe/`; nghe-mua-hang→`/nghe/mua-hang/`; nghe-giang-day→`/goi-nghe/#giang-day` (sắp ra mắt); bang-gia + do-gio→`/bang-gia/`; gio-hang + thanh-toan→`/dat-mua/`; dung-thu→`/dung-thu/` (nút cuối sang `/app/`); an-toan→`/an-toan/`; tai-nguyen→gộp vào `/hoi-dap/` (mục Hướng dẫn); bang-dieu-khien→`/doanh-nghiep/` (demo) và `/app/bang-dieu-khien/` (thật). Trên site cũ (GitHub Pages) thêm banner + nút “Sang website mới”.

## 5. Chi tiết từng trang

Ký hiệu: ★ = khoảnh khắc chuyển động chủ đạo của trang (chỉ một). Chữ đặt trong `src/content/vi.ts`.

### 5.1 Trang chủ `/`
| Thứ tự | Khối | Nội dung | Thành phần (skill) |
|---|---|---|---|
| 1 | ★ Hero “Sáng thứ Hai của chị Lan” | Đồng hồ 08:00 → 08:18 theo cuộn. Bên phải: khung laptop hiện app: 3 báo giá tải lên → tên NCC chuyển thành nhãn xanh đã che → bảng so sánh hiện từng dòng → tick checklist → “Đã xuất Excel”. Tiêu đề đổi: “3 báo giá. Sếp cần đề xuất trước 10 giờ.” → “Xong lúc 08:18. Chị vẫn là người quyết định.” CTA: Dùng thử miễn phí · Giải pháp cho doanh nghiệp | Khuôn `HeroDay` (sticky + useScroll), `AnimatePresence` cho dòng bảng; nhánh reduced-motion hiện trạng thái cuối |
| 2 | Định nghĩa | Câu định nghĩa (1 đoạn) + 3 dòng “không phải khóa học · không phải AI mới · không phải file câu lệnh” | Văn bản + icon, `data-reveal` |
| 3 | Dải cam kết | Không cần viết câu lệnh · Dữ liệu được che trước khi gửi lên AI · Dùng AI của chính bạn · Đo được thời gian · Chuyên gia nghề cập nhật 2 lần/năm | Marquee (một lần duy nhất) |
| 4 | So sánh | ChatGPT tự dùng ↔ AI Lành Nghề, 6 dòng (bắt đầu, đầu ra, kiểm lỗi, dữ liệu, đo lường, cập nhật) | `ComparePanel` |
| 5 | Ba việc của nghề Mua hàng | So sánh báo giá · Soạn thư thương lượng · Tóm tắt hồ sơ NCC; mỗi thẻ: đầu vào → kết quả; thời gian “ví dụ minh họa” | Stack cards (desktop), danh sách thường (mobile) |
| 6 | Vì sao bây giờ | 3–4 số có nguồn (TopCV, METR, Accenture, Pew) | `Counter` + chú thích nguồn |
| 7 | An toàn tóm tắt | Sơ đồ ngắn: bạn → che dữ liệu → AI của bạn → kết quả; không lưu nội dung → link An toàn | `data-reveal` |
| 8 | Giá tóm tắt | Cá nhân 0 đ / 690.000 đ · Doanh nghiệp từ 690.000 đ/người/năm → Bảng giá | 2 panel |
| 9 | Kết | “Bạn đã giỏi nghề. Phần còn lại để AI lo.” + CTA | khối `bg-deep` + `.glow` |

### 5.2 Cách hoạt động `/cach-hoat-dong/`
- PageIntro + câu định nghĩa.
- **Sơ đồ 6 khối** (Người dùng → Web App → Skill Engine → AI Gateway → AI của khách → Dashboard): bấm vào khối nào thì panel bên cạnh giải thích khối đó (tab có `layoutId`).
- **Hành trình 6 bước** (Mua → Thiết lập → Dùng → App làm việc → Kết quả → Đo lường). Đây là trình tự thật nên được đánh số.
- ★ **Demo che dữ liệu chạy thật trên trang** (không gọi AI): ô văn bản mẫu (báo giá có tên NCC, SĐT, MST) → bấm “Xem dữ liệu sẽ gửi lên AI” → từng thông tin chuyển thành nhãn xanh, bộ đếm chạy. Dùng chung `mask.ts` với app (chạy phía trình duyệt cho demo).
- 3 cách kết nối AI (một chạm OpenRouter / key Gemini / key công ty) – bảng ngắn.
- Video demo 90 giây (nhúng, có phụ đề).
- CTA vào app.

### 5.3 Gói nghề Mua hàng `/nghe/mua-hang/`
- Hero: “Để AI làm phần việc lặp lại. Bạn giữ quyết định mua hàng.” + ảnh màn hình app.
- 25 tình huống chia 5 nhóm (So sánh & đánh giá · Soạn thảo & đàm phán · Rà soát rủi ro · Tổng hợp định kỳ · Tra cứu nội bộ) – accordion, mỗi nhóm liệt kê tên tình huống. Đánh dấu 3 tình huống đã có trong bản demo.
- Một tình huống chi tiết: So sánh 3 báo giá (đầu vào → app xử lý 6 bước → bảng kết quả mẫu → checklist). Giữ dòng thời gian 08:15 → 09:00 của site cũ, ghi “ví dụ minh họa”.
- Gói gồm gì (5 thành phần, viết theo Web App).
- Phù hợp / không phù hợp.
- Giá Mua hàng + FAQ (viết lại theo W8).

### 5.4 Gói nghề `/goi-nghe/`
- Mua hàng (đang mở) · Giảng dạy, Hành chính – Nhân sự (sắp ra mắt, không giá, nút “Báo tôi khi mở”).
- **5 tiêu chí chọn nghề** (trả lời N4) + bảng chấm điểm Mua hàng / Giảng dạy / HC-NS / Kế toán (Kế toán lùi lại vì phần mềm chuyên ngành đã có AI).
- Lộ trình nghề theo năm (khớp ngân sách chuyên gia: khoảng 2 nghề mới/năm).
- **Nghề đang lấy ý kiến:** port danh mục `nghe.json` (31 gói, 155 tình huống, tìm không dấu, xem trước 5 tình huống mẫu) + nút đăng ký Google Form hiện có. Đổi trạng thái theo W5, không hiện giá.

### 5.5 Doanh nghiệp `/doanh-nghiep/`
- Lý do doanh nghiệp mua (mua theo phòng ban/vị trí, không theo tuổi; đo được; an toàn dữ liệu; chi phí ≈ 3,2 giờ công/người/năm).
- **Business Dashboard demo** (port từ `bang-dieu-khien.html`: mức áp dụng, theo nhân sự, trước–sau, kiểm duyệt, tuân thủ) thành island React có tab `layoutId`; dữ liệu mẫu “Cơ khí Tân Phú”, ghi rõ “dữ liệu mẫu”.
- Quản lý seat (mời / thu hồi / chuyển) – mô phỏng.
- Gói Custom: 4 bước (khảo sát → thiết kế → triển khai & đào tạo → đồng hành 3 tháng), 25–80 triệu.
- CTA: Yêu cầu báo giá (form → mailto hoặc lưu D1).

### 5.6 Bảng giá `/bang-gia/`
- 2 nhóm: Cá nhân (Trải nghiệm 0 đ · Gói nghề 690.000 đ/năm · Tinh chỉnh 800.000 đ/lần) và Doanh nghiệp (Business 690.000 · **Business Plus 990.000** đ/người/năm · Custom 25–80 triệu).
- Ghi chú: phí AI khách tự trả qua tài khoản/key của mình (tính theo lượng dùng); 5 lượt dùng thử miễn phí.
- **Tự tính** (island thay trang Đo giờ): chọn đầu việc + số lần/tuần + lương/giờ → giờ tiết kiệm/năm (giả định ghi rõ) và số giờ cần để hòa vốn 690.000 đ (≈ 3,2 giờ với 213.000 đ/giờ).
- Bảng so sánh tính năng Business vs Business Plus.
- Ưu đãi quy mô (theo tổng seat) và mở rộng nghề: lấy từ `pricing.ts` (port `tinh-tien.js`), ví dụ tính chỉ dùng nghề Mua hàng.
- CTA: Đặt mua.

### 5.7 Đặt mua `/dat-mua/` (luồng TMĐT, mô phỏng)
Wizard 4 bước theo khuôn `PackagePicker` (slide giữa bước, thanh tiến độ):
1. Chọn gói + số seat (giá tự tính bằng `pricing.ts`, hiện hóa đơn từng dòng và “Xem từng bước” như giỏ hàng cũ).
2. Thông tin xuất hóa đơn điện tử (tên DN, MST, email nhận).
3. Hình thức thanh toán: Chuyển khoản (mã QR mẫu) / VNPay / MoMo – **mô phỏng, không thu tiền**.
4. Xác nhận: mã đơn, license đã cấp, nút “Vào app và kết nối AI”.
Ghi rõ ở đầu trang: “Bản demo đồ án – không phát sinh giao dịch thật.”

### 5.8 An toàn & dữ liệu `/an-toan/`
- Sơ đồ đường đi dữ liệu (app → che → AI Gateway → nhà cung cấp AI / OpenRouter → bỏ che → bạn).
- Hai loại dữ liệu: **dữ liệu cá nhân** (Luật 91/2025/QH15, NĐ 356/2025) và **bí mật kinh doanh** (quy chế nội bộ, NDA).
- Chúng tôi lưu gì / không lưu gì (bảng): lưu sự kiện và thời gian; **không** lưu nội dung, file, kết quả; key mã hóa.
- Trách nhiệm các bên (doanh nghiệp = bên kiểm soát; AI Lành Nghề = bên xử lý; nhà cung cấp AI). **Không cam kết 100%** – nói thẳng.
- Một tài khoản – một người (OTP, giới hạn thiết bị, seat).
- Tải mẫu DPIA rút gọn (PDF), danh mục dữ liệu không nên nhập.

### 5.9 Hỏi đáp `/hoi-dap/`
Accordion `.qa`, 3 nhóm: Sản phẩm · Chi phí · Dữ liệu. Câu hỏi (viết lại từ câu hỏi của lớp):
Sao không dùng ChatGPT luôn? · Đây là khóa học hay phần mềm? · Tôi có phải dùng thêm ChatGPT không? · Lấy key AI ở đâu? · 690.000 đ có đáng không? · Công ty có nên mua cho nhân viên lớn tuổi? · Sao không mua khóa đào tạo ngắn? · Ai viết nội dung nghề? · Dữ liệu có ra nước ngoài không? · Chia sẻ tài khoản được không? · Nghề của tôi có gói chưa?
Thêm mục **Hướng dẫn** (từ trang Tài nguyên cũ): lấy key Gemini 3 bước, checklist trước khi nhập dữ liệu.

### 5.10 Điều khoản, Chính sách dữ liệu, chân trang
- Trang ngắn (1–2 màn hình), đánh dấu “bản demo đồ án”.
- Chân trang: tên dự án, email liên hệ nhóm, “Website demo cho đồ án môn Thương mại điện tử – UEH”, ghi chú ảnh AI, link Điều khoản / Chính sách dữ liệu, `noindex` giữ nguyên.

## 6. Thiết kế (tóm tắt – chi tiết ở skill và HANDOFF mục 10)
- Token: nâu `#5A3B0A` (accent), vàng đồng `#7D5411`, giấy `#FAF3EC` (chỉ vùng làm việc/khung app), nền `#F6F5F3`/trắng, chữ `#201F1D`, xanh `#1F5E4A` **chỉ** cho dữ liệu đã che. Lexend, chữ thân ≥ 18px. Chỉ giao diện sáng.
- Khung trang Stroke360: header capsule nổi + nav-pill trượt, thanh tiến độ cuộn (màu nâu → vàng đồng), tab bar điện thoại + sheet, footer `bg-deep` (nâu rất đậm), View Transitions.
- Mỗi trang **một** khoảnh khắc ★ (đã chỉ định ở mục 5). Không fade-up mọi khối; `data-reveal` chỉ cho tiêu đề mục.
- Logo: dùng logo hiện có trong `TMĐT/Đồ án cuối kỳ/Tài liệu chốt cho dự án/Thương hiệu/` (kiểm tra file), tạo favicon/og như Stroke360.
- Ảnh: dùng `Photo` (khung gradient nâu khi chưa có ảnh). Ảnh minh họa có thể lấy từ thư mục `hình/` cũ; ảnh AI ghi chú.

## 7. Quy tắc nội dung
- Số liệu: chỉ dùng số có trong báo cáo, kèm nguồn (tên + năm + link) ngay dưới số. Số do nhóm giả định ghi “ước tính của nhóm”. Thời gian tình huống ghi “ví dụ minh họa” cho tới khi có số A/B.
- **Không** đánh giá sao, lời chứng thực, số người dùng, logo khách hàng giả.
- Không chữ “Connector”, “Custom GPT/Gem” như cách dùng sản phẩm, “không phải phần mềm riêng”.
- Giọng văn: câu ngắn, động từ rõ, nói với người làm nghề (“bạn”), không thuật ngữ “token/prompt”.
- Dùng skill `humanizer` rà lại chữ trước khi chốt (tránh giọng văn máy).

## 8. Thứ tự làm và mốc (khớp HANDOFF)

| Ngày | Việc |
|---|---|
| 14–15/10 | Khung Astro + token + Base layout (header, tab bar, sheet, footer) + deploy Cloudflare. Chuyển chữ sang `vi.ts`. |
| 16/10 | Trang chủ khối 2–9 (chưa hero). Trang Bảng giá (giá đúng) + Tự tính. |
| 17–19/10 | (Ưu tiên làm Web App theo HANDOFF) – website chỉ sửa nhỏ. |
| 21/10 | Cách hoạt động (sơ đồ, hành trình, demo che dữ liệu dùng chung `mask.ts`). An toàn. |
| 22/10 | Nghề Mua hàng, Gói nghề, Hỏi đáp. |
| 23/10 | Doanh nghiệp (dashboard demo port), Đặt mua (wizard). Điều khoản, Chính sách. |
| 24–25/10 | ★ Hero trang chủ “Sáng thứ Hai của chị Lan”. Rà chữ (humanizer), rà số liệu và nguồn. |
| 26/10 | Nhúng video, banner chuyển hướng trên site cũ, chụp ảnh màn hình cho báo cáo mục 2.9. |
| 27–28/10 | Kiểm tra toàn bộ (mục 9), khóa lúc 20h ngày 28/10. |

## 9. Kiểm tra trước khi khóa
- [ ] Không còn: số người dùng/đánh giá giả (1.200+, 900+, 4.8/5, 15+ năm, 6 nhóm nghề), “Connector”, “Custom GPT/Gem/Claude Skill” như cách dùng, “không phải phần mềm riêng”, giá đề xuất cho nghề chưa mở, trạng thái “đang đóng gói”.
- [ ] `pricing.ts` qua hết bộ test port từ `tests/tinh-tien.test.js`.
- [ ] `/dung-thu/` chạy đủ 3 tình huống Mua hàng, checklist chỉ tick khi đã sửa lỗi cài sẵn.
- [ ] Giá ở website = báo cáo = Excel = slide.
- [ ] Mọi số liệu có nguồn hoặc nhãn “ví dụ minh họa / ước tính của nhóm”.
- [ ] Luồng TMĐT chạy hết: Bảng giá → Đặt mua 4 bước → nhận license → vào app.
- [ ] Mỗi trang đúng một khoảnh khắc ★; reduced-motion hiển thị đủ nội dung.
- [ ] Mobile 390px không cuộn ngang; tab bar + sheet hoạt động; bàn phím đi hết trang.
- [ ] Lighthouse Accessibility ≥ 90, Performance ≥ 85 (mobile).
- [ ] Ảnh chụp cho báo cáo (1440px + 390px): Trang chủ (3 mốc hero), Cách hoạt động, Nghề Mua hàng, Bảng giá, Đặt mua (4 bước), Doanh nghiệp, An toàn, Hỏi đáp.
- [ ] Link website mới có trong Phụ lục báo cáo; site cũ có banner chuyển hướng.

## 9b. Cần nhóm chốt trước khi làm

1. **Giảng dạy**: site cũ đang ghi “Đang mở” và có trang riêng + 3 tình huống dùng thử; kế hoạch giai đoạn 2 chọn 1 gói đầy đủ (Mua hàng), gói thứ hai làm quý 4. Đề xuất: Giảng dạy = **“sắp ra mắt”**, giữ trang giới thiệu và 3 tình huống ở `/dung-thu/` dưới nhãn “xem trước”.
2. **Gói Cá nhân Plus 1.490.000 đ/năm** (README cũ) hay **Tinh chỉnh 800.000 đ/lần** (trang Bảng giá, báo cáo): đề xuất giữ 800.000 đ/lần cho khớp báo cáo và Excel.
3. **Tinh chỉnh doanh nghiệp** (site cũ: Mua hàng 3.000.000 đ, Nhân sự 3.500.000 đ, Kế toán 4.000.000 đ): báo cáo không có → giữ một mức cho Mua hàng hoặc ghi “theo báo giá”.

## 10. Lời nhắn cho Claude Code
1. Đọc skill `brand-motion-web`, file HANDOFF, rồi file này. Mở mã Stroke360 (nếu có quyền) để chép cấu trúc `global.css`, `Base.astro`, `Words`, `Counter`, `ComparePanel`, `HeroDay`, `PackagePicker` rồi đổi token.
2. Clone repo site cũ (`main`) để lấy chữ, dữ liệu (`nghe.json`, `dung-thu-data.js`), bộ tính tiền + test, ảnh, video – **áp quy tắc mục 3 và 7** trước khi đưa sang. Không sửa repo cũ, trừ banner chuyển hướng ở bước cuối.
3. Sau mỗi trang: build, chụp màn hình desktop + mobile, tự rà theo checklist của skill, rồi commit.
