-- License cấp sau khi thanh toán (mô phỏng). organizations.plan / seats / expires_at là trạng thái đang hiệu lực;
-- bảng licenses giữ lịch sử từng lần cấp (mỗi đơn một dòng). Từ bản này ghi đơn CÓ đổi gói (khác ghi chú ở 0004).
CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  order_id TEXT,
  plan TEXT NOT NULL CHECK(plan IN ('personal','business','business_plus')),
  seats INTEGER NOT NULL,
  valid_from TEXT NOT NULL,
  valid_to TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX licenses_org ON licenses(org_id, valid_to);

-- Đơn gắn với tài khoản đã đăng nhập và tổ chức nhận license.
ALTER TABLE orders ADD COLUMN user_id TEXT;
ALTER TABLE orders ADD COLUMN org_id TEXT;
ALTER TABLE orders ADD COLUMN paid_at INTEGER;
ALTER TABLE orders ADD COLUMN license_id TEXT;

-- Chống chia sẻ tài khoản: tối đa 2 thiết bị; phiên bị đẩy ra được đánh dấu (không xóa) để báo lý do.
ALTER TABLE sessions ADD COLUMN created_at INTEGER;
ALTER TABLE sessions ADD COLUMN last_seen INTEGER;
ALTER TABLE sessions ADD COLUMN revoked_at INTEGER;
ALTER TABLE sessions ADD COLUMN revoked_reason TEXT;
CREATE INDEX sessions_user ON sessions(user_id, expires_at);

-- Tài khoản demo cá nhân có license sẵn; ghi lịch sử license cho các tổ chức demo đang có hạn.
UPDATE organizations SET expires_at = CAST(strftime('%s','now') AS INTEGER) * 1000 + 300 * 86400000 WHERE id = 'org_demo' AND expires_at IS NULL;
INSERT INTO licenses (id, org_id, order_id, plan, seats, valid_from, valid_to, created_at)
  SELECT 'lic_seed_' || id, id, NULL, plan, seats, date('now'), date(expires_at / 1000, 'unixepoch'), CAST(strftime('%s','now') AS INTEGER) * 1000
  FROM organizations WHERE id IN ('org_tanphu','org_demo') AND expires_at IS NOT NULL;
