import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { PlugIcon, KeyIcon, BuildingsIcon, CaretDownIcon, CheckCircleIcon, CircleNotchIcon, ArrowRightIcon, ArrowUpRightIcon, LockKeyIcon, TrashIcon } from "@phosphor-icons/react";
import type { MeResponse } from "../content/types";
import type { app } from "../content/vi";
import { errText, getMe, isBusinessAdmin, post } from "../lib/client";
import ModelPicker from "./ModelPicker";

type T = typeof app.connect;

export default function ConnectAI({ t }: { t: T }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [open, setOpen] = useState<"gemini" | "company" | null>(null);
  const [key, setKey] = useState("");
  const [provider, setProvider] = useState("openrouter");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getMe(true).then((m) => {
      setMe(m);
      if (new URLSearchParams(location.search).get("buoc") === "mo-hinh") requestAnimationFrame(() => document.getElementById("chon-mo-hinh")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }).catch(() => {});
    const loi = new URLSearchParams(location.search).get("loi") as keyof T["errors"] | null;
    if (loi && t.errors[loi]) setMsg({ ok: false, text: t.errors[loi] });
  }, [t]);

  if (!me) return <p className="flex items-center gap-2 text-ink-2"><CircleNotchIcon className="spin" size={20} />…</p>;
  const canManage = me.org.role === "admin";
  const biz = isBusinessAdmin(me);

  async function save(source: "gemini_key" | "company_key") {
    setBusy(true); setMsg(null);
    try {
      await post("/api/ai/key", { source, key, provider });
      setKey(""); setOpen(null); setMe(await getMe(true)); setMsg({ ok: true, text: t.saved });
      requestAnimationFrame(() => document.getElementById("chon-mo-hinh")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) { setMsg({ ok: false, text: errText(e) }); }
    setBusy(false);
  }
  async function remove() {
    if (!confirm(t.removeConfirm)) return;
    await post("/api/ai/key", {}, "DELETE").catch((e) => setMsg({ ok: false, text: errText(e) }));
    setMe(await getMe(true));
  }

  const ai = me.ai;
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 28 }}>
      {/* trạng thái */}
      <motion.div layout className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 ${ai ? "bg-[color-mix(in_oklab,var(--accent-2)_10%,white)] ring-1 ring-[color-mix(in_oklab,var(--accent-2)_30%,white)]" : "bg-raised ring-1 ring-hair"}`} aria-live="polite">
        <div className="flex items-center gap-3">
          <span className={`grid size-12 place-items-center rounded-full ${ai ? "bg-accent-2 text-white" : "bg-tint text-accent-ink"}`}>{ai ? <CheckCircleIcon size={26} weight="fill" /> : <PlugIcon size={24} />}</span>
          <div>
            <p className="font-semibold">{ai ? t.status.connected : t.status.none}</p>
            <p className="text-[0.88rem] text-ink-2">
              {ai ? <>{t.status.by[ai.source as keyof T["status"]["by"]] ?? ai.provider} · <span className="font-mono tracking-wider">••••{ai.key_last4}</span> · <span className={ai.model ? "font-mono" : "font-semibold text-urgent"}>{ai.model ?? t.modelNone}</span></> : t.status.trial.replace("{n}", String(me.trial_left))}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ai && canManage && <button type="button" onClick={remove} className="btn btn-line !min-h-11"><TrashIcon size={18} />{t.remove}</button>}
          <a href="/app/tinh-huong/" className="btn btn-accent !min-h-11">{t.next}<ArrowRightIcon size={18} weight="bold" /></a>
        </div>
      </motion.div>

      {msg && <p className={msg.ok ? "mt-3 rounded-2xl bg-tint px-4 py-3 text-[0.9rem] font-medium text-accent-ink" : "err"} role={msg.ok ? "status" : "alert"}>{msg.text}</p>}
      {me.mock && !ai && <p className="t-note mt-3">{t.mockNote}</p>}

      {ai && canManage && (
        <section id="chon-mo-hinh" aria-labelledby="chon-mo-hinh-h" className="mt-6 scroll-mt-24 rounded-3xl bg-raised p-6 ring-1 ring-hair sm:p-7">
          <h2 id="chon-mo-hinh-h" className="text-[1.15rem]">{t.models.step}</h2>
          <p className="mt-1 text-[0.9rem] text-ink-2">{t.models.lead}</p>
          <div className="mt-5"><ModelPicker key={ai.provider + ai.key_last4 + (ai.verified_at ?? 0)} t={t.models} onSaved={() => getMe(true).then(setMe)} /></div>
        </section>
      )}

      {!canManage ? (
        <>
          <p className="mt-6 rounded-3xl bg-raised p-5 ring-1 ring-hair">{t.memberNote}</p>
          {ai && !ai.model && <p className="err" role="alert">{t.modelMemberNone}</p>}
        </>
      ) : (
        <div className="mt-6 grid gap-4">
          {/* một chạm */}
          <a href="/api/ai/connect" data-astro-reload className="glow lift group flex items-center gap-5 rounded-3xl bg-accent p-6 text-on-accent no-underline shadow-[var(--shadow)] sm:p-7">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15"><PlugIcon size={30} weight="duotone" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[1.15rem] font-bold text-white">{t.oneTap}</span>
              <span className="mt-1 block text-[0.9rem] text-white/80">{t.oneTapLead}</span>
            </span>
            <ArrowRightIcon size={24} weight="bold" className="shrink-0 transition-transform group-hover:translate-x-1" />
          </a>

          <Expand open={open === "gemini"} onToggle={() => setOpen(open === "gemini" ? null : "gemini")} icon={<KeyIcon size={24} />} title={t.gemini}>
            <ol className="grid gap-3">
              {t.geminiSteps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[0.92rem]">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tint text-[0.85rem] font-bold text-accent-ink">{i + 1}</span>
                  <span className="pt-1" dangerouslySetInnerHTML={{ __html: s }} />
                </li>
              ))}
            </ol>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="btn btn-quiet mt-4 !min-h-11">{t.geminiOpen}<ArrowUpRightIcon size={18} weight="bold" /></a>
            <KeyForm t={t} value={key} onChange={setKey} busy={busy} onSave={() => save("gemini_key")} />
          </Expand>

          {biz && (
            <Expand open={open === "company"} onToggle={() => setOpen(open === "company" ? null : "company")} icon={<BuildingsIcon size={24} />} title={t.company}>
              <p className="text-[0.9rem] text-ink-2">{t.companyLead}</p>
              <p className="label mt-4">{t.provider}</p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={t.provider}>
                {(Object.keys(t.providers) as (keyof T["providers"])[]).map((p) => (
                  <button key={p} type="button" role="radio" aria-checked={provider === p} onClick={() => setProvider(p)}
                    className={`min-h-11 rounded-full border-2 px-4 text-[0.88rem] font-semibold ${provider === p ? "border-accent bg-accent text-on-accent" : "border-hair bg-raised"}`}>{t.providers[p]}</button>
                ))}
              </div>
              <KeyForm t={t} value={key} onChange={setKey} busy={busy} onSave={() => save("company_key")} placeholder="sk-…" />
            </Expand>
          )}
          <p className="flex items-center gap-2 text-[0.85rem] text-ink-2"><LockKeyIcon size={18} weight="duotone" />{t.secure}</p>
        </div>
      )}
    </MotionConfig>
  );
}

function Expand({ open, onToggle, icon, title, children }: { open: boolean; onToggle: () => void; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-raised ring-1 ring-hair">
      <button type="button" aria-expanded={open} onClick={onToggle} className="flex min-h-16 w-full items-center gap-4 px-6 py-4 text-left font-semibold">
        <span className="icon-tile">{icon}</span><span className="flex-1">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}><CaretDownIcon size={20} weight="bold" /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeyForm({ t, value, onChange, busy, onSave, placeholder }: { t: T; value: string; onChange: (v: string) => void; busy: boolean; onSave: () => void; placeholder?: string }) {
  return (
    <form className="mt-5" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <label className="label" htmlFor={"k-" + (placeholder ?? "g")}>{t.keyLabel}</label>
      <input id={"k-" + (placeholder ?? "g")} type="password" autoComplete="off" spellCheck={false} className="field font-mono" placeholder={placeholder ?? t.keyPh} value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="submit" className="btn btn-accent mt-4" disabled={busy || value.trim().length < 20}>
        {busy && <CircleNotchIcon size={20} className="spin" />}{busy ? t.saving : t.save}
      </button>
    </form>
  );
}
