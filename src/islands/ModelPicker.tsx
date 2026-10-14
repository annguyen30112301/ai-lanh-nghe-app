import { useEffect, useMemo, useState } from "react";
import { CheckCircleIcon, CircleNotchIcon, LockSimpleIcon, MagnifyingGlassIcon, SealCheckIcon } from "@phosphor-icons/react";
import type { ModelInfo, ModelsResponse } from "../content/types";
import type { app } from "../content/vi";
import { api, errText, post } from "../lib/client";
import { formatVnd, modelKey, pricePerRun, PROVIDER_LABEL } from "../lib/models";

type T = typeof app.connect.models;

const ctxLabel = (n: number | null) => (n === null ? null : n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1000)}k`);
const pname = (p: string) => PROVIDER_LABEL[p] ?? p;
const keyOf = (m: ModelInfo) => modelKey(m.provider, m.id);
const split = (k: string) => { const i = k.indexOf(":"); return { provider: k.slice(0, i), model: k.slice(i + 1) }; };

/** Mô hình của mọi AI khách đã kết nối. Sắp theo tên, không chọn sẵn, không gắn nhãn khuyên dùng. */
export default function ModelPicker({ t, onSaved }: { t: T; onSaved?: () => void }) {
  const [d, setD] = useState<ModelsResponse | null>(null);
  const [q, setQ] = useState("");
  const [prov, setProv] = useState<string | null>(null);
  const [onlyTested, setOnlyTested] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [minCtx, setMinCtx] = useState("");
  const [limit, setLimit] = useState(40);
  const [sel, setSel] = useState<string | null>(null);
  const [allow, setAllow] = useState(false);
  const [fb, setFb] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api<ModelsResponse>("/api/ai/models").then((r) => {
      const c = r.current;
      setD(r);
      setSel(c ? modelKey(c.provider, c.model) : null);
      setAllow(!!c?.allow_fallback);
      setFb(c?.fallback_provider && c.fallback_model ? modelKey(c.fallback_provider, c.fallback_model) : "");
    }).catch((e) => setMsg({ ok: false, text: errText(e) }));
  }, []);

  const shown = useMemo(() => {
    if (!d) return [];
    const words = q.toLocaleLowerCase("vi").split(/\s+/).filter(Boolean);
    const mp = maxPrice ? Number(maxPrice) : null, mc = minCtx ? Number(minCtx) * 1000 : null;
    return d.models.filter((m) => {
      if (prov && m.provider !== prov) return false;
      const hay = `${m.name} ${m.id}`.toLocaleLowerCase("vi");
      if (!words.every((w) => hay.includes(w))) return false;
      if (onlyTested && !m.tested) return false;
      if (mp !== null) { const p = pricePerRun(m, d.usd_vnd); if (p === null || p > mp) return false; }
      if (mc !== null && (m.contextLength ?? 0) < mc) return false;
      return true;
    });
  }, [d, q, prov, onlyTested, maxPrice, minCtx]);

  if (!d) return msg ? <p className="err" role="alert">{msg.text}</p> : <p className="flex items-center gap-2 text-ink-2"><CircleNotchIcon className="spin" size={20} />{t.loading}</p>;

  const multi = d.providers.length > 1;
  const price = (m: ModelInfo) => pricePerRun(m, d.usd_vnd);
  const cur = d.current;
  const curKey = cur ? modelKey(cur.provider, cur.model) : null;
  const curFb = cur?.fallback_provider && cur.fallback_model ? modelKey(cur.fallback_provider, cur.fallback_model) : "";
  const selectable = d.models.filter((m) => !m.locked && keyOf(m) !== sel);
  const changed = sel !== curKey || allow !== !!cur?.allow_fallback || (allow && fb !== curFb);
  const canSave = !!sel && (!allow || (!!fb && fb !== sel)) && changed && !busy;

  async function save() {
    if (!sel) { setMsg({ ok: false, text: t.pickFirst }); return; }
    if (allow && (!fb || fb === sel)) { setMsg({ ok: false, text: t.pickFallback }); return; }
    setBusy(true); setMsg(null);
    const m = split(sel), f = allow ? split(fb) : null;
    try {
      await post("/api/ai/model", { provider: m.provider, model: m.model, allow_fallback: allow, fallback_provider: f?.provider ?? null, fallback_model: f?.model ?? null });
      setD({ ...d!, current: { ...m, allow_fallback: allow, fallback_provider: f?.provider ?? null, fallback_model: f?.model ?? null } });
      setMsg({ ok: true, text: t.saved });
      onSaved?.();
    } catch (e) { setMsg({ ok: false, text: errText(e) }); }
    setBusy(false);
  }

  return (
    <div>
      <p className="mb-3 text-[0.88rem] font-semibold">{t.source.replace("{p}", d.providers.map(pname).join(", "))}</p>
      {d.providers.includes("openrouter") && <p className="t-note -mt-2 mb-3">{t.sourceOpenRouter}</p>}
      {d.errors.map((e) => <p key={e.provider} className="err !mt-0 mb-3" role="alert">{t.providerError.replace("{p}", pname(e.provider)).replace("{m}", e.message)}</p>)}

      {multi && (
        <div className="mb-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t.filters}>
          {[null, ...d.providers].map((p) => (
            <button key={p ?? "all"} type="button" role="radio" aria-checked={prov === p} onClick={() => { setProv(p); setLimit(40); }}
              className={`min-h-11 rounded-full border-2 px-4 text-[0.85rem] font-semibold ${prov === p ? "border-accent bg-accent text-on-accent" : "border-hair bg-raised"}`}>
              {p ? `${pname(p)} · ${d.models.filter((m) => m.provider === p).length}` : `${t.allProviders} · ${d.models.length}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-2xl border-2 border-hair bg-raised px-3 focus-within:border-accent">
        <MagnifyingGlassIcon size={20} className="shrink-0 text-ink-3" />
        <label className="sr-only" htmlFor="model-q">{t.search}</label>
        <input id="model-q" className="min-h-12 w-full bg-transparent outline-none" placeholder={t.search} value={q} onChange={(e) => { setQ(e.target.value); setLimit(40); }} />
      </div>
      <fieldset className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-3 text-[0.85rem]">
        <legend className="sr-only">{t.filters}</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold">
          <input type="checkbox" className="size-5 accent-[#1f5e4a]" checked={onlyTested} onChange={(e) => setOnlyTested(e.target.checked)} />{t.tested}
        </label>
        <label className="font-semibold">{t.maxPrice}
          <input type="number" min={0} step={10} inputMode="numeric" className="field !mt-1 !min-h-11 w-32" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </label>
        <label className="font-semibold">{t.minCtx}
          <input type="number" min={0} step={8} inputMode="numeric" className="field !mt-1 !min-h-11 w-32" value={minCtx} onChange={(e) => setMinCtx(e.target.value)} />
        </label>
      </fieldset>

      <p className="mt-4 text-[0.8rem] font-semibold text-ink-3" aria-live="polite">{t.count.replace("{n}", String(shown.length))}</p>
      <div role="radiogroup" aria-label={t.step} className="mt-2 grid max-h-[28rem] gap-2 overflow-y-auto pr-1">
        {shown.length === 0 && <p className="rounded-2xl bg-canvas p-4 text-[0.9rem] text-ink-2">{t.none}</p>}
        {shown.slice(0, limit).map((m) => {
          const k = keyOf(m), on = sel === k, p = price(m), ctx = ctxLabel(m.contextLength);
          return (
            <button key={k} type="button" role="radio" aria-checked={on} disabled={!!m.locked} onClick={() => { setSel(k); setMsg(null); if (fb === k) setFb(""); }}
              className={`flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border-2 px-4 py-3 text-left transition-colors ${on ? "border-accent bg-tint" : "border-hair bg-raised hover:border-brand-300"} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-hair`}>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-semibold">
                  {on && <CheckCircleIcon size={18} weight="fill" className="shrink-0 text-accent" />}
                  <span className="truncate">{m.name}</span>
                  {curKey === k && <span className="chip chip-muted !py-0.5 text-[0.72rem]">{t.current}</span>}
                </span>
                <span className="block truncate font-mono text-[0.75rem] text-ink-3">{m.id}{multi && <span className="font-sans"> · {t.via.replace("{p}", pname(m.provider))}</span>}</span>
                {m.locked && <span className="mt-1 flex items-center gap-1.5 text-[0.8rem] font-medium text-urgent"><LockSimpleIcon size={14} weight="bold" />{t.locked}: {m.locked}</span>}
              </span>
              <span className="flex flex-wrap items-center gap-2 text-[0.8rem]">
                {m.testScore && <span className="chip chip-ok !py-0.5"><SealCheckIcon size={14} weight="fill" />{t.testedChip.replace("{s}", m.testScore)}</span>}
                {ctx && <span className="chip chip-muted !py-0.5">{t.ctx.replace("{n}", ctx)}</span>}
                <span className="min-w-24 text-right font-semibold tabular-nums" title={p === null ? t.noPrice : undefined}>{p === null ? "—" : t.perRun.replace("{p}", formatVnd(p))}</span>
              </span>
            </button>
          );
        })}
        {shown.length > limit && (
          <button type="button" className="btn btn-line !min-h-11" onClick={() => setLimit(limit + 80)}>{t.more.replace("{n}", String(shown.length - limit))}</button>
        )}
      </div>

      <details className="mt-4 rounded-2xl bg-canvas px-4 py-3 ring-1 ring-hair" open={allow}>
        <summary className="min-h-9 cursor-pointer pt-1.5 text-[0.9rem] font-semibold">{t.fallbackTitle}</summary>
        <div role="radiogroup" aria-label={t.fallbackTitle} className="mt-2 grid gap-1 text-[0.9rem]">
          <label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="radio" name="fb" className="size-5 accent-[#1f5e4a]" checked={!allow} onChange={() => setAllow(false)} />{t.fallbackOff}</label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="radio" name="fb" className="size-5 accent-[#1f5e4a]" checked={allow} onChange={() => setAllow(true)} />{t.fallbackOn}</label>
        </div>
        {allow && (
          <div className="mt-2">
            <label className="label" htmlFor="fb-model">{t.fallbackPick}</label>
            <select id="fb-model" className="field" value={fb} onChange={(e) => setFb(e.target.value)}>
              <option value="">{t.fallbackPh}</option>
              {selectable.map((m) => {
                const p = price(m);
                return <option key={keyOf(m)} value={keyOf(m)}>{m.name}{multi ? ` (${pname(m.provider)})` : ""}{p === null ? "" : ` · ${t.perRun.replace("{p}", formatVnd(p))}`}</option>;
              })}
            </select>
            <p className="t-note mt-2">{t.fallbackNote}</p>
          </div>
        )}
      </details>

      {msg && <p className={msg.ok ? "mt-3 rounded-2xl bg-tint px-4 py-3 text-[0.9rem] font-medium text-accent-ink" : "err"} role={msg.ok ? "status" : "alert"}>{msg.text}</p>}
      <button type="button" className="btn btn-accent mt-4" disabled={!canSave} onClick={save}>
        {busy && <CircleNotchIcon size={20} className="spin" />}{busy ? t.saving : t.save}
      </button>
      <p className="t-note mt-4">{t.priceNote.replace("{r}", d.usd_vnd.toLocaleString("vi-VN"))} {t.freeTier}</p>
    </div>
  );
}
