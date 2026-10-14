// Bộ tính tiền: port tests/tinh-tien.test.js của site cũ (giữ nguyên số liệu) + kiểm tra giá đã chốt 14/10/2026.
import assert from "node:assert/strict";
import { describe, test } from "vitest";
import * as P from "../src/lib/pricing";
import type { CauHinh, Don } from "../src/lib/pricing";

/*
 * Bảng giá phiên bản 2026-09-16 của site cũ, chỉ dùng làm dữ liệu kiểm thử để chứng minh
 * phần tính toán khi port sang TypeScript không đổi. Giá bán thật nằm ở P.CAU_HINH.
 */
const CU: CauHinh = {
  phienBan: "2026-09-16",
  nghe: [
    { id: "hanh-chinh", ten: "Hành chính", dangBan: false, goiNghe: 690000, tinhChinh: 800000, tinhChinhDN: null },
    { id: "nhan-su", ten: "Nhân sự", dangBan: false, goiNghe: 690000, tinhChinh: 800000, tinhChinhDN: 3500000 },
    { id: "mua-hang", ten: "Mua hàng", dangBan: true, goiNghe: 690000, tinhChinh: 800000, tinhChinhDN: 3000000 },
    { id: "ke-toan", ten: "Kế toán – Tài chính", dangBan: false, goiNghe: 790000, tinhChinh: 900000, tinhChinhDN: 4000000 },
    { id: "marketing", ten: "Marketing", dangBan: false, goiNghe: 690000, tinhChinh: 800000, tinhChinhDN: null },
    { id: "quan-ly", ten: "Quản lý", dangBan: false, goiNghe: 890000, tinhChinh: 1200000, tinhChinhDN: null },
    { id: "giang-day", ten: "Giảng dạy", dangBan: true, goiNghe: null, tinhChinh: null, tinhChinhDN: null }
  ],
  moRongNghe: [0, 10, 20, 25, 30],
  quyMo: [[500, 30], [250, 25], [100, 20], [50, 15], [25, 10], [10, 5], [1, 0]],
  tinhChinh: [[5, 20], [4, 15], [3, 10], [2, 5], [1, 0]],
  gioiHanGiam: 50
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const T = {
  CAU_HINH: CU,
  muaMoi: (d: Any) => P.muaMoi(d, CU),
  muaThem: (s: Any, d: Any) => P.muaThem(s, d, CU),
  baoGiaGiaHan: (s: Any) => P.baoGiaGiaHan(s, CU),
  dangKyKySau: (s: Any, t: Any, n: string) => P.dangKyKySau(s, t, n, CU),
  ganNguoiDung: P.ganNguoiDung,
  taoKy: P.taoKy,
  bacQuyMo: P.bacQuyMo
};

describe("Bộ tính tiền – số liệu của site cũ (port nguyên)", () => {
  const tien = (don: Don) => don.items.map((d: Any) => [d.maNhom, d.ngheId, d.thuTu, d.thanhTien]);
  const loi = (ma: string) => (e: Any) => e.ma === ma;
  
  function vanPhong50() {
    return T.muaMoi({
      loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01",
      nhomSeat: [{ ma: "VP", ten: "Văn phòng", seat: 50, ngheChinh: "mua-hang", nghe: ["mua-hang", "nhan-su", "ke-toan"] }]
    });
  }
  
  // Kịch bản trong kế hoạch: Mua hàng, rồi Nhân sự, rồi Kế toán (thứ tự theo lần mua).
  function vanPhongTheoLanMua() {
    let r = T.muaMoi({ loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01", nhomSeat: [{ ma: "VP", ten: "Văn phòng", seat: 50, nghe: ["mua-hang"] }] });
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-01-01", themNghe: [{ maNhom: "VP", nghe: ["nhan-su"] }] });
    return T.muaThem(r.subscription, { ngayHieuLuc: "2027-01-01", themNghe: [{ maNhom: "VP", nghe: ["ke-toan"] }] });
  }
  
  /* ---------- Mua mới ---------- */
  
  test("Cá nhân mua một đơn 3 nghề + 3 Tinh chỉnh: Kế toán (đắt hơn) xếp #2 = 4.203.000 đ", () => {
    const { don, subscription } = T.muaMoi({
      loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01",
      ngheChinh: "mua-hang", nghe: ["mua-hang", "nhan-su", "ke-toan"],
      tinhChinh: ["mua-hang", "nhan-su", "ke-toan"]
    });
    assert.deepEqual(don.items.map((d: Any) => [d.ngheId, d.thuTu, d.thanhTien]), [
      ["mua-hang", 1, 690000], ["ke-toan", 2, 711000], ["nhan-su", 3, 552000]
    ]);
    assert.equal(don.tinhChinh.tongNiemYet, 2500000);
    assert.equal(don.tinhChinh.tyLeGiam, 10);
    assert.equal(don.tinhChinh.thanhTien, 2250000);
    assert.equal(don.phiGoiNghe, 1953000);
    assert.equal(don.tongThanhToan, 4203000);
    assert.equal(don.tongNiemYet, 4670000);
    assert.equal(don.tongUuDai, 467000);
    assert.equal(don.giaHanDuKien, 1953000);
    assert.equal(subscription.ky.hetHan, "2027-12-31");
    assert.equal(don.bacQuyMo, null);
    assert.ok(don.items.every((d: Any) => d.loaiThue === null), "VAT chưa chốt, không cài cứng");
  });
  
  test("Cá nhân: thứ tự theo đúng lần mua (Mua hàng → Nhân sự → Kế toán) cho 1.943.000 đ", () => {
    let r = T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", nghe: ["mua-hang"] });
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-01-01", nghe: ["nhan-su"] });
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-01-01", nghe: ["ke-toan"] });
    const g = T.baoGiaGiaHan(r.subscription).don;
    assert.deepEqual(g.items.map((d: Any) => [d.ngheId, d.thuTu, d.thanhTien]), [
      ["mua-hang", 1, 690000], ["nhan-su", 2, 621000], ["ke-toan", 3, 632000]
    ]);
    assert.equal(g.phiGoiNghe, 1943000);
  });
  
  test("Thứ tự trong cùng đơn: nghề chính trước, còn lại giá cao → thấp, cùng giá theo danh mục", () => {
    const { don } = T.muaMoi({
      loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", ngheChinh: "hanh-chinh",
      nghe: ["marketing", "mua-hang", "hanh-chinh", "nhan-su", "quan-ly", "ke-toan"]
    });
    assert.deepEqual(don.items.map((d: Any) => d.ngheId), ["hanh-chinh", "quan-ly", "ke-toan", "nhan-su", "mua-hang", "marketing"]);
    assert.deepEqual(don.items.map((d: Any) => d.mucGiam), [0, 10, 20, 25, 30, 30]);
  });
  
  test("Khách không tự đổi thứ tự bằng cách đảo thứ tự thêm vào giỏ", () => {
    const a = T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", ngheChinh: "mua-hang", nghe: ["mua-hang", "nhan-su", "ke-toan"] }).don;
    const b = T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", ngheChinh: "mua-hang", nghe: ["ke-toan", "nhan-su", "mua-hang"] }).don;
    assert.equal(a.tongThanhToan, b.tongThanhToan);
    assert.throws(() => T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", nghe: ["mua-hang", "ke-toan"] }), loi("THIEU_NGHE_CHINH"));
  });
  
  test("Doanh nghiệp: 50 seat × 3 nghề = 82.577.500 đ (theo thứ tự Mua hàng, Nhân sự, Kế toán)", () => {
    const g = T.baoGiaGiaHan(vanPhongTheoLanMua().subscription).don;
    assert.deepEqual(tien(g), [["VP", "mua-hang", 1, 29325000], ["VP", "nhan-su", 2, 26392500], ["VP", "ke-toan", 3, 26860000]]);
    assert.equal(g.phiGoiNghe, 82577500);
    assert.equal(g.bacQuyMo!.tyLe, 15);
  });
  
  test("Doanh nghiệp mua mới 1 đơn 3 nghề: Kế toán (đắt hơn) xếp #2", () => {
    const { don } = vanPhong50();
    assert.deepEqual(tien(don), [["VP", "mua-hang", 1, 29325000], ["VP", "ke-toan", 2, 30217500], ["VP", "nhan-su", 3, 23460000]]);
    assert.equal(don.phiGoiNghe, 83002500);
    assert.equal(don.tongNiemYet, 108500000);
  });
  
  test("Gán nghề riêng từng nhóm: 30/10/15 seat, bậc theo tổng 55 seat = 33.532.500 đ", () => {
    const { don } = T.muaMoi({
      loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01",
      nhomSeat: [
        { ma: "MH", ten: "Mua hàng", seat: 30, nghe: ["mua-hang"] },
        { ma: "NS", ten: "Nhân sự", seat: 10, nghe: ["nhan-su"] },
        { ma: "KT", ten: "Kế toán", seat: 15, nghe: ["ke-toan"] }
      ]
    });
    assert.equal(don.bacQuyMo!.tongSeat, 55);
    assert.equal(don.bacQuyMo!.tyLe, 15);
    assert.deepEqual(tien(don), [["MH", "mua-hang", 1, 17595000], ["NS", "nhan-su", 1, 5865000], ["KT", "ke-toan", 1, 10072500]]);
    assert.equal(don.phiGoiNghe, 33532500);
  });
  
  test("Mở rộng nghề chỉ trong cùng nhóm seat; seat đếm một lần dù có nhiều nghề", () => {
    const { don } = T.muaMoi({
      loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01",
      nhomSeat: [
        { ma: "A", ten: "A", seat: 30, ngheChinh: "ke-toan", nghe: ["ke-toan", "mua-hang"] },
        { ma: "B", ten: "B", seat: 10, nghe: ["nhan-su"] }
      ]
    });
    assert.equal(don.bacQuyMo!.tongSeat, 40);
    assert.deepEqual(tien(don), [["A", "ke-toan", 1, 21330000], ["A", "mua-hang", 2, 16767000], ["B", "nhan-su", 1, 6210000]]);
  });
  
  test("Tinh chỉnh doanh nghiệp: không nhân seat, 3 dịch vụ giảm 10% = 9.450.000 đ", () => {
    const { don } = T.muaMoi({
      loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01",
      nhomSeat: [{ ma: "VP", ten: "VP", seat: 50, ngheChinh: "mua-hang", nghe: ["mua-hang", "nhan-su", "ke-toan"] }],
      tinhChinh: ["mua-hang", "nhan-su", "ke-toan"]
    });
    assert.equal(don.tinhChinh.tongNiemYet, 10500000);
    assert.equal(don.tinhChinh.thanhTien, 9450000);
    assert.equal(don.phiMotLan, 9450000);
  });
  
  test("Bậc ưu đãi Tinh chỉnh theo số dịch vụ: 0/5/10/15/20%", () => {
    const ds = ["hanh-chinh", "nhan-su", "mua-hang", "ke-toan", "marketing", "quan-ly"];
    const ky = [0, 5, 10, 15, 20, 20];
    ds.forEach((_: Any, i: number) => {
      const nghe = ds.slice(0, i + 1);
      const { don } = T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", ngheChinh: nghe[0], nghe, tinhChinh: nghe });
      assert.equal(don.tinhChinh.tyLeGiam, ky[i], nghe.length + " dịch vụ");
    });
  });
  
  test("Tinh chỉnh cần Gói nghề cùng nghề; Tinh chỉnh không có giá thì báo giá", () => {
    assert.throws(() => T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", nghe: ["mua-hang"], tinhChinh: ["ke-toan"] }), loi("TINH_CHINH_THIEU_GOI_NGHE"));
    assert.throws(() => T.muaMoi({ loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01", nhomSeat: [{ ma: "X", ten: "X", seat: 5, nghe: ["marketing"] }], tinhChinh: ["marketing"] }), loi("CHUA_CO_GIA"));
    assert.throws(() => T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", nghe: ["giang-day"] }), loi("CHUA_CO_GIA"));
  });
  
  /* ---------- Bậc quy mô ---------- */
  
  test("Biên bậc quy mô", () => {
    const cap = [[9, 0], [10, 5], [24, 5], [25, 10], [49, 10], [50, 15], [99, 15], [100, 20], [249, 20], [250, 25], [499, 25], [500, 30], [5000, 30]];
    cap.forEach(([seat, tyLe]: number[]) => assert.equal(T.bacQuyMo(seat, T.CAU_HINH).tyLe, tyLe, seat + " seat"));
  });
  
  test("Giới hạn nội bộ 50%: 500 seat, nghề #5 cùng nhóm (giảm 51% → 50%)", () => {
    const { don } = T.muaMoi({
      loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01",
      nhomSeat: [{ ma: "L", ten: "Lớn", seat: 500, ngheChinh: "quan-ly", nghe: ["quan-ly", "ke-toan", "nhan-su", "mua-hang", "marketing"] }]
    });
    const d5 = don.items[4];
    assert.equal(d5.ngheId, "marketing");
    assert.equal(d5.chamGioiHan, true);
    assert.equal(d5.mucGiam, 50);
    assert.equal(d5.thanhTien, 172500000);
    assert.equal(don.items[3].chamGioiHan, false); // #4: 0,7 × 0,75 → giảm 47,5%
    assert.equal(don.items[3].thanhTien, 181125000);
  });
  
  /* ---------- Mua thêm giữa kỳ ---------- */
  
  test("Theo ngày: thêm nhóm Kho 20 seat ngày 01/05 → 245/365 ngày, vẫn bậc 15% = 7.873.562 đ", () => {
    const r = T.muaThem(vanPhong50().subscription, {
      ngayHieuLuc: "2027-05-01", themNhom: [{ ma: "KHO", ten: "Kho", seat: 20, nghe: ["mua-hang"] }]
    });
    assert.deepEqual([r.don.thoiGian!.conLai, r.don.thoiGian!.ky], [245, 365]);
    assert.equal(r.don.bacQuyMo!.tongSeat, 70);
    assert.equal(r.don.bacQuyMo!.tyLe, 15);
    assert.deepEqual(tien(r.don), [["KHO", "mua-hang", 1, 7873562]]);
    assert.equal(r.don.items[0].thanhTienDuKy, 11730000);
    assert.match(r.don.items[0].moTa, /245\/365/);
    assert.equal(r.subscription.ky.hetHan, "2027-12-31", "dùng chung ngày hết hạn");
  });
  
  test("Thêm seat lên bậc: 70 → 120 seat ngày 01/07, chỉ 50 seat mới hưởng 20% = 39.179.397 đ", () => {
    let r = T.muaThem(vanPhongTheoLanMua().subscription, { ngayHieuLuc: "2027-05-01", themNhom: [{ ma: "KHO", ten: "Kho", seat: 20, nghe: ["mua-hang"] }] });
    const truoc = r.subscription;
    r = T.muaThem(truoc, { ngayHieuLuc: "2027-07-01", themSeat: [{ maNhom: "VP", soSeat: 50 }] });
    assert.deepEqual([r.don.thoiGian!.conLai, r.don.bacQuyMo!.tongSeat, r.don.bacQuyMo!.tyLe], [184, 120, 20]);
    // Seat mới nhận đúng thứ tự nghề đang có của nhóm.
    assert.deepEqual(tien(r.don), [["VP", "mua-hang", 1, 13913425], ["VP", "nhan-su", 2, 12522082], ["VP", "ke-toan", 3, 12743890]]);
    assert.equal(r.don.tongThanhToan, 39179397);
    assert.ok(r.don.items.every((d: Any) => d.seat === 50), "chỉ tính cho seat mới");
  });
  
  test("Không hồi tố: đơn cũ giữ nguyên số tiền và bậc sau khi lên bậc", () => {
    const moi = vanPhong50();
    const r1 = T.muaThem(moi.subscription, { ngayHieuLuc: "2027-07-01", themSeat: [{ maNhom: "VP", soSeat: 60 }] });
    assert.equal(r1.don.bacQuyMo!.tyLe, 20);
    const donDau = r1.subscription.donHang[0];
    assert.equal(donDau.phiGoiNghe, 83002500);
    assert.equal(donDau.bacQuyMo!.tyLe, 15);
    assert.deepEqual(moi.subscription.nhomSeat[0].seat, 50, "trạng thái cũ không bị sửa");
    assert.ok(Object.isFrozen(moi.don));
    assert.equal(r1.don.items.length, 3);
    assert.ok(r1.don.items.every((d: Any) => d.seat === 60));
  });
  
  test("Thêm nghề giữa kỳ: nối tiếp cuối nhóm, không xếp lại nghề cũ; tính cho mọi seat của nhóm", () => {
    let r = T.muaMoi({ loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01", nhomSeat: [{ ma: "VP", ten: "VP", seat: 20, nghe: ["hanh-chinh"] }] });
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-07-01", themSeat: [{ maNhom: "VP", soSeat: 5 }], themNghe: [{ maNhom: "VP", nghe: ["marketing", "quan-ly"] }] });
    // Hành chính (690k) vẫn #1 dù Quản lý đắt hơn; 2 nghề mới xếp giá cao → thấp.
    assert.deepEqual(r.subscription.nhomSeat[0].nghe.map((g: Any) => [g.ngheId, g.thuTu]), [["hanh-chinh", 1], ["quan-ly", 2], ["marketing", 3]]);
    assert.equal(r.don.bacQuyMo!.tyLe, 10); // 25 seat
    assert.deepEqual(r.don.items.map((d: Any) => [d.ngheId, d.seat, d.thuTu]), [["hanh-chinh", 5, 1], ["quan-ly", 25, 2], ["marketing", 25, 3]]);
    // 890.000 × 25 × 0,90 × 0,90 × 184/365
    assert.equal(r.don.items[1].thanhTien, Math.round(890000 * 25 * 0.9 * 0.9 * 184 / 365));
    assert.throws(() => T.muaThem(r.subscription, { ngayHieuLuc: "2027-08-01", themNghe: [{ maNhom: "VP", nghe: ["quan-ly"] }] }), loi("NGHE_DA_CO"));
  });
  
  test("Cá nhân thêm nghề ngày 01/05: 621.000 × 245/365 = 416.836 đ", () => {
    let r = T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", nghe: ["mua-hang"] });
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-05-01", nghe: ["nhan-su"], tinhChinh: ["nhan-su"] });
    assert.deepEqual(r.don.items.map((d: Any) => [d.ngheId, d.thuTu, d.thanhTien]), [["nhan-su", 2, 416836]]);
    assert.equal(r.don.tinhChinh.thanhTien, 800000, "Tinh chỉnh giá đủ, không theo ngày");
    assert.equal(r.don.tongThanhToan, 1216836);
    assert.equal(r.don.giaHanDuKien, 1311000);
    assert.throws(() => T.muaThem(r.subscription, { ngayHieuLuc: "2027-06-01", themSeat: [{ maNhom: "CA_NHAN", soSeat: 1 }] }), loi("CA_NHAN_KHONG_CO_SEAT"));
  });
  
  test("Biên theo ngày: mua ngày cuối kỳ 1/365, ngày đầu kỳ 365/365, ngoài kỳ bị từ chối", () => {
    const sub = vanPhong50().subscription;
    const cuoi = T.muaThem(sub, { ngayHieuLuc: "2027-12-31", themNhom: [{ ma: "X", ten: "X", seat: 1, nghe: ["mua-hang"] }] }).don;
    assert.equal(cuoi.thoiGian!.conLai, 1);
    assert.equal(cuoi.items[0].thanhTien, Math.round(690000 * 0.85 / 365)); // 51 seat → 15%
    const dau = T.muaThem(sub, { ngayHieuLuc: "2027-01-01", themNhom: [{ ma: "X", ten: "X", seat: 1, nghe: ["mua-hang"] }] }).don;
    assert.equal(dau.items[0].thanhTien, 586500);
    assert.throws(() => T.muaThem(sub, { ngayHieuLuc: "2028-01-01", themNhom: [{ ma: "X", ten: "X", seat: 1, nghe: ["mua-hang"] }] }), loi("NGOAI_KY"));
  });
  
  test("Năm nhuận: kỳ 01/03/2027 – 29/02/2028 có 366 ngày; bắt đầu 29/02/2028 hết hạn 28/02/2029", () => {
    assert.deepEqual(T.taoKy("2027-03-01"), { batDau: "2027-03-01", hetHan: "2028-02-29", soNgay: 366 });
    assert.deepEqual(T.taoKy("2028-02-29"), { batDau: "2028-02-29", hetHan: "2029-02-28", soNgay: 366 });
    const r = T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-03-01", nghe: ["mua-hang"] });
    const t = T.muaThem(r.subscription, { ngayHieuLuc: "2028-02-01", nghe: ["nhan-su"] }).don;
    assert.deepEqual([t.thoiGian!.conLai, t.thoiGian!.ky], [29, 366]);
    assert.equal(t.items[0].thanhTien, Math.round(621000 * 29 / 366));
  });
  
  /* ---------- Thay đổi không phát sinh tiền, gia hạn ---------- */
  
  test("Đổi người dùng seat: 0 đ, giữ lịch sử", () => {
    let sub = vanPhong50().subscription;
    let r = T.ganNguoiDung(sub, "S023", "an@congty.vn", "2027-01-01");
    r = T.ganNguoiDung(r.subscription, "S023", "binh@congty.vn", "2027-08-15");
    assert.equal(r.phi, 0);
    const s = r.subscription.seat.find((x: Any) => x.ma === "S023");
    assert.deepEqual(s!.lichSuGan, [
      { nguoiDung: "an@congty.vn", tuNgay: "2027-01-01", denNgay: "2027-08-14" },
      { nguoiDung: "binh@congty.vn", tuNgay: "2027-08-15", denNgay: null }
    ]);
    assert.equal(r.subscription.donHang.length, 1, "không tạo đơn");
  });
  
  test("Gia hạn: giữ thứ tự, bậc theo tổng seat kỳ mới, bảng giá hiện hành = 166.480.000 đ", () => {
    let r = T.muaThem(vanPhongTheoLanMua().subscription, { ngayHieuLuc: "2027-05-01", themNhom: [{ ma: "KHO", ten: "Kho", seat: 20, nghe: ["mua-hang"] }] });
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-07-01", themSeat: [{ maNhom: "VP", soSeat: 50 }] });
    const g = T.baoGiaGiaHan(r.subscription);
    assert.deepEqual(g.don.ky, { batDau: "2028-01-01", hetHan: "2028-12-31", soNgay: 366 });
    assert.equal(g.don.bacQuyMo!.tyLe, 20);
    assert.deepEqual(tien(g.don), [
      ["VP", "mua-hang", 1, 55200000], ["VP", "nhan-su", 2, 49680000], ["VP", "ke-toan", 3, 50560000], ["KHO", "mua-hang", 1, 11040000]
    ]);
    assert.equal(g.don.phiGoiNghe, 166480000);
    assert.equal(g.don.phiMotLan, 0, "Tinh chỉnh không thu lại");
    assert.equal(g.subscription.ky.hetHan, "2028-12-31");
  });
  
  test("Gia hạn đổi thứ tự nghề chính và áp thay đổi đã đăng ký", () => {
    let sub = T.muaMoi({ loaiKhach: "DOANH_NGHIEP", ngayBatDau: "2027-01-01", nhomSeat: [{ ma: "VP", ten: "VP", seat: 50, ngheChinh: "mua-hang", nghe: ["mua-hang", "nhan-su", "ke-toan"] }] }).subscription;
    // Thứ tự hiện tại: mua-hang #1, ke-toan #2, nhan-su #3
    sub = T.dangKyKySau(sub, { loai: "DOI_NGHE", maNhom: "VP", tu: "nhan-su", den: "marketing" }, "2027-09-01").subscription;
    sub = T.dangKyKySau(sub, { loai: "DOI_NGHE_CHINH", maNhom: "VP", ngheId: "ke-toan" }, "2027-10-01").subscription;
    sub = T.dangKyKySau(sub, { loai: "GIAM_SEAT", maNhom: "VP", soSeat: 40 }, "2027-11-01").subscription;
    // Kỳ hiện tại không đổi: không hoàn tiền, không tính lại.
    assert.equal(sub.nhomSeat[0].seat, 50);
    assert.equal(sub.donHang.length, 1);
    const g = T.baoGiaGiaHan(sub);
    assert.deepEqual(tien(g.don), [
      ["VP", "ke-toan", 1, Math.round(790000 * 40 * 0.9)],
      ["VP", "mua-hang", 2, Math.round(690000 * 40 * 0.9 * 0.9)],
      ["VP", "marketing", 3, Math.round(690000 * 40 * 0.9 * 0.8)]
    ]);
    assert.equal(g.don.bacQuyMo!.tyLe, 10, "giảm seat có thể xuống bậc ở kỳ sau");
    assert.equal(g.subscription.seat.length, 40);
    assert.deepEqual(g.subscription.thayDoiKySau, []);
  });
  
  test("Bỏ nghề ở kỳ sau: các nghề sau dồn thứ tự, giữ thứ tự tương đối", () => {
    let r = T.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: "2027-01-01", ngheChinh: "mua-hang", nghe: ["mua-hang", "ke-toan", "nhan-su"] });
    const sub = T.dangKyKySau(r.subscription, { loai: "BO_NGHE", maNhom: "CA_NHAN", ngheId: "mua-hang" }, "2027-06-01").subscription;
    const g = T.baoGiaGiaHan(sub).don;
    assert.deepEqual(g.items.map((d: Any) => [d.ngheId, d.thuTu, d.thanhTien]), [["ke-toan", 1, 790000], ["nhan-su", 2, 621000]]);
    assert.throws(() => T.dangKyKySau(sub, { loai: "BO_NGHE", maNhom: "CA_NHAN", ngheId: "quan-ly" }, "2027-06-02"), loi("NGHE_KHONG_CO_TRONG_NHOM"));
  });
  
  test("Diễn giải từng bước khớp thành tiền", () => {
    const { don } = vanPhong50();
    const d = don.items[1];
    assert.equal(d.moTa, "790.000 × 50 × (1 − 15%) × (1 − 10%)");
    assert.deepEqual(d.buoc.map((b: Any) => b.giaTri), [39500000, 33575000, 30217500]);
    assert.equal(d.buoc.at(-1)!.giaTri, d.thanhTien);
  });
  
  test("Dòng thời gian trong kế hoạch (mua mới một đơn): 83.002.500 → 7.873.562 → 39.381.042 → gia hạn 167.280.000 đ", () => {
    let r = vanPhong50();
    assert.equal(r.don.phiGoiNghe, 83002500);
    assert.equal(r.don.tongUuDai, 25497500);
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-05-01", themNhom: [{ ma: "KHO", ten: "Kho", seat: 20, nghe: ["mua-hang"] }] });
    assert.equal(r.don.tongThanhToan, 7873562);
    r = T.muaThem(r.subscription, { ngayHieuLuc: "2027-07-01", themSeat: [{ maNhom: "VP", soSeat: 50 }] });
    assert.deepEqual(tien(r.don), [["VP", "mua-hang", 1, 13913425], ["VP", "ke-toan", 2, 14336877], ["VP", "nhan-su", 3, 11130740]]);
    assert.equal(r.don.tongThanhToan, 39381042);
    const g = T.baoGiaGiaHan(r.subscription).don;
    assert.deepEqual(tien(g), [["VP", "mua-hang", 1, 55200000], ["VP", "ke-toan", 2, 56880000], ["VP", "nhan-su", 3, 44160000], ["KHO", "mua-hang", 1, 11040000]]);
    assert.equal(g.phiGoiNghe, 167280000);
  });

});

describe("Bảng giá đã chốt 14/10/2026", () => {
  const ngay = "2026-10-14";
  test("Cá nhân Mua hàng 690.000 đ/năm; Tinh chỉnh 800.000 đ/lần, không thu lại khi gia hạn", () => {
    const { don, subscription } = P.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: ngay, nghe: ["mua-hang"], tinhChinh: ["mua-hang"] });
    assert.equal(don.phiGoiNghe, 690000);
    assert.equal(don.tinhChinh.thanhTien, 800000);
    assert.equal(don.tongThanhToan, 1490000);
    assert.equal(don.ky.hetHan, "2027-10-13");
    assert.equal(P.baoGiaGiaHan(subscription).don.tongThanhToan, 690000);
  });
  test("Business 690.000 và Business Plus 990.000 đ/người/năm, ưu đãi quy mô theo tổng seat", () => {
    const b = P.donDatMua({ goi: "business", seat: 9, tinhChinh: false, ngayBatDau: ngay });
    assert.equal(b.tongThanhToan, 690000 * 9);
    const p = P.donDatMua({ goi: "business_plus", seat: 30, tinhChinh: false, ngayBatDau: ngay });
    assert.equal(p.bacQuyMo!.tyLe, 10);
    assert.equal(p.tongThanhToan, 990000 * 30 * 0.9);
    assert.equal(p.items[0].moTa, "990.000 × 30 × (1 − 10%)");
  });
  test("Bậc quy mô: 0% 1–9, 5% 10–24, 10% 25–49, 15% 50–99, 20% 100–249, 25% 250–499, 30% từ 500", () => {
    const cap = [[1, 0], [9, 0], [10, 5], [24, 5], [25, 10], [49, 10], [50, 15], [99, 15], [100, 20], [249, 20], [250, 25], [499, 25], [500, 30]];
    for (const [seat, tyLe] of cap) assert.equal(P.donDatMua({ goi: "business", seat, tinhChinh: false, ngayBatDau: ngay }).bacQuyMo!.tyLe, tyLe, seat + " seat");
  });
  test("Tinh chỉnh doanh nghiệp = liên hệ báo giá: không có giá, không cộng vào đơn", () => {
    assert.throws(() => P.muaMoi({ loaiKhach: "DOANH_NGHIEP", ngayBatDau: ngay, nhomSeat: [{ ma: "A", ten: "A", seat: 5, nghe: ["mua-hang"] }], tinhChinh: ["mua-hang"] }), (e: Any) => e.ma === "CHUA_CO_GIA");
    const d = P.donDatMua({ goi: "business", seat: 5, tinhChinh: true, ngayBatDau: ngay });
    assert.equal(d.tinhChinh.thanhTien, 0);
    assert.equal(d.tongThanhToan, 690000 * 5);
  });
  test("Giảng dạy và Hành chính – Nhân sự (sắp ra mắt) không vào được đơn", () => {
    for (const id of ["giang-day", "hanh-chinh-nhan-su"]) {
      assert.throws(() => P.muaMoi({ loaiKhach: "CA_NHAN", ngayBatDau: ngay, nghe: [id] }), (e: Any) => e.ma === "CHUA_CO_GIA");
      assert.throws(() => P.muaMoi({ loaiKhach: "DOANH_NGHIEP", ngayBatDau: ngay, nhomSeat: [{ ma: "A", ten: "A", seat: 3, nghe: [id] }] }), (e: Any) => e.ma === "CHUA_CO_GIA");
    }
    assert.deepEqual(P.ngheDangBan().map((n) => n.id), ["mua-hang"]);
  });
  test("Số seat phải là số nguyên dương", () => {
    for (const seat of [0, -1, 1.5]) assert.throws(() => P.donDatMua({ goi: "business", seat, tinhChinh: false, ngayBatDau: ngay }), (e: Any) => e.ma === "SEAT_KHONG_HOP_LE");
  });
});
