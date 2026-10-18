// scripts/games-extra-check.ts — kiểm tra bộ sinh câu hỏi của các trò chơi thêm sau:
// so sánh số (lớp 1), tiền Việt Nam (lớp 2), làm tròn số (lớp 3), phân số / đổi đơn vị /
// từ loại (lớp 4), số thập phân / tỉ số phần trăm / kết từ (lớp 5).
// Tính lại mọi đáp án bằng code độc lập, chạy mỗi dạng hàng nghìn lần.
//
// Chạy: npx tsx scripts/games-extra-check.ts

import { makeCompareQuestion, type CompareLevel } from "../lib/games";
import { NOTES, makeMoneyQuestion, type MoneyLevel } from "../lib/games2";
import { makeRoundQuestion, type RoundLevel } from "../lib/games3";
import {
  WORD_CLASSES, makeFractionQuestion, makeUnitQuestion, makeWordClassQuestion,
  type FractionLevel, type UnitLevel, type WordClass,
} from "../lib/games4";
import { CONNECTIVES, PLACE_NAMES, makeDecimalQuestion, makePercentQuestion, type DecimalLevel, type PercentLevel } from "../lib/games5";

const RUNS = 4000;
let failures = 0;
const examples: string[] = [];
function fail(where: string, msg: string) {
  failures++;
  if (examples.length < 30) examples.push(`${where}: ${msg}`);
}

/** Bốn lựa chọn khác nhau, có đúng một đáp án. */
function checkOptions<T>(where: string, options: T[], answer: T, n = 4) {
  if (options.length !== n || new Set(options).size !== n) fail(where, `lựa chọn: ${JSON.stringify(options)}`);
  if (options.filter((o) => o === answer).length !== 1) fail(where, `thiếu đáp án ${answer} trong ${JSON.stringify(options)}`);
}

const sign = (l: number, r: number) => (l > r ? ">" : l < r ? "<" : "=");
/** "2 450,75" → số thực, chỉ để so sánh / kiểm tra. */
const num = (s: string) => Number(s.replace(/ /g, "").replace(",", "."));
const counts = (xs: string[]) => xs.reduce<Record<string, number>>((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {});

// ── Lớp 1: so sánh số ──
for (const level of ["pham-vi-10", "pham-vi-100"] as CompareLevel[]) {
  const seen: string[] = [];
  for (let i = 0; i < RUNS; i++) {
    const q = makeCompareQuestion(level);
    const max = level === "pham-vi-10" ? 10 : 100;
    if (q.a < 0 || q.b < 0 || q.a > max || q.b > max) fail(`so-sanh ${level}`, `ngoài phạm vi: ${q.a}, ${q.b}`);
    if (q.answer !== sign(q.a, q.b)) fail(`so-sanh ${level}`, `${q.a} ${q.answer} ${q.b}`);
    seen.push(q.answer);
  }
  const c = counts(seen);
  for (const s of [">", "<", "="]) if ((c[s] ?? 0) < RUNS * 0.1) fail(`so-sanh ${level}`, `ít câu "${s}": ${c[s] ?? 0}/${RUNS}`);
}

// ── Lớp 2: tiền ──
for (const level of ["dem-tien", "tra-lai"] as MoneyLevel[]) {
  for (let i = 0; i < RUNS; i++) {
    const q = makeMoneyQuestion(level);
    if (!q.notes.every((n) => (NOTES as readonly number[]).includes(n))) fail(`tien ${level}`, `tờ lạ: ${q.notes}`);
    const want = level === "dem-tien" ? q.notes.reduce((s, n) => s + n, 0) : 1000 - (q.price ?? NaN);
    if (q.answer !== want) fail(`tien ${level}`, `${q.notes} giá ${q.price}: ${q.answer} (đúng: ${want})`);
    if (q.answer <= 0 || q.answer > 1000) fail(`tien ${level}`, `ngoài 1 000 đồng: ${q.answer}`);
    if (q.options.some((o) => o <= 0 || o % 100 !== 0)) fail(`tien ${level}`, `lựa chọn lẻ: ${q.options}`);
    checkOptions(`tien ${level}`, q.options, q.answer);
  }
}

// ── Lớp 3: làm tròn ──
for (const level of ["hang-chuc", "hang-tram"] as RoundLevel[]) {
  for (let i = 0; i < RUNS; i++) {
    const q = makeRoundQuestion(level);
    const to = level === "hang-chuc" ? 10 : 100;
    const rest = q.n % to;
    const want = rest >= to / 2 ? q.n - rest + to : q.n - rest;
    if (q.answer !== want) fail(`lam-tron ${level}`, `${q.n} → ${q.answer} (đúng: ${want})`);
    if (rest === 0) fail(`lam-tron ${level}`, `số đã tròn: ${q.n}`);
    if (q.options.some((o) => o <= 0 || o % to !== 0)) fail(`lam-tron ${level}`, `lựa chọn không tròn ${to}: ${q.options}`);
    checkOptions(`lam-tron ${level}`, q.options, q.answer);
  }
}

// ── Lớp 4: phân số ──
const parseFrac = (s: string) => {
  const m = s.match(/^(\d+)\/(\d+)$/);
  if (!m) throw new Error(`phân số lạ: ${s}`);
  return { n: +m[1], d: +m[2] };
};
const gcdChk = (a: number, b: number): number => (b ? gcdChk(b, a % b) : a);
for (const level of ["doc-hinh", "so-sanh", "rut-gon"] as FractionLevel[]) {
  for (let i = 0; i < RUNS; i++) {
    const q = makeFractionQuestion(level);
    if (q.kind === "doc-hinh") {
      if (q.answer !== `${q.shaded}/${q.parts}`) fail("phan-so doc-hinh", `${q.shaded}/${q.parts} → ${q.answer}`);
      if (q.shaded < 1 || q.shaded >= q.parts) fail("phan-so doc-hinh", `tô ${q.shaded}/${q.parts}`);
      q.options.forEach(parseFrac);
      checkOptions("phan-so doc-hinh", q.options, q.answer);
    } else if (q.kind === "so-sanh") {
      const want = sign(q.a.n * q.b.d, q.b.n * q.a.d);
      if (q.answer !== want) fail("phan-so so-sanh", `${q.a.n}/${q.a.d} ${q.answer} ${q.b.n}/${q.b.d}`);
      if (q.a.n >= q.a.d || q.b.n >= q.b.d) fail("phan-so so-sanh", `phân số ≥ 1: ${q.a.n}/${q.a.d}, ${q.b.n}/${q.b.d}`);
    } else {
      const a = parseFrac(q.answer);
      if (gcdChk(a.n, a.d) !== 1) fail("phan-so rut-gon", `chưa tối giản: ${q.answer}`);
      if (a.n * q.from.d !== q.from.n * a.d) fail("phan-so rut-gon", `${q.from.n}/${q.from.d} ≠ ${q.answer}`);
      // Mọi lựa chọn khác: hoặc khác giá trị, hoặc bằng giá trị nhưng chưa tối giản.
      for (const o of q.options) {
        if (o === q.answer) continue;
        const f = parseFrac(o);
        if (f.n * a.d === a.n * f.d && gcdChk(f.n, f.d) === 1) fail("phan-so rut-gon", `hai đáp án tối giản: ${q.options}`);
      }
      checkOptions("phan-so rut-gon", q.options, q.answer);
    }
  }
}

// ── Lớp 4: đổi đơn vị — tính lại từ chính câu chữ ──
const FACTOR: Record<string, Record<string, number>> = {
  yến: { kg: 10 }, tạ: { kg: 100, yến: 10 }, tấn: { kg: 1000, tạ: 10 },
  phút: { giây: 60 }, giờ: { phút: 60 }, "thế kỉ": { năm: 100 },
  "m²": { "dm²": 100 }, "dm²": { "cm²": 100 }, "cm²": { "mm²": 100 },
};
const UNIT_RE = "(kg|yến|tạ|tấn|giây|phút|giờ|năm|thế kỉ|mm²|cm²|dm²|m²)";
for (const level of ["khoi-luong", "thoi-gian", "dien-tich"] as UnitLevel[]) {
  for (let i = 0; i < RUNS; i++) {
    const q = makeUnitQuestion(level);
    const two = q.left.match(new RegExp(`^(\\d+) ${UNIT_RE} (\\d+) ${UNIT_RE}$`));
    const one = q.left.match(new RegExp(`^([\\d ]+) ${UNIT_RE}$`));
    let want: number | null = null;
    if (two) {
      const [, a, big, b, small] = two;
      const f = FACTOR[big]?.[small];
      if (small !== q.unit || !f) fail(`don-vi ${level}`, `câu lạ: ${q.left} = ? ${q.unit}`);
      else if (+b >= f) fail(`don-vi ${level}`, `${q.left}: ${b} ${small} phải bé hơn 1 ${big}`);
      else want = +a * f + +b;
    } else if (one) {
      const value = num(one[1]);
      const from = one[2];
      if (FACTOR[from]?.[q.unit]) want = value * FACTOR[from][q.unit];
      else if (FACTOR[q.unit]?.[from]) want = value / FACTOR[q.unit][from];
      else fail(`don-vi ${level}`, `không đổi được ${from} → ${q.unit}`);
    } else fail(`don-vi ${level}`, `câu lạ: ${q.left}`);
    if (want !== null && q.answer !== want) fail(`don-vi ${level}`, `${q.left} = ${q.answer} ${q.unit} (đúng: ${want})`);
    if (!Number.isInteger(q.answer) || q.answer <= 0) fail(`don-vi ${level}`, `đáp án lạ: ${q.answer}`);
    checkOptions(`don-vi ${level}`, q.options, q.answer);
  }
}

// ── Lớp 4: từ loại — không trùng từ giữa các nhóm, đủ từ để 10 câu không lặp ──
{
  const all = Object.values(WORD_CLASSES).flat();
  const dup = all.filter((w, i) => all.indexOf(w) !== i);
  if (dup.length) fail("tu-loai", `từ trùng: ${dup}`);
  for (const [k, words] of Object.entries(WORD_CLASSES)) if (words.length < 10) fail("tu-loai", `${k} chỉ có ${words.length} từ`);
  for (let i = 0; i < RUNS; i++) {
    const q = makeWordClassQuestion("chạy");
    if (q.word === "chạy") fail("tu-loai", "không tránh được từ vừa hỏi");
    if (!WORD_CLASSES[q.answer as WordClass].includes(q.word)) fail("tu-loai", `${q.word} không thuộc ${q.answer}`);
  }
}

// ── Lớp 5: số thập phân ──
for (const level of ["so-sanh", "hang", "phan-so"] as DecimalLevel[]) {
  const seen: string[] = [];
  for (let i = 0; i < RUNS; i++) {
    const q = makeDecimalQuestion(level);
    if (q.kind === "so-sanh") {
      // So sánh lại bằng chuỗi (đệm phần thập phân) — không qua float.
      const pad = (s: string) => {
        const [i0, f = ""] = s.replace(/ /g, "").split(",");
        return [Number(i0), Number(f.padEnd(3, "0"))] as const;
      };
      const [ai, af] = pad(q.a);
      const [bi, bf] = pad(q.b);
      const want = ai !== bi ? sign(ai, bi) : sign(af, bf);
      if (q.answer !== want) fail("thap-phan so-sanh", `${q.a} ${q.answer} ${q.b}`);
      seen.push(q.answer);
    } else if (q.kind === "hang") {
      const m = q.number.match(/^(\d)(\d),(\d)(\d)(\d)$/);
      if (!m) { fail("thap-phan hang", `số lạ: ${q.number}`); continue; }
      const digits = m.slice(1).map(Number);
      if (new Set(digits).size !== 5 || digits.includes(0)) fail("thap-phan hang", `chữ số lặp hoặc 0: ${q.number}`);
      const want = PLACE_NAMES[digits.indexOf(q.digit)];
      if (q.answer !== want) fail("thap-phan hang", `${q.digit} trong ${q.number}: ${q.answer} (đúng: ${want})`);
      checkOptions("thap-phan hang", q.options, q.answer);
    } else {
      const want = q.n / q.d;
      if (Math.abs(num(q.answer) - want) > 1e-9) fail("thap-phan phan-so", `${q.n}/${q.d} = ${q.answer}`);
      if (q.options.filter((o) => Math.abs(num(o) - want) < 1e-9).length !== 1) fail("thap-phan phan-so", `hai lựa chọn cùng giá trị: ${q.options}`);
      checkOptions("thap-phan phan-so", q.options, q.answer);
    }
  }
  if (level === "so-sanh") {
    const c = counts(seen);
    for (const s of [">", "<", "="]) if ((c[s] ?? 0) < RUNS * 0.1) fail("thap-phan so-sanh", `ít câu "${s}": ${c[s] ?? 0}/${RUNS}`);
  }
}

// ── Lớp 5: tỉ số phần trăm ──
for (const level of ["tim-gia-tri", "ti-so"] as PercentLevel[]) {
  for (let i = 0; i < RUNS; i++) {
    const q = makePercentQuestion(level);
    const nums = (q.text.match(/\d+/g) ?? []).map(Number);
    if (level === "tim-gia-tri") {
      const [p, b] = nums;
      const want = (p * b) / 100;
      if (!Number.isInteger(want) || q.answer !== String(want)) fail("phan-tram tim-gia-tri", `${q.text} → ${q.answer}`);
    } else {
      // Câu có dạng "... <b> ..., ... <a> ..."; số đầu là cả, số sau là phần (bỏ "5A").
      const [b, a] = nums.filter((n, i0) => !(i0 === 0 && q.text.startsWith("Lớp 5A")));
      const want = (a * 100) / b;
      if (!Number.isInteger(want) || q.answer !== `${want}%`) fail("phan-tram ti-so", `${q.text} → ${q.answer} (đúng: ${want}%)`);
      if (q.text.startsWith("Lớp 5A") && b > 40) fail("phan-tram ti-so", `lớp ${b} bạn`);
    }
    checkOptions(`phan-tram ${level}`, q.options, q.answer);
  }
}

// ── Lớp 5: kết từ ──
{
  const texts = CONNECTIVES.map((c) => c.text);
  if (new Set(texts).size !== texts.length) fail("ket-tu", "câu trùng");
  for (const c of CONNECTIVES) {
    if (c.text.split("___").length !== 2) fail("ket-tu", `cần đúng một chỗ trống: ${c.text}`);
    checkOptions(`ket-tu "${c.text}"`, c.options, c.answer);
  }
}

console.log(failures ? `✗ ${failures} lỗi:\n  ${examples.join("\n  ")}` : "Trò chơi thêm (lớp 1–5): 0 lỗi.");
process.exit(failures ? 1 : 0);
