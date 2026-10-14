# Bàn giao: khách tự chọn mô hình AI

> Repo `ai-lanh-nghe-app` · Lập 14/10/2026 · Làm **trước** hoặc song song với `WEBSITE_PART2_AI-LanhNghe.md`.

## 1. Vì sao làm

Hiện `src/lib/ai-gateway.ts` gắn cứng mô hình qua biến môi trường: Gemini dùng `gemini-3.8-flash` và tự chuyển sang mô hình dự phòng, OpenRouter dùng `anthropic/claude-sonnet-5.5`, OpenAI dùng `gpt-4.1-mini`. Như vậy là mình đang chọn mô hình thay khách, trái với nguyên tắc **"AI của khách, khách quyết"**.

Nguyên tắc mới:
- Khách tự chọn mô hình trong tài khoản AI của mình. Hệ thống **không đặt sẵn mô hình**, **không gắn nhãn "khuyên dùng" cho hãng nào**, và **không tự đổi mô hình** khi khách chưa cho phép.
- Hệ thống chỉ đưa **thông tin trung lập** để khách tự chọn: giá ước tính mỗi lượt, độ dài ngữ cảnh, đáp ứng được yêu cầu kỹ thuật hay không, đã kiểm thử với gói nghề hay chưa.
- Ngoại lệ: **5 lượt dùng thử** chạy bằng key của nhóm nên nhóm chọn mô hình (cấu hình `TRIAL_PROVIDER`/`TRIAL_MODEL`). Trên màn hình ghi rõ: "Lượt dùng thử chạy trên <tên mô hình>. Khi kết nối AI của bạn, bạn tự chọn mô hình."

## 2. Dữ liệu

`migrations/0003_model_choice.sql`:
```sql
ALTER TABLE ai_connections ADD COLUMN model TEXT;            -- mô hình khách chọn, NULL = chưa chọn
ALTER TABLE ai_connections ADD COLUMN allow_fallback INTEGER NOT NULL DEFAULT 0; -- khách cho phép đổi khi quá tải
ALTER TABLE ai_connections ADD COLUMN fallback_model TEXT;   -- mô hình dự phòng do khách chọn
ALTER TABLE runs ADD COLUMN model TEXT;                       -- mô hình thực chạy (để thống kê, đo chi phí)
```
Không lưu gì thêm về nội dung.

## 3. Lấy danh sách mô hình

`GET /api/ai/models` (cần đăng nhập, đã có kết nối): máy chủ giải mã key, gọi API danh sách của nhà cung cấp, chuẩn hóa thành
`{ id, name, contextLength, priceIn, priceOut (USD / 1 triệu token, có thể null), jsonOk, tested }`. Lưu cache 1 giờ theo `org_id` (chỉ trong bộ nhớ hoặc Cache API, không ghi D1).

| Nguồn | API | Lọc |
|---|---|---|
| OpenRouter | `GET https://openrouter.ai/api/v1/models` | `context_length ≥ 32000`; `jsonOk` khi `supported_parameters` có `response_format` hoặc `structured_outputs`. Có sẵn giá. |
| Gemini | `GET /v1beta/models` (header `x-goog-api-key`, phân trang hết) | `supportedGenerationMethods` có `generateContent`; bỏ embedding, aqa, imagen. Không có giá: lấy từ bảng tĩnh `src/lib/model-prices.ts` nếu có, không có thì để trống. |
| OpenAI (key công ty) | `GET /v1/models` | Bỏ embedding, tts, whisper, dall-e, moderation. Giá từ bảng tĩnh nếu có. |

- `tested = true` khi mô hình nằm trong `src/skills/tested-models.json`. File này do nhóm cập nhật sau mỗi lần chạy bộ kiểm thử gói nghề, ghi tên mô hình, ngày kiểm thử, số tình huống đạt / tổng.
- Mô hình `jsonOk = false` hoặc ngữ cảnh < 32k: vẫn hiện, nhưng có cảnh báo và **không cho chọn**, kèm lý do ("không trả được dữ liệu dạng bảng ổn định", "không đủ dài cho 3 báo giá").

## 4. Giao diện

### 4.1 `/app/ket-noi-ai/` (`ConnectAI.tsx`), thêm bước 2 "Chọn mô hình" sau khi xác minh key
- Ô tìm kiếm + danh sách. **Sắp xếp theo tên (A→Z)**, không sắp theo hãng. Bộ lọc: "Đã kiểm thử với gói nghề", "Giá / lượt ≤ …", "Ngữ cảnh ≥ …".
- Mỗi dòng: tên, nhà cung cấp, **giá ước tính mỗi lượt** = `(6.000 × priceIn + 2.000 × priceOut) / 1e6 × tỷ giá`, làm tròn đến 10 đ; hiện "—" khi không có giá. Thêm ngữ cảnh và nhãn "Đã kiểm thử 3/3" nếu có.
- Không có mô hình nào được chọn sẵn. Nút "Lưu" chỉ bật khi đã chọn.
- Mục phụ (thu gọn): "Khi mô hình quá tải" gồm 2 lựa chọn: *Báo lỗi để tôi thử lại* (mặc định, vì đây là hành vi, không phải mô hình) / *Chuyển sang mô hình dự phòng tôi chọn*, kèm ô chọn mô hình dự phòng.
- Dòng ghi chú: "Giá do nhà cung cấp AI thu trực tiếp từ tài khoản của bạn. AI Lành Nghề không thu phí AI."

### 4.2 `/app/lam-viec/`
- Trên nút chạy hiện "Mô hình: <tên> · ≈ <giá>/lượt · Đổi". Bấm "Đổi" mở lại danh sách (cùng component). Doanh nghiệp: chỉ quản trị viên được đổi, thành viên chỉ thấy tên mô hình.
- Chưa chọn mô hình thì chặn chạy, dẫn sang bước chọn.

### 4.3 `/app/quan-tri/` và bảng điều khiển
- Thống kê lượt theo `runs.model` (số lượt, token vào/ra, chi phí ước tính).

## 5. Sửa `ai-gateway.ts`
- Bỏ `GEMINI_MODEL`, `OPENROUTER_MODEL`, `OPENAI_MODEL`, bỏ chuỗi `GEMINI_FALLBACKS` gắn cứng. Mô hình lấy từ `ai_connections.model`.
- Khi lỗi 429/503: nếu `allow_fallback = 1` và có `fallback_model`, thử lại **một lần** bằng mô hình đó và ghi `runs.model` là mô hình thực chạy; nếu không thì trả lỗi rõ ràng: "Mô hình <tên> đang quá tải. Thử lại sau hoặc đổi mô hình."
- Mô hình không hỗ trợ `response_format`: không gửi tham số đó; dùng prompt yêu cầu JSON + bóc JSON từ văn bản + kiểm tra schema hiện có. Gemini: giữ `responseMimeType: application/json`.
- Biến cho lượt dùng thử: thêm `TRIAL_MODEL` (đặt trong `wrangler.jsonc`), đề xuất `gemini-3.8-flash` theo bảng chi phí. Chỉ dùng cho lượt thử.
- Không thay đổi lớp che dữ liệu và việc ghép prompt.

## 6. Nội dung trang
- `vi.ts`, `/cach-hoat-dong/`, `/an-toan/`, `/hoi-dap/`: thêm câu "Bạn tự chọn mô hình trong tài khoản AI của mình. AI Lành Nghề không chọn thay." Không nêu tên mô hình nào là khuyên dùng.
- Hỏi đáp (WEBSITE_PART2 mục 4) thêm câu: **"Nên chọn mô hình nào?"** → "Tùy ngân sách và yêu cầu chất lượng. Danh sách hiện giá mỗi lượt và mô hình nào đã qua bộ kiểm thử gói nghề để bạn so sánh. Tránh bậc miễn phí của nhà cung cấp nếu bậc đó cho phép dùng dữ liệu để huấn luyện."

## 7. Kiểm thử (Vitest)
- Chuẩn hóa danh sách cho cả 3 nguồn (dùng JSON mẫu, không gọi mạng).
- Tính giá mỗi lượt; giá null → "—".
- Gateway: dùng đúng mô hình đã lưu; không tự đổi khi `allow_fallback = 0`; đổi đúng một lần khi = 1.
- Chặn chạy khi `model` NULL.
- `AI_MOCK` vẫn chạy được không cần key.

## 8. Xong khi
- [x] Không còn tên mô hình gắn cứng trong `ai-gateway.ts` (trừ `TRIAL_MODEL` cấu hình).
- [x] Kết nối xong phải chọn mô hình mới chạy được; không có lựa chọn sẵn.
- [x] Danh sách sắp theo tên, có giá/lượt, nhãn đã kiểm thử, lý do khóa với mô hình không đạt yêu cầu.
- [x] `runs.model` có giá trị cho mọi lượt mới.
- [x] Test qua, build 0 lỗi. Còn lại: deploy (push `main`) — workflow tự chạy migration 0003 trên D1 thật.

## 9. Ghi chú triển khai (14/10/2026)
- Danh sách chỉ gồm mô hình của nhà cung cấp ứng với key: key Gemini → chỉ `gemini-*`; key OpenAI → chỉ mô hình chat của OpenAI; OpenRouter → nhiều hãng (một key OpenRouter dùng được mọi hãng trên OpenRouter). Lưu mô hình cũng kiểm tra lại theo đúng danh sách đó.
- Code: `src/lib/models.ts` (chuẩn hóa, giá/lượt, khóa), `src/lib/models-fetch.ts` (gọi API + cache 1 giờ), `src/pages/api/ai/models.ts` (GET), `src/pages/api/ai/model.ts` (POST lưu), `src/islands/ModelPicker.tsx`, `ModelBar.tsx`, `ModelUsage.tsx`.
- `src/skills/tested-models.json` đang **rỗng**: chưa mô hình nào có nhãn "Đã kiểm thử" cho tới khi nhóm chạy bộ kiểm thử và ghi `{ "id", "date", "passed", "total" }`.
- `src/lib/model-prices.ts` mới có giá niêm yết một số mô hình Gemini/OpenAI; mô hình khác hiện "—". Nhóm rà lại theo trang giá.
- Tỷ giá ước tính: `USD_VND` trong `wrangler.jsonc` (26.000).
- Lượt dùng thử: giữ nguyên hành vi đang chạy. `TRIAL_MODEL` mặc định `anthropic/claude-sonnet-5.5` (OpenRouter); nếu repo đặt `TRIAL_PROVIDER=gemini` thì deploy tự đặt `gemini-3.8-flash` + dự phòng `gemini-3.7-flash`. Muốn theo đề xuất `gemini-3.8-flash` cho mọi trường hợp: đặt Variable `TRIAL_MODEL` (và `TRIAL_PROVIDER`/`TRIAL_API_KEY` tương ứng).
- Gateway: mô hình không nhận `response_format` → tự gửi lại không có tham số đó; Gemini không nhận `thinkingConfig` → gửi lại không có.
- **Nhiều AI cùng lúc:** mỗi tổ chức kết nối được nhiều AI (mỗi nhà cung cấp một key, bảng `ai_keys`, khóa `(org_id, provider)`). Danh sách mô hình gộp từ mọi AI đã kết nối, sắp theo tên, lọc được theo AI. Mô hình chọn lưu ở `ai_model_choice` gồm cả nhà cung cấp; dự phòng có thể thuộc AI khác. Gắn lại key cùng nhà cung cấp thì thay key cũ, giữ mô hình. Gỡ một AI: nếu mô hình chính thuộc AI đó thì bỏ lựa chọn, nếu dự phòng thuộc AI đó thì tắt dự phòng. Một key lỗi không làm mất danh sách của AI khác.
- Migration 0003 chuyển dữ liệu `ai_connections` sang `ai_keys` rồi **xóa bảng `ai_connections`**. `runs` thêm `provider` + `model`.
- Sau migration, các tổ chức **đã kết nối từ trước** chưa có dòng trong `ai_model_choice` nên bị chặn chạy cho tới khi quản trị viên chọn mô hình (đúng nguyên tắc, nhưng cần báo khách cũ).
