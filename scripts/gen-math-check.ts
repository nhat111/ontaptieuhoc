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
import { LOP1, LOP2, LOP3, LOP4, LOP5, KNTT1, KNTT3, toQuestionRow, type Draft, type Generator } from "../lib/mathGen";
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
  l: 1, ml: 1e-3,
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
    m = q.match(new RegExp(`^Chọn dấu thích hợp: ${N} × ${N} ___ ${N} × ${N}$`));
    if (m) {
      const [a, b] = [num(m[1]) * num(m[2]), num(m[3]) * num(m[4])];
      if ((a > b ? ">" : a < b ? "<" : "=") !== correct.text) return `so sánh tích sai: ${q} → ${correct.text}`;
    }
    m = q.match(new RegExp(`^Số nào nhân với ${N} thì được ${N}\\?$`));
    if (m && num(correct.text) * num(m[1]) !== num(m[2])) return `tìm thừa số sai: ${q} → ${correct.text}`;
    if (m && texts.some((t) => t !== correct.text && num(t) * num(m![1]) === num(m![2]))) return "nhiễu cũng đúng";
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
    m = q.match(new RegExp(`^${N} × ${N} ([+\\-]) ${N} = ___$`));
    if (m && calc(num(m[1]) * num(m[2]), m[3], num(m[4])) !== num(ans)) return `biểu thức sai: ${q} → ${ans}`;
    m = q.match(/xếp thành (\d+) hàng, mỗi hàng (\d+) bạn\. Sau đó có thêm (\d+) bạn/);
    if (m && +m[1] * +m[2] + +m[3] !== num(ans)) return `lời văn 2 bước sai: ${q}`;
    m = q.match(/có (\d+) hộp, mỗi hộp (\d+) .+? cho bạn (\d+) /);
    if (m && +m[1] * +m[2] - +m[3] !== num(ans)) return `lời văn 2 bước (còn lại) sai: ${q}`;
    m = q.match(/^Mỗi \S+ có (\d+) .+?\. Hỏi (\d+) /);
    if (m && +m[1] * +m[2] !== num(ans)) return `lời văn nhân sai: ${q}`;
    m = q.match(/^Mỗi tuần lễ có 7 ngày\. Hỏi (\d+) tuần/);
    if (m && 7 * +m[1] !== num(ans)) return "tuần lễ sai";
    m = q.match(/^Có (\d+) .+?(?:chia đều cho|mỗi \S+) (\d+) /);
    if (m && +m[1] / +m[2] !== num(ans)) return `lời văn chia sai: ${q}`;
    m = q.match(new RegExp(`^___ \\+ ${N} = ${N}$`));
    if (m && num(ans) + num(m[1]) !== num(m[2])) return "tìm số hạng sai";
    m = q.match(new RegExp(`^${N} ([+\\-×]) ___ = ${N}$`));
    if (m && !close(calc(num(m[1]), m[2], num(ans)), num(m[3]))) return "tìm số sai";
    m = q.match(new RegExp(`^${N} (\\S+) = ___ (\\S+)$`));
    if (m && UNITS[m[2]] && UNITS[m[3]] && !close((num(m[1]) * UNITS[m[2]]) / UNITS[m[3]], num(ans))) return `đổi đơn vị sai: ${q} → ${ans}`;
    m = q.match(new RegExp(`^${N} (\\S+) ${N} (\\S+) = ___ (\\S+)$`));
    if (m && UNITS[m[2]] && UNITS[m[4]] && UNITS[m[5]] && !close((num(m[1]) * UNITS[m[2]] + num(m[3]) * UNITS[m[4]]) / UNITS[m[5]], num(ans))) return `đổi đơn vị hỗn hợp sai: ${q}`;
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

  const l4 = checkLop4(ex) ?? checkLop3(ex);
  if (l4) return l4;

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

/* ───── Lớp 4: số nhiều chữ số, tổng – hiệu, trung bình cộng, phân số, đơn vị đo ───── */

const HANG4 = ["hàng đơn vị", "hàng chục", "hàng trăm", "hàng nghìn", "hàng chục nghìn", "hàng trăm nghìn",
  "hàng triệu", "hàng chục triệu", "hàng trăm triệu"];
const LOP4N = ["lớp đơn vị", "lớp nghìn", "lớp triệu"];
const gcdN = (a: number, b: number): number => (b === 0 ? a : gcdN(b, a % b));
const F = String.raw`(\d+)\/(\d+)`;
/** "3/4" → giá trị; "2" → 2; null nếu không phải phân số. */
const frac = (s: string): [number, number] | null => {
  const m = s.trim().match(/^(\d+)(?:\/(\d+))?$/);
  return m ? [+m[1], m[2] ? +m[2] : 1] : null;
};
const fracEq = (a: [number, number], b: [number, number]) => a[0] * b[1] === b[0] * a[1];
const isSimplest = (f: [number, number]) => gcdN(f[0], f[1]) === 1;
/** Đánh giá biểu thức chỉ có số, + - × : và ngoặc (số theo kiểu Việt Nam). */
function evalExpr(s: string): number {
  const js = s.replace(/\d[\d.]*/g, (t) => String(num(t))).replace(/×/g, "*").replace(/:/g, "/");
  if (!/^[\d\s+\-*/()]+$/.test(js)) throw new Error("biểu thức lạ: " + s);
  return Function(`"use strict"; return (${js});`)() as number;
}
/** Vị trí (0 = đơn vị) của chữ số d trong n; -1 nếu không có hoặc xuất hiện nhiều lần. */
function digitPos(n: number, d: number): number {
  const s = String(n);
  if (s.indexOf(String(d)) !== s.lastIndexOf(String(d))) return -1;
  const i = s.indexOf(String(d));
  return i < 0 ? -1 : s.length - 1 - i;
}

function checkLop4(ex: Draft): string | null {
  const q = ex.question;
  if (ex.type === "multiple_choice") {
    const texts = ex.options.map((o) => o.text);
    const correct = ex.options.find((o) => o.id === ex.answer)!.text;
    let m = q.match(new RegExp(`^Trong số (\\d[\\d.]*), chữ số (\\d) thuộc (hàng|lớp) nào\\?$`));
    if (m) {
      const pos = digitPos(num(m[1]), +m[2]);
      if (pos < 0) return `chữ số không duy nhất: ${q}`;
      if (correct !== (m[3] === "hàng" ? HANG4[pos] : LOP4N[Math.floor(pos / 3)])) return `hàng/lớp sai: ${q} → ${correct}`;
    }
    m = q.match(new RegExp(`^Làm tròn số ${N} đến (hàng (?:chục |trăm )?nghìn) thì được số nào\\?$`));
    if (m) {
      const p = { "hàng nghìn": 3, "hàng chục nghìn": 4, "hàng trăm nghìn": 5 }[m[2]]!;
      const want = Math.round(num(m[1]) / 10 ** p) * 10 ** p;
      if (num(correct) !== want) return `làm tròn sai: ${q} → ${correct}`;
    }
    m = q.match(new RegExp(`^Chọn dấu thích hợp: ${F} ___ ${F}$`));
    if (m) {
      const [a, b] = [+m[1] / +m[2], +m[3] / +m[4]];
      if ((+m[1] * +m[4] > +m[3] * +m[2] ? ">" : +m[1] * +m[4] < +m[3] * +m[2] ? "<" : "=") !== correct) return `so sánh phân số sai: ${q} (${a} vs ${b})`;
    }
    m = q.match(new RegExp(`^${F} ([+\\-×:]) ${F} = \\? \\(viết kết quả ở dạng tối giản\\)$`));
    if (m) {
      const [a, b, op, c, d] = [+m[1], +m[2], m[3], +m[4], +m[5]];
      const want: [number, number] = op === "+" ? [a * d + c * b, b * d] : op === "-" ? [a * d - c * b, b * d]
        : op === "×" ? [a * c, b * d] : [a * d, b * c];
      const got = frac(correct);
      if (!got || !fracEq(got, want) || !isSimplest(got)) return `phép tính phân số sai: ${q} → ${correct}`;
      const vals = texts.map(frac);
      if (vals.some((v) => !v)) return "lựa chọn không phải phân số";
      for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++)
        if (fracEq(vals[i]!, vals[j]!)) return `hai lựa chọn bằng nhau: ${texts[i]} = ${texts[j]}`;
    }
    m = q.match(new RegExp(`^Phân số nào bằng phân số ${F}\\?$`));
    if (m) {
      const base: [number, number] = [+m[1], +m[2]];
      const ok = texts.filter((t) => fracEq(frac(t)!, base));
      if (ok.length !== 1 || ok[0] !== correct) return `phân số bằng nhau sai: ${q}`;
    }
    m = q.match(/^Năm (\d+).* thuộc thế kỉ nào\?$/);
    if (m) {
      const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV",
        "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII"];
      if (correct !== roman[Math.ceil(+m[1] / 100)]) return `thế kỉ sai: ${q} → ${correct}`;
    }
  }
  if (ex.type === "fill_blank") {
    const ans = ex.answers[0];
    let m = q.match(new RegExp(`^Giá trị của chữ số (\\d) trong số ${N} là ___$`));
    if (m) {
      const pos = digitPos(num(m[2]), +m[1]);
      if (pos < 0 || num(ans) !== +m[1] * 10 ** pos) return `giá trị chữ số sai: ${q} → ${ans}`;
    }
    m = q.match(new RegExp(`^___ ([+\\-]) ${N} = ${N}$`));
    if (m && (m[1] === "+" ? num(ans) + num(m[2]) : num(ans) - num(m[2])) !== num(m[3])) return `tìm thành phần sai: ${q}`;
    m = q.match(/^Tính bằng cách thuận tiện: (.+) = ___$/);
    if (m && evalExpr(m[1]) !== num(ans)) return `tính thuận tiện sai: ${q}`;
    m = q.match(new RegExp(`^${N} : ${N} = ${N} \\(dư ___\\)$`));
    if (m) {
      const [a, k, qq] = [num(m[1]), num(m[2]), num(m[3])];
      if (Math.floor(a / k) !== qq || a % k !== num(ans) || num(ans) === 0) return `chia có dư sai: ${q}`;
    }
    m = q.match(new RegExp(`tháng thứ nhất \\S+ \\S+ ${N} .+?, tháng thứ hai .+? (ít|nhiều) hơn tháng thứ nhất ${N} `));
    if (m) {
      const [a, d] = [num(m[1]), num(m[3])];
      if (2 * a + (m[2] === "nhiều" ? d : -d) !== num(ans)) return `lời văn cộng trừ sai: ${q}`;
    }
    m = q.match(new RegExp(`^Người ta xếp ${N} .+?, mỗi \\S+ ${N} `));
    if (m && num(m[1]) / num(m[2]) !== num(ans)) return `lời văn chia sai: ${q}`;
    m = q.match(/^Số trung bình cộng của (.+) là ___$/);
    if (m) {
      const xs = m[1].split(/; | và /).map(num);
      if (!close(xs.reduce((s, x) => s + x, 0) / xs.length, num(ans))) return `TBC sai: ${q}`;
    }
    m = q.match(new RegExp(`lần lượt ${N} kg, ${N} kg và ${N} kg gạo`));
    if (m && !close((num(m[1]) + num(m[2]) + num(m[3])) / 3, num(ans))) return "TBC lời văn sai";
    m = q.match(new RegExp(`^Trung bình cộng của hai số là ${N}\\. Một số là ${N}\\. Số kia`));
    if (m && num(m[1]) * 2 - num(m[2]) !== num(ans)) return "TBC ngược sai";
    m = q.match(new RegExp(`^Tổng của hai số là ${N}, hiệu của hai số là ${N}\\. Số (lớn|bé)`));
    if (m && (m[3] === "lớn" ? num(m[1]) + num(m[2]) : num(m[1]) - num(m[2])) / 2 !== num(ans)) return `tổng hiệu sai: ${q}`;
    m = q.match(new RegExp(`trồng được ${N} cây\\. Lớp (\\S+) trồng được nhiều hơn lớp (\\S+) ${N} cây\\. Hỏi lớp (\\S+)`));
    if (m && (m[5] === m[2] ? num(m[1]) + num(m[4]) : num(m[1]) - num(m[4])) / 2 !== num(ans)) return `tổng hiệu (cây) sai: ${q}`;
    m = q.match(/^Tổng số tuổi của mẹ và con là (\d+) tuổi\. Mẹ hơn con (\d+) tuổi\. Hỏi (mẹ|con)/);
    if (m && (m[3] === "mẹ" ? +m[1] + +m[2] : +m[1] - +m[2]) / 2 !== num(ans)) return "tổng hiệu (tuổi) sai";
    m = q.match(new RegExp(`^Rút gọn phân số ${F} thành phân số tối giản`));
    if (m) {
      const got = frac(ans);
      if (!got || !isSimplest(got) || !fracEq(got, [+m[1], +m[2]]) || got[1] === 1) return `rút gọn sai: ${q} → ${ans}`;
    }
    m = q.match(/^(\d+) phút(?: (\d+) giây)? = ___ giây$/);
    if (m && +m[1] * 60 + Number(m[2] ?? 0) !== num(ans)) return "đổi phút → giây sai";
    m = q.match(/^(\d+) thế kỉ = ___ năm$/);
    if (m && +m[1] * 100 !== num(ans)) return "đổi thế kỉ sai";
  }
  return null;
}

/* ───── Lớp 3: gấp/giảm, thành phần nhân chia, biểu thức, số đến 100.000, La Mã, hình, đo lường ───── */

const ROMAN3 = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
/** Đọc số La Mã độc lập với bảng trên (quy tắc trừ: chữ nhỏ đứng trước chữ lớn). */
function fromRoman(s: string): number {
  const v: Record<string, number> = { I: 1, V: 5, X: 10 };
  let total = 0;
  for (let i = 0; i < s.length; i++) total += v[s[i]] < (v[s[i + 1]] ?? 0) ? -v[s[i]] : v[s[i]];
  return total;
}
const MONTH_DAYS: Record<number, number> = { 1: 31, 3: 31, 4: 30, 5: 31, 6: 30, 7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31 };
const ROUND_P: Record<string, number> = { "hàng chục": 1, "hàng trăm": 2, "hàng nghìn": 3, "hàng chục nghìn": 4, "hàng trăm nghìn": 5 };

function checkLop3(ex: Draft): string | null {
  const q = ex.question;
  if (ex.type === "multiple_choice") {
    const texts = ex.options.map((o) => o.text);
    const correct = ex.options.find((o) => o.id === ex.answer)!.text;
    let m = q.match(new RegExp(`^Làm tròn số ${N} đến (hàng [^ ]+(?: nghìn)?) thì được số nào\\?$`));
    if (m && ROUND_P[m[2]] !== undefined) {
      const p = ROUND_P[m[2]];
      if (num(correct) !== Math.round(num(m[1]) / 10 ** p) * 10 ** p) return `làm tròn sai: ${q} → ${correct}`;
    }
    m = q.match(/^Gấp (\d+) lên (\d+) lần được số nào\?$/);
    if (m && num(correct) !== +m[1] * +m[2]) return `gấp lên sai: ${q}`;
    m = q.match(/^Số La Mã ([IVX]+) đọc là số nào\?$/);
    if (m && num(correct) !== fromRoman(m[1])) return `đọc La Mã sai: ${q} → ${correct}`;
    m = q.match(/^Số (\d+) viết bằng chữ số La Mã là:$/);
    if (m) {
      if (fromRoman(correct) !== +m[1]) return `viết La Mã sai: ${q} → ${correct}`;
      if (texts.some((t) => !ROMAN3.includes(t))) return `lựa chọn không phải số La Mã chuẩn: ${texts.join(", ")}`;
    }
    m = q.match(/^Tháng (\d+) có bao nhiêu ngày\?$/);
    if (m && correct !== `${MONTH_DAYS[+m[1]]} ngày`) return `số ngày trong tháng sai: ${q} → ${correct}`;
  }
  if (ex.type === "fill_blank") {
    const ans = num(ex.answers[0]);
    let m = q.match(/^Gấp (\d+) lên (\d+) lần được ___$/);
    if (m && ans !== +m[1] * +m[2]) return `gấp lên sai: ${q}`;
    m = q.match(/^Giảm (\d+) đi (\d+) lần được ___$/);
    if (m && ans * +m[2] !== +m[1]) return `giảm đi sai: ${q}`;
    m = q.match(/^Số (\d+) gấp số (\d+) bao nhiêu lần\?/);
    if (m && ans * +m[2] !== +m[1]) return `gấp mấy lần sai: ${q}`;
    m = q.match(/ có (\d+) .+?\. Số .+? gấp (\d+) lần số /);
    if (m && ans !== +m[1] * +m[2]) return `lời văn gấp sai: ${q}`;
    m = q.match(/ có (\d+) .+?\. Số .+? giảm đi (\d+) lần\./);
    if (m && ans * +m[2] !== +m[1]) return `lời văn giảm sai: ${q}`;
    m = q.match(/^___ × (\d+) = (\d+)$/);
    if (m && ans * +m[1] !== +m[2]) return `tìm thừa số sai: ${q}`;
    m = q.match(/^___ : (\d+) = (\d+)$/);
    if (m && ans / +m[1] !== +m[2]) return `tìm số bị chia sai: ${q}`;
    m = q.match(/^(\d+) : ___ = (\d+)$/);
    if (m && +m[1] / ans !== +m[2]) return `tìm số chia sai: ${q}`;
    m = q.match(/^Tính giá trị biểu thức: (.+) = ___$/);
    if (m && evalExpr(m[1]) !== ans) return `biểu thức sai: ${q} → ${ans}`;
    m = q.match(/^1\/(\d+) của (\d+) /);
    if (m && ans * +m[1] !== +m[2]) return `một phần mấy sai: ${q}`;
    m = q.match(/^Viết số gồm (.+): ___$/);
    if (m) {
      const place: Record<string, number> = { "chục nghìn": 1e4, "nghìn": 1e3, "trăm": 100, "chục": 10, "đơn vị": 1 };
      let total = 0;
      for (const part of m[1].split(/, | và /)) {
        const p = part.match(/^(\d) (chục nghìn|nghìn|trăm|chục|đơn vị)$/);
        if (!p) return `không đọc được "${part}"`;
        total += +p[1] * place[p[2]];
      }
      if (total !== ans) return `viết số sai: ${q} → ${ans}`;
    }
    m = q.match(new RegExp(`^Số liền (sau|trước) của số ${N} là ___$`));
    if (m && ans !== num(m[2]) + (m[1] === "sau" ? 1 : -1)) return `liền trước/sau sai: ${q}`;
    m = q.match(/^Hình vuông có cạnh (\d+) cm\. (Chu vi|Diện tích)/);
    if (m && ans !== (m[2] === "Chu vi" ? +m[1] * 4 : (+m[1]) ** 2)) return `hình vuông sai: ${q}`;
    m = q.match(/^Hình chữ nhật có chiều dài (\d+) cm, chiều rộng (\d+) cm\. (Chu vi|Diện tích)/);
    if (m) {
      if (+m[1] <= +m[2]) return "chiều dài phải lớn hơn chiều rộng";
      if (ans !== (m[3] === "Chu vi" ? (+m[1] + +m[2]) * 2 : +m[1] * +m[2])) return `hình chữ nhật sai: ${q}`;
    }
    m = q.match(new RegExp(`có ${N} đồng, mua .+? giá ${N} đồng\\. Hỏi`));
    if (m && ans !== num(m[1]) - num(m[2])) return `tiền còn lại sai: ${q}`;
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
for (const [grade, gens] of Object.entries({ LOP1, LOP2, LOP3, LOP4, LOP5, KNTT1, KNTT3 }) as [string, Record<string, Generator>][]) {
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
