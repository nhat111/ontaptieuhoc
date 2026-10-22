// lib/mathGen/kntt/lop5.ts — Toán 5 theo từng bài sách Kết nối tri thức (lib/sgk/books/toan5.ts):
// các dạng câu cho những bài mà lop5.ts, lop4.ts và các dạng có hình của đề in chưa phủ —
// nhận biết phân số thập phân; viết số thập phân từ các hàng; làm tròn số thập phân;
// ki-lô-mét vuông, héc-ta; tỉ số; tỉ lệ bản đồ; tìm giá trị phần trăm trong bài toán;
// thể tích đếm bằng hình lập phương nhỏ; đơn vị đo thể tích, lít; hình khai triển; chia số
// đo thời gian; sắp xếp số liệu; tỉ số của số lần lặp lại một sự kiện.
// Các generator cũ ở lop5.ts giữ nguyên để đề đã import và link đề đã chia sẻ không đổi.
// Số thập phân dùng kiểu Dec (số nguyên + số chữ số thập phân), không dùng float.
// scripts/sgk-toan-check.ts (recheck5) tính lại đáp án từ chữ trong đề.

import { type Generator, type Rng, int, pick, chance, shuffle, mcOptions, fixedOptions, blanks, retry, range, fmtInt, fmt, dec, mul } from "../core";
import { NAMES } from "../shared";

const fill = (question: string, answer: string, explanation: string, tags: string[], hint: string) => ({
  type: "fill_blank" as const, difficulty: "medium" as const, tags, question, ...blanks(answer), explanation, hint,
});
const mc = (question: string, opts: ReturnType<typeof mcOptions>, explanation: string, tags: string[], hint: string) => ({
  type: "multiple_choice" as const, difficulty: "medium" as const, tags, question, ...opts, explanation, hint,
});

/* ═════════════ Bài 4: Phân số thập phân ═════════════ */

export const phanSoTP: Generator = (r) => {
  const d = pick(r, [10, 100, 1000]), n = int(r, 1, d === 10 ? 9 : 99);
  const wrong = shuffle(r, [3, 4, 6, 7, 8, 12, 15, 20, 25, 40, 50, 200]).slice(0, 3).map((x) => `${int(r, 1, 9)}/${x}`);
  return mc("Phân số nào dưới đây là phân số thập phân?", mcOptions(r, `${n}/${fmtInt(d)}`, wrong),
    `Phân số thập phân là phân số có mẫu số là 10; 100; 1.000; … Chỉ có ${n}/${fmtInt(d)} có mẫu số ${fmtInt(d)}.`,
    ["phân số thập phân"], "Xem mẫu số có phải là 10; 100; 1.000; … không.");
};

/* ═════════════ Bài 10: Khái niệm số thập phân ═════════════ */

export const vietSTP: Generator = (r) => {
  const a = int(r, 0, 99), b = int(r, 1, 9), c = int(r, 1, 9);
  const kind = pick(r, ["muoi", "tram", "muoiTram"] as const);
  const [text, v]: [string, ReturnType<typeof dec>] = {
    muoi: [`${a} đơn vị và ${b} phần mười`, dec(a * 10 + b, 1)],
    tram: [`${a} đơn vị và ${c} phần trăm`, dec(a * 100 + c, 2)],
    muoiTram: [`${a} đơn vị, ${b} phần mười và ${c} phần trăm`, dec(a * 100 + b * 10 + c, 2)],
  }[kind] as [string, ReturnType<typeof dec>];
  return fill(`Số thập phân gồm ${text} viết là ___`, fmt(v),
    `Phần nguyên là ${a}; ${kind === "tram" ? "hàng phần mười là 0, " : ""}các chữ số sau dấu phẩy lần lượt là hàng phần mười, phần trăm: ${fmt(v)}.`,
    ["số thập phân", "viết số"], "Viết phần nguyên, dấu phẩy, rồi hàng phần mười, phần trăm.");
};

/* ═════════════ Bài 13: Làm tròn số thập phân ═════════════ */

const HANG_TRON = [{ q: 0, name: "hàng đơn vị" }, { q: 1, name: "hàng phần mười" }, { q: 2, name: "hàng phần trăm" }];

export const lamTronSTP: Generator = (r) => {
  const { q, name } = pick(r, HANG_TRON);
  const p = q + int(r, 1, 2);
  const n = retry(() => { const x = int(r, 10 ** p, 99 * 10 ** p); return x % 10 ? x : null; });
  const f = 10 ** (p - q);
  const down = Math.floor(n / f), up = down + 1, near = n % f >= f / 2 ? up : down;
  const show = (x: number, places: number) => fmt(dec(x, places), places);
  // Nhiễu: làm tròn sai chiều, làm tròn nhầm hàng, lệch một đơn vị của hàng đó.
  const cands = [down, up, near + 1, near - 1, near + 2].filter((x) => x >= 0).map((x) => show(x, q));
  cands.push(show(n, p)); // giữ nguyên, quên làm tròn
  if (q < 2 && p > q + 1) cands.push(show(Math.round(n / 10 ** (p - q - 1)), q + 1));
  if (q > 0) cands.push(show(Math.round(n / 10 ** (p - q + 1)), q - 1));
  return mc(`Làm tròn số ${show(n, p)} đến ${name} thì được số nào?`, mcOptions(r, show(near, q), cands),
    `Xét chữ số ngay sau ${name}: ${n % f >= f / 2 ? "từ 5 trở lên nên làm tròn lên" : "bé hơn 5 nên làm tròn xuống"}. Kết quả: ${show(near, q)}.`,
    ["làm tròn số thập phân"], "Chữ số ngay sau hàng cần làm tròn bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.");
};

/* ═════════════ Bài 15: Ki-lô-mét vuông, héc-ta ═════════════ */

export const kmHa: Generator = (r) => {
  const a = int(r, 2, 90);
  switch (pick(r, ["km2ha", "ha2m2", "ha2km2", "m22ha", "nuaHa"] as const)) {
    case "km2ha": return fill(`${a} km² = ___ ha`, fmtInt(a * 100), `1 km² = 100 ha nên ${a} km² = ${fmtInt(a * 100)} ha.`, ["ki-lô-mét vuông", "héc-ta"], "1 km² = 100 ha.");
    case "ha2m2": return fill(`${a} ha = ___ m²`, fmtInt(a * 10000), `1 ha = 10.000 m² nên ${a} ha = ${fmtInt(a * 10000)} m².`, ["héc-ta"], "1 ha = 10.000 m².");
    case "ha2km2": return fill(`${fmtInt(a * 100)} ha = ___ km²`, String(a), `100 ha = 1 km² nên ${fmtInt(a * 100)} ha = ${a} km².`, ["ki-lô-mét vuông", "héc-ta"], "100 ha = 1 km².");
    case "m22ha": return fill(`${fmtInt(a * 10000)} m² = ___ ha`, String(a), `10.000 m² = 1 ha nên ${fmtInt(a * 10000)} m² = ${a} ha.`, ["héc-ta"], "10.000 m² = 1 ha.");
    case "nuaHa": {
      const v = dec(int(r, 1, 9), 1);
      return fill(`${fmt(v)} ha = ___ m²`, fmt(mul(v, dec(10000))), `${fmt(v)} × 10.000 = ${fmt(mul(v, dec(10000)))} (m²).`, ["héc-ta", "số thập phân"], "1 ha = 10.000 m².");
    }
  }
};

/* ═════════════ Bài 36: Tỉ số, tỉ số phần trăm ═════════════ */

export const tiSo: Generator = (r) => {
  const a = int(r, 2, 30), b = retry(() => { const x = int(r, 2, 30); return x !== a ? x : null; });
  const opts = () => mcOptions(r, `${a} : ${b}`, [`${b} : ${a}`, `${a} : ${a + b}`, `${b} : ${a + b}`]);
  switch (pick(r, ["so", "loiVan", "phanTram", "phanTram"] as const)) {
    case "so": return mc(`Tỉ số của ${a} và ${b} là:`, opts(), `Tỉ số của ${a} và ${b} là ${a} : ${b} hay ${a}/${b}.`, ["tỉ số"], "Số nào nói trước thì viết trước.");
    case "loiVan": return mc(`Lớp 5A có ${a} bạn nam và ${b} bạn nữ. Tỉ số của số bạn nam và số bạn nữ là:`, opts(),
      `Số bạn nam : số bạn nữ = ${a} : ${b}.`, ["tỉ số"], "Số bạn nam viết trước, số bạn nữ viết sau.");
    case "phanTram": {
      const d = pick(r, [2, 4, 5, 10, 20, 25, 50, 100]), n = int(r, 1, d - 1);
      return fill(`Viết thành tỉ số phần trăm: ${n}/${d} = ___%`, String((n * 100) / d), `${n}/${d} = ${(n * 100) / d}/100 = ${(n * 100) / d}%.`, ["tỉ số phần trăm"], "Đưa về phân số có mẫu số 100.");
    }
  }
};

/* ═════════════ Bài 37: Tỉ lệ bản đồ ═════════════ */

export const tiLeBanDo: Generator = (r) => {
  const S = pick(r, [500, 1000, 2000, 10000, 50000, 100000, 1000000]), L = int(r, 2, 15);
  const real = L * S; // cm
  const [rv, ru] = real % 100000 === 0 ? [real / 100000, "km"] : [real / 100, "m"];
  const tl = `1 : ${fmtInt(S)}`;
  return chance(r, 0.6)
    ? fill(`Trên bản đồ tỉ lệ ${tl}, một đoạn đường dài ${L} cm. Độ dài thật của đoạn đường đó là ___ ${ru}.`, fmtInt(rv),
      `Độ dài thật: ${L} × ${fmtInt(S)} = ${fmtInt(real)} (cm) = ${fmtInt(rv)} ${ru}.`, ["tỉ lệ bản đồ"], `1 cm trên bản đồ ứng với ${fmtInt(S)} cm ngoài thực tế.`)
    : fill(`Quãng đường thật dài ${fmtInt(rv)} ${ru}. Trên bản đồ tỉ lệ ${tl}, quãng đường đó dài ___ cm.`, String(L),
      `Đổi ${fmtInt(rv)} ${ru} = ${fmtInt(real)} cm. Độ dài trên bản đồ: ${fmtInt(real)} : ${fmtInt(S)} = ${L} (cm).`, ["tỉ lệ bản đồ"], "Đổi độ dài thật ra xăng-ti-mét rồi chia cho số ở tỉ lệ.");
};

/* ═════════════ Bài 41: Tìm giá trị phần trăm của một số ═════════════ */

export const phanTramLoiVan: Generator = (r) => {
  const [p, base] = retry(() => {
    const p = pick(r, [5, 10, 15, 20, 25, 30, 40, 45, 60, 75, 80]), b = int(r, 4, 60) * 20;
    return (p * b) % 100 === 0 ? [p, b] : null;
  });
  const v = (p * base) / 100;
  const [q, u] = pick(r, [
    [`Một cửa hàng có ${fmtInt(base)} kg gạo, đã bán ${p}% số gạo đó. Cửa hàng đã bán ___ kg gạo.`, "kg"],
    [`Một trường có ${fmtInt(base)} học sinh, trong đó ${p}% số học sinh tham gia câu lạc bộ thể thao. Số học sinh tham gia câu lạc bộ là ___`, "học sinh"],
    [`Một mảnh vườn có diện tích ${fmtInt(base)} m², người ta dùng ${p}% diện tích để trồng rau. Diện tích trồng rau là ___ m².`, "m²"],
  ] as const);
  return fill(q, fmtInt(v), `${p}% của ${fmtInt(base)} là: ${fmtInt(base)} × ${p} : 100 = ${fmtInt(v)} (${u}).`, ["tỉ số phần trăm", "toán có lời văn"], "Nhân với số phần trăm rồi chia cho 100.");
};

/* ═════════════ Bài 45–47: thể tích, đơn vị đo thể tích ═════════════ */

export const theTichHinh: Generator = (r) => {
  const a = int(r, 2, 6), b = int(r, 2, 5), c = int(r, 1, 4);
  if (chance(r, 0.6))
    return fill(`Xếp các hình lập phương nhỏ cạnh 1 cm thành một hình hộp chữ nhật: mỗi hàng ${a} hình, mỗi lớp ${b} hàng, xếp ${c} lớp. Thể tích hình hộp chữ nhật đó là ___ cm³.`,
      String(a * b * c), `Số hình lập phương nhỏ: ${a} × ${b} × ${c} = ${a * b * c}. Mỗi hình có thể tích 1 cm³ nên thể tích là ${a * b * c} cm³.`, ["thể tích"], "Đếm số hình lập phương 1 cm³.");
  const x = a * b * c, y = retry(() => { const v = int(r, 4, 60); return v !== x ? v : null; });
  return mc(`Hình A gồm ${x} hình lập phương nhỏ, hình B gồm ${y} hình lập phương nhỏ như thế. Hình nào có thể tích lớn hơn?`,
    fixedOptions(["Hình A", "Hình B", "Hai hình bằng nhau"], x > y ? "Hình A" : "Hình B"),
    `Hình gồm nhiều hình lập phương nhỏ hơn thì có thể tích lớn hơn: ${Math.max(x, y)} > ${Math.min(x, y)}.`, ["thể tích"], "So sánh số hình lập phương nhỏ.");
};

const VAT_THE_TICH: [string, number, "cm³" | "dm³" | "m³"][] = [
  ["Một hộp sữa nhỏ có thể tích khoảng", 180, "cm³"], ["Một con xúc xắc có thể tích khoảng", 1, "cm³"], ["Một hộp bút có thể tích khoảng", 400, "cm³"],
  ["Một can nước có thể tích khoảng", 20, "dm³"], ["Một thùng xốp có thể tích khoảng", 30, "dm³"],
  ["Một bể bơi có thể tích khoảng", 600, "m³"], ["Một phòng học có thể tích khoảng", 200, "m³"], ["Một xe chở cát chở được khoảng", 5, "m³"],
];

export const donViTheTich: Generator = (r) => {
  if (chance(r, 0.5)) {
    const [what, v, u] = pick(r, VAT_THE_TICH);
    return mc(`Chọn đơn vị thích hợp: ${what} ${v} …`, fixedOptions(["cm³", "dm³", "m³"], u), `${what} ${v} ${u}.`, ["đơn vị đo thể tích"], "1 cm³ cỡ một viên xúc xắc, 1 dm³ cỡ một hộp 1 lít, 1 m³ cỡ một khối lớn hơn cái bàn.");
  }
  const a = int(r, 2, 40);
  return chance(r, 0.5)
    ? fill(`Một bể chứa ${a} m³ nước. Bể chứa ___ lít nước (biết 1 dm³ = 1 lít).`, fmtInt(a * 1000), `${a} m³ = ${fmtInt(a * 1000)} dm³ = ${fmtInt(a * 1000)} lít.`, ["đơn vị đo thể tích", "lít"], "1 m³ = 1.000 dm³, 1 dm³ = 1 lít.")
    : fill(`${a} dm³ = ___ lít`, String(a), `1 dm³ = 1 lít nên ${a} dm³ = ${a} lít.`, ["đơn vị đo thể tích", "lít"], "1 dm³ = 1 lít.");
};

/* ═════════════ Bài 49: Hình khai triển ═════════════ */

const PI = dec(314, 2);

export const khaiTrien: Generator = (r) => {
  switch (pick(r, ["lapPhuong", "hop", "tru", "truDai", "truDai", "hopDai", "hopDai"] as const)) {
    case "lapPhuong": return mc("Hình khai triển của hình lập phương gồm bao nhiêu hình vuông bằng nhau?", fixedOptions(["4", "5", "6", "8"], "6"),
      "Hình lập phương có 6 mặt là hình vuông bằng nhau, nên hình khai triển gồm 6 hình vuông.", ["hình khai triển"], "Đếm số mặt của hình lập phương.");
    case "hop": return mc("Hình khai triển của hình hộp chữ nhật gồm bao nhiêu hình chữ nhật?", fixedOptions(["4", "5", "6", "8"], "6"),
      "Hình hộp chữ nhật có 6 mặt là hình chữ nhật, nên hình khai triển gồm 6 hình chữ nhật.", ["hình khai triển"], "Đếm số mặt của hình hộp chữ nhật.");
    case "tru": return mc("Hình khai triển của hình trụ gồm:", fixedOptions(["2 hình tròn và 1 hình chữ nhật", "1 hình tròn và 1 hình chữ nhật", "2 hình tròn và 2 hình chữ nhật", "6 hình chữ nhật"], "2 hình tròn và 1 hình chữ nhật"),
      "Hai mặt đáy của hình trụ là 2 hình tròn, mặt xung quanh trải ra là 1 hình chữ nhật.", ["hình khai triển"], "Hình trụ có hai mặt đáy và một mặt xung quanh.");
    case "truDai": {
      const rad = int(r, 2, 20), c = mul(mul(dec(rad * 2), PI), dec(1));
      return fill(`Một hình trụ có bán kính đáy ${rad} cm. Trải mặt xung quanh ra được một hình chữ nhật có chiều dài bằng chu vi mặt đáy, là ___ cm (lấy π = 3,14).`, fmt(c),
        `Chu vi mặt đáy: ${rad} × 2 × 3,14 = ${fmt(c)} (cm).`, ["hình khai triển", "hình trụ"], "Chu vi hình tròn = bán kính × 2 × 3,14.");
    }
    case "hopDai": {
      const a = int(r, 4, 30), b = int(r, 2, a - 1);
      return fill(`Một hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Trải bốn mặt bên ra được một hình chữ nhật có chiều dài bằng chu vi mặt đáy, là ___ cm.`, String((a + b) * 2),
        `Chu vi mặt đáy: (${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`, ["hình khai triển", "hình hộp chữ nhật"], "Chu vi hình chữ nhật = (dài + rộng) × 2.");
    }
  }
};

/* ═════════════ Bài 58: Chia số đo thời gian cho một số ═════════════ */

export const chiaThoiGian: Generator = (r) => {
  const [big, small] = pick(r, [["giờ", "phút"], ["phút", "giây"]] as const);
  const k = int(r, 2, 6);
  const [h, m] = retry(() => {
    const q = int(r, 61, 200); // thương ≥ 1 giờ (1 phút): không viết "0 giờ …"
    const t = q * k, hh = Math.floor(t / 60), mm = t % 60;
    // Số giờ không chia hết cho k: phải đổi phần dư ra phút, chỗ các em hay chia riêng từng phần.
    return hh >= 1 && mm > 0 && hh % k !== 0 ? [hh, mm] : null;
  });
  const total = h * 60 + m, q = total / k;
  const show = (t: number) => `${Math.floor(t / 60)} ${big} ${t % 60} ${small}`;
  const naive = Math.floor(h / k) * 60 + Math.floor(m / k);
  // Bỏ nhiễu có "0 giờ …": viết vậy là sai cách ghi, các em nhận ra ngay mà không cần tính.
  const cands = [naive, q + 5, q - 5, q + 10, q + 60, q - 60, q + 15].filter((t) => t >= 60 && t !== q).map(show);
  return mc(`${h} ${big} ${m} ${small} : ${k} = ?`, mcOptions(r, show(q), cands),
    `Đổi ${h} ${big} ${m} ${small} = ${total} ${small}; ${total} : ${k} = ${q} ${small} = ${show(q)}.`,
    ["số đo thời gian", "phép chia"], `Không chia hết số ${big} thì đổi phần dư ra ${small} rồi chia tiếp.`);
};

/* ═════════════ Bài 63, 65: số liệu, tỉ số số lần lặp lại ═════════════ */

export const soLieu5: Generator = (r) => {
  const n = int(r, 5, 7), names = shuffle(r, NAMES).slice(0, n);
  const vals = shuffle(r, range(128, 152)).slice(0, n);
  const lead = `Chiều cao (cm) của các bạn ${names.join(", ")} lần lượt là: ${vals.join("; ")}.`;
  const sorted = [...vals].sort((a, b) => a - b);
  switch (pick(r, ["thu", "chenh", "cao"] as const)) {
    case "thu": { const k = int(r, 1, n); return fill(`${lead} Sắp xếp các số liệu theo thứ tự từ bé đến lớn thì số đứng thứ ${k} là ___`, String(sorted[k - 1]),
      `Sắp xếp: ${sorted.join("; ")}. Số thứ ${k} là ${sorted[k - 1]}.`, ["sắp xếp số liệu"], "Viết lại dãy từ bé đến lớn."); }
    case "chenh": return fill(`${lead} Bạn cao nhất cao hơn bạn thấp nhất ___ cm.`, String(sorted[n - 1] - sorted[0]),
      `${sorted[n - 1]} - ${sorted[0]} = ${sorted[n - 1] - sorted[0]} (cm).`, ["sắp xếp số liệu"], "Lấy số lớn nhất trừ số bé nhất.");
    case "cao": { const m = 140, c = vals.filter((v) => v > m).length;
      return fill(`${lead} Có ___ bạn cao hơn ${m} cm.`, String(c), `Các số lớn hơn ${m}: ${vals.filter((v) => v > m).join("; ") || "không có"}. Có ${c} bạn.`, ["phân loại số liệu"], `Đếm các số lớn hơn ${m}.`); }
  }
};

export const tiSoLanLap: Generator = (r) => {
  const t = pick(r, [10, 20, 25, 30, 40, 50]), s = retry(() => { const x = int(r, 2, t - 2); return x * 2 !== t ? x : null; });
  const [q, ev] = pick(r, [
    [`Tung một đồng xu ${t} lần, có ${s} lần xuất hiện mặt ngửa.`, "mặt ngửa"],
    [`Bạn ${pick(r, NAMES)} ném bóng vào rổ ${t} lần, có ${s} lần bóng vào rổ.`, "bóng vào rổ"],
    [`Lấy bóng (có trả lại) từ một hộp ${t} lần, có ${s} lần lấy được bóng đỏ.`, "lấy được bóng đỏ"],
  ] as const);
  return mc(`${q} Tỉ số của số lần ${ev} và tổng số lần thực hiện là:`, mcOptions(r, `${s}/${t}`, [`${t - s}/${t}`, `${s}/${t - s}`, `${t}/${s}`]),
    `Số lần ${ev} là ${s}, tổng số lần là ${t}: tỉ số là ${s}/${t}.`, ["tỉ số số lần lặp lại"], "Số lần sự kiện xảy ra viết trên, tổng số lần viết dưới.");
};

export const KNTT5 = {
  phanSoTP, vietSTP, lamTronSTP, kmHa, tiSo, tiLeBanDo, phanTramLoiVan, theTichHinh, donViTheTich,
  khaiTrien, chiaThoiGian, soLieu5, tiSoLanLap,
};
