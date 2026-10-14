import { useRef } from "react";
import { motion } from "motion/react";

interface Props { value: string; onChange: (v: string) => void; aria: string; onComplete?: (v: string) => void; disabled?: boolean }

/** 6 ô nhập mã: tự nhảy ô, dán cả mã, xóa lùi. */
export default function OtpBoxes({ value, onChange, aria, onComplete, disabled }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const set = (v: string) => { const clean = v.replace(/\D/g, "").slice(0, 6); onChange(clean); if (clean.length === 6) onComplete?.(clean); return clean; };

  return (
    <div className="mt-5 flex justify-between gap-2 sm:gap-3" role="group">
      {digits.map((d, i) => (
        <motion.input key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={6}
          aria-label={aria.replace("{i}", String(i + 1))} value={d} disabled={disabled}
          animate={d ? { scale: [1, 1.08, 1], borderColor: "#5a3b0a" } : { scale: 1, borderColor: "#e6e1da" }} transition={{ duration: 0.3 }}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) { const c = set(v); refs.current[Math.min(c.length, 5)]?.focus(); return; }
            const next = (value.slice(0, i) + v + value.slice(i + 1)).slice(0, 6);
            set(next.length < i ? value + v : next);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) { set(value.slice(0, i - 1) + value.slice(i)); refs.current[i - 1]?.focus(); e.preventDefault(); }
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          className="h-16 w-full min-w-0 rounded-2xl border-2 bg-raised text-center text-2xl font-bold tabular-nums text-ink outline-none focus:shadow-[0_0_0_4px_rgb(90_59_10/0.18)] sm:h-[4.5rem]" />
      ))}
    </div>
  );
}
