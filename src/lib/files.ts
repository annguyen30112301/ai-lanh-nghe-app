// Đọc file NGAY TRONG TRÌNH DUYỆT. Chỉ văn bản đã trích được gửi lên API, file gốc không rời máy.
export const MAX_ROWS = 200;

export class FileReadError extends Error {
  constructor(public kind: "noText" | "badType", public fileName: string) { super(kind); }
}

const ext = (name: string) => name.toLowerCase().split(".").pop() ?? "";
export const accept = ".xlsx,.xls,.csv,.pdf";

async function readSheet(file: File) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const parts: string[] = [];
  let rows = 0;
  for (const name of wb.SheetNames) {
    if (rows >= MAX_ROWS) break;
    const tsv = XLSX.utils.sheet_to_csv(wb.Sheets[name], { FS: "\t", blankrows: false, strip: true })
      .split("\n").map((l) => l.replace(/\t+$/, "")).filter((l) => l.trim());
    const take = tsv.slice(0, MAX_ROWS - rows);
    rows += take.length;
    if (take.length) parts.push((wb.SheetNames.length > 1 ? `# Sheet: ${name}\n` : "") + take.join("\n"));
  }
  return { text: parts.join("\n\n"), rows };
}

async function readPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const lines: string[] = [];
  for (let p = 1; p <= Math.min(doc.numPages, 30) && lines.length < MAX_ROWS * 2; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    // gom chữ theo dòng dựa trên toạ độ y
    const rowsByY = new Map<number, { x: number; s: string }[]>();
    for (const it of content.items as { str: string; transform: number[] }[]) {
      if (!it.str?.trim()) continue;
      const y = Math.round(it.transform[5] / 3) * 3;
      (rowsByY.get(y) ?? rowsByY.set(y, []).get(y)!).push({ x: it.transform[4], s: it.str });
    }
    [...rowsByY.entries()].sort((a, b) => b[0] - a[0]).forEach(([, cells]) =>
      lines.push(cells.sort((a, b) => a.x - b.x).map((c) => c.s.trim()).join("  ")));
  }
  return { text: lines.join("\n"), rows: lines.length };
}

export async function readFileText(file: File) {
  const e = ext(file.name);
  const r = e === "pdf" ? await readPdf(file) : ["xlsx", "xls", "csv"].includes(e) ? await readSheet(file) : null;
  if (!r) throw new FileReadError("badType", file.name);
  if (r.text.replace(/\s/g, "").length < 20) throw new FileReadError("noText", file.name);
  return { name: file.name, text: r.text, rows: r.rows };
}
