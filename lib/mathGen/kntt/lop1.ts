// lib/mathGen/kntt/lop1.ts — Toán 1 theo từng bài sách Kết nối tri thức (lib/sgk/books/toan1.ts):
// các dạng câu cho những bài mà lop1.ts và các dạng có hình của đề in chưa phủ — nhiều hơn,
// ít hơn, bằng nhau; đồ vật có dạng hình gì; vị trí trong không gian; dài hơn, ngắn hơn;
// cộng, trừ không nhớ trong phạm vi 100 tách đúng theo từng bài (hai chữ số với một chữ số,
// hai chữ số với hai chữ số).

import { type Generator, int, pick, chance, shuffle, mcOptions, fixedOptions, blanks, range } from "../core";
import { EMOJI, NAMES, GIVERS } from "../shared";
import { lengthBarsSvg } from "../../exam5/figures";

/* ═════════════ Bài 3: Nhiều hơn, ít hơn, bằng nhau ═════════════ */

export const nhieuItBang: Generator = (r) => {
  const [o1, o2] = shuffle(r, EMOJI).slice(0, 2);
  const a = int(r, 1, 8);
  const b = chance(r, 0.25) ? a : retryDiff(r, a);
  const rel = a > b ? "nhiều hơn" : a < b ? "ít hơn" : "bằng";
  const ans = a > b ? "Nhiều hơn" : a < b ? "Ít hơn" : "Bằng nhau";
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["nhiều hơn, ít hơn, bằng nhau"],
    question: `Hàng trên: ${o1.e.repeat(a)}  Hàng dưới: ${o2.e.repeat(b)}  Số ${o1.n} so với số ${o2.n} như thế nào?`,
    ...fixedOptions(["Nhiều hơn", "Ít hơn", "Bằng nhau"], ans),
    explanation: `Nối mỗi ${o1.n} với một ${o2.n}: có ${a} ${o1.n} và ${b} ${o2.n}. Số ${o1.n} ${rel === "bằng" ? "bằng" : rel} số ${o2.n}.`,
    hint: "Nối từng cặp một, bên nào còn thừa thì nhiều hơn.",
  };
};

function retryDiff(r: () => number, a: number) {
  let b = a;
  while (b === a) b = int(r, 1, 8);
  return b;
}

/* ═════════════ Bài 7: Đồ vật có dạng hình gì ═════════════ */

const DO_VAT: { name: string; hinh: "Hình tròn" | "Hình vuông" | "Hình tam giác" | "Hình chữ nhật" }[] = [
  { name: "mặt đồng hồ treo tường", hinh: "Hình tròn" }, { name: "bánh xe đạp", hinh: "Hình tròn" },
  { name: "chiếc đĩa ăn cơm", hinh: "Hình tròn" }, { name: "đồng xu", hinh: "Hình tròn" },
  { name: "chiếc khăn mùi xoa", hinh: "Hình vuông" }, { name: "ô cửa sổ nhỏ hình vuông", hinh: "Hình vuông" },
  { name: "mặt bàn cờ vua", hinh: "Hình vuông" }, { name: "chiếc bánh chưng", hinh: "Hình vuông" },
  { name: "biển báo nguy hiểm", hinh: "Hình tam giác" }, { name: "lá cờ đuôi nheo", hinh: "Hình tam giác" },
  { name: "bìa quyển vở", hinh: "Hình chữ nhật" }, { name: "cánh cửa ra vào", hinh: "Hình chữ nhật" },
  { name: "mặt bảng lớp học", hinh: "Hình chữ nhật" }, { name: "tờ giấy khen", hinh: "Hình chữ nhật" },
];

export const hinhDoVat: Generator = (r) => {
  const v = pick(r, DO_VAT);
  return {
    type: "multiple_choice", difficulty: "easy", tags: ["hình phẳng"],
    question: `${v.name.charAt(0).toUpperCase() + v.name.slice(1)} có dạng hình gì?`,
    ...fixedOptions(["Hình tròn", "Hình vuông", "Hình tam giác", "Hình chữ nhật"], v.hinh),
    explanation: `${v.name.charAt(0).toUpperCase() + v.name.slice(1)} có dạng ${v.hinh.toLowerCase()}.`,
    hint: "Hình dung đường viền bên ngoài của đồ vật.",
  };
};

/* ═════════════ Bài 15: Vị trí, định hướng trong không gian ═════════════ */

const CON_VAT = [
  { e: "🐶", n: "con chó" }, { e: "🐱", n: "con mèo" }, { e: "🐰", n: "con thỏ" }, { e: "🐔", n: "con gà" },
  { e: "🐷", n: "con lợn" }, { e: "🐸", n: "con ếch" }, { e: "🐢", n: "con rùa" },
];

export const viTri: Generator = (r) => {
  const row = shuffle(r, CON_VAT).slice(0, 3);
  const show = row.map((c) => c.e).join(" ");
  const names = row.map((c) => c.n);
  // Xáo lựa chọn: nếu giữ đúng thứ tự trong hàng, "ở giữa" luôn là B và bé đoán theo vị trí.
  const opt = (correct: string) => mcOptions(r, correct, names.filter((x) => x !== correct), 3);
  switch (pick(r, ["giua", "trai", "phai", "benCanh"] as const)) {
    case "giua":
      return { type: "multiple_choice", difficulty: "easy", tags: ["vị trí"],
        question: `Ba con vật xếp thành hàng: ${show}  Con vật nào ở giữa?`, ...opt(names[1]),
        explanation: `${row[1].e} ${names[1]} đứng giữa ${names[0]} và ${names[2]}.`, hint: "Con ở giữa có bạn ở cả hai bên." };
    case "trai":
      return { type: "multiple_choice", difficulty: "easy", tags: ["vị trí"],
        question: `Ba con vật xếp thành hàng: ${show}  Con vật nào ở bên trái ${names[1]}?`, ...opt(names[0]),
        explanation: `Bên trái ${names[1]} là ${names[0]}.`, hint: "Bên trái là phía tay cầm bát." };
    case "phai":
      return { type: "multiple_choice", difficulty: "easy", tags: ["vị trí"],
        question: `Ba con vật xếp thành hàng: ${show}  Con vật nào ở bên phải ${names[1]}?`, ...opt(names[2]),
        explanation: `Bên phải ${names[1]} là ${names[2]}.`, hint: "Bên phải là phía tay cầm bút." };
    case "benCanh": {
      const i = pick(r, [0, 2]);
      return { type: "multiple_choice", difficulty: "medium", tags: ["vị trí"],
        question: `Ba con vật xếp thành hàng: ${show}  ${names[i].charAt(0).toUpperCase() + names[i].slice(1)} ở bên nào của ${names[1]}?`,
        ...fixedOptions(["Bên trái", "Bên phải"], i === 0 ? "Bên trái" : "Bên phải"),
        explanation: `${names[i].charAt(0).toUpperCase() + names[i].slice(1)} đứng ${i === 0 ? "trước" : "sau"} ${names[1]} khi đọc từ trái sang phải, nên ở bên ${i === 0 ? "trái" : "phải"}.`,
        hint: "Đọc hàng từ trái sang phải." };
    }
  }
};

/* ═════════════ Bài 25: Dài hơn, ngắn hơn ═════════════ */

export const daiNganHon: Generator = (r) => {
  if (chance(r, 0.35)) {
    const [a, b, c] = shuffle(r, NAMES).slice(0, 3);
    const tall = chance(r, 0.5);
    return { type: "multiple_choice", difficulty: "medium", tags: ["cao hơn, thấp hơn"],
      question: `${a} cao hơn ${b}, ${b} cao hơn ${c}. Bạn nào ${tall ? "cao" : "thấp"} nhất?`,
      ...fixedOptions([a, b, c], tall ? a : c),
      explanation: `${a} cao hơn ${b} mà ${b} lại cao hơn ${c}, nên ${a} cao nhất, ${c} thấp nhất.`,
      hint: "Xếp ba bạn theo thứ tự từ cao đến thấp." };
  }
  const lens = shuffle(r, range(3, 11)).slice(0, 3);
  const labels = ["A", "B", "C"];
  const long = chance(r, 0.5);
  const i = lens.indexOf(long ? Math.max(...lens) : Math.min(...lens));
  return { type: "multiple_choice", difficulty: "easy", tags: ["dài hơn, ngắn hơn", "hình vẽ"],
    question: `Băng giấy nào ${long ? "dài" : "ngắn"} nhất?`,
    image: lengthBarsSvg(labels.map((label, k) => ({ label, len: lens[k] }))),
    ...fixedOptions(labels.map((l) => `Băng giấy ${l}`), `Băng giấy ${labels[i]}`),
    explanation: `Các băng giấy thẳng hàng ở đầu bên trái. Băng giấy ${labels[i]} kéo ${long ? "dài nhất" : "ngắn nhất"} về bên phải.`,
    hint: "So sánh đầu bên phải của các băng giấy." };
};

/* ═════════════ Bài 29–32: Cộng, trừ (không nhớ) trong phạm vi 100 ═════════════ */

type Kieu = "cong21" | "cong22" | "tru21" | "tru22";

/** Không nhớ: chữ số hàng đơn vị cộng lại < 10, hoặc bị trừ ≥ số trừ. */
function soKhongNho(r: () => number, k: Kieu): [number, number] {
  for (;;) {
    const a = int(r, 10, 99);
    const b = k.endsWith("21") ? int(r, 1, 9) : int(r, 10, 99);
    const [au, bu, at, bt] = [a % 10, b % 10, Math.floor(a / 10), Math.floor(b / 10)];
    if (k.startsWith("cong") ? au + bu < 10 && a + b <= 99 : au >= bu && at >= bt && a > b) return [a, b];
  }
}

export const congTruKhongNho = (k: Kieu): Generator => (r) => {
  const [a, b] = soKhongNho(r, k);
  const cong = k.startsWith("cong");
  const v = cong ? a + b : a - b;
  if (chance(r, 0.3)) {
    const name = pick(r, NAMES), giver = pick(r, GIVERS);
    const thing = pick(r, ["viên bi", "quả cam", "bông hoa", "quyển vở", "cái kẹo"]);
    return { type: "fill_blank", difficulty: "medium", tags: ["toán có lời văn", cong ? "phép cộng" : "phép trừ"],
      question: cong
        ? `${name} có ${a} ${thing}. ${giver} cho ${name} thêm ${b} ${thing}. Hỏi ${name} có tất cả bao nhiêu ${thing}? Trả lời: ___ ${thing}.`
        : `${name} có ${a} ${thing}, ${name} cho bạn ${b} ${thing}. Hỏi ${name} còn lại bao nhiêu ${thing}? Trả lời: ___ ${thing}.`,
      ...blanks(String(v)),
      explanation: `${cong ? "Thêm vào → phép cộng" : "Cho bớt đi → phép trừ"}: ${a} ${cong ? "+" : "-"} ${b} = ${v} (${thing}).`,
      hint: cong ? "Có thêm thì làm phép cộng." : "Cho đi thì làm phép trừ." };
  }
  return { type: "fill_blank", difficulty: k.endsWith("22") ? "medium" : "easy", tags: [cong ? "phép cộng" : "phép trừ", "phạm vi 100", "không nhớ"],
    question: `${a} ${cong ? "+" : "-"} ${b} = ___`, ...blanks(String(v)),
    explanation: `Đặt tính thẳng cột: ${cong ? "cộng" : "trừ"} hàng đơn vị trước, rồi đến hàng chục: ${a} ${cong ? "+" : "-"} ${b} = ${v}.`,
    hint: "Viết các chữ số cùng hàng thẳng cột với nhau." };
};

export const KNTT1 = {
  nhieuItBang, hinhDoVat, viTri, daiNganHon,
  cong21: congTruKhongNho("cong21"), cong22: congTruKhongNho("cong22"),
  tru21: congTruKhongNho("tru21"), tru22: congTruKhongNho("tru22"),
};
