import { motion } from "motion/react";
import { CheckIcon, DownloadSimpleIcon, LockSimpleIcon } from "@phosphor-icons/react";

interface Props {
  items: string[];
  checked: boolean[];
  onToggle: (i: number) => void;
  title: string;
  lead: string;
  exportLabel: string;
  onExport: () => void;
  busy?: boolean;
}

/** Tick có phản hồi lò xo; đủ thì nút Xuất "bật" lên (layout + màu). */
export default function Checklist({ items, checked, onToggle, title, lead, exportLabel, onExport, busy }: Props) {
  const all = checked.length === items.length && checked.every(Boolean);
  const n = checked.filter(Boolean).length;
  return (
    <section className="rounded-3xl bg-raised p-5 ring-1 ring-hair sm:p-6" aria-labelledby="ck-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="ck-title" className="text-[1.1rem]">{title}</h2>
        <span className="text-[0.85rem] font-semibold tabular-nums text-accent-2">{n}/{items.length}</span>
      </div>
      <p className="mt-1 text-[0.85rem] text-ink-2">{lead.replace("{n}", String(items.length))}</p>
      <ul className="mt-4 grid gap-2">
        {items.map((it, i) => (
          <li key={i}>
            <button type="button" role="checkbox" aria-checked={checked[i]} onClick={() => onToggle(i)}
              className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[0.92rem] transition-colors ${checked[i] ? "bg-[color-mix(in_oklab,var(--accent-2)_10%,white)]" : "hover:bg-canvas"}`}>
              <motion.span animate={checked[i] ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 transition-colors ${checked[i] ? "border-accent-2 bg-accent-2 text-white" : "border-hair bg-raised"}`}>
                {checked[i] && <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 600, damping: 18 }}><CheckIcon size={16} weight="bold" /></motion.span>}
              </motion.span>
              <span className={checked[i] ? "text-ink" : "text-ink-2"}>{it}</span>
            </button>
          </li>
        ))}
      </ul>
      <motion.button layout type="button" disabled={!all || busy} onClick={onExport}
        animate={{ backgroundColor: all ? "#5a3b0a" : "#e6e1da", color: all ? "#ffffff" : "#69625a", scale: all ? [1, 1.04, 1] : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, scale: { duration: 0.45, ease: "easeOut" } }}
        className={`btn mt-5 w-full ${all ? "shadow-[0_12px_28px_-14px_var(--accent)]" : ""}`} style={{ opacity: 1 }}>
        <motion.span layout className="inline-flex items-center gap-2">
          {all ? <DownloadSimpleIcon size={20} weight="bold" /> : <LockSimpleIcon size={18} weight="bold" />}{exportLabel}
        </motion.span>
      </motion.button>
    </section>
  );
}
