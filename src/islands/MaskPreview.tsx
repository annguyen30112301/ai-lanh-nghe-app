import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { ShieldCheckIcon, CircleNotchIcon } from "@phosphor-icons/react";
import type { PreviewResponse, Segment } from "../content/types";

interface Props {
  preview: PreviewResponse;
  t: { preview: string; previewLead: string; truncated: string; counted: string };
  /** gọi một lần khi mọi nhãn đã đổi xong */
  onDone?: () => void;
  status?: string | null;
}

const STEP_MS = 70;
const MAX_ANIMATED = 48;

/**
 * Khoảnh khắc chủ đạo của app: từng thông tin nhạy cảm chuyển dần thành nhãn màu --masked,
 * bộ đếm chạy lên, rồi chuyển sang trạng thái gửi lên AI.
 */
export default function MaskPreview({ preview, t, onDone, status }: Props) {
  const reduce = useReducedMotion();
  // đánh số các token che theo thứ tự xuất hiện
  const order = useMemo(() => {
    let n = 0;
    return preview.blocks.map((b) => b.segments.map((s) => ("l" in s ? n++ : -1)));
  }, [preview]);
  const totalTokens = order.flat().filter((i) => i >= 0).length;
  const [flipped, setFlipped] = useState(reduce ? Infinity : -1);
  const [count, setCount] = useState(reduce ? preview.total : 0);
  const done = useRef(false);

  useEffect(() => {
    if (reduce) { const id = setTimeout(() => !done.current && ((done.current = true), onDone?.()), 400); return () => clearTimeout(id); }
    const animatedCount = Math.min(totalTokens, MAX_ANIMATED);
    let i = -1;
    const start = setTimeout(() => {
      const tick = setInterval(() => {
        i++;
        setFlipped(i >= animatedCount - 1 ? Infinity : i);
        if (i >= animatedCount - 1) clearInterval(tick);
      }, STEP_MS);
    }, 450);
    const dur = (animatedCount * STEP_MS) / 1000 + 0.2;
    const c = animate(0, preview.total, { duration: Math.max(0.6, dur), delay: 0.45, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setCount(Math.round(v)) });
    const fin = setTimeout(() => { if (!done.current) { done.current = true; onDone?.(); } }, 450 + animatedCount * STEP_MS + 900);
    return () => { clearTimeout(start); clearTimeout(fin); c.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  return (
    <motion.section initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ type: "spring", stiffness: 220, damping: 30 }}
      className="overflow-hidden" aria-labelledby="mp-title">
      <div className="desk p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="mp-title" className="text-[1.15rem]">{t.preview}</h2>
            <p className="mt-1 text-[0.88rem] text-ink-2">{t.previewLead}</p>
          </div>
          <motion.span layout className="chip chip-masked text-[0.88rem]" aria-live="polite">
            <ShieldCheckIcon size={18} weight="fill" />
            <span className="tabular-nums">{t.counted.replace("{n}", String(count))}</span>
          </motion.span>
        </div>

        <div className="mt-5 grid gap-4">
          {preview.blocks.map((b, bi) => (b.segments.length ? (
            <div key={bi} className="rounded-2xl bg-raised p-4 ring-1 ring-hair">
              <p className="text-[0.78rem] font-semibold text-ink-3">{b.title}</p>
              <p className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words font-[ui-monospace,monospace] text-[0.8rem] leading-relaxed text-ink">
                {b.segments.map((s, si) => <Token key={si} s={s} on={order[bi][si] >= 0 && order[bi][si] <= flipped} />)}
                {b.truncated && <span className="text-ink-3">{"\n"}{t.truncated}</span>}
              </p>
            </div>
          ) : null))}
        </div>

        <AnimatePresence>
          {status && (
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status"
              className="mt-5 flex items-center gap-3 text-[0.95rem] font-semibold text-accent-ink">
              <CircleNotchIcon size={22} weight="bold" className="spin" />{status}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function Token({ s, on }: { s: Segment; on: boolean }) {
  if ("t" in s) return <>{s.t}</>;
  return (
    <motion.span layout="position" className="inline-block align-baseline" transition={{ type: "spring", stiffness: 320, damping: 26 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        {on ? (
          <motion.span key="l" className="mask-tag" initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            aria-label={s.l}>{s.l}</motion.span>
        ) : (
          <motion.span key="o" className="mask-src" exit={{ opacity: 0, scale: 0.9 }}>{s.o}</motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
