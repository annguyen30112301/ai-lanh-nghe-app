-- Khách tự chọn mô hình AI. Không thêm cột nội dung.
ALTER TABLE ai_connections ADD COLUMN model TEXT;                               -- mô hình khách chọn, NULL = chưa chọn
ALTER TABLE ai_connections ADD COLUMN allow_fallback INTEGER NOT NULL DEFAULT 0; -- khách cho phép đổi khi quá tải
ALTER TABLE ai_connections ADD COLUMN fallback_model TEXT;                      -- mô hình dự phòng do khách chọn
ALTER TABLE runs ADD COLUMN model TEXT;                                         -- mô hình thực chạy (thống kê, đo chi phí)
