import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SealCheckIcon, WarningCircleIcon, HandshakeIcon } from "@phosphor-icons/react";
import type { ExecuteResponse, LetterResult, SummaryResult, TableResult } from "../content/types";
import type { app } from "../content/vi";

type T = typeof app.work;
interface Props { data: ExecuteResponse; t: T; onEdit: (next: ExecuteResponse["result"]) => void }

/** Chữ đổi từ nhãn [NCC_1] sang tên thật (crossfade). */
function Swap({ masked, real, restored }: { masked: string; real: string; restored: boolean }) {
  if (masked === real) return <>{real}</>;
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={restored ? "r" : "m"} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ duration: 0.45 }} className={restored ? "" : "font-semibold text-masked"}>
        {restored ? real : masked}
      </motion.span>
    </AnimatePresence>
  );
}

export default function ResultView({ data, t, onEdit }: Props) {
  const reduce = useReducedMotion();
  const [restored, setRestored] = useState(!!reduce);
  useEffect(() => {
    if (reduce) return;
    const rows = data.kind === "table" ? (data.result as TableResult).rows.length : 4;
    const id = setTimeout(() => setRestored(true), 500 + rows * 90 + 400);
    return () => clearTimeout(id);
  }, [data, reduce]);

  return (
    <div>
      <AnimatePresence>
        {restored && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="chip chip-ok mb-4" role="status">
            <SealCheckIcon size={16} weight="fill" />{t.restored}
          </motion.p>
        )}
      </AnimatePresence>
      {data.kind === "table" && <TableView r={data.result as TableResult} m={data.result_masked as TableResult} restored={restored} t={t} />}
      {data.kind === "letter" && <LetterView r={data.result as LetterResult} m={data.result_masked as LetterResult} restored={restored} t={t} onEdit={onEdit} />}
      {data.kind === "summary" && <SummaryView r={data.result as SummaryResult} m={data.result_masked as SummaryResult} restored={restored} t={t} onEdit={onEdit} />}
    </div>
  );
}

const row = (i: number) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.09, type: "spring" as const, stiffness: 300, damping: 28 } } });

function TableView({ r, m, restored, t }: { r: TableResult; m: TableResult; restored: boolean; t: T }) {
  return (
    <div className="grid gap-5">
      <div className="overflow-x-auto rounded-2xl bg-raised ring-1 ring-hair">
        <table className="tbl min-w-[36rem]">
          <thead>
            <tr>
              <th scope="col" className="w-[22%]">{t.table.criteria}</th>
              {r.ncc.map((n, i) => (
                <th key={i} scope="col" className={r.de_xuat.ncc === n ? "bg-tint !text-accent-ink" : ""}>
                  <Swap masked={m.ncc[i] ?? n} real={n} restored={restored} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.rows.map((x, i) => (
              <motion.tr key={x.tieu_chi + i} {...row(i)}>
                <th scope="row" className="!border-b !border-hair align-top !text-ink">
                  {x.tieu_chi}
                  {x.ghi_chu && <span className="mt-1 block text-[0.75rem] font-normal text-ink-3">{x.ghi_chu}</span>}
                </th>
                {x.gia_tri.map((v, j) => (
                  <td key={j} className={/không có trong báo giá/i.test(v) ? "text-ink-3 italic" : ""}>
                    <Swap masked={m.rows[i]?.gia_tri[j] ?? v} real={v} restored={restored} />
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <motion.div {...row(r.rows.length)} className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-tint p-5">
          <p className="text-[0.8rem] font-semibold text-accent-ink">{t.table.pick}</p>
          <p className="mt-1 text-[1.15rem] font-bold"><Swap masked={m.de_xuat.ncc} real={r.de_xuat.ncc} restored={restored} /></p>
          <p className="mt-2 text-[0.9rem] text-ink-2"><Swap masked={m.de_xuat.ly_do} real={r.de_xuat.ly_do} restored={restored} /></p>
        </div>
        <div className="grid gap-4">
          {r.thu_thuong_luong_goi_y && (
            <div className="rounded-2xl bg-raised p-5 ring-1 ring-hair">
              <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-ink-2"><HandshakeIcon size={18} />{t.table.nego}</p>
              <p className="mt-1 text-[0.9rem]"><Swap masked={m.thu_thuong_luong_goi_y ?? ""} real={r.thu_thuong_luong_goi_y} restored={restored} /></p>
            </div>
          )}
          {!!r.thieu_du_lieu?.length && (
            <div className="rounded-2xl bg-raised p-5 ring-1 ring-hair">
              <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-ink-2"><WarningCircleIcon size={18} />{t.table.missing}</p>
              <ul className="mt-1 list-disc pl-5 text-[0.9rem]">{r.thieu_du_lieu.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Editable({ value, onChange, rows = 3, label }: { value: string; onChange: (v: string) => void; rows?: number; label: string }) {
  return (
    <textarea aria-label={label} value={value} rows={rows} onChange={(e) => onChange(e.target.value)}
      className="w-full resize-y rounded-xl border border-transparent bg-transparent p-2 text-[0.95rem] leading-relaxed text-ink outline-none transition hover:border-hair focus:border-accent focus:bg-raised" />
  );
}

function LetterView({ r, m, restored, t, onEdit }: { r: LetterResult; m: LetterResult; restored: boolean; t: T; onEdit: Props["onEdit"] }) {
  const set = (patch: Partial<LetterResult>) => onEdit({ ...r, ...patch });
  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <motion.article {...row(0)} className="rounded-2xl bg-raised p-5 ring-1 ring-hair sm:p-7">
        <p className="text-[0.8rem] font-semibold text-ink-3">{t.letter.subject}</p>
        <p className="mt-1 font-bold"><Swap masked={m.tieu_de} real={r.tieu_de} restored={restored} /></p>
        <hr className="my-4 border-hair" />
        <p className="font-semibold"><Swap masked={m.kinh_gui} real={r.kinh_gui} restored={restored} /></p>
        <div className="mt-2 grid gap-1">
          {r.doan.map((d, i) => restored
            ? <Editable key={i} label={`Đoạn ${i + 1}`} value={d} rows={Math.max(2, Math.ceil(d.length / 80))} onChange={(v) => set({ doan: r.doan.map((x, j) => (j === i ? v : x)) })} />
            : <motion.p key={i} {...row(i + 1)} className="p-2 text-[0.95rem] leading-relaxed"><Swap masked={m.doan[i] ?? d} real={d} restored={restored} /></motion.p>)}
        </div>
        <p className="mt-3 whitespace-pre-line p-2 font-semibold"><Swap masked={m.ky_ten} real={r.ky_ten} restored={restored} /></p>
        <p className="t-note mt-2">{t.editHint}</p>
      </motion.article>
      <div className="grid content-start gap-4">
        <motion.div {...row(2)} className="rounded-2xl bg-tint p-5">
          <p className="text-[0.8rem] font-semibold text-accent-ink">{t.letter.points}</p>
          <ul className="mt-2 list-disc pl-5 text-[0.9rem]">{r.diem_thuong_luong.map((x, i) => <li key={i}><Swap masked={m.diem_thuong_luong[i] ?? x} real={x} restored={restored} /></li>)}</ul>
        </motion.div>
        <motion.div {...row(3)} className="rounded-2xl bg-urgent-soft p-5">
          <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-urgent"><WarningCircleIcon size={18} weight="fill" />{t.letter.authority}</p>
          <ul className="mt-2 list-disc pl-5 text-[0.9rem] text-ink">{r.luu_y_tham_quyen.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </motion.div>
      </div>
    </div>
  );
}

function SummaryView({ r, m, restored, t, onEdit }: { r: SummaryResult; m: SummaryResult; restored: boolean; t: T; onEdit: Props["onEdit"] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid content-start gap-4">
        <motion.div {...row(0)} className="rounded-2xl bg-raised p-5 ring-1 ring-hair">
          <p className="text-[0.8rem] font-semibold text-ink-3">{t.summary.overview}</p>
          {restored
            ? <Editable label={t.summary.overview} value={r.tong_quan} rows={4} onChange={(v) => onEdit({ ...r, tong_quan: v })} />
            : <p className="p-2 text-[0.95rem]"><Swap masked={m.tong_quan} real={r.tong_quan} restored={restored} /></p>}
        </motion.div>
        {r.muc.map((s, i) => (
          <motion.div key={i} {...row(i + 1)} className="rounded-2xl bg-raised p-5 ring-1 ring-hair">
            <h3 className="text-[1rem]">{s.tieu_de}</h3>
            <ul className="mt-2 list-disc pl-5 text-[0.9rem]">{s.y.map((x, j) => <li key={j}><Swap masked={m.muc[i]?.y[j] ?? x} real={x} restored={restored} /></li>)}</ul>
          </motion.div>
        ))}
      </div>
      <div className="grid content-start gap-4">
        <motion.div {...row(1)} className="rounded-2xl bg-raised p-5 ring-1 ring-hair">
          <p className="text-[0.8rem] font-semibold text-ink-3">{t.summary.score}</p>
          <ul className="mt-3 grid gap-3">
            {r.cham_diem.map((c, i) => (
              <li key={i}>
                <div className="flex items-center justify-between gap-3 text-[0.9rem] font-semibold">{c.tieu_chi}<span className="tabular-nums text-accent-ink">{c.diem}/5</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
                  <motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${(Math.max(0, Math.min(5, c.diem)) / 5) * 100}%` }} transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200, damping: 26 }} />
                </div>
                <p className="mt-1 text-[0.8rem] text-ink-2">{c.nhan_xet}</p>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...row(2)} className="rounded-2xl bg-urgent-soft p-5">
          <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-urgent"><WarningCircleIcon size={18} weight="fill" />{t.summary.check}</p>
          <ul className="mt-2 list-disc pl-5 text-[0.9rem] text-ink">{r.diem_can_kiem_tra.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </motion.div>
        <motion.div {...row(3)} className="rounded-2xl bg-tint p-5">
          <p className="text-[0.8rem] font-semibold text-accent-ink">{t.summary.verdict}</p>
          <p className="mt-1 font-bold"><Swap masked={m.ket_luan} real={r.ket_luan} restored={restored} /></p>
        </motion.div>
      </div>
    </div>
  );
}
