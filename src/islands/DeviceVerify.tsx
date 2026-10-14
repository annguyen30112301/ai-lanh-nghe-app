import { useState } from "react";
import { motion } from "motion/react";
import { DeviceMobileIcon, CheckCircleIcon } from "@phosphor-icons/react";
import type { app } from "../content/vi";
import OtpBoxes from "./OtpBoxes";

type T = typeof app.device;

/** Chỉ giao diện: chưa gửi SMS thật. */
export default function DeviceVerify({ t }: { t: T }) {
  const [code, setCode] = useState("");
  const [ok, setOk] = useState(false);
  const done = () => { setOk(true); setTimeout(() => (location.href = "/app/tinh-huong/"), 1400); };
  return (
    <div className="panel p-6 sm:p-9">
      <span className="icon-tile"><DeviceMobileIcon size={26} /></span>
      <h1 className="mt-4 text-[1.7rem]">{t.heading}</h1>
      <p className="mt-2 text-ink-2" dangerouslySetInnerHTML={{ __html: t.lead.replace("{phone}", t.phone) }} />
      <p className="mt-4 rounded-2xl bg-canvas px-4 py-3 text-[0.88rem] text-ink-2">{t.device}</p>
      <OtpBoxes value={code} onChange={setCode} aria={t.codeAria} onComplete={done} disabled={ok} />
      {ok ? (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-2 font-semibold text-accent-2" role="status"><CheckCircleIcon size={22} weight="fill" />{t.ok}</motion.p>
      ) : (
        <button type="button" className="btn btn-accent mt-6 w-full" disabled={code.length !== 6} onClick={done}>{t.confirm}</button>
      )}
      <button type="button" className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-[0.88rem] font-semibold text-urgent">{t.notMe}</button>
      <p className="t-note mt-4">{t.note}</p>
    </div>
  );
}
