// Ghi số đếm của một lượt làm việc. Không bao giờ ghi nội dung.
import { db, now } from "./db";
import { fail } from "./http";

export interface RunRow { id: string; user_id: string; org_id: string; scenario_id: string; opened_at: number; status: string | null; checklist_total: number }

export async function ownRun(runId: string, userId: string) {
  const r = await db().prepare("SELECT id, user_id, org_id, scenario_id, opened_at, status, checklist_total FROM runs WHERE id = ? AND user_id = ?")
    .bind(runId, userId).first<RunRow>();
  return r ?? fail(404, "Không tìm thấy lượt làm việc này. Bạn mở lại tình huống nhé.", "run");
}

export async function recordEvent(run: RunRow, type: "edit" | "check" | "export", value: number) {
  const q =
    type === "edit" ? db().prepare("UPDATE runs SET edits = edits + 1 WHERE id = ?").bind(run.id)
    : type === "check" ? db().prepare("UPDATE runs SET checklist_done = ? WHERE id = ?").bind(Math.max(0, Math.min(value, run.checklist_total)), run.id)
    : db().prepare("UPDATE runs SET exported_at = COALESCE(exported_at, ?), status = 'exported' WHERE id = ?").bind(now(), run.id);
  await q.run();
}
