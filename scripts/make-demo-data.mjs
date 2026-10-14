// Sinh bộ dữ liệu GIẢ cho demo vào public/demo-data/. Tên, MST, SĐT, email đều bịa.
// Chạy: node scripts/make-demo-data.mjs  (cần font Arial của macOS để PDF có chữ tiếng Việt)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const out = new URL("../public/demo-data/", import.meta.url);
mkdirSync(out, { recursive: true });
const FONT = "/System/Library/Fonts/Supplemental/Arial.ttf";
const FONT_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf";

function xlsx(name, aoa, widths) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = widths.map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bao gia");
  writeFileSync(new URL(name, out), XLSX.write(wb, { bookType: "xlsx", type: "buffer" }));
}

// NCC 1 – đơn giá theo tấn, chưa VAT, thanh toán 50/50
xlsx("Bao_gia_Minh_Long_Phat.xlsx", [
  ["CÔNG TY TNHH THÉP MINH LONG PHÁT"],
  ["Địa chỉ: 18 Đường số 7, KCN Tân Tạo, Q. Bình Tân, TP.HCM"],
  ["MST: 0312345678", "ĐT: 0903 123 456", "Email: kinhdoanh@minhlongphat-demo.vn"],
  [],
  ["BÁO GIÁ SỐ ML-2610/14"],
  ["Kính gửi: Công ty TNHH Cơ khí Tân Phú – Phòng Mua hàng"],
  ["Người liên hệ: Trần Minh Khang – 0908 765 432"],
  [],
  ["STT", "Hàng hóa", "Quy cách", "ĐVT", "Số lượng", "Đơn giá (đ)", "Thành tiền (đ)"],
  [1, "Thép tấm SS400", "10mm x 1500 x 6000", "tấn", 20, 18500000, 370000000],
  ["", "", "", "", "", "Tổng cộng chưa VAT", 370000000],
  ["", "", "", "", "", "VAT 10%", 37000000],
  ["", "", "", "", "", "Tổng cộng", 407000000],
  [],
  ["Thanh toán: 50% khi đặt hàng, 50% khi giao hàng"],
  ["Giao hàng: 14 ngày kể từ ngày nhận tiền cọc, tại kho bên mua"],
  ["Bảo hành: Theo chứng chỉ CO/CQ nhà máy, đổi trả hàng lỗi trong 30 ngày"],
  ["Hiệu lực báo giá: 15 ngày"],
  ["Số tài khoản: 1903 4567 8910 11 – Ngân hàng TMCP Kỹ Thương, CN Bình Tân"]
], [6, 22, 22, 8, 10, 20, 20]);

// NCC 2 – đơn giá theo kg, ĐÃ gồm VAT, công nợ 30 ngày (để thử quy đổi)
xlsx("Bao_gia_Sao_Phuong_Nam.xlsx", [
  ["THÉP SAO PHƯƠNG NAM – BẢNG BÁO GIÁ"],
  ["Công ty CP Thép Sao Phương Nam · MST 0314455667 · Hotline 028 3812 3456"],
  ["Gửi: Cơ khí Tân Phú", "Phụ trách: Lê Thu Hà", "thuha.le@saophuongnam-demo.vn"],
  [],
  ["Mặt hàng", "Mác thép", "Độ dày", "Khối lượng (kg)", "Đơn giá đã gồm VAT (đ/kg)", "Thành tiền đã gồm VAT (đ)"],
  ["Thép tấm cán nóng", "SS400", "10 mm", 20000, 19965, 399300000],
  [],
  ["Điều kiện"],
  ["Thanh toán", "Công nợ 30 ngày kể từ ngày giao"],
  ["Thời gian giao", "10 ngày làm việc"],
  ["Bảo hành", "12 tháng về chất lượng vật liệu"],
  ["Vận chuyển", "4.000.000 đ/chuyến, dự kiến 2 chuyến"],
  ["Hiệu lực", "7 ngày"]
], [22, 12, 10, 16, 26, 28]);

async function pdf(name, title, lines) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const f = await doc.embedFont(readFileSync(FONT), { subset: true });
  const fb = await doc.embedFont(readFileSync(FONT_B), { subset: true });
  let page = doc.addPage([595, 842]);
  let y = 790;
  page.drawText(title, { x: 50, y, size: 16, font: fb, color: rgb(0.13, 0.12, 0.11) });
  y -= 30;
  for (const l of lines) {
    if (y < 60) { page = doc.addPage([595, 842]); y = 790; }
    const bold = l.startsWith("## ");
    const text = bold ? l.slice(3) : l;
    if (bold) y -= 6;
    page.drawText(text, { x: 50, y, size: bold ? 12 : 10.5, font: bold ? fb : f, color: rgb(0.13, 0.12, 0.11) });
    y -= bold ? 20 : 16;
  }
  writeFileSync(new URL(name, out), await doc.save());
}

// NCC 3 – PDF có chữ, giao nhanh, trả 100% khi giao, không nêu bảo hành
await pdf("Bao_gia_Dai_Thanh.pdf", "CÔNG TY TNHH KIM KHÍ ĐẠI THÀNH", [
  "Chi nhánh Bình Dương – MST: 0315678123-001",
  "Điện thoại: 0274 3888 999 · Di động: 0937 222 111 · Email: baogia@daithanh-demo.vn",
  "",
  "## BÁO GIÁ THÉP TẤM",
  "Kính gửi: Phòng Mua hàng – Công ty TNHH Cơ khí Tân Phú",
  "Người phụ trách: Phạm Quốc Bảo",
  "",
  "Hàng hóa: Thép tấm SS400, dày 10 mm, khổ 1500 x 6000 mm",
  "Số lượng: 20 tấn",
  "Đơn giá: 18.900.000 đ/tấn (chưa VAT)",
  "Thành tiền chưa VAT: 378.000.000 đ",
  "Thuế VAT 10%: 37.800.000 đ",
  "Tổng cộng: 415.800.000 đ",
  "",
  "## ĐIỀU KIỆN",
  "Thanh toán: 100% khi giao hàng, chuyển khoản",
  "Giao hàng: 7 ngày, miễn phí vận chuyển nội thành TP.HCM và Bình Dương",
  "Hàng có sẵn tại kho Dĩ An, số lượng có hạn",
  "Báo giá có hiệu lực trong 5 ngày",
  "",
  "Thông tin chuyển khoản – Số tài khoản: 0071 0012 34567 – Ngân hàng Ngoại thương, CN Bình Dương",
  "Chủ tài khoản: Công ty TNHH Kim khí Đại Thành"
]);

// Hồ sơ năng lực nhà cung cấp gia công
await pdf("Ho_so_nang_luc_Dai_Phong.pdf", "HỒ SƠ NĂNG LỰC – CÔNG TY CP CƠ KHÍ ĐẠI PHONG", [
  "Địa chỉ: Lô C5, KCN Hiệp Phước, Nhà Bè, TP.HCM · MST: 0316789012",
  "Đại diện: Ông Nguyễn Văn Phong – Giám đốc · ĐT: 0912 345 678 · phong.nguyen@daiphong-demo.vn",
  "",
  "## 1. GIỚI THIỆU",
  "Thành lập năm 2009, chuyên gia công cơ khí chính xác, kết cấu thép và chi tiết máy.",
  "Nhân sự: 126 người, trong đó 18 kỹ sư cơ khí, 9 nhân viên QC.",
  "Nhà xưởng 6.500 m2, hoạt động 2 ca/ngày.",
  "",
  "## 2. NĂNG LỰC SẢN XUẤT",
  "12 máy phay CNC 3–5 trục (Mazak, DMG Mori), 6 máy tiện CNC, 2 máy cắt laser fiber 6 kW.",
  "Công suất gia công chi tiết khung máy: khoảng 800 bộ/tháng (theo công bố của công ty).",
  "Dung sai đạt được: ±0,05 mm với chi tiết dưới 1 m.",
  "Có dây chuyền sơn tĩnh điện và mạ kẽm (thuê ngoài một phần).",
  "",
  "## 3. CHẤT LƯỢNG & CHỨNG CHỈ",
  "ISO 9001:2015 – cấp bởi tổ chức chứng nhận quốc tế, hiệu lực đến 12/2026.",
  "Phòng đo có máy CMM 3D, kiểm tra 100% kích thước quan trọng.",
  "Tỷ lệ hàng lỗi bị trả về năm 2025: 0,8% (số liệu nội bộ).",
  "",
  "## 4. KHÁCH HÀNG TIÊU BIỂU",
  "Nhà máy thiết bị nông nghiệp tại Long An (từ 2018)",
  "Doanh nghiệp FDI ngành bao bì tại Bình Dương (từ 2021)",
  "Không kèm thư xác nhận hoặc thông tin liên hệ của khách hàng tham chiếu.",
  "",
  "## 5. TÀI CHÍNH & PHÁP LÝ",
  "Vốn điều lệ: 25 tỷ đồng.",
  "Doanh thu 2024: khoảng 85 tỷ đồng (công ty tự công bố, chưa kèm báo cáo kiểm toán).",
  "Tài khoản giao dịch: số tài khoản 0601 2345 6789 – Ngân hàng Sài Gòn Thương Tín.",
  "",
  "## 6. ĐIỀU KIỆN HỢP TÁC",
  "Thời gian mẫu thử: 10 ngày. Đơn hàng tối thiểu 100 bộ.",
  "Thanh toán đề xuất: 30% tạm ứng, 70% trong 30 ngày sau giao."
]);

console.log("Đã tạo demo-data:", ["Bao_gia_Minh_Long_Phat.xlsx", "Bao_gia_Sao_Phuong_Nam.xlsx", "Bao_gia_Dai_Thanh.pdf", "Ho_so_nang_luc_Dai_Phong.pdf"].join(", "));
