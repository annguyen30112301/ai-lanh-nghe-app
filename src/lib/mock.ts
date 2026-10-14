// Kết quả mô phỏng khi chạy ở máy không có key AI (AI_MOCK=1). Dựng từ văn bản ĐÃ CHE để luồng bỏ che vẫn chạy thật.
import type { LetterResult, SummaryResult, TableResult } from "../content/types";
import type { Skill } from "./skills";

const grab = (text: string, re: RegExp) => text.match(re)?.[1]?.trim() ?? "Không có trong báo giá";

export function mockResult(skill: Skill, fields: Record<string, string>, files: { name: string; masked: string }[]) {
  if (skill.output.kind === "table") {
    const ncc = files.map((f, i) => f.masked.match(/\[NCC_\d+\]/)?.[0] ?? `Báo giá ${i + 1}`);
    const col = (re: RegExp) => files.map((f) => grab(f.masked, re));
    const r: TableResult = {
      ncc,
      rows: [
        { tieu_chi: "Đơn giá", gia_tri: col(/đơn giá[^\d\n]{0,40}([\d.,]+\s*(?:đ|VNĐ|VND)?[^\t\n]{0,12})/i), ghi_chu: "Mô phỏng: lấy số đầu tiên sau chữ “Đơn giá”." },
        { tieu_chi: "Tổng giá trị", gia_tri: col(/(?:tổng cộng|tổng giá trị|thành tiền)[^\d\n]{0,40}([\d.,]+\s*(?:đ|VNĐ|VND)?)/i) },
        { tieu_chi: "Điều khoản thanh toán", gia_tri: col(/thanh toán[:\s]+([^\n]{3,60})/i) },
        { tieu_chi: "Thời gian giao", gia_tri: col(/(?:giao hàng|thời gian giao)[:\s]+([^\n]{2,40})/i) },
        { tieu_chi: "Bảo hành", gia_tri: col(/bảo hành[:\s]+([^\n]{2,40})/i) },
        { tieu_chi: "Rủi ro", gia_tri: files.map(() => "Cần AI thật để đánh giá") }
      ],
      de_xuat: { ncc: ncc[0], ly_do: `Đây là kết quả mô phỏng để chạy thử giao diện (ưu tiên: ${fields.priority || "cân bằng"}). Kết nối AI để nhận phân tích thật.` },
      thu_thuong_luong_goi_y: `Đề nghị ${ncc[0]} giữ giá đến hết quý và thanh toán 30 ngày.`,
      thieu_du_lieu: ["Hiệu lực báo giá", "Chi phí vận chuyển"]
    };
    return r;
  }
  if (skill.output.kind === "letter") {
    const r: LetterResult = {
      tieu_de: `Đề nghị điều chỉnh điều kiện cung cấp – ${fields.item}`,
      kinh_gui: `Kính gửi: Ban Kinh doanh ${fields.supplier}`,
      doan: [
        `Trước hết, [CONG_TY] cảm ơn ${fields.supplier} đã gửi báo giá cho ${fields.item}.`,
        `Theo báo giá hiện tại (${fields.current}), chúng tôi mong muốn trao đổi thêm để đạt: ${fields.goal}.`,
        "Đây là bản thư mô phỏng để chạy thử giao diện. Kết nối AI để nhận bản soạn thật.",
        "Rất mong sớm nhận phản hồi của Quý công ty. Trân trọng."
      ],
      ky_ten: "Phòng Mua hàng – [CONG_TY]",
      diem_thuong_luong: [fields.goal || "Điều chỉnh giá"],
      luu_y_tham_quyen: [fields.limit ? `Kiểm tra lại: ${fields.limit}` : "Kiểm tra thư không hứa số lượng hay đơn hàng tương lai."]
    };
    return r;
  }
  const r: SummaryResult = {
    tong_quan: `${fields.supplier} – bản tóm tắt mô phỏng cho nhu cầu: ${fields.need}. Kết nối AI để nhận đánh giá thật.`,
    muc: [
      { tieu_de: "Thông tin chung", y: [files[0]?.masked.split("\n").find((l) => l.trim().length > 20)?.trim() ?? "Hồ sơ không nêu"] },
      { tieu_de: "Năng lực sản xuất", y: ["Mô phỏng: cần AI thật để đọc hồ sơ."] }
    ],
    cham_diem: [
      { tieu_chi: "Năng lực sản xuất", diem: 3, nhan_xet: "Mô phỏng" },
      { tieu_chi: "Chất lượng & chứng chỉ", diem: 3, nhan_xet: "Mô phỏng" },
      { tieu_chi: "Khách hàng tiêu biểu", diem: 3, nhan_xet: "Mô phỏng" },
      { tieu_chi: "Tài chính & pháp lý", diem: 3, nhan_xet: "Mô phỏng" }
    ],
    diem_can_kiem_tra: ["Xin bản sao chứng chỉ ISO còn hiệu lực", "Xin báo cáo tài chính 2 năm gần nhất"],
    ket_luan: "Cần đánh giá thêm – đây là kết quả mô phỏng."
  };
  return r;
}
