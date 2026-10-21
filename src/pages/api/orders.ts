import type { APIRoute } from "astro";
import { randomId } from "../../lib/crypto";
import { db, now } from "../../lib/db";
import { fail, json, readJson, route } from "../../lib/http";
import { licenseEnd, periodStart } from "../../lib/license";
import { checkBuyer, isBusiness, orderCode, type Buyer } from "../../lib/order";
import { donDatMua, LoiTinhTien, type GoiDatMua } from "../../lib/pricing";
import { requireAuth } from "../../lib/session";

export const prerender = false;

interface Body { goi?: string; seat?: number; tinh_chinh?: boolean; pay?: string; code?: string; buyer?: Buyer }
interface OrgRow { id: string; name: string; plan: GoiDatMua; seats: number; expires_at: number | null }
const PLANS: GoiDatMua[] = ["personal", "business", "business_plus"];
const cut = (v: string | undefined, n: number) => (v ?? "").trim().slice(0, n) || null;

/** Tổ chức nhận license: tài khoản cá nhân của người mua, hoặc doanh nghiệp người mua đang quản trị. */
async function targetOrg(userId: string, biz: boolean) {
  return db().prepare(
    `SELECT o.id, o.name, o.plan, o.seats, o.expires_at FROM members m JOIN organizations o ON o.id = m.org_id
     WHERE m.user_id = ? AND m.role = 'admin' AND m.status = 'active' AND ${biz ? "o.plan != 'personal'" : "o.plan = 'personal'"} LIMIT 1`
  ).bind(userId).first<OrgRow>();
}

/**
 * Đặt mua + thanh toán mô phỏng + cấp license. Phải đăng nhập: license gắn vào tài khoản đang đăng nhập.
 * Giá tính lại ở máy chủ bằng pricing.ts (không tin số tiền từ trình duyệt). Còn hạn thì kỳ mới nối tiếp sau ngày hết hạn.
 * Doanh nghiệp: người mua chưa quản trị doanh nghiệp nào thì tạo tổ chức mới, người mua là quản trị viên.
 * Không lưu họ tên, số điện thoại, số thẻ hay tài khoản.
 */
export const POST: APIRoute = route(async ({ request, cookies }) => {
  const { user } = await requireAuth(cookies);
  const b = await readJson<Body>(request);
  const goi = PLANS.includes(b.goi as GoiDatMua) ? (b.goi as GoiDatMua) : fail(400, "Gói không hợp lệ.");
  const seat = goi === "personal" ? 1 : Number(b.seat);
  if (!Number.isInteger(seat) || seat < 1 || seat > 10000) fail(400, "Số seat phải là số nguyên từ 1.");
  if (!["bank", "vnpay", "momo"].includes(b.pay ?? "")) fail(400, "Cách thanh toán không hợp lệ.");
  const buyer = { ...(b.buyer ?? ({} as Buyer)), email: user.email };
  if (Object.keys(checkBuyer(goi, buyer)).length) fail(400, "Thông tin người mua chưa đủ hoặc sai định dạng.");

  const biz = isBusiness(goi);
  const t = now();
  let org = await targetOrg(user.id, biz);
  const stmts = [];
  if (org) {
    const used = await db().prepare("SELECT COUNT(*) AS n FROM members WHERE org_id = ? AND status IN ('active','invited')").bind(org.id).first<{ n: number }>();
    if ((used?.n ?? 0) > seat) fail(409, `Doanh nghiệp đang dùng ${used!.n} seat. Chọn từ ${used!.n} seat trở lên hoặc thu hồi bớt seat trước.`);
  } else {
    org = { id: "org_" + randomId(10), name: biz ? cut(buyer.company, 120)! : "Cá nhân – " + user.email.split("@")[0], plan: goi, seats: seat, expires_at: null };
    stmts.push(
      db().prepare("INSERT INTO organizations (id, name, plan, seats) VALUES (?, ?, ?, ?)").bind(org.id, org.name, goi, seat),
      db().prepare("INSERT INTO members (org_id, user_id, role, status) VALUES (?, ?, 'admin', 'active')").bind(org.id, user.id)
    );
  }

  let don;
  try { don = donDatMua({ goi, seat, tinhChinh: !!b.tinh_chinh, ngayBatDau: periodStart(org.expires_at, t) }); }
  catch (e) { return fail(400, e instanceof LoiTinhTien ? e.message : "Không tính được giá đơn này."); }

  const id = /^ALN-\d{6}-[A-Z0-9]{4}$/.test(b.code ?? "") ? b.code! : orderCode();
  const lic = "lic_" + randomId(10);
  stmts.push(
    db().prepare(
      `INSERT INTO orders (id, created_at, plan, seats, addon_tinh_chinh, subtotal, discount, total, buyer_type, company, tax_code, email, pay_method, valid_from, valid_to, status, user_id, org_id, paid_at, license_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?, ?)`
    ).bind(id, t, goi, seat, b.tinh_chinh ? 1 : 0, don.tongNiemYet, don.tongUuDai, don.tongThanhToan,
      biz ? "business" : "personal", biz ? cut(buyer.company, 200) : null, biz ? cut(buyer.tax_code, 14) : null,
      user.email, b.pay, don.ky.batDau, don.ky.hetHan, user.id, org.id, t, lic),
    db().prepare("INSERT INTO licenses (id, org_id, order_id, plan, seats, valid_from, valid_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(lic, org.id, id, goi, seat, don.ky.batDau, don.ky.hetHan, t),
    db().prepare("UPDATE organizations SET plan = ?, seats = ?, expires_at = ? WHERE id = ?").bind(goi, seat, licenseEnd(don.ky.hetHan), org.id)
  );
  try { await db().batch(stmts); }
  catch (e) {
    if (e instanceof Error && /UNIQUE/i.test(e.message)) return fail(409, "Mã đơn đã tồn tại. Bạn tải lại trang để tạo đơn mới.");
    throw e;
  }

  const ai = await db().prepare("SELECT 1 AS ok FROM ai_keys WHERE org_id = ? LIMIT 1").bind(org.id).first();
  return json({
    id, total: don.tongThanhToan, valid_from: don.ky.batDau, valid_to: don.ky.hetHan, license_id: lic, org_name: org.name,
    next: biz ? "/app/quan-tri/" : ai ? "/app/tinh-huong/" : "/app/ket-noi-ai/"
  });
});
