// lib/mathGen/lop2.ts — Toán lớp 2 (Chương trình GDPT 2018)

import {
  type Generator, type Rng, int, pick, chance, mcOptions, blanks, fmtInt, retry,
} from "./core";
import { NAMES, THINGS, DAYS, cap, xemDongHo, ngayTrongTuan, soSanhSo, sapXepSo } from "./shared";

/* ───── Phép cộng / trừ có nhớ ───── */

/** Cặp số cho phép tính CÓ nhớ (cộng) hoặc có mượn (trừ). */
function carryPair(r: Rng, op: "+" | "-", max: number): [number, number] {
  return retry(() => {
    if (max === 20) {
      if (op === "+") { const a = int(r, 2, 9), b = int(r, 2, 9); return a + b > 10 ? [a, b] : null; }
      const a = int(r, 11, 18), b = int(r, 2, 9); return (a % 10) < b && a - b > 0 ? [a, b] : null;
    }
    const lo = max === 100 ? 10 : 100;
    const a = int(r, lo, max - 1);
    const b = int(r, max === 100 ? 2 : 10, max === 100 ? 89 : 899);
    if (op === "+") return a + b <= max && (a % 10) + (b % 10) >= 10 ? [a, b] : null;
    return a - b > 0 && (a % 10) < (b % 10) ? [a, b] : null;
  });
}

const congTruCoNho = (max: 20 | 100 | 1000): Generator => (r) => {
  const op = chance(r, 0.5) ? "+" : "-";
  const [a, b] = carryPair(r, op, max);
  const c = op === "+" ? a + b : a - b;
  const explanation = max === 20
    ? (op === "+"
      ? `Tách để làm tròn 10: ${a} + ${10 - a} = 10, còn ${b - (10 - a)}; 10 + ${b - (10 - a)} = ${c}.`
      : `Tách: ${a} - ${a % 10} = 10, còn phải trừ ${b - (a % 10)}; 10 - ${b - (a % 10)} = ${c}.`)
    : (op === "+"
      ? `Cộng đơn vị: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, viết ${((a % 10) + (b % 10)) % 10} nhớ 1 sang hàng chục. Kết quả: ${fmtInt(c)}.`
      : `Trừ đơn vị: ${a % 10} không trừ được ${b % 10}, lấy ${10 + (a % 10)} - ${b % 10} = ${10 + (a % 10) - (b % 10)}, nhớ 1 sang hàng chục của số trừ. Kết quả: ${fmtInt(c)}.`);
  return {
    type: "fill_blank", difficulty: max === 20 ? "medium" : "hard",
    tags: [op === "+" ? "phép cộng" : "phép trừ", "có nhớ", `phạm vi ${max}`],
    question: `${fmtInt(a)} ${op} ${fmtInt(b)} = ___`, ...blanks(fmtInt(c)),
    explanation, hint: max === 20 ? "Tách số để được 10 trước." : "Đặt tính rồi tính từ phải sang trái, nhớ 1 khi cần.",
  };
};
export const congTru20 = congTruCoNho(20);
export const congTru100 = congTruCoNho(100);
export const congTru1000 = congTruCoNho(1000);

/* ───── Số hạng – tổng, số bị trừ – hiệu ───── */
export const thanhPhanPhepTinh: Generator = (r) => {
  const a = int(r, 20, 80), b = int(r, 5, 99 - a);
  const kind = pick(r, ["tong", "hieu", "timSoHang"] as const);
  if (kind === "tong")
    return { type: "fill_blank", difficulty: "easy", tags: ["số hạng", "tổng"],
      question: `Số hạng thứ nhất là ${a}, số hạng thứ hai là ${b}. Tổng là ___.`, ...blanks(String(a + b)),
      explanation: `Tổng = số hạng + số hạng = ${a} + ${b} = ${a + b}.`, hint: "Tổng là kết quả phép cộng." };
  if (kind === "hieu")
    return { type: "fill_blank", difficulty: "easy", tags: ["số bị trừ", "hiệu"],
      question: `Số bị trừ là ${a + b}, số trừ là ${b}. Hiệu là ___.`, ...blanks(String(a)),
      explanation: `Hiệu = số bị trừ - số trừ = ${a + b} - ${b} = ${a}.`, hint: "Hiệu là kết quả phép trừ." };
  return { type: "fill_blank", difficulty: "medium", tags: ["số hạng", "tìm số hạng"],
    question: `${a} + ___ = ${a + b}`, ...blanks(String(b)),
    explanation: `Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: ${a + b} - ${a} = ${b}.`,
    hint: "Lấy tổng trừ đi số hạng kia." };
};

/* ───── Bài toán nhiều hơn / ít hơn ───── */
export const nhieuHonItHon: Generator = (r) => {
  const n1 = pick(r, NAMES.slice(0, 5)), n2 = pick(r, NAMES.slice(5));
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  const more = chance(r, 0.5);
  const a = int(r, 15, 60), d = int(r, 3, more ? 25 : Math.min(25, a - 5));
  const c = more ? a + d : a - d;
  return {
    type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", more ? "nhiều hơn" : "ít hơn"],
    question: `${n1} có ${a} ${thing}. ${n2} có ${more ? "nhiều" : "ít"} hơn ${n1} ${d} ${thing}. Hỏi ${n2} có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
    ...blanks(String(c)),
    explanation: more ? `"Nhiều hơn" thì làm phép cộng: ${a} + ${d} = ${c} (${thing}).`
      : `"Ít hơn" thì làm phép trừ: ${a} - ${d} = ${c} (${thing}).`,
    hint: "Nhiều hơn → cộng, ít hơn → trừ.",
  };
};

/* ───── Bảng nhân, bảng chia 2 và 5 ───── */
export const bangNhanChia: Generator = (r) => {
  const k = pick(r, [2, 5]);
  const x = int(r, 1, 10);
  const p = k * x;
  const kind = pick(r, ["nhan", "nhanDao", "chia", "thieu"] as const);
  const base = { type: "fill_blank" as const, tags: [`bảng ${k}`, kind.startsWith("nhan") ? "phép nhân" : "phép chia"] };
  switch (kind) {
    case "nhan": return { ...base, difficulty: "easy", question: `${k} × ${x} = ___`, ...blanks(String(p)),
      explanation: `${k} × ${x} là ${k} được lấy ${x} lần. Theo bảng nhân ${k}: ${k} × ${x} = ${p}.`, hint: `Đọc thuộc bảng nhân ${k}.` };
    case "nhanDao": return { ...base, difficulty: "easy", question: `${x} × ${k} = ___`, ...blanks(String(p)),
      explanation: `Đổi chỗ các thừa số thì tích không đổi: ${x} × ${k} = ${k} × ${x} = ${p}.`, hint: `Đổi chỗ thành ${k} × ${x}.` };
    case "chia": return { ...base, difficulty: "medium", question: `${p} : ${k} = ___`, ...blanks(String(x)),
      explanation: `Vì ${k} × ${x} = ${p} nên ${p} : ${k} = ${x}.`, hint: `${k} nhân mấy thì bằng ${p}?` };
    case "thieu": return { ...base, difficulty: "medium", question: `${k} × ___ = ${p}`, ...blanks(String(x)),
      explanation: `Lấy ${p} : ${k} = ${x}.`, hint: `Đọc bảng nhân ${k} tìm kết quả ${p}.` };
  }
};

export const nhanChiaLoiVan: Generator = (r) => {
  const k = pick(r, [2, 5]);
  const x = int(r, 2, 10);
  const t = pick(r, THINGS);
  const thing = `${t.unit} ${t.name}`;
  if (chance(r, 0.5))
    return { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "phép nhân"],
      question: `Mỗi bạn có ${k} ${thing}. Hỏi ${x} bạn có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(k * x)),
      explanation: `${x} bạn, mỗi bạn ${k} ${thing}: ${k} × ${x} = ${k * x} (${thing}).`, hint: "Mỗi bạn có như nhau → dùng phép nhân." };
  return { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "phép chia"],
    question: `Có ${k * x} ${thing} chia đều cho ${k} bạn. Hỏi mỗi bạn được mấy ${thing}? Trả lời: ___ ${thing}.`,
    ...blanks(String(x)),
    explanation: `Chia đều → phép chia: ${k * x} : ${k} = ${x} (${thing}).`, hint: "Chia đều → dùng phép chia." };
};

/* ───── Số đến 1000 ───── */
export const tramChucDonVi: Generator = (r) => {
  const n = int(r, 101, 999);
  const [h, t, u] = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
  const kind = pick(r, ["tach", "ghep", "tong"] as const);
  if (kind === "tach") {
    // Quiz chỉ có 1 ô nhập → giấu 1 trong 3 hàng
    const hide = int(r, 0, 2);
    const parts = [`${h} trăm`, `${t} chục`, `${u} đơn vị`];
    parts[hide] = parts[hide].replace(/^\d+/, "___");
    return { type: "fill_blank", difficulty: "easy", tags: ["số đến 1000", "trăm chục đơn vị"],
      question: `Số ${n} gồm ${parts[0]}, ${parts[1]} và ${parts[2]}.`, ...blanks(String([h, t, u][hide])),
      explanation: `${n}: chữ số ${h} ở hàng trăm, ${t} ở hàng chục, ${u} ở hàng đơn vị.`, hint: "Đọc từ trái sang: trăm, chục, đơn vị." };
  }
  if (kind === "ghep")
    return { type: "fill_blank", difficulty: "easy", tags: ["số đến 1000", "viết số"],
      question: `Số gồm ${h} trăm, ${t} chục và ${u} đơn vị viết là ___.`, ...blanks(String(n)),
      explanation: `Viết lần lượt chữ số hàng trăm, chục, đơn vị: ${n}.`, hint: "Viết chữ số hàng trăm trước." };
  return { type: "fill_blank", difficulty: "medium", tags: ["số đến 1000", "viết số thành tổng"],
    question: `${h * 100} + ${t * 10} + ${u} = ___`, ...blanks(String(n)),
    explanation: `${h} trăm, ${t} chục, ${u} đơn vị là số ${n}.`, hint: "Ghép trăm, chục, đơn vị lại." };
};

/* ───── Đơn vị đo: m, dm, cm, km; kg; lít ───── */
export const donViDo2: Generator = (r) => {
  const conv = pick(r, [
    ["m", "dm", 10], ["dm", "cm", 10], ["m", "cm", 100], ["km", "m", 1000],
  ] as const);
  const x = int(r, 1, 9);
  if (chance(r, 0.6))
    return { type: "fill_blank", difficulty: "medium", tags: ["đổi đơn vị", "độ dài"],
      question: `${x} ${conv[0]} = ___ ${conv[1]}`, ...blanks(fmtInt(x * conv[2])),
      explanation: `1 ${conv[0]} = ${fmtInt(conv[2])} ${conv[1]} nên ${x} ${conv[0]} = ${fmtInt(x * conv[2])} ${conv[1]}.`,
      hint: `Nhớ: 1 ${conv[0]} = ${fmtInt(conv[2])} ${conv[1]}.` };
  const unit = pick(r, ["kg", "l"]);
  const a = int(r, 10, 60), b = int(r, 5, 35);
  const label = unit === "kg" ? "ki-lô-gam" : "lít";
  return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", unit === "kg" ? "ki-lô-gam" : "lít"],
    question: unit === "kg"
      ? `Bao gạo nặng ${a} kg, bao ngô nặng ${b} kg. Cả hai bao nặng ___ kg.`
      : `Can thứ nhất đựng ${a} l nước, can thứ hai đựng ${b} l nước. Cả hai can đựng ___ l nước.`,
    ...blanks(String(a + b)),
    explanation: `"Cả hai" → phép cộng: ${a} + ${b} = ${a + b} (${label}).`, hint: "Cộng hai số đo lại, nhớ ghi đơn vị." };
};

/* ───── Đường gấp khúc ───── */
export const duongGapKhuc: Generator = (r) => {
  const n = int(r, 2, 4);
  const segs = Array.from({ length: n }, () => int(r, 3, 25));
  const total = segs.reduce((s, x) => s + x, 0);
  return { type: "fill_blank", difficulty: "medium", tags: ["đường gấp khúc", "độ dài"],
    question: `Một đường gấp khúc gồm ${n} đoạn thẳng dài ${segs.map((s) => `${s} cm`).join(", ")}. Độ dài đường gấp khúc là ___ cm.`,
    ...blanks(String(total)),
    explanation: `Độ dài đường gấp khúc = tổng độ dài các đoạn: ${segs.join(" + ")} = ${total} (cm).`,
    hint: "Cộng độ dài tất cả các đoạn thẳng." };
};

/* ───── Tiền Việt Nam ───── */
export const tienVN: Generator = (r) => {
  const notes = [100, 200, 500, 1000];
  const parts = Array.from({ length: int(r, 2, 3) }, () => pick(r, notes));
  const counts = new Map<number, number>();
  parts.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1));
  const desc = [...counts].map(([v, c]) => `${c} tờ ${fmtInt(v)} đồng`).join(" và ");
  const total = parts.reduce((s, x) => s + x, 0);
  return { type: "fill_blank", difficulty: "medium", tags: ["tiền Việt Nam"],
    question: `Mẹ có ${desc}. Mẹ có tất cả ___ đồng.`, ...blanks(fmtInt(total)),
    explanation: `${[...counts].map(([v, c]) => `${c} × ${fmtInt(v)} = ${fmtInt(c * v)}`).join("; ")}. Tổng: ${fmtInt(total)} đồng.`,
    hint: "Cộng giá trị từng tờ tiền lại." };
};

/* ───── Ngày tháng: cộng thêm tuần ───── */
export const ngayThang: Generator = (r) => {
  const d = int(r, 0, 6);
  const day = int(r, 1, 14);
  const weeks = int(r, 1, 2);
  const { options, answer } = mcOptions(r, cap(DAYS[d]), DAYS.map(cap));
  return { type: "multiple_choice", difficulty: "hard", tags: ["ngày tháng", "lịch"],
    question: `Ngày ${day} tháng này là ${DAYS[d]}. Hỏi ngày ${day + 7 * weeks} tháng này là thứ mấy?`, options, answer,
    explanation: `Từ ngày ${day} đến ngày ${day + 7 * weeks} là ${7 * weeks} ngày, đúng ${weeks} tuần, nên vẫn là ${DAYS[d]}.`,
    hint: "Một tuần có 7 ngày." };
};

/* ───── Đúng / sai ───── */
export const dungSai2: Generator = (r) => {
  const k = pick(r, [2, 5]), x = int(r, 1, 10);
  const ok = chance(r, 0.5);
  const shown = ok ? k * x : k * x + pick(r, [-k, k, 1]);
  return { type: "true_false", difficulty: "easy", tags: ["đúng sai", `bảng ${k}`],
    question: `${k} × ${x} = ${shown}. Đúng hay sai?`, answer: ok,
    explanation: ok ? `Đúng, ${k} × ${x} = ${k * x}.` : `Sai, ${k} × ${x} = ${k * x}.`, hint: `Đọc lại bảng nhân ${k}.` };
};

export const LOP2 = {
  congTru20, congTru100, congTru1000, thanhPhanPhepTinh, nhieuHonItHon, bangNhanChia, nhanChiaLoiVan,
  tramChucDonVi, donViDo2, duongGapKhuc, tienVN, ngayThang, dungSai2, ngayTrongTuan,
  soSanh1000: soSanhSo(100, 999), sapXep1000: sapXepSo(100, 999),
  xemGio: xemDongHo([0, 15, 30]),
};
