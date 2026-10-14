// Tính số liệu dashboard từ bảng runs (chỉ số đếm và mốc thời gian).
import { publicScenarios } from "./skills";

export interface StatRun { user_id: string; scenario_id: string; opened_at: number; result_at: number | null; exported_at: number | null; masked_items: number }
const WEEK = 7 * 864e5;

export const scenarioNames = () => Object.fromEntries(publicScenarios().map((s) => [s.id, s.name]));
const refs = () => Object.fromEntries(publicScenarios().map((s) => [s.id, s.manual_minutes_ref]));

/** Phút làm việc của một lượt: từ lúc mở tới lúc xuất (hoặc có kết quả). */
export const minutesOf = (r: StatRun) => Math.max(1, Math.round((((r.exported_at ?? r.result_at) ?? r.opened_at) - r.opened_at) / 6e4));

export function summarize(runs: StatRun[], baselines: Record<string, number> = {}) {
  const ref = refs(), names = scenarioNames();
  const done = runs.filter((r) => r.result_at);
  const by: Record<string, { id: string; name: string; count: number; minutes: number; manual: number }> = {};
  let saved = 0, masked = 0;
  for (const r of done) {
    const m = minutesOf(r);
    const manual = baselines[r.scenario_id] ?? ref[r.scenario_id] ?? 45;
    saved += Math.max(0, manual - m);
    masked += r.masked_items || 0;
    const s = (by[r.scenario_id] ??= { id: r.scenario_id, name: names[r.scenario_id] ?? r.scenario_id, count: 0, minutes: 0, manual });
    s.count++; s.minutes += m;
  }
  const scenarios = Object.values(by).map((s) => ({ ...s, avg_minutes: Math.round(s.minutes / s.count) })).sort((a, b) => b.count - a.count);
  return { runs: done.length, exported: done.filter((r) => r.exported_at).length, saved_minutes: saved, masked_items: masked, scenarios, top: scenarios[0]?.name ?? null };
}

/** Số lượt theo 4 tuần gần nhất (cũ → mới). */
export function weekly(runs: StatRun[], weeks = 4, at = Date.now()) {
  const out = Array.from({ length: weeks }, (_, i) => ({ label: `Tuần ${i + 1}`, start: at - (weeks - i) * WEEK, count: 0 }));
  for (const r of runs) {
    if (!r.result_at) continue;
    const i = weeks - 1 - Math.floor((at - r.opened_at) / WEEK);
    if (i >= 0 && i < weeks) out[i].count++;
  }
  return out;
}
