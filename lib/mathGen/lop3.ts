// lib/mathGen/lop3.ts — Toán lớp 3 (Chương trình GDPT 2018)
// Bảng nhân, bảng chia 3, 4, 6, 7, 8, 9; gấp, giảm một số lần; nhân, chia với số có
// một chữ số; các số trong phạm vi 100.000; chu vi, diện tích; đơn vị đo.
// Các generator "…67" giữ nguyên để bộ đề bảng 6, 7 đã import không đổi.

import {
  type Generator, int, pick, chance, shuffle, mcOptions, fixedOptions, blanks, sign, retry,
  fmtInt, baiGiai,
} from "./core";
import { NAMES, THINGS } from "./shared";

const TABLES = [6, 7] as const;

/* ───── Bảng nhân, bảng chia 6 và 7 (điền số) ───── */
export const bangNhanChia67: Generator = (r) => {
  const k = pick(r, TABLES);
  const x = int(r, 1, 10);
  const p = k * x;
  const kind = pick(r, ["nhan", "nhanDao", "chia", "thieu"] as const);
  const base = { type: "fill_blank" as const, tags: [`bảng ${k}`, kind.startsWith("nhan") ? "phép nhân" : "phép chia"] };
  switch (kind) {
    case "nhan": return { ...base, difficulty: "easy", question: `${k} × ${x} = ___`, ...blanks(String(p)),
      explanation: `Theo bảng nhân ${k}: ${k} × ${x} = ${p}.`, hint: `Đọc thuộc bảng nhân ${k}.` };
    case "nhanDao": return { ...base, difficulty: "easy", question: `${x} × ${k} = ___`, ...blanks(String(p)),
      explanation: `Đổi chỗ các thừa số thì tích không đổi: ${x} × ${k} = ${k} × ${x} = ${p}.`, hint: `Đổi chỗ thành ${k} × ${x}.` };
    case "chia": return { ...base, difficulty: "medium", question: `${p} : ${k} = ___`, ...blanks(String(x)),
      explanation: `Vì ${k} × ${x} = ${p} nên ${p} : ${k} = ${x}.`, hint: `${k} nhân mấy thì bằng ${p}?` };
    case "thieu": return { ...base, difficulty: "medium", question: `${k} × ___ = ${p}`, ...blanks(String(x)),
      explanation: `Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: ${p} : ${k} = ${x}.`, hint: `Đọc bảng nhân ${k} tìm kết quả ${p}.` };
  }
};

/* ───── Trắc nghiệm: số nào nhân với k thì được p ───── */
export const timThuaSo67: Generator = (r) => {
  const k = pick(r, TABLES);
  const x = int(r, 2, 10);
  const p = k * x;
  // Nhiễu: lệch 1, và số của bảng còn lại (bé hay nhầm bảng 6 với bảng 7)
  const other = k === 6 ? 7 : 6;
  const cands = [x - 1, x + 1, x + 2, x - 2, Number.isInteger(p / other) ? p / other : -1]
    .filter((v) => v >= 1 && v <= 12).map(String);
  const { options, answer } = mcOptions(r, String(x), cands);
  return {
    type: "multiple_choice", difficulty: "medium", tags: [`bảng ${k}`, "tìm thừa số"],
    question: `Số nào nhân với ${k} thì được ${p}?`, options, answer,
    explanation: `Lấy ${p} : ${k} = ${x}. Thử lại: ${x} × ${k} = ${p}.`,
    hint: `Đọc bảng chia ${k}.`,
  };
};

/* ───── Tính giá trị biểu thức: k × a ± b ───── */
export const bieuThuc67: Generator = (r) => {
  const k = pick(r, TABLES);
  const a = int(r, 2, 10);
  const op = chance(r, 0.6) ? "+" : "-";
  const b = op === "+" ? int(r, 1, 30) : int(r, 1, k * a - 1);
  const ka = k * a;
  const c = op === "+" ? ka + b : ka - b;
  return {
    type: "fill_blank", difficulty: "medium", tags: ["biểu thức", `bảng ${k}`],
    question: `${k} × ${a} ${op} ${b} = ___`, ...blanks(String(c)),
    explanation: `Nhân trước, ${op === "+" ? "cộng" : "trừ"} sau: ${k} × ${a} = ${ka}; ${ka} ${op} ${b} = ${c}.`,
    hint: "Trong biểu thức có nhân và cộng/trừ, làm phép nhân trước.",
  };
};

/* ───── So sánh hai tích ───── */
export const soSanhTich67: Generator = (r) => {
  const [a, b] = retry(() => {
    const k1 = pick(r, TABLES), x1 = int(r, 2, 10);
    const k2 = pick(r, [6, 7, 5, 8]), x2 = int(r, 2, 10);
    if (k1 === k2 && x1 === x2) return null;
    // Không ra cặp quá dễ (chênh nhau nhiều): giữ trong khoảng 12
    return Math.abs(k1 * x1 - k2 * x2) <= 12 ? [[k1, x1], [k2, x2]] as const : null;
  });
  const [va, vb] = [a[0] * a[1], b[0] * b[1]];
  const s = sign(va - vb);
  const { options, answer } = fixedOptions([">", "<", "="], s);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["so sánh", "bảng nhân"],
    question: `Chọn dấu thích hợp: ${a[0]} × ${a[1]} ___ ${b[0]} × ${b[1]}`, options, answer,
    explanation: `${a[0]} × ${a[1]} = ${va}, ${b[0]} × ${b[1]} = ${vb}. Vì ${va} ${s} ${vb} nên ${a[0]} × ${a[1]} ${s} ${b[0]} × ${b[1]}.`,
    hint: "Tính từng tích rồi so sánh.",
  };
};

/* ───── Toán có lời văn (một bước) ───── */
export const loiVan67: Generator = (r) => {
  const k = pick(r, TABLES);
  const x = int(r, 2, 10);
  if (k === 7 && chance(r, 0.25))
    return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép nhân", "tuần lễ"],
      question: `Mỗi tuần lễ có 7 ngày. Hỏi ${x} tuần lễ có bao nhiêu ngày? Trả lời: ___ ngày.`,
      ...blanks(String(7 * x)),
      explanation: baiGiai([[`${x} tuần lễ có số ngày là:`, `7 × ${x} = ${7 * x} (ngày)`]], `${7 * x} ngày`), hint: "Mỗi tuần đều có 7 ngày → phép nhân." };
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const box = pick(r, ["hộp", "túi", "đĩa", "rổ"]);
  if (chance(r, 0.5))
    return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép nhân"],
      question: `Mỗi ${box} có ${k} ${thing}. Hỏi ${x} ${box} như thế có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(k * x)),
      explanation: baiGiai([[`Số ${thing} có trong ${x} ${box} là:`, `${k} × ${x} = ${k * x} (${thing})`]], `${k * x} ${thing}`), hint: "Mỗi phần bằng nhau → dùng phép nhân." };
  const chiaCho = chance(r, 0.5);
  // chia thành k phần (hỏi mỗi phần) hoặc chia mỗi phần k (hỏi số phần)
  return chiaCho
    ? { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép chia"],
      question: `Có ${k * x} ${thing} chia đều cho ${k} bạn. Hỏi mỗi bạn được mấy ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(x)),
      explanation: baiGiai([[`Mỗi bạn được số ${thing} là:`, `${k * x} : ${k} = ${x} (${thing})`]], `${x} ${thing}`), hint: "Chia đều → dùng phép chia." }
    : { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "phép chia"],
      question: `Có ${k * x} ${thing}, xếp vào các ${box}, mỗi ${box} ${k} ${thing}. Hỏi xếp được mấy ${box}? Trả lời: ___ ${box}.`,
      ...blanks(String(x)),
      explanation: baiGiai([[`Xếp được số ${box} là:`, `${k * x} : ${k} = ${x} (${box})`]], `${x} ${box}`), hint: `Tìm xem có mấy lần ${k} trong ${k * x}.` };
};

/* ───── Toán có lời văn (hai bước) ───── */
export const loiVanHaiBuoc67: Generator = (r) => {
  const k = pick(r, TABLES);
  const x = int(r, 3, 9);
  const name = pick(r, NAMES);
  if (chance(r, 0.5)) {
    const extra = int(r, 2, 9);
    const lop = pick(r, ["3A", "3B", "3C", "3D"]);
    return { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "hai bước"],
      question: `Lớp ${lop} xếp thành ${x} hàng, mỗi hàng ${k} bạn. Sau đó có thêm ${extra} bạn đến xếp hàng. Hỏi lúc này có tất cả bao nhiêu bạn? Trả lời: ___ bạn.`,
      ...blanks(String(k * x + extra)),
      explanation: baiGiai([
        [`Lúc đầu lớp ${lop} có số bạn xếp hàng là:`, `${k} × ${x} = ${k * x} (bạn)`],
        ["Lúc này có tất cả số bạn là:", `${k * x} + ${extra} = ${k * x + extra} (bạn)`],
      ], `${k * x + extra} bạn`),
      hint: "Tính số bạn lúc đầu bằng phép nhân, rồi cộng thêm." };
  }
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const given = int(r, 1, k * x - 1);
  return { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "hai bước"],
    question: `${name} có ${x} hộp, mỗi hộp ${k} ${thing}. ${name} cho bạn ${given} ${thing}. Hỏi ${name} còn lại bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
    ...blanks(String(k * x - given)),
    explanation: baiGiai([
      [`Số ${thing} có trong ${x} hộp là:`, `${k} × ${x} = ${k * x} (${thing})`],
      [`${name} còn lại số ${thing} là:`, `${k * x} - ${given} = ${k * x - given} (${thing})`],
    ], `${k * x - given} ${thing}`),
    hint: "Tính tất cả trước, rồi trừ đi số đã cho." };
};

/* ───── Đúng / sai ───── */
export const dungSai3: Generator = (r) => {
  const k = pick(r, TABLES), x = int(r, 1, 10);
  const ok = chance(r, 0.5);
  // Lỗi hay gặp: lệch một hàng của bảng (±k), hoặc lấy nhầm bảng bên cạnh (±x)
  const shown = ok ? k * x : k * x + pick(r, [-k, k, x, -x].filter((d) => k * x + d > 0));
  return { type: "true_false", difficulty: "easy", tags: ["đúng sai", `bảng ${k}`],
    question: `${k} × ${x} = ${shown}. Đúng hay sai?`, answer: ok,
    explanation: ok ? `Đúng, ${k} × ${x} = ${k * x}.` : `Sai, ${k} × ${x} = ${k * x}.`, hint: `Đọc lại bảng nhân ${k}.` };
};

/* ═════════════ Bảng nhân, bảng chia 3, 4, 8, 9 ═════════════ */

/** Điền số theo bảng nhân / chia của các bảng trong `tables`. */
const bangNhanChia = (tables: readonly number[]): Generator => (r) => {
  const k = pick(r, tables);
  const x = int(r, 1, 10);
  const p = k * x;
  const kind = pick(r, ["nhan", "nhanDao", "chia", "thieu"] as const);
  const base = { type: "fill_blank" as const, tags: [`bảng ${k}`, kind.startsWith("nhan") ? "phép nhân" : "phép chia"] };
  switch (kind) {
    case "nhan": return { ...base, difficulty: "easy", question: `${k} × ${x} = ___`, ...blanks(String(p)),
      explanation: `Theo bảng nhân ${k}: ${k} × ${x} = ${p}.`, hint: `Đọc thuộc bảng nhân ${k}.` };
    case "nhanDao": return { ...base, difficulty: "easy", question: `${x} × ${k} = ___`, ...blanks(String(p)),
      explanation: `Đổi chỗ các thừa số thì tích không đổi: ${x} × ${k} = ${k} × ${x} = ${p}.`, hint: `Đổi chỗ thành ${k} × ${x}.` };
    case "chia": return { ...base, difficulty: "medium", question: `${p} : ${k} = ___`, ...blanks(String(x)),
      explanation: `Vì ${k} × ${x} = ${p} nên ${p} : ${k} = ${x}.`, hint: `${k} nhân mấy thì bằng ${p}?` };
    case "thieu": return { ...base, difficulty: "medium", question: `${k} × ___ = ${p}`, ...blanks(String(x)),
      explanation: `Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: ${p} : ${k} = ${x}.`, hint: `Đọc bảng nhân ${k} tìm kết quả ${p}.` };
  }
};

/** Số nào nhân với k thì được p — nhiễu lệch 1, 2 và nhầm sang bảng bên cạnh. */
const timThuaSo = (tables: readonly number[]): Generator => (r) => {
  const k = pick(r, tables);
  const x = int(r, 2, 10);
  const p = k * x;
  const cands = [x - 1, x + 1, x + 2, x - 2, ...tables.filter((t) => t !== k && p % t === 0).map((t) => p / t)]
    .filter((v) => v >= 1 && v <= 12).map(String);
  const { options, answer } = mcOptions(r, String(x), cands);
  return {
    type: "multiple_choice", difficulty: "medium", tags: [`bảng ${k}`, "tìm thừa số"],
    question: `Số nào nhân với ${k} thì được ${p}?`, options, answer,
    explanation: `Lấy ${p} : ${k} = ${x}. Thử lại: ${x} × ${k} = ${p}.`,
    hint: `Đọc bảng chia ${k}.`,
  };
};

/** Lời văn một bước: nhân (mỗi hộp có k…) hoặc chia (chia đều / mỗi hộp k). */
const loiVanBang = (tables: readonly number[]): Generator => (r) => {
  const k = pick(r, tables);
  const x = int(r, 2, 10);
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const box = pick(r, ["hộp", "túi", "đĩa", "rổ"]);
  if (chance(r, 0.5))
    return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép nhân"],
      question: `Mỗi ${box} có ${k} ${thing}. Hỏi ${x} ${box} như thế có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(k * x)),
      explanation: baiGiai([[`Số ${thing} có trong ${x} ${box} là:`, `${k} × ${x} = ${k * x} (${thing})`]], `${k * x} ${thing}`), hint: "Mỗi phần bằng nhau → dùng phép nhân." };
  return chance(r, 0.5)
    ? { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép chia"],
      question: `Có ${k * x} ${thing} chia đều cho ${k} bạn. Hỏi mỗi bạn được mấy ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(x)),
      explanation: baiGiai([[`Mỗi bạn được số ${thing} là:`, `${k * x} : ${k} = ${x} (${thing})`]], `${x} ${thing}`), hint: "Chia đều → dùng phép chia." }
    : { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "phép chia"],
      question: `Có ${k * x} ${thing}, xếp vào các ${box}, mỗi ${box} ${k} ${thing}. Hỏi xếp được mấy ${box}? Trả lời: ___ ${box}.`,
      ...blanks(String(x)),
      explanation: baiGiai([[`Xếp được số ${box} là:`, `${k * x} : ${k} = ${x} (${box})`]], `${x} ${box}`), hint: `Tìm xem có mấy lần ${k} trong ${k * x}.` };
};

const dungSaiBang = (tables: readonly number[]): Generator => (r) => {
  const k = pick(r, tables), x = int(r, 1, 10);
  const ok = chance(r, 0.5);
  const shown = ok ? k * x : k * x + pick(r, [-k, k, x, -x].filter((d) => k * x + d > 0 && d !== 0));
  return { type: "true_false", difficulty: "easy", tags: ["đúng sai", `bảng ${k}`],
    question: `${k} × ${x} = ${shown}. Đúng hay sai?`, answer: ok,
    explanation: ok ? `Đúng, ${k} × ${x} = ${k * x}.` : `Sai, ${k} × ${x} = ${k * x}.`, hint: `Đọc lại bảng nhân ${k}.` };
};

const T34 = [3, 4] as const;
const T89 = [8, 9] as const;
export const bangNhanChia34 = bangNhanChia(T34);
export const bangNhanChia89 = bangNhanChia(T89);
export const timThuaSo34 = timThuaSo(T34);
export const timThuaSo89 = timThuaSo(T89);
export const loiVan34 = loiVanBang(T34);
export const loiVan89 = loiVanBang(T89);
export const dungSai34 = dungSaiBang(T34);
export const dungSai89 = dungSaiBang(T89);

/* ═════════════ Gấp, giảm một số lần; tìm thành phần ═════════════ */

export const gapGiam: Generator = (r) => {
  const k = int(r, 2, 9);
  const kind = pick(r, ["gap", "giam", "soLan", "gapTrac"] as const);
  if (kind === "gap") {
    const a = int(r, 2, 12);
    return { type: "fill_blank", difficulty: "easy", tags: ["gấp một số lên nhiều lần"],
      question: `Gấp ${a} lên ${k} lần được ___`, ...blanks(String(a * k)),
      explanation: `Muốn gấp một số lên nhiều lần, ta nhân số đó với số lần: ${a} × ${k} = ${a * k}.`,
      hint: "Gấp lên mấy lần thì nhân với số đó." };
  }
  if (kind === "giam") {
    const q = int(r, 2, 12);
    return { type: "fill_blank", difficulty: "easy", tags: ["giảm một số đi nhiều lần"],
      question: `Giảm ${q * k} đi ${k} lần được ___`, ...blanks(String(q)),
      explanation: `Muốn giảm một số đi nhiều lần, ta chia số đó cho số lần: ${q * k} : ${k} = ${q}.`,
      hint: "Giảm đi mấy lần thì chia cho số đó." };
  }
  if (kind === "soLan") {
    const b = int(r, 2, 9);
    return { type: "fill_blank", difficulty: "medium", tags: ["số lớn gấp mấy lần số bé"],
      question: `Số ${b * k} gấp số ${b} bao nhiêu lần? Trả lời: ___ lần.`, ...blanks(String(k)),
      explanation: `Muốn tìm số lớn gấp mấy lần số bé, ta lấy số lớn chia cho số bé: ${b * k} : ${b} = ${k} (lần).`,
      hint: "Lấy số lớn chia cho số bé." };
  }
  // Trắc nghiệm: bé hay nhầm "gấp lên k lần" (nhân) với "thêm k đơn vị" (cộng)
  const a = int(r, 3, 12);
  const { options, answer } = mcOptions(r, String(a * k), [a + k, a * (k + 1), a * (k - 1), a * k + k, a * k - k, a * k + 1, a * k - 1].filter((v) => v > 0).map(String));
  return { type: "multiple_choice", difficulty: "medium", tags: ["gấp một số lên nhiều lần"],
    question: `Gấp ${a} lên ${k} lần được số nào?`, options, answer,
    explanation: `Gấp lên ${k} lần là nhân với ${k}: ${a} × ${k} = ${a * k}. (Thêm ${k} đơn vị mới là cộng: ${a} + ${k} = ${a + k}.)`,
    hint: "Gấp lên mấy lần thì nhân, thêm mấy đơn vị thì cộng." };
};

export const loiVanGapGiam: Generator = (r) => {
  const [n1, n2] = shuffle(r, NAMES).slice(0, 2);
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const k = int(r, 2, 6);
  if (chance(r, 0.5)) {
    const a = int(r, 3, 15);
    return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "gấp một số lên nhiều lần"],
      question: `${n1} có ${a} ${thing}. Số ${thing} của ${n2} gấp ${k} lần số ${thing} của ${n1}. Hỏi ${n2} có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(a * k)),
      explanation: baiGiai([[`Số ${thing} của ${n2} là:`, `${a} × ${k} = ${a * k} (${thing})`]], `${a * k} ${thing}`), hint: "Gấp lên mấy lần thì nhân." };
  }
  const q = int(r, 3, 15);
  return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "giảm một số đi nhiều lần"],
    question: `${n1} có ${q * k} ${thing}. Số ${thing} của ${n2} bằng số ${thing} của ${n1} giảm đi ${k} lần. Hỏi ${n2} có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
    ...blanks(String(q)),
    explanation: baiGiai([[`Số ${thing} của ${n2} là:`, `${q * k} : ${k} = ${q} (${thing})`]], `${q} ${thing}`), hint: "Giảm đi mấy lần thì chia." };
};

export const timThanhPhanNhanChia: Generator = (r) => {
  const k = int(r, 2, 9), x = int(r, 2, 10);
  const p = k * x;
  switch (pick(r, ["thuaSo", "soBiChia", "soChia"] as const)) {
    case "thuaSo": return { type: "fill_blank", difficulty: "medium", tags: ["tìm thừa số"],
      question: `___ × ${k} = ${p}`, ...blanks(String(x)),
      explanation: `Muốn tìm thừa số chưa biết, lấy tích chia cho thừa số kia: ${p} : ${k} = ${x}.`,
      hint: "Lấy tích chia cho thừa số đã biết." };
    case "soBiChia": return { type: "fill_blank", difficulty: "medium", tags: ["tìm số bị chia"],
      question: `___ : ${k} = ${x}`, ...blanks(String(p)),
      explanation: `Muốn tìm số bị chia, lấy thương nhân với số chia: ${x} × ${k} = ${p}.`,
      hint: "Lấy thương nhân với số chia." };
    case "soChia": return { type: "fill_blank", difficulty: "hard", tags: ["tìm số chia"],
      question: `${p} : ___ = ${x}`, ...blanks(String(k)),
      explanation: `Muốn tìm số chia, lấy số bị chia chia cho thương: ${p} : ${x} = ${k}.`,
      hint: "Lấy số bị chia chia cho thương." };
  }
};

/* ═════════════ Nhân, chia với số có một chữ số (trong phạm vi 1000); biểu thức ═════════════ */

export const nhanChiaMotChuSo: Generator = (r) => {
  const k = int(r, 2, 9);
  switch (pick(r, ["nhan", "chia", "du"] as const)) {
    case "nhan": {
      const a = int(r, 12, Math.floor(999 / k));
      return { type: "fill_blank", difficulty: a >= 100 ? "medium" : "easy", tags: ["phép nhân"],
        question: `${a} × ${k} = ___`, ...blanks(String(a * k)),
        explanation: `Đặt tính rồi nhân từ hàng đơn vị, nhớ sang hàng bên trái: ${a} × ${k} = ${a * k}.`,
        hint: "Nhân lần lượt từ phải sang trái." };
    }
    case "chia": {
      const q = int(r, 11, Math.floor(999 / k));
      return { type: "fill_blank", difficulty: "medium", tags: ["phép chia"],
        question: `${q * k} : ${k} = ___`, ...blanks(String(q)),
        explanation: `Chia lần lượt từ trái sang phải. Thử lại: ${q} × ${k} = ${q * k}.`,
        hint: "Lấy từng chữ số (hoặc nhóm chữ số) từ trái sang để chia." };
    }
    case "du": {
      const q = int(r, 11, Math.floor(990 / k)), rem = int(r, 1, k - 1);
      const a = q * k + rem;
      return { type: "fill_blank", difficulty: "hard", tags: ["phép chia", "chia có dư"],
        question: `${a} : ${k} = ${q} (dư ___)`, ...blanks(String(rem)),
        explanation: `${q} × ${k} = ${q * k}; ${a} - ${q * k} = ${rem}. Số dư ${rem} bé hơn số chia ${k}.`,
        hint: "Số dư = số bị chia - thương × số chia; số dư luôn bé hơn số chia." };
    }
  }
};

/** Tính giá trị biểu thức: có ngoặc, hoặc nhân/chia trước cộng/trừ. */
export const bieuThuc3: Generator = (r) => {
  const k = int(r, 2, 9), x = int(r, 2, 12);
  const form = pick(r, ["ngoacChia", "ngoacNhan", "chiaTruoc", "nhanTruoc"] as const);
  if (form === "ngoacChia") {
    const a = int(r, 1, k * x - 1), b = k * x - a;
    return { type: "fill_blank", difficulty: "medium", tags: ["biểu thức", "có dấu ngoặc"],
      question: `Tính giá trị biểu thức: (${a} + ${b}) : ${k} = ___`, ...blanks(String(x)),
      explanation: `Tính trong ngoặc trước: ${a} + ${b} = ${k * x}; rồi ${k * x} : ${k} = ${x}.`,
      hint: "Có dấu ngoặc thì tính trong ngoặc trước." };
  }
  if (form === "ngoacNhan") {
    const b = int(r, 1, 20), a = x + b;
    return { type: "fill_blank", difficulty: "medium", tags: ["biểu thức", "có dấu ngoặc"],
      question: `Tính giá trị biểu thức: ${k} × (${a} - ${b}) = ___`, ...blanks(String(k * x)),
      explanation: `Tính trong ngoặc trước: ${a} - ${b} = ${x}; rồi ${k} × ${x} = ${k * x}.`,
      hint: "Có dấu ngoặc thì tính trong ngoặc trước." };
  }
  if (form === "chiaTruoc") {
    const a = int(r, x + 1, 200);
    return { type: "fill_blank", difficulty: "hard", tags: ["biểu thức"],
      question: `Tính giá trị biểu thức: ${a} - ${k * x} : ${k} = ___`, ...blanks(String(a - x)),
      explanation: `Nhân, chia trước; cộng, trừ sau: ${k * x} : ${k} = ${x}; ${a} - ${x} = ${a - x}.`,
      hint: "Làm phép chia trước rồi mới trừ." };
  }
  const a = int(r, 1, 200);
  return { type: "fill_blank", difficulty: "hard", tags: ["biểu thức"],
    question: `Tính giá trị biểu thức: ${a} + ${x} × ${k} = ___`, ...blanks(String(a + x * k)),
    explanation: `Nhân, chia trước; cộng, trừ sau: ${x} × ${k} = ${x * k}; ${a} + ${x * k} = ${a + x * k}.`,
    hint: "Làm phép nhân trước rồi mới cộng." };
};

/** Một phần mấy của một số: 1/k của n. */
export const motPhanMay: Generator = (r) => {
  const k = pick(r, [2, 3, 4, 5, 6, 7, 8, 9]);
  const x = int(r, 2, 10);
  const [unit, label] = pick(r, [["kg", "kg"], ["m", "m"], ["l", "l"], ["", "quả cam"], ["", "cái kẹo"]] as const);
  const what = unit ? `${k * x} ${unit}` : `${k * x} ${label}`;
  const tail = unit ? ` ${unit}` : ` ${label}`;
  return { type: "fill_blank", difficulty: "medium", tags: ["một phần mấy"],
    question: `1/${k} của ${what} là ___${tail}.`, ...blanks(String(x)),
    explanation: `Muốn tìm 1/${k} của một số, ta chia số đó cho ${k}: ${k * x} : ${k} = ${x}${tail}.`,
    hint: `Chia cho ${k}.` };
};

/* ═════════════ Các số trong phạm vi 100.000 ═════════════ */

export const HANG3 = ["đơn vị", "chục", "trăm", "nghìn", "chục nghìn"];

export const cauTaoSo: Generator = (r) => {
  const digits = [int(r, 1, 9), int(r, 0, 9), int(r, 0, 9), int(r, 0, 9), int(r, 0, 9)];
  const n = digits.reduce((s, d) => s * 10 + d, 0);
  const parts = digits.map((d, i) => `${d} ${HANG3[4 - i]}`);
  if (chance(r, 0.5))
    return { type: "fill_blank", difficulty: "medium", tags: ["cấu tạo số"],
      question: `Viết số gồm ${parts.slice(0, 4).join(", ")} và ${parts[4]}: ___`, ...blanks(fmtInt(n)),
      explanation: `Viết lần lượt các chữ số từ hàng chục nghìn đến hàng đơn vị: ${digits.join("")} → ${fmtInt(n)}.`,
      hint: "Viết từ hàng cao nhất xuống, hàng nào bằng 0 thì viết chữ số 0." };
  const after = chance(r, 0.5);
  // Nửa số câu có chữ số tận cùng 9 (liền sau) hoặc 0 (liền trước) để phải nhớ/mượn qua hàng chục
  const m = chance(r, 0.5) ? int(r, 1001, 9998) * 10 + (after ? 9 : 0) : int(r, 10001, 99998);
  return { type: "fill_blank", difficulty: "easy", tags: ["số liền trước, liền sau"],
    question: `Số liền ${after ? "sau" : "trước"} của số ${fmtInt(m)} là ___`, ...blanks(fmtInt(after ? m + 1 : m - 1)),
    explanation: `${after ? "Số liền sau hơn" : "Số liền trước kém"} số đã cho 1 đơn vị: ${fmtInt(m)} ${after ? "+" : "-"} 1 = ${fmtInt(after ? m + 1 : m - 1)}.`,
    hint: after ? "Cộng thêm 1." : "Bớt đi 1." };
};

export const giaTriChuSo3: Generator = (r) => {
  const d = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
  const n = d.reduce((s, x) => s * 10 + x, 0);
  const pos = int(r, 1, 4);
  const digit = d[4 - pos];
  return { type: "fill_blank", difficulty: "medium", tags: ["giá trị chữ số"],
    question: `Giá trị của chữ số ${digit} trong số ${fmtInt(n)} là ___`, ...blanks(fmtInt(digit * 10 ** pos)),
    explanation: `Chữ số ${digit} ở hàng ${HANG3[pos]} nên có giá trị là ${fmtInt(digit * 10 ** pos)}.`,
    hint: "Xem chữ số đó đứng ở hàng nào." };
};

export const soSanh100000: Generator = (r) => {
  const a = int(r, 10000, 99999);
  let b = a;
  if (!chance(r, 0.1)) {
    const s = String(a).split("").map(Number);
    const i = int(r, 1, 4);
    s[i] = pick(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== s[i]));
    b = s.reduce((t, x) => t * 10 + x, 0);
  }
  const s = sign(a - b);
  const { options, answer } = fixedOptions([">", "<", "="], s);
  return { type: "multiple_choice", difficulty: "medium", tags: ["so sánh số"],
    question: `Chọn dấu thích hợp: ${fmtInt(a)} ___ ${fmtInt(b)}`, options, answer,
    explanation: s === "=" ? `Hai số giống nhau ở mọi hàng nên ${fmtInt(a)} = ${fmtInt(b)}.`
      : `Hai số cùng có 5 chữ số. So sánh từ hàng chục nghìn sang phải, gặp hàng đầu tiên khác nhau: ${fmtInt(a)} ${s} ${fmtInt(b)}.`,
    hint: "Cùng số chữ số thì so sánh từ hàng cao nhất." };
};

export const sapXep100000: Generator = (r) => {
  const head = int(r, 10, 99);
  const set = new Set<number>();
  while (set.size < 4) set.add(head * 1000 + int(r, 0, 999));
  const nums = [...set];
  const asc = chance(r, 0.5);
  const sorted = [...nums].sort((x, y) => (asc ? x - y : y - x));
  const items = nums.map((n, i) => ({ id: `n${i}`, content: fmtInt(n) }));
  let shown = shuffle(r, items);
  while (shown.map((i) => i.content).join() === sorted.map(fmtInt).join()) shown = shuffle(r, items);
  return { type: "ordering", difficulty: "medium", tags: ["sắp xếp số"],
    question: `Sắp xếp các số theo thứ tự từ ${asc ? "bé đến lớn" : "lớn đến bé"}.`,
    items: shown, correctOrder: sorted.map((n) => items.find((i) => i.content === fmtInt(n))!.id),
    explanation: `Thứ tự đúng: ${sorted.map(fmtInt).join(asc ? " < " : " > ")}.`,
    hint: "So sánh từng hàng từ trái sang phải." };
};

const ROUND3 = [
  { name: "hàng chục", p: 1, lo: 100, hi: 999 },
  { name: "hàng trăm", p: 2, lo: 1000, hi: 9999 },
  { name: "hàng nghìn", p: 3, lo: 10000, hi: 99999 },
  { name: "hàng chục nghìn", p: 4, lo: 10000, hi: 94999 },
] as const;

export const lamTron3: Generator = (r) => {
  const { name, p, lo, hi } = pick(r, ROUND3);
  const n = retry(() => { const x = int(r, lo, hi); return x % 10 ** p !== 0 ? x : null; });
  const round = (v: number, q: number) => Math.round(v / 10 ** q) * 10 ** q;
  const correct = round(n, p);
  const down = Math.floor(n / 10 ** p) * 10 ** p;
  // Nhiễu: làm tròn sai chiều, lệch một đơn vị của hàng, làm tròn nhầm hàng bên cạnh
  const cands = [down, down + 10 ** p, down - 10 ** p, down + 2 * 10 ** p, down + 3 * 10 ** p, round(n, p + 1), round(n, p - 1)]
    .filter((x) => x > 0 && x !== n).map(fmtInt);
  const { options, answer } = mcOptions(r, fmtInt(correct), cands);
  const next = Math.floor(n / 10 ** (p - 1)) % 10;
  return { type: "multiple_choice", difficulty: "medium", tags: ["làm tròn số"],
    question: `Làm tròn số ${fmtInt(n)} đến ${name} thì được số nào?`, options, answer,
    explanation: `Chữ số ngay bên phải ${name} là ${next}. ${next >= 5 ? `Vì ${next} ≥ 5 nên làm tròn lên` : `Vì ${next} < 5 nên làm tròn xuống`}: ${fmtInt(n)} ≈ ${fmtInt(correct)}.`,
    hint: "Chữ số bên phải bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên." };
};

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

export const soLaMa: Generator = (r) => {
  const n = int(r, 1, 20);
  // Nhiễu: đảo chữ (IV ↔ VI, IX ↔ XI), lệch 1
  const near = [n - 1, n + 1, n === 4 ? 6 : n === 6 ? 4 : n === 9 ? 11 : n === 11 ? 9 : n + 2, n + 5, n - 5, n - 2, n - 3, n + 10, n - 10]
    .filter((v) => v >= 1 && v <= 20 && v !== n);
  if (chance(r, 0.5)) {
    const { options, answer } = mcOptions(r, String(n), near.map(String));
    return { type: "multiple_choice", difficulty: "medium", tags: ["chữ số La Mã"],
      question: `Số La Mã ${ROMAN[n]} đọc là số nào?`, options, answer,
      explanation: `I = 1, V = 5, X = 10. Chữ số ghi bên phải chữ số lớn hơn thì cộng thêm, ghi bên trái thì trừ đi: ${ROMAN[n]} = ${n}.`,
      hint: "I = 1, V = 5, X = 10." };
  }
  const { options, answer } = mcOptions(r, ROMAN[n], near.map((v) => ROMAN[v]));
  return { type: "multiple_choice", difficulty: "medium", tags: ["chữ số La Mã"],
    question: `Số ${n} viết bằng chữ số La Mã là:`, options, answer,
    explanation: `I = 1, V = 5, X = 10. Số ${n} viết là ${ROMAN[n]}.`,
    hint: "I = 1, V = 5, X = 10; IV = 4, IX = 9." };
};

/* ═════════════ Cộng, trừ, nhân, chia trong phạm vi 100.000 ═════════════ */

export const phepTinh100000: Generator = (r) => {
  switch (pick(r, ["cong", "tru", "nhan", "chia", "du"] as const)) {
    case "cong": {
      const a = int(r, 1000, 89999), b = int(r, 1000, 99999 - a);
      return { type: "fill_blank", difficulty: "medium", tags: ["phép cộng"],
        question: `${fmtInt(a)} + ${fmtInt(b)} = ___`, ...blanks(fmtInt(a + b)),
        explanation: `Đặt tính thẳng cột rồi cộng từ phải sang trái, nhớ sang hàng bên trái: ${fmtInt(a)} + ${fmtInt(b)} = ${fmtInt(a + b)}.`,
        hint: "Viết các chữ số cùng hàng thẳng cột." };
    }
    case "tru": {
      const a = int(r, 10000, 99999), b = int(r, 1000, a - 1);
      return { type: "fill_blank", difficulty: "medium", tags: ["phép trừ"],
        question: `${fmtInt(a)} - ${fmtInt(b)} = ___`, ...blanks(fmtInt(a - b)),
        explanation: `Đặt tính thẳng cột rồi trừ từ phải sang trái, nhớ sang hàng bên trái: ${fmtInt(a)} - ${fmtInt(b)} = ${fmtInt(a - b)}.`,
        hint: "Viết các chữ số cùng hàng thẳng cột." };
    }
    case "nhan": {
      const k = int(r, 2, 9), a = int(r, 1000, Math.floor(99999 / k));
      return { type: "fill_blank", difficulty: "medium", tags: ["phép nhân"],
        question: `${fmtInt(a)} × ${k} = ___`, ...blanks(fmtInt(a * k)),
        explanation: `Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: ${fmtInt(a)} × ${k} = ${fmtInt(a * k)}.`,
        hint: "Đặt tính rồi nhân từ hàng đơn vị." };
    }
    case "chia": {
      const k = int(r, 2, 9), q = int(r, 1000, Math.floor(99999 / k));
      return { type: "fill_blank", difficulty: "hard", tags: ["phép chia"],
        question: `${fmtInt(q * k)} : ${k} = ___`, ...blanks(fmtInt(q)),
        explanation: `Chia lần lượt từ trái sang phải. Thử lại: ${fmtInt(q)} × ${k} = ${fmtInt(q * k)}.`,
        hint: "Lấy từng chữ số (hoặc nhóm chữ số) từ trái sang để chia." };
    }
    case "du": {
      const k = int(r, 3, 9), q = int(r, 1000, Math.floor(99990 / k)), rem = int(r, 1, k - 1);
      const a = q * k + rem;
      return { type: "fill_blank", difficulty: "hard", tags: ["phép chia", "chia có dư"],
        question: `${fmtInt(a)} : ${k} = ${fmtInt(q)} (dư ___)`, ...blanks(String(rem)),
        explanation: `${fmtInt(q)} × ${k} = ${fmtInt(q * k)}; ${fmtInt(a)} - ${fmtInt(q * k)} = ${rem}.`,
        hint: "Số dư = số bị chia - thương × số chia." };
    }
  }
};

export const tienVN3: Generator = (r) => {
  const name = pick(r, NAMES);
  const [item, lo, hi] = pick(r, [["một quyển truyện", 15, 45], ["một hộp bút màu", 20, 60], ["một chiếc mũ", 25, 80], ["một quả bóng", 30, 90]] as const);
  const price = int(r, lo, hi) * 1000 + pick(r, [0, 500]);
  const note = pick(r, [50000, 100000].filter((v) => v > price));
  return { type: "fill_blank", difficulty: "medium", tags: ["tiền Việt Nam", "toán có lời văn"],
    question: `${name} có ${fmtInt(note)} đồng, mua ${item} giá ${fmtInt(price)} đồng. Hỏi ${name} còn lại bao nhiêu tiền? Trả lời: ___ đồng.`,
    ...blanks(fmtInt(note - price)),
    explanation: baiGiai([[`${name} còn lại số tiền là:`, `${fmtInt(note)} - ${fmtInt(price)} = ${fmtInt(note - price)} (đồng)`]], `${fmtInt(note - price)} đồng`),
    hint: "Lấy số tiền có trừ đi giá tiền." };
};

/* ═════════════ Chu vi, diện tích; đơn vị đo; tháng – năm ═════════════ */

export const chuViDienTich: Generator = (r) => {
  const square = chance(r, 0.4);
  const area = chance(r, 0.5);
  if (square) {
    const a = int(r, 2, 15);
    return { type: "fill_blank", difficulty: "medium", tags: [area ? "diện tích hình vuông" : "chu vi hình vuông"],
      question: `Hình vuông có cạnh ${a} cm. ${area ? "Diện tích" : "Chu vi"} hình vuông là ___ ${area ? "cm²" : "cm"}.`,
      ...blanks(String(area ? a * a : a * 4)),
      explanation: area ? `Diện tích hình vuông = cạnh × cạnh = ${a} × ${a} = ${a * a} (cm²).`
        : `Chu vi hình vuông = cạnh × 4 = ${a} × 4 = ${a * 4} (cm).`,
      hint: area ? "Lấy cạnh nhân với cạnh." : "Lấy độ dài một cạnh nhân với 4." };
  }
  const w = int(r, 2, 12), l = int(r, w + 1, 25);
  return { type: "fill_blank", difficulty: "medium", tags: [area ? "diện tích hình chữ nhật" : "chu vi hình chữ nhật"],
    question: `Hình chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm. ${area ? "Diện tích" : "Chu vi"} hình chữ nhật là ___ ${area ? "cm²" : "cm"}.`,
    ...blanks(String(area ? l * w : (l + w) * 2)),
    explanation: area ? `Diện tích hình chữ nhật = chiều dài × chiều rộng = ${l} × ${w} = ${l * w} (cm²).`
      : `Chu vi hình chữ nhật = (chiều dài + chiều rộng) × 2 = (${l} + ${w}) × 2 = ${(l + w) * 2} (cm).`,
    hint: area ? "Lấy chiều dài nhân chiều rộng (cùng đơn vị đo)." : "Cộng chiều dài với chiều rộng rồi nhân với 2." };
};

const DOI3 = [
  { big: "m", small: "cm", f: 100 }, { big: "cm", small: "mm", f: 10 }, { big: "m", small: "mm", f: 1000 },
  { big: "km", small: "m", f: 1000 }, { big: "kg", small: "g", f: 1000 }, { big: "l", small: "ml", f: 1000 },
] as const;

export const doiDonVi3: Generator = (r) => {
  const { big, small, f } = pick(r, DOI3);
  if (chance(r, 0.4)) {
    const a = int(r, 1, 9), b = int(r, 1, f - 1);
    return { type: "fill_blank", difficulty: "hard", tags: ["đổi đơn vị"],
      question: `${a} ${big} ${b} ${small} = ___ ${small}`, ...blanks(fmtInt(a * f + b)),
      explanation: `1 ${big} = ${fmtInt(f)} ${small}, nên ${a} ${big} = ${fmtInt(a * f)} ${small}; ${fmtInt(a * f)} + ${b} = ${fmtInt(a * f + b)} (${small}).`,
      hint: `Đổi ${a} ${big} ra ${small} trước rồi cộng thêm.` };
  }
  const a = int(r, 2, 9);
  return { type: "fill_blank", difficulty: "easy", tags: ["đổi đơn vị"],
    question: `${a} ${big} = ___ ${small}`, ...blanks(fmtInt(a * f)),
    explanation: `1 ${big} = ${fmtInt(f)} ${small}, nên ${a} ${big} = ${a} × ${fmtInt(f)} = ${fmtInt(a * f)} ${small}.`,
    hint: `1 ${big} = ${fmtInt(f)} ${small}.` };
};

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const thangNam: Generator = (r) => {
  const m = pick(r, [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]); // bỏ tháng 2 (28 hoặc 29 ngày)
  const d = DAYS_IN_MONTH[m - 1];
  const { options, answer } = fixedOptions(["28 ngày", "30 ngày", "31 ngày"], `${d} ngày`);
  return { type: "multiple_choice", difficulty: "easy", tags: ["tháng – năm"],
    question: `Tháng ${m} có bao nhiêu ngày?`, options, answer,
    explanation: `Các tháng có 31 ngày: 1, 3, 5, 7, 8, 10, 12. Các tháng có 30 ngày: 4, 6, 9, 11. Tháng 2 có 28 hoặc 29 ngày. Vậy tháng ${m} có ${d} ngày.`,
    hint: "Đếm trên các đốt ngón tay: đốt lồi là tháng 31 ngày." };
};

export const LOP3 = {
  bangNhanChia67, timThuaSo67, bieuThuc67, soSanhTich67, loiVan67, loiVanHaiBuoc67, dungSai3,
  bangNhanChia34, timThuaSo34, loiVan34, dungSai34,
  bangNhanChia89, timThuaSo89, loiVan89, dungSai89,
  gapGiam, loiVanGapGiam, timThanhPhanNhanChia,
  nhanChiaMotChuSo, bieuThuc3, motPhanMay,
  cauTaoSo, giaTriChuSo3, soSanh100000, sapXep100000, lamTron3, soLaMa,
  phepTinh100000, tienVN3,
  chuViDienTich, doiDonVi3, thangNam,
};
