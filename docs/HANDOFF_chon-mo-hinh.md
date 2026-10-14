# Kết nối AI & chọn mô hình – hiện trạng

> Repo `ai-lanh-nghe-app` · Cập nhật 14/10/2026 theo code trên `main` (PR #1: 2c62f10 → ea81195).
> Phần này **đã làm xong**. File mô tả cách hệ thống đang chạy và các việc còn tồn. Bản thiết kế ban đầu (sửa bảng `ai_connections`) **không còn đúng**: xem lịch sử git nếu cần.

## 1. Nguyên tắc
- **AI của khách, khách quyết.** Hệ thống không chọn sẵn mô hình, không gắn nhãn "khuyên dùng" cho hãng nào, không tự đổi mô hình khi khách chưa cho phép.
- Hệ thống chỉ đưa thông tin trung lập: giá ước tính mỗi lượt, độ dài ngữ cảnh, đáp ứng yêu cầu kỹ thuật hay không, đã qua bộ kiểm thử gói nghề hay chưa.
- Ngoại lệ: **5 lượt dùng thử** chạy bằng key của nhóm, mô hình do nhóm cấu hình (`TRIAL_*`).

## 2. Kết nối AI (nhiều AI cùng lúc)
| Ai | Cách kết nối | Nguồn (`source`) |
|---|---|---|
| Cá nhân | OpenRouter một chạm (OAuth PKCE) | `openrouter_oauth` |
| Cá nhân | Dán key Gemini | `gemini_key` |
| Cá nhân | Dán key OpenAI | `openai_key` |
| Doanh nghiệp | Quản trị viên gắn **key công ty**, chọn nhà cung cấp OpenRouter / Gemini / OpenAI | `company_key` |

- Mỗi tổ chức kết nối được **nhiều AI**, mỗi nhà cung cấp một key. Bảng `ai_keys`, khóa `(org_id, provider)`, key mã hóa AES-256-GCM, chỉ hiện 4 ký tự cuối.
- Gắn lại key cùng nhà cung cấp → thay key cũ, giữ mô hình đã chọn.
- Gỡ một AI: mô hình chính thuộc AI đó → bỏ lựa chọn (khách phải chọn lại); dự phòng thuộc AI đó → tắt dự phòng.
- Một key lỗi không làm mất danh sách mô hình của các AI khác.

## 3. Danh sách mô hình
- `GET /api/ai/models`: gộp mô hình từ **mọi AI đã kết nối**, cache 1 giờ (không ghi D1). Mỗi AI chỉ trả mô hình của chính nó: key Gemini → `gemini-*`; key OpenAI → mô hình chat của OpenAI; OpenRouter → mọi hãng trên OpenRouter.
- Mỗi mô hình: nhà cung cấp, id, tên, hãng, ngữ cảnh, giá vào/ra (USD/1 triệu token), `jsonOk`, đã kiểm thử, lý do khóa.
- **Giá mỗi lượt** = (6.000 × giá vào + 2.000 × giá ra) / 1.000.000 × `USD_VND`. OpenRouter có giá qua API; Gemini/OpenAI lấy từ bảng tĩnh `src/lib/model-prices.ts`; không có giá thì hiện "—".
- **Khóa (không cho chọn, có ghi lý do):** không trả được JSON ổn định, hoặc ngữ cảnh < 32.000 token.
- Sắp theo tên A→Z, lọc được theo AI, theo "đã kiểm thử", theo giá và ngữ cảnh. Không có mô hình nào chọn sẵn.

## 4. Chọn mô hình & dự phòng
- `POST /api/ai/model` lưu vào `ai_model_choice (org_id, provider, model, allow_fallback, fallback_provider, fallback_model)`. Máy chủ kiểm tra lại mô hình có trong danh sách và không bị khóa.
- **Doanh nghiệp: chỉ quản trị viên** được đổi mô hình; thành viên chỉ thấy tên mô hình đang dùng.
- Dự phòng khi quá tải: mặc định **báo lỗi để khách thử lại**. Khách có thể bật dự phòng và tự chọn mô hình dự phòng; mô hình này **có thể thuộc AI khác** của khách, phải khác mô hình chính. Gateway chỉ thử lại **một lần**.
- Chưa chọn mô hình → chặn chạy, dẫn sang bước chọn.

## 5. Giao diện
- `/app/ket-noi-ai/` (`ConnectAI.tsx` + `ModelPicker.tsx`): danh sách AI đã kết nối, thêm/gỡ key, chọn mô hình.
- `/app/lam-viec/` (`ModelBar.tsx`): "Mô hình: … · ≈ …/lượt · Đổi".
- Bảng điều khiển & quản trị (`ModelUsage.tsx`): thống kê lượt, token theo mô hình (`runs.provider`, `runs.model`).

## 6. Gateway (`src/lib/ai-gateway.ts`)
- Không còn mô hình gắn cứng (bỏ `GEMINI_MODEL`, `OPENROUTER_MODEL`, `OPENAI_MODEL`, chuỗi dự phòng Gemini).
- Mô hình không nhận `response_format` → tự gửi lại không có tham số đó; Gemini không nhận `thinkingConfig` → gửi lại không có.
- Lớp che dữ liệu và việc ghép prompt không đổi.

## 7. Cấu hình
| Biến (`wrangler.jsonc` / GitHub Variables) | Giá trị hiện tại | Ghi chú |
|---|---|---|
| `TRIAL_PROVIDER` | `openrouter` | Đặt Variable để ghi đè khi deploy |
| `TRIAL_MODEL` | `anthropic/claude-sonnet-5.5` | Bảng chi phí đề xuất `gemini-3.8-flash` (≈ 4,7 tr thay vì ≈ 13,3 tr cho 3.000 người thử). **Nhóm cần chốt.** Đổi sang Gemini thì đặt cả `TRIAL_PROVIDER=gemini` và secret `TRIAL_API_KEY` là key Gemini trả phí |
| `TRIAL_FALLBACK_MODEL` | trống | |
| `USD_VND` | `26000` | Bảng chi phí & báo cáo dùng 26.200; nên để 26.200 cho khớp |

## 8. Dữ liệu (migration 0003, đã chạy trên D1 thật)
- Chuyển `ai_connections` → `ai_keys` rồi **xóa** `ai_connections`.
- Thêm `ai_model_choice`; `runs` thêm `provider`, `model`.
- Tổ chức kết nối từ trước chưa có dòng trong `ai_model_choice` → bị chặn chạy tới khi quản trị viên chọn mô hình.
- `db/seed.sql` không tạo key AI cho tài khoản demo, nên tài khoản demo chạy bằng lượt thử. Muốn trình diễn bước kết nối và chọn mô hình ở buổi báo cáo: đăng nhập `lan@ailanhnghe.demo`, gắn một key thật, chọn mô hình **trước giờ báo cáo**.

## 9. Việc còn tồn
- [ ] **Bảng giá tĩnh thiếu các mô hình Gemini 3.x**: `gemini-3.8-flash` (0,75 / 3,75 USD đến 31/12/2026; 1,50 / 7,50 từ 01/01/2027), `gemini-3.5-flash-lite` (0,30 / 2,50). Hiện các mô hình này hiện giá "—". Rà thêm `gemini-3.7-flash` và các mô hình OpenAI mới theo trang giá chính thức.
- [ ] `src/skills/tested-models.json` đang **rỗng**: chưa mô hình nào có nhãn "Đã kiểm thử". Chạy 3 tình huống Mua hàng với dữ liệu mẫu trên vài mô hình rồi ghi `{ "id", "date", "passed", "total" }`.
- [ ] Chốt `TRIAL_MODEL` (mục 7) và `USD_VND`.
- [ ] Trước buổi báo cáo: gắn key và chọn mô hình cho tài khoản demo dùng để trình diễn (mục 8).
- [ ] Nội dung trang công khai (`/cach-hoat-dong/`, `/an-toan/`, `/hoi-dap/`): thêm câu "Bạn tự chọn mô hình trong tài khoản AI của mình, có thể kết nối nhiều AI. AI Lành Nghề không chọn thay." Phần Hỏi đáp đã ghi trong `WEBSITE_PART2_AI-LanhNghe.md` mục 4.
