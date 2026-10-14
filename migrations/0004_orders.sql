-- Đơn đặt mua (mô phỏng TMĐT). Không lưu số thẻ / tài khoản ngân hàng, không lưu họ tên, số điện thoại.
-- Ghi đơn KHÔNG đổi gói của tài khoản nào (kể cả tài khoản demo trùng email).
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  plan TEXT NOT NULL CHECK(plan IN ('personal','business','business_plus')),
  seats INTEGER NOT NULL,
  addon_tinh_chinh INTEGER NOT NULL DEFAULT 0,   -- cá nhân: đã mua Tinh chỉnh; doanh nghiệp: yêu cầu báo giá Tinh chỉnh
  subtotal INTEGER NOT NULL,                     -- giá niêm yết
  discount INTEGER NOT NULL,                     -- ưu đãi
  total INTEGER NOT NULL,                        -- tổng thanh toán
  buyer_type TEXT NOT NULL CHECK(buyer_type IN ('personal','business')),
  company TEXT,
  tax_code TEXT,
  email TEXT NOT NULL,
  pay_method TEXT NOT NULL CHECK(pay_method IN ('bank','vnpay','momo')),
  valid_from TEXT NOT NULL,
  valid_to TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'demo_paid'
);
CREATE INDEX orders_created ON orders(created_at);
