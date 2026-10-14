import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { CircleNotchIcon, UserPlusIcon, ArrowsLeftRightIcon, UserMinusIcon, ClockIcon, UsersThreeIcon, ListChecksIcon, IdentificationCardIcon } from "@phosphor-icons/react";
import type { app } from "../content/vi";
import { api, errText, post } from "../lib/client";
import CountUp from "./CountUp";
import WeekBars from "./WeekBars";

type T = typeof app.admin;
interface Biz {
  org: { name: string; plan: string; seats: number };
  runs: number; saved_minutes: number; scenarios: { id: string; name: string; count: number; avg_minutes: number }[];
  weekly: { label: string; count: number }[]; active_people: number; seats_used: number;
  people: { id: string; name: string; role: string; status: string; weeks: number[]; total: number }[];
}
interface Member { id: string; email: string; name: string | null; role: "admin" | "member"; status: "active" | "invited"; runs: number; last_at: number | null }

// sequential một màu (nâu), nhạt → đậm theo số lượt
const STEPS = ["#f6f5f3", "#f3ebe1", "#efd9b9", "#e1ad66", "#a06f24", "#5a3b0a"];
const cellColor = (n: number, max: number) => (n === 0 ? STEPS[0] : STEPS[Math.min(5, 1 + Math.floor((n / Math.max(1, max)) * 4.999))]);

export default function Business({ t }: { t: T }) {
  const [d, setD] = useState<Biz | null>(null);
  const [m, setM] = useState<{ seats: number; members: Member[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [transfer, setTransfer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api<Biz>("/api/dashboard/business"), api<{ seats: number; members: Member[] }>("/api/admin/seats")])
      .then(([a, b]) => { setD(a); setM(b); }).catch((e) => setErr(errText(e)));
  }, []);

  if (err && !d) return <p className="err">{err}</p>;
  if (!d || !m) return <p className="flex items-center gap-2 text-ink-2"><CircleNotchIcon className="spin" size={20} />…</p>;
  const maxCell = Math.max(1, ...d.people.flatMap((p) => p.weeks));

  async function act(body: Record<string, unknown>) {
    setBusy(true); setErr(null);
    try { const r = await post<{ seats: number; members: Member[] }>("/api/admin/seats", body); setM(r); setForm({ name: "", email: "" }); setTransfer(null); setNote(t.seats.done); setTimeout(() => setNote(null), 2000); }
    catch (e) { setErr(errText(e)); }
    setBusy(false);
  }

  const kpis = [
    { icon: <ClockIcon size={24} />, v: Math.round(d.saved_minutes / 6) / 10, dec: 1, label: t.kpi.saved },
    { icon: <ListChecksIcon size={24} />, v: d.runs, dec: 0, label: t.kpi.runs },
    { icon: <UsersThreeIcon size={24} />, v: d.active_people, dec: 0, label: t.kpi.active },
    { icon: <IdentificationCardIcon size={24} />, v: m.members.length, dec: 0, label: t.kpi.seats.replace("{n}", String(m.seats)) }
  ];

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 28 }}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="panel p-6">
            <span className="icon-tile size-11">{k.icon}</span>
            <p className="mt-4 text-[2.2rem] font-bold leading-none tracking-tight"><CountUp value={k.v} decimals={k.dec} /></p>
            <p className="mt-2 text-[0.88rem] text-ink-2">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="panel overflow-x-auto p-6" aria-labelledby="adopt">
          <h2 id="adopt" className="text-[1.1rem]">{t.adoption}</h2>
          <table className="mt-4 w-full min-w-[30rem] border-separate border-spacing-[2px] text-[0.85rem]">
            <thead><tr><th scope="col" className="pb-2 text-left font-semibold text-ink-2" />{t.weeks.map((w) => <th key={w} scope="col" className="pb-2 font-semibold text-ink-2">{w}</th>)}<th scope="col" className="pb-2 font-semibold text-ink-2">{t.total}</th></tr></thead>
            <tbody>
              {d.people.map((p) => (
                <tr key={p.id}>
                  <th scope="row" className="max-w-[12rem] truncate pr-3 text-left font-medium text-ink">{p.name}</th>
                  {p.weeks.map((n, i) => (
                    <td key={i} title={`${p.name} · ${t.weeks[i]}: ${n}`} className="h-9 rounded-[4px] text-center font-semibold tabular-nums"
                      style={{ background: cellColor(n, maxCell), color: n / maxCell > 0.55 ? "#fff" : "#201f1d" }}>{n || "·"}</td>
                  ))}
                  <td className="text-center font-bold tabular-nums">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div className="grid content-start gap-4">
          <section className="panel p-6"><WeekBars data={d.weekly} label={t.kpi.runs} /></section>
          <section className="panel p-6" aria-labelledby="topsc">
            <h2 id="topsc" className="text-[1.1rem]">{t.top}</h2>
            <ul className="mt-3 grid gap-3">
              {d.scenarios.map((s) => (
                <li key={s.id}>
                  <div className="flex justify-between text-[0.88rem] font-semibold">{s.name}<span className="tabular-nums">{s.count}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-canvas"><motion.div className="h-full rounded-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${(s.count / Math.max(1, d.scenarios[0].count)) * 100}%` }} viewport={{ once: true }} /></div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="panel mt-6 p-6 sm:p-8" aria-labelledby="seats">
        <h2 id="seats" className="text-[1.25rem]">{t.seats.title} <span className="text-ink-3 tabular-nums">· {m.members.length}/{m.seats}</span></h2>
        <p className="mt-1 max-w-[70ch] text-[0.88rem] text-ink-2">{t.seats.lead}</p>
        <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.3fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); act(transfer ? { action: "transfer", user_id: transfer, ...form } : { action: "invite", ...form }); }}>
          <label className="text-[0.85rem] font-semibold">{t.seats.name}<input className="field" placeholder={t.seats.namePh} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="text-[0.85rem] font-semibold">{transfer ? `${t.seats.transferTo} (${t.seats.email})` : t.seats.email}<input type="email" required className="field" placeholder={t.seats.emailPh} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-accent" disabled={busy}>{transfer ? <ArrowsLeftRightIcon size={18} weight="bold" /> : <UserPlusIcon size={18} weight="bold" />}{transfer ? t.seats.transfer : t.seats.invite}</button>
            {transfer && <button type="button" className="btn btn-line" onClick={() => setTransfer(null)}>{t.seats.cancel}</button>}
          </div>
        </form>
        {err && <p className="err" role="alert">{err}</p>}
        {note && <p className="mt-3 text-[0.88rem] font-semibold text-accent-2" role="status">{note}</p>}
        <ul className="mt-6 divide-y divide-hair">
          <AnimatePresence initial={false}>
            {m.members.map((x) => (
              <motion.li key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -24 }}
                className={`flex flex-wrap items-center justify-between gap-3 py-3 ${transfer === x.id ? "rounded-2xl bg-tint px-3" : ""}`}>
                <span className="min-w-0">
                  <b className="block truncate">{x.name ?? x.email}</b>
                  <span className="text-[0.8rem] text-ink-3">{x.email} · {x.runs ? t.seats.runs.replace("{n}", String(x.runs)) : t.seats.never}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className={x.status === "active" ? "chip chip-ok" : "chip chip-muted"}>{t.seats.status[x.status]}</span>
                  <span className="chip chip-muted">{t.seats.role[x.role]}</span>
                  {x.role === "member" && <>
                    <button type="button" className="btn btn-line !min-h-10 !px-4 text-[0.82rem]" onClick={() => setTransfer(x.id)}><ArrowsLeftRightIcon size={16} />{t.seats.transfer}</button>
                    <button type="button" className="btn btn-line !min-h-10 !px-4 text-[0.82rem] text-urgent" onClick={() => confirm(t.seats.confirmRevoke.replace("{name}", x.name ?? x.email)) && act({ action: "revoke", user_id: x.id })}><UserMinusIcon size={16} />{t.seats.revoke}</button>
                  </>}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </MotionConfig>
  );
}
