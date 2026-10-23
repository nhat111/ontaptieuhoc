// lib/exam5/toan1to4.ts
// Đề kiểm tra Toán lớp 1–4 theo cấu trúc đề giấy thường gặp (Thông tư 27, chương trình
// GDPT 2018), cùng khuôn với đề lớp 5 (./toan5.ts):
//
//   Lớp 1–2: Phần I 6 câu trắc nghiệm × 0,5 điểm; Phần II: Bài 1 tính (4 ý × 0,5),
//            Bài 2 "Số?" / tính (4 ý × 0,5), Bài 3 bài toán (2 điểm), Bài 4 (1 điểm).
//   Lớp 3–4: Phần I 8 câu trắc nghiệm × 0,5 điểm; Phần II: Bài 1 đặt tính (4 ý × 0,5),
//            Bài 2 (2 ý × 0,5), Bài 3 bài toán có lời văn (2 điểm), Bài 4 (1 điểm).
//
// Tổng 10 điểm. Dùng lại các dạng bài ở lib/mathGen/lop{1..4}.ts, thêm các dạng có hình vẽ
// (./figures.ts: đếm hình, đồng hồ, thước đo, đường gấp khúc, tiền, chu vi – diện tích,
// góc, biểu đồ cột, phân số tô màu) và các dạng tự luận của đề thật. Mọi đáp án do máy
// tính; scripts/exam14-check.ts tính lại từ chữ trong đề và từ hình vẽ.
//
// Lớp 1–3 theo Thông tư 27 chỉ bắt buộc kiểm tra cuối kì, nhưng phụ huynh vẫn hay cho con
// làm đề giữa kì nên vẫn đủ 4 loại đề.

import {
  type Draft, type Generator, type Rng,
  int, pick, chance, retry, shuffle, range, mcOptions, fixedOptions, blanks, fmtInt, sign,
  mulberry32, seedFrom, baiGiai,
} from "../mathGen/core";
import { LOP1, LOP2, LOP3, LOP4, toQuestionRow, type GenQuestionRow } from "../mathGen";
import { NAMES } from "../mathGen/shared";
import type { ExamKind } from "../quickExam";
import type { ExamPaper, PaperGroup, PaperItem, PaperQuestion, Work } from "./paper";
import { asChoice, either, only, prettyRow, thuanTienPhanSo, tinhPhanSo } from "./toan5";
import {
  type FlatShape, type QuadKind,
  angleSvg, barChartSvg, circleSvg, clockFaceSvg, fanTriangleCount, fanTrianglesSvg, flatShapesSvg, fractionSvg,
  groupsSvg, moneySvg, polylineSvg, rectSvg, rulerSvg, shapesRowSvg, stripRectCount, stripRectsSvg,
} from "./figures";

/* ═════════════ Trắc nghiệm từ câu điền số ═════════════ */

/** "1.250" → 1250; null nếu không phải số tự nhiên viết kiểu Việt Nam. */
const readInt = (s: string) => (/^\d{1,3}(\.\d{3})*$/.test(s) ? Number(s.replace(/\./g, "")) : null);

/**
 * Câu điền một số tự nhiên → trắc nghiệm 4 lựa chọn, đáp án nhiễu là lỗi hay gặp của lớp
 * 1–4: lệch 1, lệch một hàng, đảo chữ số; số tròn chục/trăm/nghìn (đổi đơn vị, giá trị chữ
 * số) thì nhầm thừa/thiếu một chữ số 0. Không dời dấu phẩy như lớp 5. Phân số dùng asChoice.
 */
export function intChoice(d: Draft, r: Rng): Draft | null {
  if (d.type !== "fill_blank") return d;
  const a = d.answers[0];
  if (a.includes("/")) return asChoice(d, r);
  const n = readInt(a);
  if (n === null) return null;
  let tz = 1;
  while (n > 0 && n % (tz * 10) === 0 && tz * 10 < n) tz *= 10;
  const cands = tz >= 10
    ? [n * 10, n / 10, n + tz, n - tz, n + 2 * tz]
    : [...(n < 10 ? [1, 2, 3] : n < 100 ? [1, 2, 10] : n < 1000 ? [1, 10, 100] : [1, 10, 100, 1000]).flatMap((s) => [n + s, n - s]),
      n >= 12 && n <= 98 && n % 10 !== 0 ? Number(String(n).split("").reverse().join("")) : -1];
  try {
    return {
      type: "multiple_choice", difficulty: d.difficulty, tags: d.tags,
      question: d.question.replace(/___\.$/, "…").replace("___", "…"),
      image: d.image, explanation: d.explanation, hint: d.hint,
      ...mcOptions(r, fmtInt(n), cands.filter((x) => x >= 0 && x !== n && Number.isInteger(x)).map(fmtInt)),
    };
  } catch { return null; }
}

const choice = (g: Generator): Generator => (r) => retry(() => intChoice(g(r), r));
/** Thêm lời dẫn cho câu đứng một mình ("Tính: " + "6 - 2 + 3 = ___"). */
const lead = (prefix: string, g: Generator): Generator => (r) => { const d = g(r); return { ...d, question: prefix + d.question }; };
const fillOnly = (g: Generator) => only(g, (d) => d.type === "fill_blank");
const has = (re: RegExp) => (d: Draft) => re.test(d.question);

const fill = (question: string, answer: string, explanation: string, tags: string[], image?: string): Draft => ({
  type: "fill_blank", difficulty: "medium", tags, question, ...blanks(answer), explanation, ...(image ? { image } : {}),
});

/** Đáp án nhiễu dạng số có đơn vị ("12 cm"); bỏ số âm, số trùng đáp án đúng. */
function numOptions(r: Rng, correct: number, wrong: number[], unit = "") {
  const u = unit ? ` ${unit}` : "";
  const pool = [...new Set(wrong.filter((x) => x > 0 && x !== correct))];
  for (const x of [correct + 1, correct + 2, correct + 10]) if (pool.length < 3 && !pool.includes(x)) pool.push(x);
  return mcOptions(r, fmtInt(correct) + u, pool.map((x) => fmtInt(x) + u));
}

/* ═════════════ Số, so sánh, dãy số ═════════════ */

export const soLonNhat = (min: number, max: number): Generator => (r) => {
  const set = new Set<number>();
  while (set.size < 4) set.add(int(r, min, max));
  const nums = [...set];
  const big = chance(r, 0.5);
  const ans = big ? Math.max(...nums) : Math.min(...nums);
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["so sánh số"],
    question: `Số ${big ? "lớn" : "bé"} nhất trong các số ${nums.map(fmtInt).join(", ")} là:`,
    ...mcOptions(r, fmtInt(ans), nums.filter((x) => x !== ans).map(fmtInt)),
    explanation: `So sánh các số: ${[...nums].sort((a, b) => a - b).map(fmtInt).join(" < ")}. Số ${big ? "lớn" : "bé"} nhất là ${fmtInt(ans)}.`,
    hint: big ? "Tìm số có nhiều chục nhất." : "Tìm số có ít chục nhất.",
  };
};

/** Dãy 5 số cách đều, trống một số ở giữa: "3, 4, ___, 6, 7". */
export const daySo = (max: number, steps: number[]): Generator => (r) => {
  const step = pick(r, steps);
  const start = int(r, 0, max - step * 4);
  const up = chance(r, 0.7);
  const seq = range(0, 4).map((i) => start + i * step);
  if (!up) seq.reverse();
  const hole = int(r, 1, 3);
  return fill(seq.map((x, i) => (i === hole ? "___" : String(x))).join(", "), String(seq[hole]),
    step === 1
      ? `Đếm ${up ? "thêm" : "lùi"} 1: số cần điền là ${seq[hole]}.`
      : `Mỗi số ${up ? "hơn" : "kém"} số đứng trước ${step} đơn vị: ${seq[hole - 1]} ${up ? "+" : "-"} ${step} = ${seq[hole]}.`,
    ["dãy số"]);
};

/** Chọn dấu: "3 + 4 ___ 8" — tính phép tính trước rồi so sánh. */
const soSanhPhepTinh = (make: (r: Rng) => [string, number]): Generator => (r) => {
  const [expr, v] = make(r);
  const n = Math.max(0, v + pick(r, [-2, -1, 0, 0, 1, 2]));
  const s = sign(v - n);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["so sánh", "phép tính"],
    question: `Chọn dấu thích hợp: ${expr} ___ ${n}`, ...fixedOptions([">", "<", "="], s),
    explanation: `${expr} = ${v}; ${v} ${s} ${n} nên ${expr} ${s} ${n}.`,
    hint: "Tính kết quả phép tính trước rồi mới so sánh.",
  };
};

const soSanhPT10 = soSanhPhepTinh((r) => {
  if (chance(r, 0.5)) { const a = int(r, 1, 8), b = int(r, 1, 10 - a); return [`${a} + ${b}`, a + b]; }
  const a = int(r, 3, 10), b = int(r, 1, a - 1); return [`${a} - ${b}`, a - b];
});
export const soSanhPT20 = soSanhPhepTinh((r) => retry(() => {
  const a = int(r, 2, 9), b = int(r, 2, 9);
  if (a + b <= 10) return null;
  return chance(r, 0.5) ? [`${a} + ${b}`, a + b] : [`${a + b} - ${b}`, a];
}));
const soSanhPT100 = soSanhPhepTinh((r) => retry(() => {
  const a = int(r, 12, 79), b = int(r, 5, 99 - a);
  if ((a % 10) + (b % 10) < 10) return null;
  return chance(r, 0.5) ? [`${a} + ${b}`, a + b] : [`${a + b} - ${b}`, a];
}));

/* ═════════════ Phép tính ═════════════ */

const tinh10 = only(LOP1.congTru10, has(/^\d+ [+-] \d+ = ___$/));
const cong10 = only(LOP1.congTru10, has(/^\d+ \+ \d+ = ___$/));
const thieu10 = only(LOP1.congTru10, has(/___ [+-]|[+-] ___/));
const cong100 = only(LOP1.congTru100, has(/\+/));
const tru100 = only(LOP1.congTru100, has(/ - /));
const cmTinh = only(LOP1.doDaiCm, has(/^\d+ cm [+-] \d+ cm = ___ cm$/));
const cmThuoc = only(LOP1.doDaiCm, has(/^Thước kẻ/));

/** Ba số, tính lần lượt từ trái sang phải; mọi kết quả trung gian trong [0, max]. `unit` = 10 → số tròn chục. */
export const tinh3So = (max: number, unit = 1): Generator => (r) => retry(() => {
  const n = () => int(r, 1, max / unit) * unit;
  const [a, b, c] = [n(), n(), n()];
  const [o1, o2] = [pick(r, ["+", "-"] as const), pick(r, ["+", "-"] as const)];
  const ab = o1 === "+" ? a + b : a - b;
  const res = o2 === "+" ? ab + c : ab - c;
  if (ab < 0 || ab > max || res < 0 || res > max) return null;
  if (unit === 1 && max === 100 && [a, b, c].some((x) => x < 10)) return null;
  return fill(`${a} ${o1} ${b} ${o2} ${c} = ___`, String(res),
    `Tính lần lượt từ trái sang phải: ${a} ${o1} ${b} = ${ab}; ${ab} ${o2} ${c} = ${res}.`, ["tính", "ba số"]);
});

/** Tìm số chưa biết trong phép cộng/trừ có nhớ: "___ + 7 = 15", "62 - ___ = 37". */
export const timSoCoNho = (max: 20 | 100): Generator => (r) => retry(() => {
  const [a, b] = max === 20 ? [int(r, 2, 9), int(r, 2, 9)] : [int(r, 11, 79), int(r, 6, 59)];
  const c = a + b;
  if (c > max || (a % 10) + (b % 10) < 10) return null;
  switch (pick(r, ["soHangDau", "soHangSau", "soTru", "soBiTru"] as const)) {
    case "soHangDau": return fill(`___ + ${b} = ${c}`, String(a), `Lấy tổng trừ số hạng đã biết: ${c} - ${b} = ${a}.`, ["tìm số hạng"]);
    case "soHangSau": return fill(`${a} + ___ = ${c}`, String(b), `Lấy tổng trừ số hạng đã biết: ${c} - ${a} = ${b}.`, ["tìm số hạng"]);
    case "soTru": return fill(`${c} - ___ = ${a}`, String(b), `Lấy số bị trừ trừ đi hiệu: ${c} - ${a} = ${b}.`, ["tìm số trừ"]);
    case "soBiTru": return fill(`___ - ${b} = ${a}`, String(c), `Lấy hiệu cộng với số trừ: ${a} + ${b} = ${c}.`, ["tìm số bị trừ"]);
  }
});

/** Cộng, trừ có nhớ với số đo: "35 kg + 18 kg = ___ kg". */
export const soDoCoNho: Generator = (r) => retry(() => {
  const u = pick(r, ["kg", "l", "cm", "dm"]);
  const a = int(r, 12, 79), b = int(r, 6, 59);
  if (a + b > 100 || (a % 10) + (b % 10) < 10) return null;
  return chance(r, 0.5)
    ? fill(`${a} ${u} + ${b} ${u} = ___ ${u}`, String(a + b), `Cộng như số bình thường rồi ghi đơn vị: ${a} + ${b} = ${a + b} (${u}).`, ["số đo", "có nhớ"])
    : fill(`${a + b} ${u} - ${b} ${u} = ___ ${u}`, String(a), `Trừ như số bình thường rồi ghi đơn vị: ${a + b} - ${b} = ${a} (${u}).`, ["số đo", "có nhớ"]);
});

const congTru20 = LOP2.congTru20;
const cong100c = only(LOP2.congTru100, has(/\+/));
const tru100c = only(LOP2.congTru100, has(/ - /));
const cong1000 = only(LOP2.congTru1000, has(/\+/));
const tru1000 = only(LOP2.congTru1000, has(/ - /));
const thanhPhan = only(LOP2.thanhPhanPhepTinh, has(/Tổng là|Hiệu là/));
const nhanChia25 = only(LOP2.bangNhanChia, has(/^\d+ [×:] \d+ = ___$/));
const thieuNhan = only(LOP2.bangNhanChia, has(/× ___/));
const doiDoDai2 = only(LOP2.donViDo2, has(/^\d+ \w+ = ___ \w+$/));

/** "5 × 4 + 18 = ___" — nhân trước, cộng/trừ sau (bảng 2, 5). */
export const bieuThuc2: Generator = (r) => retry(() => {
  const k = pick(r, [2, 5]), x = int(r, 2, 10), c = int(r, 3, 40);
  const plus = chance(r, 0.6);
  const res = plus ? k * x + c : k * x - c;
  if (res < 0 || res > 100) return null;
  return fill(`${k} × ${x} ${plus ? "+" : "-"} ${c} = ___`, String(res),
    `Tính phép nhân trước: ${k} × ${x} = ${k * x}; rồi ${k * x} ${plus ? "+" : "-"} ${c} = ${res}.`, ["tính", "bảng nhân"]);
});

const nhan3 = only(LOP3.nhanChiaMotChuSo, has(/×/));
const chia3 = only(LOP3.nhanChiaMotChuSo, has(/^\d+ : \d+ = ___$/));
const cong5 = only(LOP3.phepTinh100000, has(/^[\d.]+ \+ /));
const tru5 = only(LOP3.phepTinh100000, has(/^[\d.]+ - /));
const nhan5 = only(LOP3.phepTinh100000, has(/×/));
const chia5 = only(LOP3.phepTinh100000, has(/^[\d.]+ : \d+ = ___$/));
const gapGiamMcq = only(LOP3.gapGiam, (d) => d.type === "multiple_choice");
const doiDonViHK1 = only(LOP3.doiDonVi3, has(/ (mm|g|ml)$/));

/** Biểu thức với số đến 100 000 (lớp 3 học kì II). */
const bieuThucLon: Generator = (r) => {
  const k = int(r, 2, 9);
  switch (pick(r, ["ngoacChia", "nhanTruoc", "ngoacNhan", "chiaTruoc"] as const)) {
    case "ngoacChia": {
      const s = k * int(r, 1000, 9999), a = int(r, 500, s - 500), b = s - a;
      return fill(`(${fmtInt(a)} + ${fmtInt(b)}) : ${k} = ___`, fmtInt(s / k), `Tính trong ngoặc trước: ${fmtInt(a)} + ${fmtInt(b)} = ${fmtInt(s)}; ${fmtInt(s)} : ${k} = ${fmtInt(s / k)}.`, ["biểu thức"]);
    }
    case "nhanTruoc": {
      const b = int(r, 1000, 9000), a = int(r, b * k + 1000, Math.min(99999, b * k + 40000));
      return fill(`${fmtInt(a)} - ${fmtInt(b)} × ${k} = ___`, fmtInt(a - b * k), `Nhân trước, trừ sau: ${fmtInt(b)} × ${k} = ${fmtInt(b * k)}; ${fmtInt(a)} - ${fmtInt(b * k)} = ${fmtInt(a - b * k)}.`, ["biểu thức"]);
    }
    case "ngoacNhan": {
      const d = int(r, 1000, Math.floor(99999 / k)), b = int(r, 1000, 30000), a = b + d;
      return fill(`(${fmtInt(a)} - ${fmtInt(b)}) × ${k} = ___`, fmtInt(d * k), `Tính trong ngoặc trước: ${fmtInt(a)} - ${fmtInt(b)} = ${fmtInt(d)}; ${fmtInt(d)} × ${k} = ${fmtInt(d * k)}.`, ["biểu thức"]);
    }
    case "chiaTruoc": {
      const q = int(r, 1000, 9000), a = int(r, 1000, 50000);
      return fill(`${fmtInt(a)} + ${fmtInt(q * k)} : ${k} = ___`, fmtInt(a + q), `Chia trước, cộng sau: ${fmtInt(q * k)} : ${k} = ${fmtInt(q)}; ${fmtInt(a)} + ${fmtInt(q)} = ${fmtInt(a + q)}.`, ["biểu thức"]);
    }
  }
};

export const cong6 = only(LOP4.congTruSoLon, has(/\+/));
export const tru6 = only(LOP4.congTruSoLon, has(/ - /));
export const chia4 = only(LOP4.chiaSoLon, has(/^[\d.]+ : \d+ = ___$/));
export const chiaDu4 = only(LOP4.chiaSoLon, has(/dư/));
export const tbcSo = only(LOP4.trungBinhCong, has(/^Số trung bình cộng/));
export const tbcBai = only(LOP4.trungBinhCong, has(/Trả lời|Số kia/));
export const tongHieuBai = only(LOP4.tongHieu, has(/Trả lời/));

/** Tính thuận tiện với phép nhân: a × b × c (a × c tròn trăm), a × b ± a × c. */
export const thuanTienNhan: Generator = (r) => {
  if (chance(r, 0.4)) {
    const [a, c] = pick(r, [[25, 4], [5, 20], [50, 2], [125, 8], [250, 4], [2, 500]] as const);
    const b = int(r, 12, 99);
    const [x, z] = chance(r, 0.5) ? [a, c] : [c, a];
    return fill(`Tính bằng cách thuận tiện: ${x} × ${b} × ${z} = ___`, fmtInt(a * b * c),
      `Đổi chỗ các thừa số: ${x} × ${z} × ${b} = ${fmtInt(a * c)} × ${b} = ${fmtInt(a * b * c)}.`, ["tính thuận tiện", "phép nhân"]);
  }
  const a = int(r, 12, 99), total = pick(r, [10, 100]);
  const b = total === 10 ? int(r, 1, 9) : int(r, 11, 89);
  if (chance(r, 0.5)) {
    const c = total - b;
    return fill(`Tính bằng cách thuận tiện: ${a} × ${b} + ${a} × ${c} = ___`, fmtInt(a * total),
      `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}) = ${a} × ${total} = ${fmtInt(a * total)}.`, ["tính thuận tiện", "phép nhân"]);
  }
  const big = total + b;
  return fill(`Tính bằng cách thuận tiện: ${a} × ${big} - ${a} × ${b} = ___`, fmtInt(a * total),
    `${a} × ${big} - ${a} × ${b} = ${a} × (${big} - ${b}) = ${a} × ${total} = ${fmtInt(a * total)}.`, ["tính thuận tiện", "phép nhân"]);
};

/* ═════════════ Bài toán có lời văn ═════════════ */

/** Hai số cộng/trừ không nhớ, kết quả trong [0, 99]. */
function noCarry(r: Rng, op: "+" | "-"): [number, number] {
  return retry(() => {
    const a = int(r, 11, 89), b = int(r, 1, 69);
    if (op === "+") return a + b <= 99 && (a % 10) + (b % 10) <= 9 ? [a, b] : null;
    return b < a && (b % 10) <= (a % 10) ? [a, b] : null;
  });
}

/** [đề bài, đơn vị, mở đầu câu trả lời] */
type Story = (a: number, b: number, name: string) => [string, string, string];

const STORY_ADD: Story[] = [
  (a, b) => [`Trong vườn có ${a} con gà, có thêm ${b} con gà chạy đến. Hỏi trong vườn có tất cả bao nhiêu con gà?`, "con gà", "Trong vườn có tất cả"],
  (a, b, n) => [`${n} có ${a} quyển vở, mẹ mua thêm cho ${n} ${b} quyển vở. Hỏi ${n} có tất cả bao nhiêu quyển vở?`, "quyển vở", `${n} có tất cả`],
  (a, b) => [`Hàng trên có ${a} bạn, hàng dưới có ${b} bạn. Hỏi cả hai hàng có bao nhiêu bạn?`, "bạn", "Cả hai hàng có"],
  (a, b) => [`Lọ thứ nhất có ${a} bông hoa, lọ thứ hai có ${b} bông hoa. Hỏi cả hai lọ có bao nhiêu bông hoa?`, "bông hoa", "Cả hai lọ có"],
];
const STORY_SUB: Story[] = [
  (a, b) => [`Trên cành có ${a} con chim, ${b} con chim bay đi. Hỏi trên cành còn lại bao nhiêu con chim?`, "con chim", "Trên cành còn lại"],
  (a, b) => [`Có ${a} quả bóng bay, bị vỡ ${b} quả. Hỏi còn lại bao nhiêu quả bóng bay?`, "quả bóng bay", "Còn lại"],
  (a, b, n) => [`${n} có ${a} cái kẹo, ${n} cho em ${b} cái kẹo. Hỏi ${n} còn lại bao nhiêu cái kẹo?`, "cái kẹo", `${n} còn lại`],
  (a, b) => [`Đàn vịt có ${a} con, ${b} con xuống ao. Hỏi trên bờ còn lại bao nhiêu con vịt?`, "con vịt", "Trên bờ còn lại"],
];

/** Lớp 1: "Viết phép tính thích hợp" — chưa học trình bày bài giải, chỉ phép tính và câu trả lời. */
export const phepTinhThichHop = (max: 10 | 100, ops: "+" | "-" | "+-"): Generator => (r) => {
  // "+" và "+-" rút số y như trước (đề Tạo đề nhanh đã chia sẻ không đổi); "-" chỉ ra phép trừ.
  const op = ops === "-" ? "-" : ops === "+" || chance(r, 0.5) ? "+" : "-";
  const [a, b] = max === 10
    ? (op === "+" ? (() => { const x = int(r, 2, 8); return [x, int(r, 1, 10 - x)]; })() : (() => { const x = int(r, 4, 10); return [x, int(r, 1, x - 1)]; })())
    : noCarry(r, op);
  const c = op === "+" ? a + b : a - b;
  const [text, unit, say] = pick(r, op === "+" ? STORY_ADD : STORY_SUB)(a, b, pick(r, NAMES));
  return fill(`Viết phép tính thích hợp: ${text} Trả lời: ___ ${unit}.`, String(c),
    `Phép tính: ${a} ${op} ${b} = ${c}. Trả lời: ${say} ${c} ${unit}.`, ["toán có lời văn", "viết phép tính"]);
};

/** Lớp 2: bài toán nhiều hơn / ít hơn, gộp, trong phạm vi 1000. */
const loiVan1000: Generator = (r) => {
  const a = int(r, 120, 600), d = int(r, 15, 250);
  const more = chance(r, 0.6);
  if (!more && d >= a - 20) return loiVan1000(r);
  const c = more ? a + d : a - d;
  // [đề, đơn vị, câu lời giải, đáp số]
  const [q, u, loi, dap] = pick(r, [
    [`Khối lớp Hai có ${a} học sinh, khối lớp Ba có ${more ? "nhiều" : "ít"} hơn khối lớp Hai ${d} học sinh. Hỏi khối lớp Ba có bao nhiêu học sinh?`, "học sinh", "Khối lớp Ba có số học sinh là:", "học sinh"],
    [`Buổi sáng cửa hàng bán được ${a} kg gạo, buổi chiều bán được ${more ? "nhiều" : "ít"} hơn buổi sáng ${d} kg gạo. Hỏi buổi chiều cửa hàng bán được bao nhiêu ki-lô-gam gạo?`, "kg", "Buổi chiều cửa hàng bán được số ki-lô-gam gạo là:", "kg gạo"],
    [`Thùng thứ nhất có ${a} l nước, thùng thứ hai có ${more ? "nhiều" : "ít"} hơn thùng thứ nhất ${d} l nước. Hỏi thùng thứ hai có bao nhiêu lít nước?`, "l", "Thùng thứ hai có số lít nước là:", "l nước"],
  ] as const);
  return fill(`${q} Trả lời: ___ ${u}.`, String(c),
    baiGiai([[loi, `${a} ${more ? "+" : "-"} ${d} = ${c} (${u})`]], `${c} ${dap}`), ["toán có lời văn", more ? "nhiều hơn" : "ít hơn"]);
};

/** Lớp 3: tìm một số biết kết quả sau hai phép tính (làm ngược lại). */
export const timSoBiet: Generator = (r) => {
  const x = int(r, 3, 12), k = int(r, 2, 9), c = int(r, 2, Math.min(30, x * k - 5));
  switch (pick(r, ["nhanCong", "nhanTru", "chiaCong", "congNhan"] as const)) {
    case "nhanCong": return fill(`Tìm một số, biết rằng lấy số đó nhân với ${k} rồi cộng thêm ${c} thì được ${x * k + c}. Số đó là ___`, String(x),
      `Số đó nhân với ${k} được: ${x * k + c} - ${c} = ${x * k}. Số đó là: ${x * k} : ${k} = ${x}.`, ["tìm số", "làm ngược"]);
    case "nhanTru": return fill(`Tìm một số, biết rằng lấy số đó nhân với ${k} rồi trừ đi ${c} thì được ${x * k - c}. Số đó là ___`, String(x),
      `Số đó nhân với ${k} được: ${x * k - c} + ${c} = ${x * k}. Số đó là: ${x * k} : ${k} = ${x}.`, ["tìm số", "làm ngược"]);
    case "chiaCong": return fill(`Tìm một số, biết rằng lấy số đó chia cho ${k} rồi cộng thêm ${c} thì được ${x + c}. Số đó là ___`, String(x * k),
      `Số đó chia cho ${k} được: ${x + c} - ${c} = ${x}. Số đó là: ${x} × ${k} = ${x * k}.`, ["tìm số", "làm ngược"]);
    case "congNhan": return fill(`Tìm một số, biết rằng lấy số đó cộng với ${c} rồi nhân với ${k} thì được ${(x + c) * k}. Số đó là ___`, String(x),
      `Số đó cộng với ${c} được: ${(x + c) * k} : ${k} = ${x + c}. Số đó là: ${x + c} - ${c} = ${x}.`, ["tìm số", "làm ngược"]);
  }
};

/** Lớp 3: chu vi, diện tích hình chữ nhật trong bài toán hai bước. */
const hcnLoiVan: Generator = (r) => {
  const thing = pick(r, [["mảnh vườn", "m"], ["thửa ruộng", "m"], ["tấm bìa", "cm"], ["mặt bàn", "dm"]] as const);
  const [what, u] = thing;
  switch (pick(r, ["chuViKem", "dienTichGap", "chuViVuong"] as const)) {
    case "chuViKem": {
      const L = int(r, 12, 60), d = int(r, 3, L - 4), w = L - d;
      return fill(`Một ${what} hình chữ nhật có chiều dài ${L} ${u}, chiều rộng kém chiều dài ${d} ${u}. Tính chu vi ${what} đó. Trả lời: ___ ${u}.`, String((L + w) * 2),
        baiGiai([
          [`Chiều rộng ${what} là:`, `${L} - ${d} = ${w} (${u})`],
          [`Chu vi ${what} là:`, `(${L} + ${w}) × 2 = ${(L + w) * 2} (${u})`],
        ], `${(L + w) * 2} ${u}`), ["chu vi", "toán có lời văn"]);
    }
    case "dienTichGap": {
      const w = int(r, 3, 12), k = int(r, 2, 4), L = w * k;
      return fill(`Một ${what} hình chữ nhật có chiều rộng ${w} ${u}, chiều dài gấp ${k} lần chiều rộng. Tính diện tích ${what} đó. Trả lời: ___ ${u}².`, String(L * w),
        baiGiai([
          [`Chiều dài ${what} là:`, `${w} × ${k} = ${L} (${u})`],
          [`Diện tích ${what} là:`, `${L} × ${w} = ${L * w} (${u}²)`],
        ], `${L * w} ${u}²`), ["diện tích", "toán có lời văn"]);
    }
    case "chuViVuong": {
      const L = int(r, 10, 40), w = int(r, 2, L - 2);
      if ((L + w) % 2) return hcnLoiVan(r);
      const a = (L + w) / 2;
      return fill(`Một ${what} hình chữ nhật có chiều dài ${L} ${u}, chiều rộng ${w} ${u}. Một hình vuông có chu vi bằng chu vi ${what} đó. Tính độ dài cạnh hình vuông. Trả lời: ___ ${u}.`, String(a),
        baiGiai([
          [`Chu vi ${what} là:`, `(${L} + ${w}) × 2 = ${(L + w) * 2} (${u})`],
          ["Độ dài cạnh hình vuông là:", `${(L + w) * 2} : 4 = ${a} (${u})`],
        ], `${a} ${u}`), ["chu vi", "toán có lời văn"]);
    }
  }
};

/** Lớp 3: số lớn nhất / bé nhất viết từ các chữ số cho trước (mỗi chữ số dùng một lần). */
export const soLapDuoc = (n: 4 | 5): Generator => (r) => {
  const digits = shuffle(r, range(0, 9)).slice(0, n);
  if (!digits.some((d) => d !== 0)) return soLapDuoc(n)(r);
  const big = chance(r, 0.5);
  const asc = [...digits].sort((a, b) => a - b);
  const lead0 = asc.findIndex((d) => d !== 0);
  const smallest = [asc[lead0], ...asc.filter((_, i) => i !== lead0)];
  const ans = Number((big ? [...asc].reverse() : smallest).join(""));
  return fill(`Số ${big ? "lớn" : "bé"} nhất có ${n === 4 ? "bốn" : "năm"} chữ số khác nhau được viết từ các chữ số ${digits.join(", ")} là ___`, fmtInt(ans),
    big ? `Xếp các chữ số từ lớn đến bé: ${fmtInt(ans)}.`
      : `Chữ số hàng cao nhất phải khác 0 và bé nhất có thể, các chữ số còn lại xếp từ bé đến lớn: ${fmtInt(ans)}.`,
    ["cấu tạo số"]);
};

/** Lớp 4: bài toán tìm phân số của một số. */
export const phanSoLoiVan: Generator = (r) => retry(() => {
  const d = int(r, 3, 8), n = int(r, 1, d - 1);
  const kind = pick(r, ["gao", "vai", "hocSinh", "hcn"] as const);
  if (kind === "hcn") {
    const L = d * int(r, 2, 8), w = (L * n) / d;
    return fill(`Một mảnh vườn hình chữ nhật có chiều dài ${L} m, chiều rộng bằng ${n}/${d} chiều dài. Tính diện tích mảnh vườn đó. Trả lời: ___ m².`, fmtInt(L * w),
      baiGiai([
        ["Chiều rộng mảnh vườn là:", `${L} × ${n} : ${d} = ${w} (m)`],
        ["Diện tích mảnh vườn là:", `${L} × ${w} = ${fmtInt(L * w)} (m²)`],
      ], `${fmtInt(L * w)} m²`), ["phân số", "toán có lời văn"]);
  }
  const T = d * (kind === "hocSinh" ? int(r, 4, 6) : int(r, 6, 40));
  if (kind === "hocSinh" && (T < 24 || T > 42)) return null;
  const part = (T * n) / d, rest = T - part;
  // [đề, đơn vị, câu lời giải bước 1, bước 2, đáp số]
  const [q, u, loi1, loi2, dap] = {
    gao: [`Một cửa hàng có ${T} kg gạo, đã bán ${n}/${d} số gạo đó. Hỏi cửa hàng còn lại bao nhiêu ki-lô-gam gạo?`, "kg",
      "Cửa hàng đã bán số ki-lô-gam gạo là:", "Cửa hàng còn lại số ki-lô-gam gạo là:", "kg gạo"],
    vai: [`Một tấm vải dài ${T} m, người ta đã cắt đi ${n}/${d} tấm vải. Hỏi tấm vải còn lại dài bao nhiêu mét?`, "m",
      "Người ta đã cắt đi số mét vải là:", "Tấm vải còn lại dài là:", "m"],
    hocSinh: [`Lớp 4A có ${T} học sinh, trong đó số học sinh nữ bằng ${n}/${d} số học sinh cả lớp. Hỏi lớp 4A có bao nhiêu học sinh nam?`, "học sinh",
      "Lớp 4A có số học sinh nữ là:", "Lớp 4A có số học sinh nam là:", "học sinh nam"],
  }[kind];
  return fill(`${q} Trả lời: ___ ${u}.`, String(rest),
    baiGiai([[loi1, `${T} × ${n} : ${d} = ${part} (${u})`], [loi2, `${T} - ${part} = ${rest} (${u})`]], `${rest} ${dap}`),
    ["phân số", "toán có lời văn"]);
});

/* ═════════════ Câu có hình vẽ ═════════════ */

const SHAPE_NAME: Record<FlatShape, string> = { tron: "hình tròn", vuong: "hình vuông", chunhat: "hình chữ nhật", tamgiac: "hình tam giác" };

function flatShapes(r: Rng) {
  const target = pick(r, ["tron", "vuong", "chunhat", "tamgiac"] as const);
  const n = int(r, 2, 5);
  const others = (["tron", "vuong", "chunhat", "tamgiac"] as const).filter((k) => k !== target);
  const items = shuffle(r, [...Array<FlatShape>(n).fill(target), ...Array.from({ length: int(r, 3, 12 - n) }, () => pick(r, others))]);
  return { target, n, image: flatShapesSvg(items) };
}

export const demHinhPhang: Generator = (r) => {
  const { target, n, image } = flatShapes(r);
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["hình phẳng", "đếm hình", "hình vẽ"],
    question: `Hình bên có bao nhiêu ${SHAPE_NAME[target]}?`, image,
    ...numOptions(r, n, [n - 1, n + 1, n + 2, n - 2]),
    explanation: `Chỉ tay vào từng ${SHAPE_NAME[target]} và đếm: có ${n} ${SHAPE_NAME[target]}.`,
    hint: `Chỉ đếm ${SHAPE_NAME[target]}, bỏ qua các hình khác.`,
  };
};

const demHinhPhangFill: Generator = (r) => {
  const { target, n, image } = flatShapes(r);
  return fill(`Hình bên có ___ ${SHAPE_NAME[target]}.`, String(n), `Chỉ tay vào từng ${SHAPE_NAME[target]} và đếm: có ${n} ${SHAPE_NAME[target]}.`,
    ["hình phẳng", "đếm hình", "hình vẽ"], image);
};

/** Cách đếm hình ghép: k + 1 hình đơn, ghép 2 hình, ghép 3 hình… */
const countText = (k: number, name: string) =>
  range(1, k + 1).map((s) => `${s === 1 ? `${name} đơn` : `ghép ${s} hình`}: ${k + 2 - s}`).join("; ") +
  `. Tất cả: ${range(1, k + 1).map((s) => k + 2 - s).join(" + ")} = ${((k + 1) * (k + 2)) / 2}.`;

export const demTamGiac = (ks: number[], asFill: boolean): Generator => (r) => {
  const k = pick(r, ks), n = fanTriangleCount(k);
  const exp = `Đếm ${countText(k, "hình")}`;
  if (asFill) return fill("Hình bên có ___ hình tam giác.", String(n), exp, ["đếm hình", "hình vẽ"], fanTrianglesSvg(k));
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["đếm hình", "hình vẽ"],
    question: "Hình bên có bao nhiêu hình tam giác?", image: fanTrianglesSvg(k),
    ...numOptions(r, n, [n - 1, n + 1, n + 2, k + 1, n - 2]), explanation: exp, hint: "Đếm hình đơn trước, rồi đến các hình ghép.",
  };
};

export const demTuGiac = (ks: number[], name: "hình chữ nhật" | "hình tứ giác", asFill: boolean): Generator => (r) => {
  const k = pick(r, ks), n = stripRectCount(k);
  const exp = `Đếm ${countText(k, "hình")}`;
  if (asFill) return fill(`Hình bên có ___ ${name}.`, String(n), exp, ["đếm hình", "hình vẽ"], stripRectsSvg(k));
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["đếm hình", "hình vẽ"],
    question: `Hình bên có bao nhiêu ${name}?`, image: stripRectsSvg(k),
    ...numOptions(r, n, [n - 1, n + 1, k + 1, n + 2, n - 2]), explanation: exp, hint: "Đếm hình đơn trước, rồi đến các hình ghép.",
  };
};

/** Đọc giờ trên mặt đồng hồ đen trắng. `mins`: các mốc phút được phép theo lớp. */
export const xemGio = (mins: number[]): Generator => (r) => {
  const h = int(r, 1, 12), m = pick(r, mins);
  const lab = (hh: number, mm: number) => {
    const H = ((((hh - 1) % 12) + 12) % 12) + 1, M = ((mm % 60) + 60) % 60;
    return M === 0 ? `${H} giờ` : `${H} giờ ${M} phút`;
  };
  const correct = lab(h, m);
  // Lớp 1 chỉ học giờ đúng: nhiễu cũng là giờ đúng.
  const cands = mins.every((x) => x === 0)
    ? [1, -1, 2, -2, 6].map((dh) => lab(h + dh, 0))
    : [lab(h + 1, m), lab(h - 1, m), lab(m === 0 ? 12 : m / 5, (h % 12) * 5), lab(h, m + 30), lab(h + 6, m)];
  if (m !== 0) cands.push(lab(h + 1, 60 - m), lab(h, m + 5), lab(h, m - 5));
  return {
    type: "multiple_choice", difficulty: m === 0 ? "easy" : "medium", tags: ["xem đồng hồ", "hình vẽ"],
    question: "Đồng hồ bên chỉ mấy giờ?", image: clockFaceSvg(h, m), ...mcOptions(r, correct, cands),
    explanation: `Kim ngắn (kim giờ) chỉ ${m === 0 ? "đúng vào" : "qua"} số ${h}, kim dài (kim phút) chỉ số ${m === 0 ? 12 : m / 5}${m ? ` tức là ${m} phút` : ""}. Đồng hồ chỉ ${correct}.`,
    hint: "Kim ngắn chỉ giờ, kim dài chỉ phút.",
  };
};

export const doDaiThuoc: Generator = (r) => {
  const len = int(r, 3, 12);
  const what = pick(r, ["bút chì", "que tính", "băng giấy", "chiếc lược"]);
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["độ dài", "đo bằng thước", "hình vẽ"],
    question: `${what[0].toUpperCase() + what.slice(1)} dài bao nhiêu xăng-ti-mét?`, image: rulerSvg(len, what),
    ...numOptions(r, len, [len - 1, len + 1, len + 2, len - 2], "cm"),
    explanation: `Một đầu ${what} đặt đúng vạch 0, đầu kia ở vạch ${len} nên ${what} dài ${len} cm.`,
    hint: "Đọc số ở vạch thước ngay dưới đầu kia của đồ vật.",
  };
};

export const duongGapKhuc = (asProblem: boolean): Generator => (r) => {
  const n = int(r, 2, 3);
  const segs = Array.from({ length: n }, () => int(r, 2, 15));
  const total = segs.reduce((s, x) => s + x, 0);
  const name = "ABCD".slice(0, n + 1);
  const image = polylineSvg(segs.map((v) => ({ label: `${v} cm`, val: v })));
  const exp = `Độ dài đường gấp khúc ${name} = ${segs.map((s, i) => `${name[i]}${name[i + 1]}`).join(" + ")} = ${segs.join(" + ")} = ${total} (cm).`;
  if (asProblem) return fill(`Tính độ dài đường gấp khúc ${name} (như hình vẽ). Trả lời: ___ cm.`, String(total), exp, ["đường gấp khúc", "hình vẽ"], image);
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["đường gấp khúc", "hình vẽ"],
    question: `Độ dài đường gấp khúc ${name} (như hình vẽ) là:`, image,
    ...numOptions(r, total, [total - segs[n - 1], total + 1, total - 1, total + segs[0], Math.max(...segs) * n], "cm"),
    explanation: exp, hint: "Cộng độ dài tất cả các đoạn thẳng.",
  };
};

export const tienHinh = (set: number[], count: [number, number]): Generator => (r) => {
  const notes = Array.from({ length: int(r, count[0], count[1]) }, () => pick(r, set)).sort((a, b) => b - a);
  const total = notes.reduce((s, x) => s + x, 0);
  const name = pick(r, NAMES);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["tiền Việt Nam", "hình vẽ"],
    question: `${name} có số tiền như hình dưới đây. Hỏi ${name} có tất cả bao nhiêu tiền?`, image: moneySvg(notes),
    ...numOptions(r, total, [total - notes[notes.length - 1], total + notes[notes.length - 1], total - notes[0], total + notes[0], [...new Set(notes)].reduce((s, x) => s + x, 0)], "đồng"),
    explanation: `Cộng các tờ tiền: ${notes.map(fmtInt).join(" + ")} = ${fmtInt(total)} (đồng).`,
    hint: "Cộng giá trị của từng tờ tiền.",
  };
};

/** "Có 4 đĩa, mỗi đĩa 5 quả cam" → 5 × 4 = 20 (5 được lấy 4 lần). Nhiễu khác giá trị nên không ai cãi được. */
export const nhomHinh: Generator = (r) => retry(() => {
  const per = pick(r, [2, 5]), g = int(r, 2, 6), v = per * g;
  const wrong = [[per, "+", g, per + g], [per, "×", g + 1, per * (g + 1)], [per, "×", g - 1, per * (g - 1)], [g, "+", g, 2 * g], [per, "×", g + 2, per * (g + 2)], [per + 1, "×", g, (per + 1) * g]]
    .filter((w) => w[3] !== v).map((w) => `${w[0]} ${w[1]} ${w[2]} = ${w[3]}`);
  const thing = pick(r, ["quả cam", "cái bánh", "quả táo"]);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["phép nhân", "hình vẽ"],
    question: `Có ${g} cái đĩa, mỗi đĩa có ${per} ${thing} (như hình vẽ). Phép tính tìm số ${thing} trên tất cả các đĩa là:`, image: groupsSvg(g, per),
    ...mcOptions(r, `${per} × ${g} = ${v}`, wrong),
    explanation: `${per} ${thing} được lấy ${g} lần: ${per} × ${g} = ${v} (${thing}).`,
    hint: "Các nhóm có số lượng bằng nhau thì dùng phép nhân.",
  };
});

export const hinhTron3: Generator = (r) => {
  const R = int(r, 2, 9), givenR = chance(r, 0.5);
  const ans = givenR ? 2 * R : R;
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["hình tròn", "hình vẽ"],
    question: givenR
      ? `Hình tròn tâm O có bán kính ${R} cm (như hình vẽ). Đường kính của hình tròn đó là:`
      : `Hình tròn tâm O có đường kính ${2 * R} cm (như hình vẽ). Bán kính của hình tròn đó là:`,
    image: circleSvg({ label: `${givenR ? R : 2 * R} cm`, kind: givenR ? "r" : "d" }),
    ...numOptions(r, ans, givenR ? [R, 4 * R, R + 2, 2 * R + 2] : [2 * R, 4 * R, R + 2, R + 1], "cm"),
    explanation: givenR ? `Đường kính gấp 2 lần bán kính: ${R} × 2 = ${2 * R} (cm).` : `Bán kính bằng một nửa đường kính: ${2 * R} : 2 = ${R} (cm).`,
    hint: "Đường kính dài gấp đôi bán kính.",
  };
};

export const hinhCN = (what: "chuVi" | "dienTich"): Generator => (r) => {
  const square = chance(r, 0.4);
  const l = square ? int(r, 3, 12) : int(r, 6, 20), w = square ? l : int(r, 2, l - 2);
  const P = (l + w) * 2, S = l * w;
  const ans = what === "chuVi" ? P : S;
  const label = what === "chuVi" ? "Chu vi" : "Diện tích";
  const unit = what === "chuVi" ? "cm" : "cm²";
  const shape = square ? "hình vuông" : "hình chữ nhật";
  return {
    type: "multiple_choice", difficulty: "medium", tags: [shape, what === "chuVi" ? "chu vi" : "diện tích", "hình vẽ"],
    question: square
      ? `Hình vuông ABCD có cạnh ${l} cm (như hình vẽ). ${label} hình vuông ABCD là:`
      : `Hình chữ nhật ABCD có chiều dài ${l} cm, chiều rộng ${w} cm (như hình vẽ). ${label} hình chữ nhật ABCD là:`,
    image: rectSvg({ l: `${l} cm`, w: square ? undefined : `${w} cm`, lVal: l, wVal: w }),
    ...numOptions(r, ans, what === "chuVi" ? [l + w, S, l * 2 + w, P + 2, l * 3] : [P, l + w, S + l, S - w, l * 2 + w], unit),
    explanation: what === "chuVi"
      ? (square ? `Chu vi hình vuông = cạnh × 4 = ${l} × 4 = ${P} (cm).` : `Chu vi hình chữ nhật = (dài + rộng) × 2 = (${l} + ${w}) × 2 = ${P} (cm).`)
      : (square ? `Diện tích hình vuông = cạnh × cạnh = ${l} × ${l} = ${S} (cm²).` : `Diện tích hình chữ nhật = dài × rộng = ${l} × ${w} = ${S} (cm²).`),
    hint: what === "chuVi" ? "Chu vi là tổng độ dài các cạnh." : "Diện tích = chiều dài × chiều rộng.",
  };
};

/** Phân số chỉ phần tô màu. `unit`: lớp 3 chỉ tô 1 phần ("một phần mấy"). */
export const phanSoHinh = (unit: boolean): Generator => (r) => {
  const kind = pick(r, ["rect", "circle"] as const);
  const d = unit ? int(r, 2, 6) : int(r, 3, 8), n = unit ? 1 : int(r, 1, d - 1);
  const shaded = shuffle(r, range(0, d - 1)).slice(0, n);
  const val = n / d;
  const cands = unit
    ? range(2, 8).filter((x) => x !== d).map((x) => `1/${x}`)
    : [[d - n, d], [d, n], [n, d + 1], [n + 1, d], [n, Math.max(1, d - n)]].filter(([a, b]) => b > 0 && a !== b && a / b !== val).map(([a, b]) => `${a}/${b}`);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["phân số", "hình vẽ"],
    question: unit ? "Đã tô màu vào một phần mấy của hình bên?" : "Phân số chỉ phần đã tô màu của hình bên là:",
    image: fractionSvg(d, shaded, kind),
    ...mcOptions(r, `${n}/${d}`, cands),
    explanation: `Hình được chia thành ${d} phần bằng nhau, đã tô màu ${n} phần. ${unit ? `Đã tô màu 1/${d} hình.` : `Phân số chỉ phần đã tô màu là ${n}/${d}.`}`,
    hint: "Mẫu số là số phần bằng nhau, tử số là số phần đã tô.",
  };
};

const GOC = { nhon: "Góc nhọn", vuong: "Góc vuông", tu: "Góc tù", bet: "Góc bẹt" } as const;

export const gocHinh: Generator = (r) => {
  const kind = pick(r, ["nhon", "vuong", "tu", "bet"] as const);
  const deg = { nhon: int(r, 5, 14) * 5, vuong: 90, tu: int(r, 22, 32) * 5, bet: 180 }[kind];
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["góc", "hình vẽ"],
    question: "Góc đỉnh O; cạnh OA, OB trong hình bên là góc gì?", image: angleSvg(deg),
    ...fixedOptions(Object.values(GOC), GOC[kind]),
    explanation: {
      nhon: "Góc nhọn bé hơn góc vuông.", vuong: "Góc vuông có kí hiệu vuông ở đỉnh (90°).",
      tu: "Góc tù lớn hơn góc vuông nhưng bé hơn góc bẹt.", bet: "Hai cạnh OA, OB nằm trên một đường thẳng: góc bẹt (180°).",
    }[kind],
    hint: "So sánh với góc vuông (dùng ê ke).",
  };
};

export const hinhNhanDang: Generator = (r) => {
  const target = pick(r, ["binhhanh", "thoi"] as const);
  const pool: QuadKind[] = target === "binhhanh" ? ["thang", "tugiac", "tamgiac"] : ["binhhanh", "thang", "tugiac", "tamgiac"];
  const kinds = shuffle(r, [target, ...shuffle(r, pool).slice(0, 3)]);
  const name = target === "thoi" ? "hình thoi" : "hình bình hành";
  return {
    type: "multiple_choice", difficulty: "medium", tags: [name, "hình vẽ"],
    question: `Trong các hình dưới đây, hình nào là ${name}?`, image: shapesRowSvg(kinds),
    ...fixedOptions(["Hình 1", "Hình 2", "Hình 3", "Hình 4"], `Hình ${kinds.indexOf(target) + 1}`),
    explanation: target === "thoi"
      ? `Hình thoi có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau: đó là Hình ${kinds.indexOf(target) + 1}.`
      : `Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau: đó là Hình ${kinds.indexOf(target) + 1}.`,
    hint: "Kiểm tra từng cặp cạnh đối diện.",
  };
};

const BAR_TOPICS = [
  { title: "Số cây các lớp khối Bốn trồng được", unit: "cây", noun: "cây", verb: "trồng được" },
  { title: "Số quyển sách các lớp quyên góp được", unit: "quyển", noun: "quyển sách", verb: "quyên góp được" },
  { title: "Số ki-lô-gam giấy vụn các lớp thu gom được", unit: "kg", noun: "ki-lô-gam giấy vụn", verb: "thu gom được" },
];

export const bieuDoCot: Generator = (r) => {
  const t = pick(r, BAR_TOPICS);
  const labels = ["4A", "4B", "4C", "4D"];
  const ask = pick(r, ["nhatMax", "nhatMin", "hon", "tong", "tbc"] as const);
  const values = retry(() => {
    const vs = shuffle(r, range(4, 19)).slice(0, 4).map((x) => x * 5);
    return ask !== "tbc" || vs.reduce((s, x) => s + x, 0) % 4 === 0 ? vs : null;
  });
  const image = barChartSvg({ title: t.title, labels, values, unit: t.unit, step: 20 });
  const base = { type: "multiple_choice" as const, difficulty: "medium" as const, tags: ["biểu đồ cột", "hình vẽ"], image, hint: "Đọc số ghi trên đầu mỗi cột." };
  const intro = `Biểu đồ cột dưới đây cho biết ${t.title.replace(/^./, (c) => c.toLowerCase())}.`;
  if (ask === "nhatMax" || ask === "nhatMin") {
    const v = ask === "nhatMax" ? Math.max(...values) : Math.min(...values);
    const i = values.indexOf(v);
    return { ...base, question: `${intro} Lớp nào ${t.verb} ${ask === "nhatMax" ? "nhiều" : "ít"} ${t.noun} nhất?`,
      ...fixedOptions(labels, labels[i]),
      explanation: `Cột của lớp ${labels[i]} ${ask === "nhatMax" ? "cao" : "thấp"} nhất (${v} ${t.unit}).` };
  }
  if (ask === "hon") {
    const [i, j] = shuffle(r, [0, 1, 2, 3]).slice(0, 2).sort((a, b) => values[b] - values[a]);
    const d = values[i] - values[j];
    return { ...base, question: `${intro} Lớp ${labels[i]} ${t.verb} nhiều hơn lớp ${labels[j]} bao nhiêu ${t.noun}?`,
      ...numOptions(r, d, [values[i], values[j], values[i] + values[j], d + 5, d - 5, d + 10], t.unit),
      explanation: `Lớp ${labels[i]}: ${values[i]} ${t.unit}, lớp ${labels[j]}: ${values[j]} ${t.unit}. Nhiều hơn: ${values[i]} - ${values[j]} = ${d} (${t.unit}).` };
  }
  const sum = values.reduce((s, x) => s + x, 0);
  if (ask === "tong") {
    return { ...base, question: `${intro} Cả bốn lớp ${t.verb} tất cả bao nhiêu ${t.noun}?`,
      ...numOptions(r, sum, [sum + 10, sum - 10, sum + 5, sum - 5, sum - values[3]], t.unit),
      explanation: `${values.join(" + ")} = ${sum} (${t.unit}).` };
  }
  return { ...base, question: `${intro} Trung bình mỗi lớp ${t.verb} bao nhiêu ${t.noun}?`,
    ...numOptions(r, sum / 4, [sum, sum / 4 + 5, sum / 4 - 5, sum / 2, sum / 4 + 10], t.unit),
    explanation: `Tổng: ${values.join(" + ")} = ${sum} (${t.unit}). Trung bình mỗi lớp: ${sum} : 4 = ${sum / 4} (${t.unit}).` };
};

/* ═════════════ Cấu trúc đề theo lớp, theo kì ═════════════ */

interface GroupBp { prompt: string; gens: Generator[]; work: Work }

interface Blueprint {
  mcq: Generator[];          // lớp 1–2: 6 câu, lớp 3–4: 8 câu; mỗi câu 0,5 điểm
  bai1: GroupBp;             // 4 ý × 0,5 điểm
  bai2: GroupBp;             // lớp 1–2: 4 ý, lớp 3–4: 2 ý; mỗi ý 0,5 điểm
  bai3: { gen: Generator; work: Work; lines: number };  // 2 điểm
  bai4: Generator;           // 1 điểm
}

const x4 = (g: Generator) => [g, g, g, g];
const DAT_TINH = (gens: Generator[]): GroupBp => ({ prompt: "Đặt tính rồi tính:", gens, work: "dat-tinh" });
const BAI_GIAI = (gen: Generator, lines = 4) => ({ gen, work: "bai-giai" as const, lines });

const BLUEPRINTS: Record<1 | 2 | 3 | 4, Record<ExamKind, Blueprint>> = {
  1: {
    "giua-hk1": {
      mcq: [LOP1.demHinh, soLonNhat(0, 10), LOP1.soSanh10, demHinhPhang, choice(LOP1.tachSo), LOP1.sapXep10],
      bai1: { prompt: "Tính:", gens: x4(cong10), work: "none" },
      bai2: { prompt: "Số?", gens: [LOP1.tachSo, daySo(10, [1]), LOP1.tachSo, daySo(10, [1, 2])], work: "none" },
      bai3: { gen: phepTinhThichHop(10, "+"), work: "lines", lines: 2 },
      bai4: either(demHinhPhangFill, demTamGiac([1], true)),
    },
    "cuoi-hk1": {
      mcq: [soSanhPT10, demHinhPhang, choice(tinh10), LOP1.dungSai1, soLonNhat(0, 10), either(LOP1.sapXep10, LOP1.demHinh)],
      bai1: { prompt: "Tính:", gens: x4(tinh10), work: "none" },
      bai2: { prompt: "Số?", gens: [thieu10, thieu10, LOP1.tachSo, LOP1.tachSo], work: "none" },
      bai3: { gen: phepTinhThichHop(10, "+-"), work: "lines", lines: 2 },
      bai4: either(demHinhPhangFill, demTamGiac([1], true), lead("Tính: ", tinh3So(10))),
    },
    "giua-hk2": {
      mcq: [LOP1.lienTruocSau, LOP1.soSanh100, LOP1.sapXep100, choice(LOP1.chucDonVi), soLonNhat(10, 99), doDaiThuoc],
      bai1: { prompt: "Tính:", gens: x4(LOP1.congTru100), work: "none" },
      bai2: { prompt: "Số?", gens: [LOP1.chucDonVi, daySo(100, [1, 10]), LOP1.chucDonVi, daySo(100, [2, 5, 10])], work: "none" },
      bai3: { gen: phepTinhThichHop(100, "+-"), work: "lines", lines: 2 },
      bai4: either(lead("Tính: ", tinh3So(100, 10)), cmThuoc),
    },
    "cuoi-hk2": {
      mcq: [LOP1.soSanh100, choice(LOP1.congTru100), xemGio([0]), LOP1.ngayTrongTuan, doDaiThuoc, either(LOP1.lienTruocSau, soLonNhat(10, 99))],
      bai1: DAT_TINH([cong100, tru100, cong100, tru100]),
      bai2: { prompt: "Tính:", gens: [cmTinh, cmTinh, tinh3So(100, 10), tinh3So(100, 10)], work: "none" },
      bai3: { gen: phepTinhThichHop(100, "+-"), work: "lines", lines: 2 },
      bai4: either(demHinhPhangFill, demTamGiac([1, 2], true), cmThuoc),
    },
  },
  2: {
    "giua-hk1": {
      mcq: [choice(congTru20), soSanhPT20, choice(thanhPhan), soLonNhat(10, 99), LOP1.lienTruocSau, choice(LOP1.chucDonVi)],
      bai1: { prompt: "Tính nhẩm:", gens: x4(congTru20), work: "none" },
      bai2: { prompt: "Số?", gens: x4(timSoCoNho(20)), work: "none" },
      bai3: BAI_GIAI(LOP2.nhieuHonItHon),
      bai4: lead("Tính: ", tinh3So(20)),
    },
    "cuoi-hk1": {
      mcq: [choice(LOP2.congTru100), soSanhPT100, xemGio([0, 15, 30]), LOP2.ngayThang, duongGapKhuc(false), demTuGiac([1, 2], "hình tứ giác", false)],
      bai1: DAT_TINH([cong100c, tru100c, cong100c, tru100c]),
      bai2: { prompt: "Tính:", gens: [soDoCoNho, soDoCoNho, timSoCoNho(100), timSoCoNho(100)], work: "none" },
      bai3: BAI_GIAI(LOP2.nhieuHonItHon),
      bai4: duongGapKhuc(true),
    },
    "giua-hk2": {
      mcq: [choice(LOP2.bangNhanChia), LOP2.dungSai2, nhomHinh, choice(LOP2.tramChucDonVi), LOP2.soSanh1000, LOP2.sapXep1000],
      bai1: { prompt: "Tính nhẩm:", gens: x4(nhanChia25), work: "none" },
      bai2: { prompt: "Số?", gens: [thieuNhan, thieuNhan, LOP2.tramChucDonVi, LOP2.tramChucDonVi], work: "none" },
      bai3: BAI_GIAI(LOP2.nhanChiaLoiVan),
      bai4: lead("Tính: ", bieuThuc2),
    },
    "cuoi-hk2": {
      mcq: [LOP2.soSanh1000, choice(LOP2.tramChucDonVi), choice(doiDoDai2), tienHinh([100, 200, 500, 1000], [3, 5]), choice(LOP2.bangNhanChia), either(xemGio([0, 15, 30]), LOP2.ngayThang)],
      bai1: DAT_TINH([cong1000, tru1000, cong1000, tru1000]),
      bai2: { prompt: "Số?", gens: [doiDoDai2, doiDoDai2, thieuNhan, thieuNhan], work: "none" },
      bai3: BAI_GIAI(either(loiVan1000, LOP2.nhanChiaLoiVan)),
      bai4: either(duongGapKhuc(true), lead("Tính: ", bieuThuc2)),
    },
  },
  3: {
    "giua-hk1": {
      mcq: [choice(LOP3.bangNhanChia34), choice(LOP3.bangNhanChia67), choice(LOP3.bangNhanChia89), LOP3.soSanhTich67,
        LOP3.timThuaSo89, LOP3.dungSai34, either(LOP3.timThuaSo34, LOP3.dungSai89), demTamGiac([2, 3], false)],
      bai1: DAT_TINH([cong1000, tru1000, cong1000, tru1000]),
      bai2: { prompt: "Tính:", gens: [LOP3.bieuThuc67, LOP3.bieuThuc67], work: "lines" },
      bai3: BAI_GIAI(either(LOP3.loiVanHaiBuoc67, LOP3.loiVan89, LOP3.loiVan34)),
      bai4: timSoBiet,
    },
    "cuoi-hk1": {
      mcq: [gapGiamMcq, choice(LOP3.motPhanMay), hinhTron3, choice(doiDonViHK1), choice(LOP3.timThanhPhanNhanChia),
        phanSoHinh(true), either(demTamGiac([2, 3], false), demTuGiac([2, 3], "hình chữ nhật", false)), choice(LOP3.bieuThuc3)],
      bai1: DAT_TINH([nhan3, chia3, nhan3, chia3]),
      bai2: { prompt: "Tính giá trị biểu thức:", gens: [LOP3.bieuThuc3, LOP3.bieuThuc3], work: "lines" },
      bai3: BAI_GIAI(either(LOP3.loiVanGapGiam, LOP3.loiVanHaiBuoc67)),
      bai4: timSoBiet,
    },
    "giua-hk2": {
      mcq: [choice(LOP3.cauTaoSo), choice(LOP3.giaTriChuSo3), LOP3.soSanh100000, LOP3.sapXep100000, LOP3.lamTron3, LOP3.soLaMa,
        hinhCN("chuVi"), hinhCN("dienTich")],
      bai1: DAT_TINH([cong5, tru5, cong5, tru5]),
      bai2: { prompt: "Tính giá trị biểu thức:", gens: [bieuThucLon, bieuThucLon], work: "lines" },
      bai3: BAI_GIAI(hcnLoiVan),
      bai4: soLapDuoc(4),
    },
    "cuoi-hk2": {
      mcq: [LOP3.soSanh100000, LOP3.lamTron3, xemGio(range(0, 11).map((i) => i * 5)), LOP3.thangNam,
        tienHinh([1000, 2000, 5000, 10000, 20000, 50000], [3, 5]), choice(LOP3.doiDonVi3), either(hinhCN("chuVi"), hinhCN("dienTich")), LOP3.soLaMa],
      bai1: DAT_TINH([cong5, tru5, nhan5, chia5]),
      bai2: { prompt: "Tính giá trị biểu thức:", gens: [bieuThucLon, bieuThucLon], work: "lines" },
      bai3: BAI_GIAI(either(hcnLoiVan, LOP3.tienVN3)),
      bai4: either(soLapDuoc(5), timSoBiet),
    },
  },
  4: {
    "giua-hk1": {
      mcq: [LOP4.hangLop, choice(LOP4.giaTriChuSo), LOP4.soSanhSoLon, LOP4.sapXepSoLon, LOP4.lamTron, choice(LOP4.doiKhoiLuong),
        choice(LOP4.thoiGian4), gocHinh],
      bai1: DAT_TINH([cong6, tru6, cong6, tru6]),
      bai2: { prompt: "Viết số thích hợp vào chỗ chấm:", gens: [fillOnly(LOP4.doiKhoiLuong), fillOnly(LOP4.thoiGian4)], work: "none" },
      bai3: BAI_GIAI(LOP4.loiVanCongTru4),
      bai4: LOP4.tinhThuanTien,
    },
    "cuoi-hk1": {
      mcq: [either(LOP4.soSanhSoLon, LOP4.lamTron), choice(LOP4.giaTriChuSo), choice(LOP4.doiDienTich), choice(tbcSo), gocHinh,
        hinhNhanDang, LOP4.dungSai4, choice(LOP4.timThanhPhan4)],
      bai1: DAT_TINH([cong6, tru6, cong6, tru6]),
      bai2: { prompt: "Tính bằng cách thuận tiện:", gens: [LOP4.tinhThuanTien, LOP4.tinhThuanTien], work: "lines" },
      bai3: BAI_GIAI(tongHieuBai),
      bai4: tbcBai,
    },
    "giua-hk2": {
      mcq: [choice(LOP4.nhanSoLon), choice(chia4), choice(LOP4.nhanChia10), choice(chiaDu4), bieuDoCot, choice(tbcSo), hinhNhanDang,
        choice(LOP4.doiDienTich)],
      bai1: DAT_TINH([LOP4.nhanSoLon, LOP4.nhanSoLon, chia4, chia4]),
      bai2: { prompt: "Tính bằng cách thuận tiện:", gens: [thuanTienNhan, thuanTienNhan], work: "lines" },
      bai3: BAI_GIAI(LOP4.loiVanNhanChia4),
      bai4: either(tbcBai, tongHieuBai),
    },
    "cuoi-hk2": {
      mcq: [phanSoHinh(false), choice(LOP4.rutGonPhanSo), LOP4.phanSoBangNhau, LOP4.soSanhPhanSo, LOP4.congTruPhanSo, LOP4.nhanChiaPhanSo,
        bieuDoCot, either(hinhNhanDang, choice(LOP4.nhanSoLon))],
      bai1: DAT_TINH([LOP4.nhanSoLon, LOP4.nhanSoLon, chia4, chia4]),
      bai2: { prompt: "Tính:", gens: [tinhPhanSo, tinhPhanSo], work: "lines" },
      bai3: BAI_GIAI(either(phanSoLoiVan, LOP4.loiVanNhanChia4)),
      bai4: either(thuanTienPhanSo, thuanTienNhan),
    },
  },
};

export type SmallGrade = 1 | 2 | 3 | 4;
export const isSmallGrade = (g: number): g is SmallGrade => g === 1 || g === 2 || g === 3 || g === 4;

/** Thời gian làm bài: lớp 1–2 35 phút, lớp 3–4 40 phút (như đề lớp 5). */
export const toanMinutes = (grade: SmallGrade) => (grade <= 2 ? 35 : 40);

/** Số câu làm trên máy (mọi câu của đề đều chấm được). */
export function toanCount(grade: SmallGrade, kind: ExamKind): number {
  const bp = BLUEPRINTS[grade][kind];
  return bp.mcq.length + bp.bai1.gens.length + bp.bai2.gens.length + 2;
}

export function buildToan1to4(grade: SmallGrade, kind: ExamKind, kindLabel: string, seed: string): ExamPaper {
  const r = mulberry32(seedFrom(`toan${grade}|${kind}|${seed}`));
  const bp = BLUEPRINTS[grade][kind];
  const seen = new Set<string>();
  // Không có hai câu trùng nội dung trong một đề.
  const make = (g: Generator): GenQuestionRow => {
    for (let t = 0; t < 40; t++) {
      const row = prettyRow(toQuestionRow(g(r), r));
      const key = row.content + "\u0000" + row.options.join("\u0000");
      if (!seen.has(key) || t === 39) { seen.add(key); return row; }
    }
    throw new Error("unreachable");
  };
  const q = (g: Generator, points: number, extra: Partial<PaperQuestion> = {}): PaperQuestion => ({ row: make(g), points, ...extra });
  // Trong nhóm đã có lời dẫn ("Tính giá trị biểu thức:") thì bỏ phần lặp ở đầu từng ý.
  const group = (b: GroupBp): PaperGroup => ({
    prompt: b.prompt, work: b.work,
    parts: b.gens.map((g) => {
      const p = q(g, 0.5);
      return { ...p, row: { ...p.row, content: p.row.content.startsWith(b.prompt) ? p.row.content.slice(b.prompt.length).trim() : p.row.content } };
    }),
  });

  const mcq: PaperItem[] = bp.mcq.map((g) => q(g, 0.5));
  const bai3 = q(bp.bai3.gen, 2, { work: bp.bai3.work, lines: bp.bai3.lines });
  // Bài 4 có thể là bài toán ("Bài giải"), câu đếm hình (điền ngay trong câu) hoặc phép tính (dòng kẻ).
  const bai4 = q(bp.bai4, 1);
  Object.assign(bai4, /Trả lời: ___/.test(bai4.row.content) ? { work: "bai-giai", lines: 3 }
    : /^Hình bên có ___/.test(bai4.row.content) ? { work: "none" } : { work: "lines", lines: 2 });

  return {
    title: `Đề kiểm tra ${kindLabel.replace(/^./, (c) => c.toLowerCase())} – Toán lớp ${grade}`,
    subject: "Toán", grade, kindLabel, minutes: toanMinutes(grade),
    sections: [
      { title: "PHẦN I. TRẮC NGHIỆM", note: "Khoanh vào chữ đặt trước câu trả lời đúng.", label: "Câu", items: mcq },
      { title: "PHẦN II. TỰ LUẬN", label: "Bài", items: [group(bp.bai1), group(bp.bai2), bai3, bai4] },
    ],
  };
}
