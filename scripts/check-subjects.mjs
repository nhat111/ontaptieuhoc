// So sánh danh mục môn trong lib/subjects.ts với bảng `subjects` trong Supabase.
//
//   node --env-file=.env.local scripts/check-subjects.mjs
//
// Chỉ đọc, không ghi gì cả. Dùng để kiểm tra sau khi sửa lib/subjects.ts:
//   - "thiếu trong DB"  → môn khai báo trong code nhưng DB chưa có row. Không sao,
//     row sẽ được tạo tự động lần đầu thêm chương cho môn đó.
//   - "thừa trong DB"   → DB có môn mà code không khai báo. Các chương/bài thuộc
//     môn đó sẽ KHÔNG hiện trên web cho tới khi thêm tên môn vào lib/subjects.ts.

import { readFileSync } from "node:fs";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !KEY) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Chạy: node --env-file=.env.local scripts/check-subjects.mjs");
  process.exit(1);
}

// Đọc danh mục từ lib/subjects.ts mà không cần bundler: bóc literal của
// SUBJECTS_BY_GRADE. Giữ script này không phụ thuộc TypeScript runtime.
function readCatalog() {
  const src = readFileSync(new URL("../lib/subjects.ts", import.meta.url), "utf8");
  const block = src.match(/SUBJECTS_BY_GRADE[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error("Không đọc được SUBJECTS_BY_GRADE trong lib/subjects.ts");
  const catalog = {};
  for (const line of block[1].split("\n")) {
    const m = line.match(/^\s*(\d+):\s*\[(.*)\],?\s*$/);
    if (!m) continue;
    catalog[Number(m[1])] = [...m[2].matchAll(/"([^"]*)"/g)].map((x) => x[1]);
  }
  return catalog;
}

const res = await fetch(`${URL_}/rest/v1/subjects?select=id,name,grade&order=grade,order_index`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
if (!res.ok) {
  console.error(`Supabase trả về ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const rows = await res.json();
const catalog = readCatalog();
const dbByGrade = new Map();
for (const r of rows) {
  if (!dbByGrade.has(r.grade)) dbByGrade.set(r.grade, []);
  dbByGrade.get(r.grade).push(r.name);
}

let problems = 0;
for (const grade of [1, 2, 3, 4, 5]) {
  const code = catalog[grade] ?? [];
  const db = dbByGrade.get(grade) ?? [];
  const missing = code.filter((n) => !db.includes(n));
  const extra = db.filter((n) => !code.includes(n));

  console.log(`\nLớp ${grade}`);
  console.log(`  code: ${code.join(", ") || "(trống)"}`);
  console.log(`  DB  : ${db.join(", ") || "(trống)"}`);
  if (missing.length) console.log(`  ⚠ thiếu trong DB: ${missing.join(", ")} (sẽ tự tạo khi thêm chương)`);
  if (extra.length) {
    console.log(`  ❌ thừa trong DB : ${extra.join(", ")} (nội dung của các môn này KHÔNG hiện trên web)`);
    problems += extra.length;
  }
  if (!missing.length && !extra.length) console.log("  ✅ khớp");
}

console.log(
  problems
    ? `\n${problems} môn trong DB chưa được khai báo — thêm vào SUBJECTS_BY_GRADE trong lib/subjects.ts.`
    : "\nDanh mục môn khớp với DB."
);
