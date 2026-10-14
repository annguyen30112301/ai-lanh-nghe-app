// Kiểu dùng chung giữa API và islands (không chứa prompt).
export type InputType = "text" | "textarea" | "select" | "files";
export interface ScenarioInput {
  key: string; label: string; type: InputType; example?: string; options?: string[];
  min?: number; max?: number; hint?: string; required?: boolean; mask_as?: "ncc" | "cong_ty" | "nguoi";
}
export interface ScenarioPublic {
  id: string; name: string; summary: string; cta: string; manual_minutes_ref: number;
  export: "xlsx" | "docx"; inputs: ScenarioInput[]; mask_hint: string; checklist: string[];
  output: { kind: "table" | "letter" | "summary"; rows_required?: string[] };
}

export interface TableResult {
  ncc: string[];
  rows: { tieu_chi: string; gia_tri: string[]; ghi_chu?: string }[];
  de_xuat: { ncc: string; ly_do: string };
  thu_thuong_luong_goi_y?: string;
  thieu_du_lieu?: string[];
}
export interface LetterResult {
  tieu_de: string; kinh_gui: string; doan: string[]; ky_ten: string;
  diem_thuong_luong: string[]; luu_y_tham_quyen: string[];
}
export interface SummaryResult {
  tong_quan: string;
  muc: { tieu_de: string; y: string[] }[];
  cham_diem: { tieu_chi: string; diem: number; nhan_xet: string }[];
  diem_can_kiem_tra: string[];
  ket_luan: string;
}
export type RunResult = TableResult | LetterResult | SummaryResult;

import type { MaskKind, Segment } from "../lib/mask";
export type { MaskKind, Segment };
export interface FileText { name: string; text: string }
export interface MarkedTermIn { text: string; kind: "ncc" | "cong_ty" | "nguoi" }

export interface PreviewResponse {
  blocks: { title: string; segments: Segment[]; truncated: boolean }[];
  total: number;
  byKind: Partial<Record<MaskKind, number>>;
}
export interface ExecuteResponse {
  result: RunResult; kind: ScenarioPublic["output"]["kind"];
  /** cùng kết quả nhưng còn nhãn – để hiệu ứng đổi nhãn → tên thật */
  result_masked: RunResult;
  masked_items: number; via_trial: boolean; trial_left: number | null; provider: string; model: string; seconds: number;
}
export interface MeResponse {
  user: { id: string; email: string; name: string | null };
  org: { id: string; name: string; plan: string; role: "admin" | "member"; seats: number };
  ai: { source: string; provider: string; key_last4: string; verified_at: number | null; model: string | null; allow_fallback: number; fallback_model: string | null } | null;
  trial_left: number;
  /** mô hình nhóm chọn cho lượt dùng thử (null khi chạy mô phỏng) */
  trial_model: string | null;
  mock: boolean;
}

import type { ModelInfo } from "../lib/models";
export type { ModelInfo };
export interface ModelsResponse {
  provider: string; models: ModelInfo[]; usd_vnd: number;
  current: { model: string | null; allow_fallback: boolean; fallback_model: string | null };
  can_edit: boolean;
}
