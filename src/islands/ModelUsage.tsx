import type { app } from "../content/vi";
import type { ModelUsageRow } from "../lib/models";
import { formatVnd, PROVIDER_LABEL } from "../lib/models";

/** Bảng lượt theo mô hình thực chạy: số lượt, token, chi phí ước tính. */
export default function ModelUsage({ title, t, rows }: { title: string; t: typeof app.dash.usage; rows: ModelUsageRow[] }) {
  const n = (v: number) => v.toLocaleString("vi-VN");
  return (
    <section className="panel overflow-x-auto p-6" aria-labelledby="by-model">
      <h2 id="by-model" className="text-[1.1rem]">{title}</h2>
      {rows.length === 0 ? <p className="mt-3 text-[0.9rem] text-ink-2">{t.empty}</p> : (
        <table className="mt-4 w-full min-w-[34rem] text-[0.88rem]">
          <thead><tr className="text-left text-ink-2">{t.cols.map((c, i) => <th key={c} scope="col" className={`pb-2 font-semibold ${i ? "text-right" : ""}`}>{c}</th>)}</tr></thead>
          <tbody className="divide-y divide-hair">
            {rows.map((r) => (
              <tr key={`${r.provider}:${r.model}`}>
                <th scope="row" className="max-w-[16rem] truncate py-2 pr-3 text-left font-mono text-[0.8rem] font-medium">{r.model}{r.provider && <span className="font-sans text-ink-3"> · {PROVIDER_LABEL[r.provider] ?? r.provider}</span>}</th>
                <td className="py-2 text-right font-semibold tabular-nums">{n(r.runs)}</td>
                <td className="py-2 text-right tabular-nums">{n(r.tokens_in)}</td>
                <td className="py-2 text-right tabular-nums">{n(r.tokens_out)}</td>
                <td className="py-2 text-right tabular-nums">{formatVnd(r.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="t-note mt-3">{t.note}</p>
    </section>
  );
}
