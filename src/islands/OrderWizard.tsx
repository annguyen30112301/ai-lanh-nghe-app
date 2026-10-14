import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowLeftIcon, ArrowRightIcon, BankIcon, CheckCircleIcon, CircleNotchIcon, InfoIcon, MinusIcon, PlusIcon, PrinterIcon, SealCheckIcon, WalletIcon } from "@phosphor-icons/react";
import type { order } from "../content/vi";
import { errText, post } from "../lib/client";
import { checkBuyer, isBusiness, orderCode, type Buyer, type BuyerErrors } from "../lib/order";
import { CAU_HINH, dinhDang, donDatMua, type GoiDatMua } from "../lib/pricing";

type T = typeof order;
type Pay = "bank" | "vnpay" | "momo";
const PLANS: GoiDatMua[] = ["personal", "business", "business_plus"];
const vnd = (n: number) => `${dinhDang(n)} đ`;
const viDate = (iso: string) => iso.split("-").reverse().join("/");

const slide = {
  initial: (d: number) => ({ opacity: 0, x: d * 40 }),
  animate: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -40 })
};

export default function OrderWizard({ t }: { t: T }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [goi, setGoi] = useState<GoiDatMua>("personal");
  const [seat, setSeat] = useState(10);
  const [tinhChinh, setTinhChinh] = useState(false);
  const [buyer, setBuyer] = useState<Buyer>({ name: "", email: "", phone: "", company: "", tax_code: "", address: "", invoice_email: "", note: "" });
  const [errs, setErrs] = useState<BuyerErrors>({});
  const [pay, setPay] = useState<Pay>("bank");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; total: number; valid_from: string; valid_to: string } | null>(null);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const g = new URLSearchParams(location.search).get("goi") as GoiDatMua | null;
    if (g && PLANS.includes(g)) setGoi(g);
    setCode(orderCode());
  }, []);

  const biz = isBusiness(goi);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const don = useMemo(() => {
    try { return donDatMua({ goi, seat: biz ? seat : 1, tinhChinh, ngayBatDau: today }); } catch { return null; }
  }, [goi, seat, tinhChinh, biz, today]);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1); setStep(n); setErr(null);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const next = () => {
    if (step === 1) {
      const e = checkBuyer(goi, buyer);
      setErrs(e);
      if (Object.keys(e).length) {
        requestAnimationFrame(() => (document.querySelector("[aria-invalid=true]") as HTMLElement | null)?.focus());
        return;
      }
    }
    go(step + 1);
  };

  async function confirm() {
    setBusy(true); setErr(null);
    try {
      const r = await post<{ id: string; total: number; valid_from: string; valid_to: string }>("/api/orders", { goi, seat: biz ? seat : 1, tinh_chinh: tinhChinh, pay, code, buyer });
      setDone(r); go(3);
    } catch (e) { setErr(errText(e) || t.errors.server); }
    setBusy(false);
  }

  const setB = (k: keyof Buyer) => (e: { target: { value: string } }) => { setBuyer({ ...buyer, [k]: e.target.value }); if (errs[k as keyof BuyerErrors]) setErrs({ ...errs, [k]: undefined }); };
  const total = done?.total ?? don?.tongThanhToan ?? 0;
  const transferNote = `${code} ${biz ? (buyer.tax_code || "").trim() : ""}`.trim();

  return (
    <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 28 }}>
      <p className="mb-5 flex items-center gap-2 rounded-2xl bg-urgent-soft px-4 py-3 text-[0.92rem] font-semibold text-urgent" role="note"><InfoIcon size={20} weight="fill" className="shrink-0" />{t.demoBanner}</p>
      <div ref={top} className="scroll-mt-28 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="panel overflow-hidden">
          <div className="h-1.5 bg-[rgb(90_59_10/0.08)]"><motion.div className="h-full bg-accent" animate={{ width: `${((step + 1) / t.steps.length) * 100}%` }} /></div>
          <ol className="flex flex-wrap gap-2 px-5 pt-5 text-[0.8rem] font-semibold sm:px-8" aria-label="Các bước">
            {t.steps.map((s, i) => (
              <li key={s} aria-current={i === step ? "step" : undefined} className={`rounded-full px-3 py-1 ${i === step ? "bg-accent text-on-accent" : i < step ? "bg-tint text-accent-ink" : "text-ink-3"}`}>{i + 1}. {s}</li>
            ))}
          </ol>
          <div className="relative min-h-[26rem] p-5 sm:p-8">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={step} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit">
                <p className="text-[0.8rem] font-semibold text-ink-3">{t.stepOf.replace("{i}", String(step + 1)).replace("{n}", String(t.steps.length))}</p>

                {step === 0 && (
                  <div className="mt-4 grid gap-5">
                    <p className="text-[0.92rem] text-ink-2" dangerouslySetInnerHTML={{ __html: t.pack }} />
                    <div className="grid gap-3" role="radiogroup" aria-label={t.steps[0]}>
                      {PLANS.map((p) => (
                        <motion.button key={p} type="button" role="radio" aria-checked={goi === p} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                          onClick={() => { setGoi(p); setTinhChinh(false); }}
                          className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left transition-colors ${goi === p ? "border-accent bg-tint" : "border-hair bg-raised hover:border-brand-300"}`}>
                          <span>
                            <span className="flex items-center gap-2 text-[1.05rem] font-bold">{goi === p && <CheckCircleIcon size={20} weight="fill" className="text-accent" />}{t.plans[p].name}</span>
                            <span className="mt-0.5 block text-[0.88rem] text-ink-2">{t.plans[p].for}</span>
                          </span>
                          <span className="font-semibold tabular-nums">{t.plans[p].price}</span>
                        </motion.button>
                      ))}
                    </div>

                    {biz && (
                      <div>
                        <label className="label" htmlFor="seat">{t.seats}</label>
                        <div className="mt-2 flex items-center gap-2">
                          <button type="button" className="btn btn-line !min-h-12 !px-4" aria-label={t.minus} onClick={() => setSeat(Math.max(1, seat - 1))}><MinusIcon size={18} weight="bold" /></button>
                          <input id="seat" type="number" min={1} max={10000} inputMode="numeric" className="field !mt-0 w-28 text-center tabular-nums" value={seat}
                            onChange={(e) => setSeat(Math.max(1, Math.min(10000, Math.floor(Number(e.target.value) || 1))))} />
                          <button type="button" className="btn btn-line !min-h-12 !px-4" aria-label={t.plus} onClick={() => setSeat(Math.min(10000, seat + 1))}><PlusIcon size={18} weight="bold" /></button>
                        </div>
                        <p className="t-note mt-2">{t.seatsHint}</p>
                      </div>
                    )}

                    <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl bg-canvas p-4 ring-1 ring-hair">
                      <input type="checkbox" className="mt-1 size-5 shrink-0 accent-[#1f5e4a]" checked={tinhChinh} onChange={(e) => setTinhChinh(e.target.checked)} />
                      <span>
                        <span className="block font-semibold">{biz ? t.tinhChinhDN : t.tinhChinh}</span>
                        <span className="text-[0.88rem] text-ink-2">{biz ? t.tinhChinhDNHint : t.tinhChinhHint}</span>
                      </span>
                    </label>
                    {biz && <p className="t-note">{t.custom}</p>}
                  </div>
                )}

                {step === 1 && (
                  <form className="mt-4 grid gap-4 sm:grid-cols-2" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
                    <h2 className="text-[1.15rem] sm:col-span-2">{t.info.title}</h2>
                    <Field id="name" label={t.info.name} ph={t.info.namePh} value={buyer.name} onChange={setB("name")} err={errs.name && t.info.errors.name} auto="name" />
                    <Field id="phone" label={t.info.phone} ph={t.info.phonePh} value={buyer.phone} onChange={setB("phone")} err={errs.phone && t.info.errors.phone} auto="tel" type="tel" />
                    <Field id="email" label={t.info.email} ph={t.info.emailPh} value={buyer.email} onChange={setB("email")} err={errs.email && t.info.errors.email} hint={t.info.emailHint} auto="email" type="email" wide />
                    {biz && <>
                      <Field id="company" label={t.info.company} ph={t.info.companyPh} value={buyer.company ?? ""} onChange={setB("company")} err={errs.company && t.info.errors.company} auto="organization" wide />
                      <Field id="tax" label={t.info.tax} ph={t.info.taxPh} value={buyer.tax_code ?? ""} onChange={setB("tax_code")} err={errs.tax && t.info.errors.tax} hint={t.info.taxHint} mode="numeric" />
                      <Field id="invoiceEmail" label={t.info.invoiceEmail} ph={t.info.invoiceEmailPh} value={buyer.invoice_email ?? ""} onChange={setB("invoice_email")} err={errs.invoiceEmail && t.info.errors.invoiceEmail} type="email" />
                      <Field id="address" label={t.info.address} ph={t.info.addressPh} value={buyer.address ?? ""} onChange={setB("address")} err={errs.address && t.info.errors.address} auto="street-address" wide />
                    </>}
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="note">{t.info.note}</label>
                      <textarea id="note" rows={2} maxLength={500} className="field min-h-20" placeholder={t.info.notePh} value={buyer.note} onChange={setB("note")} />
                    </div>
                    <button type="submit" hidden />
                  </form>
                )}

                {step === 2 && (
                  <div className="mt-4">
                    <h2 className="text-[1.15rem]">{t.pay.title}</h2>
                    <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label={t.pay.title}>
                      {(Object.keys(t.pay.methods) as Pay[]).map((m) => (
                        <button key={m} type="button" role="tab" aria-selected={pay === m} onClick={() => setPay(m)}
                          className={`relative min-h-12 rounded-full px-5 text-[0.92rem] font-semibold ${pay === m ? "text-on-accent" : "bg-raised text-ink-2 ring-1 ring-hair"}`}>
                          {pay === m && <motion.span layoutId="pay-pill" className="absolute inset-0 -z-0 rounded-full bg-accent" />}
                          <span className="relative flex items-center gap-2">{m === "bank" ? <BankIcon size={18} /> : <WalletIcon size={18} />}{t.pay.methods[m]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-5" role="tabpanel">
                      {pay === "bank" ? (
                        <div className="grid gap-5 sm:grid-cols-[11rem_1fr] sm:items-start">
                          <figure className="mx-auto w-44 sm:mx-0">
                            <DemoQR seed={code} />
                            <figcaption className="t-note mt-2 text-center">{t.pay.qr}</figcaption>
                          </figure>
                          <div>
                            <p className="text-[0.92rem] text-ink-2">{t.pay.bankLead}</p>
                            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.92rem]">
                              <dt className="text-ink-3">{t.pay.bankName}</dt><dd>{t.pay.bankNameV}</dd>
                              <dt className="text-ink-3">{t.pay.account}</dt><dd className="font-mono">{t.pay.accountV}</dd>
                              <dt className="text-ink-3">{t.pay.holder}</dt><dd>{t.pay.holderV}</dd>
                              <dt className="text-ink-3">{t.pay.amount}</dt><dd className="font-bold tabular-nums">{vnd(total)}</dd>
                              <dt className="text-ink-3">{t.pay.content}</dt><dd className="font-mono font-semibold">{transferNote}</dd>
                            </dl>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-canvas p-5 ring-1 ring-hair">
                          <p className="text-[0.92rem] text-ink-2">{t.pay.walletLead.replace("{m}", t.pay.methods[pay])}</p>
                          <p className="mt-3 text-[0.92rem]">{t.pay.orderCode}: <b className="font-mono">{code}</b> · <b className="tabular-nums">{vnd(total)}</b></p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && done && (
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-4" aria-live="polite">
                    <p className="flex items-center gap-3 text-[1.3rem] font-bold"><SealCheckIcon size={32} weight="fill" className="text-accent-2" />{t.done.title}</p>
                    <p className="mt-2 text-ink-2" dangerouslySetInnerHTML={{ __html: t.done.lead.replace("{email}", escapeHtml(buyer.email)) }} />
                    <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 rounded-2xl bg-canvas p-5 text-[0.95rem] ring-1 ring-hair">
                      <dt className="text-ink-3">{t.done.code}</dt><dd className="font-mono font-bold">{done.id}</dd>
                      <dt className="text-ink-3">{t.done.plan}</dt><dd>{t.plans[goi].name}{biz && ` · ${t.done.seats.replace("{n}", String(seat))}`}</dd>
                      <dt className="text-ink-3">{t.done.period}</dt><dd>{viDate(done.valid_from)} – {viDate(done.valid_to)}</dd>
                      <dt className="text-ink-3">{t.done.total}</dt><dd className="font-bold tabular-nums">{vnd(done.total)}</dd>
                      <dt className="text-ink-3">{t.done.license}</dt><dd><span className="chip chip-ok">✓ {t.done.license}</span></dd>
                    </dl>
                    <p className="mt-4 text-[0.92rem] text-ink-2">{t.done.next}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a href={`/app/dang-nhap/?email=${encodeURIComponent(buyer.email.trim())}`} className="btn btn-accent">{t.done.cta}<ArrowRightIcon size={18} weight="bold" /></a>
                      <button type="button" className="btn btn-line" onClick={() => print()}><PrinterIcon size={18} />{t.done.print}</button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {err && <p className="err" role="alert">{err}</p>}

            {step < 3 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                {step > 0
                  ? <button type="button" onClick={() => go(step - 1)} className="inline-flex min-h-12 items-center gap-1.5 px-2 text-[0.9rem] font-semibold text-accent-ink hover:underline"><ArrowLeftIcon size={18} weight="bold" />{t.back}</button>
                  : <span />}
                {step < 2
                  ? <button type="button" onClick={next} disabled={!don} className="btn btn-accent">{t.next}<ArrowRightIcon size={18} weight="bold" /></button>
                  : <button type="button" onClick={confirm} disabled={busy || !don} className="btn btn-accent">{busy && <CircleNotchIcon size={20} className="spin" />}{busy ? t.pay.confirming : t.pay.confirm}</button>}
              </div>
            )}
          </div>
        </div>

        {don && <Bill t={t} goi={goi} don={don} quote={biz && tinhChinh} />}
      </div>
    </MotionConfig>
  );
}

function Field({ id, label, ph, value, onChange, err, hint, auto, type = "text", mode, wide }: {
  id: string; label: string; ph: string; value: string; onChange: (e: { target: { value: string } }) => void;
  err?: string | false | undefined; hint?: string; auto?: string; type?: string; mode?: "numeric"; wide?: boolean;
}) {
  const desc = err ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} type={type} inputMode={mode} autoComplete={auto} className={`field ${err ? "!border-urgent" : ""}`} placeholder={ph} value={value} onChange={onChange}
        aria-invalid={err ? true : undefined} aria-describedby={desc} maxLength={200} />
      {err ? <p id={`${id}-err`} className="mt-1.5 text-[0.85rem] font-medium text-urgent">{err}</p> : hint && <p id={`${id}-hint`} className="t-note mt-1.5">{hint}</p>}
    </div>
  );
}

function Bill({ t, goi, don, quote }: { t: T; goi: GoiDatMua; don: ReturnType<typeof donDatMua>; quote: boolean }) {
  const b = t.bill;
  const line = don.items[0];
  const bac = don.bacQuyMo;
  const tiers = [...CAU_HINH.quyMo].reverse();
  return (
    <aside className="panel p-6 lg:sticky lg:top-28" aria-labelledby="bill-h" aria-live="polite">
      <h2 id="bill-h" className="text-[1.1rem]">{b.title}</h2>
      <ul className="mt-4 grid gap-3 text-[0.92rem]">
        <li className="flex justify-between gap-3">
          <span><span className="block font-semibold">{b.pack.replace("{plan}", t.plans[goi].name)}</span><span className="text-[0.8rem] text-ink-3">{line.moTa}</span></span>
          <span className="shrink-0 font-semibold tabular-nums">{vnd(line.thanhTien)}</span>
        </li>
        {don.tinhChinh.soDichVu > 0 && (
          <li className="flex justify-between gap-3"><span>{b.tinhChinh}</span><span className="shrink-0 font-semibold tabular-nums">{vnd(don.tinhChinh.thanhTien)}</span></li>
        )}
        {quote && <li className="flex justify-between gap-3"><span>{b.tinhChinhDN}</span><span className="shrink-0 text-ink-2">{b.quote}</span></li>}
      </ul>
      <dl className="mt-4 grid gap-1.5 border-t border-hair pt-4 text-[0.9rem]">
        <div className="flex justify-between"><dt className="text-ink-2">{b.listed}</dt><dd className="tabular-nums">{vnd(don.tongNiemYet)}</dd></div>
        {don.tongUuDai > 0 && <div className="flex justify-between"><dt className="text-ink-2">{b.discount}</dt><dd className="tabular-nums text-accent-2">−{vnd(don.tongUuDai)}</dd></div>}
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3"><dt className="font-semibold">{b.total}</dt>
          <dd><motion.span key={don.tongThanhToan} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="inline-block whitespace-nowrap text-[1.6rem] font-bold tabular-nums">{vnd(don.tongThanhToan)}</motion.span></dd></div>
      </dl>
      <p className="t-note mt-2">{b.period.replace("{from}", viDate(don.ky.batDau)).replace("{to}", viDate(don.ky.hetHan))}</p>
      {don.giaHanDuKien !== don.tongThanhToan && <p className="t-note">{b.renew.replace("{v}", vnd(don.giaHanDuKien))}</p>}
      <p className="t-note">{b.tax}</p>

      <details className="qa mt-3 border-t border-hair">
        <summary className="!py-3 !text-[0.95rem]">{b.how}<span aria-hidden className="text-ink-3">+</span></summary>
        <ol className="grid gap-1.5 pb-2 text-[0.85rem]">
          {line.buoc.map((s, i) => (
            <li key={i} className="flex justify-between gap-3"><span>{s.nhan}{s.lyDo && <span className="block text-ink-3">{s.lyDo}</span>}</span><span className="shrink-0 tabular-nums">{vnd(s.giaTri)}</span></li>
          ))}
        </ol>
        {bac && (
          <>
            <p className="mt-3 text-[0.85rem] font-semibold">{b.tiers}</p>
            <table className="mt-1 w-full text-[0.82rem]">
              <tbody>
                {tiers.map(([tu, tyLe], i) => {
                  const den = i < tiers.length - 1 ? tiers[i + 1][0] - 1 : null;
                  const on = bac.tuSeat === tu;
                  return (
                    <tr key={tu} className={on ? "bg-tint font-semibold text-accent-ink" : "text-ink-2"}>
                      <td className="rounded-l-lg px-2 py-1">{b.tierRow.replace("{range}", den ? `${tu}–${den}` : b.tierFrom.replace("{n}", String(tu)))}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{tyLe ? `−${tyLe}%` : "0%"}</td>
                      <td className="rounded-r-lg px-2 py-1 text-right">{on ? b.current : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </details>
    </aside>
  );
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Ô vuông giả QR từ mã đơn – chỉ để minh họa, không mã hóa dữ liệu thật. */
function DemoQR({ seed }: { seed: string }) {
  const n = 25;
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) / 4294967296;
  const finder = (x: number, y: number) => [[0, 0], [n - 7, 0], [0, n - 7]].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rnd() > 0.5) cells.push([x, y]);
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="w-full rounded-2xl bg-white ring-1 ring-hair" role="img" aria-label="QR minh họa">
      {[[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y]) => (
        <g key={`${x}-${y}`}><rect x={x} y={y} width="7" height="7" fill="#201f1d" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="#201f1d" /></g>
      ))}
      {cells.map(([x, y]) => <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="#201f1d" />)}
    </svg>
  );
}
