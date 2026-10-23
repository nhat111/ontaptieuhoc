// lib/mathGen/kntt/lop2.ts — Toán 2 theo từng bài sách Kết nối tri thức (lib/sgk/books/toan2.ts):
// các dạng câu cho những bài mà lop2.ts và các dạng có hình của đề in chưa phủ — tia số;
// hơn kém nhau bao nhiêu; thêm, bớt, nhiều hơn, ít hơn trong phạm vi 20; ki-lô-gam, lít;
// cộng, trừ có nhớ trong phạm vi 100 tách theo từng bài; điểm, đoạn thẳng; ngày – giờ,
// giờ – phút, ngày – tháng; phép nhân, phép chia và tên gọi thành phần; khối trụ, khối cầu;
// đơn vị, chục, trăm, nghìn; số tròn trăm, tròn chục; đọc, viết số có ba chữ số; viết số
// thành tổng; chọn đơn vị đo độ dài; cộng, trừ trong phạm vi 1000 (không nhớ / có nhớ);
// kiểm đếm số liệu, biểu đồ tranh.
// Các generator cũ ở lop2.ts giữ nguyên để đề đã import và link đề đã chia sẻ không đổi.
// scripts/sgk-toan-check.ts (recheck2) tính lại đáp án từ chữ trong đề và từ hình vẽ.

import { type Generator, type Rng, int, pick, chance, shuffle, mcOptions, fixedOptions, blanks, retry, range, sign, baiGiai } from "../core";
import { NAMES, GIVERS, THINGS, EMOJI, cap } from "../shared";
import { type PictoIcon, pictographSvg, pointsOnLineSvg } from "../../exam5/figures";

const fill = (question: string, answer: number | string, explanation: string, tags: string[], hint: string, image?: string) => ({
  type: "fill_blank" as const, difficulty: "medium" as const, tags, question, ...blanks(String(answer)), explanation, hint,
  ...(image ? { image } : {}),
});

/* ═════════════ Bài 2: Tia số ═════════════ */

export const tiaSo: Generator = (r) => {
  const step = pick(r, [1, 2, 5, 10]), n = int(r, 6, 8);
  const start = step === 10 ? int(r, 0, 9 - n + 1) * 10 : int(r, 0, Math.floor((100 - step * (n - 1)) / step)) * step;
  const vals = range(0, n - 1).map((i) => start + i * step);
  const hole = int(r, 1, n - 2);
  const image = pointsOnLineSvg(vals.map((v, i) => ({ label: i === hole ? "?" : String(v), pos: i })), 1);
  // Trắc nghiệm: đề chữ giống nhau ở mọi câu (chỉ hình khác), nên lựa chọn giúp phân biệt các câu.
  const v = vals[hole];
  return { type: "multiple_choice", difficulty: "easy", tags: ["tia số", "hình vẽ"],
    question: "Số thích hợp ở dấu ? trên tia số là:", image,
    ...mcOptions(r, String(v), [v - step, v + step, v + 1, v - 1, v + 2 * step].filter((x) => x >= 0 && x !== v).map(String)),
    explanation: `Hai vạch liền nhau trên tia số hơn kém nhau ${step} đơn vị: ${vals[hole - 1]} + ${step} = ${v}.`,
    hint: "Xem hai số liền nhau trên tia số hơn kém nhau bao nhiêu." };
};

/* ═════════════ Bài 4: Hơn kém nhau bao nhiêu ═════════════ */

/** Hai số có hai chữ số, trừ không nhớ (chủ đề 1 chưa học có nhớ). */
function khongNho(r: Rng): [number, number] {
  return retry(() => {
    const a = int(r, 12, 99), b = int(r, 10, a - 1);
    return a % 10 >= b % 10 ? [a, b] : null;
  });
}

export const honKem: Generator = (r) => {
  const [a, b] = khongNho(r), d = a - b;
  const exp = `${a} - ${b} = ${d}.`;
  switch (pick(r, ["nhieu", "it", "to", "cao"] as const)) {
    case "nhieu": return fill(`Số ${a} nhiều hơn số ${b} là ___`, d, `Lấy số lớn trừ số bé: ${exp}`, ["hơn kém"], "Lấy số lớn trừ số bé.");
    case "it": return fill(`Số ${b} ít hơn số ${a} là ___`, d, `Lấy số lớn trừ số bé: ${exp}`, ["hơn kém"], "Lấy số lớn trừ số bé.");
    case "to": return fill(`Tổ Một có ${a} bông hoa, tổ Hai có ${b} bông hoa. Tổ Một có nhiều hơn tổ Hai ___ bông hoa.`, d,
      baiGiai([["Tổ Một có nhiều hơn tổ Hai số bông hoa là:", `${a} - ${b} = ${d} (bông hoa)`]], `${d} bông hoa`), ["hơn kém", "toán có lời văn"], "Lấy số lớn trừ số bé.");
    case "cao": {
      const [n1, n2] = shuffle(r, NAMES).slice(0, 2);
      const A = 100 + (a % 40), B = A - (d % 20) - 1;
      return fill(`${n1} cao ${A} cm, ${n2} cao ${B} cm. ${n2} thấp hơn ${n1} ___ cm.`, A - B,
        baiGiai([[`${n2} thấp hơn ${n1} số xăng-ti-mét là:`, `${A} - ${B} = ${A - B} (cm)`]], `${A - B} cm`), ["hơn kém", "toán có lời văn"], "Lấy số đo lớn trừ số đo bé.");
    }
  }
};

/* ═════════════ Bài 9, 13: thêm, bớt; nhiều hơn, ít hơn (qua 10, phạm vi 20) ═════════════ */

const qua10 = (r: Rng): [number, number] => retry(() => { const a = int(r, 2, 9), b = int(r, 2, 9); return a + b > 10 ? [a, b] : null; });

export const loiVan20 = (k: "them" | "nhieu"): Generator => (r) => {
  const [a, b] = qua10(r), c = a + b;
  const t = pick(r, THINGS), thing = `${t.unit} ${t.name}`;
  const [n1, n2] = shuffle(r, NAMES).slice(0, 2);
  const up = chance(r, 0.5);
  if (k === "them") {
    if (up) return fill(`${n1} có ${a} ${thing}, ${pick(r, GIVERS).toLowerCase()} cho ${n1} thêm ${b} ${thing}. ${n1} có tất cả ___ ${thing}.`, c,
      baiGiai([[`${n1} có tất cả số ${thing} là:`, `${a} + ${b} = ${c} (${thing})`]], `${c} ${thing}`), ["thêm", "toán có lời văn"], "Có thêm thì làm phép cộng.");
    return fill(`Trên cành có ${c} con chim, sau đó ${b} con bay đi. Trên cành còn lại ___ con chim.`, a,
      baiGiai([["Trên cành còn lại số con chim là:", `${c} - ${b} = ${a} (con chim)`]], `${a} con chim`), ["bớt", "toán có lời văn"], "Bớt đi thì làm phép trừ.");
  }
  if (up) return fill(`${n1} có ${a} ${thing}, ${n2} có nhiều hơn ${n1} ${b} ${thing}. ${n2} có ___ ${thing}.`, c,
    baiGiai([[`Số ${thing} của ${n2} là:`, `${a} + ${b} = ${c} (${thing})`]], `${c} ${thing}`), ["nhiều hơn", "toán có lời văn"], "Nhiều hơn thì làm phép cộng.");
  return fill(`${n1} có ${c} ${thing}, ${n2} có ít hơn ${n1} ${b} ${thing}. ${n2} có ___ ${thing}.`, a,
    baiGiai([[`Số ${thing} của ${n2} là:`, `${c} - ${b} = ${a} (${thing})`]], `${a} ${thing}`), ["ít hơn", "toán có lời văn"], "Ít hơn thì làm phép trừ.");
};

/* ═════════════ Bài 15: Ki-lô-gam ═════════════ */

const VAT = ["quả bưởi", "quả dưa hấu", "con ngỗng", "quả bí ngô", "túi cam", "bao đỗ"];

export const kiLoGam: Generator = (r) => {
  switch (pick(r, ["can", "nangHon", "tinh", "loiVan"] as const)) {
    case "can": {
      const v = pick(r, VAT), a = pick(r, [1, 2, 5]), b = pick(r, [1, 2, 5]);
      return fill(`Cân thăng bằng: một đĩa cân có ${v}, đĩa kia có quả cân ${a} kg và quả cân ${b} kg. ${cap(v)} nặng ___ kg.`, a + b,
        `Cân thăng bằng nên ${v} nặng bằng hai quả cân: ${a} + ${b} = ${a + b} (kg).`, ["ki-lô-gam"], "Cân thăng bằng: hai bên nặng bằng nhau.");
    }
    case "nangHon": {
      const [v1, v2] = shuffle(r, VAT).slice(0, 2);
      const a = int(r, 2, 15), b = retry(() => { const x = int(r, 2, 15); return x !== a ? x : null; });
      const heavy = chance(r, 0.5);
      const ans = (a > b) === heavy ? v1 : v2;
      return { type: "multiple_choice", difficulty: "easy", tags: ["ki-lô-gam"],
        question: `${cap(v1)} cân nặng ${a} kg, ${v2} cân nặng ${b} kg. Vật nào ${heavy ? "nặng" : "nhẹ"} hơn?`,
        ...fixedOptions([cap(v1), cap(v2)], cap(ans)),
        explanation: `${Math.max(a, b)} kg nặng hơn ${Math.min(a, b)} kg nên ${ans} ${heavy ? "nặng" : "nhẹ"} hơn.`,
        hint: "So sánh hai số đo như so sánh hai số." };
    }
    case "tinh": {
      const [a, b] = qua10(r);
      return chance(r, 0.5)
        ? fill(`${a} kg + ${b} kg = ___ kg`, a + b, `Cộng như số bình thường rồi ghi đơn vị: ${a} + ${b} = ${a + b} (kg).`, ["ki-lô-gam", "tính"], "Viết kg sau kết quả.")
        : fill(`${a + b} kg - ${b} kg = ___ kg`, a, `Trừ như số bình thường rồi ghi đơn vị: ${a + b} - ${b} = ${a} (kg).`, ["ki-lô-gam", "tính"], "Viết kg sau kết quả.");
    }
    case "loiVan": {
      const [a, b] = qua10(r), c = a + b;
      return chance(r, 0.5)
        ? fill(`Bao gạo nặng ${c} kg, bao đỗ nhẹ hơn bao gạo ${b} kg. Bao đỗ nặng ___ kg.`, a,
          baiGiai([["Bao đỗ cân nặng là:", `${c} - ${b} = ${a} (kg)`]], `${a} kg`), ["ki-lô-gam", "toán có lời văn"], "Nhẹ hơn thì làm phép trừ.")
        : fill(`Con ngỗng nặng ${a} kg, con lợn con nặng hơn con ngỗng ${b} kg. Con lợn con nặng ___ kg.`, c,
          baiGiai([["Con lợn con cân nặng là:", `${a} + ${b} = ${c} (kg)`]], `${c} kg`), ["ki-lô-gam", "toán có lời văn"], "Nặng hơn thì làm phép cộng.");
    }
  }
};

/* ═════════════ Bài 16: Lít ═════════════ */

export const lit: Generator = (r) => {
  const [a, b] = qua10(r), c = a + b;
  switch (pick(r, ["rot", "ca", "tinh", "hon", "gop"] as const)) {
    case "rot": return fill(`Can có ${c} l nước, rót ra ${b} l nước. Trong can còn lại ___ l nước.`, a,
      baiGiai([["Trong can còn lại số lít nước là:", `${c} - ${b} = ${a} (l)`]], `${a} l nước`), ["lít", "toán có lời văn"], "Rót ra là bớt đi.");
    case "ca": {
      const n = int(r, 2, 9);
      return fill(`Rót hết nước trong bình sang các ca 1 l thì được ${n} ca đầy. Bình đựng ___ l nước.`, n,
        `Mỗi ca 1 l, ${n} ca đầy nên bình đựng ${n} l nước.`, ["lít"], "Mỗi ca đựng 1 l.");
    }
    case "tinh": return chance(r, 0.5)
      ? fill(`${a} l + ${b} l = ___ l`, c, `Cộng như số bình thường rồi ghi đơn vị: ${a} + ${b} = ${c} (l).`, ["lít", "tính"], "Viết l sau kết quả.")
      : fill(`${c} l - ${a} l = ___ l`, b, `Trừ như số bình thường rồi ghi đơn vị: ${c} - ${a} = ${b} (l).`, ["lít", "tính"], "Viết l sau kết quả.");
    case "hon": return fill(`Thùng to đựng ${c} l nước, thùng nhỏ đựng ${a} l nước. Thùng to đựng nhiều hơn thùng nhỏ ___ l nước.`, b,
      `Lấy số lớn trừ số bé: ${c} - ${a} = ${b} (l).`, ["lít", "hơn kém"], "Lấy số lít nhiều hơn trừ số lít ít hơn.");
    case "gop": return fill(`Can thứ nhất có ${a} l dầu, can thứ hai có ${b} l dầu. Cả hai can có ___ l dầu.`, c,
      baiGiai([["Cả hai can có số lít dầu là:", `${a} + ${b} = ${c} (l)`]], `${c} l dầu`), ["lít", "toán có lời văn"], "Gộp lại thì làm phép cộng.");
  }
};

/* ═════════════ Bài 19–23: Cộng, trừ có nhớ trong phạm vi 100 ═════════════ */

type Kieu = "cong21" | "cong22" | "tru21" | "tru22";

/** Có nhớ: hàng đơn vị cộng lại ≥ 10 (tổng ≤ 100), hoặc đơn vị số bị trừ bé hơn đơn vị số trừ. */
function soCoNho(r: Rng, k: Kieu): [number, number] {
  return retry(() => {
    const a = int(r, 11, 99);
    const b = k.endsWith("21") ? int(r, 2, 9) : int(r, 11, 99);
    const [au, bu] = [a % 10, b % 10];
    if (k.startsWith("cong")) return au + bu >= 10 && a + b <= 100 ? [a, b] : null;
    return au < bu && a > b && (k.endsWith("21") || a - b >= 1) ? [a, b] : null;
  });
}

export const congTruCoNho = (k: Kieu): Generator => (r) => {
  const [a, b] = soCoNho(r, k);
  const cong = k.startsWith("cong");
  const v = cong ? a + b : a - b;
  if (chance(r, 0.3)) {
    const name = pick(r, NAMES);
    return cong
      ? fill(`Lớp 2A trồng được ${a} cây, lớp 2B trồng được ${b} cây. Cả hai lớp trồng được ___ cây.`, v,
        baiGiai([["Cả hai lớp trồng được số cây là:", `${a} + ${b} = ${v} (cây)`]], `${v} cây`), ["toán có lời văn", "phép cộng", "có nhớ"], "Gộp lại thì làm phép cộng.")
      : fill(`${name} có ${a} nhãn vở, ${name} cho bạn ${b} nhãn vở. ${name} còn lại ___ nhãn vở.`, v,
        baiGiai([[`${name} còn lại số nhãn vở là:`, `${a} - ${b} = ${v} (nhãn vở)`]], `${v} nhãn vở`), ["toán có lời văn", "phép trừ", "có nhớ"], "Cho đi thì làm phép trừ.");
  }
  const exp = cong
    ? `Đặt tính: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}, viết ${((a % 10) + (b % 10)) % 10} nhớ 1; cộng hàng chục rồi thêm 1. Kết quả: ${v}.`
    : `Đặt tính: ${a % 10} không trừ được ${b % 10}, lấy ${10 + (a % 10)} - ${b % 10} = ${10 + (a % 10) - (b % 10)}, viết ${10 + (a % 10) - (b % 10)} nhớ 1; ${b >= 10 ? `${Math.floor(b / 10)} thêm 1 bằng ${Math.floor(b / 10) + 1}, ` : "hàng chục bớt đi 1, "}kết quả: ${v}.`;
  return { ...fill(`${a} ${cong ? "+" : "-"} ${b} = ___`, v, exp, [cong ? "phép cộng" : "phép trừ", "có nhớ", "phạm vi 100"], "Đặt tính rồi tính từ phải sang trái, nhớ 1 sang hàng chục."),
    difficulty: k.endsWith("22") ? "hard" : "medium" };
};

/* ═════════════ Bài 25: Điểm, đoạn thẳng ═════════════ */

export const doanThang: Generator = (r) => {
  const n = int(r, 3, 5);
  const letters = ["A", "B", "C", "D", "E"].slice(0, n);
  const gaps = Array.from({ length: n - 1 }, () => int(r, 2, 3));
  const pos = gaps.reduce<number[]>((acc, g) => [...acc, acc[acc.length - 1] + g], [0]);
  const image = pointsOnLineSvg(letters.map((label, i) => ({ label, pos: pos[i] })));
  switch (pick(r, ["dem", "dem", "giua", "co"] as const)) {
    case "dem": {
      const v = (n * (n - 1)) / 2;
      return { type: "multiple_choice", difficulty: "medium", tags: ["đoạn thẳng", "hình vẽ"],
        question: `Hình bên có ${n} điểm cùng nằm trên một đường thẳng. Có bao nhiêu đoạn thẳng có hai đầu là hai trong các điểm đó?`, image,
        ...mcOptions(r, String(v), [n - 1, n, v + 1, v - 1, v + 2].filter((x) => x > 0 && x !== v).map(String)),
        explanation: `Đếm các đoạn bắt đầu từ ${letters[0]}: ${n - 1} đoạn, rồi từ ${letters[1]}: ${n - 2} đoạn… Tất cả: ${range(1, n - 1).reverse().join(" + ")} = ${v} đoạn thẳng.`,
        hint: "Đếm lần lượt các đoạn bắt đầu từ từng điểm, không đếm lặp." };
    }
    case "giua": {
      const i = int(r, 1, n - 2), j = int(r, 0, i - 1), k = int(r, i + 1, n - 1);
      const ans = letters[i];
      return { type: "multiple_choice", difficulty: "easy", tags: ["ba điểm thẳng hàng", "hình vẽ"],
        question: `Ba điểm ${letters[j]}, ${letters[i]}, ${letters[k]} thẳng hàng (như hình bên). Điểm nào nằm giữa hai điểm còn lại?`, image,
        ...fixedOptions([letters[j], letters[i], letters[k]].map((l) => `Điểm ${l}`), `Điểm ${ans}`),
        explanation: `Đi từ ${letters[j]} đến ${letters[k]} phải qua ${ans}, nên ${ans} nằm giữa ${letters[j]} và ${letters[k]}.`,
        hint: "Điểm ở giữa nằm giữa hai điểm kia trên cùng một đường thẳng." };
    }
    case "co": {
      const i = int(r, 0, n - 2), j = int(r, i + 1, n - 1);
      const correct = `Đoạn thẳng ${letters[i]}${letters[j]}`;
      const wrong = ["M", "N", "P"].map((x) => `Đoạn thẳng ${letters[i]}${x}`).concat(`Đoạn thẳng ${letters[j]}Q`);
      return { type: "multiple_choice", difficulty: "easy", tags: ["đoạn thẳng", "hình vẽ"],
        question: "Đoạn thẳng nào có hai đầu là hai điểm trong hình bên?", image,
        ...mcOptions(r, correct, wrong),
        explanation: `Hình bên có các điểm ${letters.join(", ")}. Chỉ ${correct.toLowerCase()} có cả hai đầu là điểm trong hình.`,
        hint: "Xem tên hai đầu đoạn thẳng có trong hình không." };
    }
  }
};

/* ═════════════ Bài 29: Ngày – giờ, giờ – phút ═════════════ */

export const gioPhut: Generator = (r) => {
  switch (pick(r, ["ngay", "gio", "chieu", "chieuMc", "sau", "khoang"] as const)) {
    case "ngay": return fill("1 ngày có ___ giờ.", 24, "Một ngày có 24 giờ, tính từ 12 giờ đêm hôm trước đến 12 giờ đêm hôm sau.", ["ngày giờ"], "Kim giờ quay hai vòng trong một ngày.");
    case "gio": return fill("1 giờ = ___ phút", 60, "Kim phút quay đúng một vòng là 1 giờ = 60 phút.", ["giờ phút"], "Kim phút quay một vòng.");
    case "chieu": {
      // Bỏ 17, 18 giờ: lúc đó người ta gọi cả "chiều" lẫn "tối".
      const toi = chance(r, 0.5), h = toi ? int(r, 7, 11) : int(r, 1, 4);
      return fill(`${h} giờ ${toi ? "tối" : "chiều"} còn gọi là ___ giờ.`, h + 12, `Buổi ${toi ? "tối" : "chiều"} cộng thêm 12: ${h} + 12 = ${h + 12} (giờ).`,
        ["ngày giờ"], "Giờ buổi chiều, buổi tối thì cộng thêm 12.");
    }
    case "chieuMc": {
      const H = pick(r, [13, 14, 15, 16, 19, 20, 21, 22, 23]), h = H - 12, buoi = H <= 16 ? "chiều" : "tối";
      return { type: "multiple_choice", difficulty: "medium", tags: ["ngày giờ"],
        question: `${H} giờ còn gọi là:`,
        ...mcOptions(r, `${h} giờ ${buoi}`, [`${h} giờ sáng`, `${h === 11 ? 9 : h + 1} giờ ${buoi}`, `${h === 1 ? 3 : h - 1} giờ ${buoi}`, `${h + 2 > 11 ? h - 2 : h + 2} giờ ${buoi}`]),
        explanation: `${H} - 12 = ${h}, nên ${H} giờ là ${h} giờ ${buoi}.`, hint: "Lấy số giờ trừ đi 12." };
    }
    case "sau": {
      const h = int(r, 6, 18), d = int(r, 1, 4);
      return fill(`Bây giờ là ${h} giờ. Sau ${d} giờ nữa là ___ giờ.`, h + d, `${h} + ${d} = ${h + d} (giờ).`, ["ngày giờ"], "Đếm thêm số giờ.");
    }
    case "khoang": {
      const h = int(r, 7, 14), d = int(r, 1, 5);
      return fill(`Từ ${h} giờ đến ${h + d} giờ là ___ giờ.`, d, `${h + d} - ${h} = ${d} (giờ).`, ["ngày giờ"], "Đếm từ giờ đầu đến giờ sau.");
    }
  }
};

/* ═════════════ Bài 30: Ngày – tháng ═════════════ */

const DAYS_IN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const ngayThang2: Generator = (r) => {
  switch (pick(r, ["thang", "thang", "ngayKia", "tuanSau"] as const)) {
    case "thang": {
      const m = pick(r, [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      return { type: "multiple_choice", difficulty: "medium", tags: ["ngày tháng"],
        question: `Tháng ${m} có bao nhiêu ngày?`, ...fixedOptions(["28 ngày", "30 ngày", "31 ngày"], `${DAYS_IN[m - 1]} ngày`),
        explanation: `Xem tờ lịch tháng ${m}: ngày cuối cùng là ngày ${DAYS_IN[m - 1]}, nên tháng ${m} có ${DAYS_IN[m - 1]} ngày.`,
        hint: "Đếm theo nắm tay: đốt lồi là tháng có 31 ngày." };
    }
    case "ngayKia": {
      const m = int(r, 1, 12), d = int(r, 1, 26);
      return fill(`Hôm nay là ngày ${d} tháng ${m}. Ngày kia là ngày ___ tháng ${m}.`, d + 2, `Ngày mai là ngày ${d + 1}, ngày kia là ngày ${d + 2}.`, ["ngày tháng"], "Ngày kia là sau hôm nay hai ngày.");
    }
    case "tuanSau": {
      const d = int(r, 1, 21), m = int(r, 1, 12);
      return fill(`Thứ Hai tuần này là ngày ${d} tháng ${m}. Thứ Hai tuần sau là ngày ___ tháng ${m}.`, d + 7, `Một tuần có 7 ngày: ${d} + 7 = ${d + 7}.`, ["ngày tháng"], "Một tuần có 7 ngày.");
    }
  }
};

/* ═════════════ Bài 37, 38, 41, 42: phép nhân, phép chia, tên gọi thành phần ═════════════ */

export const phepNhan: Generator = (r) => {
  const k = int(r, 2, 5), n = int(r, 2, 5), terms = Array(n).fill(k).join(" + ");
  switch (pick(r, ["tong", "tongMc", "nhom", "doc"] as const)) {
    case "tong": return fill(`Viết phép nhân: ${terms} = ${k} × ___`, n, `${k} được lấy ${n} lần nên ${terms} = ${k} × ${n}.`, ["phép nhân"], `Đếm xem ${k} được lấy mấy lần.`);
    case "tongMc": {
      const wrong = [[k, "+", n, k + n], [n, "+", n, 2 * n], [k, "×", n + 1, k * (n + 1)], [k + 1, "×", n, (k + 1) * n], [k, "×", k, k * k], [k, "×", n + 2, k * (n + 2)], [k + 1, "+", n, k + 1 + n]]
        .filter((w) => w[3] !== k * n).map((w) => `${w[0]} ${w[1]} ${w[2]}`);
      return { type: "multiple_choice", difficulty: "easy", tags: ["phép nhân"],
        question: `Tổng ${terms} viết thành phép nhân là:`, ...mcOptions(r, `${k} × ${n}`, wrong),
        explanation: `${k} được lấy ${n} lần: ${terms} = ${k} × ${n}.`, hint: `${k} được lấy mấy lần?` };
    }
    case "nhom": {
      const t = pick(r, ["quả cam", "cái bánh", "bông hoa", "viên bi"]), box = pick(r, ["đĩa", "lọ", "túi"]);
      return fill(`Có ${n} cái ${box}, mỗi ${box} có ${k} ${t}. Có tất cả ___ ${t}.`, k * n,
        baiGiai([[`Có tất cả số ${t} là:`, `${k} × ${n} = ${k * n} (${t})`]], `${k * n} ${t}`), ["phép nhân", "toán có lời văn"], "Các nhóm bằng nhau thì dùng phép nhân.");
    }
    case "doc": return { type: "multiple_choice", difficulty: "easy", tags: ["phép nhân"],
      question: `Phép tính ${k} × ${n} đọc là:`,
      ...mcOptions(r, `${k} nhân ${n}`, [`${k} cộng ${n}`, `${k} trừ ${n}`, `${k} chia ${n}`]),
      explanation: `Dấu × đọc là "nhân": ${k} × ${n} đọc là ${k} nhân ${n}.`, hint: "Dấu × đọc là nhân." };
  }
};

export const tenGoi = (op: "congTru" | "nhan" | "chia"): Generator => (r) => {
  const ask = (q: string, opts: string[], ans: string, exp: string) => ({
    type: "multiple_choice" as const, difficulty: "easy" as const, tags: ["tên gọi thành phần"], question: q,
    ...fixedOptions(opts, ans), explanation: exp, hint: "Nhớ tên gọi các số trong phép tính.",
  });
  if (op === "congTru") {
    const [a, b] = retry(() => { const x = int(r, 10, 60), y = int(r, 2, 39); return x !== y && x % 10 + (y % 10) < 10 ? [x, y] : null; });
    if (chance(r, 0.5)) {
      const t = pick(r, [a, b, a + b]);
      return ask(`Trong phép cộng ${a} + ${b} = ${a + b}, số ${t} gọi là:`, ["Số hạng", "Tổng", "Số trừ", "Hiệu"], t === a + b ? "Tổng" : "Số hạng",
        `${a} và ${b} là số hạng, ${a + b} là tổng.`);
    }
    const t = pick(r, [a + b, b, a]);
    return ask(`Trong phép trừ ${a + b} - ${b} = ${a}, số ${t} gọi là:`, ["Số bị trừ", "Số trừ", "Hiệu", "Tổng"], t === a + b ? "Số bị trừ" : t === b ? "Số trừ" : "Hiệu",
      `${a + b} là số bị trừ, ${b} là số trừ, ${a} là hiệu.`);
  }
  const k = op === "nhan" ? int(r, 2, 5) : pick(r, [2, 5]), x = retry(() => { const v = int(r, 2, op === "nhan" ? 5 : 10); return v !== k ? v : null; }), p = k * x;
  if (op === "nhan") {
    if (chance(r, 0.5)) {
      const t = pick(r, [k, x, p]);
      return ask(`Trong phép nhân ${k} × ${x} = ${p}, số ${t} gọi là:`, ["Thừa số", "Tích", "Số hạng", "Thương"], t === p ? "Tích" : "Thừa số",
        `${k} và ${x} là thừa số, ${p} là tích.`);
    }
    return chance(r, 0.5)
      ? fill(`Hai thừa số là ${k} và ${x}. Tích là ___`, p, `Tích = ${k} × ${x} = ${Array(x).fill(k).join(" + ")} = ${p}.`, ["thừa số", "tích"], `Tính ${k} × ${x}.`)
      : fill(`Viết phép nhân có thừa số thứ nhất là ${k}, thừa số thứ hai là ${x}: ${k} × ${x} = ___`, p, `${k} × ${x} = ${Array(x).fill(k).join(" + ")} = ${p}.`, ["thừa số", "tích"], `${k} được lấy ${x} lần.`);
  }
  if (chance(r, 0.5)) {
    const t = pick(r, [p, k, x]);
    return ask(`Trong phép chia ${p} : ${k} = ${x}, số ${t} gọi là:`, ["Số bị chia", "Số chia", "Thương", "Tích"], t === p ? "Số bị chia" : t === k ? "Số chia" : "Thương",
      `${p} là số bị chia, ${k} là số chia, ${x} là thương.`);
  }
  return fill(`Số bị chia là ${p}, số chia là ${k}. Thương là ___`, x, `Thương = ${p} : ${k} = ${x}, vì ${k} × ${x} = ${p}.`, ["số bị chia", "thương"], `${k} nhân mấy bằng ${p}?`);
};

export const phepChia = (ks: number[], maxX: number): Generator => (r) => {
  const k = pick(r, ks), x = int(r, 2, maxX), p = k * x;
  const t = pick(r, ["cái kẹo", "quả cam", "viên bi", "quyển vở"]), box = pick(r, ["đĩa", "hộp", "túi", "rổ"]);
  switch (pick(r, ["deu", "nhom", "tuNhan", "tinh"] as const)) {
    case "deu": return fill(`Chia đều ${p} ${t} vào ${k} ${box}. Mỗi ${box} có ___ ${t}.`, x, baiGiai([[`Mỗi ${box} có số ${t} là:`, `${p} : ${k} = ${x} (${t})`]], `${x} ${t}`), ["phép chia", "toán có lời văn"], "Chia đều thì dùng phép chia.");
    case "nhom": return fill(`Có ${p} ${t}, xếp vào các ${box}, mỗi ${box} ${k} ${t}. Xếp được ___ ${box}.`, x, baiGiai([[`Xếp được số ${box} là:`, `${p} : ${k} = ${x} (${box})`]], `${x} ${box}`), ["phép chia", "toán có lời văn"], `Mỗi ${box} ${k} ${t}: ${p} chia cho ${k}.`);
    case "tuNhan": return fill(`Từ phép nhân ${k} × ${x} = ${p}, ta có phép chia: ${p} : ${k} = ___`, x, `Lấy tích chia cho một thừa số thì được thừa số kia: ${p} : ${k} = ${x}.`, ["phép chia"], "Phép chia ngược với phép nhân.");
    case "tinh": return fill(`${p} : ${k} = ___`, x, `Vì ${k} × ${x} = ${p} nên ${p} : ${k} = ${x}.`, ["phép chia"], `${k} nhân mấy bằng ${p}?`);
  }
};

/* ═════════════ Bài 46: Khối trụ, khối cầu ═════════════ */

const KHOI = {
  "Khối cầu": ["quả bóng đá", "quả địa cầu", "viên bi", "quả bóng rổ", "quả bóng bàn"],
  "Khối trụ": ["lon nước ngọt", "cục pin", "khúc gỗ tròn", "ống nhựa", "lon sữa bột"],
  "Khối lập phương": ["con xúc xắc", "khối ru-bích"],
  "Khối hộp chữ nhật": ["hộp phấn", "viên gạch", "bao diêm"],
} as const;
type Khoi = keyof typeof KHOI;
const KHOI_NAMES = Object.keys(KHOI) as Khoi[];

export const khoiTruCau: Generator = (r) => {
  const target = pick(r, ["Khối cầu", "Khối trụ"] as const);
  switch (pick(r, ["vat", "vat", "chon", "dac"] as const)) {
    case "vat": {
      const v = pick(r, KHOI[target]);
      return { type: "multiple_choice", difficulty: "easy", tags: ["khối hình"],
        question: `${cap(v)} có dạng khối gì?`, ...fixedOptions(KHOI_NAMES, target),
        explanation: `${cap(v)} có dạng ${target.toLowerCase()}.`, hint: "Hình dung đồ vật lăn được hay không, có mặt phẳng hình tròn không." };
    }
    case "chon": {
      const correct = pick(r, KHOI[target]);
      const wrong = shuffle(r, KHOI_NAMES.filter((k) => k !== target).flatMap((k) => [...KHOI[k]])).slice(0, 3);
      return { type: "multiple_choice", difficulty: "easy", tags: ["khối hình"],
        question: `Đồ vật nào dưới đây có dạng ${target.toLowerCase()}?`, ...mcOptions(r, cap(correct), wrong.map(cap)),
        explanation: `${cap(correct)} có dạng ${target.toLowerCase()}.`, hint: "Hình dung hình dạng của từng đồ vật." };
    }
    case "dac": return target === "Khối cầu"
      ? { type: "multiple_choice", difficulty: "medium", tags: ["khối hình"],
        question: "Khối nào không có mặt phẳng, lăn được về mọi phía?", ...fixedOptions(KHOI_NAMES, "Khối cầu"),
        explanation: "Khối cầu tròn đều, không có mặt phẳng nên lăn được về mọi phía.", hint: "Nghĩ đến quả bóng." }
      : { type: "multiple_choice", difficulty: "medium", tags: ["khối hình"],
        question: "Khối nào có hai mặt phẳng hình tròn ở hai đầu?", ...fixedOptions(KHOI_NAMES, "Khối trụ"),
        explanation: "Khối trụ (như lon nước ngọt) có hai mặt phẳng hình tròn ở hai đầu.", hint: "Nghĩ đến lon nước ngọt." };
  }
};

/* ═════════════ Bài 48–52: số trong phạm vi 1000 ═════════════ */

export const tramChucNghin: Generator = (r) => {
  const a = int(r, 1, 9);
  switch (pick(r, ["chucDv", "tramChuc", "dvChuc", "gomTram", "nghin"] as const)) {
    case "chucDv": return fill(`${a} chục = ___ đơn vị`, a * 10, `1 chục = 10 đơn vị nên ${a} chục = ${a * 10} đơn vị.`, ["đơn vị, chục, trăm"], "1 chục = 10 đơn vị.");
    case "tramChuc": return fill(`${a} trăm = ___ chục`, a * 10, `1 trăm = 10 chục nên ${a} trăm = ${a * 10} chục.`, ["đơn vị, chục, trăm"], "1 trăm = 10 chục.");
    case "dvChuc": return fill(`${a * 10} đơn vị = ___ chục`, a, `10 đơn vị = 1 chục nên ${a * 10} đơn vị = ${a} chục.`, ["đơn vị, chục, trăm"], "10 đơn vị = 1 chục.");
    case "gomTram": return fill(`Số ${a * 100} gồm ___ trăm.`, a, `${a * 100} = ${a} trăm.`, ["đơn vị, chục, trăm"], "Đếm theo trăm: 100, 200, 300…");
    case "nghin": return { type: "multiple_choice", difficulty: "easy", tags: ["đơn vị, chục, trăm, nghìn"],
      question: "10 trăm bằng:", ...fixedOptions(["1 chục", "1 trăm", "1 nghìn"], "1 nghìn"),
      explanation: "10 trăm = 1 nghìn, viết là 1000.", hint: "Đếm theo trăm đến 1000." };
  }
};

export const tronTramChuc: Generator = (r) => {
  switch (pick(r, ["sauChuc", "sauTram", "day", "chonTram", "chonChuc"] as const)) {
    case "sauChuc": {
      const n = int(r, 11, 98) * 10, up = chance(r, 0.5);
      return fill(`Số tròn chục liền ${up ? "sau" : "trước"} ${n} là ___`, up ? n + 10 : n - 10,
        `Các số tròn chục hơn kém nhau 10: ${n} ${up ? "+" : "-"} 10 = ${up ? n + 10 : n - 10}.`, ["số tròn chục"], "Số tròn chục có chữ số hàng đơn vị là 0.");
    }
    case "sauTram": {
      const n = int(r, 2, 8) * 100, up = chance(r, 0.5);
      return fill(`Số tròn trăm liền ${up ? "sau" : "trước"} ${n} là ___`, up ? n + 100 : n - 100,
        `Các số tròn trăm hơn kém nhau 100: ${n} ${up ? "+" : "-"} 100 = ${up ? n + 100 : n - 100}.`, ["số tròn trăm"], "Số tròn trăm có hai chữ số tận cùng là 00.");
    }
    case "day": {
      const step = pick(r, [10, 100]), start = step === 10 ? int(r, 10, 95) * 10 : int(r, 1, 5) * 100;
      const seq = range(0, 3).map((i) => start + i * step), hole = int(r, 1, 3);
      return fill(`Điền số: ${seq.map((x, i) => (i === hole ? "___" : x)).join(", ")}`, seq[hole],
        `Mỗi số hơn số đứng trước ${step}: ${seq[hole - 1]} + ${step} = ${seq[hole]}.`, ["số tròn chục, tròn trăm", "dãy số"], `Đếm thêm ${step}.`);
    }
    case "chonTram": {
      const c = int(r, 1, 9) * 100;
      const wrong = shuffle(r, [int(r, 11, 99) * 10, int(r, 101, 999), int(r, 1, 9) * 100 + int(r, 1, 9) * 10, int(r, 1, 9) * 101]).filter((x) => x % 100 !== 0);
      if (wrong.length < 3) return tronTramChuc(r);
      return { type: "multiple_choice", difficulty: "easy", tags: ["số tròn trăm"],
        question: "Số nào là số tròn trăm?", ...mcOptions(r, String(c), wrong.map(String)),
        explanation: `${c} có hai chữ số tận cùng là 00 nên là số tròn trăm.`, hint: "Số tròn trăm có hai chữ số tận cùng là 00." };
    }
    case "chonChuc": {
      const c = int(r, 11, 99) * 10;
      const wrong = shuffle(r, range(0, 5).map(() => int(r, 101, 999))).filter((x) => x % 10 !== 0);
      if (new Set(wrong).size < 3) return tronTramChuc(r);
      return { type: "multiple_choice", difficulty: "easy", tags: ["số tròn chục"],
        question: "Số nào là số tròn chục?", ...mcOptions(r, String(c), wrong.map(String)),
        explanation: `${c} có chữ số hàng đơn vị là 0 nên là số tròn chục.`, hint: "Số tròn chục có chữ số hàng đơn vị là 0." };
    }
  }
};

export const soSanhTron: Generator = (r) => {
  const tram = chance(r, 0.35);
  const one = () => (tram ? int(r, 1, 9) * 100 : int(r, 10, 99) * 10);
  if (chance(r, 0.6)) {
    const a = one(), b = chance(r, 0.15) ? a : one(), s = sign(a - b);
    return { type: "multiple_choice", difficulty: "easy", tags: ["so sánh", tram ? "số tròn trăm" : "số tròn chục"],
      question: `Chọn dấu thích hợp: ${a} ___ ${b}`, ...fixedOptions([">", "<", "="], s),
      explanation: a === b ? `Hai số bằng nhau: ${a} = ${b}.` : `So sánh chữ số hàng trăm, rồi đến hàng chục: ${a} ${s} ${b}.`,
      hint: "So sánh từ hàng trăm sang hàng chục." };
  }
  const set = new Set<number>();
  while (set.size < 4) set.add(one());
  const nums = [...set], big = chance(r, 0.5), ans = big ? Math.max(...nums) : Math.min(...nums);
  return { type: "multiple_choice", difficulty: "medium", tags: ["so sánh", tram ? "số tròn trăm" : "số tròn chục"],
    question: `Số ${big ? "lớn" : "bé"} nhất trong các số ${nums.join(", ")} là:`, ...mcOptions(r, String(ans), nums.filter((x) => x !== ans).map(String)),
    explanation: `Xếp từ bé đến lớn: ${[...nums].sort((x, y) => x - y).join(" < ")}.`, hint: "So sánh chữ số hàng trăm trước." };
};

const DIGIT = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** Đọc số 100–999 theo cách đọc ở lớp 2: "linh", "mười", "mươi", "mốt", "tư", "lăm". */
export function docSo3(n: number): string {
  const [h, t, u] = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
  const head = `${DIGIT[h]} trăm`;
  if (t === 0) return u === 0 ? head : `${head} linh ${DIGIT[u]}`;
  if (t === 1) return `${head} mười${u === 0 ? "" : ` ${u === 5 ? "lăm" : DIGIT[u]}`}`;
  return `${head} ${DIGIT[t]} mươi${u === 0 ? "" : ` ${u === 1 ? "mốt" : u === 4 ? "tư" : u === 5 ? "lăm" : DIGIT[u]}`}`;
}

/** Số dễ nhầm với n: đảo chữ số, lệch một hàng, chữ số 0 đổi chỗ. */
function nham3(n: number): number[] {
  const [h, t, u] = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
  return [h * 100 + u * 10 + t, t * 100 + h * 10 + u, u * 100 + t * 10 + h, n + 10, n - 10, n + 100, n - 100, n + 1, n - 1, n - 20, n + 2]
    .filter((x) => x >= 100 && x <= 999 && x !== n);
}

export const docViet3: Generator = (r) => {
  const n = retry(() => { const x = int(r, 101, 999); return x % 100 !== 0 ? x : null; });
  if (chance(r, 0.5))
    return { type: "multiple_choice", difficulty: "medium", tags: ["số có ba chữ số", "viết số"],
      question: `Số “${docSo3(n)}” viết là:`, ...mcOptions(r, String(n), nham3(n).map(String)),
      explanation: `${cap(docSo3(n))}: ${Math.floor(n / 100)} trăm, ${Math.floor(n / 10) % 10} chục, ${n % 10} đơn vị, viết là ${n}.`,
      hint: "Viết lần lượt chữ số hàng trăm, hàng chục, hàng đơn vị." };
  return { type: "multiple_choice", difficulty: "medium", tags: ["số có ba chữ số", "đọc số"],
    question: `Số ${n} đọc là:`, ...mcOptions(r, cap(docSo3(n)), nham3(n).map((x) => cap(docSo3(x)))),
    explanation: `${n} gồm ${Math.floor(n / 100)} trăm, ${Math.floor(n / 10) % 10} chục, ${n % 10} đơn vị: đọc là “${docSo3(n)}”.`,
    hint: "Đọc lần lượt từ hàng trăm." };
};

export const vietTong: Generator = (r) => {
  const n = retry(() => { const x = int(r, 101, 999); return [Math.floor(x / 100), Math.floor(x / 10) % 10, x % 10].filter(Boolean).length >= 2 ? x : null; });
  const [h, t, u] = [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10];
  const parts = [h * 100, t * 10, u].filter(Boolean);
  if (chance(r, 0.5) && t && u) {
    const hide = int(r, 0, 2);
    const shown = [h * 100, t * 10, u].map((v, i) => (i === hide ? "___" : String(v))).join(" + ");
    return fill(`${n} = ${shown}`, [h * 100, t * 10, u][hide], `${n} gồm ${h} trăm, ${t} chục, ${u} đơn vị: ${n} = ${h * 100} + ${t * 10} + ${u}.`,
      ["viết số thành tổng"], "Tách số thành trăm, chục, đơn vị.");
  }
  const digs = [[h, 2], [t, 1], [u, 0]].filter(([d]) => d) as [number, number][];
  const str = (ps: [number, number][]) => [...ps].sort((x, y) => y[1] - x[1]).map(([d, p]) => String(d * 10 ** p)).join(" + ");
  const cands: string[] = [];
  digs.forEach(([d, p], i) => [p - 1, p + 1].filter((q) => q >= 0 && q <= 2).forEach((q) => {
    const ps = digs.map((x, j) => (j === i ? [d, q] : x) as [number, number]);
    if (ps.reduce((s, [dd, pp]) => s + dd * 10 ** pp, 0) !== n) cands.push(str(ps));
  }));
  cands.push(`${h} + ${t} + ${u}`);
  return { type: "multiple_choice", difficulty: "medium", tags: ["viết số thành tổng"],
    question: `Số ${n} viết thành tổng các trăm, chục, đơn vị là:`, ...mcOptions(r, parts.join(" + "), cands),
    explanation: `${n} gồm ${h} trăm, ${t} chục, ${u} đơn vị: ${n} = ${parts.join(" + ")}.`, hint: "Chữ số hàng trăm có giá trị bằng số trăm × 100." };
};

/* ═════════════ Bài 55: Đề-xi-mét, mét, ki-lô-mét ═════════════ */

const DO_DAI: [string, number, "cm" | "dm" | "m" | "km"][] = [
  ["Chiếc bút chì dài khoảng", 15, "cm"], ["Cục tẩy dài khoảng", 4, "cm"], ["Quyển vở dài khoảng", 24, "cm"],
  ["Gang tay của mẹ dài khoảng", 2, "dm"], ["Chiếc thước kẻ dài", 3, "dm"], ["Chiếc đũa dài khoảng", 2, "dm"],
  ["Phòng học dài khoảng", 8, "m"], ["Cột cờ cao khoảng", 10, "m"], ["Bảng lớp học dài khoảng", 3, "m"],
  ["Quãng đường từ Hà Nội đến Hải Phòng dài khoảng", 100, "km"], ["Quãng đường từ nhà bà ngoại đến thị trấn dài khoảng", 5, "km"],
];
const DOI: [string, string, number][] = [["m", "dm", 10], ["dm", "cm", 10], ["m", "cm", 100], ["km", "m", 1000]];

export const donViDai: Generator = (r) => {
  if (chance(r, 0.5)) {
    const [what, v, u] = pick(r, DO_DAI);
    return { type: "multiple_choice", difficulty: "easy", tags: ["đơn vị đo độ dài"],
      question: `Chọn đơn vị thích hợp: ${what} ${v} …`, ...fixedOptions(["cm", "dm", "m", "km"], u),
      explanation: `${what} ${v} ${u}.`, hint: "1 dm bằng một gang tay em, 1 m bằng một sải tay người lớn." };
  }
  const [big, small, f] = pick(r, DOI), a = int(r, 1, 9);
  const b = pick(r, [a * f, a * f + pick(r, [1, 2, 5]) * (f / 10 || 1), a * f - pick(r, [1, 2, 5]) * (f / 10 || 1)]);
  const s = sign(a * f - b);
  return { type: "multiple_choice", difficulty: "medium", tags: ["đơn vị đo độ dài", "so sánh"],
    question: `Chọn dấu thích hợp: ${a} ${big} ___ ${b} ${small}`, ...fixedOptions([">", "<", "="], s),
    explanation: `${a} ${big} = ${a * f} ${small}; ${a * f} ${s} ${b} nên ${a} ${big} ${s} ${b} ${small}.`, hint: "Đổi về cùng một đơn vị rồi so sánh." };
};

/* ═════════════ Bài 59–62: Cộng, trừ trong phạm vi 1000 ═════════════ */

const digits = (n: number) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100)];

/** Số lần nhớ khi cộng (op "+") hoặc mượn khi trừ (op "-"). */
export function soLanNho(a: number, b: number, op: "+" | "-"): number {
  const [x, y] = [digits(a), digits(b)];
  let carry = 0, count = 0;
  for (let i = 0; i < 3; i++) {
    const v = op === "+" ? x[i] + y[i] + carry : x[i] - y[i] - carry;
    carry = op === "+" ? (v >= 10 ? 1 : 0) : (v < 0 ? 1 : 0);
    count += carry;
  }
  return count;
}

export const phepTinh1000 = (op: "+" | "-", nho: boolean): Generator => (r) => {
  const [a, b] = retry(() => {
    const x = int(r, 100, 999), y = chance(r, 0.25) ? int(r, 10, 99) : int(r, 100, 899);
    if (op === "+" ? x + y > 999 : x <= y) return null;
    return soLanNho(x, y, op) === (nho ? 1 : 0) ? [x, y] : null;
  });
  const v = op === "+" ? a + b : a - b;
  const tag = [op === "+" ? "phép cộng" : "phép trừ", nho ? "có nhớ" : "không nhớ", "phạm vi 1000"];
  if (chance(r, 0.25))
    return op === "+"
      ? fill(`Trường em có ${a} học sinh nam và ${b} học sinh nữ. Trường em có tất cả ___ học sinh.`, v, baiGiai([["Trường em có tất cả số học sinh là:", `${a} + ${b} = ${v} (học sinh)`]], `${v} học sinh`), ["toán có lời văn", ...tag], "Gộp lại thì làm phép cộng.")
      : fill(`Cửa hàng có ${a} kg gạo, đã bán ${b} kg gạo. Cửa hàng còn lại ___ kg gạo.`, v, baiGiai([["Cửa hàng còn lại số ki-lô-gam gạo là:", `${a} - ${b} = ${v} (kg)`]], `${v} kg gạo`), ["toán có lời văn", ...tag], "Bán đi thì làm phép trừ.");
  return fill(`${a} ${op} ${b} = ___`, v,
    `Đặt tính thẳng cột, ${op === "+" ? "cộng" : "trừ"} từ hàng đơn vị sang hàng chục rồi hàng trăm${nho ? ", nhớ 1 sang hàng bên trái khi cần" : ""}: ${a} ${op} ${b} = ${v}.`,
    tag, nho ? "Nhớ 1 sang hàng bên trái." : "Viết các chữ số cùng hàng thẳng cột.");
};

/* ═════════════ Bài 64, 65: kiểm đếm số liệu, biểu đồ tranh ═════════════ */

export const kiemDem: Generator = (r) => {
  const kinds = shuffle(r, EMOJI).slice(0, 3);
  const counts = retry(() => { const c = kinds.map(() => int(r, 2, 7)); return new Set(c).size === 3 ? c : null; });
  const list = shuffle(r, kinds.flatMap((k, i) => Array(counts[i]).fill(k.e))).join("");
  const i = int(r, 0, 2);
  switch (pick(r, ["dem", "dem", "nhat", "hon"] as const)) {
    case "dem": return fill(`Đếm rồi trả lời: ${list}  Có ___ ${kinds[i].n}.`, counts[i], `Đánh dấu từng ${kinds[i].n} khi đếm: có ${counts[i]} ${kinds[i].n}.`, ["kiểm đếm"], "Đếm xong hình nào thì đánh dấu hình đó.");
    case "nhat": {
      const most = chance(r, 0.5), j = counts.indexOf(most ? Math.max(...counts) : Math.min(...counts));
      return { type: "multiple_choice", difficulty: "medium", tags: ["kiểm đếm"],
        question: `Đếm rồi trả lời: ${list}  Loại nào có ${most ? "nhiều" : "ít"} nhất?`, ...fixedOptions(kinds.map((k) => cap(k.n)), cap(kinds[j].n)),
        explanation: `Có ${kinds.map((k, x) => `${counts[x]} ${k.n}`).join(", ")}. ${cap(kinds[j].n)} ${most ? "nhiều" : "ít"} nhất.`, hint: "Đếm từng loại rồi so sánh." };
    }
    case "hon": {
      const [x, y] = counts[0] > counts[1] ? [0, 1] : [1, 0];
      return fill(`Đếm rồi trả lời: ${list}  Số ${kinds[x].n} nhiều hơn số ${kinds[y].n} là ___`, counts[x] - counts[y],
        `Có ${counts[x]} ${kinds[x].n} và ${counts[y]} ${kinds[y].n}: ${counts[x]} - ${counts[y]} = ${counts[x] - counts[y]}.`, ["kiểm đếm"], "Đếm hai loại rồi lấy số lớn trừ số bé.");
    }
  }
};

const TRANH: { icon: PictoIcon; n: string; v: string }[] = [
  { icon: "hoa", n: "bông hoa", v: "hái được" }, { icon: "sao", n: "ngôi sao", v: "được thưởng" },
  { icon: "tao", n: "quả táo", v: "hái được" }, { icon: "ca", n: "con cá", v: "câu được" },
];

export const bieuDoTranh: Generator = (r) => {
  const pic = pick(r, TRANH), names = shuffle(r, NAMES).slice(0, int(r, 3, 4));
  const counts = retry(() => { const c = names.map(() => int(r, 1, 8)); return new Set(c).size === c.length ? c : null; });
  const image = pictographSvg(names.map((label, i) => ({ label, n: counts[i] })), pic.icon);
  const lead = `Biểu đồ tranh bên cho biết số ${pic.n} ${names.join(", ")} ${pic.v} (mỗi hình là 1 ${pic.n}).`;
  const i = int(r, 0, names.length - 1), j = (i + 1) % names.length;
  const tags = ["biểu đồ tranh", "hình vẽ"];
  switch (pick(r, ["doc", "nhat", "hon", "tong"] as const)) {
    case "doc": return fill(`${lead} ${names[i]} ${pic.v} ___ ${pic.n}.`, counts[i], `Đếm hình ở hàng của ${names[i]}: ${counts[i]} ${pic.n}.`, tags, "Đếm số hình ở hàng của bạn đó.", image);
    case "nhat": {
      const most = chance(r, 0.5), k = counts.indexOf(most ? Math.max(...counts) : Math.min(...counts));
      return { type: "multiple_choice", difficulty: "medium", tags, image,
        question: `${lead} Bạn nào ${pic.v} ${most ? "nhiều" : "ít"} ${pic.n} nhất?`, ...fixedOptions(names, names[k]),
        explanation: `${names.map((nm, x) => `${nm}: ${counts[x]}`).join(", ")}. ${names[k]} ${most ? "nhiều" : "ít"} nhất.`, hint: "Hàng nào dài nhất thì nhiều nhất." };
    }
    case "hon": {
      const [x, y] = counts[i] > counts[j] ? [i, j] : [j, i];
      return fill(`${lead} ${names[x]} ${pic.v} nhiều hơn ${names[y]} ___ ${pic.n}.`, counts[x] - counts[y],
        `${counts[x]} - ${counts[y]} = ${counts[x] - counts[y]} (${pic.n}).`, [...tags, "hơn kém"], "Lấy số lớn trừ số bé.", image);
    }
    case "tong": return fill(`${lead} Cả ${names.length} bạn ${pic.v} tất cả ___ ${pic.n}.`, counts.reduce((s, x) => s + x, 0),
      `${counts.join(" + ")} = ${counts.reduce((s, x) => s + x, 0)} (${pic.n}).`, tags, "Cộng số hình ở tất cả các hàng.", image);
  }
};

export const KNTT2 = {
  tiaSo, honKem, them20: loiVan20("them"), nhieuIt20: loiVan20("nhieu"), kiLoGam, lit,
  cong21: congTruCoNho("cong21"), cong22: congTruCoNho("cong22"), tru21: congTruCoNho("tru21"), tru22: congTruCoNho("tru22"),
  doanThang, gioPhut, ngayThang2, phepNhan,
  tenCongTru: tenGoi("congTru"), tenNhan: tenGoi("nhan"), tenChia: tenGoi("chia"),
  phepChia: phepChia([2, 5], 5), chia2: phepChia([2], 10), chia5: phepChia([5], 10),
  khoiTruCau, tramChucNghin, tronTramChuc, soSanhTron, docViet3, vietTong, donViDai,
  cong1000: phepTinh1000("+", false), cong1000Nho: phepTinh1000("+", true),
  tru1000: phepTinh1000("-", false), tru1000Nho: phepTinh1000("-", true),
  kiemDem, bieuDoTranh,
};
