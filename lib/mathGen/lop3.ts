// lib/mathGen/lop3.ts — Toán lớp 3 (Chương trình GDPT 2018)
// Hiện có chủ đề bảng nhân, bảng chia 6 và 7 (học kỳ 1).

import {
  type Generator, int, pick, chance, mcOptions, fixedOptions, blanks, sign, retry,
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
      explanation: `${x} tuần, mỗi tuần 7 ngày: 7 × ${x} = ${7 * x} (ngày).`, hint: "Mỗi tuần đều có 7 ngày → phép nhân." };
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const box = pick(r, ["hộp", "túi", "đĩa", "rổ"]);
  if (chance(r, 0.5))
    return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép nhân"],
      question: `Mỗi ${box} có ${k} ${thing}. Hỏi ${x} ${box} như thế có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(k * x)),
      explanation: `${x} ${box}, mỗi ${box} ${k} ${thing}: ${k} × ${x} = ${k * x} (${thing}).`, hint: "Mỗi phần bằng nhau → dùng phép nhân." };
  const chiaCho = chance(r, 0.5);
  // chia thành k phần (hỏi mỗi phần) hoặc chia mỗi phần k (hỏi số phần)
  return chiaCho
    ? { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép chia"],
      question: `Có ${k * x} ${thing} chia đều cho ${k} bạn. Hỏi mỗi bạn được mấy ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(x)),
      explanation: `Chia đều cho ${k} bạn → phép chia: ${k * x} : ${k} = ${x} (${thing}).`, hint: "Chia đều → dùng phép chia." }
    : { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "phép chia"],
      question: `Có ${k * x} ${thing}, xếp vào các ${box}, mỗi ${box} ${k} ${thing}. Hỏi xếp được mấy ${box}? Trả lời: ___ ${box}.`,
      ...blanks(String(x)),
      explanation: `Mỗi ${box} ${k} ${thing} → phép chia: ${k * x} : ${k} = ${x} (${box}).`, hint: `Tìm xem có mấy lần ${k} trong ${k * x}.` };
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
      explanation: `Lúc đầu: ${k} × ${x} = ${k * x} (bạn). Lúc này: ${k * x} + ${extra} = ${k * x + extra} (bạn).`,
      hint: "Tính số bạn lúc đầu bằng phép nhân, rồi cộng thêm." };
  }
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const given = int(r, 1, k * x - 1);
  return { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "hai bước"],
    question: `${name} có ${x} hộp, mỗi hộp ${k} ${thing}. ${name} cho bạn ${given} ${thing}. Hỏi ${name} còn lại bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
    ...blanks(String(k * x - given)),
    explanation: `${name} có: ${k} × ${x} = ${k * x} (${thing}). Còn lại: ${k * x} - ${given} = ${k * x - given} (${thing}).`,
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

export const LOP3 = {
  bangNhanChia67, timThuaSo67, bieuThuc67, soSanhTich67, loiVan67, loiVanHaiBuoc67, dungSai3,
};
