import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, FileTextIcon, InfoIcon, ShieldWarningIcon, SealCheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { trial } from "../content/vi";
import { JOBS, type Cell, type Job, type Output, type Scenario } from "../content/trial-data";
import type { PreviewResponse, Segment } from "../content/types";
import { Masker, usedLabels } from "../lib/mask";
import MaskPreview from "./MaskPreview";

type T = typeof trial;
type Step = "chon" | "ban" | "kiem-tra" | "ket-qua";
type Run = "cho" | "bao-ve" | "che" | "dang-chay" | "xong";
const STEPS: Step[] = ["chon", "ban", "kiem-tra", "ket-qua"];

interface S { job: Job; th: Scenario; chon: string; anDanh: boolean; run: Run; done: number; sua: boolean; tick: Record<number, boolean>; goiY: boolean }
const fresh = (job: Job, th: Scenario): S => ({ job, th, chon: th.nut.chon[0].id, anDanh: false, run: "cho", done: 0, sua: false, tick: {}, goiY: false });
const findJob = (id: string) => JOBS.find((j) => j.id === id);
const cell = (c: Cell) => (typeof c === "string" ? { v: c } : c);

/** Chạy đoạn văn bản mẫu qua lớp che thật (src/lib/mask.ts). */
function maskPreview(th: Scenario): PreviewResponse | null {
  if (!th.che) return null;
  const m = new Masker(th.che.terms);
  const blocks = th.che.blocks.map((b) => ({ title: b.title, segments: m.mask(b.text).segments, truncated: false }));
  const s = m.summary(usedLabels(blocks.map((b) => b.segments)));
  return s.total ? { blocks, total: s.total, byKind: s.byKind } : null;
}

export default function TrialBench({ t }: { t: T }) {
  const reduce = useReducedMotion();
  const [s, setS] = useState<S>(() => fresh(JOBS[0], JOBS[0].tinhHuong[0]));
  const [step, setStep] = useState<Step>("chon");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const allTicked = s.th.kiemTra.every((_, i) => s.tick[i]);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const hashFor = (st: Step, x: S) => (st === "chon" ? `#${x.job.id}` : `#${x.job.id}/${x.th.id}${st === "ban" ? "" : "/" + st}`);

  const go = useCallback((st: Step, x: S = s, push = true) => {
    if (push && location.hash !== hashFor(st, x)) history.pushState(null, "", hashFor(st, x));
    setStep(st);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      const top = (root.current?.getBoundingClientRect().top ?? 0) + scrollY - 110;
      if (scrollY > top) scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    });
  }, [s, reduce]);

  // Deep link: #mua-hang/bao-gia[/kiem-tra|/ket-qua] như bản cũ.
  useEffect(() => {
    const read = () => {
      const [jid, tid, st] = location.hash.replace(/^#/, "").split("/");
      const job = findJob(jid);
      if (!job) return setStep("chon");
      const th = job.tinhHuong.find((x) => x.id === tid);
      setS((cur) => {
        if (!th) { if (cur.job !== job) { clear(); return fresh(job, job.tinhHuong[0]); } return cur; }
        const next = cur.th === th ? cur : (clear(), fresh(job, th));
        const ok = next.run === "xong";
        setStep(st === "kiem-tra" && ok ? "kiem-tra" : st === "ket-qua" && ok && next.th.kiemTra.every((_, i) => next.tick[i]) ? "ket-qua" : th ? "ban" : "chon");
        return next;
      });
    };
    read();
    addEventListener("popstate", read);
    return () => { removeEventListener("popstate", read); clear(); };
  }, []);

  const pick = (job: Job, th: Scenario) => { clear(); const x = fresh(job, th); setS(x); history.replaceState(null, "", `#${job.id}`); };

  function pipeline() {
    clear();
    const n = s.th.xuLy.length, ms = reduce ? 0 : 560;
    setS((x) => ({ ...x, run: "dang-chay", done: 0 }));
    for (let k = 1; k <= n; k++) timers.current.push(setTimeout(() => setS((x) => (k < n ? { ...x, done: k } : { ...x, run: "xong", done: n })), ms * k));
  }
  function run() {
    if (s.run === "dang-chay" || s.run === "che") return;
    if (s.th.baoVe && !s.anDanh) { setS({ ...s, run: "bao-ve" }); return; }
    setS({ ...s, sua: false, tick: {}, goiY: false, run: maskPreview(s.th) ? "che" : "dang-chay" });
    if (!maskPreview(s.th)) setTimeout(pipeline, 0);
  }
  const setChon = (id: string) => { if (id === s.chon) return; clear(); setS({ ...s, chon: id, run: "cho", sua: false, tick: {}, goiY: false }); };

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 28 }}>
      <div ref={root} className="scroll-mt-28">
        <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-tint px-4 py-3 text-[0.92rem] font-semibold text-accent-ink" role="note">
          <InfoIcon size={20} weight="fill" className="shrink-0" />{t.mock}<span className="font-normal text-ink-2">· {t.noLogin}</span>
        </p>
        <ol className="mb-6 flex flex-wrap gap-2 text-[0.85rem] font-semibold" aria-label="Các bước dùng thử">
          {STEPS.map((st, i) => {
            const idx = STEPS.indexOf(step);
            return (
              <li key={st} aria-current={i === idx ? "step" : undefined} className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${i === idx ? "bg-accent text-on-accent" : i < idx ? "bg-tint text-accent-ink" : "bg-raised text-ink-3 ring-1 ring-hair"}`}>
                <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[0.75rem]">{i < idx ? <CheckIcon size={12} weight="bold" /> : i + 1}</span>{t.steps[i]}
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {step === "chon" && (
              <div>
                <h2 ref={heading} tabIndex={-1} className="text-[1.4rem] outline-none">{t.choose.title}</h2>
                <p className="mt-1 text-ink-2">{t.choose.lead}</p>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {JOBS.map((job) => (
                    <div key={job.id} role="radiogroup" aria-label={job.ten} className={`rounded-3xl p-5 ring-1 ${job === s.job ? "bg-raised ring-accent/40 shadow-[var(--shadow)]" : "bg-raised/60 ring-hair"}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-[1.15rem]">{job.ten}</h3>
                        {job.preview && <span className="chip chip-muted">{t.choose.preview}</span>}
                      </div>
                      <p className="mt-1 text-[0.9rem] text-ink-2">{job.moTa}</p>
                      <div className="mt-4 grid gap-2">
                        {job.tinhHuong.map((th) => {
                          const on = s.th === th;
                          return (
                            <motion.button key={th.id} type="button" role="radio" aria-checked={on} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} onClick={() => pick(job, th)}
                              className={`flex min-h-14 w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 px-4 py-3 text-left ${on ? "border-accent bg-tint" : "border-hair bg-raised hover:border-brand-300"}`}>
                              <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-accent bg-accent" : "border-hair"}`}>{on && <span className="size-2 rounded-full bg-white" />}</span>
                              <span className="flex-1 font-semibold">{th.ten}</span>
                              <span className="text-[0.8rem] text-ink-3">{th.thoiGian}</span>
                              {th.baoVe && <span className="chip chip-masked !py-0.5 text-[0.75rem]">{t.choose.guard}</span>}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.88rem] text-ink-2">{t.choose.promise.map((p) => <li key={p} className="flex items-center gap-1.5"><CheckIcon size={16} weight="bold" className="text-accent-2" />{p}</li>)}</ul>
                  <button type="button" className="btn btn-accent" onClick={() => go("ban")}>{t.choose.start.replace("{x}", s.th.ten)}<ArrowRightIcon size={18} weight="bold" /></button>
                </div>
              </div>
            )}

            {step === "ban" && (
              <div>
                <Head t={t} s={s} title={s.th.ten} back={t.bench.back} onBack={() => go("chon")} hRef={heading} />
                <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:items-start">
                  <section className="desk p-5 sm:p-6" aria-labelledby="in-h">
                    <PaneHead id="in-h" title={t.bench.input} badge={t.bench.sample} />
                    <Input t={t} s={s} />
                    <div className="mt-5 flex flex-wrap items-center gap-2" role="radiogroup" aria-label={s.th.nut.ten}>
                      <span className="mr-1 text-[0.85rem] font-semibold text-ink-2">{s.th.nut.ten}</span>
                      {s.th.nut.chon.map((c) => (
                        <button key={c.id} type="button" role="radio" aria-checked={s.chon === c.id} onClick={() => setChon(c.id)}
                          className={`min-h-11 rounded-full border-2 px-4 text-[0.88rem] font-semibold ${s.chon === c.id ? "border-accent bg-accent text-on-accent" : "border-hair bg-raised"}`}>{c.label}</button>
                      ))}
                    </div>
                    <button type="button" className="btn btn-accent mt-5 w-full sm:w-auto" onClick={run} disabled={s.run === "dang-chay" || s.run === "che"}>
                      {s.run === "xong" ? t.bench.rerun : s.run === "dang-chay" || s.run === "che" ? t.bench.running : t.bench.run}
                    </button>
                  </section>

                  <section className="panel min-w-0 p-5 sm:p-6" aria-labelledby="out-h" aria-live="polite">
                    <PaneHead id="out-h" title={t.bench.output} badge={t.bench.draftBadge} />
                    {s.run === "cho" && <div><p className="text-[0.92rem] text-ink-2" dangerouslySetInnerHTML={{ __html: t.bench.idle }} /><Pipeline steps={s.th.xuLy} done={-1} /></div>}
                    {s.run === "bao-ve" && s.th.baoVe && (
                      <Guard t={t} th={s.th} onOk={() => { const x = { ...s, anDanh: true, sua: false, tick: {}, goiY: false }; const p = maskPreview(s.th); setS({ ...x, run: p ? "che" : "dang-chay" }); if (!p) setTimeout(pipeline, 0); }}
                        onLater={() => setS({ ...s, run: "cho" })} />
                    )}
                    {s.run === "che" && <MaskStage th={s.th} t={t} onDone={pipeline} />}
                    {s.run === "dang-chay" && <div><Pipeline steps={s.th.xuLy} done={s.done} /><p className="mt-3 text-[0.9rem] font-semibold text-accent-ink">{t.bench.drafting}</p></div>}
                    {s.run === "xong" && (
                      <div>
                        <Pipeline steps={s.th.xuLy} done={s.th.xuLy.length} />
                        <p className="mt-4 text-[0.78rem] font-semibold text-ink-3">{t.bench.draft}</p>
                        <OutputView o={s.th.ketQua(s.chon, s.sua)} />
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <p className="t-note">{t.bench.draftHint}</p>
                          <button type="button" className="btn btn-accent" onClick={() => go("kiem-tra")}>{t.bench.check}<ArrowRightIcon size={18} weight="bold" /></button>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}

            {step === "kiem-tra" && (
              <div>
                <Head t={t} s={s} title={t.review.title} sub={t.review.lead} back={t.review.back} onBack={() => go("ban")} hRef={heading} crumbTh />
                <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">
                  <section className="panel min-w-0 p-5 sm:p-6" aria-labelledby="draft-h">
                    <PaneHead id="draft-h" title={t.review.draft} badge={t.bench.draftBadge} />
                    <OutputView o={s.th.ketQua(s.chon, s.sua)} />
                  </section>
                  <Checklist t={t} s={s} setS={setS} onUse={() => allTicked && go("ket-qua")} />
                </div>
              </div>
            )}

            {step === "ket-qua" && <Done t={t} s={s} hRef={heading} onAgain={(job, th) => { clear(); const x = fresh(job, th ?? job.tinhHuong[0]); setS(x); go(th ? "ban" : "chon", x); }} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function Head({ t, s, title, sub, back, onBack, hRef, crumbTh }: { t: T; s: S; title: string; sub?: string; back: string; onBack: () => void; hRef: React.RefObject<HTMLHeadingElement | null>; crumbTh?: boolean }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-[0.85rem] font-semibold text-ink-3">{s.job.ten}{crumbTh && ` · ${s.th.ten}`}{s.job.preview && <span className="chip chip-muted !py-0.5">{t.choose.preview}</span>}</p>
        <h2 ref={hRef} tabIndex={-1} className="mt-1 text-[1.4rem] outline-none">{title}</h2>
        {sub && <p className="mt-1 max-w-[65ch] text-ink-2">{sub}</p>}
      </div>
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1.5 text-[0.9rem] font-semibold text-accent-ink hover:underline"><ArrowLeftIcon size={18} weight="bold" />{back}</button>
    </div>
  );
}

const PaneHead = ({ id, title, badge }: { id: string; title: string; badge: string }) => (
  <div className="mb-4 flex items-center justify-between gap-3"><h3 id={id} className="text-[1.05rem]">{title}</h3><span className="chip chip-muted !py-0.5 text-[0.75rem]">{badge}</span></div>
);

function Input({ t, s }: { t: T; s: S }) {
  const d = s.th.dauVao;
  return (
    <div className="grid gap-3">
      {d.files?.map((f) => (
        <div key={f.ten} className="rounded-2xl bg-raised p-3 ring-1 ring-hair">
          <p className="flex items-center gap-2.5 text-[0.9rem] font-semibold"><FileTextIcon size={20} weight="duotone" className="shrink-0 text-accent" />{f.ten}</p>
          <p className="ml-[1.9rem] text-[0.78rem] text-ink-3">{f.meta}</p>
          {f.trich && <p className="ml-[1.9rem] mt-1.5 rounded-lg bg-canvas px-2.5 py-1.5 text-[0.82rem] italic text-ink-2">{f.trich}</p>}
        </div>
      ))}
      {d.fields && (
        <dl className="grid gap-x-4 gap-y-1.5 rounded-2xl bg-raised p-4 text-[0.88rem] ring-1 ring-hair sm:grid-cols-[auto_1fr]">
          {d.fields.map(([k, v]) => <div key={k} className="contents"><dt className="font-semibold text-ink-2">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      {d.raw && (
        <div className={`rounded-2xl p-4 ring-1 ${s.anDanh ? "bg-masked-soft ring-masked/30" : "bg-raised ring-hair"}`}>
          <p className="text-[0.78rem] font-semibold text-ink-3">{s.anDanh ? t.bench.noteClean : t.bench.note}</p>
          <p className="mt-1 text-[0.9rem]">{s.anDanh && s.th.baoVe?.sau ? s.th.baoVe.sau : d.raw}</p>
        </div>
      )}
      <div className="rounded-2xl bg-raised p-4 ring-1 ring-hair">
        <p className="text-[0.78rem] font-semibold text-ink-3">{t.bench.ask}</p>
        <p className="mt-1 text-[0.92rem]">“{d.yeuCau}”</p>
      </div>
    </div>
  );
}

function Pipeline({ steps, done }: { steps: string[]; done: number }) {
  return (
    <ol className="mt-4 grid gap-2">
      {steps.map((x, i) => {
        const st = i < done ? "done" : i === done ? "now" : "todo";
        return (
          <li key={x} className={`flex items-center gap-3 text-[0.9rem] ${st === "todo" ? "text-ink-3" : "text-ink"}`}>
            <span className={`grid size-6 shrink-0 place-items-center rounded-full ${st === "done" ? "bg-accent-2 text-white" : st === "now" ? "bg-accent text-white" : "bg-canvas ring-1 ring-hair"}`}>
              {st === "done" ? <CheckIcon size={13} weight="bold" /> : st === "now" ? <motion.span className="size-2 rounded-full bg-white" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} /> : null}
            </span>{x}
          </li>
        );
      })}
    </ol>
  );
}

function Guard({ t, th, onOk, onLater }: { t: T; th: Scenario; onOk: () => void; onLater: () => void }) {
  const b = th.baoVe!;
  const after = useMemo<Segment[]>(() => (b.sau ? [{ t: b.sau }] : new Masker(b.terms).mask(b.truoc).segments), [b]);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus(); }, []);
  return (
    <div role="alert" className="rounded-2xl bg-urgent-soft p-4">
      <p className="flex items-center gap-2 font-bold text-urgent"><ShieldWarningIcon size={22} weight="fill" />{t.bench.guardTitle}</p>
      <p className="mt-2 text-[0.92rem]">{b.canhBao}</p>
      <div className="mt-4 grid gap-3">
        <div><p className="text-[0.78rem] font-semibold text-ink-3">{t.bench.before}</p><p className="mt-1 rounded-xl bg-raised p-3 text-[0.88rem] line-through decoration-urgent/60">{b.truoc}</p></div>
        <div><p className="text-[0.78rem] font-semibold text-ink-3">{t.bench.after}</p>
          <p className="mt-1 rounded-xl bg-raised p-3 text-[0.88rem]">{after.map((g, i) => ("t" in g ? <span key={i}>{g.t}</span> : <span key={i} className="mask-tag">{g.l}</span>))}</p></div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button ref={btn} type="button" className="btn btn-accent" onClick={onOk}>{b.nut}</button>
        <button type="button" className="min-h-11 px-2 text-[0.9rem] font-semibold text-accent-ink hover:underline" onClick={onLater}>{t.bench.later}</button>
      </div>
    </div>
  );
}

/** Khoảnh khắc chủ đạo của trang: dữ liệu mẫu chạy qua lớp che thật, từng thông tin đổi thành nhãn. */
function MaskStage({ th, t, onDone }: { th: Scenario; t: T; onDone: () => void }) {
  const preview = useMemo(() => maskPreview(th)!, [th]);
  return <div className="-mx-1"><MaskPreview preview={preview} t={t.mask} onDone={onDone} /></div>;
}

function OutputView({ o }: { o: Output }) {
  const changed = "rounded bg-[color-mix(in_oklab,var(--accent-2)_16%,white)] text-accent-2 font-semibold";
  if (o.type === "table") {
    const num = o.numCols ?? [];
    return (
      <div>
        <div className="overflow-x-auto rounded-2xl ring-1 ring-hair">
          <table className="w-full min-w-[30rem] border-collapse text-[0.85rem]">
            <thead className="bg-canvas"><tr>{o.head.map((h, i) => <th key={h} scope="col" className={`px-3 py-2 font-semibold text-ink-2 ${num.includes(i) ? "text-right" : "text-left"}`}>{h}</th>)}</tr></thead>
            <tbody>
              {o.rows.map((r, ri) => (
                <tr key={ri} className="border-t border-hair">
                  {r.map((c0, i) => {
                    const c = cell(c0);
                    const cls = `px-3 py-2 align-top ${num.includes(i) ? "text-right tabular-nums" : ""} ${c.strong ? "font-bold" : ""}`;
                    const inner = c.changed ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`px-1 ${changed}`}>{c.v}</motion.span> : c.v;
                    return i === 0 ? <th key={i} scope="row" className={`${cls} text-left font-semibold`}>{inner}</th> : <td key={i} className={cls}>{inner}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {o.summary && <p className={`mt-3 rounded-xl p-3 text-[0.9rem] ${o.summary.changed ? changed : "bg-canvas"}`}>{o.summary.text}</p>}
      </div>
    );
  }
  if (o.type === "letter") {
    return (
      <div className="grid gap-2.5 rounded-2xl bg-paper p-4 text-[0.9rem] ring-1 ring-hair">
        {o.subject && <p><span className="font-semibold text-ink-3">Tiêu đề:</span> <b>{o.subject}</b></p>}
        {o.paras.map((p, i) => <p key={i} className={p.changed ? `px-1 ${changed}` : ""}>{p.text}</p>)}
        {o.note && <p className={`text-[0.8rem] ${changed} px-2 py-1`}>{o.note}</p>}
      </div>
    );
  }
  if (o.type === "list") {
    return (
      <div className="rounded-2xl bg-paper p-4 text-[0.9rem] ring-1 ring-hair">
        <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">{o.items.map((it) => <div key={it.k} className="contents"><dt className="font-semibold text-ink-2">{it.k}</dt><dd>{it.text}</dd></div>)}</dl>
        {o.note && <p className={`mt-3 text-[0.8rem] ${changed} px-2 py-1`}>{o.note}</p>}
      </div>
    );
  }
  return (
    <div className="grid gap-4 rounded-2xl bg-paper p-4 text-[0.9rem] ring-1 ring-hair">
      {o.groups.map((g) => (
        <div key={g.title}>
          <p className="font-bold">{g.title}</p>
          <ol className="mt-1.5 grid gap-2">
            {g.items.map((it) => (
              <li key={it.n} className="grid gap-0.5"><span>{it.n}. {it.q}</span><span className={`text-[0.85rem] ${it.changed ? `px-1 ${changed}` : "text-ink-2"}`}>Đáp án: {it.a}</span></li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function Checklist({ t, s, setS, onUse }: { t: T; s: S; setS: (x: S) => void; onUse: () => void }) {
  const n = s.th.kiemTra.length;
  const done = s.th.kiemTra.filter((_, i) => s.tick[i]).length;
  const ok = done === n;
  return (
    <section className="panel p-5 sm:p-6 lg:sticky lg:top-28" aria-labelledby="chk-h">
      <div className="mb-4 flex items-center justify-between"><h3 id="chk-h" className="text-[1.05rem]">{t.review.checklist}</h3><span className="chip tabular-nums" aria-live="polite">{done} / {n}</span></div>
      <ul className="grid gap-2">
        {s.th.kiemTra.map((c, i) => {
          const on = !!s.tick[i], hasErr = !!c.loi && !s.sua, open = hasErr && s.goiY;
          const goiY = c.loi ? (typeof c.loi.goiY === "function" ? c.loi.goiY(s.chon) : c.loi.goiY) : "";
          return (
            <li key={c.ten} className={`rounded-2xl ring-1 ${on ? "bg-tint ring-accent/30" : open ? "bg-urgent-soft ring-urgent/30" : "bg-raised ring-hair"}`}>
              <button type="button" role="checkbox" aria-checked={on} aria-expanded={hasErr ? open : undefined} aria-controls={hasErr ? `hint-${i}` : undefined}
                onClick={() => { if (c.loi && !s.sua) setS({ ...s, goiY: !s.goiY }); else if (!c.loi) setS({ ...s, tick: { ...s.tick, [i]: !on } }); }}
                className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left text-[0.92rem]">
                <motion.span animate={{ scale: on ? [1, 1.2, 1] : 1 }} className={`grid size-6 shrink-0 place-items-center rounded-md border-2 ${on ? "border-accent-2 bg-accent-2 text-white" : "border-hair bg-raised"}`}>{on && <CheckIcon size={14} weight="bold" />}</motion.span>
                <span className="flex-1">{c.ten}</span>
                {hasErr && !open && <WarningCircleIcon size={18} className="shrink-0 text-ink-3" aria-hidden />}
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div id={`hint-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4">
                      <p className="text-[0.85rem] font-bold text-urgent">{t.review.issue}</p>
                      <p className="mt-1 text-[0.88rem]">{goiY}</p>
                      <button type="button" className="btn btn-accent mt-3 !min-h-11 text-[0.88rem]" onClick={() => setS({ ...s, sua: true, goiY: false, tick: { ...s.tick, [i]: true } })}>{c.loi!.nut}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {c.loi && s.sua && <p className="px-4 pb-3 text-[0.85rem] font-medium text-accent-2">{c.loi.daSua}</p>}
            </li>
          );
        })}
      </ul>
      <button type="button" className="btn btn-accent mt-5 w-full" disabled={!ok} onClick={onUse}>{t.review.use}</button>
      <p className="t-note mt-2" aria-live="polite">{ok ? t.review.ready : t.review.need.replace("{n}", String(n))}</p>
    </section>
  );
}

function Done({ t, s, hRef, onAgain }: { t: T; s: S; hRef: React.RefObject<HTMLHeadingElement | null>; onAgain: (job: Job, th?: Scenario) => void }) {
  const d = t.done;
  const others = s.job.tinhHuong.filter((x) => x !== s.th);
  const otherJob = JOBS.find((j) => j !== s.job)!;
  const mua = JOBS.find((j) => !j.preview)!;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div>
        <p className="flex flex-wrap items-center gap-2 text-[0.85rem] font-semibold text-ink-3">{s.job.ten}{s.job.preview && <span className="chip chip-muted !py-0.5">{t.choose.preview}</span>}</p>
        <h2 ref={hRef} tabIndex={-1} className="mt-1 flex items-center gap-3 text-[1.5rem] outline-none"><SealCheckIcon size={30} weight="fill" className="shrink-0 text-accent-2" />{d.title.replace("{x}", s.th.ten)}</h2>
        <div className="panel mt-5 p-6">
          <p className="text-[0.85rem] font-semibold text-ink-3">{d.usual}</p>
          <p className="mt-1 text-[1.6rem] font-bold leading-tight">{s.th.tietKiem.truoc} <span className="text-[1.05rem] font-semibold text-ink-2">{d.withPack.replace("{x}", s.th.tietKiem.sau)}</span></p>
          <p className="t-note mt-1">{d.usualNote}</p>
        </div>
        <div className="mt-4 rounded-3xl bg-masked-soft p-6">
          <p className="font-bold text-masked">{d.caught}</p>
          <p className="mt-2">{s.th.baiHoc}</p>
          <p className="mt-2 text-[0.9rem] text-ink-2">{d.why}</p>
        </div>
        <p className="t-note mt-4 flex items-start gap-2"><InfoIcon size={18} className="mt-0.5 shrink-0" />{d.mock}</p>
      </div>
      <aside className="grid gap-3">
        <h3 className="text-[1.1rem]">{d.next}</h3>
        {s.job.preview && <p className="rounded-2xl bg-tint p-4 text-[0.9rem]"><b className="block">{d.soon}</b>{d.soonLead}</p>}
        <a href="/app/dang-nhap/" className="glow lift block rounded-3xl bg-accent p-5 text-on-accent no-underline shadow-[var(--shadow)]">
          <span className="flex items-center justify-between gap-3 font-bold text-white">{d.cta}<ArrowRightIcon size={20} weight="bold" className="shrink-0" /></span>
          <span className="mt-1 block text-[0.88rem] text-white/80">{d.ctaLead}</span>
        </a>
        <a href="/dat-mua/?goi=personal" className="block rounded-3xl bg-raised p-5 no-underline ring-1 ring-hair hover:ring-brand-300">
          <span className="font-semibold text-ink">{d.buy}</span><span className="mt-1 block text-[0.88rem] text-ink-2">{d.buyLead}</span>
        </a>
        <a href="/goi-nghe/" className="block rounded-3xl bg-raised p-5 no-underline ring-1 ring-hair hover:ring-brand-300">
          <span className="font-semibold text-ink">{d.pack}</span><span className="mt-1 block text-[0.88rem] text-ink-2">{d.packLead}</span>
        </a>
        <div className="mt-2">
          <p className="text-[0.85rem] font-semibold text-ink-3">{d.again}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {others.map((x) => <button key={x.id} type="button" className="min-h-11 text-[0.9rem] font-semibold text-accent-ink hover:underline" onClick={() => onAgain(s.job, x)}>{x.ten}</button>)}
            <button type="button" className="min-h-11 text-[0.9rem] font-semibold text-accent-ink hover:underline" onClick={() => onAgain(s.job.preview ? mua : otherJob)}>{d.otherJob.replace("{x}", (s.job.preview ? mua : otherJob).ten)}</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
