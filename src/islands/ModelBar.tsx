import { useEffect, useState } from "react";
import { CpuIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { MeResponse, ModelsResponse } from "../content/types";
import type { app } from "../content/vi";
import { api, getMe } from "../lib/client";
import { formatVnd, pricePerRun } from "../lib/models";
import ModelPicker from "./ModelPicker";

interface Props { t: typeof app.work.model; tm: typeof app.connect.models; onBlocked: (blocked: boolean) => void }

/** Dòng "Mô hình: … · ≈ …/lượt · Đổi" phía trên nút chạy. Chưa chọn mô hình thì chặn chạy. */
export default function ModelBar({ t, tm, onBlocked }: Props) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [info, setInfo] = useState<ModelsResponse | null>(null);
  const [open, setOpen] = useState(false);

  const load = async (force = false) => {
    const m = await getMe(force);
    setMe(m);
    if (m.ai?.model) api<ModelsResponse>("/api/ai/models").then(setInfo).catch(() => setInfo(null));
  };
  useEffect(() => { load().catch(() => {}); }, []);
  useEffect(() => { onBlocked(!!me?.ai && !me.ai.model); }, [me, onBlocked]);

  if (!me) return null;
  if (!me.ai) {
    const text = me.trial_left > 0 && me.trial_model ? t.trial.replace("{m}", me.trial_model) : me.mock ? t.mock : null;
    return text ? <p className="t-note flex items-center gap-2"><CpuIcon size={18} className="shrink-0" />{text}</p> : null;
  }
  const admin = me.org.role === "admin";
  const picker = open && admin && (
    <div className="mt-3 rounded-3xl bg-raised p-5 ring-1 ring-hair">
      <ModelPicker t={tm} onSaved={() => { setOpen(false); load(true).catch(() => {}); }} />
    </div>
  );

  if (!me.ai.model) {
    return (
      <div>
        <div className="err flex flex-wrap items-center justify-between gap-3" role="alert">
          <span className="flex items-center gap-2"><WarningCircleIcon size={20} weight="fill" className="shrink-0" />{admin ? t.missing : t.missingMember}</span>
          {admin && !open && <button type="button" className="btn btn-accent !min-h-10" onClick={() => setOpen(true)}>{t.pick}</button>}
        </div>
        {picker}
      </div>
    );
  }

  const cur = info?.models.find((m) => m.id === me.ai!.model);
  const price = cur && info ? pricePerRun(cur, info.usd_vnd) : null;
  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.88rem] text-ink-2">
        <CpuIcon size={18} className="shrink-0" />
        <span>{t.label.replace("{m}", cur?.name ?? me.ai.model)}</span>
        {price !== null && <span>· {tm.perRun.replace("{p}", formatVnd(price))}</span>}
        {admin && <>· <button type="button" className="min-h-9 font-semibold text-accent-ink underline-offset-2 hover:underline" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? t.close : t.change}</button></>}
      </p>
      {picker}
    </div>
  );
}
