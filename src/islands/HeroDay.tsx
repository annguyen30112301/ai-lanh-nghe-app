import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRightIcon, CheckIcon, FileXlsIcon, FilePdfIcon, ShieldCheckIcon, DownloadSimpleIcon, CircleNotchIcon, SealCheckIcon } from "@phosphor-icons/react";
import type { home } from "../content/vi";

type H = typeof home.hero;
const START = 8 * 60, END = 8 * 60 + 18;
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const hhmm = (v: number) => { const m = Math.round(v); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };

/**
 * Khoảnh khắc chủ đạo duy nhất của trang chủ: một lần cuộn = buổi sáng 08:00 → 08:18 của chị Lan.
 * 3 báo giá → che dữ liệu → bảng so sánh → checklist → xuất file.
 */
export default function HeroDay({ h }: { h: H }) {
  // Máy chủ không biết cài đặt "Giảm chuyển động" → lần render đầu luôn như bản động, sau khi gắn mới đổi (tránh lỗi hydration #418).
  const prefersReduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = mounted && !!prefersReduce;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const minutes = useTransform(p, [0.02, 0.9], [START, END], { clamp: true });
  const clock = useTransform(minutes, hhmm);
  const rail = useTransform(p, [0.02, 0.9], [0, 1]);
  const last = h.beats.length - 1;
  const [stage, setStage] = useState(0);
  const [sub, setSub] = useState(0); // tiến độ trong một chặng (0..1)
  useEffect(() => { if (reduce) { setStage(last); setSub(1); } }, [reduce, last]);
  useMotionValueEvent(minutes, "change", (v) => {
    let s = 0;
    h.beats.forEach((b, i) => { if (toMin(b.t) <= v + 0.01) s = i; });
    if (s !== stage) setStage(s);
    const a = toMin(h.beats[s].t), b = s < last ? toMin(h.beats[s + 1].t) : END + 1;
    setSub(Math.min(1, (v - a) / (b - a)));
  });
  const beat = h.beats[stage];

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div ref={ref} className={reduce ? "relative" : "relative h-[340vh]"}>
        <div className={reduce ? "relative overflow-hidden pb-16 pt-28" : "sticky top-0 flex h-[100dvh] min-h-[38rem] items-start overflow-hidden pb-24 pt-24 lg:items-center lg:pb-10"}>
          <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[44rem] rounded-full bg-brand-200/40 blur-3xl" />
          <div className="shell grid w-full items-center gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            {/* chữ */}
            <div>
              <p className="chip">{h.day}</p>
              <motion.p aria-hidden className="mt-3 font-bold leading-none tracking-[-0.05em] tabular-nums text-accent text-[clamp(2.2rem,1.4rem+4.5vw,5.6rem)]">
                {reduce ? hhmm(END) : <motion.span>{clock}</motion.span>}
              </motion.p>
              <h1 className="t-display relative mt-3 max-w-[16ch] !text-[clamp(1.55rem,1rem+2.2vw,2.9rem)]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={stage === last ? "done" : "start"} className="block" initial={{ opacity: 0, y: 18, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -14 }}>
                    {stage === last ? h.headlineDone : h.headline}
                  </motion.span>
                </AnimatePresence>
              </h1>
              <div className="relative mt-3 min-h-[4.5rem] lg:mt-4" aria-live="polite">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={stage} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <p className="font-semibold text-ink"><span className="tabular-nums text-accent-2">{beat.t}</span> · {beat.title}</p>
                    <p className="mt-1 text-[0.95rem] text-ink-2">{beat.body}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <p className="mt-2 hidden max-w-[46ch] text-[0.95rem] text-ink-2 lg:block">{h.lead}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={h.cta.href} className="btn btn-accent">{h.cta.label}<ArrowRightIcon size={18} weight="bold" /></a>
                <a href={h.cta2.href} className="btn btn-quiet hidden sm:inline-flex">{h.cta2.label}</a>
              </div>
            </div>

            {/* bàn làm việc */}
            <div className="desk relative min-h-[14rem] overflow-hidden p-4 sm:min-h-[24rem] sm:p-6" aria-hidden>
              <Stage stage={stage} sub={sub} h={h} />
            </div>
          </div>

          {!reduce && (
            <div className="absolute inset-x-0 bottom-0 hidden lg:block" aria-hidden>
              <div className="shell flex items-center gap-4 pb-6 text-xs font-semibold tabular-nums text-ink-3">
                <span>08:00</span>
                <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-hair">
                  <motion.div className="absolute inset-0 origin-left bg-accent-2" style={{ scaleX: rail }} />
                </div>
                <span>08:18</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}

function Stage({ stage, sub, h }: { stage: number; sub: number; h: H }) {
  const maskedOn = stage > 2 ? h.masked.length : stage === 2 ? Math.floor(sub * 1.6 * (h.masked.length + 1)) : 0;
  const tableOn = stage >= 3;
  const restored = stage > 3 || (stage === 3 && sub > 0.45);
  const ticks = stage > 4 ? h.checklist.length : stage === 4 ? Math.min(h.checklist.length, Math.floor(sub * 1.4 * (h.checklist.length + 1))) : 0;
  const exported = stage >= 5;

  return (
    <div className="grid h-full gap-3">
      {/* file */}
      <motion.div layout className={`gap-2 ${tableOn ? "hidden grid-cols-3 sm:grid" : "grid"}`}>
        {h.files.map((f, i) => (
          <motion.div key={f} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.12 } }}
            className="flex min-w-0 items-center gap-2 rounded-xl bg-raised px-3 py-2 text-[0.75rem] font-medium ring-1 ring-hair">
            {f.endsWith(".pdf") ? <FilePdfIcon size={18} className="shrink-0 text-accent" /> : <FileXlsIcon size={18} className="shrink-0 text-accent" />}
            <span className="truncate">{f}</span>
            {stage >= 1 && !tableOn && <CheckIcon size={14} weight="bold" className="ml-auto shrink-0 text-accent-2" />}
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="popLayout">
        {stage >= 1 && stage <= 2 && (
          <motion.div key="mask" layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="rounded-2xl bg-raised p-4 ring-1 ring-hair">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.75rem] font-semibold text-ink-3">{stage === 1 ? h.formLine : h.masking}</p>
              {stage === 2 && <span className="chip chip-masked !text-[0.72rem]"><ShieldCheckIcon size={14} weight="fill" />{h.maskedCount.replace("{n}", String(Math.min(maskedOn, h.masked.length)))}</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[0.78rem]">
              {h.masked.map((m, i) => (
                <motion.span key={m.l} layout className="inline-block">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {i < maskedOn
                      ? <motion.span key="l" className="mask-tag" initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}>{m.l}</motion.span>
                      : <motion.span key="o" className="mask-src" exit={{ opacity: 0, scale: 0.9 }}>{m.o}</motion.span>}
                  </AnimatePresence>
                </motion.span>
              ))}
            </div>
            {stage === 2 && maskedOn >= h.masked.length && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-2 text-[0.75rem] font-semibold text-accent-ink">
                <CircleNotchIcon size={14} weight="bold" className="spin" />{h.sending}
              </motion.p>
            )}
          </motion.div>
        )}

        {tableOn && (
          <motion.div key="table" layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl bg-raised ring-1 ring-hair">
            <table className="w-full text-left text-[0.62rem] leading-snug sm:text-[0.78rem]">
              <thead>
                <tr>
                  {h.table.head.map((c, i) => (
                    <th key={i} className={`border-b border-hair px-1.5 py-1.5 font-semibold sm:px-2.5 sm:py-2 ${i === 2 ? "bg-tint text-accent-ink" : "text-ink-2"}`}>
                      {i === 0 ? c : (
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span key={restored ? "r" : "m"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={restored ? "" : "text-masked"}>
                            {restored ? c : `[NCC_${i}]`}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {h.table.rows.map((r, i) => (
                  <motion.tr key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.1 } }}>
                    {r.map((c, j) => <td key={j} className={`border-b border-hair px-1.5 py-1.5 sm:px-2.5 sm:py-2 ${j === 0 ? "font-semibold" : "tabular-nums"}`}>{c}</td>)}
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-2.5 text-[0.75rem] font-semibold text-accent-ink">{restored ? h.table.pick : h.table.pickMasked}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {stage >= 4 && (
        <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <ul className="grid gap-1.5">
            {h.checklist.map((c, i) => (
              <li key={c} className="flex items-center gap-2 text-[0.75rem]">
                <motion.span animate={{ scale: i < ticks ? [1, 1.25, 1] : 1 }} transition={{ duration: 0.3 }}
                  className={`grid size-5 place-items-center rounded-md border-2 ${i < ticks ? "border-accent-2 bg-accent-2 text-white" : "border-hair bg-raised"}`}>
                  {i < ticks && <CheckIcon size={11} weight="bold" />}
                </motion.span>
                {c}
              </li>
            ))}
          </ul>
          <motion.span layout animate={{ backgroundColor: exported ? "#5a3b0a" : "#e6e1da", color: exported ? "#ffffff" : "#69625a" }}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[0.78rem] font-semibold">
            {exported ? <SealCheckIcon size={16} weight="fill" /> : <DownloadSimpleIcon size={16} weight="bold" />}{exported ? h.exported : h.exportLabel}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
