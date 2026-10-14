import { describe, expect, it } from "vitest";
import { Masker, unmaskDeep, unmaskText, usedLabels } from "../src/lib/mask";

const quote = `BÁO GIÁ – Công ty TNHH Thép Sao Phương Nam
MST: 0312345678  ·  ĐT: 0903 123 456  ·  Email: kinhdoanh@thepsaophuongnam-demo.vn
Người liên hệ: Trần Minh Khang – 028 3812 3456
Kính gửi: Cơ khí Tân Phú
Đơn giá thép tấm SS400 10mm: 18.500.000 đ/tấn
Số tài khoản: 0071 0012 34567 tại Vietcombank
CCCD người đại diện: 079085001234`;

describe("Masker", () => {
  const terms = [
    { text: "Thép Sao Phương Nam", kind: "ncc" as const },
    { text: "Cơ khí Tân Phú", kind: "cong_ty" as const },
    { text: "Trần Minh Khang", kind: "nguoi" as const }
  ];

  it("che tên đã đánh dấu và thông tin nhận diện theo quy tắc", () => {
    const m = new Masker(terms);
    const { masked } = m.mask(quote);
    expect(masked).toContain("Công ty TNHH [NCC_1]");
    expect(masked).toContain("Kính gửi: [CONG_TY]");
    expect(masked).toContain("Người liên hệ: [NGUOI_1]");
    expect(masked).toContain("MST: [MST_1]");
    expect(masked).toContain("ĐT: [SDT_1]");
    expect(masked).toContain("[SDT_2]"); // số bàn 028
    expect(masked).toContain("Email: [EMAIL_1]");
    expect(masked).toContain("Số tài khoản: [STK_1]");
    expect(masked).toContain("đại diện: [CCCD_1]");
    for (const secret of ["0312345678", "0903 123 456", "kinhdoanh@", "Khang", "Tân Phú", "079085001234", "34567"]) expect(masked).not.toContain(secret);
  });

  it("mặc định không che giá (cần để so sánh)", () => {
    const { masked } = new Masker(terms).mask(quote);
    expect(masked).toContain("18.500.000 đ/tấn");
  });

  it("che giá khi người dùng bật tùy chọn", () => {
    const { masked } = new Masker([], { maskMoney: true }).mask("Tổng: 1.250.000.000 VNĐ, cọc 30 triệu");
    expect(masked).toBe("Tổng: [SO_TIEN_1], cọc [SO_TIEN_2]");
  });

  it("nhãn ổn định giữa nhiều file và không phân biệt hoa thường", () => {
    const m = new Masker(terms);
    const a = m.mask("NCC: Thép Sao Phương Nam").masked;
    const b = m.mask("thép sao  phương nam giao 10 ngày; gọi 0903.123.456").masked;
    expect(a).toBe("NCC: [NCC_1]");
    expect(b).toBe("[NCC_1] giao 10 ngày; gọi [SDT_1]");
  });

  it("không che nhầm số lượng hay mã hàng ngắn", () => {
    const { masked } = new Masker().mask("Số lượng 120 tấn, mã SP-2024-10, giao 14 ngày, đơn giá 18500000");
    expect(masked).toBe("Số lượng 120 tấn, mã SP-2024-10, giao 14 ngày, đơn giá 18500000");
  });

  it("đếm số thông tin khác nhau đã che", () => {
    const m = new Masker(terms);
    const r = m.mask(quote);
    const s = m.summary(usedLabels([r.segments]));
    expect(s.total).toBe(9);
    expect(s.byKind.sdt).toBe(2);
  });

  it("segments ghép lại đúng văn bản gốc", () => {
    const r = new Masker(terms).mask(quote);
    expect(r.segments.map((g) => ("t" in g ? g.t : g.o)).join("")).toBe(quote);
  });
});

describe("unmask", () => {
  const map = { "[NCC_1]": "Thép Sao Phương Nam", "[NCC_2]": "Thép Minh Long Phát", "[NCC_10]": "NCC mười" };
  it("trả tên thật, kể cả khi AI bỏ ngoặc", () => {
    expect(unmaskText("Chọn [NCC_1] vì giá thấp hơn NCC_2", map)).toBe("Chọn Thép Sao Phương Nam vì giá thấp hơn Thép Minh Long Phát");
    expect(unmaskText("[NCC_10] khác [NCC_1]", map)).toBe("NCC mười khác Thép Sao Phương Nam");
  });
  it("bỏ che đệ quy trong JSON, cả khóa", () => {
    const out = unmaskDeep({ columns: ["Tiêu chí", "[NCC_1]"], rows: [{ "[NCC_2]": "ok" }] }, map);
    expect(out).toEqual({ columns: ["Tiêu chí", "Thép Sao Phương Nam"], rows: [{ "Thép Minh Long Phát": "ok" }] });
  });
});
