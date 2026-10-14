// Sinh db/seed.sql: 1 org cá nhân demo, "Cơ khí Tân Phú" 15 seat, ~120 runs trong 4 tuần, 8 tài khoản thử.
// Chạy: node scripts/make-seed.mjs   (thời gian tính lùi từ lúc chạy)
import { writeFileSync } from "node:fs";
let s = 20261014;
const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const q = (v) => (v === null ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const D = "ailanhnghe.demo";
const now = Date.now();
const out = ["-- Sinh tự động bởi scripts/make-seed.mjs. Dữ liệu giả.", "DELETE FROM runs; DELETE FROM members; DELETE FROM organizations WHERE id IN ('org_tanphu','org_demo'); DELETE FROM trial_usage;"];
const ins = (t, row) => out.push(`INSERT OR REPLACE INTO ${t} (${Object.keys(row).join(",")}) VALUES (${Object.values(row).map(q).join(",")});`);

ins("organizations", { id: "org_tanphu", name: "Cơ khí Tân Phú", plan: "business", seats: 15, expires_at: now + 300 * 864e5 });
ins("organizations", { id: "org_demo", name: "Cá nhân – Demo", plan: "personal", seats: 1, expires_at: null });

const staff = [
  ["lan", "Nguyễn Thị Lan", "admin"], ["hung", "Trần Văn Hùng"], ["mai", "Lê Thị Mai"], ["tuan", "Phạm Minh Tuấn"],
  ["hoa", "Võ Thị Hoa"], ["dung", "Đặng Quốc Dũng"], ["thu", "Bùi Thị Thu"], ["son", "Hoàng Văn Sơn"],
  ["nga", "Đỗ Thị Nga"], ["phuc", "Ngô Văn Phúc"], ["yen", "Huỳnh Thị Yến"], ["khoa", "Trương Đăng Khoa"]
];
const ids = [];
staff.forEach(([u, name, role], i) => {
  const id = `u_tp_${u}`; ids.push([id, i]);
  ins("users", { id, email: `${u}@${D}`, name, created_at: now - 40 * 864e5 });
  ins("members", { org_id: "org_tanphu", user_id: id, role: role || "member", status: i === 11 ? "invited" : "active" });
});
ins("users", { id: "u_demo", email: `demo@${D}`, name: "Tài khoản demo", created_at: now - 10 * 864e5 });
ins("members", { org_id: "org_demo", user_id: "u_demo", role: "admin", status: "active" });
for (let k = 1; k <= 8; k++) {
  const id = `u_thu${k}`;
  ins("users", { id, email: `thu${k}@${D}`, name: `Người thử ${k}`, created_at: now });
  ins("organizations", { id: `org_thu${k}`, name: `Cá nhân – Người thử ${k}`, plan: "personal", seats: 1, expires_at: null });
  ins("members", { org_id: `org_thu${k}`, user_id: id, role: "admin", status: "active" });
  ins("trial_usage", { user_id: id, used: 0 });
}

const sc = [["so-sanh-bao-gia", 45, 14], ["thu-thuong-luong", 30, 9], ["tom-tat-ho-so-ncc", 40, 12]];
let n = 0;
for (let w = 0; w < 4; w++) {
  const perWeek = [22, 28, 33, 38][w];
  for (let k = 0; k < perWeek; k++) {
    // người dùng tích cực hơn ở đầu danh sách, mức áp dụng tăng dần theo tuần
    const [uid, idx] = ids[Math.min(10, Math.floor(rnd() ** 1.4 * (6 + w * 2)))];
    if (idx === 11) continue;
    const [sid, , work] = pick(sc);
    const opened = now - (27 - w * 7 - Math.floor(rnd() * 7)) * 864e5 - Math.floor(rnd() * 8 * 36e5);
    const mins = Math.max(4, Math.round(work + (rnd() - 0.5) * 8 - w));
    const total = sid === "so-sanh-bao-gia" ? 6 : 5;
    ins("runs", {
      id: `r_seed_${++n}`, user_id: uid, org_id: "org_tanphu", scenario_id: sid,
      opened_at: opened, submitted_at: opened + Math.round(mins * 0.55 * 6e4), result_at: opened + Math.round(mins * 0.6 * 6e4), exported_at: opened + mins * 6e4,
      edits: Math.floor(rnd() * 4), checklist_done: total, checklist_total: total, masked_items: 4 + Math.floor(rnd() * 8),
      tokens_in: 3000 + Math.floor(rnd() * 4000), tokens_out: 700 + Math.floor(rnd() * 900), via_trial: 0, status: "exported"
    });
  }
}
writeFileSync(new URL("../db/seed.sql", import.meta.url), out.join("\n") + "\n");
console.log(`seed.sql: ${n} runs`);
