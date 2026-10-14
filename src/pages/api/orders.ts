import type { APIRoute } from "astro";
import { db, now } from "../../lib/db";
import { fail, json, readJson, route } from "../../lib/http";
import { checkBuyer, isBusiness, orderCode, type Buyer } from "../../lib/order";
import { donDatMua, LoiTinhTien, type GoiDatMua } from "../../lib/pricing";

export const prerender = false;

interface Body { goi?: string; seat?: number; tinh_chinh?: boolean; pay?: string; code?: string; buyer?: Buyer }
const PLANS: GoiDatMua[] = ["personal", "business", "business_plus"];
const cut = (v: string | undefined, n: number) => (v ?? "").trim().slice(0, n) || null;

/**
 * Ghi đơn đặt mua mô phỏng. Giá tính lại ở máy chủ bằng pricing.ts (không tin số tiền từ trình duyệt).
 * Không đổi gói của tài khoản nào; không lưu họ tên, số điện thoại, số thẻ hay tài khoản.
 */
export const POST: APIRoute = route(async ({ request }) => {
  const b = await readJson<Body>(request);
  const goi = PLANS.includes(b.goi as GoiDatMua) ? (b.goi as GoiDatMua) : fail(400, "Gói không hợp lệ.");
  const seat = goi === "personal" ? 1 : Number(b.seat);
  if (!Number.isInteger(seat) || seat < 1 || seat > 10000) fail(400, "Số seat phải là số nguyên từ 1.");
  if (!["bank", "vnpay", "momo"].includes(b.pay ?? "")) fail(400, "Cách thanh toán không hợp lệ.");
  const buyer = b.buyer ?? ({} as Buyer);
  if (Object.keys(checkBuyer(goi, buyer)).length) fail(400, "Thông tin người mua chưa đủ hoặc sai định dạng.");

  const today = new Date().toISOString().slice(0, 10);
  let don;
  try { don = donDatMua({ goi, seat, tinhChinh: !!b.tinh_chinh, ngayBatDau: today }); }
  catch (e) { return fail(400, e instanceof LoiTinhTien ? e.message : "Không tính được giá đơn này."); }

  const id = /^ALN-\d{6}-[A-Z0-9]{4}$/.test(b.code ?? "") ? b.code! : orderCode();
  const biz = isBusiness(goi);
  try {
    await db().prepare(
      `INSERT INTO orders (id, created_at, plan, seats, addon_tinh_chinh, subtotal, discount, total, buyer_type, company, tax_code, email, pay_method, valid_from, valid_to, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo_paid')`
    ).bind(id, now(), goi, seat, b.tinh_chinh ? 1 : 0, don.tongNiemYet, don.tongUuDai, don.tongThanhToan,
      biz ? "business" : "personal", biz ? cut(buyer.company, 200) : null, biz ? cut(buyer.tax_code, 14) : null,
      buyer.email.trim().toLowerCase().slice(0, 200), b.pay, don.ky.batDau, don.ky.hetHan).run();
  } catch (e) {
    if (e instanceof Error && /UNIQUE/i.test(e.message)) return fail(409, "Mã đơn đã tồn tại. Bạn tải lại trang để tạo đơn mới.");
    throw e;
  }
  return json({ id, total: don.tongThanhToan, valid_from: don.ky.batDau, valid_to: don.ky.hetHan });
});
