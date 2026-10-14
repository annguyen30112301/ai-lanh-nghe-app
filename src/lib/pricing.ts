/*
 * AI Lành Nghề – bộ tính tiền (port từ assets/js/tinh-tien.js của site cũ, phiên bản 2026-09-16).
 * Hàm thuần, không phụ thuộc giao diện: chạy được ở trình duyệt và server.
 *
 * Giữ nguyên nguyên tắc tính của bản cũ:
 *  - Gói nghề theo năm (doanh nghiệp × seat); Tinh chỉnh một lần, không nhân seat, không thu lại khi gia hạn.
 *  - Ưu đãi quy mô theo tổng seat; ưu đãi mở rộng nghề (cá nhân trên cả subscription, doanh nghiệp trong từng nhóm seat).
 *  - Mua thêm giữa kỳ tính theo ngày còn lại; giảm seat, bỏ/đổi nghề áp từ kỳ sau; không hồi tố; giới hạn giảm 50%/dòng.
 *  - Thuế GTGT chưa chốt: mỗi dòng mang loaiThue = null.
 * Quyết định đã chốt 14/10/2026 (WEBSITE_PLAN mục 9b) nằm trong CAU_HINH bên dưới:
 *  - Chỉ Mua hàng bán được. Giảng dạy, Hành chính – Nhân sự: goiNghe = null (sắp ra mắt) → không vào được đơn.
 *  - Cá nhân 690.000 đ/năm, Tinh chỉnh cá nhân 800.000 đ/lần.
 *  - Business 690.000 đ/người/năm, Business Plus 990.000 đ/người/năm.
 *  - Tinh chỉnh doanh nghiệp = null → "Liên hệ báo giá", không cộng vào đơn.
 */

export type LoaiKhach = "CA_NHAN" | "DOANH_NGHIEP";
export type Hang = "business" | "business_plus";

export interface NgheGia {
  id: string;
  ten: string;
  dangBan: boolean;
  /** đ/năm (cá nhân) hoặc đ/seat/năm (Business); null = chưa có giá, không bán */
  goiNghe: number | null;
  /** đ/seat/năm cho Business Plus; null = chưa có giá */
  goiNghePlus?: number | null;
  /** Tinh chỉnh cá nhân, đ/lần */
  tinhChinh: number | null;
  /** Tinh chỉnh doanh nghiệp, đ/lần; null = theo báo giá */
  tinhChinhDN: number | null;
}
export interface CauHinh {
  phienBan: string;
  /** thứ tự khai báo = thứ tự danh mục (dùng khi hai nghề cùng giá) */
  nghe: NgheGia[];
  /** % giảm theo thứ tự nghề #1, #2, #3, #4, #5+ */
  moRongNghe: number[];
  /** [từ seat, %] từ cao xuống thấp */
  quyMo: [number, number][];
  /** [từ số dịch vụ, %] từ cao xuống thấp */
  tinhChinh: [number, number][];
  gioiHanGiam: number;
}

export const CAU_HINH: CauHinh = {
  phienBan: "2026-10-14",
  nghe: [
    { id: "mua-hang", ten: "Mua hàng", dangBan: true, goiNghe: 690000, goiNghePlus: 990000, tinhChinh: 800000, tinhChinhDN: null },
    { id: "giang-day", ten: "Giảng dạy", dangBan: false, goiNghe: null, goiNghePlus: null, tinhChinh: null, tinhChinhDN: null },
    { id: "hanh-chinh-nhan-su", ten: "Hành chính – Nhân sự", dangBan: false, goiNghe: null, goiNghePlus: null, tinhChinh: null, tinhChinhDN: null }
  ],
  moRongNghe: [0, 10, 20, 25, 30],
  quyMo: [[500, 30], [250, 25], [100, 20], [50, 15], [25, 10], [10, 5], [1, 0]],
  tinhChinh: [[5, 20], [4, 15], [3, 10], [2, 5], [1, 0]],
  gioiHanGiam: 50
};

export const CA_NHAN: LoaiKhach = "CA_NHAN";
export const DOANH_NGHIEP: LoaiKhach = "DOANH_NGHIEP";

export class LoiTinhTien extends Error {
  constructor(public ma: string, message: string) { super(message); }
}
const Loi = (ma: string, thongDiep: string) => new LoiTinhTien(ma, thongDiep);
const sao = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/* ---------- Ngày ---------- */

const MS_NGAY = 86400000;
function docNgay(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) throw Loi("NGAY_KHONG_HOP_LE", "Ngày phải có dạng YYYY-MM-DD: " + s);
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  if (new Date(t).toISOString().slice(0, 10) !== s) throw Loi("NGAY_KHONG_HOP_LE", "Ngày không tồn tại: " + s);
  return t;
}
const vietNgay = (t: number) => new Date(t).toISOString().slice(0, 10);
/** Số ngày tính cả hai đầu. */
export const soNgay = (tu: string, den: string) => Math.round((docNgay(den) - docNgay(tu)) / MS_NGAY) + 1;
const congNgay = (s: string, n: number) => vietNgay(docNgay(s) + n * MS_NGAY);

export interface Ky { batDau: string; hetHan: string; soNgay: number }
/** Kỳ 1 năm: từ ngày bắt đầu tới ngày trước ngày cùng tên năm sau (29/02 → hết hạn 28/02). */
export function taoKy(batDau: string): Ky {
  const t = new Date(docNgay(batDau));
  const nam = t.getUTCFullYear() + 1, thang = t.getUTCMonth(), ngay = t.getUTCDate();
  let sau = Date.UTC(nam, thang, ngay);
  if (new Date(sau).getUTCMonth() !== thang) sau = Date.UTC(nam, thang + 1, 1);
  const hetHan = vietNgay(sau - MS_NGAY);
  return { batDau, hetHan, soNgay: soNgay(batDau, hetHan) };
}

/* ---------- Tra cứu ---------- */

function timNghe(id: string, ch: CauHinh) {
  const viTri = ch.nghe.findIndex((n) => n.id === id);
  if (viTri < 0) throw Loi("NGHE_KHONG_TON_TAI", "Không có nghề " + id);
  return { nghe: ch.nghe[viTri], viTri };
}
function giaGoiNghe(id: string, ch: CauHinh, hang: Hang = "business") {
  const n = timNghe(id, ch).nghe;
  const gia = hang === "business_plus" ? n.goiNghePlus ?? null : n.goiNghe;
  if (gia == null) throw Loi("CHUA_CO_GIA", "Gói nghề " + n.ten + " chưa có giá niêm yết");
  return gia;
}
const tyLeMoRong = (thuTu: number, ch: CauHinh) => ch.moRongNghe[Math.min(thuTu, ch.moRongNghe.length) - 1];

export interface BacQuyMo { tongSeat: number; tyLe: number; tuSeat: number; denSeat: number | null }
export function bacQuyMo(tongSeat: number, ch: CauHinh = CAU_HINH): BacQuyMo {
  for (let i = 0; i < ch.quyMo.length; i++) {
    const b = ch.quyMo[i];
    if (tongSeat >= b[0]) return { tongSeat, tyLe: b[1], tuSeat: b[0], denSeat: i === 0 ? null : ch.quyMo[i - 1][0] - 1 };
  }
  return { tongSeat, tyLe: 0, tuSeat: 0, denSeat: 0 };
}
function tyLeTinhChinh(soDichVu: number, ch: CauHinh) {
  for (const [tu, tyLe] of ch.tinhChinh) if (soDichVu >= tu) return tyLe;
  return 0;
}

/* ---------- Số học: số nguyên, làm tròn nửa lên một lần ở cuối dòng ---------- */

const chiaLamTron = (tu: bigint, mau: bigint) => Number((2n * tu + mau) / (2n * mau));
/** 1234567 → "1.234.567"; số âm có dấu "−". */
export function dinhDang(n: number) {
  const s = String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (n < 0 ? "−" : "") + s;
}
const dinhDangTyLe = (p: number) => String(Math.round(p * 100) / 100).replace(".", ",") + "%";

/* ---------- Một dòng Gói nghề ---------- */

export interface Giam { loai: "QUY_MO" | "MO_RONG_NGHE"; ten: string; tyLe: number; lyDo: string }
export interface Buoc { nhan: string; lyDo?: string; giaTri: number }
export interface DongGoiNghe {
  loai: "GOI_NGHE"; maNhom: string; ngheId: string; tenNghe: string; seat: number; thuTu: number;
  donGia: number; giaNiemYet: number; giam: Giam[]; mucGiam: number; chamGioiHan: boolean;
  thoiGian: { conLai: number; ky: number } | null; thanhTienDuKy: number; thanhTien: number;
  loaiThue: null; moTa: string; buoc: Buoc[];
}
interface DongVao {
  loaiKhach: LoaiKhach; maNhom: string; ngheId: string; tenNghe: string; seat: number; thuTu: number;
  donGia: number; giam: Giam[]; thoiGian: { conLai: number; ky: number } | null;
}

function tinhDong(dong: DongVao, ch: CauHinh): DongGoiNghe {
  const niemYet = dong.donGia * dong.seat;
  const giam = dong.giam.filter((g) => g.tyLe > 0);
  let tu = 1n, mau = 1n;
  for (const g of giam) { tu *= BigInt(100 - g.tyLe); mau *= 100n; }
  let mucGiam = 100 - (Number(tu) / Number(mau)) * 100;
  const mucGiamGoc = mucGiam;
  const cham = mucGiam > ch.gioiHanGiam;
  if (cham) { tu = BigInt(100 - ch.gioiHanGiam); mau = 100n; mucGiam = ch.gioiHanGiam; }

  const duNam = chiaLamTron(BigInt(niemYet) * tu, mau);
  let thanhTien = duNam;
  if (dong.thoiGian) thanhTien = chiaLamTron(BigInt(niemYet) * tu * BigInt(dong.thoiGian.conLai), mau * BigInt(dong.thoiGian.ky));

  // Diễn giải từng bước cho khách tự kiểm.
  const buoc: Buoc[] = [{ nhan: dinhDang(dong.donGia) + (dong.loaiKhach === DOANH_NGHIEP ? " × " + dong.seat + " seat" : ""), giaTri: niemYet }];
  if (!cham) {
    let chayTu = BigInt(niemYet), chayMau = 1n;
    for (const g of giam) {
      chayTu *= BigInt(100 - g.tyLe); chayMau *= 100n;
      buoc.push({ nhan: "× (1 − " + g.tyLe + "%) " + g.ten, lyDo: g.lyDo, giaTri: chiaLamTron(chayTu, chayMau) });
    }
  } else {
    buoc.push({ nhan: "Giảm " + dinhDangTyLe(mucGiamGoc) + " vượt giới hạn " + ch.gioiHanGiam + "%", lyDo: "Chính sách giá nội bộ của AI Lành Nghề", giaTri: duNam });
  }
  if (dong.thoiGian) buoc.push({ nhan: "× " + dong.thoiGian.conLai + "/" + dong.thoiGian.ky + " ngày", lyDo: "Chỉ trả cho thời gian còn lại của kỳ", giaTri: thanhTien });

  const moTa = [dinhDang(dong.donGia)];
  if (dong.loaiKhach === DOANH_NGHIEP) moTa.push(String(dong.seat));
  if (cham) moTa.push("(1 − " + ch.gioiHanGiam + "%)");
  else for (const g of giam) moTa.push("(1 − " + g.tyLe + "%)");
  if (dong.thoiGian) moTa.push(dong.thoiGian.conLai + "/" + dong.thoiGian.ky);

  return {
    loai: "GOI_NGHE", maNhom: dong.maNhom, ngheId: dong.ngheId, tenNghe: dong.tenNghe, seat: dong.seat, thuTu: dong.thuTu,
    donGia: dong.donGia, giaNiemYet: niemYet, giam, mucGiam, chamGioiHan: cham, thoiGian: dong.thoiGian || null,
    thanhTienDuKy: duNam, thanhTien, loaiThue: null, moTa: moTa.join(" × "), buoc
  };
}

/* ---------- Thứ tự nghề ---------- */

/** Nghề chính (nếu nhóm chưa có nghề nào) đứng đầu; còn lại giá cao → thấp, cùng giá theo danh mục. */
function xepNgheMoi(ngheMoi: string[], ngheChinh: string | null | undefined, soNgheDaCo: number, ch: CauHinh, hang: Hang) {
  const ds = ngheMoi.slice();
  let dau: string[] = [];
  if (soNgheDaCo === 0) {
    if (ds.length > 1 && !ngheChinh) throw Loi("THIEU_NGHE_CHINH", "Cần chọn nghề chính khi mua nhiều nghề");
    const i = ds.indexOf(ngheChinh || ds[0]);
    if (i < 0) throw Loi("NGHE_CHINH_KHONG_TRONG_DON", "Nghề chính phải nằm trong đơn");
    dau = ds.splice(i, 1);
  }
  ds.sort((a, b) => {
    const ga = giaGoiNghe(a, ch, hang), gb = giaGoiNghe(b, ch, hang);
    return ga !== gb ? gb - ga : timNghe(a, ch).viTri - timNghe(b, ch).viTri;
  });
  return dau.concat(ds);
}
function kiemTraTrung(ds: string[], thongDiep: string) {
  const gap = new Set<string>();
  for (const x of ds) {
    if (gap.has(x)) throw Loi("TRUNG_LAP", thongDiep + ": " + x);
    gap.add(x);
  }
}

/* ---------- Tinh chỉnh ---------- */

export interface PhanTinhChinh {
  loai: "TINH_CHINH";
  dichVu: { ngheId: string; tenNghe: string; donGia: number; loaiThue: null }[];
  soDichVu: number; tongNiemYet: number; tyLeGiam: number; tienGiam: number; lyDo: string; thanhTien: number;
}
function tinhPhanTinhChinh(loaiKhach: LoaiKhach, dsNghe: string[] | undefined, ngheHopLe: string[], ch: CauHinh): PhanTinhChinh {
  const ds = dsNghe || [];
  kiemTraTrung(ds, "Mỗi nghề tối đa một dịch vụ Tinh chỉnh trong một đơn");
  const dichVu = ds.map((id) => {
    if (!ngheHopLe.includes(id)) throw Loi("TINH_CHINH_THIEU_GOI_NGHE", "Tinh chỉnh " + id + " cần có Gói nghề cùng nghề");
    const n = timNghe(id, ch).nghe;
    const gia = loaiKhach === DOANH_NGHIEP ? n.tinhChinhDN : n.tinhChinh;
    if (gia == null) throw Loi("CHUA_CO_GIA", "Tinh chỉnh " + n.ten + " chưa có giá niêm yết, cần báo giá");
    return { ngheId: id, tenNghe: n.ten, donGia: gia, loaiThue: null };
  });
  const tong = dichVu.reduce((a, d) => a + d.donGia, 0);
  const tyLe = dichVu.length ? tyLeTinhChinh(dichVu.length, ch) : 0;
  const thanhTien = chiaLamTron(BigInt(tong) * BigInt(100 - tyLe), 100n);
  return {
    loai: "TINH_CHINH", dichVu, soDichVu: dichVu.length, tongNiemYet: tong, tyLeGiam: tyLe, tienGiam: tong - thanhTien,
    lyDo: dichVu.length ? "Đơn có " + dichVu.length + " dịch vụ Tinh chỉnh" : "", thanhTien
  };
}

/* ---------- Subscription ---------- */

export interface NhomSeat { ma: string; ten: string; seat: number; nghe: { ngheId: string; thuTu: number; tuNgay: string }[] }
export interface Seat { ma: string; maNhom: string; lichSuGan: { nguoiDung: string; tuNgay: string; denNgay: string | null }[] }
export type ThayDoi =
  | { loai: "GIAM_SEAT"; maNhom: string; soSeat: number; ngayDangKy?: string }
  | { loai: "BO_NGHE"; maNhom: string; ngheId: string; ngayDangKy?: string }
  | { loai: "DOI_NGHE"; maNhom: string; tu: string; den: string; ngayDangKy?: string }
  | { loai: "DOI_NGHE_CHINH"; maNhom: string; ngheId: string; ngayDangKy?: string };
export interface Subscription {
  loaiKhach: LoaiKhach; hang: Hang; ky: Ky; nhomSeat: NhomSeat[]; seat: Seat[]; soSeatDaTao: number;
  thayDoiKySau: ThayDoi[]; donHang: Don[]; bangGiaPhienBan: string;
}
export interface Don {
  loaiDon: "MUA_MOI" | "MUA_THEM" | "GIA_HAN"; loaiKhach: LoaiKhach; hang: Hang; ngayHieuLuc: string; ky: Ky;
  thoiGian?: { tuNgay: string; denNgay: string; conLai: number; ky: number };
  bangGiaPhienBan: string; bacQuyMo: BacQuyMo | null; items: DongGoiNghe[]; tinhChinh: PhanTinhChinh;
  phiGoiNghe: number; phiMotLan: number; tongNiemYet: number; tongThanhToan: number;
  /** ưu đãi so với giá niêm yết (không gồm phần giảm do mua giữa kỳ) */
  tongUuDai: number; giamDoThoiGian: number; giaHanDuKien: number;
}

const tongSeat = (sub: Subscription) => sub.nhomSeat.reduce((a, n) => a + n.seat, 0);
function timNhom(sub: Subscription, ma: string) {
  const n = sub.nhomSeat.find((x) => x.ma === ma);
  if (!n) throw Loi("NHOM_KHONG_TON_TAI", "Không có nhóm seat " + ma);
  return n;
}
function taoSeat(sub: Subscription, nhom: string, soLuong: number) {
  for (let i = 0; i < soLuong; i++) {
    sub.soSeatDaTao += 1;
    sub.seat.push({ ma: "S" + String(sub.soSeatDaTao).padStart(3, "0"), maNhom: nhom, lichSuGan: [] });
  }
}
function kiemTraSeat(seat: number) {
  if (!Number.isInteger(seat) || seat < 1) throw Loi("SEAT_KHONG_HOP_LE", "Số seat phải là số nguyên dương");
}

export interface NhomVao { ma: string; ten: string; seat: number; nghe: string[]; ngheChinh?: string }
export interface DauVaoMuaMoi {
  loaiKhach: LoaiKhach;
  /** chỉ doanh nghiệp: Business (mặc định) hoặc Business Plus */
  hang?: Hang;
  ngayBatDau: string;
  /** cá nhân */
  nghe?: string[];
  ngheChinh?: string;
  /** doanh nghiệp */
  nhomSeat?: NhomVao[];
  tinhChinh?: string[];
}
function chuanHoaDauVao(d: DauVaoMuaMoi): NhomVao[] {
  if (d.loaiKhach === CA_NHAN) return [{ ma: "CA_NHAN", ten: "Cá nhân", seat: 1, nghe: d.nghe || [], ngheChinh: d.ngheChinh }];
  if (d.loaiKhach !== DOANH_NGHIEP) throw Loi("LOAI_KHACH_KHONG_HOP_LE", "loaiKhach phải là CA_NHAN hoặc DOANH_NGHIEP");
  return d.nhomSeat || [];
}
function giamCho(loaiKhach: LoaiKhach, bac: BacQuyMo | null, thuTu: number, nhomTen: string, ch: CauHinh): Giam[] {
  const giam: Giam[] = [];
  if (loaiKhach === DOANH_NGHIEP) giam.push({ loai: "QUY_MO", ten: "quy mô", tyLe: bac!.tyLe, lyDo: "Tổng " + bac!.tongSeat + " seat" });
  giam.push({
    loai: "MO_RONG_NGHE", ten: "mở rộng nghề", tyLe: tyLeMoRong(thuTu, ch),
    lyDo: thuTu === 1 ? "Nghề chính #1" : "Nghề #" + thuTu + (loaiKhach === DOANH_NGHIEP ? " · " + nhomTen : "")
  });
  return giam;
}
type DonNhap = Omit<Don, "phiGoiNghe" | "phiMotLan" | "tongNiemYet" | "tongThanhToan" | "tongUuDai" | "giamDoThoiGian" | "giaHanDuKien">;
function tongKet(d: DonNhap): Don {
  const phiGoiNghe = d.items.reduce((a, x) => a + x.thanhTien, 0);
  const niemYetGoi = d.items.reduce((a, x) => a + x.giaNiemYet, 0);
  const duKy = d.items.reduce((a, x) => a + x.thanhTienDuKy, 0);
  return {
    ...d, phiGoiNghe, phiMotLan: d.tinhChinh.thanhTien,
    tongNiemYet: niemYetGoi + d.tinhChinh.tongNiemYet,
    tongThanhToan: phiGoiNghe + d.tinhChinh.thanhTien,
    // Với đơn mua thêm, phần chênh gồm cả thời gian chưa dùng; tách riêng để hiển thị trung thực.
    tongUuDai: niemYetGoi - duKy + d.tinhChinh.tienGiam,
    giamDoThoiGian: duKy - phiGoiNghe,
    giaHanDuKien: 0
  };
}
const dongCho = (loaiKhach: LoaiKhach, hang: Hang, n: NhomSeat, g: { ngheId: string; thuTu: number }, seat: number, bac: BacQuyMo | null, thoiGian: DongVao["thoiGian"], ch: CauHinh) =>
  tinhDong({
    loaiKhach, maNhom: n.ma, ngheId: g.ngheId, tenNghe: timNghe(g.ngheId, ch).nghe.ten, seat, thuTu: g.thuTu,
    donGia: giaGoiNghe(g.ngheId, ch, hang), giam: giamCho(loaiKhach, bac, g.thuTu, n.ten, ch), thoiGian
  }, ch);
const ngheTrong = (sub: Subscription) => [...new Set(sub.nhomSeat.flatMap((n) => n.nghe.map((g) => g.ngheId)))];

/** Mua mới. Trả { don, subscription } – subscription là trạng thái sau khi đơn được thanh toán. */
export function muaMoi(dauVao: DauVaoMuaMoi, ch: CauHinh = CAU_HINH): { don: Readonly<Don>; subscription: Subscription } {
  const loaiKhach = dauVao.loaiKhach;
  const hang: Hang = loaiKhach === DOANH_NGHIEP ? dauVao.hang ?? "business" : "business";
  const nhomVao = chuanHoaDauVao(dauVao);
  if (!nhomVao.length) throw Loi("DON_RONG", "Đơn chưa có nghề nào");
  kiemTraTrung(nhomVao.map((n) => n.ma), "Trùng mã nhóm seat");

  const ky = taoKy(dauVao.ngayBatDau);
  const sub: Subscription = { loaiKhach, hang, ky, nhomSeat: [], seat: [], soSeatDaTao: 0, thayDoiKySau: [], donHang: [], bangGiaPhienBan: ch.phienBan };
  for (const n of nhomVao) {
    kiemTraSeat(n.seat);
    if (!n.nghe || !n.nghe.length) throw Loi("NHOM_KHONG_CO_NGHE", "Nhóm " + n.ten + " chưa có nghề");
    kiemTraTrung(n.nghe, "Trùng nghề trong nhóm " + n.ten);
    const thuTu = xepNgheMoi(n.nghe, n.ngheChinh, 0, ch, hang);
    sub.nhomSeat.push({ ma: n.ma, ten: n.ten, seat: n.seat, nghe: thuTu.map((id, i) => ({ ngheId: id, thuTu: i + 1, tuNgay: ky.batDau })) });
    taoSeat(sub, n.ma, n.seat);
  }
  const bac = loaiKhach === DOANH_NGHIEP ? bacQuyMo(tongSeat(sub), ch) : null;
  const items = sub.nhomSeat.flatMap((n) => n.nghe.map((g) => dongCho(loaiKhach, hang, n, g, n.seat, bac, null, ch)));
  const don = tongKet({
    loaiDon: "MUA_MOI", loaiKhach, hang, ngayHieuLuc: ky.batDau, ky, bangGiaPhienBan: ch.phienBan, bacQuyMo: bac, items,
    tinhChinh: tinhPhanTinhChinh(loaiKhach, dauVao.tinhChinh, ngheTrong(sub), ch)
  });
  don.giaHanDuKien = don.phiGoiNghe;
  sub.donHang.push(sao(don));
  return { don: Object.freeze(don), subscription: sub };
}

export interface DauVaoMuaThem {
  ngayHieuLuc: string;
  /** seat mới nhận mọi nghề đang có của nhóm, giữ thứ tự nhóm */
  themSeat?: { maNhom: string; soSeat: number }[];
  /** cấp cho toàn bộ seat của nhóm (kể cả seat thêm cùng đơn), nối tiếp cuối */
  themNghe?: { maNhom: string; nghe: string[] }[];
  themNhom?: NhomVao[];
  /** cá nhân: nghề mua thêm */
  nghe?: string[];
  /** giá đủ, không theo ngày */
  tinhChinh?: string[];
}

/** Mua thêm giữa kỳ, hiệu lực ngay, tính theo ngày còn lại. Bậc quy mô sau thay đổi chỉ áp cho phần mua thêm. */
export function muaThem(subVao: Subscription, dauVao: DauVaoMuaThem, ch: CauHinh = CAU_HINH): { don: Readonly<Don>; subscription: Subscription } {
  const sub = sao(subVao);
  const { loaiKhach, hang } = sub;
  const ngay = dauVao.ngayHieuLuc;
  if (docNgay(ngay) < docNgay(sub.ky.batDau) || docNgay(ngay) > docNgay(sub.ky.hetHan)) {
    throw Loi("NGOAI_KY", "Ngày mua thêm phải nằm trong kỳ " + sub.ky.batDau + " – " + sub.ky.hetHan);
  }
  const themSeat = dauVao.themSeat || [], themNhom = dauVao.themNhom || [];
  let themNghe = dauVao.themNghe || [];
  if (loaiKhach === CA_NHAN && (themSeat.length || themNhom.length)) throw Loi("CA_NHAN_KHONG_CO_SEAT", "Cá nhân không mua thêm seat");
  if (loaiKhach === CA_NHAN && dauVao.nghe) themNghe = [{ maNhom: "CA_NHAN", nghe: dauVao.nghe }];

  const thoiGian = { tuNgay: ngay, denNgay: sub.ky.hetHan, conLai: soNgay(ngay, sub.ky.hetHan), ky: sub.ky.soNgay };

  // 1. Áp thay đổi vào trạng thái, ghi lại phần nào là mua thêm.
  const phan: { maNhom: string; ngheId: string; seat: number; thuTu: number }[] = [];
  const nhomCu = new Set(sub.nhomSeat.map((n) => n.ma));

  for (const n of themNhom) {
    kiemTraSeat(n.seat);
    if (sub.nhomSeat.some((x) => x.ma === n.ma)) throw Loi("TRUNG_LAP", "Trùng mã nhóm seat: " + n.ma);
    if (!n.nghe || !n.nghe.length) throw Loi("NHOM_KHONG_CO_NGHE", "Nhóm " + n.ten + " chưa có nghề");
    kiemTraTrung(n.nghe, "Trùng nghề trong nhóm " + n.ten);
    const thuTu = xepNgheMoi(n.nghe, n.ngheChinh, 0, ch, hang);
    sub.nhomSeat.push({ ma: n.ma, ten: n.ten, seat: n.seat, nghe: thuTu.map((id, i) => ({ ngheId: id, thuTu: i + 1, tuNgay: ngay })) });
    taoSeat(sub, n.ma, n.seat);
    thuTu.forEach((id, i) => phan.push({ maNhom: n.ma, ngheId: id, seat: n.seat, thuTu: i + 1 }));
  }
  for (const t of themSeat) {
    kiemTraSeat(t.soSeat);
    if (!nhomCu.has(t.maNhom)) throw Loi("NHOM_MOI_TRONG_DON", "Nhóm mới trong đơn đã khai số seat, không thêm seat riêng");
    const n = timNhom(sub, t.maNhom);
    for (const g of n.nghe) phan.push({ maNhom: n.ma, ngheId: g.ngheId, seat: t.soSeat, thuTu: g.thuTu });
    n.seat += t.soSeat;
    taoSeat(sub, n.ma, t.soSeat);
  }
  for (const t of themNghe) {
    const n = timNhom(sub, t.maNhom);
    kiemTraTrung(t.nghe, "Trùng nghề trong đơn");
    for (const id of t.nghe) if (n.nghe.some((g) => g.ngheId === id)) throw Loi("NGHE_DA_CO", "Nhóm " + n.ten + " đã có nghề " + id);
    for (const id of xepNgheMoi(t.nghe, null, n.nghe.length, ch, hang)) {
      const thuTu = n.nghe.length + 1;
      n.nghe.push({ ngheId: id, thuTu, tuNgay: ngay });
      phan.push({ maNhom: n.ma, ngheId: id, seat: n.seat, thuTu }); // n.seat đã gồm seat thêm cùng đơn
    }
  }
  if (!phan.length && !(dauVao.tinhChinh || []).length) throw Loi("DON_RONG", "Đơn mua thêm chưa có gì");

  // 2. Tính tiền phần mua thêm theo bậc sau thay đổi.
  const bac = loaiKhach === DOANH_NGHIEP ? bacQuyMo(tongSeat(sub), ch) : null;
  const items = phan.map((p) => dongCho(loaiKhach, hang, timNhom(sub, p.maNhom), p, p.seat, bac, { conLai: thoiGian.conLai, ky: thoiGian.ky }, ch));
  const don = tongKet({
    loaiDon: "MUA_THEM", loaiKhach, hang, ngayHieuLuc: ngay, ky: sub.ky, thoiGian, bangGiaPhienBan: ch.phienBan, bacQuyMo: bac, items,
    tinhChinh: tinhPhanTinhChinh(loaiKhach, dauVao.tinhChinh, ngheTrong(sub), ch)
  });
  don.giaHanDuKien = baoGiaGiaHan(sub, ch).don.phiGoiNghe;
  sub.donHang.push(sao(don));
  return { don: Object.freeze(don), subscription: sub };
}

/* ---------- Thay đổi không phát sinh tiền ---------- */

/** Đổi người dùng seat: 0 đ, hiệu lực ngay, lưu lịch sử. */
export function ganNguoiDung(subVao: Subscription, maSeat: string, nguoiDung: string, ngay: string) {
  const sub = sao(subVao);
  const s = sub.seat.find((x) => x.ma === maSeat);
  if (!s) throw Loi("SEAT_KHONG_TON_TAI", "Không có seat " + maSeat);
  const hienTai = s.lichSuGan[s.lichSuGan.length - 1];
  if (hienTai && !hienTai.denNgay) hienTai.denNgay = congNgay(ngay, -1);
  s.lichSuGan.push({ nguoiDung, tuNgay: ngay, denNgay: null });
  return { phi: 0, subscription: sub };
}

/** Đăng ký thay đổi cho kỳ sau (giảm seat, bỏ nghề, đổi nghề, đổi nghề chính). Kỳ hiện tại không đổi, không hoàn tiền. */
export function dangKyKySau(subVao: Subscription, thayDoi: ThayDoi, ngayDangKy: string, ch: CauHinh = CAU_HINH) {
  const sub = sao(subVao);
  if (!["GIAM_SEAT", "BO_NGHE", "DOI_NGHE", "DOI_NGHE_CHINH"].includes(thayDoi.loai)) throw Loi("THAY_DOI_KHONG_HOP_LE", "Loại thay đổi không hợp lệ");
  timNhom(sub, thayDoi.maNhom);
  sub.thayDoiKySau.push({ ...sao(thayDoi), ngayDangKy });
  apThayDoi(sao(sub), ch); // kiểm tra hợp lệ sớm
  return { phi: 0, subscription: sub };
}

function apThayDoi(sub: Subscription, ch: CauHinh) {
  for (const t of sub.thayDoiKySau) {
    const n = timNhom(sub, t.maNhom);
    const viTri = (id: string) => {
      const i = n.nghe.findIndex((g) => g.ngheId === id);
      if (i < 0) throw Loi("NGHE_KHONG_CO_TRONG_NHOM", "Nhóm " + n.ten + " không có nghề " + id);
      return i;
    };
    if (t.loai === "GIAM_SEAT") {
      if (!Number.isInteger(t.soSeat) || t.soSeat < 0 || t.soSeat > n.seat) throw Loi("SEAT_KHONG_HOP_LE", "Chỉ giảm được xuống 0–" + n.seat + " seat");
      n.seat = t.soSeat;
    } else if (t.loai === "BO_NGHE") {
      n.nghe.splice(viTri(t.ngheId), 1);
    } else if (t.loai === "DOI_NGHE") {
      timNghe(t.den, ch);
      if (n.nghe.some((g) => g.ngheId === t.den)) throw Loi("NGHE_DA_CO", "Nhóm đã có nghề " + t.den);
      n.nghe[viTri(t.tu)].ngheId = t.den;
    } else {
      const g = n.nghe.splice(viTri(t.ngheId), 1)[0];
      n.nghe.unshift(g);
    }
  }
  sub.nhomSeat = sub.nhomSeat.filter((n) => n.seat > 0 && n.nghe.length > 0);
  for (const n of sub.nhomSeat) n.nghe.forEach((g, i) => { g.thuTu = i + 1; }); // dồn thứ tự, giữ thứ tự tương đối
  sub.thayDoiKySau = [];
  return sub;
}

/** Báo giá gia hạn: cấu hình đang hoạt động + thay đổi đã đăng ký, đủ năm, bảng giá hiện hành. Tinh chỉnh không thu lại. */
export function baoGiaGiaHan(subVao: Subscription, ch: CauHinh = CAU_HINH): { don: Readonly<Don>; subscription: Subscription } {
  const sub = apThayDoi(sao(subVao), ch);
  if (!sub.nhomSeat.length) throw Loi("KHONG_CON_GI_DE_GIA_HAN", "Subscription không còn nghề hoặc seat để gia hạn");
  const ky = taoKy(congNgay(subVao.ky.hetHan, 1));
  const { loaiKhach, hang } = sub;
  const bac = loaiKhach === DOANH_NGHIEP ? bacQuyMo(tongSeat(sub), ch) : null;
  const items = sub.nhomSeat.flatMap((n) => n.nghe.map((g) => dongCho(loaiKhach, hang, n, g, n.seat, bac, null, ch)));
  const don = tongKet({
    loaiDon: "GIA_HAN", loaiKhach, hang, ngayHieuLuc: ky.batDau, ky, bangGiaPhienBan: ch.phienBan, bacQuyMo: bac, items,
    tinhChinh: tinhPhanTinhChinh(loaiKhach, [], [], ch)
  });
  don.giaHanDuKien = don.phiGoiNghe;

  // Trạng thái sau khi khách thanh toán báo giá gia hạn: kỳ mới, bỏ seat thừa ở cuối mỗi nhóm.
  const sau = sao(sub);
  sau.ky = ky;
  sau.bangGiaPhienBan = ch.phienBan;
  sau.seat = sub.nhomSeat.flatMap((n) => subVao.seat.filter((s) => s.maNhom === n.ma).slice(0, n.seat).map((s) => sao(s)));
  sau.donHang = subVao.donHang.concat([sao(don)]);
  return { don: Object.freeze(don), subscription: sau };
}

/* ---------- Dùng cho trang Đặt mua ---------- */

export type GoiDatMua = "personal" | "business" | "business_plus";
export interface LuaChonDatMua { goi: GoiDatMua; seat: number; tinhChinh: boolean; ngayBatDau: string }

/** Đơn mua mới nghề Mua hàng theo lựa chọn trên trang Đặt mua. Tinh chỉnh doanh nghiệp không cộng vào đơn (liên hệ báo giá). */
export function donDatMua(c: LuaChonDatMua, ch: CauHinh = CAU_HINH) {
  const nghe = ch.nghe.find((n) => n.dangBan && n.goiNghe != null);
  if (!nghe) throw Loi("KHONG_CO_NGHE_DANG_BAN", "Chưa có gói nghề nào đang bán");
  if (c.goi === "personal") {
    return muaMoi({ loaiKhach: CA_NHAN, ngayBatDau: c.ngayBatDau, nghe: [nghe.id], tinhChinh: c.tinhChinh && nghe.tinhChinh != null ? [nghe.id] : [] }, ch).don;
  }
  const tinhChinh = c.tinhChinh && nghe.tinhChinhDN != null ? [nghe.id] : [];
  return muaMoi({
    loaiKhach: DOANH_NGHIEP, hang: c.goi, ngayBatDau: c.ngayBatDau, tinhChinh,
    nhomSeat: [{ ma: "CONG_TY", ten: "Công ty", seat: c.seat, nghe: [nghe.id] }]
  }, ch).don;
}

/** Nghề đang bán (có giá) – dùng để chặn nghề "sắp ra mắt" khỏi đơn. */
export const ngheDangBan = (ch: CauHinh = CAU_HINH) => ch.nghe.filter((n) => n.dangBan && n.goiNghe != null);
