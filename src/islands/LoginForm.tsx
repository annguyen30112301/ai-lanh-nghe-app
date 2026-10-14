import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowLeftIcon, CircleNotchIcon, EnvelopeSimpleIcon, KeyIcon, UserCircleIcon } from "@phosphor-icons/react";
import type { app } from "../content/vi";
import { errText, post } from "../lib/client";
import OtpBoxes from "./OtpBoxes";

type T = typeof app.login;

export default function LoginForm({ t }: { t: T }) {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get("demo") === "doanh-nghiep") setEmail(t.demo.items[0].email);
    else if (q.get("email")) setEmail(q.get("email")!.slice(0, 120));
  }, [t]);
  useEffect(() => { if (wait <= 0) return; const id = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(id); }, [wait]);

  async function send(e?: { preventDefault: () => void }) {
    e?.preventDefault();
    setBusy(true); setErr(null);
    try {
      const r = await post<{ ok: true; demo_code?: string }>("/api/auth/request-otp", { email });
      setDemoCode(r.demo_code ?? null); setCode(""); setStage("code"); setWait(30);
    } catch (x) { setErr(errText(x)); }
    setBusy(false);
  }

  async function verify(c = code) {
    if (c.length !== 6 || busy) return;
    setBusy(true); setErr(null);
    try {
      const r = await post<{ next: string }>("/api/auth/verify-otp", { email, code: c });
      const next = new URLSearchParams(location.search).get("next");
      location.href = next && next.startsWith("/app/") ? next : r.next;
    } catch (x) { setErr(errText(x)); setBusy(false); }
  }

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 28 }}>
      <div className="panel overflow-hidden p-6 sm:p-9">
        <AnimatePresence mode="wait" initial={false}>
          {stage === "email" ? (
            <motion.form key="email" onSubmit={send} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <span className="icon-tile"><EnvelopeSimpleIcon size={26} weight="duotone" /></span>
              <h1 className="mt-4 text-[1.7rem]">{t.heading}</h1>
              <p className="mt-2 text-ink-2">{t.lead}</p>
              <label className="label mt-6" htmlFor="email">{t.email}</label>
              <input id="email" type="email" required autoComplete="email" inputMode="email" className="field" placeholder={t.emailPh} value={email} onChange={(e) => setEmail(e.target.value)} />
              {err && <p className="err" role="alert">{err}</p>}
              <button type="submit" className="btn btn-accent mt-6 w-full" disabled={busy || !email}>
                {busy && <CircleNotchIcon size={20} className="spin" />}{busy ? t.sending : t.send}
              </button>
              <p className="t-note mt-4">{t.privacy}</p>
            </motion.form>
          ) : (
            <motion.div key="code" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
              <button type="button" onClick={() => { setStage("email"); setErr(null); }} className="inline-flex min-h-11 items-center gap-1.5 text-[0.88rem] font-semibold text-accent-ink hover:underline">
                <ArrowLeftIcon size={16} weight="bold" />{t.change}
              </button>
              <h1 className="mt-2 text-[1.7rem]">{t.codeTitle}</h1>
              <p className="mt-2 text-ink-2" dangerouslySetInnerHTML={{ __html: t.codeLead.replace("{email}", email.replace(/[<>&"]/g, "")) }} />
              {demoCode && (
                <motion.button type="button" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} onClick={() => { setCode(demoCode); verify(demoCode); }}
                  className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-tint px-4 py-3 text-left text-[0.9rem] text-accent-ink">
                  <KeyIcon size={22} weight="duotone" /><span>{t.demoCode} <b className="tabular-nums tracking-[0.2em] !text-accent-ink">{demoCode}</b></span>
                </motion.button>
              )}
              <OtpBoxes value={code} onChange={setCode} aria={t.codeAria} onComplete={verify} disabled={busy} />
              {err && <p className="err" role="alert">{err}</p>}
              <button type="button" className="btn btn-accent mt-6 w-full" disabled={busy || code.length !== 6} onClick={() => verify()}>
                {busy && <CircleNotchIcon size={20} className="spin" />}{busy ? t.verifying : t.verify}
              </button>
              <button type="button" className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-[0.88rem] font-semibold text-accent-ink disabled:text-ink-3" disabled={wait > 0 || busy} onClick={() => send()}>
                {wait > 0 ? t.resendIn.replace("{s}", String(wait)) : t.resend}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {stage === "email" && (
        <div className="mt-6 rounded-3xl bg-raised/60 p-5 ring-1 ring-hair">
          <p className="font-semibold">{t.demo.title}</p>
          <p className="text-[0.85rem] text-ink-2">{t.demo.lead}</p>
          <ul className="mt-3 grid gap-2">
            {t.demo.items.map((d) => (
              <li key={d.email}>
                <button type="button" onClick={() => setEmail(d.email)} className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-[0.85rem] transition-colors hover:bg-tint ${email === d.email ? "bg-tint" : ""}`}>
                  <UserCircleIcon size={26} weight="duotone" className="shrink-0 text-accent" />
                  <span><b className="block">{d.email}</b><span className="text-ink-2">{d.label}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </MotionConfig>
  );
}
