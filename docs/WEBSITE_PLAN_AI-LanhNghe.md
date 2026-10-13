# Kế hoạch làm lại website AI Lành Nghề (khuôn Stroke360 + sửa theo góp ý)

> Dùng cùng `HANDOFF_AI-LanhNghe-App.md` và skill **`brand-motion-web`**. File này chỉ nói về **website** (phần giới thiệu, bán hàng, TMĐT). Web App (`/app/`) theo file HANDOFF.
> Repo: https://github.com/annguyen30112301/ai-lanh-nghe-app · Website và Web App nằm chung một dự án Astro, chung hệ thiết kế, deploy Cloudflare Pages.
> Website cũ (nguồn nội dung, **không** sửa tiếp): `TMĐT/source code website/ai-lanh-nghe/` – https://annguyen30112301.github.io/ai-lanh-nghe/

---

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

## 3. Lỗi nội dung trên website cũ phải sửa (tự rà soát)

| # | Chỗ | Vấn đề | Sửa |
|---|---|---|---|
| W1 | Nghề Mua hàng | “**1.200+ người làm Mua hàng tin dùng · 4.8/5**” – sản phẩm chưa ra mắt, đây là số **không có thật** | **Xóa.** Không dùng đánh giá/lời chứng thực/số người dùng giả ở bất kỳ đâu. |
| W2 | Trang chủ | “15+ năm kinh nghiệm”, “6 nhóm nghề đang triển khai”, “20+ tình huống mỗi gói” | Xóa số không có nguồn; giữ “25 tình huống trong gói Mua hàng” (đúng kế hoạch). |
| W3 | Toàn site | Mô hình cũ: “cài cấu hình vào ChatGPT/Gem/Claude Skill”, “**không phải một phần mềm riêng**”, “không cần phần mềm mới” | Viết lại theo Web App: “làm trong app AI Lành Nghề, dùng AI của chính bạn (kết nối một lần)”. |
| W4 | Bảng giá | “Gói nghề **từ 590.000 đ**”, “Tinh chỉnh **từ 600.000 đ**”, giá đề xuất 590–890k cho 6 nghề, **không có Business Plus 990k**, Tinh chỉnh DN 3–4 triệu | Đồng bộ báo cáo: Cá nhân 0 / 690.000; Business 690.000; **Business Plus 990.000**; Tinh chỉnh 800.000/lần; Custom 25–80 triệu. Gói Cá nhân Plus 1.490.000: **chờ nhóm chốt**. Bảng ưu đãi theo seat/nghề: chỉ giữ nếu báo cáo có; nếu không thì bỏ. |
| W5 | Gói nghề, Bảng giá | Giảng dạy “Đang bán”; Kế toán, Marketing, Quản lý “đang đóng gói” với giá; danh sách 30 nghề “tiếp theo” | Chỉ **Mua hàng = đang mở**. Giảng dạy, Hành chính – Nhân sự = “sắp ra mắt” (không giá). Bỏ danh sách 30 nghề; thay bằng ô “Đăng ký quan tâm nghề khác”. |
| W6 | Trang chủ | “4% tìm lại được việc đúng chuyên môn” – không thấy trong báo cáo | Chỉ dùng số có trong báo cáo kèm nguồn (TopCV 19% và 58% cần ~12 tháng; METR; Accenture; Pew). Không có nguồn → bỏ. |
| W7 | Tình huống | “Trước đây 3 giờ 30 → Với AI 1 giờ”… | Ghi rõ **“ví dụ minh họa”**; khi có số thử nghiệm A/B thì thay bằng số thật kèm n. |
| W8 | Nghề Mua hàng FAQ | “Gói chạy trên Custom GPT, Gem…”, “có thể bắt đầu trên nền tảng miễn phí” | Viết lại: kết nối AI một chạm (OpenRouter) / key Gemini miễn phí / key công ty. |
| W9 | Toàn site | Nút “Đăng nhập”, “Giỏ hàng 0”, form nhận tin không hoạt động | Đăng nhập → `/app/dang-nhap/`; giỏ hàng gộp vào luồng đặt mua; bỏ form nhận tin hoặc làm hoạt động thật. |
| W10 | Toàn site | Font Be Vietnam Pro, bảng màu cũ, carousel ‹ › nhiều | Theo skill: Lexend, token mới, bỏ carousel thừa. |

## 4. Sơ đồ trang mới

```
/                    Trang chủ
/cach-hoat-dong/     Cách hoạt động (sơ đồ, hành trình, demo che dữ liệu)
/nghe/mua-hang/      Gói nghề Mua hàng (đang mở)
/goi-nghe/           Danh mục nghề + tiêu chí chọn nghề + lộ trình (Giảng dạy, HC-NS sắp ra mắt)
/doanh-nghiep/       Giải pháp doanh nghiệp: Business Dashboard demo, quản lý seat, Custom 4 bước
/bang-gia/           Bảng giá + tự tính thời gian/chi phí (thay trang Đo giờ)
/dat-mua/            Đặt mua 4 bước (mô phỏng TMĐT): gói → hóa đơn → thanh toán → nhận license
/an-toan/            An toàn & dữ liệu
/hoi-dap/            Hỏi đáp (câu hỏi của khách = câu hỏi của lớp)
/dieu-khoan/         Điều khoản dịch vụ (rút gọn, demo)
/chinh-sach-du-lieu/ Chính sách dữ liệu (rút gọn, demo)
/app/...             Web App (theo HANDOFF)
```
Điều hướng desktop (header capsule): Trang chủ · Cách hoạt động · Gói nghề · Doanh nghiệp · Bảng giá · An toàn · [Dùng thử miễn phí].
Tab bar điện thoại: Trang chủ · Cách hoạt động · Bảng giá · Dùng thử · Thêm (sheet: Gói nghề, Doanh nghiệp, An toàn, Hỏi đáp, Điều khoản).

**Chuyển trang cũ → mới:** index→`/`; goi-nghe→`/goi-nghe/`; nghe-mua-hang→`/nghe/mua-hang/`; nghe-giang-day→`/goi-nghe/#giang-day` (sắp ra mắt); bang-gia + gio-hang + do-gio→`/bang-gia/`; thanh-toan→`/dat-mua/`; dung-thu→`/app/`; an-toan→`/an-toan/`; tai-nguyen→gộp vào `/hoi-dap/` (mục Hướng dẫn); bang-dieu-khien→`/doanh-nghiep/` (demo) và `/app/bang-dieu-khien/` (thật). Trên site cũ (GitHub Pages) thêm banner + nút “Sang website mới”.

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
- CTA: Đặt mua.

### 5.7 Đặt mua `/dat-mua/` (luồng TMĐT, mô phỏng)
Wizard 4 bước theo khuôn `PackagePicker` (slide giữa bước, thanh tiến độ):
1. Chọn gói + số seat (giá tự tính).
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
- [ ] Không còn: số người dùng/đánh giá giả, “Connector”, “Custom GPT/Gem” như cách dùng, giá 590k/600k, nghề Kế toán/Marketing có giá, danh sách 30 nghề.
- [ ] Giá ở website = báo cáo = Excel = slide.
- [ ] Mọi số liệu có nguồn hoặc nhãn “ví dụ minh họa / ước tính của nhóm”.
- [ ] Luồng TMĐT chạy hết: Bảng giá → Đặt mua 4 bước → nhận license → vào app.
- [ ] Mỗi trang đúng một khoảnh khắc ★; reduced-motion hiển thị đủ nội dung.
- [ ] Mobile 390px không cuộn ngang; tab bar + sheet hoạt động; bàn phím đi hết trang.
- [ ] Lighthouse Accessibility ≥ 90, Performance ≥ 85 (mobile).
- [ ] Ảnh chụp cho báo cáo (1440px + 390px): Trang chủ (3 mốc hero), Cách hoạt động, Nghề Mua hàng, Bảng giá, Đặt mua (4 bước), Doanh nghiệp, An toàn, Hỏi đáp.
- [ ] Link website mới có trong Phụ lục báo cáo; site cũ có banner chuyển hướng.

## 10. Lời nhắn cho Claude Code
1. Đọc skill `brand-motion-web`, file HANDOFF, rồi file này. Mở mã Stroke360 (nếu có quyền) để chép cấu trúc `global.css`, `Base.astro`, `Words`, `Counter`, `ComparePanel`, `HeroDay`, `PackagePicker` rồi đổi token.
2. Đọc nội dung site cũ để lấy chữ, nhưng **áp quy tắc mục 3 và 7** trước khi đưa sang.
3. Sau mỗi trang: build, chụp màn hình desktop + mobile, tự rà theo checklist của skill, rồi commit.
