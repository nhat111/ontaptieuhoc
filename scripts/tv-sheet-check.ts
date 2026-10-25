// scripts/tv-sheet-check.ts — kiểm tra phiếu bài tập Tiếng Việt lớp 1–5 (lib/tvSheet.ts,
// lib/tvGen/lop3.ts, lop4.ts, lop5.ts). Chạy: npx tsx scripts/tv-sheet-check.ts
//  - kho lớp 3: câu mỗi kiểu không trùng, đúng dấu cuối câu; câu so sánh chứa đúng đoạn
//    a / từ so sánh / b, câu thường không có từ so sánh; mọi bộ phận Khi nào? Ở đâu?… là đoạn
//    có thật trong câu, mỗi câu có ít nhất một bộ phận được hỏi; cặp từ trái nghĩa gần nhau
//    không dùng làm nhiễu cho nhau; không có ngoặc kép thẳng;
//  - kho lớp 4, 5: tên riêng có ≥ 3 cách viết sai, câu thường không có từ xưng gọi người,
//    chủ ngữ / vị ngữ / trạng ngữ là đoạn trong câu, mỗi từ đồng nghĩa ở một nhóm, câu đa nghĩa
//    chứa đúng từ, từ liên kết nằm ở câu sau, câu ghép / câu đơn không trùng;
//  - mọi chủ đề, mọi tổ hợp số câu 10/15/20 × 200 seed: đúng số câu, toàn trắc nghiệm, lựa
//    chọn không trùng, đáp án nằm trong lựa chọn và chấm đúng bằng scoreAnswer, không lặp câu,
//    cùng seed ra cùng phiếu; HTML in được có đủ câu và trang đáp án.

import { buildWorksheetQuestions } from "../lib/mathGen";
import { buildWorksheetHtml } from "../lib/worksheetExport";
import { TV_SHEET_LESSONS, TV_SHEET_GRADES } from "../lib/tvSheet";
import {
  CAU, DAU_CONG_DUNG, DAU_DIEN, HOI_CAU, HOI_KEYS, KHONG_SO_SANH, SO_SANH, TRAI_GAN, TU_SO_SANH, traiNghia,
} from "../lib/tvGen/lop3";
import { WORD_PAIRS } from "../lib/games3";
import { CAU4, KHONG_NHAN_HOA, NHAN_HOA, TEN, TU_GOI_NGUOI } from "../lib/tvGen/lop4";
import { CAU_DON, CAU_GHEP, DA_NGHIA, DAI_TU, DAU_CAU5, DONG_NGHIA, LIEN_KET } from "../lib/tvGen/lop5";
import { DAU_CAU4 } from "../lib/tvGen/lop4";
import { wrongCaps } from "../lib/tvGen/bank";
import { mulberry32 } from "../lib/mathGen/core";
import { scoreAnswer } from "../lib/quizData";
import { rowToQuestion } from "../lib/quickExam";

let errors = 0;
const fail = (msg: string) => { if (errors++ < 40) console.error("✗ " + msg); };

const hasWord = (s: string, w: string) => new RegExp(`(^|[\\s,.!?“”])${w}($|[\\s,.!?“”])`, "iu").test(s);

/* ───────────── Kho lớp 3 ───────────── */

const END: Record<keyof typeof CAU, RegExp> = { ke: /\.$/, hoi: /\?$/, cam: /!$/, khien: /[.!]$/ };
const allCau = Object.values(CAU).flat();
if (new Set(allCau).size !== allCau.length) fail("kiểu câu: có câu trùng");
for (const [k, list] of Object.entries(CAU) as [keyof typeof CAU, string[]][]) {
  if (list.length < 4) fail(`kiểu câu ${k}: dưới 4 câu`);
  for (const s of list) if (!END[k].test(s)) fail(`kiểu câu ${k}: “${s}” sai dấu cuối câu`);
}
for (const s of CAU.khien) if (!/\b(hãy|đừng|mời)\b/iu.test(s) && !/(hãy|đừng|Mời|mời)/u.test(s)) fail(`câu khiến “${s}” thiếu hãy/đừng/mời`);
for (const s of CAU.hoi) if (/(hãy|đừng)/u.test(s)) fail(`câu hỏi “${s}” có từ cầu khiến`);

for (const e of SO_SANH) {
  if (!e.s.includes(e.a)) fail(`so sánh: “${e.s}” không chứa “${e.a}”`);
  if (!e.s.includes(` ${e.tu} `)) fail(`so sánh: “${e.s}” không chứa từ “${e.tu}”`);
  if (!e.s.includes(e.b)) fail(`so sánh: “${e.s}” không chứa “${e.b}”`);
  const others = TU_SO_SANH.filter((w) => !e.tu.split(" ").includes(w));
  for (const w of others) if (hasWord(e.s, w)) fail(`so sánh: “${e.s}” có thêm từ so sánh “${w}”`);
}
if (new Set(SO_SANH.map((e) => e.b)).size !== SO_SANH.length) fail("so sánh: hai câu cùng vế b");
for (const s of KHONG_SO_SANH) for (const w of TU_SO_SANH) if (hasWord(s, w)) fail(`câu thường “${s}” có từ so sánh “${w}”`);

for (const e of HOI_CAU) {
  const parts = [e.ai, e.lam, ...HOI_KEYS.map((k) => e[k]).filter((x): x is string => !!x)];
  if (parts.length < 3) fail(`Khi nào/Ở đâu: “${e.s}” không có bộ phận được hỏi`);
  for (const p of parts) if (!e.s.includes(p)) fail(`Khi nào/Ở đâu: “${e.s}” không chứa “${p}”`);
  if (new Set(parts).size !== parts.length) fail(`Khi nào/Ở đâu: “${e.s}” có hai bộ phận trùng`);
  if (e.bang && !e.bang.startsWith("bằng ")) fail(`Bằng gì: “${e.bang}” phải bắt đầu bằng “bằng”`);
  if (e.de && !e.de.startsWith("để ")) fail(`Để làm gì: “${e.de}” phải bắt đầu bằng “để”`);
}
for (const k of HOI_KEYS) if (HOI_CAU.filter((e) => e[k]).length < 4) fail(`câu hỏi ${k}: dưới 4 câu`);

for (const e of [...DAU_DIEN, ...DAU_CONG_DUNG]) {
  if (e.wrong.includes(e.dau)) fail(`dấu câu: “${e.s}” — đáp án nằm trong nhiễu`);
  if (new Set(e.wrong).size !== e.wrong.length || e.wrong.length < 3) fail(`dấu câu: “${e.s}” — nhiễu trùng hoặc thiếu`);
}
for (const e of DAU_DIEN) if ((e.s.match(/□/g) ?? []).length !== 1) fail(`dấu câu: “${e.s}” phải có đúng một ô □`);

const trai = WORD_PAIRS["trai-nghia"];
for (const g of TRAI_GAN) for (const w of g) if (!trai.some((p) => p[0] === w)) fail(`TRAI_GAN: “${w}” không là từ đầu của cặp trái nghĩa nào`);
// Câu trái nghĩa: nhiễu không được là từ của cặp gần nghĩa.
for (let i = 0; i < 3000; i++) {
  const rng = mulberry32(i + 1);
  const d = traiNghia(rng);
  if (d.type !== "multiple_choice") continue;
  const w = d.question.match(/“(.+)”/)![1];
  const g = TRAI_GAN.find((x) => trai.some((p) => x.includes(p[0]) && p.includes(w)));
  if (!g) continue;
  const near = trai.filter((p) => g.includes(p[0])).flat();
  const right = d.options.find((o) => o.id === d.answer)!.text;
  for (const o of d.options) if (o.text !== right && near.includes(o.text)) fail(`trái nghĩa “${w}”: nhiễu “${o.text}” thuộc nhóm gần nghĩa`);
}

const texts = [...allCau, ...SO_SANH.map((e) => e.s), ...KHONG_SO_SANH, ...HOI_CAU.map((e) => e.s),
  ...DAU_DIEN.map((e) => e.s), ...DAU_CONG_DUNG.map((e) => e.s + e.why)];
for (const t of texts) if (/"/.test(t)) fail(`ngoặc kép thẳng: “${t}”`);

/* ───────────── Kho lớp 4 ───────────── */

for (const [k, list] of Object.entries(TEN)) for (const n of list) {
  const w = wrongCaps(n);
  if (w.length < 3) fail(`viết hoa ${k}: “${n}” chỉ có ${w.length} cách viết sai`);
  if (w.includes(n)) fail(`viết hoa ${k}: “${n}” nằm trong cách viết sai`);
}
for (const e of NHAN_HOA) {
  if (!e.s.toLocaleLowerCase("vi").includes(e.vat)) fail(`nhân hoá: “${e.s}” không chứa “${e.vat}”`);
  for (const k of e.khac) if (!e.s.includes(k)) fail(`nhân hoá: “${e.s}” không chứa “${k}”`);
}
for (const s of KHONG_NHAN_HOA) for (const w of TU_GOI_NGUOI) if (hasWord(s, w)) fail(`câu thường “${s}” có từ “${w}”`);
for (const e of CAU4) {
  for (const p of [e.cn, e.vn, e.tn, e.x]) if (p && !e.s.includes(p)) fail(`chủ – vị: “${e.s}” không chứa “${p}”`);
  if (!e.s.includes(`${e.cn} ${e.vn}`)) fail(`chủ – vị: “${e.s}” — chủ ngữ phải đứng liền trước vị ngữ`);
  if (e.tn && !e.s.startsWith(`${e.tn}, `)) fail(`trạng ngữ: “${e.s}” phải bắt đầu bằng “${e.tn}, ”`);
  if (!!e.tn !== !!e.loai) fail(`trạng ngữ: “${e.s}” thiếu loại hoặc thiếu trạng ngữ`);
}

/* ───────────── Kho lớp 5 ───────────── */

const dn = DONG_NGHIA.flat();
if (new Set(dn).size !== dn.length) fail("đồng nghĩa: một từ ở hai nhóm");
for (const e of DA_NGHIA) for (const s of [...e.goc, ...e.chuyen]) if (!hasWord(s, e.tu)) fail(`đa nghĩa: “${s}” không có từ “${e.tu}”`);
for (const e of LIEN_KET) {
  const [, second] = e.d.split(/(?<=\.) /);
  if (!second?.startsWith(e.tu)) fail(`liên kết: “${e.d}” — câu sau phải bắt đầu bằng “${e.tu}”`);
}
if (new Set([...CAU_GHEP, ...CAU_DON]).size !== CAU_GHEP.length + CAU_DON.length) fail("câu ghép / câu đơn trùng");
for (const it of [...DAI_TU, ...DAU_CAU4, ...DAU_CAU5]) {
  if (it.options.filter((o) => o === it.answer).length !== 1) fail(`câu viết sẵn: “${it.q}” — đáp án không đúng một lần`);
  if (new Set(it.options).size !== it.options.length) fail(`câu viết sẵn: “${it.q}” — lựa chọn trùng`);
}
for (const t of [...NHAN_HOA.map((e) => e.s), ...KHONG_NHAN_HOA, ...CAU4.map((e) => e.s), ...DA_NGHIA.flatMap((e) => [...e.goc, ...e.chuyen]),
  ...LIEN_KET.map((e) => e.d), ...CAU_GHEP, ...CAU_DON, ...[...DAI_TU, ...DAU_CAU4, ...DAU_CAU5].map((e) => e.q + e.explain)]) {
  if (/"/.test(t)) fail(`ngoặc kép thẳng: “${t}”`);
}

/* ───────────── Mọi chủ đề ───────────── */

if (new Set(TV_SHEET_LESSONS.map((l) => l.id)).size !== TV_SHEET_LESSONS.length) fail("chủ đề trùng id");
if (TV_SHEET_GRADES.join(",") !== "1,2,3,4,5") fail(`lớp có phiếu: ${TV_SHEET_GRADES.join(",")}`);

let sheets = 0;
for (const spec of TV_SHEET_LESSONS) {
  for (const total of [10, 15, 20]) {
    for (let s = 0; s < 200; s++) {
      const seed = `s${s}`;
      const rows = buildWorksheetQuestions([spec], total, seed);
      sheets++;
      if (rows.length !== total) fail(`${spec.id} (${total} câu): ra ${rows.length} câu`);
      const keys = rows.map((r) => r.content + "\u0000" + r.options.join("\u0000"));
      if (new Set(keys).size !== keys.length && s < 5) {
        // Kho nhỏ có thể hết câu khác nhau ở phiếu 20 câu; chỉ báo lỗi khi phiếu 10 câu đã lặp.
        if (total === 10) fail(`${spec.id} (seed ${seed}): lặp câu`);
      }
      for (const row of rows) {
        if (row.type !== "mcq") fail(`${spec.id}: câu không phải trắc nghiệm`);
        if (row.options.length < 2 || new Set(row.options).size !== row.options.length) fail(`${spec.id}: “${row.content}” lựa chọn trùng/thiếu`);
        if (!row.options.includes(row.correct_answer)) fail(`${spec.id}: “${row.content}” đáp án không nằm trong lựa chọn`);
        if (!scoreAnswer(rowToQuestion(row, 1), row.correct_answer)) fail(`${spec.id}: “${row.content}” chấm sai đáp án đúng`);
        if (/undefined|NaN/.test(row.content + row.options.join(""))) fail(`${spec.id}: “${row.content}” có undefined`);
      }
      if (s === 0) {
        const again = buildWorksheetQuestions([spec], total, seed);
        if (JSON.stringify(again) !== JSON.stringify(rows)) fail(`${spec.id}: cùng seed ra phiếu khác`);
      }
    }
  }
  // Phiếu 10 câu: nhiều seed thì gần như không lặp câu trong một phiếu.
  let dup = 0;
  for (let s = 0; s < 300; s++) {
    const rows = buildWorksheetQuestions([spec], 10, `d${s}`);
    if (new Set(rows.map((r) => r.content + r.options.join())).size !== rows.length) dup++;
  }
  if (dup > 6) fail(`${spec.id}: ${dup}/300 phiếu 10 câu có câu lặp`);
  // Phiếu 20 câu: kho đủ lớn (hoặc mượn được dạng khác) để không in lặp.
  let dup20 = 0;
  for (let s = 0; s < 100; s++) {
    const rows = buildWorksheetQuestions([spec], 20, `e${s}`);
    if (new Set(rows.map((r) => r.content + r.options.join())).size !== rows.length) dup20++;
  }
  if (dup20 > 5) fail(`${spec.id}: ${dup20}/100 phiếu 20 câu có câu lặp`);
}

// Nhiều chủ đề một lúc + HTML in.
for (const g of TV_SHEET_GRADES) {
  const specs = TV_SHEET_LESSONS.filter((l) => l.grade === g);
  const rows = buildWorksheetQuestions(specs, 20, "tron");
  if (rows.length !== 20) fail(`lớp ${g}: trộn mọi chủ đề ra ${rows.length} câu`);
  const html = buildWorksheetHtml([{ label: "", rows }], { title: `Phiếu bài tập Tiếng Việt lớp ${g}`, topics: specs.map((s) => s.title), grade: g, answers: "solutions" });
  if (!html.includes("Câu 20.")) fail(`lớp ${g}: HTML thiếu câu 20`);
  if (!html.includes("ĐÁP ÁN VÀ LỜI GIẢI")) fail(`lớp ${g}: HTML thiếu trang đáp án`);
  if (html.includes("Tự luận")) fail(`lớp ${g}: phiếu Tiếng Việt không có phần tự luận`);
}

if (errors) {
  console.error(`\n✗ ${errors} lỗi`);
  process.exit(1);
}
console.log(`✓ Phiếu Tiếng Việt: ${TV_SHEET_LESSONS.length} chủ đề, ${sheets} phiếu đều hợp lệ`);
