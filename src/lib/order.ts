// Kiểm tra thông tin đặt mua – dùng chung trình duyệt và máy chủ.
import type { GoiDatMua } from "./pricing";

export interface Buyer {
  name: string; email: string; phone: string;
  company?: string; tax_code?: string; address?: string; invoice_email?: string; note?: string;
}
export type BuyerErrors = Partial<Record<"name" | "email" | "phone" | "company" | "tax" | "address" | "invoiceEmail", true>>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** MST: 10 số, hoặc 10 số kèm 3 số chi nhánh (0312345678-001). */
export const TAX_RE = /^\d{10}(-\d{3})?$/;
export const isBusiness = (g: GoiDatMua) => g !== "personal";

export function checkBuyer(goi: GoiDatMua, b: Buyer): BuyerErrors {
  const e: BuyerErrors = {};
  if (!b.name?.trim()) e.name = true;
  if (!EMAIL_RE.test(b.email?.trim() ?? "")) e.email = true;
  const digits = (b.phone ?? "").replace(/[\s.+-]/g, "").replace(/^84/, "0");
  if (!/^\d{10,11}$/.test(digits)) e.phone = true;
  if (isBusiness(goi)) {
    if (!b.company?.trim()) e.company = true;
    if (!TAX_RE.test(b.tax_code?.trim() ?? "")) e.tax = true;
    if (!b.address?.trim()) e.address = true;
    if (!EMAIL_RE.test(b.invoice_email?.trim() ?? "")) e.invoiceEmail = true;
  }
  return e;
}

/** Mã đơn dạng ALN-260114-4F7K. */
export function orderCode(now = new Date(), rand = () => Math.random()) {
  const d = now.toISOString().slice(2, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(rand() * chars.length)];
  return `ALN-${d}-${s}`;
}
