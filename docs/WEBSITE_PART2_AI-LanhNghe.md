# Website đợt 2: các trang còn thiếu và sửa nội dung

> Repo `ai-lanh-nghe-app` · Site đang chạy: https://ai-lanh-nghe-app.nghoangan-bt96.workers.dev/
> Lập 14/10/2026 sau khi kiểm tra bản `main` (Web App xong, test 9/9, build 0 lỗi, deploy xanh).
> Đọc trước: skill `brand-motion-web`, `docs/WEBSITE_PLAN_AI-LanhNghe.md` (bản đầy đủ, mục 5 = nội dung từng trang, mục 9b = quyết định giá đã chốt). File này chỉ liệt kê **phần còn lại** theo thứ tự làm.
> Nguồn nội dung cũ: repo `annguyen30112301/ai-lanh-nghe` nhánh `main` (đọc, **không sửa**).

## 0. Hiện trạng

| Đã có | Còn thiếu |
|---|---|
| `/`, `/cach-hoat-dong/`, `/goi-nghe/`, `/bang-gia/`, `/an-toan/`, toàn bộ `/app/*`, `/api/*` | `/dat-mua/`, `/dung-thu/`, `/hoi-dap/`, `/dieu-khoan/`, `/chinh-sach-du-lieu/`, `/nghe/mua-hang/`, `/doanh-nghiep/`; video; ưu đãi theo seat; thông tin người bán ở chân trang |

Nút “Chọn gói…” trên Bảng giá hiện dẫn thẳng tới đăng nhập → chưa có luồng mua (phần chấm “khía cạnh TMĐT”).

## 1. Sửa ngay (làm trước mọi thứ)

**1.1 Số liệu 19% sai nghĩa** – `src/content/vi.ts`, `why.stats` và `why.source`.
- Hiện ghi: “19% lao động văn phòng 40+ thuộc nhóm có nguy cơ cao”, nguồn “TopCV, báo cáo thị trường lao động 2025–2026 (khảo sát…)”.
- Báo cáo (mục 1.1.1) viết: **người trên 40 tuổi chiếm 19% tổng số nhân sự bị cho nghỉ việc năm 2025, và 58% trong số họ cần khoảng 12 tháng mới có việc làm mới**; nguồn: TopCV (2026), qua bài VnExpress tháng 01/2026 “Lao động trên 40 tuổi bị cắt giảm việc nhiều nhất năm 2025” – https://vnexpress.net/lao-dong-tren-40-tuoi-bi-cat-giam-viec-nhieu-nhat-nam-2025-5002504.html
- Sửa thành:
  - `{ value: 19, suffix: "%", label: "số người bị cho nghỉ việc năm 2025 là lao động trên 40 tuổi" }`
  - `{ value: 58, suffix: "%", label: "trong số đó cần khoảng 12 tháng mới tìm được việc mới" }`
  - `source`: “Nguồn: TopCV (2026), theo VnExpress, 01/2026.” + link bài báo.
- Rà toàn bộ `vi.ts`: mọi con số khác phải có nguồn hoặc nhãn “ví dụ minh họa / ước tính của nhóm”.

**1.2 Nút trên Bảng giá** – sau khi có `/dat-mua/` (mục 2): “Chọn gói Cá nhân” → `/dat-mua/?goi=personal`; Business/Business Plus thêm nút “Đặt mua” → `/dat-mua/?goi=business` (giữ nút “Xem demo doanh nghiệp”). “Dùng thử” giữ `/app/dang-nhap/`.

## 2. `/dat-mua/` – luồng mua 4 bước (ưu tiên cao nhất)

**Bộ tính tiền:** port `assets/js/tinh-tien.js` (repo cũ) sang `src/lib/pricing.ts` (TypeScript, hàm thuần, chạy được cả trình duyệt và server) + port `tests/tinh-tien.test.js` sang Vitest (`tests/pricing.test.ts`). Áp quyết định đã chốt:
- Chỉ nghề **Mua hàng** bán được. Giảng dạy, Hành chính – Nhân sự: `goiNghe: null` (sắp ra mắt) → không cho vào đơn. Bỏ giá đề xuất các nghề khác.
- Cá nhân: 690.000 đ/năm. Tinh chỉnh cá nhân **800.000 đ/lần** (một lần, không thu lại khi gia hạn).
- Business 690.000 đ/người/năm; Business Plus 990.000 đ/người/năm. Ưu đãi quy mô theo tổng seat giữ như repo cũ (0% 1–9, −5% 10–24, −10% 25–49, −15% 50–99, −20% 100–249, −25% 250–499, −30% từ 500).
- Tinh chỉnh doanh nghiệp: **“Liên hệ báo giá”** (`null`, không cộng vào đơn). Custom 25–80 triệu: chỉ nút “Yêu cầu báo giá”.
- Ưu đãi mở rộng nghề: giữ trong `pricing.ts` cho tương lai nhưng **ẩn trên giao diện** (hiện chỉ có 1 nghề).

**Giao diện:** wizard theo khuôn `PackagePicker` (skill), thanh tiến độ, slide giữa các bước, nút Quay lại.
1. **Chọn gói**: Cá nhân / Business / Business Plus; số seat (doanh nghiệp, tối thiểu 1); bật Tinh chỉnh 1:1 (cá nhân). Bên phải: hóa đơn từng dòng + “Xem cách tính” (công thức, bậc ưu đãi đang áp).
2. **Thông tin & hóa đơn**: họ tên, email, số điện thoại; doanh nghiệp: tên công ty, MST, địa chỉ, email nhận hóa đơn điện tử. Kiểm tra định dạng MST (10 hoặc 10-3 số), email.
3. **Thanh toán (mô phỏng)**: Chuyển khoản (QR mẫu + nội dung CK có mã đơn) / VNPay / MoMo. Banner cố định: “Bản demo đồ án – không phát sinh giao dịch thật.” Nút “Tôi đã thanh toán (mô phỏng)”.
4. **Hoàn tất**: mã đơn, tóm tắt, ngày hiệu lực – hết hạn (1 năm), “License đã cấp”, nút **“Vào app và kết nối AI”** → `/app/dang-nhap/?email=…`.

**Lưu đơn (khuyến nghị, nhẹ):** `POST /api/orders` ghi bảng `orders` (migration `0002_orders.sql`: id, created_at, plan, seats, addon_tinh_chinh, subtotal, discount, total, buyer_type, company, tax_code, email, status='demo_paid'). Không lưu số thẻ/tài khoản. Nếu email trùng tài khoản demo thì không đổi gói thật.

## 3. `/dung-thu/` – Bàn thử việc (không cần đăng nhập)

Port từ repo cũ `dung-thu.html` + `assets/js/dung-thu-data.js` + `dung-thu.js` thành island React.
- **Mua hàng (3 tình huống, mặc định):** So sánh 3 báo giá (lỗi cài sẵn: NCC C chưa gồm VAT nên trông rẻ nhất) · Thư đề nghị giảm giá (câu cam kết vượt thẩm quyền) · Chấm hồ sơ năng lực (ISO 9001 hết hạn vẫn chấm cao; có bước che CCCD).
- **Giảng dạy (3 tình huống):** giữ, gắn nhãn **“Xem trước – sắp ra mắt”**.
- Luồng 4 bước: Chọn việc → Đầu vào (hiệu ứng che dữ liệu bằng `mask.ts` thật, chạy phía trình duyệt) → Kiểm tra (checklist; mục có lỗi chỉ tick được sau khi bấm xem gợi ý và sửa; kết quả đổi theo) → Kết quả. Bước cuối: “Làm với tài liệu thật của bạn – 5 lượt miễn phí” → `/app/dang-nhap/`.
- Ghi rõ: “Kết quả soạn sẵn để minh họa, không gọi AI.”
- Deep link `/dung-thu/#mua-hang/bao-gia` như bản cũ.

## 4. `/hoi-dap/` – Hỏi đáp

Accordion `.qa`, 3 nhóm. Câu hỏi = câu hỏi các nhóm ở buổi 09/10, viết lại theo lời khách. Nội dung trả lời (rút gọn, giữ ý):

**Sản phẩm**
1. *Sao không dùng ChatGPT luôn cho xong?* – App dùng chính các mô hình AI đó qua key của bạn. Thứ thêm vào: quy trình nghề Mua hàng đóng gói sẵn (chọn việc, điền ô, không viết câu lệnh), kết quả theo mẫu cố định kèm checklist tự kiểm, che thông tin nhạy cảm trước khi gửi, đo thời gian tiết kiệm. Tự dùng AI dễ tin vào cảm giác: nghiên cứu METR (2025) ghi nhận người dùng chậm hơn 19% nhưng tự tin nhanh hơn 20%.
2. *Đây là khóa học hay phần mềm?* – Phần mềm làm việc. Không bán giờ học, không cấp chứng chỉ.
3. *Tôi có phải mở ChatGPT nữa không?* – Không. Mọi việc làm trong app; AI chạy phía sau bằng key bạn (hoặc công ty) kết nối một lần.
4. *Ai viết nội dung nghề?* – Người có kinh nghiệm nghề đóng gói quy trình, mẫu và checklist; cập nhật 2 lần/năm.
5. *Nghề của tôi đã có chưa?* – Đang mở: Mua hàng. Sắp ra mắt: Giảng dạy, Hành chính – Nhân sự. Nghề khác: đăng ký để nhóm ưu tiên.

**Chi phí**
6. *690.000 đ/năm có đáng không?* – Bằng khoảng 3,2 giờ công của người có thâm niên (lương bình quân khoảng 213.000 đ/giờ). Tiết kiệm khoảng 4 phút mỗi tuần là đủ bù.
7. *Phí AI ai trả, bao nhiêu?* – Bạn hoặc công ty trả thẳng cho nhà cung cấp AI theo lượng dùng. Ước tính của nhóm: một lượt so sánh 3 báo giá khoảng 300–900 đ tùy mô hình (xem bảng chi phí kỹ thuật). 5 lượt đầu do AI Lành Nghề trả.
8. *Công ty có nên mua cho nhân sự lớn tuổi? Sao không mua khóa học ngắn?* – Doanh nghiệp mua theo phòng ban, ai trong phòng cũng dùng được. Khóa học giúp biết, không để lại công cụ làm việc, không đo được. Accenture (2024): 94% người lao động muốn học AI tạo sinh, chỉ 5% tổ chức đào tạo được cho số đông.

**Dữ liệu**
9. *Lấy key AI ở đâu?* – Doanh nghiệp: quản trị viên gắn key công ty một lần. Cá nhân: bấm “Kết nối AI một chạm” (OpenRouter) hoặc dán key Gemini (có hướng dẫn 3 bước). Lưu ý: key Gemini bậc miễn phí cho phép Google dùng dữ liệu để cải thiện sản phẩm → không đưa tài liệu mật khi dùng bậc miễn phí.
10. *Dữ liệu có ra nước ngoài? An toàn 100%?* – Không ai cam kết 100% một cách trung thực. App che thông tin nhận diện trước khi gửi, mã hóa key, không lưu file/nội dung/kết quả, chỉ lưu số đếm và mốc thời gian. Doanh nghiệp là bên kiểm soát dữ liệu, AI Lành Nghề là bên xử lý (xem Chính sách dữ liệu).
11. *Chia sẻ tài khoản được không?* – Mỗi tài khoản gắn một người; đăng nhập thiết bị mới phải xác thực mã; doanh nghiệp quản lý theo seat (mời, thu hồi, chuyển).

Thêm mục **Hướng dẫn**: lấy key Gemini 3 bước; checklist trước khi nhập dữ liệu (lấy từ trang Tài nguyên cũ, viết lại theo Web App).

## 5. `/dieu-khoan/`, `/chinh-sach-du-lieu/`, chân trang

Mỗi trang 1–2 màn hình, đầu trang ghi “Bản demo cho đồ án môn TMĐT – UEH”.
- **Điều khoản**: phạm vi dịch vụ; gói và thời hạn (1 năm, gia hạn); Tinh chỉnh không hoàn lại; thay đổi giữa kỳ (thêm seat tính theo ngày còn lại; giảm seat áp từ kỳ sau); trách nhiệm với kết quả AI (người dùng duyệt trước khi dùng); chấm dứt; liên hệ.
- **Chính sách dữ liệu**: dữ liệu cá nhân (Luật 91/2025/QH15, NĐ 356/2025/NĐ-CP) và bí mật kinh doanh (báo giá, hợp đồng – theo quy chế nội bộ của khách); bảng **lưu / không lưu** (lấy từ trang An toàn); vai trò các bên (khách = bên kiểm soát, AI Lành Nghề = bên xử lý, nhà cung cấp AI / OpenRouter = bên nhận dữ liệu đã che); thời gian lưu; quyền của người dùng; báo cáo sự cố 72 giờ.
- **Chân trang** (mọi trang): tên dự án, email nhóm, “Website demo cho đồ án môn Thương mại điện tử – UEH, không phát sinh giao dịch thật”, link Điều khoản / Chính sách dữ liệu / Hỏi đáp, ghi chú ảnh AI.

## 6. `/nghe/mua-hang/` và `/doanh-nghiep/`

- **Nghề Mua hàng**: theo WEBSITE_PLAN 5.3. 25 tình huống chia 5 nhóm (accordion), đánh dấu 3 tình huống đang chạy. Nhúng **Video 2** từ repo cũ (`assets/video/video2-gioi-thieu.mp4`, `.vtt`, poster) với chú thích “Video giai đoạn 1 – cảnh dựng trên Gemini, theo mô hình cũ”; khi có video demo Web App 90 giây thì đặt video mới lên trên. Nút: Dùng thử · Đặt mua.
- **Doanh nghiệp**: theo WEBSITE_PLAN 5.5. Không port lại dashboard cũ: chụp/nhúng màn hình Business Dashboard thật của app + nút “Xem demo doanh nghiệp” (`/app/dang-nhap/?demo=doanh-nghiep`). Gói Custom 4 bước + form “Yêu cầu báo giá” (mailto hoặc `POST /api/leads`).

## 7. Điều hướng

- Header: Trang chủ · Cách hoạt động · Gói nghề · Doanh nghiệp · Bảng giá · An toàn · [Dùng thử].
- Tab bar điện thoại: Trang chủ · Cách hoạt động · Bảng giá · Dùng thử · Thêm (sheet: Gói nghề, Doanh nghiệp, An toàn, Hỏi đáp, Điều khoản).
- Sau khi xong, báo lại để cập nhật bảng chuyển trang trong `ai-lanh-nghe/docs/HANDOFF_chuyen-sang-site-moi.md` (cột “khi site mới có trang riêng”).

## 8. Thứ tự & mốc

| Ngày | Việc |
|---|---|
| 14/10 | Mục 1 (sửa 19%) |
| 15–17/10 | `pricing.ts` + test, `/dat-mua/`, nút Bảng giá |
| 18–19/10 | `/dung-thu/` |
| 21–22/10 | `/hoi-dap/`, `/dieu-khoan/`, `/chinh-sach-du-lieu/`, chân trang |
| 23–24/10 | `/nghe/mua-hang/` (+ video), `/doanh-nghiep/`, điều hướng |
| 25–26/10 | Rà chữ (skill `humanizer`), chụp ảnh màn hình mọi trang 1440 + 390 cho báo cáo mục 2.9 |
| 28/10 20h | Khóa deploy |

Không làm chậm Web App: thử nghiệm A/B dùng app từ 21/10, không deploy thay đổi lớn cho `/app/*` trong 21–23/10.

## 9. Xong khi

- [x] Câu 19% đúng nghĩa báo cáo, có link nguồn.
- [ ] Luồng Bảng giá → Đặt mua 4 bước → mã đơn → vào app chạy hết; giá đúng mục 2; Tinh chỉnh DN hiện “Liên hệ báo giá”; Giảng dạy không vào được đơn.
- [ ] `npm test` qua cả test che dữ liệu và test bộ tính tiền.
- [ ] `/dung-thu/` chạy 3 tình huống Mua hàng; checklist chỉ tick khi đã sửa lỗi; Giảng dạy có nhãn “Xem trước”.
- [ ] Hỏi đáp 11 câu; Điều khoản và Chính sách dữ liệu có link ở chân trang mọi trang.
- [ ] Không còn: số người dùng/đánh giá giả, “Connector”, “Custom GPT/Gem”, “không phải phần mềm riêng”, giá nghề chưa mở.
- [ ] Mỗi trang đúng một khoảnh khắc chuyển động chủ đạo; `prefers-reduced-motion` vẫn đủ nội dung; mobile 390px không cuộn ngang.
- [ ] Build 0 lỗi, deploy xanh, mở link thật ở cửa sổ ẩn danh.
