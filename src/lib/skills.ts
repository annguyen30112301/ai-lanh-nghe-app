// Skill Engine: định nghĩa tình huống. CHỈ import ở server – có prompt hệ thống.
import soSanh from "../skills/procurement/so-sanh-bao-gia.json";
import thuTL from "../skills/procurement/thu-thuong-luong.json";
import tomTat from "../skills/procurement/tom-tat-ho-so-ncc.json";
import type { RunResult, ScenarioPublic } from "../content/types";

export interface Skill extends ScenarioPublic { system: string; template: string }
const ALL = [soSanh, thuTL, tomTat] as unknown as Skill[];

export const getSkill = (id: string) => ALL.find((s) => s.id === id);

/** Bỏ system + template trước khi trả cho trình duyệt. */
export const publicScenarios = (): ScenarioPublic[] =>
  ALL.map(({ system: _s, template: _t, ...pub }) => pub);

export function buildPrompt(skill: Skill, fields: Record<string, string>, filesText: string) {
  const user = skill.template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k === "files_text" ? filesText || "(không có tài liệu kèm theo)" : k in fields ? fields[k] || "(không nêu)" : m
  );
  return { system: skill.system, user };
}

const isStr = (v: unknown): v is string => typeof v === "string";
const strArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

/** Kiểm tra JSON trả về đúng khung. Trả thông báo lỗi hoặc null. */
export function validateResult(skill: Skill, r: unknown, fileCount: number): string | null {
  if (!r || typeof r !== "object") return "không phải object";
  const o = r as Record<string, unknown>;
  switch (skill.output.kind) {
    case "table": {
      if (!strArr(o.ncc) || o.ncc.length < 1) return "thiếu ncc";
      if (fileCount && o.ncc.length !== fileCount) return `ncc phải có ${fileCount} cột`;
      if (!Array.isArray(o.rows)) return "thiếu rows";
      for (const row of o.rows as Record<string, unknown>[]) {
        if (!isStr(row?.tieu_chi) || !strArr(row?.gia_tri)) return "dòng sai cấu trúc";
        if (row.gia_tri.length !== o.ncc.length) return `dòng "${row.tieu_chi}" thiếu cột`;
      }
      const names = (o.rows as { tieu_chi: string }[]).map((x) => x.tieu_chi.toLocaleLowerCase("vi"));
      const miss = (skill.output.rows_required ?? []).filter((x) => !names.some((n) => n.includes(x.toLocaleLowerCase("vi"))));
      if (miss.length) return "thiếu dòng: " + miss.join(", ");
      const d = o.de_xuat as Record<string, unknown> | undefined;
      if (!d || !isStr(d.ncc) || !isStr(d.ly_do)) return "thiếu de_xuat";
      return null;
    }
    case "letter":
      if (!isStr(o.tieu_de) || !isStr(o.kinh_gui) || !strArr(o.doan) || !o.doan.length || !isStr(o.ky_ten)) return "thư thiếu phần";
      if (!strArr(o.diem_thuong_luong) || !strArr(o.luu_y_tham_quyen)) return "thiếu điểm thương lượng";
      return null;
    case "summary":
      if (!isStr(o.tong_quan) || !isStr(o.ket_luan) || !strArr(o.diem_can_kiem_tra)) return "tóm tắt thiếu phần";
      if (!Array.isArray(o.muc) || !(o.muc as Record<string, unknown>[]).every((m) => isStr(m?.tieu_de) && strArr(m?.y))) return "muc sai cấu trúc";
      if (!Array.isArray(o.cham_diem) || !(o.cham_diem as Record<string, unknown>[]).every((c) => isStr(c?.tieu_chi) && typeof c?.diem === "number" && isStr(c?.nhan_xet))) return "cham_diem sai cấu trúc";
      return null;
  }
}

/** Lấy JSON từ câu trả lời (chịu được ```json ... ```). */
export function parseJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(t); } catch { /* thử cắt khối {} */ }
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch { /* bỏ */ } }
  return null;
}

export type { RunResult };
