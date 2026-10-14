/** Cột 4 tuần, một chuỗi (một màu, không cần chú giải). Hover/focus hiện số. */
export default function WeekBars({ data, label }: { data: { label: string; count: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <figure>
      <figcaption className="text-[0.85rem] font-semibold text-ink-2">{label}</figcaption>
      <div className="mt-4 flex h-36 items-end gap-3 border-b border-hair" role="list">
        {data.map((d) => (
          <div key={d.label} role="listitem" tabIndex={0} aria-label={`${d.label}: ${d.count}`} className="group relative flex h-full flex-1 flex-col items-center justify-end outline-none">
            <span className="mb-1 text-[0.8rem] font-semibold tabular-nums text-ink">{d.count}</span>
            <span className="w-full max-w-14 rounded-t-[4px] bg-accent-2 transition-[filter] group-hover:brightness-110 group-focus-visible:brightness-110" style={{ height: `${(d.count / max) * 78}%`, minHeight: d.count ? 4 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">{data.map((d) => <span key={d.label} className="flex-1 text-center text-[0.75rem] text-ink-3">{d.label}</span>)}</div>
    </figure>
  );
}
