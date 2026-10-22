// lib/mathGen/lop3kntt.ts — Toán 3 theo từng bài sách Kết nối tri thức (lib/sgk/toan3.ts):
// các dạng câu cho những bài mà lop3.ts và các dạng có hình của đề in chưa phủ — điểm ở
// giữa, trung điểm; hình tròn; góc vuông; hình tam giác, tứ giác; khối hộp; bài toán hai
// bước; nhiệt độ; chu vi; diện tích, cm²; xem lịch; bảng số liệu; khả năng xảy ra.
// Đáp án do máy tính tính; hình vẽ là SVG đen trắng (lib/exam5/figures.ts) mang số liệu
// trong thuộc tính data-… để scripts/sgk-toan-check.ts đọc ngược lại mà kiểm tra.

import { type Generator, type Rng, int, pick, chance, shuffle, mcOptions, fixedOptions, blanks, retry, range, fmtInt } from "./core";
import { NAMES, DAYS, cap } from "./shared";
import {
  angleSvg, boxSvg, calendarSvg, circleRadiusSvg, clockFaceSvg, dataTableSvg, pointsOnLineSvg, polygonSidesSvg,
  shapesRowSvg, thermometerSvg, unitSquaresSvg, type QuadKind,
} from "../exam5/figures";

/** Bốn lựa chọn số (kèm đơn vị), nhiễu dương khác đáp án; thiếu thì bù +1, +2, +10. */
function numOpts(r: Rng, correct: number, wrong: number[], unit = "") {
  const u = unit ? ` ${unit}` : "";
  const pool = [...new Set(wrong.filter((x) => x >= 0 && x !== correct))];
  for (const x of [correct + 1, correct + 2, correct + 10]) if (pool.length < 3 && !pool.includes(x)) pool.push(x);
  return mcOptions(r, fmtInt(correct) + u, pool.map((x) => fmtInt(x) + u));
}

const LETTERS = ["A", "B", "C", "D", "E", "G", "H", "I", "K", "M", "N", "P", "Q"];

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
        explanation: `Bước 1 — số ${thing} của ${n2}: ${a} + ${b} = ${a + b}. Bước 2 — cả hai bạn: ${a} + ${a + b} = ${2 * a + b} (${thing}).` };
    }
    case "itHonTong": {
      const a = int(r, 25, 80), b = int(r, 3, 20);
      return { ...base, question: `${n1} có ${a} ${thing}, ${n2} có ít hơn ${n1} ${b} ${thing}. Hỏi cả hai bạn có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
        ...blanks(String(a + a - b)),
        explanation: `Bước 1 — số ${thing} của ${n2}: ${a} - ${b} = ${a - b}. Bước 2 — cả hai bạn: ${a} + ${a - b} = ${2 * a - b} (${thing}).` };
    }
    case "banNhap": {
      const a = int(r, 200, 600), b = int(r, 40, a - 50), c = int(r, 30, 300);
      return { ...base, question: `Một cửa hàng có ${a} kg gạo. Buổi sáng bán được ${b} kg, buổi chiều cửa hàng nhập thêm ${c} kg. Hỏi lúc này cửa hàng có bao nhiêu ki-lô-gam gạo? Trả lời: ___ kg.`,
        ...blanks(String(a - b + c)),
        explanation: `Bước 1 — sau khi bán còn: ${a} - ${b} = ${a - b} (kg). Bước 2 — sau khi nhập thêm: ${a - b} + ${c} = ${a - b + c} (kg).` };
    }
    case "goiLe": {
      const k = int(r, 4, 9), n = int(r, 3, 9), m = int(r, 1, k - 1);
      return { ...base, question: `Mỗi hộp có ${k} ${thing}. ${n1} có ${n} hộp như thế và thêm ${m} ${thing} lẻ. Hỏi ${n1} có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
        ...blanks(String(k * n + m)),
        explanation: `Bước 1 — ${n} hộp có: ${k} × ${n} = ${k * n} (${thing}). Bước 2 — thêm số lẻ: ${k * n} + ${m} = ${k * n + m} (${thing}).` };
    }
    case "gapTong": {
      const a = int(r, 4, 15), k = int(r, 2, 6);
      return { ...base, question: `${n1} có ${a} ${thing}, số ${thing} của ${n2} gấp ${k} lần số ${thing} của ${n1}. Hỏi cả hai bạn có bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
        ...blanks(String(a + a * k)),
        explanation: `Bước 1 — số ${thing} của ${n2}: ${a} × ${k} = ${a * k}. Bước 2 — cả hai bạn: ${a} + ${a * k} = ${a + a * k} (${thing}).` };
    }
    case "chiaConLai": {
      const k = int(r, 2, 9), q = int(r, 3, 12), b = int(r, 5, 40), a = q * k + b;
      return { ...base, question: `Một thùng có ${a} lít nước mắm. Người ta đã bán ${b} lít, số nước mắm còn lại rót đều vào ${k} can. Hỏi mỗi can có bao nhiêu lít nước mắm? Trả lời: ___ lít.`,
        ...blanks(String(q)),
        explanation: `Bước 1 — số nước mắm còn lại: ${a} - ${b} = ${a - b} (lít). Bước 2 — mỗi can: ${a - b} : ${k} = ${q} (lít).` };
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

export const LOP3K = {
  diemOGiua, trungDiem, banKinhDuongKinh, gocVuong, hinhPhang3, khoiHop, haiBuocTinh, nhietDo,
  chuViDaGiac, dienTichO, xemLich, bangSoLieu, khaNang,
};
