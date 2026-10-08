// lib/mathGen/lop5.ts — Toán lớp 5 (Chương trình GDPT 2018)
// Mọi phép tính số thập phân dùng kiểu Dec (số nguyên + số chữ số thập phân) nên luôn chính xác.

import {
  type Generator, type Rng, type Dec, int, pick, chance, shuffle, retry, gcd,
  dec, add, sub, mul, cmp, shift, divInt, fmt, fmtInt, sign,
  mcOptions, fixedOptions, blanks, word,
} from "./core";
import { NAMES } from "./shared";

/** Số thập phân ngẫu nhiên: phần nguyên [lo, hi], tối đa `places` chữ số sau dấu phẩy, luôn có phần thập phân. */
function randDec(r: Rng, lo: number, hi: number, places: number): Dec {
  return retry(() => {
    const p = int(r, 1, places);
    const d = dec(int(r, lo, hi) * 10 ** p + int(r, 1, 10 ** p - 1), p);
    return d.p > 0 ? d : null;
  });
}

/* ═════ Phân số, hỗn số, phân số thập phân ═════ */

export const phanSoThapPhan: Generator = (r) => {
  const [den, factor] = pick(r, [[2, 5], [5, 2], [4, 25], [20, 5], [25, 4], [50, 2], [125, 8], [250, 4], [200, 5]] as const);
  const num = retry(() => { const n = int(r, 1, den - 1); return gcd(n, den) === 1 ? n : null; });
  const target = den * factor;
  return {
    type: "fill_blank", difficulty: "medium", tags: ["phân số thập phân"],
    question: `Viết thành phân số thập phân: ${num}/${den} = ___/${fmtInt(target)}`, ...blanks(fmtInt(num * factor)),
    explanation: `Nhân cả tử số và mẫu số với ${factor}: ${num} × ${factor} = ${num * factor}; ${den} × ${factor} = ${fmtInt(target)}.`,
    hint: `${den} nhân với mấy thì được ${fmtInt(target)}?`,
  };
};

export const honSo: Generator = (r) => {
  const w = int(r, 1, 5), den = int(r, 2, 9);
  const num = retry(() => { const n = int(r, 1, den - 1); return gcd(n, den) === 1 ? n : null; });
  const top = w * den + num;
  if (chance(r, 0.5))
    return { type: "fill_blank", difficulty: "medium", tags: ["hỗn số"],
      question: `Chuyển hỗn số ${w} ${num}/${den} (${word(w)} và ${word(num)} phần ${word(den)}) thành phân số: ___`,
      answers: [`${top}/${den}`], acceptedAnswers: [[`${top}/${den}`, `${top} / ${den}`]],
      explanation: `Tử số = phần nguyên × mẫu số + tử số = ${w} × ${den} + ${num} = ${top}. Giữ nguyên mẫu số: ${top}/${den}.`,
      hint: "Nhân phần nguyên với mẫu số rồi cộng tử số." };
  const hideWhole = chance(r, 0.5); // quiz chỉ có 1 ô nhập
  return { type: "fill_blank", difficulty: "medium", tags: ["hỗn số"],
    question: hideWhole
      ? `Viết phân số ${top}/${den} thành hỗn số: ${top}/${den} = ___ và ${num}/${den}`
      : `Viết phân số ${top}/${den} thành hỗn số: ${top}/${den} = ${w} và ___/${den}`,
    ...blanks(String(hideWhole ? w : num)),
    explanation: `${top} : ${den} = ${w} dư ${num}. Vậy ${top}/${den} = ${w} ${num}/${den}.`,
    hint: "Chia tử số cho mẫu số: thương là phần nguyên, số dư là tử số." };
};

/* ═════ Số thập phân: cấu tạo, đọc viết, so sánh ═════ */

export const hangSoThapPhan: Generator = (r) => {
  // 2 chữ số phần nguyên + 3 chữ số thập phân, tất cả khác nhau → không mơ hồ
  const digits = shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 5);
  if (digits[0] === 0) [digits[0], digits[1]] = [digits[1], digits[0]];
  const names = ["hàng chục", "hàng đơn vị", "hàng phần mười", "hàng phần trăm", "hàng phần nghìn"];
  const numStr = `${digits[0]}${digits[1]},${digits[2]}${digits[3]}${digits[4]}`;
  const pos = int(r, 0, 4);
  const { options, answer } = mcOptions(r, names[pos], names);
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["số thập phân", "hàng"],
    question: `Trong số ${numStr}, chữ số ${digits[pos]} thuộc hàng nào?`, options, answer,
    explanation: `${numStr}: ${digits.map((d, i) => `${d} – ${names[i]}`).join("; ")}.`,
    hint: "Sau dấu phẩy lần lượt là phần mười, phần trăm, phần nghìn.",
  };
};

export const phanSoSangSTP: Generator = (r) => {
  const k = int(r, 1, 3);
  const num = retry(() => { const n = int(r, 1, 10 ** (k + 1) - 1); return n % 10 !== 0 ? n : null; });
  const correct = fmt(dec(num, k));
  const { options, answer } = mcOptions(r, correct, [fmt(dec(num, k - 1)), fmt(dec(num, k + 1)), fmt(dec(num, k + 2)), fmt(dec(num, 0))]);
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["số thập phân", "phân số thập phân"],
    question: `Phân số ${num}/${fmtInt(10 ** k)} viết dưới dạng số thập phân là:`, options, answer,
    explanation: `Mẫu số ${fmtInt(10 ** k)} có ${k} chữ số 0, nên phần thập phân có ${k} chữ số: ${correct}.`,
    hint: "Đếm số chữ số 0 ở mẫu số.",
  };
};

export const soSanhSTP: Generator = (r) => {
  const w = int(r, 0, 30);
  const kind = pick(r, ["dai-ngan", "bang", "khac-nguyen", "thuong"] as const);
  let a: Dec, b: Dec, aStr: string, bStr: string;
  if (kind === "bang") {
    a = dec(w * 10 + int(r, 1, 9), 1); b = a;
    aStr = fmt(a); bStr = fmt(b, int(r, 2, 3)); // 3,5 = 3,50
  } else if (kind === "dai-ngan") {
    a = dec(w * 10 + int(r, 1, 9), 1);
    b = retry(() => { const y = int(r, 11, 99); return y % 10 ? dec(w * 100 + y, 2) : null; });
    aStr = fmt(a); bStr = fmt(b);
  } else if (kind === "khac-nguyen") {
    a = randDec(r, w, w, 2); b = randDec(r, w + 1, w + 3, 1);
    aStr = fmt(a); bStr = fmt(b);
  } else {
    a = randDec(r, w, w, 3); b = randDec(r, w, w, 3);
    aStr = fmt(a); bStr = fmt(b);
  }
  if (chance(r, 0.5)) { [a, b] = [b, a]; [aStr, bStr] = [bStr, aStr]; }
  const s = sign(cmp(a, b));
  const { options, answer } = fixedOptions([">", "<", "="], s);
  return {
    type: "multiple_choice", difficulty: kind === "dai-ngan" ? "medium" : "easy", tags: ["số thập phân", "so sánh"],
    question: `Chọn dấu thích hợp: ${aStr} ___ ${bStr}`, options, answer,
    explanation: s === "="
      ? `Thêm hoặc bớt chữ số 0 ở tận cùng phần thập phân thì giá trị không đổi, nên ${aStr} = ${bStr}.`
      : `So sánh phần nguyên trước; nếu bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm, phần nghìn. Vậy ${aStr} ${s} ${bStr}.`,
    hint: "Có thể viết thêm chữ số 0 cho hai số có cùng số chữ số thập phân rồi so sánh.",
  };
};

export const sapXepSTP: Generator = (r) => {
  const w = int(r, 0, 9);
  const vals: Dec[] = [];
  while (vals.length < 4) {
    const v = randDec(r, w, w + int(r, 0, 1), 3);
    if (!vals.some((x) => cmp(x, v) === 0)) vals.push(v);
  }
  const asc = chance(r, 0.5);
  const items = vals.map((v, i) => ({ id: `n${i}`, content: fmt(v) }));
  const order = [...vals.keys()].sort((i, j) => (asc ? 1 : -1) * cmp(vals[i], vals[j]));
  let shown = shuffle(r, items);
  while (shown.map((x) => x.id).join() === order.map((i) => `n${i}`).join()) shown = shuffle(r, items);
  return {
    type: "ordering", difficulty: "medium", tags: ["số thập phân", "sắp xếp"],
    question: `Sắp xếp các số thập phân theo thứ tự từ ${asc ? "bé đến lớn" : "lớn đến bé"}.`,
    items: shown, correctOrder: order.map((i) => `n${i}`),
    explanation: `Thứ tự đúng: ${order.map((i) => fmt(vals[i])).join(asc ? " < " : " > ")}.`,
    hint: "So sánh phần nguyên trước, rồi đến phần mười, phần trăm...",
  };
};

/* ═════ Bốn phép tính với số thập phân ═════ */

export const congTruSTP: Generator = (r) => {
  let a = randDec(r, 1, 99, 2), b = randDec(r, 1, 99, 2);
  const op = chance(r, 0.5) ? "+" : "-";
  if (op === "-" && cmp(a, b) < 0) [a, b] = [b, a];
  if (op === "-" && cmp(a, b) === 0) a = add(a, dec(1));
  const c = op === "+" ? add(a, b) : sub(a, b);
  return {
    type: "fill_blank", difficulty: a.p !== b.p ? "medium" : "easy", tags: ["số thập phân", op === "+" ? "phép cộng" : "phép trừ"],
    question: `${fmt(a)} ${op} ${fmt(b)} = ___`, ...blanks(fmt(c)),
    explanation: `Đặt tính sao cho các dấu phẩy thẳng cột (${fmt(a, Math.max(a.p, b.p))} ${op} ${fmt(b, Math.max(a.p, b.p))}), tính như số tự nhiên rồi đặt dấu phẩy: ${fmt(c)}.`,
    hint: "Viết thêm chữ số 0 cho hai số có cùng số chữ số thập phân.",
  };
};

export const nhanSTP: Generator = (r) => {
  const kind = pick(r, ["voiSoTuNhien", "haiSTP", "nhan10", "nhan01"] as const);
  let a: Dec, b: Dec, why: string;
  switch (kind) {
    case "voiSoTuNhien": a = randDec(r, 1, 50, 2); b = dec(int(r, 2, 9)); why = "Nhân như số tự nhiên, rồi tách phần thập phân bằng số chữ số thập phân của thừa số."; break;
    case "haiSTP": a = randDec(r, 1, 20, 1); b = randDec(r, 1, 9, 1); why = "Nhân như số tự nhiên; tích có số chữ số thập phân bằng tổng số chữ số thập phân của hai thừa số (rồi bỏ chữ số 0 thừa ở cuối)."; break;
    case "nhan10": { const k = int(r, 1, 3); a = randDec(r, 0, 99, 3); b = dec(10 ** k); why = `Nhân với ${fmtInt(10 ** k)}: chuyển dấu phẩy sang phải ${k} chữ số.`; break; }
    case "nhan01": { const k = int(r, 1, 3); a = randDec(r, 1, 999, 1); b = dec(1, k); why = `Nhân với ${fmt(b)}: chuyển dấu phẩy sang trái ${k} chữ số.`; break; }
  }
  const c = mul(a, b);
  return {
    type: "fill_blank", difficulty: kind === "haiSTP" ? "hard" : "medium", tags: ["số thập phân", "phép nhân"],
    question: `${fmt(a)} × ${fmt(b)} = ___`, ...blanks(fmt(c)),
    explanation: `${why} Kết quả: ${fmt(c)}.`, hint: kind.startsWith("nhan") ? "Chỉ cần dời dấu phẩy." : "Đếm tổng số chữ số sau dấu phẩy.",
  };
};

export const chiaSTP: Generator = (r) => {
  const kind = pick(r, ["choSoTuNhien", "chia10", "choSTP"] as const);
  let q: Dec, d: Dec, why: string;
  switch (kind) {
    case "choSoTuNhien": q = randDec(r, 1, 30, 2); d = dec(int(r, 2, 9)); why = "Chia như số tự nhiên; khi chia đến phần thập phân thì viết dấu phẩy vào thương."; break;
    case "chia10": { const k = int(r, 1, 3); q = randDec(r, 0, 9, 3); d = dec(10 ** k); why = `Chia cho ${fmtInt(10 ** k)}: chuyển dấu phẩy sang trái ${k} chữ số.`; break; }
    case "choSTP": q = pick(r, [dec(int(r, 2, 40)), randDec(r, 1, 20, 1)]); d = pick(r, [dec(5, 1), dec(25, 2), dec(15, 1), dec(25, 1), dec(12, 1)]);
      why = "Chuyển dấu phẩy của số chia sang phải cho thành số tự nhiên, số bị chia cũng chuyển sang phải bấy nhiêu chữ số, rồi chia như thường."; break;
  }
  const a = mul(q, d);
  return {
    type: "fill_blank", difficulty: kind === "choSTP" ? "hard" : "medium", tags: ["số thập phân", "phép chia"],
    question: `${fmt(a)} : ${fmt(d)} = ___`, ...blanks(fmt(q)),
    explanation: `${why} Kết quả: ${fmt(q)}. Thử lại: ${fmt(q)} × ${fmt(d)} = ${fmt(a)}.`,
    hint: "Thử lại bằng phép nhân để kiểm tra.",
  };
};

/* ═════ Đổi đơn vị đo ═════ */

const UNIT_SYSTEMS = [
  { name: "độ dài", units: ["km", "hm", "dam", "m", "dm", "cm", "mm"], exp: 1, maxSteps: 3 },
  { name: "khối lượng", units: ["tấn", "tạ", "yến", "kg", "hg", "dag", "g"], exp: 1, maxSteps: 3 },
  { name: "diện tích", units: ["km²", "ha", "dam²", "m²", "dm²", "cm²", "mm²"], exp: 2, maxSteps: 2 },
  { name: "thể tích", units: ["m³", "dm³", "cm³"], exp: 3, maxSteps: 1 },
] as const;

export const doiDonVi: Generator = (r) => {
  const sys = pick(r, UNIT_SYSTEMS);
  const steps = int(r, 1, Math.min(sys.maxSteps, sys.units.length - 1));
  const i = int(r, 0, sys.units.length - 1 - steps);
  const big = sys.units[i], small = sys.units[i + steps];
  const k = steps * sys.exp; // 10^k
  const factor = fmtInt(10 ** k);

  // Dạng hỗn hợp: 3 m 25 cm = ___ m (chỉ độ dài/khối lượng)
  if (sys.exp === 1 && chance(r, 0.35)) {
    const w = int(r, 1, 20), part = int(r, 1, 10 ** k - 1);
    const res = add(dec(w), dec(part, k));
    return { type: "fill_blank", difficulty: "hard", tags: ["đổi đơn vị", sys.name, "số thập phân"],
      question: `${w} ${big} ${part} ${small} = ___ ${big}`, ...blanks(fmt(res)),
      explanation: `1 ${big} = ${factor} ${small} nên ${part} ${small} = ${part}/${factor} ${big} = ${fmt(dec(part, k))} ${big}. Vậy ${w} ${big} ${part} ${small} = ${fmt(res)} ${big}.`,
      hint: `${part} ${small} là ${part} phần ${factor} của 1 ${big}.` };
  }

  const toSmall = chance(r, 0.5);
  // đổi lớn → nhỏ: số có thể thập phân (3,5 m = 350 cm); nhỏ → lớn: dùng số tự nhiên (350 cm = 3,5 m)
  const v = !toSmall || chance(r, 0.4) ? dec(int(r, 1, 999)) : randDec(r, 0, 99, 2);
  const res = toSmall ? shift(v, k) : shift(v, -k);
  const [from, to] = toSmall ? [big, small] : [small, big];
  return {
    type: "fill_blank", difficulty: k >= 3 ? "hard" : "medium", tags: ["đổi đơn vị", sys.name],
    question: `${fmt(v)} ${from} = ___ ${to}`, ...blanks(fmt(res)),
    explanation: toSmall
      ? `1 ${big} = ${factor} ${small} nên ${fmt(v)} ${big} = ${fmt(v)} × ${factor} = ${fmt(res)} ${small}.`
      : `1 ${small} = 1/${factor} ${big} nên ${fmt(v)} ${small} = ${fmt(v)} : ${factor} = ${fmt(res)} ${big}.`,
    hint: sys.exp === 1 ? "Hai đơn vị liền nhau gấp/kém nhau 10 lần."
      : sys.exp === 2 ? "Hai đơn vị diện tích liền nhau gấp/kém nhau 100 lần."
      : "Hai đơn vị thể tích liền nhau gấp/kém nhau 1000 lần.",
  };
};

/* ═════ Tỉ số phần trăm ═════ */

export const tiSoPhanTram: Generator = (r) => {
  const kind = pick(r, ["timPhanTramCuaSo", "tiSo", "timSo", "loiVan"] as const);
  if (kind === "timPhanTramCuaSo") {
    const [p, base] = retry(() => {
      const p = pick(r, [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
      const base = int(r, 2, 60) * 10;
      return dec(p * base, 2).p <= 1 ? [p, base] : null;
    });
    const res = dec(p * base, 2);
    return { type: "fill_blank", difficulty: "medium", tags: ["tỉ số phần trăm", "tìm giá trị phần trăm"],
      question: `${p}% của ${fmtInt(base)} là ___`, ...blanks(fmt(res)),
      explanation: `Lấy ${fmtInt(base)} × ${p} : 100 = ${fmt(res)}.`, hint: "Nhân với số phần trăm rồi chia cho 100." };
  }
  if (kind === "timSo") {
    const [p, x] = retry(() => {
      const p = pick(r, [10, 20, 25, 40, 50, 75]);
      const x = int(r, 2, 80) * 5;
      return (p * x) % 100 === 0 ? [p, x] : null;
    });
    const v = (p * x) / 100;
    return { type: "fill_blank", difficulty: "hard", tags: ["tỉ số phần trăm", "tìm một số"],
      question: `Tìm một số, biết ${p}% của số đó là ${fmtInt(v)}. Số đó là ___`, ...blanks(fmtInt(x)),
      explanation: `Lấy ${fmtInt(v)} : ${p} × 100 = ${fmtInt(x)}.`, hint: "Chia cho số phần trăm rồi nhân với 100." };
  }
  // tỉ số phần trăm của a và b (kết quả tối đa 1 chữ số thập phân)
  const [a, b] = retry(() => {
    const b = pick(r, [8, 16, 20, 25, 40, 50, 80, 200, 250]);
    const a = int(r, 1, b - 1);
    return (a * 1000) % b === 0 ? [a, b] : null;
  });
  const pct = dec((a * 1000) / b, 1);
  const explanation = `Lấy ${a} : ${b} = ${fmt(divInt(dec(a), b))}, rồi nhân với 100 và viết thêm kí hiệu %: ${fmt(pct)}%.`;
  if (kind === "tiSo")
    return { type: "fill_blank", difficulty: "medium", tags: ["tỉ số phần trăm"],
      question: `Tỉ số phần trăm của ${a} và ${b} là ___%`, ...blanks(fmt(pct)),
      explanation, hint: "Chia số thứ nhất cho số thứ hai, rồi nhân 100." };
  return { type: "fill_blank", difficulty: "hard", tags: ["tỉ số phần trăm", "toán có lời văn"],
    question: `Lớp ${pick(r, ["5A", "5B", "5C"])} có ${b} học sinh, trong đó có ${a} học sinh nữ. Số học sinh nữ chiếm ___% số học sinh cả lớp.`,
    ...blanks(fmt(pct)), explanation, hint: "Tỉ số phần trăm = số học sinh nữ : số học sinh cả lớp × 100." };
};

/* ═════ Hình học: diện tích, chu vi, thể tích ═════ */

const LEN_UNITS = ["cm", "dm", "m"] as const;
const randLen = (r: Rng) => (chance(r, 0.7) ? dec(int(r, 3, 30)) : randDec(r, 2, 15, 1));

export const dienTichHinh: Generator = (r) => {
  const u = pick(r, LEN_UNITS);
  const kind = pick(r, ["tamGiac", "hinhThang", "tronDT", "tronCV"] as const);
  const PI = dec(314, 2);
  switch (kind) {
    case "tamGiac": {
      const a = randLen(r), h = randLen(r), s = divInt(mul(a, h), 2);
      return { type: "fill_blank", difficulty: "medium", tags: ["hình tam giác", "diện tích"],
        question: `Hình tam giác có độ dài đáy ${fmt(a)} ${u}, chiều cao ${fmt(h)} ${u}. Diện tích hình tam giác là ___ ${u}²`,
        ...blanks(fmt(s)), explanation: `S = đáy × chiều cao : 2 = ${fmt(a)} × ${fmt(h)} : 2 = ${fmt(s)} (${u}²).`,
        hint: "Diện tích tam giác = đáy × chiều cao : 2." };
    }
    case "hinhThang": {
      const a = randLen(r), b = randLen(r), h = randLen(r);
      const s = divInt(mul(add(a, b), h), 2);
      return { type: "fill_blank", difficulty: "hard", tags: ["hình thang", "diện tích"],
        question: `Hình thang có hai đáy dài ${fmt(a)} ${u} và ${fmt(b)} ${u}, chiều cao ${fmt(h)} ${u}. Diện tích hình thang là ___ ${u}²`,
        ...blanks(fmt(s)), explanation: `S = (đáy lớn + đáy bé) × chiều cao : 2 = (${fmt(a)} + ${fmt(b)}) × ${fmt(h)} : 2 = ${fmt(s)} (${u}²).`,
        hint: "Cộng hai đáy, nhân chiều cao, rồi chia 2." };
    }
    case "tronDT": {
      const rad = chance(r, 0.7) ? dec(int(r, 1, 12)) : randDec(r, 1, 6, 1);
      const s = mul(mul(rad, rad), PI);
      return { type: "fill_blank", difficulty: "hard", tags: ["hình tròn", "diện tích"],
        question: `Hình tròn có bán kính ${fmt(rad)} ${u}. Diện tích hình tròn là ___ ${u}² (lấy π = 3,14)`,
        ...blanks(fmt(s)), explanation: `S = r × r × 3,14 = ${fmt(rad)} × ${fmt(rad)} × 3,14 = ${fmt(s)} (${u}²).`,
        hint: "Diện tích hình tròn = bán kính × bán kính × 3,14." };
    }
    case "tronCV": {
      const d = chance(r, 0.7) ? dec(int(r, 2, 20)) : randDec(r, 1, 10, 1);
      const c = mul(d, PI);
      return { type: "fill_blank", difficulty: "medium", tags: ["hình tròn", "chu vi"],
        question: `Hình tròn có đường kính ${fmt(d)} ${u}. Chu vi hình tròn là ___ ${u} (lấy π = 3,14)`,
        ...blanks(fmt(c)), explanation: `C = d × 3,14 = ${fmt(d)} × 3,14 = ${fmt(c)} (${u}).`,
        hint: "Chu vi hình tròn = đường kính × 3,14." };
    }
  }
};

export const theTich: Generator = (r) => {
  const u = pick(r, LEN_UNITS);
  const cube = chance(r, 0.4);
  const what = pick(r, ["V", "Sxq", "Stp"] as const);
  const sm = (n: number) => dec(int(r, 2, n));
  if (cube) {
    const a = chance(r, 0.75) ? sm(12) : randDec(r, 1, 5, 1);
    const aa = mul(a, a);
    const val = what === "V" ? mul(aa, a) : what === "Sxq" ? mul(aa, dec(4)) : mul(aa, dec(6));
    const label = { V: "Thể tích", Sxq: "Diện tích xung quanh", Stp: "Diện tích toàn phần" }[what];
    const formula = { V: `${fmt(a)} × ${fmt(a)} × ${fmt(a)}`, Sxq: `${fmt(a)} × ${fmt(a)} × 4`, Stp: `${fmt(a)} × ${fmt(a)} × 6` }[what];
    const pow = what === "V" ? "³" : "²";
    return { type: "fill_blank", difficulty: what === "V" ? "medium" : "hard", tags: ["hình lập phương", what === "V" ? "thể tích" : "diện tích"],
      question: `Hình lập phương có cạnh ${fmt(a)} ${u}. ${label} của hình lập phương là ___ ${u}${pow}`,
      ...blanks(fmt(val)), explanation: `${label} = ${formula} = ${fmt(val)} (${u}${pow}).`,
      hint: { V: "V = cạnh × cạnh × cạnh.", Sxq: "Sxq = cạnh × cạnh × 4.", Stp: "Stp = cạnh × cạnh × 6." }[what] };
  }
  const [a, b, c] = [sm(15), sm(12), sm(10)];
  const p2 = mul(add(a, b), dec(2));
  const sxq = mul(p2, c);
  const val = what === "V" ? mul(mul(a, b), c) : what === "Sxq" ? sxq : add(sxq, mul(mul(a, b), dec(2)));
  const label = { V: "Thể tích", Sxq: "Diện tích xung quanh", Stp: "Diện tích toàn phần" }[what];
  const pow = what === "V" ? "³" : "²";
  const formula = {
    V: `${fmt(a)} × ${fmt(b)} × ${fmt(c)}`,
    Sxq: `(${fmt(a)} + ${fmt(b)}) × 2 × ${fmt(c)}`,
    Stp: `${fmt(sxq)} + ${fmt(a)} × ${fmt(b)} × 2`,
  }[what];
  return { type: "fill_blank", difficulty: what === "V" ? "medium" : "hard", tags: ["hình hộp chữ nhật", what === "V" ? "thể tích" : "diện tích"],
    question: `Hình hộp chữ nhật có chiều dài ${fmt(a)} ${u}, chiều rộng ${fmt(b)} ${u}, chiều cao ${fmt(c)} ${u}. ${label} là ___ ${u}${pow}`,
    ...blanks(fmt(val)), explanation: `${label} = ${formula} = ${fmt(val)} (${u}${pow}).`,
    hint: { V: "V = dài × rộng × cao.", Sxq: "Sxq = chu vi đáy × chiều cao.", Stp: "Stp = Sxq + 2 × diện tích đáy." }[what] };
};

/* ═════ Số đo thời gian ═════ */

export const thoiGian: Generator = (r) => {
  const kind = pick(r, ["cong", "tru", "nhan", "doiGioPhut", "doiPhutGio"] as const);
  const hm = (m: number) => [Math.floor(m / 60), m % 60] as const;
  const label = (mins: number) => { const [h, m] = hm(mins); return `${h} giờ ${m} phút`; };
  // Kết quả dạng "_ giờ _ phút" → trắc nghiệm (quiz chỉ có 1 ô nhập).
  // Đáp án nhiễu là các thời điểm KHÁC hẳn (lệch 1 giờ, lệch 5–10 phút) — không dùng
  // dạng "3 giờ 75 phút" vì nó bằng đúng đáp án, bé chọn sẽ bị chấm sai oan.
  const timeOptions = (total: number) =>
    mcOptions(r, label(total), [total - 60, total + 60, total - 10, total + 10, total - 5, total + 5, total + 70, total - 50]
      .filter((x) => x > 0).map(label));
  switch (kind) {
    case "cong": {
      const x = int(r, 1, 5) * 60 + int(r, 2, 11) * 5, y = int(r, 0, 4) * 60 + int(r, 2, 11) * 5;
      const [h, m] = hm(x + y), [xh, xm] = hm(x), [yh, ym] = hm(y);
      return { type: "multiple_choice", difficulty: "medium", tags: ["số đo thời gian", "phép cộng"],
        question: `${xh} giờ ${xm} phút + ${yh} giờ ${ym} phút = ?`, ...timeOptions(x + y),
        explanation: `Cộng giờ với giờ, phút với phút: ${xh + yh} giờ ${xm + ym} phút${xm + ym >= 60 ? ` = ${h} giờ ${m} phút (vì 60 phút = 1 giờ)` : ""}.`,
        hint: "Nếu số phút từ 60 trở lên thì đổi 60 phút thành 1 giờ." };
    }
    case "tru": {
      const y = int(r, 0, 3) * 60 + int(r, 2, 11) * 5;
      const x = y + int(r, 1, 3) * 60 + int(r, 1, 11) * 5;
      const [h, m] = hm(x - y), [xh, xm] = hm(x), [yh, ym] = hm(y);
      return { type: "multiple_choice", difficulty: "hard", tags: ["số đo thời gian", "phép trừ"],
        question: `${xh} giờ ${xm} phút - ${yh} giờ ${ym} phút = ?`, ...timeOptions(x - y),
        explanation: xm >= ym ? `Trừ giờ với giờ, phút với phút: ${h} giờ ${m} phút.`
          : `${xm} phút không trừ được ${ym} phút, đổi 1 giờ = 60 phút: ${xh - 1} giờ ${xm + 60} phút - ${yh} giờ ${ym} phút = ${h} giờ ${m} phút.`,
        hint: "Phút không đủ trừ thì đổi 1 giờ thành 60 phút." };
    }
    case "nhan": {
      const x = int(r, 1, 3) * 60 + int(r, 1, 11) * 5, k = int(r, 2, 5);
      const [h, m] = hm(x * k), [xh, xm] = hm(x);
      return { type: "multiple_choice", difficulty: "hard", tags: ["số đo thời gian", "phép nhân"],
        question: `${xh} giờ ${xm} phút × ${k} = ?`, ...timeOptions(x * k),
        explanation: `${xh * k} giờ ${xm * k} phút${xm * k >= 60 ? ` = ${h} giờ ${m} phút` : ""}.`,
        hint: "Nhân giờ và phút riêng, rồi đổi phút dư ra giờ." };
    }
    case "doiGioPhut": {
      const t = pick(r, [dec(5, 1), dec(15, 1), dec(25, 1), dec(25, 2), dec(75, 2), dec(125, 2), dec(2), dec(35, 1), dec(12, 1)]);
      const mins = mul(t, dec(60));
      return { type: "fill_blank", difficulty: "medium", tags: ["số đo thời gian", "đổi đơn vị"],
        question: `${fmt(t)} giờ = ___ phút`, ...blanks(fmt(mins)),
        explanation: `1 giờ = 60 phút nên ${fmt(t)} giờ = ${fmt(t)} × 60 = ${fmt(mins)} phút.`, hint: "Nhân với 60." };
    }
    case "doiPhutGio": {
      const mins = pick(r, [15, 30, 45, 90, 75, 135, 150, 105, 12, 18, 36]);
      const t = divInt(dec(mins), 60);
      return { type: "fill_blank", difficulty: "hard", tags: ["số đo thời gian", "đổi đơn vị"],
        question: `${mins} phút = ___ giờ`, ...blanks(fmt(t)),
        explanation: `${mins} phút = ${mins} : 60 = ${fmt(t)} giờ.`, hint: "Chia cho 60." };
    }
  }
};

/* ═════ Chuyển động đều: s = v × t ═════ */

const VEHICLES = [
  { who: "Một ô tô", v: [40, 65] }, { who: "Một xe máy", v: [30, 45] },
  { who: "Một người đi xe đạp", v: [10, 16] }, { who: "Một ca nô", v: [20, 36] },
] as const;

export const chuyenDong: Generator = (r) => {
  const veh = pick(r, VEHICLES);
  const v = dec(int(r, veh.v[0], veh.v[1]));
  const t = pick(r, [dec(5, 1), dec(1), dec(15, 1), dec(2), dec(25, 1), dec(3), dec(125, 2), dec(75, 2)]);
  const s = mul(v, t);
  const tText = (x: Dec) => {
    const mins = mul(x, dec(60)).n / 10 ** mul(x, dec(60)).p;
    const h = Math.floor(mins / 60), m = mins % 60;
    return h === 0 ? `${m} phút` : m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
  };
  const kind = pick(r, ["s", "v", "t"] as const);
  if (kind === "s")
    return { type: "fill_blank", difficulty: "medium", tags: ["chuyển động đều", "quãng đường"],
      question: `${veh.who} đi với vận tốc ${fmt(v)} km/giờ trong ${tText(t)}. Quãng đường đi được là ___ km.`,
      ...blanks(fmt(s)),
      explanation: `Đổi ${tText(t)} = ${fmt(t)} giờ. Quãng đường = vận tốc × thời gian = ${fmt(v)} × ${fmt(t)} = ${fmt(s)} (km).`,
      hint: "s = v × t (nhớ đổi thời gian ra giờ)." };
  if (kind === "v")
    return { type: "fill_blank", difficulty: "hard", tags: ["chuyển động đều", "vận tốc"],
      question: `${veh.who} đi quãng đường ${fmt(s)} km hết ${tText(t)}. Vận tốc là ___ km/giờ.`,
      ...blanks(fmt(v)),
      explanation: `Đổi ${tText(t)} = ${fmt(t)} giờ. Vận tốc = quãng đường : thời gian = ${fmt(s)} : ${fmt(t)} = ${fmt(v)} (km/giờ).`,
      hint: "v = s : t." };
  return { type: "fill_blank", difficulty: "hard", tags: ["chuyển động đều", "thời gian"],
    question: `${veh.who} đi quãng đường ${fmt(s)} km với vận tốc ${fmt(v)} km/giờ. Thời gian đi là ___ giờ.`,
    ...blanks(fmt(t)),
    explanation: `Thời gian = quãng đường : vận tốc = ${fmt(s)} : ${fmt(v)} = ${fmt(t)} (giờ), tức là ${tText(t)}.`,
    hint: "t = s : v." };
};

/* ═════ Toán có lời văn tổng hợp ═════ */

export const loiVan5: Generator = (r) => {
  const name = pick(r, NAMES);
  const kind = pick(r, ["muaHang", "trungBinhCong"] as const);
  if (kind === "muaHang") {
    const price = int(r, 3, 25) * 1000 + pick(r, [0, 500]);
    const qty = int(r, 2, 6);
    const paid = Math.ceil((price * qty) / 50000) * 50000 + (chance(r, 0.5) ? 50000 : 0);
    const change = paid - price * qty;
    return { type: "fill_blank", difficulty: "hard", tags: ["toán có lời văn", "tiền"],
      question: `${name} mua ${qty} quyển truyện, mỗi quyển giá ${fmtInt(price)} đồng. ${name} đưa người bán ${fmtInt(paid)} đồng. Người bán trả lại ___ đồng.`,
      ...blanks(fmtInt(change)),
      explanation: `Tiền mua: ${fmtInt(price)} × ${qty} = ${fmtInt(price * qty)} đồng. Tiền trả lại: ${fmtInt(paid)} - ${fmtInt(price * qty)} = ${fmtInt(change)} đồng.`,
      hint: "Tính tổng tiền mua trước, rồi lấy tiền đưa trừ đi." };
  }
  // Chọn trung bình cộng trước, rồi sinh các số sao cho tổng khớp → đáp án luôn "đẹp"
  const n = int(r, 3, 4);
  const [nums, avg, total] = retry(() => {
    const avg = randDec(r, 8, 30, 1);
    const total = mul(avg, dec(n));
    const nums = Array.from({ length: n - 1 }, () => randDec(r, 3, 35, 1));
    const last = sub(total, nums.reduce((s, x) => add(s, x), dec(0)));
    return cmp(last, dec(1)) >= 0 ? [[...nums, last], avg, total] as const : null;
  });
  return { type: "fill_blank", difficulty: "medium", tags: ["trung bình cộng", "số thập phân"],
    question: `Tìm trung bình cộng của các số: ${nums.map((x) => fmt(x)).join("; ")}. Trung bình cộng là ___`,
    ...blanks(fmt(avg)),
    explanation: `Tổng: ${nums.map((x) => fmt(x)).join(" + ")} = ${fmt(total)}. Trung bình cộng = ${fmt(total)} : ${n} = ${fmt(avg)}.`,
    hint: "Cộng tất cả các số rồi chia cho số các số hạng." };
};

/* ═════ Đúng / sai ═════ */

export const dungSai5: Generator = (r) => {
  const kind = pick(r, ["phanTram", "soSanh"] as const);
  if (kind === "phanTram") {
    const d = pick(r, [dec(5, 1), dec(25, 2), dec(75, 2), dec(4, 1), dec(5, 2), dec(125, 3), dec(12, 1)]);
    const realPct = shift(d, 2);
    const ok = chance(r, 0.5);
    const shown = ok ? realPct : pick(r, [shift(d, 1), shift(d, 3)]);
    return { type: "true_false", difficulty: "medium", tags: ["đúng sai", "tỉ số phần trăm"],
      question: `${fmt(d)} = ${fmt(shown)}%. Đúng hay sai?`, answer: ok,
      explanation: `${fmt(d)} = ${fmt(d)} × 100% = ${fmt(realPct)}%. Vậy khẳng định ${ok ? "đúng" : "sai"}.`,
      hint: "Nhân số thập phân với 100 rồi thêm %." };
  }
  const w = int(r, 1, 20);
  const a = dec(w * 10 + int(r, 1, 9), 1);
  const b = retry(() => { const y = int(r, 11, 99); return y % 10 ? dec(w * 100 + y, 2) : null; });
  const real = sign(cmp(a, b));
  const ok = chance(r, 0.5);
  const shown = ok ? real : real === ">" ? "<" : ">";
  return { type: "true_false", difficulty: "medium", tags: ["đúng sai", "so sánh số thập phân"],
    question: `${fmt(a)} ${shown} ${fmt(b)}. Đúng hay sai?`, answer: ok,
    explanation: `Viết ${fmt(a)} = ${fmt(a, 2)} rồi so sánh với ${fmt(b)}: ${fmt(a)} ${real} ${fmt(b)}. Khẳng định ${ok ? "đúng" : "sai"}.`,
    hint: "Số nhiều chữ số hơn chưa chắc đã lớn hơn!" };
};

export const LOP5 = {
  phanSoThapPhan, honSo, hangSoThapPhan, phanSoSangSTP, soSanhSTP, sapXepSTP,
  congTruSTP, nhanSTP, chiaSTP, doiDonVi, tiSoPhanTram, dienTichHinh, theTich,
  thoiGian, chuyenDong, loiVan5, dungSai5,
};
