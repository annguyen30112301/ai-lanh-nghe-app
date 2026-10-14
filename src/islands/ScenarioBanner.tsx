import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircleIcon, PlugIcon, SparkleIcon } from "@phosphor-icons/react";
import type { MeResponse } from "../content/types";
import type { app } from "../content/vi";
import { getMe } from "../lib/client";

type T = typeof app.scenarios;

/** Trạng thái AI phía trên danh sách tình huống. */
export default function ScenarioBanner({ t, connectLabel }: { t: T; connectLabel: string }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [justConnected, setJust] = useState(false);
  useEffect(() => {
    setJust(new URLSearchParams(location.search).get("ket-noi") === "ok");
    getMe(true).then(setMe).catch(() => {});
  }, []);
  if (!me) return <div className="h-16" />;
  const tone = me.ai ? "ok" : me.trial_left > 0 ? "trial" : "none";
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="status"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5 text-[0.92rem] ${tone === "none" ? "bg-urgent-soft text-urgent" : "bg-raised ring-1 ring-hair"}`}>
      <span className="flex items-center gap-2.5 font-medium">
        {tone === "ok" ? <CheckCircleIcon size={22} weight="fill" className="text-accent-2" /> : tone === "trial" ? <SparkleIcon size={22} weight="fill" className="text-accent" /> : <PlugIcon size={22} />}
        {tone === "ok" ? (justConnected ? t.connected : `${me.org.name} · ••••${me.ai!.key_last4}`) : tone === "trial" ? t.banner.trial.replace("{n}", String(me.trial_left)) : t.banner.none}
      </span>
      {tone !== "ok" && me.org.role === "admin" && <a href="/app/ket-noi-ai/" className="btn btn-accent !min-h-10 !px-5">{t.banner.connect}</a>}
      {tone === "ok" && <a href="/app/ket-noi-ai/" className="text-[0.85rem] font-semibold">{connectLabel}</a>}
    </motion.div>
  );
}
