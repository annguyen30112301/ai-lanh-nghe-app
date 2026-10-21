import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircleNotchIcon, DesktopIcon, DeviceMobileIcon, SealCheckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { app } from "../content/vi";
import { api, errText, post } from "../lib/client";

type T = typeof app.account;
type Plan = keyof T["plan"];
interface Data {
  email: string;
  license: { org_name: string; plan: Plan; seats: number; role: "admin" | "member"; expires_at: number | null; active: boolean };
  history: { id: string; order_id: string | null; plan: Plan; seats: number; valid_from: string; valid_to: string }[];
  devices: { rid: number; name: string; created_at: number | null; last_seen: number | null; current: boolean }[];
  device_limit: number;
}

const viDate = (iso: string) => iso.split("-").reverse().join("/");
const when = (t: number | null) => (t ? new Date(t).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "–");

/** Gói & license của tổ chức đang dùng, lịch sử cấp license, thiết bị đang đăng nhập. */
export default function Account({ t }: { t: T }) {
  const [d, setD] = useState<Data | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { api<Data>("/api/account").then(setD).catch((e) => setErr(errText(e))); }, []);

  async function signout(rid: number) {
    setBusy(rid); setErr(null);
    try { setD(await post<Data>("/api/account", { action: "signout", rid })); } catch (e) { setErr(errText(e)); }
    setBusy(null);
  }

  if (!d) return err ? <p className="err" role="alert">{err}</p> : <div className="min-h-[40vh]" />;
  const l = d.license;
  const status = l.active ? t.active : l.expires_at ? t.expired : t.inactive;
  const buyHref = `/dat-mua/?goi=${l.plan}${l.plan === "personal" ? "" : `&seat=${l.seats}`}`;
  return (
    <div className="grid min-w-0 gap-6 [&>*]:min-w-0">
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 sm:p-8" aria-labelledby="lic-h">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.8rem] font-semibold text-ink-3" id="lic-h">{t.license}</p>
            <p className="mt-1 text-[1.4rem] font-bold">{t.plan[l.plan]}{l.plan !== "personal" && ` · ${t.seats.replace("{n}", String(l.seats))}`}</p>
            <p className="mt-1 text-[0.92rem] text-ink-2">{t.org}: {l.org_name} · {t.role[l.role]}</p>
          </div>
          <span className={`chip ${l.active ? "chip-ok" : "!bg-urgent-soft !text-urgent"}`}>
            {l.active ? <SealCheckIcon size={16} weight="fill" /> : <WarningCircleIcon size={16} weight="fill" />}{status}
          </span>
        </div>
        {l.expires_at && <p className="mt-3 text-[0.92rem]">{t.until.replace("{d}", new Date(l.expires_at).toLocaleDateString("vi-VN"))}</p>}
        {!l.active && <p className="mt-3 text-[0.92rem] text-ink-2">{t.noLicenseNote}</p>}
        {l.role === "admin"
          ? <a href={buyHref} className="btn btn-accent mt-5">{l.active ? t.renew : t.buy}</a>
          : <p className="t-note mt-4">{t.memberNote}</p>}

        <h2 className="mt-8 text-[1.05rem]">{t.history}</h2>
        {d.history.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-[0.88rem]">
              <thead className="text-ink-3"><tr><th className="py-2 pr-4 font-semibold">{t.col.order}</th><th className="py-2 pr-4 font-semibold">{t.col.plan}</th><th className="py-2 font-semibold">{t.col.period}</th></tr></thead>
              <tbody>
                {d.history.map((h) => (
                  <tr key={h.id} className="border-t border-hair">
                    <td className="py-2 pr-4 font-mono">{h.order_id ?? t.seedOrder}</td>
                    <td className="py-2 pr-4">{t.plan[h.plan]}{h.plan !== "personal" && ` · ${t.seats.replace("{n}", String(h.seats))}`}</td>
                    <td className="py-2 tabular-nums">{viDate(h.valid_from)} – {viDate(h.valid_to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="t-note mt-2">{t.historyEmpty}</p>}
      </motion.section>

      <section className="panel p-6 sm:p-8" aria-labelledby="dev-h">
        <h2 id="dev-h" className="text-[1.05rem]">{t.devices}</h2>
        <p className="mt-1 text-[0.9rem] text-ink-2">{t.devicesLead.replace("{n}", String(d.device_limit)).replace("{m}", String(d.device_limit + 1))}</p>
        <ul className="mt-4 grid gap-2">
          {d.devices.map((x) => (
            <li key={x.rid} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas px-4 py-3 ring-1 ring-hair">
              <span className="flex items-center gap-3">
                {/iOS|Android/.test(x.name) ? <DeviceMobileIcon size={24} weight="duotone" className="text-accent" /> : <DesktopIcon size={24} weight="duotone" className="text-accent" />}
                <span><b className="block text-[0.92rem]">{x.name}</b><span className="text-[0.8rem] text-ink-3">{t.lastSeen.replace("{t}", when(x.last_seen ?? x.created_at))}</span></span>
              </span>
              {x.current
                ? <span className="chip">{t.current}</span>
                : <button type="button" className="btn btn-line !min-h-10 !px-4 text-[0.85rem]" disabled={busy !== null} onClick={() => signout(x.rid)}>
                    {busy === x.rid && <CircleNotchIcon size={16} className="spin" />}{t.signout}
                  </button>}
            </li>
          ))}
        </ul>
        {err && <p className="err" role="alert">{err}</p>}
      </section>
    </div>
  );
}
