import { useEffect, useState } from "react";
import type { ScenarioPublic } from "../content/types";
import type { app } from "../content/vi";
import WorkSession from "./WorkSession";

interface Props { list: ScenarioPublic[]; t: typeof app.work; tm: typeof app.connect.models; demo: Record<string, string[]> }

/** Chọn tình huống theo ?s= (trang tĩnh, nên đọc ở trình duyệt). */
export default function WorkPage({ list, t, tm, demo }: Props) {
  const [sc, setSc] = useState<ScenarioPublic | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("s");
    const found = list.find((x) => x.id === id) ?? list[0];
    setSc(found);
    document.title = `${found.name} · AI Lành Nghề`;
  }, [list]);
  if (!sc) return <div className="min-h-[60vh]" />;
  return (
    <>
      <h1 className="t-title">{sc.name}</h1>
      <p className="t-sub mt-2">{sc.summary}</p>
      <div className="mt-8"><WorkSession key={sc.id} scenario={sc} t={t} tm={tm} demoFiles={demo[sc.id] ?? []} /></div>
    </>
  );
}
