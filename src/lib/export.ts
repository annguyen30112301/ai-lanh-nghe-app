// Xuất kết quả ra Excel/Word ngay trong trình duyệt.
import type { LetterResult, SummaryResult, TableResult } from "../content/types";

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const stamp = () => new Date().toISOString().slice(0, 10);
const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^\w]+/g, "_").replace(/^_|_$/g, "");

export async function exportTable(r: TableResult, title: string, item: string, labels: { criteria: string; pick: string; why: string; nego: string; missing: string; note: string }) {
  const XLSX = await import("xlsx");
  const aoa: (string | number)[][] = [[title], [item], [], [labels.criteria, ...r.ncc, labels.note]];
  for (const row of r.rows) aoa.push([row.tieu_chi, ...row.gia_tri, row.ghi_chu ?? ""]);
  aoa.push([], [labels.pick, r.de_xuat.ncc], [labels.why, r.de_xuat.ly_do]);
  if (r.thu_thuong_luong_goi_y) aoa.push([labels.nego, r.thu_thuong_luong_goi_y]);
  if (r.thieu_du_lieu?.length) aoa.push([labels.missing, r.thieu_du_lieu.join("; ")]);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 26 }, ...r.ncc.map(() => ({ wch: 28 })), { wch: 36 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "So sanh");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `So_sanh_bao_gia_${stamp()}.xlsx`);
}

export async function exportDoc(kind: "letter" | "summary", r: LetterResult | SummaryResult, title: string, labels: Record<string, string>) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = await import("docx");
  const p = (text: string, bold = false) => new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text, bold, font: "Arial", size: 24 })] });
  const h = (text: string) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, bold: true, font: "Arial", size: 28 })] });
  const bullets = (items: string[]) => items.map((t) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: t, font: "Arial", size: 24 })] }));
  let children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];
  if (kind === "letter") {
    const l = r as LetterResult;
    children = [p(`${labels.subject}: ${l.tieu_de}`, true), p(l.kinh_gui), ...l.doan.map((d) => p(d)), ...l.ky_ten.split("\n").map((x) => p(x, true))];
  } else {
    const s = r as SummaryResult;
    const cell = (t: string, bold = false) => new TableCell({ children: [p(t, bold)] });
    children = [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: title, bold: true, font: "Arial", size: 32 })] }),
      h(labels.overview), p(s.tong_quan),
      ...s.muc.flatMap((m) => [h(m.tieu_de), ...bullets(m.y)]),
      h(labels.score),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: s.cham_diem.map((c) => new TableRow({ children: [cell(c.tieu_chi, true), cell(`${c.diem}/5`), cell(c.nhan_xet)] })) }),
      h(labels.check), ...bullets(s.diem_can_kiem_tra),
      h(labels.verdict), p(s.ket_luan, true)
    ];
  }
  const doc = new Document({ sections: [{ children }] });
  download(await Packer.toBlob(doc), `${slug(title)}_${stamp()}.docx`);
}
