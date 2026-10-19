// lib/exam5/toan5.ts
// Đề kiểm tra Toán lớp 5 theo cấu trúc đề giấy thường gặp (Thông tư 27, chương trình
// GDPT 2018): Phần I trắc nghiệm 8 câu × 0,5 điểm; Phần II tự luận: đặt tính (2 điểm),
// tìm x (1 điểm), bài toán có lời văn (2 điểm), bài cuối (1 điểm). Tổng 10 điểm.
//
// Dùng lại các dạng bài ở lib/mathGen/lop5.ts, thêm các dạng có hình vẽ (./figures.ts)
// và các dạng tự luận của đề thật. Mọi đáp án do máy tính tính bằng Dec (không float).
// Câu có lời văn theo đúng quy ước của lib/worksheetExport.ts: "… Hỏi …? Trả lời: ___ đơn vị."
// — bản in bỏ phần "Trả lời" và để chỗ "Bài giải".

import {
  type Draft, type Generator, type Rng, type Dec,
  int, pick, chance, retry, gcd, dec, add, sub, mul, cmp, shift, divInt, fmt, fmtInt,
  mcOptions, blanks, mulberry32, seedFrom,
} from "../mathGen/core";
import { LOP5, toQuestionRow, type GenQuestionRow } from "../mathGen";
import { NAMES } from "../mathGen/shared";
import type { ExamKind } from "../quickExam";
import type { ExamPaper, PaperGroup, PaperItem, PaperQuestion } from "./paper";
import {
  boxSvg, circleSvg, fanTriangleCount, fanTrianglesSvg, pieSvg, rectSemicircleSvg, rightTriangleSvg,
  trapezoidSvg, triangleSvg,
} from "./figures";

const PI = dec(314, 2);
const LEN_UNITS = ["cm", "dm", "m"] as const;

function randDec(r: Rng, lo: number, hi: number, places: number): Dec {
  return retry(() => {
    const p = int(r, 1, places);
    const d = dec(int(r, lo, hi) * 10 ** p + int(r, 1, 10 ** p - 1), p);
    return d.p > 0 ? d : null;
  });
}

/** Số đo cạnh: phần lớn là số tự nhiên, đôi khi có một chữ số thập phân. */
const side = (r: Rng, lo: number, hi: number) => (chance(r, 0.75) ? dec(int(r, lo, hi)) : randDec(r, lo, hi - 1, 1));

/* ═════════════ Trắc nghiệm: đổi câu điền số thành câu khoanh ═════════════ */

/** "1.250,5" (kiểu Việt Nam) → Dec. null nếu không phải số. */
function readVn(s: string): Dec | null {
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(s)) return null;
  const [i, f = ""] = s.replace(/\./g, "").split(",");
  return dec(Number(i + f), f.length);
}

type Frac = { n: number; d: number };
const simp = ({ n, d }: Frac): Frac => { const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
const fracText = ({ n, d }: Frac) => (d === 1 ? String(n) : `${n}/${d}`);
const fracEq = (a: Frac, b: Frac) => a.n * b.d === b.n * a.d;

/**
 * Câu điền một chỗ trống → câu trắc nghiệm 4 lựa chọn, đáp án nhiễu là các lỗi hay gặp
 * (dời nhầm dấu phẩy, lệch một đơn vị ở chữ số cuối, nhân đôi). null nếu không đổi được.
 */
export function asChoice(d: Draft, r: Rng): Draft | null {
  if (d.type !== "fill_blank") return d;
  const a = d.answers[0];
  const question = d.question.replace("___", "…");
  const common = { difficulty: d.difficulty, tags: d.tags, question, image: d.image, explanation: d.explanation, hint: d.hint };
  const v = readVn(a);
  if (v) {
    const step = dec(1, v.p);
    const cands = [shift(v, 1), shift(v, -1), add(v, step), sub(v, step), add(v, dec(10, v.p)), mul(v, dec(2))]
      .filter((x) => cmp(x, dec(0)) > 0 && cmp(x, v) !== 0)
      .map((x) => fmt(x));
    try {
      return { ...common, type: "multiple_choice", ...mcOptions(r, fmt(v), cands) };
    } catch { return null; }
  }
  const m = a.match(/^(\d+)\/(\d+)$/);
  if (m) {
    const f = { n: +m[1], d: +m[2] };
    const cands = [{ n: f.d, d: f.n }, { n: f.n + 1, d: f.d }, { n: Math.max(1, f.n - 1), d: f.d }, { n: f.n, d: f.d + 1 }, { n: f.n * 2, d: f.d + 1 }]
      .filter((x) => x.n > 0 && x.d > 0 && !fracEq(x, f))
      .map(fracText);
    try {
      return { ...common, type: "multiple_choice", ...mcOptions(r, a, cands) };
    } catch { return null; }
  }
  return null;
}

/** Sinh lại tới khi `ok` đúng — dùng để giới hạn một dạng bài vào nội dung của kì. */
const only = (g: Generator, ok: (d: Draft) => boolean): Generator => (r) => retry(() => { const d = g(r); return ok(d) ? d : null; });
const choice = (g: Generator): Generator => (r) => retry(() => asChoice(g(r), r));
const either = (...gs: Generator[]): Generator => (r) => pick(r, gs)(r);

const VOLUME = /m³|dm³|cm³/;
const doiDonViHK1 = only(LOP5.doiDonVi, (d) => !VOLUME.test(d.question));
const doiDonViTheTich = only(LOP5.doiDonVi, (d) => VOLUME.test(d.question));

/* ═════════════ Câu có hình vẽ ═════════════ */

/** Đáp án nhiễu là các lỗi hay gặp; số nhỏ dễ trùng nhau thì mới bù bằng "lệch 1, lệch 2, gấp đôi". */
function withUnit(r: Rng, correct: Dec, wrong: Dec[], unit: string) {
  const key = (x: Dec) => fmt(x);
  const pool = [...new Set(wrong.filter((x) => cmp(x, dec(0)) > 0 && cmp(x, correct) !== 0).map(key))];
  for (const x of [add(correct, dec(1)), add(correct, dec(2)), mul(correct, dec(2))]) {
    if (pool.length >= 3) break;
    if (!pool.includes(key(x))) pool.push(key(x));
  }
  return mcOptions(r, `${fmt(correct)} ${unit}`, pool.map((x) => `${x} ${unit}`));
}

export const tamGiacHinh: Generator = (r) => {
  const u = pick(r, LEN_UNITS);
  const a = side(r, 6, 30), h = side(r, 4, 20);
  const s = divInt(mul(a, h), 2);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["hình tam giác", "diện tích", "hình vẽ"],
    question: `Cho hình tam giác ABC có đáy BC = ${fmt(a)} ${u}, chiều cao AH = ${fmt(h)} ${u} (như hình vẽ). Diện tích hình tam giác ABC là:`,
    image: triangleSvg({ base: `${fmt(a)} ${u}`, height: `${fmt(h)} ${u}`, baseVal: Number(fmt(a).replace(",", ".")), heightVal: Number(fmt(h).replace(",", ".")), footT: 0.25 + r() * 0.3 }),
    ...withUnit(r, s, [mul(a, h), add(s, h), mul(add(a, h), dec(2)), sub(s, dec(1))], `${u}²`),
    explanation: `Diện tích tam giác = đáy × chiều cao : 2 = ${fmt(a)} × ${fmt(h)} : 2 = ${fmt(s)} (${u}²).`,
    hint: "Nhớ chia cho 2.",
  };
};

export const tamGiacVuong: Generator = (r) => {
  const u = pick(r, LEN_UNITS);
  const ab = int(r, 3, 16), ac = int(r, 4, 20);
  const s = divInt(dec(ab * ac), 2);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["tam giác vuông", "diện tích", "hình vẽ"],
    question: `Hình tam giác ABC vuông tại A có AB = ${ab} ${u}, AC = ${ac} ${u} (như hình vẽ). Diện tích hình tam giác ABC là:`,
    image: rightTriangleSvg({ ab: `${ab} ${u}`, ac: `${ac} ${u}`, abVal: ab, acVal: ac }),
    ...withUnit(r, s, [dec(ab * ac), dec((ab + ac) * 2), add(s, dec(ab)), dec(ab + ac)], `${u}²`),
    explanation: `Tam giác vuông có hai cạnh góc vuông là đáy và chiều cao: S = ${ab} × ${ac} : 2 = ${fmt(s)} (${u}²).`,
    hint: "Hai cạnh góc vuông chính là đáy và chiều cao.",
  };
};

export const hinhThangHinh: Generator = (r) => {
  const u = pick(r, LEN_UNITS);
  const [a, b] = retry(() => { const x = side(r, 4, 20), y = side(r, 8, 32); return cmp(y, add(x, dec(2))) > 0 ? [x, y] : null; });
  const h = side(r, 3, 15);
  const s = divInt(mul(add(a, b), h), 2);
  const right = chance(r, 0.4);
  const num = (d: Dec) => Number(fmt(d).replace(/\./g, "").replace(",", "."));
  return {
    type: "multiple_choice", difficulty: "hard", tags: ["hình thang", "diện tích", "hình vẽ"],
    question: `Cho hình thang ${right ? "vuông " : ""}ABCD có đáy bé AB = ${fmt(a)} ${u}, đáy lớn DC = ${fmt(b)} ${u}, chiều cao ${right ? "AD" : "AH"} = ${fmt(h)} ${u} (như hình vẽ). Diện tích hình thang ABCD là:`,
    image: trapezoidSvg({ top: `${fmt(a)} ${u}`, bottom: `${fmt(b)} ${u}`, height: `${fmt(h)} ${u}`, topVal: num(a), bottomVal: num(b), heightVal: num(h), right }),
    ...withUnit(r, s, [mul(add(a, b), h), divInt(mul(mul(a, b), dec(1)), 2), add(s, h), sub(s, a)], `${u}²`),
    explanation: `S = (đáy lớn + đáy bé) × chiều cao : 2 = (${fmt(b)} + ${fmt(a)}) × ${fmt(h)} : 2 = ${fmt(s)} (${u}²).`,
    hint: "Cộng hai đáy, nhân chiều cao rồi chia 2.",
  };
};

export const hinhTronHinh: Generator = (r) => {
  const u = pick(r, LEN_UNITS);
  const givenR = chance(r, 0.5);
  const rad = dec(int(r, 2, 12));
  const d = mul(rad, dec(2));
  const askC = chance(r, 0.5);
  const C = mul(d, PI), S = mul(mul(rad, rad), PI);
  const what = askC ? "Chu vi" : "Diện tích";
  const correct = askC ? C : S;
  const wrong = askC
    ? [mul(rad, PI), S, mul(mul(d, d), PI), add(C, dec(1)), mul(C, dec(2))]
    : [mul(mul(d, d), PI), C, mul(rad, PI), mul(mul(rad, dec(2)), PI), add(S, dec(1))];
  return {
    type: "multiple_choice", difficulty: "hard", tags: ["hình tròn", askC ? "chu vi" : "diện tích", "hình vẽ"],
    question: `Hình tròn tâm O có ${givenR ? `bán kính ${fmt(rad)} ${u}` : `đường kính ${fmt(d)} ${u}`} (như hình vẽ). ${what} hình tròn là:`,
    image: circleSvg({ label: `${fmt(givenR ? rad : d)} ${u}`, kind: givenR ? "r" : "d" }),
    ...withUnit(r, correct, wrong, askC ? u : `${u}²`),
    explanation: askC
      ? `C = đường kính × 3,14 = ${fmt(d)} × 3,14 = ${fmt(C)} (${u}).${givenR ? ` (Đường kính = ${fmt(rad)} × 2 = ${fmt(d)} ${u}.)` : ""}`
      : `S = bán kính × bán kính × 3,14 = ${fmt(rad)} × ${fmt(rad)} × 3,14 = ${fmt(S)} (${u}²).${givenR ? "" : ` (Bán kính = ${fmt(d)} : 2 = ${fmt(rad)} ${u}.)`}`,
    hint: askC ? "C = d × 3,14." : "S = r × r × 3,14.",
  };
};

export const hinhHopHinh: Generator = (r) => {
  const u = pick(r, LEN_UNITS);
  const cube = chance(r, 0.35);
  const l = int(r, 4, 15), w = cube ? l : int(r, 2, l - 1), h = cube ? l : int(r, 2, 12);
  const what = pick(r, ["V", "Sxq", "Stp"] as const);
  const V = l * w * h, Sxq = (l + w) * 2 * h, Stp = Sxq + 2 * l * w;
  const val = { V, Sxq, Stp }[what];
  const label = { V: "Thể tích", Sxq: "Diện tích xung quanh", Stp: "Diện tích toàn phần" }[what];
  const unit = what === "V" ? `${u}³` : `${u}²`;
  const name = cube ? "hình lập phương" : "hình hộp chữ nhật";
  const formula = cube
    ? { V: `${l} × ${l} × ${l}`, Sxq: `${l} × ${l} × 4`, Stp: `${l} × ${l} × 6` }[what]
    : { V: `${l} × ${w} × ${h}`, Sxq: `(${l} + ${w}) × 2 × ${h}`, Stp: `${Sxq} + ${l} × ${w} × 2` }[what];
  return {
    type: "multiple_choice", difficulty: what === "V" ? "medium" : "hard", tags: [name, what === "V" ? "thể tích" : "diện tích", "hình vẽ"],
    question: cube
      ? `Một hình lập phương có cạnh ${l} ${u} (như hình vẽ). ${label} của hình lập phương là:`
      : `Một hình hộp chữ nhật có chiều dài ${l} ${u}, chiều rộng ${w} ${u}, chiều cao ${h} ${u} (như hình vẽ). ${label} của hình hộp chữ nhật là:`,
    image: boxSvg({ length: `${l} ${u}`, width: `${w} ${u}`, height: `${h} ${u}`, lVal: l, wVal: w, hVal: h }),
    ...withUnit(r, dec(val), [V, Sxq, Stp, (l + w + h) * 4, l * w * 2, Sxq + l * w].filter((x) => x !== val).map((x) => dec(x)), unit),
    explanation: `${label} = ${formula} = ${fmtInt(val)} (${unit}).`,
    hint: { V: "V = dài × rộng × cao.", Sxq: "Sxq = chu vi đáy × chiều cao.", Stp: "Stp = Sxq + 2 × diện tích đáy." }[what],
  };
};

const PIE_TOPICS = [
  { title: "Môn thể thao yêu thích", who: "học sinh", items: ["Bóng đá", "Bơi", "Cầu lông", "Cờ vua", "Đá cầu"] },
  { title: "Loại quả yêu thích", who: "học sinh", items: ["Cam", "Xoài", "Chuối", "Dưa hấu", "Nho"] },
  { title: "Cách đến trường", who: "học sinh", items: ["Đi bộ", "Xe đạp", "Xe máy", "Ô tô", "Xe buýt"] },
  { title: "Loại sách yêu thích", who: "học sinh", items: ["Truyện tranh", "Khoa học", "Cổ tích", "Thơ", "Lịch sử"] },
];

export const bieuDoQuat: Generator = (r) => {
  const t = pick(r, PIE_TOPICS);
  const k = int(r, 3, 4);
  // Phần trăm là bội của 5, mỗi phần ≥ 10%, tổng 100%.
  const pcts = retry(() => {
    const xs = Array.from({ length: k - 1 }, () => int(r, 2, 9) * 5);
    const last = 100 - xs.reduce((s, x) => s + x, 0);
    return last >= 10 && last % 5 === 0 ? [...xs, last].sort((a, b) => b - a) : null;
  });
  const names = pick(r, [t.items.slice(0, k), t.items.slice(1, k + 1)]);
  const parts = names.map((n, i) => [n, pcts[i]] as [string, number]);
  const N = pick(r, [20, 40, 60, 80, 120, 200]);
  const cls = pick(r, ["5A", "5B", "khối lớp 5"]);
  const i = int(r, 0, k - 1);
  const [name, p] = parts[i];
  const ans = (N * p) / 100;
  const cands = [ans + 1, ans - 1, p, (N * (100 - p)) / 100, ans * 2, ans + 5].filter((x) => x > 0 && Number.isInteger(x)).map(String);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["biểu đồ hình quạt", "tỉ số phần trăm", "hình vẽ"],
    question: `Biểu đồ hình quạt dưới đây cho biết kết quả điều tra “${t.title.toLowerCase()}” của ${N} ${t.who} ${cls}. Số ${t.who} chọn “${name}” là:`,
    image: pieSvg(parts, `${t.title} (${cls})`),
    ...mcOptions(r, `${ans} ${t.who}`, cands.map((c) => `${c} ${t.who}`)),
    explanation: `“${name}” chiếm ${p}%. Số ${t.who}: ${N} × ${p} : 100 = ${ans} (${t.who}).`,
    hint: "Tìm p% của tổng số: lấy tổng số × p : 100.",
  };
};

export const demTamGiac: Generator = (r) => {
  const k = int(r, 1, 4);
  const n = fanTriangleCount(k);
  return {
    type: "multiple_choice", difficulty: "hard", tags: ["đếm hình", "hình vẽ"],
    question: "Hình vẽ bên có bao nhiêu hình tam giác?",
    image: fanTrianglesSvg(k),
    ...mcOptions(r, String(n), [n - 1, n + 1, n + 2, n - 2, k + 1, 2 * (k + 1)].filter((x) => x > 0 && x !== n).map(String)),
    explanation: `Trên cạnh BC có ${k + 2} điểm; mỗi cặp điểm cùng với A tạo thành một tam giác. Số tam giác: ${Array.from({ length: k + 1 }, (_, i) => k + 1 - i).join(" + ")} = ${n}.`,
    hint: "Đếm theo số đoạn thẳng nhỏ ghép lại trên cạnh BC.",
  };
};

/* ═════════════ Tự luận ═════════════ */

const fill = (question: string, answer: string, explanation: string, tags: string[], image?: string): Draft => ({
  type: "fill_blank", difficulty: "medium", tags, question, ...blanks(answer), explanation, ...(image ? { image } : {}),
});

/** Đặt tính rồi tính với số thập phân (một phép mỗi ý). */
export const datTinh = (op: "+" | "-" | "×" | ":"): Generator => (r) => {
  switch (op) {
    case "+": { const a = randDec(r, 10, 999, 2), b = randDec(r, 1, 99, 2); const c = add(a, b);
      return fill(`${fmt(a)} + ${fmt(b)} = ___`, fmt(c), `Đặt tính thẳng cột dấu phẩy rồi cộng: ${fmt(a)} + ${fmt(b)} = ${fmt(c)}.`, ["đặt tính", "phép cộng"]); }
    case "-": { let a = randDec(r, 10, 999, 2), b = randDec(r, 1, 99, 2); if (cmp(a, b) <= 0) [a, b] = [add(b, dec(10)), a]; const c = sub(a, b);
      return fill(`${fmt(a)} - ${fmt(b)} = ___`, fmt(c), `Đặt tính thẳng cột dấu phẩy rồi trừ: ${fmt(a)} - ${fmt(b)} = ${fmt(c)}.`, ["đặt tính", "phép trừ"]); }
    case "×": { const a = randDec(r, 1, 99, chance(r, 0.5) ? 2 : 1), b = chance(r, 0.5) ? dec(int(r, 12, 48)) : randDec(r, 1, 9, 1); const c = mul(a, b);
      return fill(`${fmt(a)} × ${fmt(b)} = ___`, fmt(c), `Nhân như số tự nhiên rồi đếm chữ số ở phần thập phân để đặt dấu phẩy: ${fmt(a)} × ${fmt(b)} = ${fmt(c)}.`, ["đặt tính", "phép nhân"]); }
    case ":": {
      const byDec = chance(r, 0.4);
      const d = byDec ? pick(r, [dec(25, 1), dec(15, 1), dec(12, 1), dec(45, 1), dec(32, 1)]) : dec(int(r, 3, 28));
      const q = byDec ? dec(int(r, 12, 99)) : randDec(r, 1, 30, 2);
      const a = mul(q, d);
      return fill(`${fmt(a)} : ${fmt(d)} = ___`, fmt(q), `${byDec ? "Chuyển dấu phẩy của số chia và số bị chia sang phải cùng số chữ số, rồi chia" : "Chia như số tự nhiên, đến phần thập phân thì đánh dấu phẩy ở thương"}: ${fmt(a)} : ${fmt(d)} = ${fmt(q)}.`, ["đặt tính", "phép chia"]);
    }
  }
};

/** Tính với phân số (giữa học kì I — ôn tập phân số). */
export const tinhPhanSo: Generator = (r) => {
  const op = pick(r, ["+", "-", "×", ":"] as const);
  return retry(() => {
    const a = simp({ n: int(r, 1, 9), d: int(r, 2, 10) }), b = simp({ n: int(r, 1, 9), d: int(r, 2, 10) });
    if (a.d === 1 || b.d === 1) return null;
    let c: Frac;
    switch (op) {
      case "+": c = simp({ n: a.n * b.d + b.n * a.d, d: a.d * b.d }); break;
      case "-": if (a.n * b.d <= b.n * a.d) return null; c = simp({ n: a.n * b.d - b.n * a.d, d: a.d * b.d }); break;
      case "×": c = simp({ n: a.n * b.n, d: a.d * b.d }); break;
      case ":": c = simp({ n: a.n * b.d, d: a.d * b.n }); break;
    }
    if (c.d > 60 || c.n > 99) return null;
    return fill(`${fracText(a)} ${op} ${fracText(b)} = ___`, fracText(c),
      `${op === "+" || op === "-" ? "Quy đồng mẫu số rồi " + (op === "+" ? "cộng" : "trừ") + " tử số" : op === "×" ? "Nhân tử với tử, mẫu với mẫu" : "Nhân với phân số đảo ngược"}, rút gọn: ${fracText(a)} ${op} ${fracText(b)} = ${fracText(c)}.`,
      ["phân số", "tính"]);
  });
};

/** Tìm x với số thập phân. */
export const timXSTP: Generator = (r) => {
  const kind = pick(r, ["+", "-", "×", ":", "a-x", "a:x"] as const);
  const x = randDec(r, 1, 40, 2);
  const k = chance(r, 0.5) ? dec(int(r, 2, 9)) : randDec(r, 1, 9, 1);
  let q: string, b: Dec, how: string;
  switch (kind) {
    case "+": b = add(x, k); q = `x + ${fmt(k)} = ${fmt(b)}`; how = `x = ${fmt(b)} - ${fmt(k)}`; break;
    case "-": b = sub(x, k); if (cmp(b, dec(0)) <= 0) { b = add(x, k); q = `x + ${fmt(k)} = ${fmt(b)}`; how = `x = ${fmt(b)} - ${fmt(k)}`; break; }
      q = `x - ${fmt(k)} = ${fmt(b)}`; how = `x = ${fmt(b)} + ${fmt(k)}`; break;
    case "×": b = mul(x, k); q = `x × ${fmt(k)} = ${fmt(b)}`; how = `x = ${fmt(b)} : ${fmt(k)}`; break;
    case ":": b = x; { const xx = mul(x, k); q = `x : ${fmt(k)} = ${fmt(b)}`; how = `x = ${fmt(b)} × ${fmt(k)}`;
      return fill(`Tìm x: ${q}. Vậy x = ___`, fmt(xx), `${how} = ${fmt(xx)}.`, ["tìm x"]); }
    case "a-x": { const a = add(x, k); q = `${fmt(a)} - x = ${fmt(k)}`; how = `x = ${fmt(a)} - ${fmt(k)}`; break; }
    case "a:x": { const a = mul(x, k); q = `${fmt(a)} : x = ${fmt(k)}`; how = `x = ${fmt(a)} : ${fmt(k)}`; break; }
  }
  return fill(`Tìm x: ${q}. Vậy x = ___`, fmt(x), `${how} = ${fmt(x)}.`, ["tìm x"]);
};

/** Tìm x với phân số (giữa học kì I). */
export const timXPhanSo: Generator = (r) => retry(() => {
  const x = simp({ n: int(r, 1, 7), d: int(r, 2, 9) }), k = simp({ n: int(r, 1, 7), d: int(r, 2, 9) });
  if (x.d === 1 || k.d === 1 || fracEq(x, k)) return null;
  const op = pick(r, ["+", "×", "-"] as const);
  let b: Frac, how: string;
  if (op === "+") { b = simp({ n: x.n * k.d + k.n * x.d, d: x.d * k.d }); how = `x = ${fracText(b)} - ${fracText(k)}`; }
  else if (op === "×") { b = simp({ n: x.n * k.n, d: x.d * k.d }); how = `x = ${fracText(b)} : ${fracText(k)}`; }
  else { if (x.n * k.d <= k.n * x.d) return null; b = simp({ n: x.n * k.d - k.n * x.d, d: x.d * k.d }); how = `x = ${fracText(b)} + ${fracText(k)}`; }
  if (b.d > 60 || b.n > 99) return null;
  return fill(`Tìm x: x ${op} ${fracText(k)} = ${fracText(b)}. Vậy x = ___`, fracText(x), `${how} = ${fracText(x)}.`, ["tìm x", "phân số"]);
});

/** Tính bằng cách thuận tiện nhất: a × b + a × c với b + c = 10 hoặc 100. */
export const tinhThuanTien: Generator = (r) => {
  const a = randDec(r, 1, 30, 2);
  const total = pick(r, [dec(10), dec(100), dec(1)]);
  const b = cmp(total, dec(1)) === 0 ? dec(int(r, 11, 89), 2) : cmp(total, dec(10)) === 0 ? randDec(r, 1, 8, 1) : dec(int(r, 11, 89));
  const c = sub(total, b);
  const res = mul(a, total);
  const minus = chance(r, 0.3);
  if (minus) {
    const big = add(total, b);
    return fill(`Tính bằng cách thuận tiện nhất: ${fmt(a)} × ${fmt(big)} - ${fmt(a)} × ${fmt(b)} = ___`, fmt(res),
      `${fmt(a)} × ${fmt(big)} - ${fmt(a)} × ${fmt(b)} = ${fmt(a)} × (${fmt(big)} - ${fmt(b)}) = ${fmt(a)} × ${fmt(total)} = ${fmt(res)}.`, ["tính thuận tiện"]);
  }
  return fill(`Tính bằng cách thuận tiện nhất: ${fmt(a)} × ${fmt(b)} + ${fmt(a)} × ${fmt(c)} = ___`, fmt(res),
    `${fmt(a)} × ${fmt(b)} + ${fmt(a)} × ${fmt(c)} = ${fmt(a)} × (${fmt(b)} + ${fmt(c)}) = ${fmt(a)} × ${fmt(total)} = ${fmt(res)}.`, ["tính thuận tiện"]);
};

/** Tính thuận tiện với phân số: a/b × c/d + a/b × e/d với c + e = d. */
export const thuanTienPhanSo: Generator = (r) => retry(() => {
  const a = simp({ n: int(r, 1, 8), d: int(r, 2, 9) });
  const d = int(r, 3, 11), c = int(r, 1, d - 1), e = d - c;
  if (a.d === 1 || gcd(c, d) !== 1 || gcd(e, d) !== 1) return null;
  return fill(`Tính bằng cách thuận tiện nhất: ${fracText(a)} × ${c}/${d} + ${fracText(a)} × ${e}/${d} = ___`, fracText(a),
    `${fracText(a)} × (${c}/${d} + ${e}/${d}) = ${fracText(a)} × 1 = ${fracText(a)}.`, ["tính thuận tiện", "phân số"]);
});

/** Mảnh vườn hình chữ nhật ghép nửa hình tròn — diện tích. */
export const hinhGhep: Generator = (r) => {
  const b = int(r, 2, 10) * 2, a = int(r, b + 2, 40); // chiều dài luôn lớn hơn chiều rộng
  const rad = b / 2;
  const half = divInt(mul(dec(rad * rad), PI), 2);
  const s = add(dec(a * b), half);
  return fill(
    `Một mảnh vườn gồm một hình chữ nhật chiều dài ${a} m, chiều rộng ${b} m và một nửa hình tròn có đường kính bằng chiều rộng hình chữ nhật (như hình vẽ). Tính diện tích mảnh vườn. Trả lời: ___ m².`,
    fmt(s),
    `Diện tích hình chữ nhật: ${a} × ${b} = ${a * b} (m²). Bán kính nửa hình tròn: ${b} : 2 = ${rad} (m). Diện tích nửa hình tròn: ${rad} × ${rad} × 3,14 : 2 = ${fmt(half)} (m²). Diện tích mảnh vườn: ${a * b} + ${fmt(half)} = ${fmt(s)} (m²).`,
    ["hình ghép", "diện tích", "hình vẽ"],
    rectSemicircleSvg({ a: `${a} m`, b: `${b} m`, aVal: a, bVal: b }),
  );
};

/* ───── Bài toán có lời văn (2 điểm) ───── */

export const tongTi: Generator = (r) => retry(() => {
  const m = int(r, 1, 7), n = int(r, m + 1, 9);
  if (gcd(m, n) !== 1) return null;
  const k = int(r, 3, 25), total = k * (m + n), small = k * m;
  const ctx = pick(r, [
    { q: `Hai thùng có tất cả ${total} lít dầu. Số dầu ở thùng thứ nhất bằng ${m}/${n} số dầu ở thùng thứ hai. Hỏi thùng thứ nhất có bao nhiêu lít dầu?`, u: "lít" },
    { q: `Lớp 5A và lớp 5B thu gom được tất cả ${total} kg giấy vụn. Số giấy lớp 5A thu được bằng ${m}/${n} số giấy của lớp 5B. Hỏi lớp 5A thu được bao nhiêu ki-lô-gam giấy vụn?`, u: "kg" },
    { q: `Một mảnh đất hình chữ nhật có nửa chu vi là ${total} m, chiều rộng bằng ${m}/${n} chiều dài. Hỏi chiều rộng mảnh đất dài bao nhiêu mét?`, u: "m" },
  ]);
  return fill(`${ctx.q} Trả lời: ___ ${ctx.u}.`, String(small),
    `Tổng số phần bằng nhau: ${m} + ${n} = ${m + n} (phần). Giá trị một phần: ${total} : ${m + n} = ${k}. Số bé: ${k} × ${m} = ${small} (${ctx.u}).`,
    ["tổng – tỉ", "toán có lời văn"]);
});

export const hieuTi: Generator = (r) => retry(() => {
  const m = int(r, 1, 5), n = int(r, m + 2, 9);
  if (gcd(m, n) !== 1) return null;
  const k = int(r, 3, 12), diff = k * (n - m), small = k * m;
  if (small > 60) return null;
  const ctx = pick(r, [
    { q: `Mẹ hơn con ${diff} tuổi. Tuổi con bằng ${m}/${n} tuổi mẹ. Hỏi năm nay con bao nhiêu tuổi?`, u: "tuổi" },
    { q: `Một cửa hàng có số gạo tẻ nhiều hơn số gạo nếp ${diff} kg. Số gạo nếp bằng ${m}/${n} số gạo tẻ. Hỏi cửa hàng có bao nhiêu ki-lô-gam gạo nếp?`, u: "kg" },
  ]);
  return fill(`${ctx.q} Trả lời: ___ ${ctx.u}.`, String(small),
    `Hiệu số phần bằng nhau: ${n} - ${m} = ${n - m} (phần). Giá trị một phần: ${diff} : ${n - m} = ${k}. Số bé: ${k} × ${m} = ${small} (${ctx.u}).`,
    ["hiệu – tỉ", "toán có lời văn"]);
});

export const thuaRuong: Generator = (r) => {
  const B = pick(r, [60, 90, 120, 150]), T = (B * 2) / 3, h = int(r, 2, 8) * 10;
  const y = pick(r, [50, 60, 64, 70, 75]);
  const S = ((B + T) * h) / 2;
  const total = divInt(dec(S * y), 100);
  return fill(
    `Một thửa ruộng hình thang có đáy lớn ${B} m, đáy bé bằng 2/3 đáy lớn, chiều cao ${h} m. Trung bình cứ 100 m² thu hoạch được ${y} kg thóc. Hỏi trên cả thửa ruộng đó người ta thu hoạch được bao nhiêu ki-lô-gam thóc? Trả lời: ___ kg.`,
    fmt(total),
    `Đáy bé: ${B} × 2 : 3 = ${T} (m). Diện tích: (${B} + ${T}) × ${h} : 2 = ${fmtInt(S)} (m²). Số thóc: ${fmtInt(S)} : 100 × ${y} = ${fmt(total)} (kg).`,
    ["hình thang", "toán có lời văn"]);
};

export const muaHang: Generator = (r) => {
  const name = pick(r, NAMES);
  const item = pick(r, [["quyển vở", 8500], ["cây bút", 6500], ["hộp màu", 24500], ["quyển truyện", 18500]] as const);
  const [what, base] = item;
  const price = base + pick(r, [0, 1000, 2000]);
  const qty = int(r, 3, 8);
  const cost = price * qty;
  const paid = Math.ceil(cost / 50000) * 50000 + (chance(r, 0.5) ? 50000 : 0);
  return fill(`${name} mua ${qty} ${what}, mỗi ${what} giá ${fmtInt(price)} đồng. ${name} đưa cho cô bán hàng ${fmtInt(paid)} đồng. Hỏi cô bán hàng phải trả lại ${name} bao nhiêu tiền? Trả lời: ___ đồng.`,
    fmtInt(paid - cost),
    `Số tiền mua: ${fmtInt(price)} × ${qty} = ${fmtInt(cost)} (đồng). Tiền trả lại: ${fmtInt(paid)} - ${fmtInt(cost)} = ${fmtInt(paid - cost)} (đồng).`,
    ["toán có lời văn", "tiền"]);
};

export const beNuoc: Generator = (r) => {
  const l = int(r, 10, 25), w = int(r, 6, l - 2), h = int(r, 2, 4) * 4; // dm; h chia hết cho 4
  const frac = pick(r, [[3, 4], [1, 2], [1, 4]] as const);
  const V = l * w * h, water = (V * frac[0]) / frac[1];
  const m = (x: number) => fmt(dec(x, 1));
  return fill(
    `Một bể nước dạng hình hộp chữ nhật có chiều dài ${m(l)} m, chiều rộng ${m(w)} m, chiều cao ${m(h)} m. Mực nước trong bể cao bằng ${frac[0]}/${frac[1]} chiều cao của bể. Hỏi trong bể đang có bao nhiêu lít nước? (1 dm³ = 1 lít) Trả lời: ___ lít.`,
    fmtInt(water),
    `Đổi: ${m(l)} m = ${l} dm; ${m(w)} m = ${w} dm; ${m(h)} m = ${h} dm. Thể tích bể: ${l} × ${w} × ${h} = ${fmtInt(V)} (dm³). Thể tích nước: ${fmtInt(V)} × ${frac[0]} : ${frac[1]} = ${fmtInt(water)} (dm³) = ${fmtInt(water)} lít.`,
    ["thể tích", "toán có lời văn"]);
};

export const phanTramBai: Generator = (r) => {
  if (chance(r, 0.5)) {
    const price = int(r, 6, 40) * 100000, p = pick(r, [5, 10, 15, 20, 25]);
    const after = (price * (100 - p)) / 100;
    const thing = pick(r, ["chiếc xe đạp", "chiếc cặp sách", "bộ bàn ghế học sinh", "chiếc đồng hồ"]);
    return fill(`Một cửa hàng bán ${thing} giá ${fmtInt(price)} đồng. Nhân dịp khai giảng, cửa hàng giảm giá ${p}%. Hỏi sau khi giảm giá, ${thing} đó giá bao nhiêu tiền? Trả lời: ___ đồng.`,
      fmtInt(after),
      `Số tiền được giảm: ${fmtInt(price)} × ${p} : 100 = ${fmtInt(price - after)} (đồng). Giá sau khi giảm: ${fmtInt(price)} - ${fmtInt(price - after)} = ${fmtInt(after)} (đồng).`,
      ["tỉ số phần trăm", "toán có lời văn"]);
  }
  const N = pick(r, [20, 25, 32, 36, 40, 45]), p = retry(() => { const x = pick(r, [20, 25, 40, 44, 48, 52, 55, 60, 75]); return (N * x) % 100 === 0 ? x : null; }, 400);
  const girls = (N * p) / 100;
  return fill(`Lớp 5B có ${N} học sinh, trong đó số học sinh nữ chiếm ${p}% số học sinh cả lớp. Hỏi lớp 5B có bao nhiêu học sinh nam? Trả lời: ___ học sinh.`,
    String(N - girls),
    `Số học sinh nữ: ${N} × ${p} : 100 = ${girls} (học sinh). Số học sinh nam: ${N} - ${girls} = ${N - girls} (học sinh).`,
    ["tỉ số phần trăm", "toán có lời văn"]);
};

export const gapNhau: Generator = (r) => {
  const t = pick(r, [dec(15, 1), dec(2), dec(25, 1), dec(3), dec(125, 2)]);
  const v1 = int(r, 30, 55), v2 = int(r, 30, 60);
  const s = mul(dec(v1 + v2), t);
  return fill(`Quãng đường AB dài ${fmt(s)} km. Cùng một lúc, một ô tô đi từ A đến B với vận tốc ${v1} km/giờ và một xe máy đi từ B đến A với vận tốc ${v2} km/giờ. Hỏi sau bao lâu hai xe gặp nhau? Trả lời: ___ giờ.`,
    fmt(t),
    `Sau mỗi giờ, hai xe đi được: ${v1} + ${v2} = ${v1 + v2} (km). Thời gian để hai xe gặp nhau: ${fmt(s)} : ${v1 + v2} = ${fmt(t)} (giờ).`,
    ["chuyển động", "toán có lời văn"]);
};

export const quangDuongGio: Generator = (r) => {
  const startH = int(r, 6, 9), startM = pick(r, [0, 15, 30, 45]);
  const dur = pick(r, [[1, 30], [2, 0], [2, 15], [2, 30], [3, 0], [1, 45]] as const);
  const v = int(r, 8, 13) * 4; // chia hết cho 4 → quãng đường là số đẹp
  const hours = dec(dur[0] * 60 + dur[1]);
  const s = divInt(mul(hours, dec(v)), 60);
  const endM = startH * 60 + startM + dur[0] * 60 + dur[1];
  const hm = (x: number) => `${Math.floor(x / 60)} giờ${x % 60 ? ` ${x % 60} phút` : ""}`;
  return fill(`Một ô tô đi từ A lúc ${hm(startH * 60 + startM)} và đến B lúc ${hm(endM)}. Biết vận tốc của ô tô là ${v} km/giờ. Tính quãng đường AB. Trả lời: ___ km.`,
    fmt(s),
    `Thời gian ô tô đi: ${hm(endM)} - ${hm(startH * 60 + startM)} = ${dur[0]} giờ${dur[1] ? ` ${dur[1]} phút` : ""} = ${fmt(divInt(hours, 60))} giờ. Quãng đường AB: ${v} × ${fmt(divInt(hours, 60))} = ${fmt(s)} (km).`,
    ["chuyển động", "số đo thời gian", "toán có lời văn"]);
};

/* ═════════════ Cấu trúc đề theo kì ═════════════ */

interface Blueprint {
  mcq: Generator[];          // 8 câu, mỗi câu 0,5 điểm
  bai1: { prompt: string; parts: Generator[] };  // 4 ý × 0,5 điểm
  bai2: Generator[];         // 2 ý × 0,5 điểm
  bai3: Generator;           // 2 điểm
  bai4: Generator;           // 1 điểm
}

const DAT_TINH = { prompt: "Đặt tính rồi tính:", parts: [datTinh("+"), datTinh("-"), datTinh("×"), datTinh(":")] };

const BLUEPRINTS: Record<ExamKind, Blueprint> = {
  "giua-hk1": {
    mcq: [LOP5.phanSoSangSTP, LOP5.hangSoThapPhan, LOP5.soSanhSTP, LOP5.sapXepSTP, choice(LOP5.honSo),
      choice(LOP5.phanSoThapPhan), choice(doiDonViHK1), demTamGiac],
    bai1: { prompt: "Tính:", parts: [tinhPhanSo, tinhPhanSo, tinhPhanSo, tinhPhanSo] },
    bai2: [timXPhanSo, timXPhanSo],
    bai3: either(tongTi, hieuTi),
    bai4: thuanTienPhanSo,
  },
  "cuoi-hk1": {
    mcq: [either(LOP5.soSanhSTP, LOP5.sapXepSTP), either(LOP5.hangSoThapPhan, LOP5.phanSoSangSTP),
      choice(either(LOP5.nhanSTP, LOP5.chiaSTP)), choice(doiDonViHK1), tamGiacHinh, hinhThangHinh, hinhTronHinh,
      either(tamGiacVuong, demTamGiac)],
    bai1: DAT_TINH,
    bai2: [timXSTP, timXSTP],
    bai3: either(thuaRuong, muaHang, tongTi),
    bai4: either(tinhThuanTien, hinhGhep),
  },
  "giua-hk2": {
    mcq: [choice(LOP5.tiSoPhanTram), bieuDoQuat, choice(LOP5.tiSoPhanTram), choice(doiDonViTheTich), hinhHopHinh,
      hinhHopHinh, either(hinhTronHinh, hinhThangHinh), either(LOP5.soSanhSTP, LOP5.dungSai5)],
    bai1: DAT_TINH,
    bai2: [timXSTP, timXSTP],
    bai3: either(beNuoc, phanTramBai),
    bai4: either(hinhGhep, tinhThuanTien),
  },
  "cuoi-hk2": {
    mcq: [choice(LOP5.tiSoPhanTram), bieuDoQuat, hinhHopHinh, choice(LOP5.thoiGian), choice(LOP5.chuyenDong),
      choice(LOP5.doiDonVi), either(hinhTronHinh, tamGiacHinh), either(LOP5.sapXepSTP, LOP5.soSanhSTP)],
    bai1: DAT_TINH,
    bai2: [timXSTP, timXSTP],
    bai3: either(gapNhau, quangDuongGio, beNuoc, phanTramBai),
    bai4: either(tinhThuanTien, hinhGhep),
  },
};

/** "3/4" → "$\frac{3}{4}$", "2 3/5" → "$2\frac{3}{5}$" để quiz hiện phân số dạng đứng như đề in. */
export function texFrac(s: string): string {
  return s
    .replace(/(\d+) (\d+)\/(\d+)(?![\d.,])/g, (_, w, n, d) => `$${w}\\frac{${n}}{${d}}$`)
    // Tử, mẫu có thể có dấu chấm ngăn nghìn: "9605/1.000" — không được cắt thành 9605/1.
    .replace(/(?<![\d$},.])(\d{1,3}(?:\.\d{3})+|\d+)\/(\d{1,3}(?:\.\d{3})+|\d+)(?![\d/,])/g, (_, n, d) => `$\\frac{${n}}{${d}}$`);
}

/** Phân số trong đề và lựa chọn trắc nghiệm hiện dạng đứng; đáp án gõ (short) giữ nguyên "3/4". */
function prettyRow(row: GenQuestionRow): GenQuestionRow {
  if (row.type === "mcq") {
    const options = row.options.map(texFrac);
    return { ...row, content: texFrac(row.content), options, correct_answer: texFrac(row.correct_answer) };
  }
  return { ...row, content: texFrac(row.content) };
}

export function buildToan5(kind: ExamKind, kindLabel: string, seed: string): ExamPaper {
  const r = mulberry32(seedFrom(`toan5|${kind}|${seed}`));
  const bp = BLUEPRINTS[kind];
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

  const mcq: PaperItem[] = bp.mcq.map((g) => q(g, 0.5));
  const bai1: PaperGroup = { prompt: bp.bai1.prompt, parts: bp.bai1.parts.map((g) => q(g, 0.5)), work: bp.bai1.prompt.startsWith("Đặt tính") ? "dat-tinh" : "lines" };
  const bai2: PaperGroup = { prompt: "Tìm x:", parts: bp.bai2.map((g) => q(g, 0.5)), work: "lines" };
  // "Tìm x: …. Vậy x = ___" — trong nhóm đã có lời dẫn "Tìm x:", bỏ phần lặp.
  bai2.parts = bai2.parts.map((p) => ({ ...p, row: { ...p.row, content: p.row.content.replace(/^Tìm x: /, "") } }));
  const bai3 = q(bp.bai3, 2, { work: "bai-giai", lines: 7 });
  // Bài 4 có thể là bài toán (hình ghép) hoặc phép tính (tính thuận tiện): chỉ bài toán mới có "Bài giải".
  const bai4 = q(bp.bai4, 1);
  Object.assign(bai4, /Trả lời: ___/.test(bai4.row.content) ? { work: "bai-giai", lines: 4 } : { work: "lines", lines: 3 });

  return {
    title: `Đề kiểm tra ${kindLabel.replace(/^./, (c) => c.toLowerCase())} – Toán lớp 5`,
    subject: "Toán", grade: 5, kindLabel, minutes: 40,
    sections: [
      { title: "PHẦN I. TRẮC NGHIỆM", note: "Khoanh vào chữ đặt trước câu trả lời đúng.", label: "Câu", items: mcq },
      { title: "PHẦN II. TỰ LUẬN", label: "Bài", items: [bai1, bai2, bai3, bai4] },
    ],
  };
}

export type { ExamPaper };
