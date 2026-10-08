// lib/mathGen/lop1.ts — Toán lớp 1 (Chương trình GDPT 2018)

import {
  type Generator, type Rng, int, pick, chance, range, mcOptions, nearInts, blanks,
} from "./core";
import { EMOJI, NAMES, GIVERS, THINGS, xemDongHo, ngayTrongTuan, soSanhSo, sapXepSo } from "./shared";

/* Đếm hình (0–10) */
export const demHinh: Generator = (r) => {
  const o = pick(r, EMOJI);
  const n = int(r, 1, 10);
  const { options, answer } = mcOptions(r, String(n), nearInts(n, 0, 10).map(String));
  return {
    type: "multiple_choice", difficulty: n <= 5 ? "easy" : "medium", tags: ["đếm số", "0-10"],
    question: `Có mấy ${o.n}?  ${o.e.repeat(n)}`, options, answer,
    explanation: `Đếm lần lượt: ${range(1, n).join(", ")}. Có tất cả ${n} ${o.n}.`,
    hint: "Em chỉ tay vào từng hình và đếm to nhé!",
  };
};

/* Tách số: 7 gồm 3 và ___ */
export const tachSo: Generator = (r) => {
  const n = int(r, 2, 10);
  const a = int(r, 1, n - 1);
  return {
    type: "fill_blank", difficulty: "easy", tags: ["tách số", "0-10"],
    question: `Số ${n} gồm ${a} và ___.`, ...blanks(String(n - a)),
    explanation: `${a} + ${n - a} = ${n}, nên ${n} gồm ${a} và ${n - a}.`,
    hint: `Đếm thêm từ ${a} cho đến ${n}.`,
  };
};

/* Cộng trừ trong phạm vi 10 (có dạng tìm số chưa biết) */
export const congTru10: Generator = (r) => {
  const c = int(r, 2, 10);
  const a = int(r, 0, c);
  const b = c - a;
  const kind = pick(r, ["cong", "tru", "thieuCong", "thieuTru"] as const);
  switch (kind) {
    case "cong":
      return { type: "fill_blank", difficulty: "easy", tags: ["phép cộng", "phạm vi 10"],
        question: `${a} + ${b} = ___`, ...blanks(String(c)),
        explanation: `${a} thêm ${b} được ${c}.`, hint: `Đếm thêm ${b} từ số ${a}.` };
    case "tru":
      return { type: "fill_blank", difficulty: "easy", tags: ["phép trừ", "phạm vi 10"],
        question: `${c} - ${a} = ___`, ...blanks(String(b)),
        explanation: `${c} bớt ${a} còn ${b}.`, hint: `Đếm lùi ${a} bước từ số ${c}.` };
    case "thieuCong":
      return { type: "fill_blank", difficulty: "medium", tags: ["phép cộng", "tìm số", "phạm vi 10"],
        question: `___ + ${b} = ${c}`, ...blanks(String(a)),
        explanation: `Ta lấy ${c} - ${b} = ${a}. Thử lại: ${a} + ${b} = ${c}.`, hint: `Số nào cộng ${b} thì được ${c}?` };
    case "thieuTru":
      return { type: "fill_blank", difficulty: "medium", tags: ["phép trừ", "tìm số", "phạm vi 10"],
        question: `${c} - ___ = ${b}`, ...blanks(String(a)),
        explanation: `Ta lấy ${c} - ${b} = ${a}. Thử lại: ${c} - ${a} = ${b}.`, hint: `${c} bớt đi mấy thì còn ${b}?` };
  }
};

/* Số liền trước / liền sau (đến 100) */
export const lienTruocSau: Generator = (r) => {
  const n = int(r, 1, 99);
  const sau = chance(r, 0.5);
  const ans = sau ? n + 1 : n - 1;
  const { options, answer } = mcOptions(r, String(ans),
    [sau ? n - 1 : n + 1, n, ans + 10, ans - 10, ans + 1, ans - 1].filter((x) => x >= 0 && x <= 100).map(String));
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["số liền trước liền sau", "đến 100"],
    question: `Số liền ${sau ? "sau" : "trước"} của ${n} là số nào?`, options, answer,
    explanation: sau ? `Số liền sau thì hơn 1: ${n} + 1 = ${ans}.` : `Số liền trước thì kém 1: ${n} - 1 = ${ans}.`,
    hint: sau ? "Đếm tiếp thêm 1." : "Đếm lùi 1.",
  };
};

/* Chục và đơn vị */
export const chucDonVi: Generator = (r) => {
  const n = int(r, 10, 99);
  const [t, u] = [Math.floor(n / 10), n % 10];
  if (chance(r, 0.5)) {
    // Quiz chỉ có 1 ô nhập → giấu 1 trong 2 phần
    const hideChuc = chance(r, 0.5);
    return { type: "fill_blank", difficulty: "easy", tags: ["chục và đơn vị"],
      question: hideChuc ? `Số ${n} gồm ___ chục và ${u} đơn vị.` : `Số ${n} gồm ${t} chục và ___ đơn vị.`,
      ...blanks(String(hideChuc ? t : u)),
      explanation: `Chữ số ${t} ở hàng chục, chữ số ${u} ở hàng đơn vị.`, hint: "Chữ số bên trái là hàng chục." };
  }
  return { type: "fill_blank", difficulty: "easy", tags: ["chục và đơn vị"],
    question: `Số gồm ${t} chục và ${u} đơn vị viết là ___.`, ...blanks(String(n)),
    explanation: `${t} chục là ${t * 10}, thêm ${u} đơn vị được ${n}.`, hint: "Viết số chục trước, số đơn vị sau." };
};

/* Cộng trừ không nhớ trong phạm vi 100 */
function noCarryPair(r: Rng, op: "+" | "-") {
  // trả về [a, b] sao cho phép tính không nhớ, kết quả trong 0..99
  const shape = pick(r, ["2-1", "2-2", "chuc"] as const);
  if (op === "+") {
    const a1 = int(r, 1, 8), a0 = shape === "chuc" ? 0 : int(r, 0, 8);
    const b1 = shape === "2-1" ? 0 : int(r, 1, 9 - a1);
    const b0 = shape === "chuc" ? 0 : int(r, shape === "2-1" ? 1 : 0, 9 - a0);
    return [a1 * 10 + a0, b1 * 10 + b0];
  }
  const a1 = int(r, 2, 9), a0 = shape === "chuc" ? 0 : int(r, 1, 9);
  const b1 = shape === "2-1" ? 0 : int(r, 1, a1 - 1); // b < a để hiệu luôn > 0
  const b0 = shape === "chuc" ? 0 : int(r, shape === "2-1" ? 1 : 0, a0);
  return [a1 * 10 + a0, b1 * 10 + b0];
}

export const congTru100: Generator = (r) => {
  const op = chance(r, 0.5) ? "+" : "-";
  const [a, b] = noCarryPair(r, op);
  const c = op === "+" ? a + b : a - b;
  const verb = op === "+" ? "cộng" : "trừ";
  return {
    type: "fill_blank", difficulty: b >= 10 && b % 10 !== 0 ? "medium" : "easy",
    tags: [`phép ${verb}`, "phạm vi 100", "không nhớ"],
    question: `${a} ${op} ${b} = ___`, ...blanks(String(c)),
    explanation: `${cap1(verb)} đơn vị: ${a % 10} ${op} ${b % 10} = ${c % 10}. ${cap1(verb)} chục: ${Math.floor(a / 10)} ${op} ${Math.floor(b / 10)} = ${Math.floor(c / 10)}. Kết quả: ${c}.`,
    hint: "Tính hàng đơn vị trước, rồi đến hàng chục.",
  };
};
const cap1 = (s: string) => s[0].toUpperCase() + s.slice(1);

/* Toán có lời văn (thêm / bớt) */
export const loiVan1: Generator = (r) => {
  const big = chance(r, 0.5);
  const op = chance(r, 0.5) ? "+" : "-";
  const [a, b] = big ? noCarryPair(r, op) : op === "+"
    ? (() => { const x = int(r, 1, 8); return [x, int(r, 1, 10 - x)]; })()
    : (() => { const x = int(r, 3, 10); return [x, int(r, 1, x - 1)]; })();
  const c = op === "+" ? a + b : a - b;
  const name = pick(r, NAMES);
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const question = op === "+"
    ? `${name} có ${a} ${thing}. ${pick(r, GIVERS)} cho ${name} thêm ${b} ${thing}. Hỏi ${name} có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`
    : `${name} có ${a} ${thing}, ${name} cho bạn ${b} ${thing}. Hỏi ${name} còn lại bao nhiêu ${thing}? Trả lời: ___ ${thing}.`;
  return {
    type: "fill_blank", difficulty: big ? "hard" : "medium", tags: ["toán có lời văn", op === "+" ? "thêm" : "bớt"],
    question, ...blanks(String(c)),
    explanation: op === "+" ? `"Thêm" và "tất cả" là phép cộng: ${a} + ${b} = ${c} (${thing}).`
      : `"Cho bạn" và "còn lại" là phép trừ: ${a} - ${b} = ${c} (${thing}).`,
    hint: "Có thêm thì làm phép cộng, bớt đi thì làm phép trừ.",
  };
};

/* Độ dài: xăng-ti-mét */
export const doDaiCm: Generator = (r) => {
  if (chance(r, 0.5)) {
    const op = chance(r, 0.5) ? "+" : "-";
    const [a, b] = noCarryPair(r, op);
    const c = op === "+" ? a + b : a - b;
    return { type: "fill_blank", difficulty: "easy", tags: ["độ dài", "cm"],
      question: `${a} cm ${op} ${b} cm = ___ cm`, ...blanks(String(c)),
      explanation: `Tính như số bình thường rồi ghi đơn vị cm: ${a} ${op} ${b} = ${c}.`, hint: "Nhớ ghi đơn vị cm." };
  }
  const [long, short] = noCarryPair(r, "-");
  return { type: "fill_blank", difficulty: "medium", tags: ["độ dài", "cm", "toán có lời văn"],
    question: `Thước kẻ dài ${long} cm, bút chì dài ${short} cm. Thước kẻ dài hơn bút chì ___ cm.`,
    ...blanks(String(long - short)),
    explanation: `Dài hơn bao nhiêu thì lấy số lớn trừ số bé: ${long} - ${short} = ${long - short} (cm).`,
    hint: "Lấy độ dài lớn trừ độ dài bé." };
};

/* Đúng / Sai */
export const dungSai1: Generator = (r) => {
  const op = chance(r, 0.5) ? "+" : "-";
  const [a, b] = op === "+" ? (() => { const x = int(r, 0, 9); return [x, int(r, 0, 10 - x)]; })()
    : (() => { const x = int(r, 1, 10); return [x, int(r, 0, x)]; })();
  const real = op === "+" ? a + b : a - b;
  const ok = chance(r, 0.5);
  const shown = ok ? real : real + (real === 0 || chance(r, 0.5) ? 1 : -1);
  return { type: "true_false", difficulty: "easy", tags: ["đúng sai", "phạm vi 10"],
    question: `${a} ${op} ${b} = ${shown}. Đúng hay sai?`, answer: ok,
    explanation: ok ? `Đúng, vì ${a} ${op} ${b} = ${real}.` : `Sai, vì ${a} ${op} ${b} = ${real}, không phải ${shown}.`,
    hint: "Em tự tính lại rồi so sánh." };
};

export const LOP1 = {
  demHinh, tachSo, congTru10, lienTruocSau, chucDonVi, congTru100, loiVan1, doDaiCm, dungSai1,
  soSanh10: soSanhSo(0, 10), soSanh100: soSanhSo(10, 100),
  sapXep10: sapXepSo(0, 10), sapXep100: sapXepSo(10, 100),
  xemGio: xemDongHo([0]), ngayTrongTuan,
};
