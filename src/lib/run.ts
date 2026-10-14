// Chuẩn bị dữ liệu một lượt: kiểm tra đầu vào → che → (preview | ghép prompt).
import type { FileText, MarkedTermIn, ScenarioPublic } from "../content/types";
import { Masker, usedLabels, type MarkedTerm, type Segment } from "./mask";
import { fail } from "./http";
import type { Skill } from "./skills";

export interface RunBody {
  run_id?: string;
  fields?: Record<string, string>;
  file_texts?: FileText[];
  marked_terms?: MarkedTermIn[];
  mask_money?: boolean;
}

const MAX_FIELD = 2000, MAX_FILES_CHARS = 120_000, PREVIEW_CHARS = 1600;

export function checkInputs(skill: ScenarioPublic, b: RunBody) {
  const fields: Record<string, string> = {};
  for (const inp of skill.inputs) {
    if (inp.type === "files") continue;
    const v = String(b.fields?.[inp.key] ?? "").trim().slice(0, MAX_FIELD);
    if (inp.required && !v) fail(400, `Bạn chưa điền “${inp.label}”.`);
    if (inp.type === "select" && v && !inp.options?.includes(v)) fail(400, `Lựa chọn “${inp.label}” không hợp lệ.`);
    fields[inp.key] = v;
  }
  const fileInput = skill.inputs.find((i) => i.type === "files");
  const files = (b.file_texts ?? []).filter((f) => f && typeof f.text === "string" && f.text.trim()).map((f) => ({ name: String(f.name ?? "").slice(0, 120), text: f.text }));
  if (fileInput) {
    if (files.length < (fileInput.min ?? 0)) fail(400, `Cần ít nhất ${fileInput.min} file cho “${fileInput.label}”.`);
    if (files.length > (fileInput.max ?? 4)) fail(400, `Tối đa ${fileInput.max} file.`);
  }
  if (files.reduce((n, f) => n + f.text.length, 0) > MAX_FILES_CHARS) fail(413, "Tài liệu quá dài. Bạn bỏ bớt trang/sheet không cần thiết (tối đa khoảng 200 dòng mỗi file).");
  const terms: MarkedTerm[] = [];
  for (const inp of skill.inputs) if (inp.mask_as && fields[inp.key]) terms.push({ text: fields[inp.key], kind: inp.mask_as });
  for (const t of (b.marked_terms ?? []).slice(0, 30)) {
    if (t && typeof t.text === "string" && ["ncc", "cong_ty", "nguoi"].includes(t.kind)) terms.push({ text: t.text.slice(0, 120), kind: t.kind });
  }
  return { fields, files, terms };
}

export function maskAll(skill: Skill, b: RunBody) {
  const { fields, files, terms } = checkInputs(skill, b);
  const m = new Masker(terms, { maskMoney: !!b.mask_money });
  const segs: Segment[][] = [];
  const mFields: Record<string, string> = {};
  for (const inp of skill.inputs) {
    if (inp.type === "files" || !fields[inp.key]) continue;
    const r = m.mask(fields[inp.key]);
    mFields[inp.key] = r.masked;
    segs.push([{ t: `${inp.label}: ` }, ...r.segments, { t: "\n" }]);
  }
  const mFiles = files.map((f) => {
    const r = m.mask(f.text);
    segs.push(r.segments);
    return { name: f.name, masked: r.masked, segments: r.segments };
  });
  const used = usedLabels(segs);
  const summary = m.summary(used);
  return { fields: mFields, files: mFiles, fieldSegments: segs.slice(0, segs.length - mFiles.length).flat(), map: m.map, summary };
}

/** Cắt bớt segments để xem trước, giữ nguyên các nhãn đầu tiên. */
export function previewSegments(segments: Segment[]) {
  const out: Segment[] = [];
  let n = 0;
  for (const g of segments) {
    const len = "t" in g ? g.t.length : g.o.length;
    if (n + len > PREVIEW_CHARS) {
      if ("t" in g) out.push({ t: g.t.slice(0, Math.max(0, PREVIEW_CHARS - n)) });
      return { segments: out, truncated: true };
    }
    out.push(g); n += len;
  }
  return { segments: out, truncated: false };
}

export const filesText = (files: { masked: string }[]) =>
  files.map((f, i) => `=== Tệp ${i + 1} ===\n${f.masked}`).join("\n\n");
