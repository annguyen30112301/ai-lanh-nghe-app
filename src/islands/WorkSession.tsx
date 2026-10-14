import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowLeftIcon, ArrowRightIcon, FileXlsIcon, FilePdfIcon, UploadSimpleIcon, XIcon, PlusIcon, ShieldCheckIcon, ArrowCounterClockwiseIcon, CircleNotchIcon, SparkleIcon, ClockIcon, PlugIcon } from "@phosphor-icons/react";
import type { ExecuteResponse, LetterResult, MarkedTermIn, PreviewResponse, ScenarioPublic, SummaryResult, TableResult } from "../content/types";
import type { app } from "../content/vi";
import { ApiError, errText, post } from "../lib/client";
import MaskPreview from "./MaskPreview";
import ResultView from "./ResultView";
import Checklist from "./Checklist";

type T = typeof app.work;
interface Props { scenario: ScenarioPublic; t: T; demoFiles: string[] }
type LoadedFile = { name: string; text: string; rows: number };
type Phase = "form" | "masking" | "result" | "exported";
const KINDS = ["ncc", "cong_ty", "nguoi"] as const;

const slide = {
  initial: (d: number) => ({ opacity: 0, x: d * 40 }),
  animate: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -40 })
};

export default function WorkSession({ scenario, t, demoFiles }: Props) {
  const textInputs = scenario.inputs.filter((i) => i.type !== "files");
  const fileInput = scenario.inputs.find((i) => i.type === "files");
  const steps = [t.steps[0], ...(fileInput ? [t.steps[1]] : []), t.steps[2]];

  const [runId, setRunId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [reading, setReading] = useState(false);
  const [terms, setTerms] = useState<MarkedTermIn[]>([]);
  const [termText, setTermText] = useState("");
  const [termKind, setTermKind] = useState<MarkedTermIn["kind"]>("ncc");
  const [maskMoney, setMaskMoney] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [res, setRes] = useState<ExecuteResponse | null>(null);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [error, setError] = useState<{ msg: string; code?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const edited = useRef(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    post<{ run_id: string }>("/api/run/start", { scenario_id: scenario.id }).then((r) => setRunId(r.run_id)).catch((e) => setError({ msg: errText(e) }));
  }, [scenario.id]);

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); setError(null); };
  const autoTerms: MarkedTermIn[] = scenario.inputs.filter((i) => i.mask_as && fields[i.key]?.trim()).map((i) => ({ text: fields[i.key].trim(), kind: i.mask_as! }));

  const stepValid = (i: number) => {
    const name = steps[i];
    if (name === t.steps[0]) {
      const miss = textInputs.find((x) => x.required && !fields[x.key]?.trim());
      return miss ? t.missing.replace("{x}", miss.label) : null;
    }
    if (name === t.steps[1] && fileInput && files.length < (fileInput.min ?? 0)) return t.needFiles.replace("{n}", String(fileInput.min));
    return null;
  };
  const next = () => { const e = stepValid(step); if (e) setError({ msg: e }); else go(step + 1); };

  async function addFiles(list: FileList | File[]) {
    if (!fileInput) return;
    const max = fileInput.max ?? 4;
    const arr = Array.from(list);
    if (files.length + arr.length > max) { setError({ msg: t.tooMany.replace("{n}", String(max)) }); return; }
    setReading(true); setError(null);
    const { readFileText, FileReadError } = await import("../lib/files");
    const out: LoadedFile[] = [];
    for (const f of arr) {
      try { out.push(await readFileText(f)); }
      catch (e) {
        const name = e instanceof FileReadError ? e.fileName : f.name;
        setError({ msg: (e instanceof FileReadError && e.kind === "badType" ? t.badType : t.noText).replace("{name}", name) });
      }
    }
    setFiles((prev) => [...prev, ...out]);
    setReading(false);
  }

  async function loadDemo() {
    setReading(true);
    try {
      const blobs = await Promise.all(demoFiles.map(async (p) => new File([await (await fetch(p)).blob()], p.split("/").pop()!)));
      setFiles([]);
      const { readFileText } = await import("../lib/files");
      setFiles(await Promise.all(blobs.map(readFileText)));
      const demo = DEMO[scenario.id];
      if (demo) { setFields((f) => ({ ...demo.fields, ...f })); setTerms(demo.terms); }
    } catch (e) { setError({ msg: errText(e) }); }
    setReading(false);
  }

  const addTerm = () => {
    const v = termText.trim();
    if (v.length < 2 || terms.some((x) => x.text.toLowerCase() === v.toLowerCase())) return;
    setTerms([...terms, { text: v, kind: termKind }]); setTermText("");
  };

  const body = () => ({ run_id: runId, fields, file_texts: files.map(({ name, text }) => ({ name, text })), marked_terms: terms, mask_money: maskMoney });

  async function start() {
    if (!runId) return;
    setError(null); setBusy(true);
    try {
      const p = await post<PreviewResponse>("/api/run/preview-mask", body());
      setPreview(p); setStatus(null); setPhase("masking");
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { setError({ msg: errText(e), code: e instanceof ApiError ? e.code : undefined }); }
    setBusy(false);
  }

  async function execute() {
    setStatus(t.sending);
    try {
      const r = await post<ExecuteResponse>("/api/run/execute", body());
      setRes(r); setChecked(scenario.checklist.map(() => false)); setPhase("result"); setStatus(null);
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setStatus(null);
      setError({ msg: errText(e), code: e instanceof ApiError ? e.code : undefined });
    }
  }

  const toggle = (i: number) => {
    const nextC = checked.map((c, j) => (j === i ? !c : c));
    setChecked(nextC);
    clearTimeout(checkTimer.current);
    checkTimer.current = setTimeout(() => post("/api/run/event", { run_id: runId, type: "check", value: nextC.filter(Boolean).length }).catch(() => {}), 600);
  };

  const onEdit = (next: ExecuteResponse["result"]) => {
    if (!res) return;
    setRes({ ...res, result: next });
    if (!edited.current) { edited.current = true; post("/api/run/event", { run_id: runId, type: "edit", value: 1 }).catch(() => {}); }
  };

  async function doExport() {
    if (!res) return;
    setBusy(true);
    try {
      const { exportTable, exportDoc } = await import("../lib/export");
      if (res.kind === "table") await exportTable(res.result as TableResult, scenario.name, fields.item ?? "", t.table);
      else await exportDoc(res.kind, res.result as LetterResult | SummaryResult, `${scenario.name} – ${fields.supplier ?? fields.item ?? ""}`, { ...t.letter, ...t.summary });
      await post("/api/run/event", { run_id: runId, type: "export", value: 1 }).catch(() => {});
      setPhase("exported");
    } catch (e) { setError({ msg: errText(e) }); }
    setBusy(false);
  }

  const kindName = (k: MarkedTermIn["kind"]) => t.kinds[k];

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 28 }}>
      <div ref={top} className="scroll-mt-24">
        {/* ---------- Form ---------- */}
        {phase === "form" && (
          <div className="desk overflow-hidden">
            <div className="h-1.5 bg-[rgb(90_59_10/0.08)]">
              <motion.div className="h-full bg-accent" animate={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
            <ol className="flex gap-2 px-5 pt-5 text-[0.8rem] font-semibold sm:px-8" aria-label="Các bước">
              {steps.map((s, i) => (
                <li key={s} aria-current={i === step ? "step" : undefined} className={`rounded-full px-3 py-1 ${i === step ? "bg-accent text-on-accent" : i < step ? "bg-tint text-accent-ink" : "text-ink-3"}`}>
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
            <div className="relative min-h-[24rem] p-5 sm:p-8">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div key={step} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit">
                  <p className="text-[0.8rem] font-semibold text-ink-3">{t.stepOf.replace("{i}", String(step + 1)).replace("{n}", String(steps.length))}</p>

                  {steps[step] === t.steps[0] && (
                    <div className="mt-4 grid gap-5">
                      {textInputs.map((inp) => (
                        <div key={inp.key}>
                          <label className="label" htmlFor={`f-${inp.key}`}>{inp.label}{inp.required && <span className="text-urgent" aria-hidden> *</span>}</label>
                          {inp.type === "select" ? (
                            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={inp.label}>
                              {inp.options!.map((o) => (
                                <motion.button key={o} type="button" role="radio" aria-checked={fields[inp.key] === o} whileTap={{ scale: 0.97 }}
                                  onClick={() => setFields({ ...fields, [inp.key]: o })}
                                  className={`min-h-12 rounded-full border-2 px-4 text-[0.9rem] font-medium transition-colors ${fields[inp.key] === o ? "border-accent bg-accent text-on-accent" : "border-hair bg-raised hover:border-brand-300"}`}>
                                  {o}
                                </motion.button>
                              ))}
                            </div>
                          ) : inp.type === "textarea" ? (
                            <textarea id={`f-${inp.key}`} className="field min-h-24" rows={3} value={fields[inp.key] ?? ""} placeholder={inp.example ? t.example.replace("{x}", inp.example) : ""}
                              onChange={(e) => setFields({ ...fields, [inp.key]: e.target.value })} />
                          ) : (
                            <input id={`f-${inp.key}`} className="field" value={fields[inp.key] ?? ""} placeholder={inp.example ? t.example.replace("{x}", inp.example) : ""}
                              onChange={(e) => setFields({ ...fields, [inp.key]: e.target.value })} />
                          )}
                          {inp.mask_as && <p className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-masked"><ShieldCheckIcon size={16} weight="fill" />{t.kinds[inp.mask_as]} – {t.autoTerm}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {steps[step] === t.steps[1] && fileInput && (
                    <div className="mt-4">
                      <p className="label">{fileInput.label}</p>
                      {fileInput.hint && <p className="mt-1 text-[0.85rem] text-ink-2">{fileInput.hint}</p>}
                      <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                        className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-brand-300 bg-raised/70 p-6 text-center transition-colors hover:bg-raised">
                        {reading ? <CircleNotchIcon size={34} className="spin text-accent" /> : <UploadSimpleIcon size={34} weight="duotone" className="text-accent" />}
                        <span className="font-semibold">{reading ? t.reading : t.drop}</span>
                        <span className="text-[0.8rem] text-ink-3">{t.dropHint.replace("{max}", String(fileInput.max ?? 4))}</span>
                        <input type="file" multiple accept=".xlsx,.xls,.csv,.pdf" className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
                      </label>
                      <ul className="mt-4 grid gap-2" aria-live="polite">
                        <AnimatePresence initial={false}>
                          {files.map((f, i) => (
                            <motion.li key={f.name + i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                              className="flex items-center gap-3 rounded-2xl bg-raised p-3 ring-1 ring-hair">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-accent-ink">
                                {/\.pdf$/i.test(f.name) ? <FilePdfIcon size={22} weight="duotone" /> : <FileXlsIcon size={22} weight="duotone" />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[0.9rem] font-semibold">{i + 1}. {f.name}</span>
                                <span className="text-[0.78rem] text-ink-3">{t.rows.replace("{n}", String(f.rows))}</span>
                              </span>
                              <button type="button" aria-label={`${t.remove}: ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}
                                className="grid size-11 place-items-center rounded-full text-ink-3 hover:bg-canvas hover:text-ink"><XIcon size={18} weight="bold" /></button>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      {demoFiles.length > 0 && (
                        <button type="button" onClick={loadDemo} className="mt-4 inline-flex min-h-11 items-center gap-2 text-[0.88rem] font-semibold text-accent-ink hover:underline">
                          <SparkleIcon size={18} weight="fill" />{t.demoData}
                        </button>
                      )}
                    </div>
                  )}

                  {steps[step] === t.steps[2] && (
                    <div className="mt-4">
                      <h3 className="text-[1.1rem]">{t.maskTitle}</h3>
                      <p className="mt-1 text-[0.88rem] text-ink-2">{scenario.mask_hint}</p>
                      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Loại thông tin">
                        {KINDS.map((k) => (
                          <button key={k} type="button" role="radio" aria-checked={termKind === k} onClick={() => setTermKind(k)}
                            className={`min-h-11 rounded-full px-4 text-[0.85rem] font-semibold ${termKind === k ? "bg-masked text-white" : "bg-raised text-ink-2 ring-1 ring-hair"}`}>{kindName(k)}</button>
                        ))}
                      </div>
                      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addTerm(); }}>
                        <label className="sr-only" htmlFor="term">{t.termPh}</label>
                        <input id="term" className="field !mt-0 flex-1" placeholder={t.termPh} value={termText} onChange={(e) => setTermText(e.target.value)} />
                        <button type="submit" className="btn btn-quiet shrink-0"><PlusIcon size={18} weight="bold" />{t.add}</button>
                      </form>
                      <ul className="mt-4 flex flex-wrap gap-2" aria-live="polite">
                        <AnimatePresence initial={false}>
                          {[...autoTerms.map((x) => ({ ...x, auto: true })), ...terms.map((x) => ({ ...x, auto: false }))].map((x) => (
                            <motion.li key={x.kind + x.text} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                              className="chip chip-masked !py-1.5 text-[0.85rem]">
                              <span className="font-normal opacity-80">{kindName(x.kind)}:</span> {x.text}
                              {!x.auto && (
                                <button type="button" aria-label={`${t.remove}: ${x.text}`} onClick={() => setTerms(terms.filter((y) => y.text !== x.text))}
                                  className="-mr-1 ml-0.5 grid size-6 place-items-center rounded-full hover:bg-masked hover:text-white"><XIcon size={12} weight="bold" /></button>
                              )}
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                      <p className="mt-4 flex items-start gap-2 text-[0.85rem] text-ink-2"><ShieldCheckIcon size={18} weight="fill" className="mt-0.5 shrink-0 text-masked" />{t.auto}</p>
                      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-[0.88rem]">
                        <input type="checkbox" checked={maskMoney} onChange={(e) => setMaskMoney(e.target.checked)} className="size-5 accent-[#1f5e4a]" />{t.maskMoney}
                      </label>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && <ErrorBox error={error} t={t} />}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                {step > 0
                  ? <button type="button" onClick={() => go(step - 1)} className="inline-flex min-h-12 items-center gap-1.5 px-2 text-[0.9rem] font-semibold text-accent-ink hover:underline"><ArrowLeftIcon size={18} weight="bold" />{t.prev}</button>
                  : <span />}
                {step < steps.length - 1
                  ? <button type="button" onClick={next} className="btn btn-accent">{t.next}<ArrowRightIcon size={18} weight="bold" /></button>
                  : <button type="button" onClick={start} disabled={busy || !runId} className="btn btn-accent">
                      {busy ? <CircleNotchIcon size={20} className="spin" /> : <ShieldCheckIcon size={20} weight="fill" />}{scenario.cta}
                    </button>}
              </div>
            </div>
          </div>
        )}

        {/* ---------- Che dữ liệu + gửi ---------- */}
        {phase === "masking" && preview && (
          <div className="grid gap-4">
            <MaskPreview preview={preview} t={t} status={status} onDone={execute} />
            {error && (
              <div>
                <ErrorBox error={error} t={t} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" className="btn btn-accent" onClick={() => { setError(null); execute(); }}><ArrowCounterClockwiseIcon size={18} weight="bold" />{t.retry}</button>
                  <button type="button" className="btn btn-quiet" onClick={() => { setError(null); setPhase("form"); }}>{t.edit}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- Kết quả ---------- */}
        {(phase === "result" || phase === "exported") && res && (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
            <section aria-labelledby="res-title" className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="res-title" className="t-title !text-[1.6rem]">{t.resultTitle}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="chip chip-masked"><ShieldCheckIcon size={16} weight="fill" />{t.counted.replace("{n}", String(res.masked_items))}</span>
                  <span className="chip chip-muted"><ClockIcon size={16} />{t.seconds.replace("{s}", String(res.seconds))}</span>
                  {res.trial_left !== null && <span className="chip">{t.trialLeft.replace("{n}", String(res.trial_left))}</span>}
                </div>
              </div>
              <div className="mt-5"><ResultView data={res} t={t} onEdit={onEdit} /></div>
            </section>
            <aside className="lg:sticky lg:top-24">
              {phase === "exported" ? (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-raised p-6 ring-1 ring-hair" role="status">
                  <p className="font-semibold">{t.exported}</p>
                  <div className="mt-5 grid gap-3">
                    <button type="button" className="btn btn-quiet" onClick={doExport}>{scenario.export === "xlsx" ? t.exportXlsx : t.exportDocx}</button>
                    <a className="btn btn-accent" href="/app/bang-dieu-khien/">{t.toDash}</a>
                    <a className="btn btn-line" href="/app/tinh-huong/">{t.again}</a>
                  </div>
                </motion.div>
              ) : (
                <Checklist items={scenario.checklist} checked={checked} onToggle={toggle} title={t.checklistTitle} lead={t.checklistLead}
                  exportLabel={scenario.export === "xlsx" ? t.exportXlsx : t.exportDocx} onExport={doExport} busy={busy} />
              )}
              {error && <ErrorBox error={error} t={t} />}
            </aside>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

function ErrorBox({ error, t }: { error: { msg: string; code?: string }; t: T }) {
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="err flex flex-wrap items-center justify-between gap-3" role="alert">
      <span>{error.msg}</span>
      {error.code === "no_ai" && <a href="/app/ket-noi-ai/" className="btn btn-accent !min-h-10"><PlugIcon size={18} weight="bold" />{t.noAICta}</a>}
    </motion.div>
  );
}

/** Thông tin mẫu đi kèm bộ dữ liệu giả ở public/demo-data. */
const DEMO: Record<string, { fields: Record<string, string>; terms: MarkedTermIn[] }> = {
  "so-sanh-bao-gia": {
    fields: { item: "Thép tấm SS400 dày 10mm, 20 tấn", priority: "Cân bằng" },
    terms: [
      { text: "Thép Minh Long Phát", kind: "ncc" }, { text: "Thép Sao Phương Nam", kind: "ncc" }, { text: "Kim khí Đại Thành", kind: "ncc" },
      { text: "Cơ khí Tân Phú", kind: "cong_ty" }, { text: "Trần Minh Khang", kind: "nguoi" }, { text: "Lê Thu Hà", kind: "nguoi" }, { text: "Phạm Quốc Bảo", kind: "nguoi" }
    ]
  },
  "thu-thuong-luong": {
    fields: { supplier: "Thép Minh Long Phát", item: "Thép tấm SS400 dày 10mm, 20 tấn", current: "18.500.000 đ/tấn chưa VAT, thanh toán 50% trước, giao 14 ngày", goal: "Giảm còn 18.100.000 đ/tấn hoặc giữ giá nhưng thanh toán 30 ngày sau giao", limit: "Không cam kết sản lượng cả năm; không hứa đơn hàng tiếp theo", tone: "Mềm mỏng, giữ quan hệ" },
    terms: [{ text: "Cơ khí Tân Phú", kind: "cong_ty" }, { text: "Trần Minh Khang", kind: "nguoi" }, { text: "Thép Sao Phương Nam", kind: "ncc" }]
  },
  "tom-tat-ho-so-ncc": {
    fields: { supplier: "Cơ khí Đại Phong", need: "Gia công chi tiết khung máy, 500 bộ/tháng, dung sai ±0,1 mm", focus: "Toàn diện" },
    terms: [{ text: "Nguyễn Văn Phong", kind: "nguoi" }, { text: "Cơ khí Tân Phú", kind: "cong_ty" }]
  }
};
