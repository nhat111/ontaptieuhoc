// lib/mathGen/lop4.ts — Toán lớp 4 (Chương trình GDPT 2018)
// Số có nhiều chữ số (đến lớp triệu), bốn phép tính, trung bình cộng, tổng – hiệu,
// phân số, đơn vị đo (khối lượng, diện tích, thời gian). Chỉ số nguyên và phân số,
// nên không cần kiểu Dec.

import {
  type Generator, type Rng, int, pick, chance, shuffle, retry, gcd,
  fmtInt, sign, mcOptions, fixedOptions, blanks,
} from "./core";

/* ═════ Số có nhiều chữ số ═════ */

const HANG = [
  "hàng đơn vị", "hàng chục", "hàng trăm",
  "hàng nghìn", "hàng chục nghìn", "hàng trăm nghìn",
  "hàng triệu", "hàng chục triệu", "hàng trăm triệu",
];
const LOP = ["lớp đơn vị", "lớp nghìn", "lớp triệu"];

/** Số có `len` chữ số, các chữ số đôi một khác nhau (để hỏi "chữ số d" không mơ hồ). */
function distinctDigits(r: Rng, len: number): number[] {
  const d = shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, len);
  if (d[0] === 0) [d[0], d[1]] = [d[1], d[0]];
  return d;
}
const fromDigits = (d: number[]) => d.reduce((n, x) => n * 10 + x, 0);

export const hangLop: Generator = (r) => {
  const len = int(r, 6, 9);
  const digits = distinctDigits(r, len);
  const n = fromDigits(digits);
  const pos = retry(() => { const p = int(r, 0, len - 1); return digits[len - 1 - p] !== 0 ? p : null; });
  const d = digits[len - 1 - pos];
  if (chance(r, 0.3)) {
    const { options, answer } = fixedOptions(LOP, LOP[Math.floor(pos / 3)]);
    return {
      type: "multiple_choice", difficulty: "easy", tags: ["hàng và lớp"],
      question: `Trong số ${fmtInt(n)}, chữ số ${d} thuộc lớp nào?`, options, answer,
      explanation: `Chữ số ${d} ở ${HANG[pos]}, thuộc ${LOP[Math.floor(pos / 3)]}. Lớp đơn vị gồm hàng đơn vị, chục, trăm; lớp nghìn gồm hàng nghìn, chục nghìn, trăm nghìn; lớp triệu gồm hàng triệu, chục triệu, trăm triệu.`,
      hint: "Tách số thành từng nhóm 3 chữ số từ phải sang trái.",
    };
  }
  const near = [pos - 1, pos + 1, pos - 2, pos + 2, pos + 3, pos - 3].filter((p) => p >= 0 && p < HANG.length).map((p) => HANG[p]);
  const { options, answer } = mcOptions(r, HANG[pos], near);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["hàng và lớp"],
    question: `Trong số ${fmtInt(n)}, chữ số ${d} thuộc hàng nào?`, options, answer,
    explanation: `Đếm từ phải sang trái: đơn vị, chục, trăm, nghìn, chục nghìn, trăm nghìn, triệu, chục triệu, trăm triệu. Chữ số ${d} ở ${HANG[pos]}.`,
    hint: "Đếm các hàng từ phải sang trái, bắt đầu từ hàng đơn vị.",
  };
};

export const giaTriChuSo: Generator = (r) => {
  const len = int(r, 5, 8);
  const digits = distinctDigits(r, len);
  const n = fromDigits(digits);
  const pos = retry(() => { const p = int(r, 1, len - 1); return digits[len - 1 - p] !== 0 ? p : null; });
  const d = digits[len - 1 - pos];
  const v = d * 10 ** pos;
  return {
    type: "fill_blank", difficulty: "medium", tags: ["giá trị chữ số"],
    question: `Giá trị của chữ số ${d} trong số ${fmtInt(n)} là ___`, ...blanks(fmtInt(v)),
    explanation: `Chữ số ${d} ở ${HANG[pos]} nên có giá trị là ${fmtInt(v)}.`,
    hint: "Xem chữ số đó đứng ở hàng nào.",
  };
};

/** Hai số cùng số chữ số, giống nhau ở các hàng cao → phải so sánh từng hàng. */
export const soSanhSoLon: Generator = (r) => {
  const len = int(r, 6, 9);
  const a = int(r, 10 ** (len - 1), 10 ** len - 1);
  let b = a;
  if (!chance(r, 0.1)) {
    const s = String(a).split("").map(Number);
    const i = int(r, 1, len - 1);
    s[i] = pick(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== s[i]));
    b = fromDigits(s);
  }
  const s = sign(a - b);
  const { options, answer } = fixedOptions([">", "<", "="], s);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["so sánh số"],
    question: `Chọn dấu thích hợp: ${fmtInt(a)} ___ ${fmtInt(b)}`, options, answer,
    explanation: s === "="
      ? `Hai số có các chữ số ở mọi hàng giống nhau nên ${fmtInt(a)} = ${fmtInt(b)}.`
      : `Hai số có cùng ${len} chữ số. So sánh từng hàng từ trái sang phải, gặp hàng đầu tiên khác nhau thì số nào có chữ số lớn hơn là số lớn hơn: ${fmtInt(a)} ${s} ${fmtInt(b)}.`,
    hint: "Cùng số chữ số thì so sánh từ hàng cao nhất.",
  };
};

export const sapXepSoLon: Generator = (r) => {
  const len = int(r, 6, 8);
  const head = int(r, 10 ** (len - 4), 10 ** (len - 3) - 1); // các số chung 3 chữ số đầu
  const set = new Set<number>();
  while (set.size < 4) set.add(head * 1000 + int(r, 0, 999));
  const nums = [...set];
  const asc = chance(r, 0.5);
  const sorted = [...nums].sort((x, y) => (asc ? x - y : y - x));
  const items = nums.map((n, i) => ({ id: `n${i}`, content: fmtInt(n) }));
  let shown = shuffle(r, items);
  while (shown.map((i) => i.content).join() === sorted.map(fmtInt).join()) shown = shuffle(r, items);
  return {
    type: "ordering", difficulty: "medium", tags: ["sắp xếp số"],
    question: `Sắp xếp các số theo thứ tự từ ${asc ? "bé đến lớn" : "lớn đến bé"}.`,
    items: shown,
    correctOrder: sorted.map((n) => items.find((i) => i.content === fmtInt(n))!.id),
    explanation: `Các số có chung các chữ số ở hàng cao, nên so sánh từ hàng trăm trở xuống. Thứ tự đúng: ${sorted.map(fmtInt).join(asc ? " < " : " > ")}.`,
    hint: "So sánh từng hàng từ trái sang phải.",
  };
};

const ROUND_TO = [
  { name: "hàng nghìn", p: 3 },
  { name: "hàng chục nghìn", p: 4 },
  { name: "hàng trăm nghìn", p: 5 },
] as const;

const roundTo = (n: number, p: number) => Math.round(n / 10 ** p) * 10 ** p;

export const lamTron: Generator = (r) => {
  const { name, p } = pick(r, ROUND_TO);
  const n = retry(() => {
    const x = int(r, 10 ** (p + 1), 10 ** (p + 3) - 1);
    return x % 10 ** p !== 0 ? x : null; // đã tròn sẵn thì không có gì để làm
  });
  const correct = roundTo(n, p);
  const down = Math.floor(n / 10 ** p) * 10 ** p;
  const up = down + 10 ** p;
  const nextDigit = Math.floor(n / 10 ** (p - 1)) % 10;
  const cands = [down, up, roundTo(n, p - 1), roundTo(n, p + 1), down - 10 ** p, up + 10 ** p]
    .filter((x) => x > 0).map(fmtInt);
  const { options, answer } = mcOptions(r, fmtInt(correct), cands);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["làm tròn số"],
    question: `Làm tròn số ${fmtInt(n)} đến ${name} thì được số nào?`, options, answer,
    explanation: `Xét chữ số ngay bên phải ${name} là ${nextDigit}. ${nextDigit >= 5 ? `Vì ${nextDigit} ≥ 5 nên làm tròn lên` : `Vì ${nextDigit} < 5 nên làm tròn xuống`}: ${fmtInt(n)} ≈ ${fmtInt(correct)}.`,
    hint: "Nhìn chữ số ngay bên phải hàng cần làm tròn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.",
  };
};

/* ═════ Cộng, trừ ═════ */

export const congTruSoLon: Generator = (r) => {
  const plus = chance(r, 0.5);
  const a = int(r, 10000, 899999);
  const b = int(r, 1000, plus ? 99999 : a - 1);
  const c = plus ? a + b : a - b;
  const op = plus ? "+" : "-";
  return {
    type: "fill_blank", difficulty: "medium", tags: [plus ? "phép cộng" : "phép trừ"],
    question: `${fmtInt(a)} ${op} ${fmtInt(b)} = ___`, ...blanks(fmtInt(c)),
    explanation: `Đặt tính thẳng hàng rồi ${plus ? "cộng" : "trừ"} từ phải sang trái (nhớ sang hàng bên trái nếu có): ${fmtInt(a)} ${op} ${fmtInt(b)} = ${fmtInt(c)}.`,
    hint: "Viết các chữ số cùng hàng thẳng cột với nhau.",
  };
};

export const timThanhPhan4: Generator = (r) => {
  const a = int(r, 1000, 99999);
  const b = int(r, 1000, 99999);
  const kind = pick(r, ["soHangDau", "soHangSau", "soBiTru", "soTru"] as const);
  const s = a + b;
  switch (kind) {
    case "soHangDau": return { type: "fill_blank", difficulty: "medium", tags: ["tìm thành phần"],
      question: `___ + ${fmtInt(b)} = ${fmtInt(s)}`, ...blanks(fmtInt(a)),
      explanation: `Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: ${fmtInt(s)} - ${fmtInt(b)} = ${fmtInt(a)}.`,
      hint: "Lấy tổng trừ đi số hạng kia." };
    case "soHangSau": return { type: "fill_blank", difficulty: "medium", tags: ["tìm thành phần"],
      question: `${fmtInt(a)} + ___ = ${fmtInt(s)}`, ...blanks(fmtInt(b)),
      explanation: `Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: ${fmtInt(s)} - ${fmtInt(a)} = ${fmtInt(b)}.`,
      hint: "Lấy tổng trừ đi số hạng kia." };
    case "soBiTru": return { type: "fill_blank", difficulty: "medium", tags: ["tìm thành phần"],
      question: `___ - ${fmtInt(b)} = ${fmtInt(a)}`, ...blanks(fmtInt(s)),
      explanation: `Muốn tìm số bị trừ, lấy hiệu cộng với số trừ: ${fmtInt(a)} + ${fmtInt(b)} = ${fmtInt(s)}.`,
      hint: "Lấy hiệu cộng với số trừ." };
    case "soTru": return { type: "fill_blank", difficulty: "hard", tags: ["tìm thành phần"],
      question: `${fmtInt(s)} - ___ = ${fmtInt(a)}`, ...blanks(fmtInt(b)),
      explanation: `Muốn tìm số trừ, lấy số bị trừ trừ đi hiệu: ${fmtInt(s)} - ${fmtInt(a)} = ${fmtInt(b)}.`,
      hint: "Lấy số bị trừ trừ đi hiệu." };
  }
};

/** Tính thuận tiện: a + b + c với a + c tròn trăm/nghìn. */
export const tinhThuanTien: Generator = (r) => {
  const round = pick(r, [100, 1000]);
  const a = retry(() => { const x = int(r, 11, 999) * 10; return x % round !== 0 ? x : null; });
  const c = (Math.ceil(a / round) + int(r, 0, 1)) * round - a;
  const b = int(r, 100, 9999);
  const sum = a + b + c;
  return {
    type: "fill_blank", difficulty: "medium", tags: ["tính thuận tiện", "tính chất phép cộng"],
    question: `Tính bằng cách thuận tiện: ${fmtInt(a)} + ${fmtInt(b)} + ${fmtInt(c)} = ___`, ...blanks(fmtInt(sum)),
    explanation: `Đổi chỗ và nhóm hai số có tổng tròn: (${fmtInt(a)} + ${fmtInt(c)}) + ${fmtInt(b)} = ${fmtInt(a + c)} + ${fmtInt(b)} = ${fmtInt(sum)}.`,
    hint: "Tìm hai số cộng lại được số tròn trăm, tròn nghìn.",
  };
};

export const loiVanCongTru4: Generator = (r) => {
  const a = int(r, 120, 950) * 10;
  const more = int(r, 15, 90) * 10;
  const [item, place] = pick(r, [
    ["sản phẩm", "Một xưởng may"], ["quyển sách", "Một thư viện"], ["cây giống", "Một vườn ươm"], ["kg gạo", "Một cửa hàng"],
  ] as const);
  const verb = item === "kg gạo" ? "bán được" : item === "quyển sách" ? "cho mượn" : "làm được";
  const less = chance(r, 0.4);
  const second = less ? a - more : a + more;
  const total = a + second;
  return {
    type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "hai bước"],
    question: `${place} tháng thứ nhất ${verb} ${fmtInt(a)} ${item}, tháng thứ hai ${verb} ${less ? "ít" : "nhiều"} hơn tháng thứ nhất ${fmtInt(more)} ${item}. Hỏi cả hai tháng ${verb} bao nhiêu ${item}? Trả lời: ___ ${item}.`,
    ...blanks(fmtInt(total)),
    explanation: `Tháng thứ hai: ${fmtInt(a)} ${less ? "-" : "+"} ${fmtInt(more)} = ${fmtInt(second)} (${item}). Cả hai tháng: ${fmtInt(a)} + ${fmtInt(second)} = ${fmtInt(total)} (${item}).`,
    hint: "Tìm số của tháng thứ hai trước, rồi cộng cả hai tháng.",
  };
};

/* ═════ Nhân, chia ═════ */

export const nhanSoLon: Generator = (r) => {
  if (chance(r, 0.5)) {
    const a = int(r, 1000, 99999), k = int(r, 2, 9);
    return { type: "fill_blank", difficulty: "medium", tags: ["phép nhân"],
      question: `${fmtInt(a)} × ${k} = ___`, ...blanks(fmtInt(a * k)),
      explanation: `Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: ${fmtInt(a)} × ${k} = ${fmtInt(a * k)}.`,
      hint: "Đặt tính rồi nhân từ hàng đơn vị." };
  }
  const a = int(r, 100, 999), b = int(r, 11, 99);
  const p1 = a * (b % 10), p2 = a * Math.floor(b / 10);
  return { type: "fill_blank", difficulty: "hard", tags: ["phép nhân", "nhân với số có hai chữ số"],
    question: `${a} × ${b} = ___`, ...blanks(fmtInt(a * b)),
    explanation: `${a} × ${b % 10} = ${fmtInt(p1)} (tích riêng thứ nhất); ${a} × ${Math.floor(b / 10)} = ${fmtInt(p2)} (tích riêng thứ hai, viết lùi sang trái một cột). Cộng lại: ${fmtInt(p1)} + ${fmtInt(p2 * 10)} = ${fmtInt(a * b)}.`,
    hint: "Tích riêng thứ hai viết lùi sang bên trái một cột." };
};

export const chiaSoLon: Generator = (r) => {
  const kind = pick(r, ["mot", "hai", "du"] as const);
  if (kind === "du") {
    const k = int(r, 3, 9), q = int(r, 100, 9999), rem = int(r, 1, k - 1);
    const a = k * q + rem;
    return { type: "fill_blank", difficulty: "hard", tags: ["phép chia", "chia có dư"],
      question: `${fmtInt(a)} : ${k} = ${fmtInt(q)} (dư ___)`, ...blanks(String(rem)),
      explanation: `${fmtInt(q)} × ${k} = ${fmtInt(k * q)}; ${fmtInt(a)} - ${fmtInt(k * q)} = ${rem}. Số dư ${rem} bé hơn số chia ${k}.`,
      hint: "Số dư = số bị chia - thương × số chia." };
  }
  const k = kind === "mot" ? int(r, 2, 9) : int(r, 12, 99);
  const q = kind === "mot" ? int(r, 1000, 99999) : int(r, 12, 999);
  const a = k * q;
  return { type: "fill_blank", difficulty: kind === "mot" ? "medium" : "hard",
    tags: ["phép chia", kind === "mot" ? "chia cho số có một chữ số" : "chia cho số có hai chữ số"],
    question: `${fmtInt(a)} : ${k} = ___`, ...blanks(fmtInt(q)),
    explanation: `Chia lần lượt từ trái sang phải. Thử lại: ${fmtInt(q)} × ${k} = ${fmtInt(a)}, nên ${fmtInt(a)} : ${k} = ${fmtInt(q)}.`,
    hint: kind === "mot" ? "Lấy từng chữ số (hoặc nhóm chữ số) từ trái sang chia." : "Ước lượng thương bằng cách làm tròn số chia." };
};

export const nhanChia10: Generator = (r) => {
  const m = pick(r, [10, 100, 1000]);
  const zeros = String(m).length - 1;
  if (chance(r, 0.5)) {
    const a = int(r, 2, 999);
    return { type: "fill_blank", difficulty: "easy", tags: ["nhân với 10, 100, 1000"],
      question: `${a} × ${fmtInt(m)} = ___`, ...blanks(fmtInt(a * m)),
      explanation: `Nhân với ${fmtInt(m)} chỉ cần viết thêm ${zeros} chữ số 0 vào bên phải: ${a} × ${fmtInt(m)} = ${fmtInt(a * m)}.`,
      hint: `Viết thêm ${zeros} chữ số 0.` };
  }
  const q = int(r, 2, 999);
  return { type: "fill_blank", difficulty: "easy", tags: ["chia cho 10, 100, 1000"],
    question: `${fmtInt(q * m)} : ${fmtInt(m)} = ___`, ...blanks(fmtInt(q)),
    explanation: `Chia số tròn chục, tròn trăm, tròn nghìn cho ${fmtInt(m)} chỉ cần bỏ bớt ${zeros} chữ số 0 ở bên phải: ${fmtInt(q * m)} : ${fmtInt(m)} = ${fmtInt(q)}.`,
    hint: `Bỏ bớt ${zeros} chữ số 0.` };
};

export const loiVanNhanChia4: Generator = (r) => {
  const [unit, box] = pick(r, [["hộp sữa", "thùng"], ["quyển vở", "chồng"], ["viên gạch", "xe"], ["chai nước", "két"]] as const);
  const k = int(r, 12, 48);
  const n = int(r, 15, 250);
  if (chance(r, 0.5))
    return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", "phép nhân"],
      question: `Mỗi ${box} có ${k} ${unit}. Hỏi ${n} ${box} như thế có tất cả bao nhiêu ${unit}? Trả lời: ___ ${unit}.`,
      ...blanks(fmtInt(k * n)),
      explanation: `${n} ${box}, mỗi ${box} ${k} ${unit}: ${k} × ${n} = ${fmtInt(k * n)} (${unit}).`,
      hint: "Mỗi phần bằng nhau → dùng phép nhân." };
  return { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "phép chia"],
    question: `Người ta xếp ${fmtInt(k * n)} ${unit} vào các ${box}, mỗi ${box} ${k} ${unit}. Hỏi xếp được bao nhiêu ${box}? Trả lời: ___ ${box}.`,
    ...blanks(fmtInt(n)),
    explanation: `Mỗi ${box} ${k} ${unit} → phép chia: ${fmtInt(k * n)} : ${k} = ${n} (${box}).`,
    hint: `Tìm xem ${fmtInt(k * n)} gồm bao nhiêu lần ${k}.` };
};

/* ═════ Trung bình cộng, tổng – hiệu ═════ */

export const trungBinhCong: Generator = (r) => {
  const n = pick(r, [2, 3, 3, 4]);
  const avg = int(r, 20, 400);
  // n số có trung bình đúng bằng avg: lệch quanh avg, tổng các độ lệch = 0
  const xs = retry(() => {
    const d = Array.from({ length: n - 1 }, () => int(r, -avg + 1, avg - 1));
    const last = -d.reduce((s, x) => s + x, 0);
    const all = [...d, last].map((x) => avg + x);
    return all.every((x) => x > 0) && new Set(all).size === n ? all : null;
  });
  const sum = xs.reduce((s, x) => s + x, 0);
  const list = n === 2 ? `${fmtInt(xs[0])} và ${fmtInt(xs[1])}` : `${xs.slice(0, -1).map(fmtInt).join("; ")} và ${fmtInt(xs[n - 1])}`;
  const kind = pick(r, ["so", "loiVan", "nguoc"] as const);
  if (kind === "nguoc" && n === 2)
    return { type: "fill_blank", difficulty: "hard", tags: ["trung bình cộng"],
      question: `Trung bình cộng của hai số là ${fmtInt(avg)}. Một số là ${fmtInt(xs[0])}. Số kia là ___`,
      ...blanks(fmtInt(xs[1])),
      explanation: `Tổng hai số: ${fmtInt(avg)} × 2 = ${fmtInt(sum)}. Số kia: ${fmtInt(sum)} - ${fmtInt(xs[0])} = ${fmtInt(xs[1])}.`,
      hint: "Tìm tổng hai số trước: trung bình cộng × 2." };
  if (kind === "loiVan" && n === 3)
    return { type: "fill_blank", difficulty: "medium", tags: ["trung bình cộng", "toán có lời văn"],
      question: `Một cửa hàng ba ngày bán được lần lượt ${fmtInt(xs[0])} kg, ${fmtInt(xs[1])} kg và ${fmtInt(xs[2])} kg gạo. Hỏi trung bình mỗi ngày cửa hàng bán được bao nhiêu ki-lô-gam gạo? Trả lời: ___ kg.`,
      ...blanks(fmtInt(avg)),
      explanation: `Tổng ba ngày: ${xs.map(fmtInt).join(" + ")} = ${fmtInt(sum)} (kg). Trung bình mỗi ngày: ${fmtInt(sum)} : 3 = ${fmtInt(avg)} (kg).`,
      hint: "Cộng cả ba ngày rồi chia cho 3." };
  return { type: "fill_blank", difficulty: "medium", tags: ["trung bình cộng"],
    question: `Số trung bình cộng của ${list} là ___`, ...blanks(fmtInt(avg)),
    explanation: `Tổng các số: ${xs.map(fmtInt).join(" + ")} = ${fmtInt(sum)}. Có ${n} số nên trung bình cộng là ${fmtInt(sum)} : ${n} = ${fmtInt(avg)}.`,
    hint: "Muốn tìm trung bình cộng, lấy tổng các số chia cho số các số hạng." };
};

export const tongHieu: Generator = (r) => {
  const small = int(r, 10, 900);
  const diff = int(r, 2, 400);
  const big = small + diff;
  const sum = small + big;
  const askBig = chance(r, 0.5);
  const how = askBig
    ? `Số lớn = (tổng + hiệu) : 2 = (${fmtInt(sum)} + ${fmtInt(diff)}) : 2 = ${fmtInt(big)}.`
    : `Số bé = (tổng - hiệu) : 2 = (${fmtInt(sum)} - ${fmtInt(diff)}) : 2 = ${fmtInt(small)}.`;
  const ans = fmtInt(askBig ? big : small);
  const kind = pick(r, ["so", "cay", "tuoi"] as const);
  if (kind === "tuoi") {
    const con = int(r, 4, 15), hon = int(r, 22, 35);
    const tong = con * 2 + hon;
    const askMe = chance(r, 0.5);
    return { type: "fill_blank", difficulty: "hard", tags: ["tổng và hiệu", "toán có lời văn"],
      question: `Tổng số tuổi của mẹ và con là ${tong} tuổi. Mẹ hơn con ${hon} tuổi. Hỏi ${askMe ? "mẹ" : "con"} bao nhiêu tuổi? Trả lời: ___ tuổi.`,
      ...blanks(String(askMe ? con + hon : con)),
      explanation: askMe
        ? `Tuổi mẹ (số lớn) = (${tong} + ${hon}) : 2 = ${con + hon} (tuổi).`
        : `Tuổi con (số bé) = (${tong} - ${hon}) : 2 = ${con} (tuổi).`,
      hint: "Số lớn = (tổng + hiệu) : 2; số bé = (tổng - hiệu) : 2." };
  }
  if (kind === "cay") {
    const [a, b] = shuffle(r, ["4A", "4B", "4C"]).slice(0, 2).sort();
    return { type: "fill_blank", difficulty: "hard", tags: ["tổng và hiệu", "toán có lời văn"],
      question: `Hai lớp ${a} và ${b} trồng được ${fmtInt(sum)} cây. Lớp ${a} trồng được nhiều hơn lớp ${b} ${fmtInt(diff)} cây. Hỏi lớp ${askBig ? a : b} trồng được bao nhiêu cây? Trả lời: ___ cây.`,
      ...blanks(ans),
      explanation: `Lớp ${askBig ? a : b} trồng được ${askBig ? "nhiều hơn (số lớn)" : "ít hơn (số bé)"}. ${how}`,
      hint: "Số lớn = (tổng + hiệu) : 2; số bé = (tổng - hiệu) : 2." };
  }
  return { type: "fill_blank", difficulty: "medium", tags: ["tổng và hiệu"],
    question: `Tổng của hai số là ${fmtInt(sum)}, hiệu của hai số là ${fmtInt(diff)}. Số ${askBig ? "lớn" : "bé"} là ___`,
    ...blanks(ans),
    explanation: how,
    hint: "Số lớn = (tổng + hiệu) : 2; số bé = (tổng - hiệu) : 2." };
};

/* ═════ Phân số ═════ */

type Frac = { n: number; d: number };
const simp = ({ n, d }: Frac): Frac => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const fs = ({ n, d }: Frac) => (d === 1 ? String(n) : `${n}/${d}`);
const fval = ({ n, d }: Frac) => n / d;

/** Phân số tối giản ngẫu nhiên, mẫu trong [2, maxD], bé hơn 1 nếu `proper`. */
function randFrac(r: Rng, maxD: number, proper = true): Frac {
  return retry(() => {
    const d = int(r, 2, maxD);
    const n = int(r, 1, proper ? d - 1 : d * 2);
    return gcd(n, d) === 1 && n !== d ? { n, d } : null;
  });
}

/** Đáp án nhiễu cho phân số: khác giá trị với đáp án đúng và khác nhau đôi một. */
function fracOptions(r: Rng, correct: Frac, cands: Frac[]) {
  const seen = new Set([fval(correct)]);
  const wrong: string[] = [];
  for (const c of cands) {
    if (c.n <= 0 || c.d <= 0) continue;
    const s = simp(c);
    if (seen.has(fval(s))) continue;
    seen.add(fval(s));
    wrong.push(fs(s));
  }
  return mcOptions(r, fs(correct), wrong);
}

export const rutGonPhanSo: Generator = (r) => {
  const base = randFrac(r, 9);
  const k = int(r, 2, 9);
  const big = { n: base.n * k, d: base.d * k };
  return {
    type: "fill_blank", difficulty: "medium", tags: ["rút gọn phân số"],
    question: `Rút gọn phân số ${big.n}/${big.d} thành phân số tối giản: ${big.n}/${big.d} = ___`,
    answers: [fs(base)], acceptedAnswers: [[fs(base), `${base.n} / ${base.d}`]],
    explanation: `Chia cả tử số và mẫu số cho ${k}: ${big.n} : ${k} = ${base.n}; ${big.d} : ${k} = ${base.d}. Phân số ${fs(base)} không rút gọn được nữa.`,
    hint: "Tìm số lớn nhất mà cả tử số và mẫu số đều chia hết.",
  };
};

export const phanSoBangNhau: Generator = (r) => {
  const base = randFrac(r, 9);
  const k = int(r, 2, 6);
  const correct = { n: base.n * k, d: base.d * k };
  const wrongs = [
    { n: base.n * k, d: base.d * (k + 1) }, { n: base.n + k, d: base.d + k },
    { n: base.n * k, d: base.d + k }, { n: base.n * (k + 1), d: base.d * k }, { n: base.d * k, d: base.n * k },
  ].filter((f) => f.n !== f.d && f.n * base.d !== f.d * base.n);
  // So sánh theo chuỗi (không rút gọn): đề hỏi "phân số nào", cả 4 đều chưa rút gọn
  const pool = [...new Set(wrongs.map((f) => `${f.n}/${f.d}`))];
  const { options, answer } = mcOptions(r, `${correct.n}/${correct.d}`, pool);
  return {
    type: "multiple_choice", difficulty: "medium", tags: ["phân số bằng nhau"],
    question: `Phân số nào bằng phân số ${fs(base)}?`, options, answer,
    explanation: `Nhân cả tử số và mẫu số của ${fs(base)} với ${k}: ${base.n} × ${k} = ${correct.n}; ${base.d} × ${k} = ${correct.d}. Vậy ${fs(base)} = ${correct.n}/${correct.d}.`,
    hint: "Nhân (hoặc chia) cả tử số và mẫu số với cùng một số khác 0.",
  };
};

export const soSanhPhanSo: Generator = (r) => {
  const [a, b] = retry(() => {
    const kind = pick(r, ["cungMau", "cungTu", "khacMau"] as const);
    if (kind === "cungMau") {
      const d = int(r, 3, 12), x = int(r, 1, d - 1), y = int(r, 1, d - 1);
      return x !== y ? [{ n: x, d }, { n: y, d }] : null;
    }
    if (kind === "cungTu") {
      const n = int(r, 1, 9), x = int(r, n + 1, 15), y = int(r, n + 1, 15);
      return x !== y ? [{ n, d: x }, { n, d: y }] : null;
    }
    const d1 = int(r, 2, 6), m = int(r, 2, 4);
    const f1 = { n: int(r, 1, d1 - 1), d: d1 }, f2 = { n: int(r, 1, d1 * m - 1), d: d1 * m };
    return f1.n * f2.d !== f2.n * f1.d ? (chance(r, 0.5) ? [f1, f2] : [f2, f1]) : null;
  });
  const s = sign(a.n * b.d - b.n * a.d);
  const { options, answer } = fixedOptions([">", "<", "="], s);
  const why = a.d === b.d
    ? `Hai phân số cùng mẫu số: phân số nào có tử số lớn hơn thì lớn hơn.`
    : a.n === b.n
      ? `Hai phân số cùng tử số: phân số nào có mẫu số bé hơn thì lớn hơn.`
      : `Quy đồng mẫu số: ${fs(a)} = ${a.n * b.d}/${a.d * b.d}; ${fs(b)} = ${b.n * a.d}/${a.d * b.d}.`;
  return {
    type: "multiple_choice", difficulty: a.d === b.d ? "easy" : "medium", tags: ["so sánh phân số"],
    question: `Chọn dấu thích hợp: ${fs(a)} ___ ${fs(b)}`, options, answer,
    explanation: `${why} Vậy ${fs(a)} ${s} ${fs(b)}.`,
    hint: "Cùng mẫu thì so tử; cùng tử thì so mẫu; khác mẫu thì quy đồng.",
  };
};

/** Cộng / trừ phân số: cùng mẫu, hoặc mẫu này chia hết cho mẫu kia (như SGK lớp 4). */
export const congTruPhanSo: Generator = (r) => {
  const [a, b, plus] = retry(() => {
    const d1 = int(r, 2, 9);
    const d2 = chance(r, 0.4) ? d1 : d1 * int(r, 2, 3);
    const a = { n: int(r, 1, d1 - 1), d: d1 }, b = { n: int(r, 1, d2 - 1), d: d2 };
    if (gcd(a.n, a.d) !== 1 || gcd(b.n, b.d) !== 1) return null; // đề bài cho phân số tối giản
    const plus = chance(r, 0.5);
    const [x, y] = chance(r, 0.5) ? [a, b] : [b, a];
    if (!plus && x.n * y.d <= y.n * x.d) return null;
    return [x, y, plus] as const;
  });
  const D = Math.max(a.d, b.d);
  const an = a.n * (D / a.d), bn = b.n * (D / b.d);
  const raw = { n: plus ? an + bn : an - bn, d: D };
  const res = simp(raw);
  const op = plus ? "+" : "-";
  const { options, answer } = fracOptions(r, res, [
    { n: plus ? a.n + b.n : Math.abs(a.n - b.n), d: plus ? a.d + b.d : Math.abs(a.d - b.d) || D }, // cộng tử với tử, mẫu với mẫu
    { n: plus ? a.n + b.n : Math.abs(a.n - b.n), d: D },  // quên quy đồng tử số
    { n: raw.n + 1, d: D }, { n: Math.max(1, raw.n - 1), d: D }, { n: plus ? an - bn : an + bn, d: D },
    { n: raw.n, d: D * 2 },
    // phòng khi các nhiễu trên trùng giá trị nhau (VD kết quả bằng 1)
    { n: res.n + 1, d: res.d }, { n: res.n, d: res.d + 1 }, { n: res.n * 2 + 1, d: res.d * 2 }, { n: res.n + 2, d: res.d + 1 },
  ]);
  const steps = a.d === b.d ? "" : `Quy đồng mẫu số: ${fs(a)} ${op} ${fs(b)} = ${an}/${D} ${op} ${bn}/${D}. `;
  return {
    type: "multiple_choice", difficulty: a.d === b.d ? "easy" : "medium", tags: [plus ? "cộng phân số" : "trừ phân số"],
    question: `${fs(a)} ${op} ${fs(b)} = ? (viết kết quả ở dạng tối giản)`, options, answer,
    explanation: `${steps}${plus ? "Cộng" : "Trừ"} hai tử số, giữ nguyên mẫu số: ${raw.n}/${raw.d}${raw.n !== res.n || raw.d !== res.d ? `, rút gọn được ${fs(res)}` : ""}.`,
    hint: "Muốn cộng, trừ phân số khác mẫu số, quy đồng mẫu số trước.",
  };
};

export const nhanChiaPhanSo: Generator = (r) => {
  const a = randFrac(r, 9), b = randFrac(r, 9);
  const mulOp = chance(r, 0.5);
  const raw = mulOp ? { n: a.n * b.n, d: a.d * b.d } : { n: a.n * b.d, d: a.d * b.n };
  const res = simp(raw);
  const op = mulOp ? "×" : ":";
  const { options, answer } = fracOptions(r, res, mulOp
    ? [{ n: a.n * b.d, d: a.d * b.n }, { n: a.n + b.n, d: a.d + b.d }, { n: a.n * b.n, d: a.d }, { n: a.d * b.d, d: a.n * b.n }, { n: res.n + 1, d: res.d }]
    : [{ n: a.n * b.n, d: a.d * b.d }, { n: a.d * b.n, d: a.n * b.d }, { n: a.n, d: a.d * b.n }, { n: res.n + 1, d: res.d }, { n: res.n, d: res.d + 1 }]);
  return {
    type: "multiple_choice", difficulty: mulOp ? "medium" : "hard", tags: [mulOp ? "nhân phân số" : "chia phân số"],
    question: `${fs(a)} ${op} ${fs(b)} = ? (viết kết quả ở dạng tối giản)`, options, answer,
    explanation: mulOp
      ? `Nhân tử số với tử số, mẫu số với mẫu số: ${a.n} × ${b.n} = ${raw.n}; ${a.d} × ${b.d} = ${raw.d}. Được ${raw.n}/${raw.d}${raw.n !== res.n || raw.d !== res.d ? `, rút gọn thành ${fs(res)}` : ""}.`
      : `Chia cho một phân số là nhân với phân số đảo ngược: ${fs(a)} × ${b.d}/${b.n} = ${raw.n}/${raw.d}${raw.n !== res.n || raw.d !== res.d ? `, rút gọn thành ${fs(res)}` : ""}.`,
    hint: mulOp ? "Tử nhân tử, mẫu nhân mẫu." : "Đảo ngược phân số thứ hai rồi nhân.",
  };
};

/* ═════ Đơn vị đo ═════ */

const KHOI_LUONG = [
  { u: "tấn", kg: 1000 }, { u: "tạ", kg: 100 }, { u: "yến", kg: 10 },
] as const;

export const doiKhoiLuong: Generator = (r) => {
  const { u, kg } = pick(r, KHOI_LUONG);
  const kind = pick(r, ["xuong", "len", "honHop"] as const);
  if (kind === "len") {
    const n = int(r, 2, 90);
    return { type: "fill_blank", difficulty: "medium", tags: ["đơn vị khối lượng"],
      question: `${fmtInt(n * kg)} kg = ___ ${u}`, ...blanks(String(n)),
      explanation: `1 ${u} = ${fmtInt(kg)} kg, nên ${fmtInt(n * kg)} kg = ${fmtInt(n * kg)} : ${fmtInt(kg)} = ${n} ${u}.`,
      hint: `1 ${u} bằng bao nhiêu ki-lô-gam?` };
  }
  if (kind === "honHop") {
    const n = int(r, 1, 9), m = int(r, 1, kg - 1);
    return { type: "fill_blank", difficulty: "hard", tags: ["đơn vị khối lượng"],
      question: `${n} ${u} ${m} kg = ___ kg`, ...blanks(fmtInt(n * kg + m)),
      explanation: `${n} ${u} = ${fmtInt(n * kg)} kg; ${fmtInt(n * kg)} + ${m} = ${fmtInt(n * kg + m)} (kg).`,
      hint: `Đổi ${n} ${u} ra ki-lô-gam trước rồi cộng thêm ${m} kg.` };
  }
  const n = int(r, 2, 50);
  return { type: "fill_blank", difficulty: "easy", tags: ["đơn vị khối lượng"],
    question: `${n} ${u} = ___ kg`, ...blanks(fmtInt(n * kg)),
    explanation: `1 ${u} = ${fmtInt(kg)} kg, nên ${n} ${u} = ${n} × ${fmtInt(kg)} = ${fmtInt(n * kg)} kg.`,
    hint: "1 yến = 10 kg; 1 tạ = 100 kg; 1 tấn = 1.000 kg." };
};

const DIEN_TICH = [
  { big: "m²", small: "dm²" }, { big: "dm²", small: "cm²" }, { big: "cm²", small: "mm²" },
] as const;

export const doiDienTich: Generator = (r) => {
  const { big, small } = pick(r, DIEN_TICH);
  const kind = pick(r, ["xuong", "len", "honHop"] as const);
  if (kind === "len") {
    const n = int(r, 2, 90);
    return { type: "fill_blank", difficulty: "medium", tags: ["đơn vị diện tích"],
      question: `${fmtInt(n * 100)} ${small} = ___ ${big}`, ...blanks(String(n)),
      explanation: `1 ${big} = 100 ${small}, nên ${fmtInt(n * 100)} ${small} = ${fmtInt(n * 100)} : 100 = ${n} ${big}.`,
      hint: "Hai đơn vị diện tích liền nhau gấp, kém nhau 100 lần." };
  }
  if (kind === "honHop") {
    const n = int(r, 1, 30), m = int(r, 1, 99);
    return { type: "fill_blank", difficulty: "hard", tags: ["đơn vị diện tích"],
      question: `${n} ${big} ${m} ${small} = ___ ${small}`, ...blanks(fmtInt(n * 100 + m)),
      explanation: `${n} ${big} = ${fmtInt(n * 100)} ${small}; ${fmtInt(n * 100)} + ${m} = ${fmtInt(n * 100 + m)} (${small}).`,
      hint: `Đổi ${n} ${big} ra ${small} trước rồi cộng thêm.` };
  }
  const n = int(r, 2, 90);
  return { type: "fill_blank", difficulty: "easy", tags: ["đơn vị diện tích"],
    question: `${n} ${big} = ___ ${small}`, ...blanks(fmtInt(n * 100)),
    explanation: `1 ${big} = 100 ${small}, nên ${n} ${big} = ${n} × 100 = ${fmtInt(n * 100)} ${small}.`,
    hint: "Hai đơn vị diện tích liền nhau gấp, kém nhau 100 lần." };
};

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII"];

/** Năm Y (Y ≥ 1) thuộc thế kỉ thứ mấy: năm 1 – 100 là thế kỉ I, 2001 – 2100 là thế kỉ XXI. */
const theKi = (y: number) => Math.floor((y - 1) / 100) + 1;

export const thoiGian4: Generator = (r) => {
  const kind = pick(r, ["phutGiay", "honHop", "theKiNam", "namTheKi"] as const);
  if (kind === "phutGiay") {
    const n = int(r, 2, 15);
    return { type: "fill_blank", difficulty: "easy", tags: ["giây, phút"],
      question: `${n} phút = ___ giây`, ...blanks(String(n * 60)),
      explanation: `1 phút = 60 giây, nên ${n} phút = ${n} × 60 = ${n * 60} giây.`, hint: "1 phút = 60 giây." };
  }
  if (kind === "honHop") {
    const n = int(r, 1, 9), m = int(r, 1, 59);
    return { type: "fill_blank", difficulty: "medium", tags: ["giây, phút"],
      question: `${n} phút ${m} giây = ___ giây`, ...blanks(String(n * 60 + m)),
      explanation: `${n} phút = ${n * 60} giây; ${n * 60} + ${m} = ${n * 60 + m} (giây).`, hint: "Đổi phút ra giây trước rồi cộng thêm." };
  }
  if (kind === "theKiNam") {
    const n = int(r, 2, 9);
    return { type: "fill_blank", difficulty: "easy", tags: ["thế kỉ"],
      question: `${n} thế kỉ = ___ năm`, ...blanks(String(n * 100)),
      explanation: `1 thế kỉ = 100 năm, nên ${n} thế kỉ = ${n} × 100 = ${n * 100} năm.`, hint: "1 thế kỉ = 100 năm." };
  }
  const [y, event] = pick(r, [
    [int(r, 1001, 2100), ""],
    [1945, " (năm nước Việt Nam Dân chủ Cộng hoà ra đời)"],
    [1010, " (năm vua Lý Thái Tổ dời đô về Thăng Long)"],
    [938, " (năm Ngô Quyền đánh thắng quân Nam Hán trên sông Bạch Đằng)"],
    [2000, ""], [1900, ""], [2001, ""],
  ] as const);
  const c = theKi(y);
  const cands = [c - 1, c + 1, c - 2, c + 2, Math.floor(y / 100), Math.floor(y / 100) + 2]
    .filter((x) => x >= 1 && x <= 22 && x !== c).map((x) => ROMAN[x]);
  const { options, answer } = mcOptions(r, ROMAN[c], cands);
  return {
    type: "multiple_choice", difficulty: "hard", tags: ["thế kỉ"],
    question: `Năm ${y}${event} thuộc thế kỉ nào?`, options, answer,
    explanation: `Từ năm ${(c - 1) * 100 + 1} đến năm ${c * 100} là thế kỉ ${ROMAN[c]} (thế kỉ thứ ${c}). Năm ${y} nằm trong khoảng đó.`,
    hint: "Năm 1 đến năm 100 là thế kỉ I; năm 2001 đến năm 2100 là thế kỉ XXI.",
  };
};

/* ═════ Đúng / sai ═════ */

export const dungSai4: Generator = (r) => {
  const a = int(r, 1000, 99999), b = int(r, 1000, 99999);
  const plus = chance(r, 0.5);
  const [x, y] = plus || a >= b ? [a, b] : [b, a];
  const right = plus ? x + y : x - y;
  const ok = chance(r, 0.5);
  // lỗi hay gặp: quên nhớ (lệch 10, 100, 1000)
  const shown = ok ? right : right + pick(r, [10, -10, 100, -100, 1000, -1000].filter((d) => right + d > 0));
  return {
    type: "true_false", difficulty: "medium", tags: ["đúng sai"],
    question: `${fmtInt(x)} ${plus ? "+" : "-"} ${fmtInt(y)} = ${fmtInt(shown)}. Đúng hay sai?`, answer: ok,
    explanation: ok ? `Đúng, ${fmtInt(x)} ${plus ? "+" : "-"} ${fmtInt(y)} = ${fmtInt(right)}.`
      : `Sai, ${fmtInt(x)} ${plus ? "+" : "-"} ${fmtInt(y)} = ${fmtInt(right)}. Kết quả đã cho lệch ${fmtInt(Math.abs(shown - right))}, thường do quên nhớ hoặc nhớ thừa khi ${plus ? "cộng" : "trừ"}.`,
    hint: "Đặt tính rồi tính lại từng hàng.",
  };
};

export const LOP4 = {
  hangLop, giaTriChuSo, soSanhSoLon, sapXepSoLon, lamTron,
  congTruSoLon, timThanhPhan4, tinhThuanTien, loiVanCongTru4, dungSai4,
  nhanSoLon, chiaSoLon, nhanChia10, loiVanNhanChia4,
  trungBinhCong, tongHieu,
  rutGonPhanSo, phanSoBangNhau, soSanhPhanSo, congTruPhanSo, nhanChiaPhanSo,
  doiKhoiLuong, doiDienTich, thoiGian4,
};
