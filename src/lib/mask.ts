// Lớp ẩn danh: thay thông tin nhạy cảm bằng nhãn ổn định trước khi gửi lên AI, rồi trả lại tên thật.
// Hàm thuần, không phụ thuộc runtime → dùng được ở server và trong test.
// Bản đồ nhãn chỉ sống trong bộ nhớ của một request, không lưu ở đâu.

export type TermKind = "ncc" | "cong_ty" | "nguoi";
export type MaskKind = TermKind | "email" | "sdt" | "mst" | "cccd" | "stk" | "tien";
export interface MarkedTerm { text: string; kind: TermKind }
export interface MaskOptions { maskMoney?: boolean }
export type Segment = { t: string } | { o: string; l: string; k: MaskKind };

const PREFIX: Record<MaskKind, string> = {
  ncc: "NCC", cong_ty: "CONG_TY", nguoi: "NGUOI", email: "EMAIL", sdt: "SDT", mst: "MST", cccd: "CCCD", stk: "STK", tien: "SO_TIEN"
};

export const KIND_LABEL: Record<MaskKind, string> = {
  ncc: "Tên nhà cung cấp", cong_ty: "Tên công ty", nguoi: "Người liên hệ", email: "Email", sdt: "Số điện thoại",
  mst: "Mã số thuế", cccd: "Số CCCD", stk: "Số tài khoản", tien: "Số tiền"
};

const NB = "(?<![\\p{L}\\p{N}])"; // không dính chữ/số phía trước
const NA = "(?![\\p{L}\\p{N}])"; // không dính chữ/số phía sau
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface Rule { kind: MaskKind; re: RegExp; group?: number }

// Thứ tự = độ ưu tiên khi các khớp chồng lên nhau.
const RULES: Rule[] = [
  { kind: "email", re: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)*\.\p{L}{2,}/gu },
  { kind: "mst", re: /(?:MST|mã số thuế|MS thuế|mã số DN|tax code)\s*[:：]?\s*(\d{10}(?:\s?-\s?\d{3})?)(?!\d)/giu, group: 1 },
  { kind: "mst", re: /(?<!\d)\d{10}-\d{3}(?!\d)/gu },
  { kind: "stk", re: /(?:STK|số tài khoản|số TK|tài khoản(?:\s+số)?|account(?:\s+no\.?)?)\s*[:：#]?\s*(\d(?:[ .-]?\d){8,15})(?!\d)/giu, group: 1 },
  { kind: "cccd", re: /(?:CCCD|CMND|căn cước(?: công dân)?)\s*(?:số)?\s*[:：]?\s*(\d{9}|\d{12})(?!\d)/giu, group: 1 },
  { kind: "cccd", re: /(?<!\d)0\d{11}(?!\d)/gu },
  { kind: "sdt", re: /(?<![\d+])(?:\+84[\s.-]?|0)(?:2\d(?:[\s.-]?\d){8}|[35789](?:[\s.-]?\d){8})(?!\d)/gu }
];
const MONEY: Rule = {
  kind: "tien",
  re: /(?<![\d.,])\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?\s*(?:đồng|đ|VNĐ|VND|vnđ)(?![\p{L}])|(?<![\d.,])\d+(?:[.,]\d+)?\s*(?:triệu|tỷ)(?:\s*(?:đồng|VNĐ|VND))?(?![\p{L}])/giu
};

const normalize = (kind: MaskKind, v: string) =>
  kind === "sdt" || kind === "stk" || kind === "cccd" || kind === "mst" ? v.replace(/\D/g, "").replace(/^84/, "0") : v.trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");

export class Masker {
  /** nhãn → giá trị gốc (lần xuất hiện đầu) */
  readonly map: Record<string, string> = {};
  private byValue = new Map<string, string>();
  private seq: Partial<Record<MaskKind, number>> = {};
  private occurrences = 0;
  private termRules: Rule[];
  private rules: Rule[];

  constructor(terms: MarkedTerm[] = [], opts: MaskOptions = {}) {
    const clean = terms
      .map((t) => ({ kind: t.kind, text: t.text.trim().replace(/\s+/g, " ") }))
      .filter((t) => t.text.length >= 2)
      .sort((a, b) => b.text.length - a.text.length);
    // đặt nhãn theo thứ tự người dùng nhập để NCC_1 là nhà cung cấp đầu tiên
    for (const t of terms) { const c = t.text.trim().replace(/\s+/g, " "); if (c.length >= 2) this.labelFor(t.kind, c); }
    this.termRules = clean.map((t) => ({ kind: t.kind, re: new RegExp(NB + esc(t.text).replace(/ /g, "\\s+") + NA, "giu") }));
    this.rules = opts.maskMoney ? [...RULES, MONEY] : RULES;
  }

  private labelFor(kind: MaskKind, original: string) {
    const key = kind + ":" + normalize(kind, original);
    let label = this.byValue.get(key);
    if (!label) {
      const n = (this.seq[kind] = (this.seq[kind] ?? 0) + 1);
      label = `[${PREFIX[kind]}${kind === "cong_ty" && n === 1 ? "" : "_" + n}]`;
      this.byValue.set(key, label);
      this.map[label] = original;
    }
    return label;
  }

  /** Che một đoạn văn bản. */
  mask(text: string): { masked: string; segments: Segment[] } {
    type Hit = { s: number; e: number; kind: MaskKind; v: string };
    const hits: Hit[] = [];
    const free = (s: number, e: number) => hits.every((h) => e <= h.s || s >= h.e);
    for (const rule of [...this.termRules, ...this.rules]) {
      const re = new RegExp(rule.re.source, rule.re.flags.includes("d") ? rule.re.flags : rule.re.flags + "d");
      for (const m of text.matchAll(re)) {
        const idx = rule.group ? m.indices?.[rule.group] : m.indices?.[0];
        if (!idx) continue;
        const [s, e] = idx;
        if (free(s, e)) hits.push({ s, e, kind: rule.kind, v: text.slice(s, e) });
      }
    }
    hits.sort((a, b) => a.s - b.s);
    const segments: Segment[] = [];
    let out = "", at = 0;
    for (const h of hits) {
      if (h.s > at) { segments.push({ t: text.slice(at, h.s) }); out += text.slice(at, h.s); }
      const l = this.labelFor(h.kind, h.v);
      segments.push({ o: h.v, l, k: h.kind });
      out += l;
      at = h.e;
      this.occurrences++;
    }
    if (at < text.length) { segments.push({ t: text.slice(at) }); out += text.slice(at); }
    return { masked: out, segments };
  }

  /** Số thông tin khác nhau đã che (chỉ tính nhãn thực sự xuất hiện), theo loại. */
  summary(used?: Set<string>) {
    const byKind: Partial<Record<MaskKind, number>> = {};
    let total = 0;
    for (const [key, label] of this.byValue) {
      if (used && !used.has(label)) continue;
      const kind = key.slice(0, key.indexOf(":")) as MaskKind;
      byKind[kind] = (byKind[kind] ?? 0) + 1;
      total++;
    }
    return { total, byKind, occurrences: this.occurrences };
  }
}

/** Nhãn đã xuất hiện trong các đoạn đã che. */
export function usedLabels(segmentsList: Segment[][]) {
  const s = new Set<string>();
  for (const segs of segmentsList) for (const g of segs) if ("l" in g) s.add(g.l);
  return s;
}

/** Trả tên thật vào chuỗi. Chấp nhận cả khi AI bỏ ngoặc vuông (NCC_1). */
export function unmaskText(text: string, map: Record<string, string>) {
  const keys = Object.keys(map).map((k) => k.slice(1, -1)).sort((a, b) => b.length - a.length);
  if (!keys.length) return text;
  const re = new RegExp(`\\[?\\b(${keys.map(esc).join("|")})\\b\\]?`, "g");
  return text.replace(re, (_, k: string) => map[`[${k}]`] ?? _);
}

/** Bỏ che đệ quy trong object/array kết quả JSON. */
export function unmaskDeep<T>(value: T, map: Record<string, string>): T {
  if (typeof value === "string") return unmaskText(value, map) as T;
  if (Array.isArray(value)) return value.map((v) => unmaskDeep(v, map)) as T;
  if (value && typeof value === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) o[unmaskText(k, map)] = unmaskDeep(v, map);
    return o as T;
  }
  return value;
}
