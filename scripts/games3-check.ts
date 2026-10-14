// scripts/games3-check.ts — kiểm tra bộ sinh câu hỏi của trò chơi lớp 3 (lib/games3.ts).
// Tính lại mọi đáp án bằng code độc lập, chạy mỗi dạng hàng nghìn lần.
//
// Chạy: npx tsx scripts/games3-check.ts

import {
  EQUAL_TARGETS, TABLES, WORD_PAIRS, balloonValue, makeBalloon, makeClockMission, makeMemoryDeck,
  makeTimesQuestion, readTime, type ClockSetLevel, type WordPairKind,
} from "../lib/games3";

const RUNS = 5000;
let failures = 0;
const examples: string[] = [];
function fail(where: string, msg: string) {
  failures++;
  if (examples.length < 25) examples.push(`${where}: ${msg}`);
}

// ── Đua xe: phép tính, đáp án, 4 lựa chọn khác nhau ──
for (let i = 0; i < RUNS; i++) {
  const tables = TABLES.filter(() => Math.random() < 0.5);
  const use = tables.length ? tables : [7];
  const q = makeTimesQuestion(use);
  const m = q.text.match(/^(\d+) ([×:]) (\d+)$/);
  if (!m) { fail("dua-xe", `câu lạ: ${q.text}`); continue; }
  const [a, op, b] = [+m[1], m[2], +m[3]];
  const want = op === "×" ? a * b : a / b;
  if (want !== q.answer) fail("dua-xe", `${q.text} = ${q.answer} (đúng: ${want})`);
  if (op === ":" ? !use.includes(b) || a % b !== 0 || a / b > 10 : !use.includes(a) && !use.includes(b))
    fail("dua-xe", `ngoài bảng đã chọn ${use}: ${q.text}`);
  if (q.options.length !== 4 || new Set(q.options).size !== 4) fail("dua-xe", `lựa chọn: ${q.options}`);
  if (q.options.filter((o) => o === q.answer).length !== 1) fail("dua-xe", `thiếu đáp án: ${q.text} ${q.options}`);
  if (q.options.some((o) => o <= 0)) fail("dua-xe", `lựa chọn ≤ 0: ${q.options}`);
}

// ── Bắn bóng: nhãn đúng/sai khớp luật ──
for (const table of TABLES) {
  let good = 0;
  for (let i = 0; i < RUNS / 4; i++) {
    const b = makeBalloon({ kind: "bang", table });
    const v = balloonValue(b.label);
    const isGood = v % table === 0 && v / table >= 1 && v / table <= 10;
    if (isGood !== b.good) fail(`ban-bong bảng ${table}`, `${b.label} good=${b.good}`);
    if (b.good) good++;
  }
  if (good < RUNS / 4 * 0.3 || good > RUNS / 4 * 0.6) fail(`ban-bong bảng ${table}`, `tỉ lệ bóng đúng lạ: ${good}`);
}
for (const target of EQUAL_TARGETS) {
  for (let i = 0; i < RUNS / 4; i++) {
    const b = makeBalloon({ kind: "bang-nhau", target });
    if ((balloonValue(b.label) === target) !== b.good) fail(`ban-bong = ${target}`, `${b.label} good=${b.good}`);
    if (!/^\d+ × \d+$/.test(b.label)) fail(`ban-bong = ${target}`, `nhãn lạ: ${b.label}`);
  }
}

// ── Chỉnh đồng hồ: giờ hợp lệ, câu đọc khớp giờ cần chỉnh ──
/** Đọc lại giờ từ câu nhiệm vụ, độc lập với readTime. */
function parseMission(text: string): { h: number; m: number } | null {
  let x = text.match(/(\d+) giờ kém (\d+) phút\.$/);
  if (x) return { h: ((+x[1] - 2 + 12) % 12) + 1, m: 60 - +x[2] };
  x = text.match(/^Bây giờ là (\d+) giờ(?: (\d+) phút)?\. Sau (\d+) phút nữa/);
  if (x) {
    const total = +x[1] * 60 + Number(x[2] ?? 0) + +x[3];
    return { h: ((Math.floor(total / 60) - 1) % 12) + 1, m: total % 60 };
  }
  x = text.match(/lúc (\d+) giờ(?: (\d+) phút)?\.$/);
  return x ? { h: +x[1], m: Number(x[2] ?? 0) } : null;
}
const LEVELS: ClockSetLevel[] = ["5-phut", "tung-phut", "gio-kem", "sau-bao-lau"];
for (const level of LEVELS) {
  for (let i = 0; i < RUNS; i++) {
    const c = makeClockMission(level);
    if (c.hour < 1 || c.hour > 12 || c.minute < 0 || c.minute > 59 || !Number.isInteger(c.minute))
      fail(`dong-ho ${level}`, `giờ lạ ${c.hour}:${c.minute}`);
    const p = parseMission(c.text);
    if (!p || p.h !== c.hour || p.m !== c.minute) fail(`dong-ho ${level}`, `"${c.text}" ≠ ${c.hour}:${c.minute}`);
    if (level === "5-phut" && (c.minute % 5 !== 0 || c.minute === 0)) fail("dong-ho 5-phut", `${c.minute} phút`);
    if (level === "tung-phut" && c.minute % 5 === 0) fail("dong-ho tung-phut", `${c.minute} phút chẵn 5`);
    if (level === "gio-kem" && (c.minute < 35 || !c.text.includes("kém"))) fail("dong-ho gio-kem", c.text);
    if (/undefined|NaN/.test(c.text)) fail(`dong-ho ${level}`, c.text);
  }
}
if (readTime(7, 45, true) !== "8 giờ kém 15 phút" || readTime(12, 50, true) !== "1 giờ kém 10 phút" || readTime(3, 0) !== "3 giờ")
  fail("readTime", "đọc giờ sai");

// ── Lật thẻ: mỗi từ chỉ thuộc đúng một cặp trong mỗi loại; bộ thẻ đủ cặp ──
for (const kind of Object.keys(WORD_PAIRS) as WordPairKind[]) {
  const seen = new Map<string, number>();
  WORD_PAIRS[kind].forEach(([a, b], i) => {
    if (a === b) fail(`lat-the ${kind}`, `cặp trùng từ: ${a}`);
    for (const w of [a, b]) {
      if (w !== w.trim() || w !== w.normalize("NFC")) fail(`lat-the ${kind}`, `từ chưa chuẩn hoá: "${w}"`);
      if (seen.has(w)) fail(`lat-the ${kind}`, `"${w}" có trong 2 cặp (${seen.get(w)} và ${i})`);
      seen.set(w, i);
    }
  });
  if (WORD_PAIRS[kind].length < 8) fail(`lat-the ${kind}`, "ít hơn 8 cặp, không đủ cho cấp Khó");
  for (const pairs of [4, 6, 8]) {
    for (let i = 0; i < 300; i++) {
      const deck = makeMemoryDeck(kind, pairs);
      if (deck.length !== pairs * 2) fail(`lat-the ${kind}`, `bộ ${pairs} cặp có ${deck.length} thẻ`);
      for (let p = 0; p < pairs; p++) {
        const two = deck.filter((c) => c.pair === p);
        const ok = two.length === 2 && WORD_PAIRS[kind].some(([a, b]) =>
          (a === two[0].word && b === two[1].word) || (b === two[0].word && a === two[1].word));
        if (!ok) fail(`lat-the ${kind}`, `cặp ${p} sai: ${two.map((c) => c.word)}`);
      }
      if (new Set(deck.map((c) => c.id)).size !== deck.length) fail(`lat-the ${kind}`, "trùng id thẻ");
    }
  }
}

console.log(failures ? `✗ ${failures} lỗi` : "✓ Trò chơi lớp 3: 0 lỗi");
examples.forEach((e) => console.log("  " + e));
process.exit(failures ? 1 : 0);
