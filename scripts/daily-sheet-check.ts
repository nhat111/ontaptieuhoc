// scripts/daily-sheet-check.ts — kiểm tra "Phiếu luyện hằng ngày" lớp 1, lớp 2 (lib/dailySheet.ts).
//
//   1. Toán: sinh hàng nghìn phiếu cho mỗi phạm vi, tính lại mọi đáp án độc lập
//      (dấu so sánh, phép tính, sơ đồ tách–gộp, dãy số), kiểm tra số nằm trong phạm vi,
//      phạm vi 100 không có phép nhớ, không có ô trùng nhau trong một bài.
//   2. Tiếng Việt: luật chính tả của kho từ (c/k, g/gh, ng/ngh đứng trước e ê i),
//      phần điền phải thuộc nhóm, không trùng từ, mỗi nhóm đủ chữ cho một bài.
//   3. HTML xuất ra không có "undefined" / "NaN".
//
// Chạy: npx tsx scripts/daily-sheet-check.ts

import {
  MATH_BLOCKS, MATH_BLOCKS_2, MATH_RANGES, SPELL_GROUPS, SPELL_GROUPS_2, SPELL_PER_BLOCK, mathBlocksFor, parseSpell,
  buildDailySheets, buildDailySheetHtml, type Cell, type Item, type MathRange,
} from "../lib/dailySheet";

const errors: string[] = [];
const fail = (msg: string) => { if (errors.length < 30) errors.push(msg); };
const val = (c: Cell) => ("text" in c ? c.text : c.box);
const n = (c: Cell) => Number(val(c));

/* ── Toán ── */
function checkMath(it: Item, block: string, range: MathRange) {
  const lo = 0, hi = range;
  const inRange = (x: number) => Number.isInteger(x) && x >= lo && x <= hi;
  if (it.kind === "bond") {
    const [t, a, b] = [n(it.top), n(it.left), n(it.right)];
    if (a + b !== t) fail(`bond sai: ${a}+${b}≠${t}`);
    if (![t, a, b].every(inRange) || a < 1 || b < 1) fail(`bond ngoài phạm vi ${range}: ${t},${a},${b}`);
    if ([it.top, it.left, it.right].filter((c) => "box" in c).length !== 1) fail("bond phải có đúng 1 ô trống");
    return;
  }
  if (it.kind === "order") {
    if (new Set(it.nums).size !== it.nums.length) fail("order có số trùng");
    if (!it.nums.every(inRange)) fail(`order ngoài phạm vi: ${it.nums}`);
    return;
  }
  if (it.kind !== "inline") return fail(`kiểu lạ trong bài Toán: ${it.kind}`);
  const c = it.cells;
  if (!c.some((x) => "box" in x)) fail(`${block}: không có ô trống`);
  if (block === "compare") {
    const [a, s, b] = [n(c[0]), val(c[1]), n(c[2])];
    if (s !== (a > b ? ">" : a < b ? "<" : "=")) fail(`so sánh sai: ${a} ${s} ${b}`);
    if (!inRange(a) || !inRange(b)) fail(`so sánh ngoài phạm vi: ${a} ${b}`);
  } else if (block === "calc" || block === "missing") {
    const [a, op, b, eq, r] = [n(c[0]), val(c[1]), n(c[2]), val(c[3]), n(c[4])];
    if (eq !== "=") fail("thiếu dấu =");
    const want = op === "+" ? a + b : a - b;
    if (want !== r) fail(`tính sai: ${a} ${op} ${b} = ${r}`);
    if (![a, b, r].every(inRange)) fail(`phép tính ngoài phạm vi ${range}: ${a} ${op} ${b} = ${r}`);
    if (range === 100) {
      if (op === "+" && (a % 10) + (b % 10) >= 10) fail(`phạm vi 100 có nhớ: ${a}+${b}`);
      if (op === "-" && (a % 10) < (b % 10)) fail(`phạm vi 100 có mượn: ${a}-${b}`);
    }
  } else if (block === "seq") {
    const nums = c.map(n);
    const step = nums[1] - nums[0];
    if (![1, -1, 10, -10].includes(step)) fail(`dãy số bước lạ: ${nums}`);
    if (nums.some((x, i) => i > 0 && x - nums[i - 1] !== step)) fail(`dãy số không đều: ${nums}`);
    if (!nums.every(inRange)) fail(`dãy số ngoài phạm vi: ${nums}`);
    if ("box" in c[0] || "box" in c[1]) fail("dãy số giấu mất 2 số đầu");
  }
}

let sheets = 0;
for (const { value: range } of MATH_RANGES) {
  const ids = mathBlocksFor(range).map((b) => b.id);
  for (let s = 0; s < 400; s++) {
    const [sheet] = buildDailySheets({ subject: "toan", range, blockIds: ids, count: 1, seed: `t${s}` });
    sheets++;
    if (sheet.blocks.length !== ids.length) fail(`thiếu bài: ${sheet.blocks.length}/${ids.length}`);
    sheet.blocks.forEach((b, bi) => {
      const def = mathBlocksFor(range)[bi];
      if (b.items.length !== def.count) fail(`${def.id}: ${b.items.length}/${def.count} ô`);
      const keys = b.items.map((x) => JSON.stringify(x));
      if (new Set(keys).size !== keys.length) fail(`${def.id} phạm vi ${range}: có ô trùng`);
      b.items.forEach((it) => checkMath(it, def.id, range));
    });
  }
}
if (mathBlocksFor(100).some((b) => b.id === "bond")) fail("sơ đồ tách–gộp không được có ở phạm vi 100");

/* ── Toán lớp 2 ── */
function checkMath2(it: Item, block: string) {
  if (it.kind !== "inline") return fail(`lớp 2 ${block}: kiểu lạ ${it.kind}`);
  const c = it.cells;
  if (!c.some((x) => "box" in x)) fail(`lớp 2 ${block}: không có ô trống`);
  const nums = c.map(val);
  if (block === "sosanh1000") {
    const [a, s, b] = [n(c[0]), val(c[1]), n(c[2])];
    if (s !== (a > b ? ">" : a < b ? "<" : "=")) fail(`so sánh sai: ${a} ${s} ${b}`);
    if (a < 100 || a > 999 || b < 100 || b > 999) fail(`không phải số ba chữ số: ${a} ${b}`);
    return;
  }
  if (block === "tramchuc") {
    const [x, , h, , t, , u] = c.map(n);
    if (h + t + u !== x || h % 100 || t % 10 || t >= 100 || u >= 10 || h >= 1000) fail(`trăm chục đơn vị sai: ${nums.join(" ")}`);
    return;
  }
  if (block === "demthem") {
    const v = c.map(n), step = v[1] - v[0];
    if (![2, 5, 10, 100].includes(step) || v.some((x, i) => i > 0 && x - v[i - 1] !== step)) fail(`đếm thêm sai: ${v}`);
    if (v[0] % step) fail(`đếm thêm không bắt đầu từ bội của ${step}: ${v}`);
    if (v[v.length - 1] > (step === 100 ? 1000 : 100)) fail(`đếm thêm vượt phạm vi: ${v}`);
    if ("box" in c[0] || "box" in c[1]) fail("đếm thêm giấu mất 2 số đầu");
    return;
  }
  if (block === "donvi2") {
    const [q, , ans, unit] = nums;
    const m = q.match(/^(\d+) (m|dm|cm)$/);
    const cm: Record<string, number> = { m: 100, dm: 10, cm: 1 };
    if (!m || !cm[unit]) return fail(`đổi đơn vị lạ: ${nums.join(" ")}`);
    if (+m[1] * cm[m[2]] !== +ans * cm[unit]) fail(`đổi đơn vị sai: ${nums.join(" ")}`);
    return;
  }
  // qua10, conho, thieu2, nhanchia: a op b = c
  const [a, op, b, eq, r] = [n(c[0]), val(c[1]), n(c[2]), val(c[3]), n(c[4])];
  if (eq !== "=") return fail(`lớp 2 ${block}: thiếu dấu =`);
  const want = op === "+" ? a + b : op === "-" ? a - b : op === "×" ? a * b : a / b;
  if (want !== r) fail(`lớp 2 ${block} tính sai: ${a} ${op} ${b} = ${r}`);
  if ([a, b, r].some((x) => !Number.isInteger(x) || x < 0)) fail(`lớp 2 ${block}: số lạ ${nums}`);
  if (block === "qua10") {
    const [x, y, s] = op === "+" ? [a, b, r] : [b, r, a];
    if (s < 11 || s > 18 || x > 9 || y > 9) fail(`qua 10 sai dạng: ${nums.join(" ")}`);
  }
  if (block === "conho" || block === "thieu2") {
    const [x, y, s] = op === "+" ? [a, b, r] : [r, b, a];
    if (s > 100) fail(`vượt phạm vi 100: ${nums.join(" ")}`);
    if ((x % 10) + (y % 10) < 10) fail(`không có nhớ: ${nums.join(" ")}`);
  }
  if (block === "nhanchia") {
    const k = op === "×" ? (a === 2 || a === 5 ? a : b) : b;
    if (![2, 5].includes(k) || (op === "×" ? a * b : a) > k * 10) fail(`ngoài bảng 2, 5: ${nums.join(" ")}`);
  }
}

for (let s = 0; s < 600; s++) {
  const ids = MATH_BLOCKS_2.map((b) => b.id);
  const [sheet] = buildDailySheets({ grade: 2, subject: "toan", range: 10, blockIds: ids, count: 1, seed: `l2-${s}` });
  sheets++;
  if (sheet.blocks.length !== ids.length) fail(`lớp 2 thiếu bài: ${sheet.blocks.length}/${ids.length}`);
  sheet.blocks.forEach((b, bi) => {
    const def = MATH_BLOCKS_2[bi];
    if (b.items.length !== def.count) fail(`lớp 2 ${def.id}: ${b.items.length}/${def.count} ô`);
    const keys = b.items.map((x) => JSON.stringify(x));
    if (new Set(keys).size !== keys.length) fail(`lớp 2 ${def.id}: có ô trùng`);
    b.items.forEach((it) => checkMath2(it, def.id));
  });
}

/* ── Tiếng Việt ── */
const FRONT = /^[eèéẻẽẹêềếểễệiìíỉĩịyỳýỷỹỵ]/;
/** Bỏ dấu thanh (giữ â, ă, ơ, ư…): "ào" → "ao", "ạn" → "an". */
const noTone = (x: string) => x.normalize("NFD").replace(/[\u0300\u0301\u0303\u0309\u0323]/g, "").normalize("NFC");
for (const g of [...SPELL_GROUPS, ...SPELL_GROUPS_2]) {
  if (g.words.length < SPELL_PER_BLOCK) fail(`${g.id}: chỉ có ${g.words.length} từ (cần ≥ ${SPELL_PER_BLOCK})`);
  if (new Set(g.words).size !== g.words.length) fail(`${g.id}: có từ trùng`);
  for (const w of g.words) {
    const parts = parseSpell(w);
    if (!parts.some((p) => "blank" in p)) fail(`${g.id}: "${w}" không có chỗ chấm`);
    if (parts.map((p) => ("text" in p ? p.text : p.blank)).join("") !== w.replace(/[[\]]/g, "")) fail(`parse sai: ${w}`);
    parts.forEach((p, i) => {
      if (!("blank" in p)) return;
      if (g.part === "van") {
        if (!g.options.includes(noTone(p.blank))) fail(`${g.id}: "${w}" vần "${p.blank}" không thuộc nhóm`);
        const prev = parts[i - 1] && "text" in parts[i - 1] ? (parts[i - 1] as { text: string }).text : "";
        if (!/[a-zđ]$/i.test(prev)) fail(`${g.id}: "${w}" vần không có âm đầu đứng trước`);
        const after = parts[i + 1] && "text" in parts[i + 1] ? (parts[i + 1] as { text: string }).text : "";
        if (after && !after.startsWith(" ")) fail(`${g.id}: "${w}" vần phải là cuối tiếng`);
        return;
      }
      if (!g.options.includes(p.blank)) fail(`${g.id}: "${w}" điền "${p.blank}" không thuộc nhóm`);
      const next = parts[i + 1] && "text" in parts[i + 1] ? (parts[i + 1] as { text: string }).text : "";
      if (!next) fail(`${g.id}: "${w}" chỗ chấm không có vần đi sau`);
      const front = FRONT.test(next);
      if (p.blank === "c" && front) fail(`luật c/k: "${w}" (trước e, ê, i phải là k)`);
      if (p.blank === "k" && !front) fail(`luật c/k: "${w}" (k chỉ đứng trước e, ê, i)`);
      if (p.blank === "g" && front) fail(`luật g/gh: "${w}"`);
      if (p.blank === "gh" && !front) fail(`luật g/gh: "${w}"`);
      if (p.blank === "ng" && front) fail(`luật ng/ngh: "${w}"`);
      if (p.blank === "ngh" && !front) fail(`luật ng/ngh: "${w}"`);
    });
  }
}
for (let s = 0; s < 400; s++) {
  const grade = s % 2 ? 2 : 1;
  const ids = (grade === 2 ? SPELL_GROUPS_2 : SPELL_GROUPS).map((g) => g.id);
  const [sheet] = buildDailySheets({ grade, subject: "tieng-viet", range: 10, blockIds: ids, count: 1, seed: `v${s}` });
  if (sheet.blocks.length !== ids.length) fail(`Tiếng Việt lớp ${grade}: thiếu bài`);
  sheets++;
  sheet.blocks.forEach((b) => {
    const keys = b.items.map((x) => JSON.stringify(x));
    if (new Set(keys).size !== keys.length) fail("Tiếng Việt: từ trùng trong một bài");
    if (b.items.length !== SPELL_PER_BLOCK) fail(`Tiếng Việt: bài có ${b.items.length} từ`);
  });
}

/* ── HTML ── */
const html = buildDailySheetHtml(
  [
    ...buildDailySheets({ subject: "toan", range: 10, blockIds: MATH_BLOCKS.map((b) => b.id), count: 2, seed: "h" }),
    ...buildDailySheets({ subject: "tieng-viet", range: 10, blockIds: SPELL_GROUPS.map((g) => g.id), count: 1, seed: "h" }),
    ...buildDailySheets({ grade: 2, subject: "toan", range: 10, blockIds: MATH_BLOCKS_2.map((b) => b.id), count: 1, seed: "h" }),
    ...buildDailySheets({ grade: 2, subject: "tieng-viet", range: 10, blockIds: SPELL_GROUPS_2.map((g) => g.id), count: 1, seed: "h" }),
  ],
  { title: "Phiếu luyện lớp 1", withAnswers: true, footer: "ontaptieuhoc" },
);
if (/undefined|NaN|\[object/.test(html)) fail("HTML có undefined/NaN");

console.log(`${sheets} phiếu đã kiểm tra, kho từ ${[...SPELL_GROUPS, ...SPELL_GROUPS_2].reduce((s, g) => s + g.words.length, 0)} từ — ${errors.length ? `${errors.length}+ lỗi` : "0 lỗi"}.`);
errors.forEach((e) => console.log("  ✗ " + e));
process.exit(errors.length ? 1 : 0);
