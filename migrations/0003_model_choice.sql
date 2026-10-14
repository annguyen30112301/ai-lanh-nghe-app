-- Khách kết nối nhiều AI (mỗi nhà cung cấp một key) và tự chọn mô hình. Không thêm cột nội dung.
CREATE TABLE ai_keys (
  org_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('openrouter_oauth','gemini_key','company_key')),
  key_ciphertext TEXT NOT NULL, key_iv TEXT NOT NULL, key_last4 TEXT NOT NULL, verified_at INTEGER,
  PRIMARY KEY (org_id, provider)
);
INSERT INTO ai_keys (org_id, provider, source, key_ciphertext, key_iv, key_last4, verified_at)
  SELECT org_id, provider, source, key_ciphertext, key_iv, key_last4, verified_at FROM ai_connections;
DROP TABLE ai_connections;

-- Mô hình khách chọn (không có dòng = chưa chọn). Dự phòng có thể thuộc AI khác của khách.
CREATE TABLE ai_model_choice (
  org_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL, model TEXT NOT NULL,
  allow_fallback INTEGER NOT NULL DEFAULT 0,
  fallback_provider TEXT, fallback_model TEXT
);

-- Mô hình thực chạy mỗi lượt (thống kê, đo chi phí).
ALTER TABLE runs ADD COLUMN provider TEXT;
ALTER TABLE runs ADD COLUMN model TEXT;
