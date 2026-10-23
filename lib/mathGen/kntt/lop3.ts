// lib/mathGen/kntt/lop3.ts — Toán 3 theo từng bài sách Kết nối tri thức (lib/sgk/books/toan3.ts):
// các dạng câu cho những bài mà lop3.ts và các dạng có hình của đề in chưa phủ — phạm vi
// 10 000, chia hết – chia có dư, số lớn gấp mấy lần số bé; điểm ở giữa, trung điểm; hình
// tròn; góc vuông; hình tam giác, tứ giác; khối hộp; bài toán hai bước; nhiệt độ; chu vi;
// diện tích, cm²; xem lịch; bảng số liệu; khả năng xảy ra.
// Các generator cũ ở lop3.ts giữ nguyên để đề đã import và link đề đã chia sẻ không đổi.
// Đáp án do máy tính tính; hình vẽ là SVG đen trắng (lib/exam5/figures.ts) mang số liệu
// trong thuộc tính data-… để scripts/sgk-toan-check.ts đọc ngược lại mà kiểm tra.

import { type Generator, type Rng, int, pick, chance, shuffle, mcOptions, fixedOptions, blanks, retry, range, fmtInt, sign, baiGiai } from "../core";
import { NAMES, DAYS, cap } from "../shared";
import { HANG3 } from "../lop3";
import {
  angleSvg, boxSvg, calendarSvg, circleRadiusSvg, clockFaceSvg, dataTableSvg, pointsOnLineSvg, polygonSidesSvg,
  shapesRowSvg, thermometerSvg, unitSquaresSvg, type QuadKind,
} from "../../exam5/figures";

/** Bốn lựa chọn số (kèm đơn vị), nhiễu dương khác đáp án; thiếu thì bù +1, +2, +10. */
function numOpts(r: Rng, correct: number, wrong: number[], unit = "") {
  const u = unit ? ` ${unit}` : "";
  const pool = [...new Set(wrong.filter((x) => x >= 0 && x !== correct))];
  for (const x of [correct + 1, correct + 2, correct + 10]) if (pool.length < 3 && !pool.includes(x)) pool.push(x);
  return mcOptions(r, fmtInt(correct) + u, pool.map((x) => fmtInt(x) + u));
}

const LETTERS = ["A", "B", "C", "D", "E", "G", "H", "I", "K", "M", "N", "P", "Q"];

/* ═════════════ Số học: phạm vi 10 000 (sách học trước 100 000), chia, gấp ═════════════ */

/** Bài 45: các số có bốn chữ số — cấu tạo số, liền trước / liền sau, giá trị chữ số. */
export const so4ChuSo: Generator = (r) => {
  switch (pick(r, ["cauTao", "lienKe", "giaTri"] as const)) {
    case "cauTao": {
      const d = [int(r, 1, 9), int(r, 0, 9), int(r, 0, 9), int(r, 0, 9)];
      const n = d.reduce((s, x) => s * 10 + x, 0);
      const parts = d.map((x, i) => `${x} ${HANG3[3 - i]}`);
      return { type: "fill_blank", difficulty: "easy", tags: ["cấu tạo số"],
        question: `Viết số gồm ${parts.slice(0, 3).join(", ")} và ${parts[3]}: ___`, ...blanks(fmtInt(n)),
        explanation: `Viết lần lượt các chữ số từ hàng nghìn đến hàng đơn vị: ${d.join("")} → ${fmtInt(n)}.`,
        hint: "Viết từ hàng nghìn xuống, hàng nào bằng 0 thì viết chữ số 0." };
    }
    case "lienKe": {
      const after = chance(r, 0.5);
      // Hay nhầm nhất là số tròn: 9.999 → 10.000, 4.000 → 3.999
      const m = chance(r, 0.4)
        ? (after ? pick(r, [999, 1999, 4099, 6999, 9999, 2909]) : pick(r, [1000, 3000, 5100, 8000, 2010]))
        : int(r, 1001, 9998);
      const v = after ? m + 1 : m - 1;
      return { type: "fill_blank", difficulty: "easy", tags: ["số liền trước, liền sau"],
        question: `Số liền ${after ? "sau" : "trước"} của số ${fmtInt(m)} là ___`, ...blanks(fmtInt(v)),
        explanation: `${after ? "Số liền sau hơn" : "Số liền trước kém"} số đã cho 1 đơn vị: ${fmtInt(m)} ${after ? "+" : "-"} 1 = ${fmtInt(v)}.`,
        hint: after ? "Cộng thêm 1." : "Bớt đi 1." };
    }
    case "giaTri": {
      const d = shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
      const n = d.reduce((s, x) => s * 10 + x, 0);
      const pos = int(r, 0, 3);
      const digit = d[3 - pos];
      return { type: "fill_blank", difficulty: "medium", tags: ["giá trị chữ số"],
        question: `Giá trị của chữ số ${digit} trong số ${fmtInt(n)} là ___`, ...blanks(fmtInt(digit * 10 ** pos)),
        explanation: `Chữ số ${digit} ở hàng ${HANG3[pos]} nên có giá trị là ${fmtInt(digit * 10 ** pos)}.`,
        hint: "Xem chữ số đó đứng ở hàng nào." };
    }
  }
};

/** Bài 46: so sánh các số trong phạm vi 10 000 (có cả số ba chữ số với số bốn chữ số). */
export const soSanh10000: Generator = (r) => {
  const a = int(r, 1000, 9999);
  let b = a;
  const kind = pick(r, ["hang", "hang", "soChuSo", "bang"] as const);
  if (kind === "hang") {
    const s = String(a).split("").map(Number);
    const i = int(r, 0, 3);
    s[i] = pick(r, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== s[i] && !(i === 0 && x === 0)));
    b = s.reduce((t, x) => t * 10 + x, 0);
  } else if (kind === "soChuSo") {
    b = int(r, 100, 999);
  }
  const [x, y] = chance(r, 0.5) ? [a, b] : [b, a];
  const s = sign(x - y);
  const { options, answer } = fixedOptions([">", "<", "="], s);
  const fewer = String(x).length !== String(y).length;
  return { type: "multiple_choice", difficulty: "medium", tags: ["so sánh số"],
    question: `Chọn dấu thích hợp: ${fmtInt(x)} ___ ${fmtInt(y)}`, options, answer,
    explanation: s === "="
      ? `Hai số giống nhau ở mọi hàng nên ${fmtInt(x)} = ${fmtInt(y)}.`
      : fewer
        ? `Số nào có nhiều chữ số hơn thì lớn hơn: ${fmtInt(x)} ${s} ${fmtInt(y)}.`
        : `Hai số cùng có 4 chữ số. So sánh từ hàng nghìn sang phải, gặp hàng đầu tiên khác nhau: ${fmtInt(x)} ${s} ${fmtInt(y)}.`,
    hint: "Số có nhiều chữ số hơn thì lớn hơn; cùng số chữ số thì so sánh từ hàng nghìn." };
};

export const sapXep10000: Generator = (r) => {
  const head = int(r, 1, 9);
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
    hint: "Các số cùng hàng nghìn thì so sánh tiếp hàng trăm, hàng chục, hàng đơn vị." };
};

/** Bài 54–57: cộng, trừ, nhân, chia trong phạm vi 10 000 (kết quả không quá 10 000). */
export const phepTinh10000 = (op: "cong" | "tru" | "nhan" | "chia"): Generator => (r) => {
  switch (op) {
    case "cong": {
      const a = int(r, 1000, 8999), b = int(r, 100, 10000 - a);
      return { type: "fill_blank", difficulty: "medium", tags: ["phép cộng"],
        question: `${fmtInt(a)} + ${fmtInt(b)} = ___`, ...blanks(fmtInt(a + b)),
        explanation: `Đặt tính thẳng cột rồi cộng từ phải sang trái, nhớ sang hàng bên trái: ${fmtInt(a)} + ${fmtInt(b)} = ${fmtInt(a + b)}.`,
        hint: "Viết các chữ số cùng hàng thẳng cột." };
    }
    case "tru": {
      const a = int(r, 1000, 10000), b = int(r, 100, a - 1);
      return { type: "fill_blank", difficulty: "medium", tags: ["phép trừ"],
        question: `${fmtInt(a)} - ${fmtInt(b)} = ___`, ...blanks(fmtInt(a - b)),
        explanation: `Đặt tính thẳng cột rồi trừ từ phải sang trái, nhớ sang hàng bên trái: ${fmtInt(a)} - ${fmtInt(b)} = ${fmtInt(a - b)}.`,
        hint: "Viết các chữ số cùng hàng thẳng cột." };
    }
    case "nhan": {
      const k = int(r, 2, 9), a = int(r, 1000, Math.floor(9999 / k));
      return { type: "fill_blank", difficulty: "medium", tags: ["phép nhân"],
        question: `${fmtInt(a)} × ${k} = ___`, ...blanks(fmtInt(a * k)),
        explanation: `Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: ${fmtInt(a)} × ${k} = ${fmtInt(a * k)}.`,
        hint: "Đặt tính rồi nhân từ hàng đơn vị." };
    }
    case "chia": {
      const k = int(r, 2, 9), q = int(r, Math.ceil(1000 / k), Math.floor(9990 / k));
      if (chance(r, 0.65))
        return { type: "fill_blank", difficulty: "hard", tags: ["phép chia"],
          question: `${fmtInt(q * k)} : ${k} = ___`, ...blanks(fmtInt(q)),
          explanation: `Chia lần lượt từ trái sang phải. Thử lại: ${fmtInt(q)} × ${k} = ${fmtInt(q * k)}.`,
          hint: "Lấy từng chữ số (hoặc nhóm chữ số) từ trái sang để chia." };
      const rem = int(r, 1, k - 1), a = q * k + rem;
      return { type: "fill_blank", difficulty: "hard", tags: ["phép chia", "chia có dư"],
        question: `${fmtInt(a)} : ${k} = ${fmtInt(q)} (dư ___)`, ...blanks(String(rem)),
        explanation: `${fmtInt(q)} × ${k} = ${fmtInt(q * k)}; ${fmtInt(a)} - ${fmtInt(q * k)} = ${rem}.`,
        hint: "Số dư = số bị chia - thương × số chia." };
    }
  }
};

/** Bài 23: nhân số có hai chữ số với số có một chữ số (có nhớ và không nhớ). */
export const nhan2ChuSo: Generator = (r) => {
  const k = int(r, 2, 9), a = int(r, 11, 99);
  return { type: "fill_blank", difficulty: a * k >= 100 ? "medium" : "easy", tags: ["phép nhân"],
    question: `${a} × ${k} = ___`, ...blanks(String(a * k)),
    explanation: `Nhân hàng đơn vị trước, rồi nhân hàng chục (cộng thêm phần nhớ nếu có): ${a} × ${k} = ${a * k}.`,
    hint: "Đặt tính rồi nhân từ hàng đơn vị." };
};

/** Bài 26: chia số có hai chữ số cho số có một chữ số (chia hết là chính, thêm chia có dư). */
export const chia2ChuSo: Generator = (r) => {
  const k = int(r, 2, 9), q = int(r, Math.max(2, Math.ceil(10 / k)), Math.floor(99 / k));
  if (chance(r, 0.7) || q * k + 1 > 99)
    return { type: "fill_blank", difficulty: "medium", tags: ["phép chia"],
      question: `${q * k} : ${k} = ___`, ...blanks(String(q)),
      explanation: `Chia lần lượt từ hàng chục đến hàng đơn vị. Thử lại: ${q} × ${k} = ${q * k}.`,
      hint: "Lấy hàng chục chia trước, rồi hạ hàng đơn vị xuống chia tiếp." };
  const rem = int(r, 1, Math.min(k - 1, 99 - q * k)), a = q * k + rem;
  return { type: "fill_blank", difficulty: "hard", tags: ["phép chia", "chia có dư"],
    question: `${a} : ${k} = ${q} (dư ___)`, ...blanks(String(rem)),
    explanation: `${q} × ${k} = ${q * k}; ${a} - ${q * k} = ${rem}. Số dư ${rem} bé hơn số chia ${k}.`,
    hint: "Số dư = số bị chia - thương × số chia." };
};

/** Bài 25: phép chia hết, phép chia có dư (số bị chia có hai chữ số). */
export const chiaHetCoDu: Generator = (r) => {
  const k = int(r, 2, 9);
  switch (pick(r, ["loai", "du", "duLonNhat"] as const)) {
    case "loai": {
      const q = int(r, Math.ceil(10 / k), 9), rem = chance(r, 0.5) ? 0 : int(r, 1, k - 1), a = q * k + rem;
      const { options, answer } = fixedOptions(["Phép chia hết", "Phép chia có dư"], rem ? "Phép chia có dư" : "Phép chia hết");
      return { type: "multiple_choice", difficulty: "easy", tags: ["chia hết, chia có dư"],
        question: `${a} : ${k} là phép chia hết hay phép chia có dư?`, options, answer,
        explanation: rem
          ? `${a} : ${k} = ${q} (dư ${rem}). Còn dư nên là phép chia có dư.`
          : `${a} : ${k} = ${q}, không còn dư nên là phép chia hết.`,
        hint: "Chia xong mà số dư là 0 thì là phép chia hết." };
    }
    case "du": {
      const q = int(r, Math.ceil(10 / k), Math.floor(99 / k) - 1), rem = int(r, 1, k - 1), a = q * k + rem;
      return { type: "fill_blank", difficulty: "medium", tags: ["chia hết, chia có dư"],
        question: `${a} : ${k} = ${q} (dư ___)`, ...blanks(String(rem)),
        explanation: `${q} × ${k} = ${q * k}; ${a} - ${q * k} = ${rem}. Số dư ${rem} bé hơn số chia ${k}.`,
        hint: "Số dư = số bị chia - thương × số chia; số dư luôn bé hơn số chia." };
    }
    case "duLonNhat": {
      const { options, answer } = mcOptions(r, String(k - 1), [String(k), String(k + 1), String(k - 2), "1", "0"].filter((x) => +x >= 0 && x !== String(k - 1)));
      return { type: "multiple_choice", difficulty: "hard", tags: ["chia hết, chia có dư"],
        question: `Trong phép chia cho ${k}, số dư lớn nhất có thể là bao nhiêu?`, options, answer,
        explanation: `Số dư luôn bé hơn số chia. Số lớn nhất bé hơn ${k} là ${k - 1}.`,
        hint: "Số dư phải bé hơn số chia." };
    }
  }
};

/** Bài 39: so sánh số lớn gấp mấy lần số bé — phép tính và bài toán có lời văn. */
export const soLonGapMayLan: Generator = (r) => {
  const b = int(r, 2, 9), k = int(r, 2, 9), a = b * k;
  if (chance(r, 0.4))
    return { type: "fill_blank", difficulty: "medium", tags: ["số lớn gấp mấy lần số bé"],
      question: `Số ${a} gấp mấy lần số ${b}? Trả lời: ___ lần.`, ...blanks(String(k)),
      explanation: `Muốn biết số lớn gấp mấy lần số bé, lấy số lớn chia cho số bé: ${a} : ${b} = ${k}. Vậy ${a} gấp ${k} lần ${b}.`,
      hint: "Lấy số lớn chia cho số bé." };
  const [n1, n2] = shuffle(r, NAMES).slice(0, 2);
  const s = pick(r, [
    { q: `Đoạn dây thứ nhất dài ${a} cm, đoạn dây thứ hai dài ${b} cm. Hỏi đoạn dây thứ nhất dài gấp mấy lần đoạn dây thứ hai?`, unit: "lần", l: "Đoạn dây thứ nhất dài gấp đoạn dây thứ hai số lần là:" },
    { q: `${n1} có ${a} viên bi, ${n2} có ${b} viên bi. Hỏi số bi của ${n1} gấp mấy lần số bi của ${n2}?`, unit: "lần", l: `Số bi của ${n1} gấp số bi của ${n2} số lần là:` },
    { q: `Một con gà cân nặng ${b} kg, một con lợn cân nặng ${a} kg. Hỏi con lợn nặng gấp mấy lần con gà?`, unit: "lần", l: "Con lợn nặng gấp con gà số lần là:" },
    { q: `Giờ ra chơi, lớp em có ${b} bạn đá cầu và ${a} bạn nhảy dây. Hỏi số bạn nhảy dây gấp mấy lần số bạn đá cầu?`, unit: "lần", l: "Số bạn nhảy dây gấp số bạn đá cầu số lần là:" },
  ]);
  return { type: "fill_blank", difficulty: "medium", tags: ["số lớn gấp mấy lần số bé", "toán có lời văn"],
    question: `${s.q} Trả lời: ___ ${s.unit}.`, ...blanks(String(k)),
    explanation: baiGiai([[s.l, `${a} : ${b} = ${k} (lần)`]], `${k} lần`),
    hint: "“Gấp mấy lần” → lấy số lớn chia cho số bé." };
};

/* ═════════════ Bài 16: Điểm ở giữa, trung điểm của đoạn thẳng ═════════════ */

export const diemOGiua: Generator = (r) => {
  // Bốn điểm thẳng hàng, khoảng cách khác nhau; hỏi điểm nằm giữa hai điểm cách nhau một điểm.
  const names = shuffle(r, LETTERS).slice(0, 4);
  const gaps = [int(r, 2, 4), int(r, 2, 4), int(r, 2, 4)];
  const pos = [0, gaps[0], gaps[0] + gaps[1], gaps[0] + gaps[1] + gaps[2]];
  const i = int(r, 0, 1); // giữa điểm i và i + 2 là điểm i + 1
  const pts = names.map((label, k) => ({ label, pos: pos[k] }));
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["điểm ở giữa", "hình vẽ"],
    question: `Trong hình bên, điểm nào là điểm ở giữa hai điểm ${names[i]} và ${names[i + 2]}?`,
    image: pointsOnLineSvg(pts),
    ...fixedOptions([...names].sort(), names[i + 1]),
    explanation: `Ba điểm ${names[i]}, ${names[i + 1]}, ${names[i + 2]} thẳng hàng và ${names[i + 1]} nằm giữa ${names[i]} và ${names[i + 2]}, nên ${names[i + 1]} là điểm ở giữa.`,
    hint: "Điểm ở giữa nằm trên đoạn thẳng nối hai điểm kia.",
  };
};

export const trungDiem: Generator = (r) => {
  switch (pick(r, ["nuaDoan", "caDoan", "hinh"] as const)) {
    case "nuaDoan": {
      const ab = int(r, 2, 15) * 2;
      return { type: "fill_blank", difficulty: "easy", tags: ["trung điểm"],
        question: `Đoạn thẳng AB dài ${ab} cm. M là trung điểm của đoạn thẳng AB. Độ dài đoạn thẳng AM là ___ cm.`,
        ...blanks(String(ab / 2)),
        explanation: `Trung điểm M chia đoạn AB thành hai đoạn bằng nhau: AM = ${ab} : 2 = ${ab / 2} (cm).`,
        hint: "Trung điểm chia đôi đoạn thẳng." };
    }
    case "caDoan": {
      const am = int(r, 2, 25);
      return { type: "fill_blank", difficulty: "medium", tags: ["trung điểm"],
        question: `M là trung điểm của đoạn thẳng AB và AM = ${am} cm. Độ dài đoạn thẳng AB là ___ cm.`,
        ...blanks(String(am * 2)),
        explanation: `AM = MB = ${am} cm nên AB = ${am} × 2 = ${am * 2} (cm).`,
        hint: "AB gấp đôi AM." };
    }
    case "hinh": {
      const n = int(r, 3, 6) * 2;
      const mid = chance(r, 0.5);
      const m = mid ? n / 2 : pick(r, range(1, n - 1).filter((x) => x !== n / 2));
      return { type: "true_false", difficulty: "medium", tags: ["trung điểm", "hình vẽ"],
        question: "Trong hình bên (mỗi vạch chia cách nhau 1 cm), M là trung điểm của đoạn thẳng AB. Đúng hay sai?",
        image: pointsOnLineSvg([{ label: "A", pos: 0 }, { label: "M", pos: m }, { label: "B", pos: n }], 1),
        answer: mid,
        explanation: mid
          ? `AM = ${m} cm, MB = ${n - m} cm, hai đoạn bằng nhau và M nằm giữa A, B nên M là trung điểm của AB.`
          : `AM = ${m} cm còn MB = ${n - m} cm, hai đoạn không bằng nhau nên M không phải trung điểm của AB.`,
        hint: "Đếm số vạch từ A đến M và từ M đến B." };
    }
  }
};

/* ═════════════ Bài 17: Hình tròn — tâm, bán kính, đường kính ═════════════ */

export const banKinhDuongKinh: Generator = (r) => {
  const [rr, d1, d2, c1, c2] = shuffle(r, LETTERS.filter((l) => l !== "O")).slice(0, 5);
  const image = circleRadiusSvg({ r: rr, d1, d2, c1, c2 });
  const segs = [`O${rr}`, `${d1}${d2}`, `${c1}${c2}`];
  switch (pick(r, ["banKinh", "duongKinh", "bangNhau"] as const)) {
    case "banKinh":
      return { type: "multiple_choice", difficulty: "easy", tags: ["hình tròn", "hình vẽ"],
        question: "Hình tròn tâm O (như hình vẽ). Đoạn thẳng nào là bán kính của hình tròn?", image,
        ...fixedOptions(segs, segs[0]),
        explanation: `Bán kính nối tâm O với một điểm trên đường tròn: đó là O${rr}.`,
        hint: "Bán kính đi từ tâm O ra đường tròn." };
    case "duongKinh":
      return { type: "multiple_choice", difficulty: "easy", tags: ["hình tròn", "hình vẽ"],
        question: "Hình tròn tâm O (như hình vẽ). Đoạn thẳng nào là đường kính của hình tròn?", image,
        ...fixedOptions(segs, segs[1]),
        explanation: `Đường kính nối hai điểm trên đường tròn và đi qua tâm O: đó là ${d1}${d2}. Đoạn ${c1}${c2} không đi qua tâm nên không phải đường kính.`,
        hint: "Đường kính phải đi qua tâm O." };
    case "bangNhau": {
      const v = int(r, 2, 9);
      return { type: "fill_blank", difficulty: "medium", tags: ["hình tròn", "hình vẽ"],
        question: `Hình tròn tâm O (như hình vẽ) có O${rr} = ${v} cm. Độ dài đoạn thẳng O${d1} là ___ cm.`, image,
        ...blanks(String(v)),
        explanation: `O${rr} và O${d1} đều là bán kính. Các bán kính của một hình tròn dài bằng nhau: O${d1} = ${v} cm.`,
        hint: "Mọi bán kính của một hình tròn đều bằng nhau." };
    }
  }
};

/* ═════════════ Bài 18: Góc vuông, góc không vuông ═════════════ */

export const gocVuong: Generator = (r) => {
  switch (pick(r, ["hinh", "hinh", "dongHo", "dem"] as const)) {
    case "hinh": {
      // Hình góc vuông chỉ có một kiểu vẽ, nên cho xuất hiện ít hơn để bộ câu không lặp.
      const vuong = chance(r, 0.35);
      const deg = vuong ? 90 : pick(r, [...range(6, 13).map((x) => x * 5), ...range(23, 30).map((x) => x * 5)]);
      return { type: "multiple_choice", difficulty: "easy", tags: ["góc vuông", "hình vẽ"],
        question: "Góc đỉnh O; cạnh OA, OB trong hình bên là góc vuông hay góc không vuông?", image: angleSvg(deg),
        ...fixedOptions(["Góc vuông", "Góc không vuông"], vuong ? "Góc vuông" : "Góc không vuông"),
        explanation: vuong ? "Góc có kí hiệu góc vuông ở đỉnh O: đó là góc vuông." : "Đặt ê ke vào đỉnh O thì cạnh OB không trùng cạnh ê ke: đó là góc không vuông.",
        hint: "Dùng ê ke để kiểm tra góc vuông." };
    }
    case "dongHo": {
      const h = pick(r, [1, 2, 3, 3, 4, 5, 7, 8, 9, 9, 10, 11]);
      const vuong = h === 3 || h === 9;
      return { type: "multiple_choice", difficulty: "medium", tags: ["góc vuông", "xem đồng hồ", "hình vẽ"],
        question: `Đồng hồ chỉ ${h} giờ (như hình vẽ). Hai kim đồng hồ tạo thành góc vuông hay góc không vuông?`,
        image: clockFaceSvg(h, 0),
        ...fixedOptions(["Góc vuông", "Góc không vuông"], vuong ? "Góc vuông" : "Góc không vuông"),
        explanation: vuong
          ? `Lúc ${h} giờ, kim phút chỉ số 12, kim giờ chỉ số ${h}: hai kim tạo thành góc vuông.`
          : `Lúc ${h} giờ, hai kim không tạo thành góc vuông (chỉ lúc 3 giờ và 9 giờ hai kim mới tạo thành góc vuông).`,
        hint: "Lúc 3 giờ hai kim tạo thành góc vuông." };
    }
    case "dem": {
      const s = pick(r, [
        { q: "Một hình chữ nhật có mấy góc vuông?", n: 4, e: "Hình chữ nhật có 4 góc, cả 4 góc đều là góc vuông." },
        { q: "Một hình vuông có mấy góc vuông?", n: 4, e: "Hình vuông có 4 góc, cả 4 góc đều là góc vuông." },
        { q: "Một hình tam giác vuông có mấy góc vuông?", n: 1, e: "Hình tam giác vuông có đúng 1 góc vuông." },
        { q: "Một hình tam giác vuông có mấy góc không vuông?", n: 2, e: "Hình tam giác có 3 góc, trong đó 1 góc vuông nên còn 2 góc không vuông." },
        { q: "Chiếc ê ke có dạng hình tam giác. Ê ke có mấy góc vuông?", n: 1, e: "Ê ke có đúng 1 góc vuông — dùng góc đó để kiểm tra góc vuông." },
        { q: "Mặt bàn học hình chữ nhật có mấy góc vuông?", n: 4, e: "Mặt bàn hình chữ nhật có 4 góc vuông." },
        { q: "Một tờ giấy hình vuông, gấp đôi theo một đường chéo thì được hình tam giác có mấy góc vuông?", n: 1, e: "Hình tam giác được tạo ra giữ lại một góc của tờ giấy, đó là 1 góc vuông." },
      ]);
      return { type: "multiple_choice", difficulty: "easy", tags: ["góc vuông"],
        question: s.q, ...fixedOptions(["0", "1", "2", "4"], String(s.n)), explanation: s.e,
        hint: "Dùng ê ke kiểm tra từng góc." };
    }
  }
};

/* ═════════════ Bài 19: Hình tam giác, hình tứ giác, hình chữ nhật, hình vuông ═════════════ */

const SHAPE19: Record<"tamgiac" | "vuong" | "chunhat", { name: string; pool: QuadKind[]; why: string }> = {
  tamgiac: { name: "hình tam giác", pool: ["tugiac", "chunhat", "vuong", "thang"], why: "có 3 cạnh, 3 đỉnh, 3 góc" },
  vuong: { name: "hình vuông", pool: ["tamgiac", "tugiac", "chunhat", "thang"], why: "có 4 góc vuông và 4 cạnh dài bằng nhau" },
  // Hình vuông cũng là hình chữ nhật đặc biệt, nên không đưa hình vuông vào khi hỏi hình chữ nhật.
  chunhat: { name: "hình chữ nhật", pool: ["tamgiac", "tugiac", "thang"], why: "có 4 góc vuông, hai chiều dài bằng nhau và hai chiều rộng bằng nhau" },
};

export const hinhPhang3: Generator = (r) => {
  if (chance(r, 0.55)) {
    const target = pick(r, ["tamgiac", "vuong", "chunhat"] as const);
    const s = SHAPE19[target];
    const kinds = shuffle(r, [target as QuadKind, ...shuffle(r, s.pool).slice(0, 3)]);
    return { type: "multiple_choice", difficulty: "easy", tags: [s.name, "hình vẽ"],
      question: `Trong các hình dưới đây, hình nào là ${s.name}?`, image: shapesRowSvg(kinds),
      ...fixedOptions(["Hình 1", "Hình 2", "Hình 3", "Hình 4"], `Hình ${kinds.indexOf(target) + 1}`),
      explanation: `${cap(s.name)} ${s.why}: đó là Hình ${kinds.indexOf(target) + 1}.`,
      hint: "Đếm số cạnh và kiểm tra các góc." };
  }
  const q = pick(r, [
    { q: "Hình tam giác có ___ cạnh.", a: 3, e: "Hình tam giác có 3 cạnh, 3 đỉnh, 3 góc." },
    { q: "Hình tam giác có ___ đỉnh.", a: 3, e: "Hình tam giác có 3 cạnh, 3 đỉnh, 3 góc." },
    { q: "Hình tứ giác có ___ cạnh.", a: 4, e: "Hình tứ giác có 4 cạnh, 4 đỉnh, 4 góc." },
    { q: "Hình tứ giác có ___ góc.", a: 4, e: "Hình tứ giác có 4 cạnh, 4 đỉnh, 4 góc." },
    { q: "Hình chữ nhật có ___ góc vuông.", a: 4, e: "Hình chữ nhật có 4 góc đều là góc vuông." },
  ]);
  if (chance(r, 0.6)) return { type: "fill_blank", difficulty: "easy", tags: ["hình phẳng"], question: q.q, ...blanks(String(q.a)), explanation: q.e, hint: "Đếm trên hình vẽ trong sách." };
  const a = int(r, 3, 15), sq = chance(r, 0.5);
  if (sq)
    return { type: "fill_blank", difficulty: "easy", tags: ["hình vuông"],
      question: `Hình vuông ABCD có cạnh AB dài ${a} cm. Cạnh CD dài ___ cm.`, ...blanks(String(a)),
      explanation: `Hình vuông có 4 cạnh dài bằng nhau nên CD = AB = ${a} cm.`, hint: "Các cạnh hình vuông bằng nhau." };
  const b = int(r, 2, a - 1 < 2 ? 2 : a - 1);
  return { type: "fill_blank", difficulty: "medium", tags: ["hình chữ nhật"],
    question: `Hình chữ nhật ABCD có AB = ${a} cm, BC = ${b} cm. Cạnh AD dài ___ cm.`, ...blanks(String(b)),
    explanation: `Trong hình chữ nhật, hai cạnh đối diện dài bằng nhau: AD = BC = ${b} cm.`, hint: "AD và BC là hai cạnh đối diện." };
};

/* ═════════════ Bài 21: Khối lập phương, khối hộp chữ nhật ═════════════ */

export const khoiHop: Generator = (r) => {
  const cube = chance(r, 0.5);
  const name = cube ? "khối lập phương" : "khối hộp chữ nhật";
  const image = cube
    ? boxSvg({ length: "", width: "", height: "", lVal: 1, wVal: 1, hVal: 1 })
    : boxSvg({ length: "", width: "", height: "", lVal: 3, wVal: 1.6, hVal: 1.8 });
  switch (pick(r, ["nhanDang", "dem", "dem", "mat", "doVat", "doVat", "xep", "xep"] as const)) {
    case "doVat": {
      const lp = ["con xúc xắc", "khối ru-bích", "hộp quà hình lập phương"];
      const hop = ["viên gạch", "hộp phấn", "bao diêm", "hộp sữa", "quyển từ điển"];
      const khac = ["quả bóng", "lon nước ngọt", "cái nón lá", "quả trứng"];
      const correct = pick(r, cube ? lp : hop);
      const wrong = shuffle(r, [...(cube ? hop : lp), ...khac]).slice(0, 3);
      return { type: "multiple_choice", difficulty: "easy", tags: ["khối hình"],
        question: `Đồ vật nào dưới đây có dạng ${name}?`,
        ...mcOptions(r, cap(correct), wrong.map(cap)),
        explanation: `${cap(correct)} có dạng ${name}.`,
        hint: "Hình dung các mặt của đồ vật." };
    }
    case "xep": {
      const a = int(r, 2, 9), b = int(r, 2, 6), h = int(r, 1, 3);
      return { type: "fill_blank", difficulty: "medium", tags: ["khối hình", "phép nhân"],
        question: `${pick(r, NAMES)} xếp các khối lập phương nhỏ thành một khối hộp chữ nhật: mỗi hàng ${a} khối, mỗi lớp ${b} hàng, ${h === 1 ? "chỉ xếp 1 lớp" : `xếp ${h} lớp chồng lên nhau`}. Bạn ấy đã dùng ___ khối lập phương nhỏ.`,
        ...blanks(String(a * b * h)),
        explanation: h === 1 ? `Mỗi hàng ${a} khối, ${b} hàng: ${a} × ${b} = ${a * b} (khối).`
          : `Mỗi lớp có ${a} × ${b} = ${a * b} (khối); ${h} lớp có ${a * b} × ${h} = ${a * b * h} (khối).`,
        hint: "Tính số khối của một lớp trước." };
    }
    case "nhanDang":
      return { type: "multiple_choice", difficulty: "easy", tags: ["khối hình", "hình vẽ"],
        question: "Hình bên là khối gì?", image,
        ...fixedOptions(["Khối lập phương", "Khối hộp chữ nhật", "Khối trụ", "Khối cầu"], cap(name)),
        explanation: cube ? "Các mặt đều là hình vuông bằng nhau: đó là khối lập phương." : "Các mặt là hình chữ nhật: đó là khối hộp chữ nhật.",
        hint: "Xem các mặt là hình vuông hay hình chữ nhật." };
    case "dem": {
      const what = pick(r, [{ w: "mặt", n: 6 }, { w: "đỉnh", n: 8 }, { w: "cạnh", n: 12 }]);
      return { type: "multiple_choice", difficulty: "medium", tags: ["khối hình", "hình vẽ"],
        question: `${cap(name)} (như hình vẽ) có bao nhiêu ${what.w}?`, image,
        ...fixedOptions(["4", "6", "8", "12"], String(what.n)),
        explanation: `${cap(name)} có 6 mặt, 8 đỉnh và 12 cạnh.`,
        hint: "Đếm cả những phần bị khuất (vẽ nét đứt)." };
    }
    case "mat":
      return { type: "multiple_choice", difficulty: "easy", tags: ["khối hình"],
        question: `Các mặt của ${name} là hình gì?`,
        ...fixedOptions(["Hình vuông", "Hình chữ nhật", "Hình tam giác", "Hình tròn"], cube ? "Hình vuông" : "Hình chữ nhật"),
        explanation: cube ? "Khối lập phương có 6 mặt đều là hình vuông." : "Khối hộp chữ nhật có 6 mặt đều là hình chữ nhật.",
        hint: "Quan sát một mặt của khối." };
  }
};

/* ═════════════ Bài 28: Bài toán giải bằng hai bước tính ═════════════ */

const ITEMS = [
  { unit: "quyển", name: "vở" }, { unit: "quả", name: "cam" }, { unit: "viên", name: "bi" },
  { unit: "bông", name: "hoa" }, { unit: "cái", name: "kẹo" }, { unit: "chiếc", name: "bút chì" },
];

export const haiBuocTinh: Generator = (r) => {
  const [n1, n2] = shuffle(r, NAMES).slice(0, 2);
  const it = pick(r, ITEMS), thing = `${it.unit} ${it.name}`;
  const base = { type: "fill_blank" as const, difficulty: "hard" as const, tags: ["bài toán hai bước", "toán có lời văn"], hint: "Tìm số chưa biết ở bước 1, rồi mới trả lời câu hỏi ở bước 2." };
  switch (pick(r, ["nhieuHonTong", "itHonTong", "banNhap", "goiLe", "gapTong", "chiaConLai"] as const)) {
    case "nhieuHonTong": {
      const a = int(r, 12, 60), b = int(r, 3, 25);
      return { ...base, question: `${n1} có ${a} ${thing}, ${n2} có nhiều hơn ${n1} ${b} ${thing}. Hỏi cả hai bạn có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
        ...blanks(String(a + a + b)),
        explanation: baiGiai([
          [`Số ${thing} của ${n2} là:`, `${a} + ${b} = ${a + b} (${thing})`],
          [`Cả hai bạn có số ${thing} là:`, `${a} + ${a + b} = ${2 * a + b} (${thing})`],
        ], `${2 * a + b} ${thing}`) };
    }
    case "itHonTong": {
      const a = int(r, 25, 80), b = int(r, 3, 20);
      return { ...base, question: `${n1} có ${a} ${thing}, ${n2} có ít hơn ${n1} ${b} ${thing}. Hỏi cả hai bạn có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
        ...blanks(String(a + a - b)),
        explanation: baiGiai([
          [`Số ${thing} của ${n2} là:`, `${a} - ${b} = ${a - b} (${thing})`],
          [`Cả hai bạn có số ${thing} là:`, `${a} + ${a - b} = ${2 * a - b} (${thing})`],
        ], `${2 * a - b} ${thing}`) };
    }
    case "banNhap": {
      const a = int(r, 200, 600), b = int(r, 40, a - 50), c = int(r, 30, 300);
      return { ...base, question: `Một cửa hàng có ${a} kg gạo. Buổi sáng bán được ${b} kg, buổi chiều cửa hàng nhập thêm ${c} kg. Hỏi lúc này cửa hàng có bao nhiêu ki-lô-gam gạo? Trả lời: ___ kg.`,
        ...blanks(String(a - b + c)),
        explanation: baiGiai([
          ["Sau khi bán, cửa hàng còn lại số ki-lô-gam gạo là:", `${a} - ${b} = ${a - b} (kg)`],
          ["Lúc này cửa hàng có số ki-lô-gam gạo là:", `${a - b} + ${c} = ${a - b + c} (kg)`],
        ], `${a - b + c} kg gạo`) };
    }
    case "goiLe": {
      const k = int(r, 4, 9), n = int(r, 3, 9), m = int(r, 1, k - 1);
      return { ...base, question: `Mỗi hộp có ${k} ${thing}. ${n1} có ${n} hộp như thế và thêm ${m} ${thing} lẻ. Hỏi ${n1} có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
        ...blanks(String(k * n + m)),
        explanation: baiGiai([
          [`Số ${thing} có trong ${n} hộp là:`, `${k} × ${n} = ${k * n} (${thing})`],
          [`${n1} có tất cả số ${thing} là:`, `${k * n} + ${m} = ${k * n + m} (${thing})`],
        ], `${k * n + m} ${thing}`) };
    }
    case "gapTong": {
      const a = int(r, 4, 15), k = int(r, 2, 6);
      return { ...base, question: `${n1} có ${a} ${thing}, số ${thing} của ${n2} gấp ${k} lần số ${thing} của ${n1}. Hỏi cả hai bạn có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
        ...blanks(String(a + a * k)),
        explanation: baiGiai([
          [`Số ${thing} của ${n2} là:`, `${a} × ${k} = ${a * k} (${thing})`],
          [`Cả hai bạn có số ${thing} là:`, `${a} + ${a * k} = ${a + a * k} (${thing})`],
        ], `${a + a * k} ${thing}`) };
    }
    case "chiaConLai": {
      const k = int(r, 2, 9), q = int(r, 3, 12), b = int(r, 5, 40), a = q * k + b;
      return { ...base, question: `Một thùng có ${a} lít nước mắm. Người ta đã bán ${b} lít, số nước mắm còn lại rót đều vào ${k} can. Hỏi mỗi can có bao nhiêu lít nước mắm? Trả lời: ___ lít.`,
        ...blanks(String(q)),
        explanation: baiGiai([
          ["Số lít nước mắm còn lại là:", `${a} - ${b} = ${a - b} (l)`],
          ["Mỗi can có số lít nước mắm là:", `${a - b} : ${k} = ${q} (l)`],
        ], `${q} l nước mắm`) };
    }
  }
};

/* ═════════════ Bài 33: Nhiệt độ, đơn vị đo nhiệt độ ═════════════ */

export const nhietDo: Generator = (r) => {
  switch (pick(r, ["doc", "doc", "tangGiam", "soSanh", "thucTe"] as const)) {
    case "doc": {
      const t = int(r, 21, 44);
      return { type: "multiple_choice", difficulty: "medium", tags: ["nhiệt độ", "hình vẽ"],
        question: "Nhiệt kế bên chỉ bao nhiêu độ C?", image: thermometerSvg(t),
        ...numOpts(r, t, [t - 1, t + 1, t + 5, t - 5, t + 2], "°C"),
        explanation: `Mức chất lỏng trong nhiệt kế dừng ở vạch ${t}: nhiệt kế chỉ ${t} °C.`,
        hint: "Mỗi vạch nhỏ là 1 °C, vạch dài ghi số cách nhau 5 °C." };
    }
    case "tangGiam": {
      const up = chance(r, 0.5), a = int(r, 18, 30), d = int(r, 2, 9);
      const [when1, when2] = up ? ["Buổi sáng", "buổi trưa"] : ["Buổi trưa", "buổi tối"];
      const v = up ? a + d : a - d;
      return { type: "fill_blank", difficulty: "medium", tags: ["nhiệt độ"],
        question: `${when1} nhiệt độ ngoài trời là ${a} °C, đến ${when2} nhiệt độ ${up ? "tăng thêm" : "giảm đi"} ${d} °C. Nhiệt độ ${when2} là ___ °C.`,
        ...blanks(String(v)),
        explanation: `${a} ${up ? "+" : "-"} ${d} = ${v} (°C).`, hint: up ? "Tăng thêm → cộng." : "Giảm đi → trừ." };
    }
    case "soSanh": {
      const a = int(r, 20, 38), b = retry(() => { const x = int(r, 15, 38); return x !== a ? x : null; });
      const [hi, lo] = a > b ? [a, b] : [b, a];
      return { type: "fill_blank", difficulty: "medium", tags: ["nhiệt độ"],
        question: `Hôm qua nhiệt độ là ${a} °C, hôm nay nhiệt độ là ${b} °C. Hôm ${a > b ? "qua" : "nay"} nóng hơn hôm ${a > b ? "nay" : "qua"} ___ °C.`,
        ...blanks(String(hi - lo)),
        explanation: `${hi} - ${lo} = ${hi - lo} (°C).`, hint: "Lấy nhiệt độ cao trừ nhiệt độ thấp." };
    }
    case "thucTe": {
      const f = pick(r, [
        { q: "Nước đang sôi có nhiệt độ khoảng bao nhiêu độ C?", a: "100 °C", e: "Nước sôi ở khoảng 100 °C." },
        { q: "Nước đá đang tan có nhiệt độ khoảng bao nhiêu độ C?", a: "0 °C", e: "Nước đá đang tan có nhiệt độ khoảng 0 °C." },
        { q: "Nhiệt độ cơ thể của người khoẻ mạnh khoảng bao nhiêu độ C?", a: "37 °C", e: "Người khoẻ mạnh có nhiệt độ cơ thể khoảng 37 °C." },
      ]);
      return { type: "multiple_choice", difficulty: "easy", tags: ["nhiệt độ"], question: f.q,
        ...fixedOptions(["0 °C", "37 °C", "60 °C", "100 °C"], f.a), explanation: f.e, hint: "Nhớ lại các mốc nhiệt độ quen thuộc." };
    }
  }
};

/* ═════════════ Bài 50: Chu vi hình tam giác, hình tứ giác ═════════════ */

export const chuViDaGiac: Generator = (r) => {
  const tri = chance(r, 0.5);
  const sides = tri
    ? retry(() => { const s = [int(r, 3, 20), int(r, 3, 20), int(r, 3, 20)]; const m = Math.max(...s); return m < s[0] + s[1] + s[2] - m ? s : null; })
    : [int(r, 3, 20), int(r, 3, 20), int(r, 3, 20), int(r, 3, 20)];
  const P = sides.reduce((s, x) => s + x, 0);
  const name = tri ? "hình tam giác ABC" : "hình tứ giác ABCD";
  const exp = `Chu vi ${name} = ${sides.join(" + ")} = ${P} (cm).`;
  if (chance(r, 0.6))
    return { type: "fill_blank", difficulty: "medium", tags: ["chu vi", "hình vẽ"],
      question: `Tính chu vi ${name} (như hình vẽ). Trả lời: ___ cm.`,
      image: polygonSidesSvg(tri ? "tamgiac" : "tugiac", sides.map((s) => `${s} cm`)),
      ...blanks(String(P)), explanation: exp, hint: "Chu vi là tổng độ dài các cạnh." };
  const names = tri ? ["AB", "BC", "CA"] : ["AB", "BC", "CD", "DA"];
  return { type: "fill_blank", difficulty: "medium", tags: ["chu vi"],
    question: `${cap(name)} có ${names.map((n, i) => `${n} = ${sides[i]} cm`).join(", ")}. Chu vi ${name} là ___ cm.`,
    ...blanks(String(P)), explanation: exp, hint: "Cộng độ dài tất cả các cạnh." };
};

/* ═════════════ Bài 51: Diện tích của một hình, xăng-ti-mét vuông ═════════════ */

/** Hình ghép liền nhau từ `n` ô vuông trong khung 6 × 4. */
function polyomino(r: Rng, n: number): [number, number][] {
  return retry(() => {
    const set = new Set<string>(["0,0"]);
    while (set.size < n) {
      const [x, y] = pick(r, [...set]).split(",").map(Number);
      const [dx, dy] = pick(r, [[1, 0], [-1, 0], [0, 1], [0, -1]] as const);
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < 6 && ny < 4) set.add(`${nx},${ny}`);
    }
    const cells = [...set].map((s) => s.split(",").map(Number) as [number, number]);
    return cells.some(([, y]) => y > 0) ? cells : null; // tránh hình chỉ một hàng
  });
}

const CM2_WORDS = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const readCm2 = (n: number) => {
  const t = Math.floor(n / 10), u = n % 10;
  const tens = t === 1 ? "mười" : `${CM2_WORDS[t]} mươi`;
  const unit = u === 0 ? "" : u === 5 ? " lăm" : u === 1 && t > 1 ? " mốt" : u === 4 && t > 1 ? " tư" : ` ${CM2_WORDS[u]}`;
  return cap(`${n < 10 ? CM2_WORDS[n] : tens + unit} xăng-ti-mét vuông`);
};

export const dienTichO: Generator = (r) => {
  switch (pick(r, ["dem", "dem", "doc", "tinh"] as const)) {
    case "dem": {
      const n = int(r, 5, 14), cells = polyomino(r, n);
      return { type: "fill_blank", difficulty: "medium", tags: ["diện tích", "hình vẽ"],
        question: "Mỗi ô vuông nhỏ có diện tích 1 cm². Diện tích hình tô màu bên là ___ cm².",
        image: unitSquaresSvg(cells), ...blanks(String(n)),
        explanation: `Hình tô màu gồm ${n} ô vuông 1 cm² nên có diện tích ${n} cm².`,
        hint: "Đếm số ô vuông được tô màu." };
    }
    case "doc": {
      const n = int(r, 11, 99);
      const right = readCm2(n);
      const rev = (n % 10) * 10 + Math.floor(n / 10);
      const wrong = [
        readCm2(n % 10 === 0 ? n + 1 : Math.floor(n / 10) * 10),
        `${right.replace(" xăng-ti-mét vuông", "")} xăng-ti-mét`,
        readCm2(rev !== n && rev > 0 ? rev : n < 90 ? n + 10 : n - 10),
      ];
      return { type: "multiple_choice", difficulty: "easy", tags: ["diện tích", "đọc số đo"],
        question: `Số đo ${n} cm² đọc là:`, ...mcOptions(r, right, wrong),
        explanation: `${n} cm² đọc là: ${right.toLowerCase()}.`, hint: "cm² đọc là xăng-ti-mét vuông." };
    }
    case "tinh": {
      if (chance(r, 0.5)) {
        const a = int(r, 10, 300), b = int(r, 10, 300), plus = chance(r, 0.6) || a <= b;
        const v = plus ? a + b : a - b;
        return { type: "fill_blank", difficulty: "easy", tags: ["diện tích", "tính với cm²"],
          question: `${a} cm² ${plus ? "+" : "-"} ${b} cm² = ___ cm²`, ...blanks(String(v)),
          explanation: `Tính như với số tự nhiên rồi viết đơn vị cm²: ${a} ${plus ? "+" : "-"} ${b} = ${v} (cm²).`, hint: "Giữ nguyên đơn vị cm²." };
      }
      const a = int(r, 6, 120), k = int(r, 2, 8);
      return { type: "fill_blank", difficulty: "easy", tags: ["diện tích", "tính với cm²"],
        question: `${a} cm² × ${k} = ___ cm²`, ...blanks(String(a * k)),
        explanation: `${a} × ${k} = ${a * k} (cm²).`, hint: "Giữ nguyên đơn vị cm²." };
    }
  }
};

/* ═════════════ Bài 67: Thực hành xem lịch ═════════════ */

const weekday = (y: number, m: number, d: number) => (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // 0 = thứ Hai
const DAY_NAMES = DAYS.map(cap); // "Thứ Hai" … "Chủ nhật"

export const xemLich: Generator = (r) => {
  const y = pick(r, [2026, 2027]), m = int(r, 1, 12);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const image = calendarSvg(y, m);
  switch (pick(r, ["thu", "thu", "ngayDau", "demThu", "ngayThu"] as const)) {
    case "thu": {
      const d = int(r, 2, days), w = weekday(y, m, d);
      return { type: "multiple_choice", difficulty: "medium", tags: ["xem lịch", "hình vẽ"],
        question: `Xem tờ lịch tháng ${m} năm ${y} bên. Ngày ${d} tháng ${m} là thứ mấy?`, image,
        ...mcOptions(r, DAY_NAMES[w], DAY_NAMES.filter((_, i) => i !== w)),
        explanation: `Ngày ${d} nằm ở cột ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"][w]}: đó là ${DAYS[w]}.`,
        hint: "Tìm ngày đó trên tờ lịch rồi nhìn lên đầu cột." };
    }
    case "ngayDau": {
      const w = weekday(y, m, 1);
      return { type: "multiple_choice", difficulty: "easy", tags: ["xem lịch", "hình vẽ"],
        question: `Xem tờ lịch tháng ${m} năm ${y} bên. Ngày đầu tiên của tháng ${m} là thứ mấy?`, image,
        ...mcOptions(r, DAY_NAMES[w], DAY_NAMES.filter((_, i) => i !== w)),
        explanation: `Ngày 1 tháng ${m} nằm ở cột ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"][w]}: đó là ${DAYS[w]}.`,
        hint: "Tìm số 1 trên tờ lịch." };
    }
    case "demThu": {
      const w = int(r, 0, 6);
      const n = range(1, days).filter((d) => weekday(y, m, d) === w).length;
      return { type: "multiple_choice", difficulty: "medium", tags: ["xem lịch", "hình vẽ"],
        question: `Xem tờ lịch tháng ${m} năm ${y} bên. Tháng ${m} có mấy ngày ${DAYS[w]}?`, image,
        ...fixedOptions(["3", "4", "5", "6"], String(n)),
        explanation: `Đếm các ngày trong cột ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"][w]}: có ${n} ngày ${DAYS[w]}.`,
        hint: "Đếm các số trong một cột." };
    }
    case "ngayThu": {
      const w = int(r, 0, 6);
      const d = range(1, 7).find((x) => weekday(y, m, x) === w)!;
      return { type: "fill_blank", difficulty: "medium", tags: ["xem lịch", "hình vẽ"],
        question: `Xem tờ lịch tháng ${m} năm ${y} bên. ${cap(DAYS[w])} đầu tiên của tháng ${m} là ngày ___.`, image,
        ...blanks(String(d)),
        explanation: `Số đầu tiên trong cột ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"][w]} là ${d}.`,
        hint: "Tìm số nhỏ nhất trong cột đó." };
    }
  }
};

/* ═════════════ Bài 73: Bảng số liệu ═════════════ */

const TABLES73 = [
  { head: ["Lớp", "Số cây"] as [string, string], labels: ["3A", "3B", "3C", "3D"], noun: "cây", verb: "trồng được", who: "lớp", lo: 10, hi: 40 },
  { head: ["Tên", "Số điểm 10"] as [string, string], labels: ["Lan", "Minh", "Hoa", "Nam"], noun: "điểm 10", verb: "đạt được", who: "bạn", lo: 3, hi: 15 },
  { head: ["Tổ", "Số quyển sách"] as [string, string], labels: ["Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4"], noun: "quyển sách", verb: "góp được", who: "tổ", lo: 8, hi: 30 },
];

export const bangSoLieu: Generator = (r) => {
  const t = pick(r, TABLES73);
  const values = shuffle(r, range(t.lo, t.hi)).slice(0, 4);
  const image = dataTableSvg({ head: t.head, labels: t.labels, values });
  const lead = `Bảng bên cho biết số ${t.noun} mỗi ${t.who} ${t.verb}.`;
  const name = (i: number) => (t.who === "bạn" ? t.labels[i] : `${t.who === "lớp" ? "Lớp " : ""}${t.labels[i]}`);
  switch (pick(r, ["doc", "max", "min", "tong", "hon"] as const)) {
    case "doc": {
      const i = int(r, 0, 3);
      return { type: "fill_blank", difficulty: "easy", tags: ["bảng số liệu", "hình vẽ"], image,
        question: `${lead} ${name(i)} ${t.verb} ___ ${t.noun}.`, ...blanks(String(values[i])),
        explanation: `Đọc ở cột ${t.labels[i]}: ${values[i]} ${t.noun}.`, hint: "Tìm cột có tên đó rồi đọc số bên dưới." };
    }
    case "max":
    case "min": {
      const pickMax = chance(r, 0.5);
      const v = pickMax ? Math.max(...values) : Math.min(...values), i = values.indexOf(v);
      return { type: "multiple_choice", difficulty: "easy", tags: ["bảng số liệu", "hình vẽ"], image,
        question: `${lead} ${cap(t.who)} nào ${t.verb} ${pickMax ? "nhiều" : "ít"} ${t.noun} nhất?`,
        ...fixedOptions(t.labels.map((_, k) => name(k)), name(i)),
        explanation: `So sánh các số ${values.join(", ")}: số ${pickMax ? "lớn" : "bé"} nhất là ${v}, của ${name(i)}.`,
        hint: `Tìm số ${pickMax ? "lớn" : "bé"} nhất trong bảng.` };
    }
    case "tong": {
      const s = values.reduce((a, b) => a + b, 0);
      return { type: "fill_blank", difficulty: "medium", tags: ["bảng số liệu", "hình vẽ"], image,
        question: `${lead} Cả bốn ${t.who} ${t.verb} tất cả ___ ${t.noun}.`, ...blanks(String(s)),
        explanation: `${values.join(" + ")} = ${s} (${t.noun}).`, hint: "Cộng tất cả các số trong bảng." };
    }
    case "hon": {
      const [i, j] = shuffle(r, [0, 1, 2, 3]).slice(0, 2);
      const [a, b] = values[i] > values[j] ? [i, j] : [j, i];
      return { type: "fill_blank", difficulty: "medium", tags: ["bảng số liệu", "hình vẽ"], image,
        question: `${lead} ${name(a)} ${t.verb} nhiều hơn ${name(b)} ___ ${t.noun}.`, ...blanks(String(values[a] - values[b])),
        explanation: `${values[a]} - ${values[b]} = ${values[a] - values[b]} (${t.noun}).`, hint: "Lấy số lớn trừ số bé." };
    }
  }
};

/* ═════════════ Bài 74: Khả năng xảy ra của một sự kiện ═════════════ */

const KHA_NANG = ["Chắc chắn", "Có thể", "Không thể"] as const;
const COLORS = ["xanh", "đỏ", "vàng", "trắng"];

export const khaNang: Generator = (r) => {
  const base = { type: "multiple_choice" as const, difficulty: "medium" as const, tags: ["khả năng xảy ra"], hint: "Chắc chắn: luôn xảy ra. Có thể: lúc có lúc không. Không thể: không bao giờ xảy ra." };
  const opt = (a: (typeof KHA_NANG)[number]) => fixedOptions([...KHA_NANG], a);
  switch (pick(r, ["bong", "bong", "the", "xucXac"] as const)) {
    case "bong": {
      const [c1, c2, c3] = shuffle(r, COLORS).slice(0, 3);
      const n1 = int(r, 2, 8), n2 = chance(r, 0.35) ? 0 : int(r, 1, 8);
      const box = n2 ? `${n1} quả bóng ${c1} và ${n2} quả bóng ${c2}` : `${n1} quả bóng ${c1}`;
      const ask = pick(r, n2 ? [c1, c2, c3] : [c1, c1, c2]);
      const a = ask === c1 ? (n2 ? "Có thể" : "Chắc chắn") : ask === c2 && n2 ? "Có thể" : "Không thể";
      return { ...base, question: `Trong hộp có ${box}. Không nhìn vào hộp, lấy ra 1 quả bóng. Khả năng lấy được quả bóng ${ask}:`,
        ...opt(a),
        explanation: a === "Chắc chắn" ? `Trong hộp chỉ có bóng ${c1} nên chắc chắn lấy được bóng ${ask}.`
          : a === "Có thể" ? `Trong hộp có cả bóng ${ask} và bóng màu khác nên có thể lấy được bóng ${ask}.`
          : `Trong hộp không có bóng ${ask} nên không thể lấy được bóng ${ask}.` };
    }
    case "the": {
      const even = chance(r, 0.5);
      const cards = even ? shuffle(r, [2, 4, 6, 8]).slice(0, 3).sort((a, b) => a - b) : shuffle(r, [1, 3, 5, 7, 9]).slice(0, 3).sort((a, b) => a - b);
      const q = pick(r, ["chan", "le", "so", "lon"] as const);
      // Hỏi số có trong túi (có thể) hoặc số kế bên không có trong túi (không thể).
      const target = q === "so" ? pick(r, [cards[1], cards[0] + 1]) : 0;
      let ask = "", a: (typeof KHA_NANG)[number];
      if (q === "chan") { ask = "thẻ ghi số chẵn"; a = even ? "Chắc chắn" : "Không thể"; }
      else if (q === "le") { ask = "thẻ ghi số lẻ"; a = even ? "Không thể" : "Chắc chắn"; }
      else if (q === "so") { ask = `thẻ ghi số ${target}`; a = cards.includes(target) ? "Có thể" : "Không thể"; }
      else { ask = "thẻ ghi số bé hơn 10"; a = "Chắc chắn"; }
      return { ...base, question: `Trong túi có các thẻ ghi số ${cards.join(", ")}. Rút ra 1 thẻ bất kì. Khả năng rút được ${ask}:`,
        ...opt(a),
        explanation: a === "Chắc chắn" ? `Mọi thẻ trong túi đều là ${ask.replace("thẻ ", "")} nên chắc chắn rút được.`
          : a === "Có thể" ? `Trong túi có thẻ số ${target} và các thẻ khác nên có thể rút được.`
          : `Trong túi không có ${ask} nên không thể rút được.` };
    }
    case "xucXac": {
      const f = pick(r, [
        { ask: "mặt 7 chấm", a: "Không thể" as const, e: "Con xúc xắc chỉ có các mặt từ 1 đến 6 chấm nên không thể xuất hiện mặt 7 chấm." },
        { ask: `mặt ${int(r, 1, 6)} chấm`, a: "Có thể" as const, e: "Mặt đó có trên con xúc xắc nhưng chưa chắc lần này xuất hiện, nên là có thể." },
        { ask: "mặt có số chấm bé hơn 7", a: "Chắc chắn" as const, e: "Mặt nào của con xúc xắc cũng có số chấm từ 1 đến 6, bé hơn 7, nên chắc chắn xảy ra." },
      ]);
      return { ...base, question: `Gieo một con xúc xắc có 6 mặt (từ 1 đến 6 chấm). Khả năng xuất hiện ${f.ask}:`, ...opt(f.a), explanation: f.e };
    }
  }
};

/* ═════════════ Bài toán có lời văn theo từng bài (lời giải trình bày đủ "Bài giải") ═════════════
   recheck3 tính lại đáp án từ số liệu trong đề. */

const lv3 = (question: string, unit: string, answer: number, explanation: string, tags: string[], hint: string) => ({
  type: "fill_blank" as const, difficulty: "medium" as const, tags: ["toán có lời văn", ...tags],
  question: `${question} Trả lời: ___ ${unit}.`, ...blanks(fmtInt(answer)), explanation, hint,
});

/**
 * Cộng, trừ (2 bước), nhân, chia (1 bước) với số có `d` chữ số — bài 23, 26, 36, 37, 54–57, 63, 64, 70, 71.
 * Kết quả luôn còn trong phạm vi số có `d` chữ số (lớp 3 học tới 100 000).
 */
export const lvTinh3 = (op: "+" | "-" | "×" | ":", d: 2 | 3 | 4 | 5): Generator => (r) => retry(() => {
  const lo = 10 ** (d - 1), hi = 10 ** d - 1, f = fmtInt;
  switch (op) {
    case "+": {
      const A = int(r, lo, Math.floor(hi / 2.4)), B = int(r, Math.max(1, Math.floor(lo / 10)), Math.floor(A / 3)), nay = A + B, cong = A + nay;
      if (cong > hi) return null;
      return lv3(`Năm ngoái trường em trồng được ${f(A)} cây. Năm nay trường em trồng được nhiều hơn năm ngoái ${f(B)} cây. Hỏi cả hai năm trường em trồng được bao nhiêu cây?`,
        "cây", cong, baiGiai([
          ["Năm nay trường em trồng được số cây là:", `${f(A)} + ${f(B)} = ${f(nay)} (cây)`],
          ["Cả hai năm trường em trồng được số cây là:", `${f(A)} + ${f(nay)} = ${f(cong)} (cây)`],
        ], `${f(cong)} cây`), ["phép cộng"], "Tìm số cây năm nay trước, rồi cộng cả hai năm.");
    }
    case "-": {
      const A = int(r, Math.max(lo, 30), hi), B = int(r, Math.max(1, Math.floor(A / 6)), Math.floor(A / 2)), C = int(r, Math.max(1, Math.floor(A / 8)), Math.floor(A / 3)), con = A - B - C;
      if (con < 1) return null;
      return lv3(`Một kho có ${f(A)} kg gạo. Ngày thứ nhất kho xuất ${f(B)} kg gạo, ngày thứ hai xuất ${f(C)} kg gạo. Hỏi kho còn lại bao nhiêu ki-lô-gam gạo?`,
        "kg", con, baiGiai([
          ["Cả hai ngày kho xuất số ki-lô-gam gạo là:", `${f(B)} + ${f(C)} = ${f(B + C)} (kg)`],
          ["Kho còn lại số ki-lô-gam gạo là:", `${f(A)} - ${f(B + C)} = ${f(con)} (kg)`],
        ], `${f(con)} kg gạo`), ["phép trừ"], "Tính số gạo xuất cả hai ngày trước.");
    }
    case "×": {
      const k = int(r, 2, 9), A = int(r, lo, Math.floor(hi / k)), v = A * k;
      if (A < lo) return null;
      const [what, unit] = pick(r, [["quyển vở", "quyển vở"], ["viên gạch", "viên gạch"], ["kg hàng", "ki-lô-gam hàng"]] as const);
      const box = what === "quyển vở" ? "thùng" : "xe";
      return lv3(`Mỗi ${box} chở ${f(A)} ${what}. Hỏi ${k} ${box} như thế chở được bao nhiêu ${unit}?`,
        what === "kg hàng" ? "kg" : what, v, baiGiai([[`${k} ${box} chở được số ${unit} là:`, `${f(A)} × ${k} = ${f(v)} (${what === "kg hàng" ? "kg" : what})`]],
        `${f(v)} ${what}`), ["phép nhân"], `Mỗi ${box} bằng nhau nên làm phép nhân.`);
    }
    case ":": {
      const k = int(r, 2, 9), q = int(r, Math.ceil(lo / k), Math.floor(hi / k)), A = q * k;
      if (A < lo) return null;
      return lv3(`Người ta chia đều ${f(A)} quyển vở cho ${k} lớp. Hỏi mỗi lớp nhận được bao nhiêu quyển vở?`,
        "quyển vở", q, baiGiai([["Mỗi lớp nhận được số quyển vở là:", `${f(A)} : ${k} = ${f(q)} (quyển vở)`]], `${f(q)} quyển vở`),
        ["phép chia"], "Chia đều thì làm phép chia.");
    }
  }
});

/** Bài 25: chia có dư trong bài toán — "ít nhất" thì thêm 1, "nhiều nhất" thì lấy thương. */
export const lvChiaDu: Generator = (r) => retry(() => {
  const k = int(r, 2, 6), q = int(r, 4, 15), du = int(r, 1, k - 1), n = q * k + du;
  if (chance(r, 0.5))
    return lv3(`Lớp 3A có ${n} học sinh, mỗi bàn ngồi ${k} bạn. Hỏi cần ít nhất bao nhiêu bàn để tất cả học sinh đều có chỗ ngồi?`,
      "bàn", q + 1, baiGiai([
        ["Ta có:", `${n} : ${k} = ${q} (dư ${du})`],
        [`${q} bàn ngồi đủ ${q * k} bạn, còn ${du} bạn cần thêm 1 bàn nữa. Cần ít nhất số bàn là:`, `${q} + 1 = ${q + 1} (bàn)`],
      ], `${q + 1} bàn`), ["chia có dư"], "Còn dư thì phải thêm 1 bàn cho số bạn còn lại.");
  return lv3(`Mẹ hái được ${n} quả cam. Mẹ xếp cam vào các túi, mỗi túi đựng ${k} quả. Hỏi mẹ xếp được nhiều nhất bao nhiêu túi như thế?`,
    "túi", q, baiGiai([["Mẹ xếp được nhiều nhất số túi là:", `${n} : ${k} = ${q} (dư ${du})`]], `${q} túi, còn thừa ${du} quả cam`),
    ["chia có dư"], "Số túi xếp đầy là thương của phép chia.");
});

/** Bài 30: mi-li-mét. */
export const lvMm: Generator = (r) => {
  const a = int(r, 120, 190), b = int(r, 40, a - 30), v = a - b;
  return lv3(`Một chiếc bút chì dài ${a} mm. Sau khi gọt, bút chì còn dài ${b} mm. Hỏi bút chì đã ngắn đi bao nhiêu mi-li-mét?`,
    "mm", v, baiGiai([["Bút chì đã ngắn đi số mi-li-mét là:", `${a} - ${b} = ${v} (mm)`]], `${v} mm`), ["mi-li-mét"], "Lấy độ dài lúc đầu trừ độ dài còn lại.");
};

/** Bài 31: gam (2 bước). */
export const lvGam: Generator = (r) => retry(() => {
  const a = int(r, 10, 40) * 10, b = int(r, 2, 20) * 10, c = a + b, s = a + c;
  if (s >= 1000) return null;
  return lv3(`Một gói kẹo cân nặng ${a} g. Một gói bánh nặng hơn gói kẹo ${b} g. Hỏi cả hai gói cân nặng bao nhiêu gam?`,
    "g", s, baiGiai([
      ["Gói bánh cân nặng là:", `${a} + ${b} = ${c} (g)`],
      ["Cả hai gói cân nặng là:", `${a} + ${c} = ${s} (g)`],
    ], `${s} g`), ["gam"], "Tìm cân nặng gói bánh trước.");
});

/** Bài 32: mi-li-lít (2 bước). */
export const lvMl: Generator = (r) => retry(() => {
  const a = pick(r, [500, 750, 1000]), k = int(r, 2, 4), c = int(r, 5, 25) * 10, rot = c * k, con = a - rot;
  if (con < 50) return null;
  return lv3(`Một chai có ${fmtInt(a)} ml nước. Mai rót nước từ chai ra ${k} cốc, mỗi cốc ${c} ml. Hỏi trong chai còn lại bao nhiêu mi-li-lít nước?`,
    "ml", con, baiGiai([
      [`Mai đã rót ra ${k} cốc số mi-li-lít nước là:`, `${c} × ${k} = ${rot} (ml)`],
      ["Trong chai còn lại số mi-li-lít nước là:", `${fmtInt(a)} - ${rot} = ${con} (ml)`],
    ], `${con} ml nước`), ["mi-li-lít"], "Tính số nước đã rót ra trước.");
});

/** Bài 50: chu vi trong bài toán rào vườn. */
export const lvChuVi3: Generator = (r) => {
  if (chance(r, 0.6)) {
    const a = int(r, 12, 60), b = int(r, 5, a - 2), P = (a + b) * 2;
    return lv3(`Một mảnh vườn hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Người ta rào xung quanh mảnh vườn. Hỏi hàng rào dài bao nhiêu mét?`,
      "m", P, baiGiai([["Hàng rào dài là (chu vi mảnh vườn):", `(${a} + ${b}) × 2 = ${P} (m)`]], `${P} m`), ["chu vi"], "Chu vi hình chữ nhật = (dài + rộng) × 2.");
  }
  const a = int(r, 6, 40), P = a * 4;
  return lv3(`Một cái ao hình vuông có cạnh ${a} m. Người ta làm hàng rào quanh ao. Hỏi hàng rào dài bao nhiêu mét?`,
    "m", P, baiGiai([["Hàng rào dài là (chu vi cái ao):", `${a} × 4 = ${P} (m)`]], `${P} m`), ["chu vi"], "Chu vi hình vuông = cạnh × 4.");
};

/** Bài 52: diện tích hình chữ nhật khi chiều rộng cho qua chiều dài (2 bước). */
export const lvDienTich3: Generator = (r) => retry(() => {
  const a = int(r, 8, 30), k = int(r, 2, a - 3), b = a - k, S = a * b;
  if (S > 600) return null;
  return lv3(`Một tấm bìa hình chữ nhật có chiều dài ${a} cm, chiều rộng ngắn hơn chiều dài ${k} cm. Tính diện tích tấm bìa đó.`,
    "cm²", S, baiGiai([
      ["Chiều rộng tấm bìa là:", `${a} - ${k} = ${b} (cm)`],
      ["Diện tích tấm bìa là:", `${a} × ${b} = ${S} (cm²)`],
    ], `${S} cm²`), ["diện tích"], "Tìm chiều rộng trước, rồi lấy dài nhân rộng.");
});

export const KNTT3 = {
  so4ChuSo, soSanh10000, sapXep10000, chiaHetCoDu, soLonGapMayLan, nhan2ChuSo, chia2ChuSo,
  cong10000: phepTinh10000("cong"), tru10000: phepTinh10000("tru"),
  nhan10000: phepTinh10000("nhan"), chia10000: phepTinh10000("chia"),
  diemOGiua, trungDiem, banKinhDuongKinh, gocVuong, hinhPhang3, khoiHop, haiBuocTinh, nhietDo,
  chuViDaGiac, dienTichO, xemLich, bangSoLieu, khaNang,
  lvNhan2: lvTinh3("×", 2), lvChia2: lvTinh3(":", 2), lvNhan3: lvTinh3("×", 3), lvChia3: lvTinh3(":", 3),
  lvCong4: lvTinh3("+", 4), lvTru4: lvTinh3("-", 4), lvNhan4: lvTinh3("×", 4), lvChia4: lvTinh3(":", 4),
  lvCong5: lvTinh3("+", 5), lvTru5: lvTinh3("-", 5), lvNhan5: lvTinh3("×", 5), lvChia5: lvTinh3(":", 5),
  lvChiaDu, lvMm, lvGam, lvMl, lvChuVi3, lvDienTich3,
};
