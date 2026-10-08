// scripts/gen-math-check.ts — kiểm tra bộ sinh đề Toán (lib/mathGen) trước khi import.
//
// Mỗi dạng bài chạy 3000 lần. Với từng câu:
//   1. Tính lại đáp án bằng code độc lập (không dùng lại hàm của generator).
//   2. Chuyển sang dòng DB rồi chấm thử bằng đúng `scoreAnswer` của trang quiz:
//      bé gõ/chọn đáp án đúng (kể cả "5.000", "5000", "3,5", "3.5") phải được tính đúng,
//      chọn đáp án khác phải bị tính sai.
//
// Chạy: npx tsx scripts/gen-math-check.ts

import { mulberry32 } from "../lib/mathGen/core";
import { LOP1, LOP2, LOP5, toQuestionRow, type Draft, type Generator } from "../lib/mathGen";
import { scoreAnswer, type Question } from "../lib/quizData";

const RUNS = 3000;
const num = (s: string) => Number(s.trim().replace(/\./g, "").replace(",", "."));
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const calc = (a: number, op: string, b: number) =>
  op === "+" ? a + b : op === "-" ? a - b : op === "×" ? a * b : a / b;
const N = String.raw`(\d[\d.]*(?:,\d+)?)`;

const UNITS: Record<string, number> = {
  km: 1e3, hm: 1e2, dam: 10, m: 1, dm: 0.1, cm: 0.01, mm: 0.001,
  "tấn": 1e6, "tạ": 1e5, "yến": 1e4, kg: 1e3, hg: 100, dag: 10, g: 1,
  "km²": 1e6, ha: 1e4, "dam²": 100, "m²": 1, "dm²": 1e-2, "cm²": 1e-4, "mm²": 1e-6,
  "m³": 1, "dm³": 1e-3, "cm³": 1e-6,
};

/** Kiểm tra toán học trên câu thô. Trả về mô tả lỗi hoặc null. */
function checkMath(ex: Draft): string | null {
  if (/undefined|NaN|Infinity|\[object/.test(JSON.stringify(ex))) return "chuỗi lỗi undefined/NaN";
  if (!ex.explanation) return "thiếu lời giải";
  const q = ex.question;

  if (ex.type === "multiple_choice") {
    const texts = ex.options.map((o) => o.text);
    if (new Set(texts).size !== texts.length) return "đáp án trùng nhau";
    const correct = ex.options.find((o) => o.id === ex.answer);
    if (!correct) return "answer không nằm trong options";
    let m = q.match(new RegExp(`^Chọn dấu thích hợp: ${N} ___ ${N}$`));
    if (m) {
      const [a, b] = [num(m[1]), num(m[2])];
      if ((a > b ? ">" : a < b ? "<" : "=") !== correct.text) return `so sánh sai: ${q} → ${correct.text}`;
    }
    m = q.match(/^Số liền (sau|trước) của (\d+)/);
    if (m && num(correct.text) !== Number(m[2]) + (m[1] === "sau" ? 1 : -1)) return "liền trước/sau sai";
    m = q.match(/^Có mấy .*?\?\s+(.+)$/u);
    if (m && [...new Intl.Segmenter().segment(m[1])].length !== num(correct.text)) return "đếm hình sai";
    // số đo thời gian (trắc nghiệm)
    const toMin = (s: string) => { const t = s.match(/^(\d+) giờ (\d+) phút$/)!; return +t[1] * 60 + +t[2]; };
    m = q.match(/^(\d+) giờ (\d+) phút ([+\-]) (\d+) giờ (\d+) phút = \?$/);
    if (m) {
      const x = +m[1] * 60 + +m[2], y = +m[4] * 60 + +m[5];
      if (toMin(correct.text) !== (m[3] === "+" ? x + y : x - y)) return "cộng/trừ thời gian sai";
    }
    m = q.match(/^(\d+) giờ (\d+) phút × (\d+) = \?$/);
    if (m && toMin(correct.text) !== (+m[1] * 60 + +m[2]) * +m[3]) return "nhân thời gian sai";
    if (/giờ \d+ phút [+\-×]/.test(q)) {
      // không có đáp án nhiễu nào bằng giá trị đáp án đúng
      const vals = texts.map(toMin);
      if (new Set(vals).size !== vals.length) return "đáp án nhiễu bằng giá trị đáp án đúng";
      if (texts.some((t) => +t.match(/(\d+) phút/)![1] >= 60)) return "số phút ≥ 60";
    }
  }

  if (ex.type === "fill_blank") {
    const n = (q.match(/___/g) ?? []).length;
    if (n !== 1 || ex.answers.length !== 1) return `phải có đúng 1 chỗ trống (có ${n}, ${ex.answers.length} đáp án)`;
    const ans = ex.answers[0];
    if (ans === "" || ans.startsWith("-")) return "đáp án rỗng hoặc âm";
    let m = q.match(new RegExp(`^${N}(?: \\S+)? ([+\\-×:]) ${N}(?: \\S+)? = ___`));
    if (m && !/giờ|phút/.test(q)) {
      const want = calc(num(m[1]), m[2], num(m[3]));
      if (!close(want, num(ans))) return `tính sai: ${q} → ${ans} (đúng: ${want})`;
    }
    m = q.match(new RegExp(`^___ \\+ ${N} = ${N}$`));
    if (m && num(ans) + num(m[1]) !== num(m[2])) return "tìm số hạng sai";
    m = q.match(new RegExp(`^${N} ([+\\-×]) ___ = ${N}$`));
    if (m && !close(calc(num(m[1]), m[2], num(ans)), num(m[3]))) return "tìm số sai";
    m = q.match(new RegExp(`^${N} (\\S+) = ___ (\\S+)$`));
    if (m && UNITS[m[2]] && UNITS[m[3]] && !close((num(m[1]) * UNITS[m[2]]) / UNITS[m[3]], num(ans))) return `đổi đơn vị sai: ${q} → ${ans}`;
    m = q.match(new RegExp(`^${N} (\\S+) ${N} (\\S+) = ___ (\\S+)$`));
    if (m && UNITS[m[2]] && UNITS[m[4]] && !close(num(m[1]) + (num(m[3]) * UNITS[m[4]]) / UNITS[m[2]], num(ans))) return `đổi đơn vị hỗn hợp sai: ${q}`;
    m = q.match(new RegExp(`vận tốc ${N} km/giờ trong (.+?)\\. Quãng`));
    if (m) {
      const t = m[2].match(/(?:(\d+) giờ)? ?(?:(\d+) phút)?/)!;
      if (!close(num(m[1]) * (Number(t[1] ?? 0) + Number(t[2] ?? 0) / 60), num(ans))) return `quãng đường sai: ${q}`;
    }
    m = q.match(new RegExp(`quãng đường ${N} km hết (.+?)\\. Vận tốc`));
    if (m) {
      const t = m[2].match(/(?:(\d+) giờ)? ?(?:(\d+) phút)?/)!;
      if (!close(num(m[1]) / (Number(t[1] ?? 0) + Number(t[2] ?? 0) / 60), num(ans))) return "vận tốc sai";
    }
    m = q.match(new RegExp(`quãng đường ${N} km với vận tốc ${N} km/giờ`));
    if (m && !close(num(m[1]) / num(m[2]), num(ans))) return "thời gian sai";
    m = q.match(new RegExp(`^${N}% của ${N} là ___`));
    if (m && !close((num(m[1]) * num(m[2])) / 100, num(ans))) return "giá trị % sai";
    m = q.match(new RegExp(`^Tỉ số phần trăm của ${N} và ${N}`));
    if (m && !close((num(m[1]) / num(m[2])) * 100, num(ans))) return "tỉ số % sai";
    m = q.match(new RegExp(`có ${N} học sinh, trong đó có ${N} học sinh nữ`));
    if (m && !close((num(m[2]) / num(m[1])) * 100, num(ans))) return "% học sinh nữ sai";
    m = q.match(new RegExp(`biết ${N}% của số đó là ${N}`));
    if (m && !close((num(m[2]) * 100) / num(m[1]), num(ans))) return "tìm số từ % sai";
    m = q.match(new RegExp(`đáy ${N} \\S+, chiều cao ${N} \\S+\\. Diện tích hình tam giác`));
    if (m && !close((num(m[1]) * num(m[2])) / 2, num(ans))) return "S tam giác sai";
    m = q.match(new RegExp(`hai đáy dài ${N} \\S+ và ${N} \\S+, chiều cao ${N}`));
    if (m && !close(((num(m[1]) + num(m[2])) * num(m[3])) / 2, num(ans))) return "S hình thang sai";
    m = q.match(new RegExp(`bán kính ${N}`));
    if (m && !close(num(m[1]) ** 2 * 3.14, num(ans))) return "S hình tròn sai";
    m = q.match(new RegExp(`đường kính ${N}`));
    if (m && !close(num(m[1]) * 3.14, num(ans))) return "C hình tròn sai";
    m = q.match(new RegExp(`dài ${N} \\S+, chiều rộng ${N} \\S+, chiều cao ${N} \\S+\\.`));
    if (m) {
      const [a, b, c] = [num(m[1]), num(m[2]), num(m[3])];
      const want = q.includes("xung quanh") ? (a + b) * 2 * c : q.includes("toàn phần") ? (a + b) * 2 * c + 2 * a * b : a * b * c;
      if (!close(want, num(ans))) return `hình hộp sai: ${q}`;
    }
    m = q.match(new RegExp(`lập phương có cạnh ${N}`));
    if (m) {
      const a = num(m[1]);
      const want = q.includes("xung quanh") ? a * a * 4 : q.includes("toàn phần") ? a * a * 6 : a ** 3;
      if (!close(want, num(ans))) return "hình lập phương sai";
    }
    m = q.match(new RegExp(`^${N} giờ = ___ phút`));
    if (m && !close(num(m[1]) * 60, num(ans))) return "đổi giờ→phút sai";
    m = q.match(/^(\d+) phút = ___ giờ/);
    if (m && !close(+m[1] / 60, num(ans))) return "đổi phút→giờ sai";
    m = q.match(/các số: (.+)\. Trung bình/);
    if (m) {
      const xs = m[1].split("; ").map(num);
      if (!close(xs.reduce((s, x) => s + x, 0) / xs.length, num(ans))) return "TBC sai";
    }
    m = q.match(/hỗn số (\d+) (\d+)\/(\d+)/);
    if (m && ans !== `${+m[1] * +m[3] + +m[2]}/${m[3]}`) return "hỗn số → phân số sai";
    m = q.match(/(\d+)\/(\d+) = (___|\d+) và (___|\d+)\/\d+$/);
    if (m) {
      const [w, r] = [Math.floor(+m[1] / +m[2]), +m[1] % +m[2]];
      if (+(m[3] === "___" ? ans : m[3]) !== w || +(m[4] === "___" ? ans : m[4]) !== r) return "phân số → hỗn số sai";
    }
    m = q.match(/phân số thập phân: (\d+)\/(\d+) = ___\/([\d.]+)/);
    if (m && !close(+m[1] / +m[2], num(ans) / num(m[3]))) return "phân số thập phân sai";
    m = q.match(/^Số (\d+) gồm (.+)\.$/);
    if (m) {
      const n = +m[1];
      const digits: Record<string, number> = { "trăm": Math.floor(n / 100) % 10, "chục": n >= 100 ? Math.floor(n / 10) % 10 : Math.floor(n / 10), "đơn vị": n % 10 };
      for (const part of m[2].split(/, | và /)) {
        const p = part.match(/^(___|\d+) (trăm|chục|đơn vị)$/);
        if (p && +(p[1] === "___" ? ans : p[1]) !== digits[p[2]]) return `phân tích số sai: ${q}`;
      }
    }
  }

  if (ex.type === "ordering") {
    const vals = ex.correctOrder.map((id) => num(ex.items.find((i) => i.id === id)!.content));
    const asc = q.includes("bé đến lớn");
    for (let i = 1; i < vals.length; i++) if (asc ? vals[i] <= vals[i - 1] : vals[i] >= vals[i - 1]) return "sắp xếp sai";
  }

  if (ex.type === "true_false") {
    const m = q.match(new RegExp(`^${N} ([+\\-×]) ${N} = ${N}\\.`));
    if (m && close(calc(num(m[1]), m[2], num(m[3])), num(m[4])) !== ex.answer) return "đúng/sai tính sai";
    const p = q.match(new RegExp(`^${N} = ${N}%\\.`));
    if (p && close(num(p[1]) * 100, num(p[2])) !== ex.answer) return "đúng/sai % sai";
    const c = q.match(new RegExp(`^${N} ([<>]) ${N}\\.`));
    if (c && (c[2] === ">" ? num(c[1]) > num(c[3]) : num(c[1]) < num(c[3])) !== ex.answer) return "đúng/sai so sánh sai";
  }
  return null;
}

/** Chuyển sang dòng DB rồi chấm thử bằng scoreAnswer thật của trang quiz. */
function checkRow(ex: Draft, seed: number): string | null {
  const row = toQuestionRow(ex, mulberry32(seed));
  const q: Question = { id: 0, type: row.type, question: row.content, options: row.options, correctAnswer: row.correct_answer };
  try { JSON.parse(row.explanation); } catch { return "explanation không phải JSON"; }

  if (row.type === "mcq") {
    if (row.options.length < 2 || row.options.length > 6) return "số lựa chọn ngoài 2–6";
    if (new Set(row.options).size !== row.options.length) return "lựa chọn trùng";
    if (!row.options.includes(row.correct_answer)) return "correct_answer không có trong options";
    if (!scoreAnswer(q, row.correct_answer)) return "chọn đúng mà bị chấm sai";
    if (row.options.some((o) => o !== row.correct_answer && scoreAnswer(q, o))) return "chọn sai mà được chấm đúng";
    return null;
  }
  if (ex.type !== "fill_blank") return `kiểu ${ex.type} không được ra ${row.type}`;
  const shown = ex.answers[0];
  const typed = new Set([shown, shown.replace(/\./g, ""), shown.replace(/\./g, "").replace(",", "."), ` ${shown} `]);
  for (const t of typed) if (!scoreAnswer(q, t)) return `gõ "${t}" mà bị chấm sai (${row.type}: ${row.correct_answer})`;
  const wrong = /\d/.test(shown) ? shown.replace(/\d(?=\D*$)/, (d) => String((+d + 1) % 10)) : shown + "x";
  if (scoreAnswer(q, wrong)) return `gõ sai "${wrong}" mà được chấm đúng`;
  return null;
}

let failures = 0, total = 0;
const examples: string[] = [];
for (const [grade, gens] of Object.entries({ LOP1, LOP2, LOP5 }) as [string, Record<string, Generator>][]) {
  for (const [name, gen] of Object.entries(gens)) {
    let bad = 0;
    for (let s = 0; s < RUNS; s++) {
      total++;
      try {
        const ex = gen(mulberry32(s * 7919 + name.length));
        const err = checkMath(ex) ?? checkRow(ex, s);
        if (err) { bad++; if (examples.length < 25) examples.push(`${grade}.${name} seed ${s}: ${err}`); }
      } catch (e) {
        bad++;
        if (examples.length < 25) examples.push(`${grade}.${name} seed ${s}: THROW ${(e as Error).message}`);
      }
    }
    failures += bad;
    console.log(`${bad ? "✗" : "✓"} ${grade}.${name}${bad ? `  (${bad} lỗi)` : ""}`);
  }
}
console.log(`\n${total.toLocaleString("vi-VN")} câu đã kiểm tra, ${failures} lỗi.`);
examples.forEach((e) => console.log("  " + e));
process.exit(failures ? 1 : 0);
