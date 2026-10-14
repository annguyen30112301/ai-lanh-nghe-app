import { useState } from "react";
import { CheckCircleIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";
import type { business } from "../content/vi";

type T = typeof business.form;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Yêu cầu báo giá: soạn sẵn thư (mailto), không gửi gì lên máy chủ. */
export default function QuoteForm({ t, to }: { t: T; to: string }) {
  const [f, setF] = useState({ company: "", name: "", email: "", seats: "", need: t.needs[0], note: "" });
  const [err, setErr] = useState<{ company?: boolean; email?: boolean }>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function submit(e: { preventDefault: () => void }) {
    e.preventDefault();
    const x = { company: !f.company.trim(), email: !EMAIL.test(f.email.trim()) };
    setErr(x);
    if (x.company || x.email) return;
    const body = [`${t.company}: ${f.company}`, `${t.name}: ${f.name}`, `${t.email}: ${f.email}`, `${t.seats}: ${f.seats}`, `${t.need}: ${f.need}`, "", f.note].join("\n");
    location.href = `mailto:${to}?subject=${encodeURIComponent(t.subject.replace("{company}", f.company.trim()))}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field = (k: "company" | "name" | "email" | "seats", label: string, ph: string, type = "text", bad?: string) => (
    <div>
      <label className="label" htmlFor={`q-${k}`}>{label}</label>
      <input id={`q-${k}`} type={type} className={`field ${bad ? "!border-urgent" : ""}`} placeholder={ph} value={f[k]} onChange={set(k)} aria-invalid={bad ? true : undefined} aria-describedby={bad ? `q-${k}-e` : undefined} maxLength={200} inputMode={k === "seats" ? "numeric" : undefined} />
      {bad && <p id={`q-${k}-e`} className="mt-1.5 text-[0.85rem] font-medium text-urgent">{bad}</p>}
    </div>
  );

  return (
    <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={submit}>
      {field("company", t.company, t.companyPh, "text", err.company ? t.errors.company : undefined)}
      {field("name", t.name, t.namePh)}
      {field("email", t.email, t.emailPh, "email", err.email ? t.errors.email : undefined)}
      {field("seats", t.seats, t.seatsPh)}
      <fieldset className="sm:col-span-2">
        <legend className="label">{t.need}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {t.needs.map((n) => (
            <label key={n} className={`flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 text-[0.9rem] font-semibold ${f.need === n ? "border-accent bg-accent text-on-accent" : "border-hair bg-raised"}`}>
              <input type="radio" name="need" className="sr-only" checked={f.need === n} onChange={() => setF({ ...f, need: n })} />{n}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="q-note">{t.note}</label>
        <textarea id="q-note" rows={3} maxLength={800} className="field min-h-24" placeholder={t.notePh} value={f.note} onChange={set("note")} />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className="btn btn-accent"><EnvelopeSimpleIcon size={20} />{t.send}</button>
        {sent && <p className="flex items-center gap-2 text-[0.9rem] font-medium text-accent-2" role="status"><CheckCircleIcon size={20} weight="fill" />{t.sent.replace("{email}", to)}</p>}
      </div>
    </form>
  );
}
