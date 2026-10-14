import { useEffect, useState } from "react";
import { motion, MotionConfig } from "motion/react";
import { ClockIcon, ShieldCheckIcon, ListChecksIcon, CircleNotchIcon, DeviceMobileIcon, CheckIcon } from "@phosphor-icons/react";
import type { app } from "../content/vi";
import { api, errText, post } from "../lib/client";
import CountUp from "./CountUp";
import WeekBars from "./WeekBars";
import ModelUsage from "./ModelUsage";
import type { ModelUsageRow } from "../lib/models";

type T = typeof app.dash;
interface Data {
  runs: number; exported: number; saved_minutes: number; masked_items: number; top: string | null;
  scenarios: { id: string; name: string; count: number; avg_minutes: number; manual: number }[];
  weekly: { label: string; count: number }[];
  recent: { scenario: string; at: number; minutes: number; exported: boolean }[];
  baselines: Record<string, number>;
  models: ModelUsageRow[];
}
interface Props { t: T; scenarios: { id: string; name: string; ref: number }[] }

export default function Dashboard({ t, scenarios }: Props) {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [base, setBase] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const load = () => api<Data>("/api/dashboard/personal").then((x) => {
    setD(x); setBase(Object.fromEntries(scenarios.map((s) => [s.id, String(x.baselines[s.id] ?? s.ref)])));
  }).catch((e) => setErr(errText(e)));
  useEffect(() => { load(); }, []);

  if (err) return <p className="err">{err}</p>;
  if (!d) return <p className="flex items-center gap-2 text-ink-2"><CircleNotchIcon className="spin" size={20} />…</p>;

  const kpis = [
    { icon: <ListChecksIcon size={24} />, v: d.runs, label: t.runs },
    { icon: <ClockIcon size={24} />, v: d.saved_minutes, label: t.saved },
    { icon: <ShieldCheckIcon size={24} />, v: d.masked_items, label: t.masked, masked: true }
  ];
  const fmt = (ms: number) => new Date(ms).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  async function saveBase(id: string) {
    try { await post("/api/baseline", { scenario_id: id, manual_minutes: Number(base[id]) }); setSaved(id); setTimeout(() => setSaved(null), 1500); load(); }
    catch (e) { setErr(errText(e)); }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="panel p-6">
            <span className={`grid size-11 place-items-center rounded-full ${k.masked ? "bg-masked-soft text-masked" : "bg-tint text-accent-ink"}`}>{k.icon}</span>
            <p className="mt-4 text-[2.4rem] font-bold leading-none tracking-tight"><CountUp value={k.v} /></p>
            <p className="mt-2 text-[0.9rem] text-ink-2">{k.label}</p>
          </div>
        ))}
      </div>
      <p className="t-note mt-3">{t.howCalc}</p>

      {d.runs === 0 ? (
        <div className="panel mt-6 p-6"><p>{t.none}</p><a href="/app/tinh-huong/" className="btn btn-accent mt-4">{t.start}</a></div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="panel overflow-x-auto p-6" aria-labelledby="by-sc">
            <h2 id="by-sc" className="text-[1.1rem]">{t.byScenario}</h2>
            {d.top && <p className="mt-1 text-[0.88rem] text-ink-2">{t.top}: <b>{d.top}</b></p>}
            <table className="tbl mt-4 min-w-[28rem]">
              <thead><tr>{t.cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
              <tbody>
                {d.scenarios.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="!font-semibold !text-ink">{s.name}</th>
                    <td className="tabular-nums">{s.count}</td>
                    <td className="tabular-nums">{t.min.replace("{n}", String(s.avg_minutes))}</td>
                    <td className="tabular-nums text-ink-3">{t.min.replace("{n}", String(s.manual))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="panel p-6"><WeekBars data={d.weekly} label={t.weekly} /></section>
          <section className="panel p-6" aria-labelledby="recent">
            <h2 id="recent" className="text-[1.1rem]">{t.recent}</h2>
            <ul className="mt-3 divide-y divide-hair">
              {d.recent.map((r, i) => (
                <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }} className="flex items-center justify-between gap-3 py-3 text-[0.9rem]">
                  <span><b className="block">{r.scenario}</b><span className="text-[0.8rem] text-ink-3">{fmt(r.at)} · {t.min.replace("{n}", String(r.minutes))}</span></span>
                  <span className={r.exported ? "chip chip-ok" : "chip chip-muted"}>{r.exported ? t.exported : t.notExported}</span>
                </motion.li>
              ))}
            </ul>
          </section>
          <ModelUsage title={t.models} t={t.usage} rows={d.models} />
          <section className="panel p-6" aria-labelledby="bl">
            <h2 id="bl" className="text-[1.1rem]">{t.baseline.title}</h2>
            <p className="mt-1 text-[0.85rem] text-ink-2">{t.baseline.lead}</p>
            <div className="mt-4 grid gap-3">
              {scenarios.map((s) => (
                <form key={s.id} className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); saveBase(s.id); }}>
                  <label className="min-w-0 flex-1 text-[0.85rem] font-semibold">{s.name}
                    <input type="number" min={1} max={600} className="field !min-h-11 !py-2" value={base[s.id] ?? ""} onChange={(e) => setBase({ ...base, [s.id]: e.target.value })} />
                  </label>
                  <button type="submit" className="btn btn-quiet !min-h-11 !px-4">{saved === s.id ? <><CheckIcon size={16} weight="bold" />{t.baseline.saved}</> : t.baseline.save}</button>
                </form>
              ))}
            </div>
          </section>
        </div>
      )}
      <a href="/app/xac-thuc-thiet-bi/" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[0.9rem] font-semibold"><DeviceMobileIcon size={20} />{t.security}</a>
    </MotionConfig>
  );
}
