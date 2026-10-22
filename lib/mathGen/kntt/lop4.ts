// lib/mathGen/kntt/lop4.ts — Toán 4 theo từng bài sách Kết nối tri thức (lib/sgk/books/toan4.ts):
// các dạng câu cho những bài mà lop4.ts và các dạng có hình của đề in chưa phủ — số chẵn,
// số lẻ; biểu thức chứa chữ; bài toán ba bước tính; đo góc bằng thước đo góc; đọc, viết số
// có nhiều chữ số; dãy số tự nhiên; tính chất giao hoán, kết hợp, phân phối; hai đường
// thẳng vuông góc, song song; hình bình hành, hình thoi; rút về đơn vị; dãy số liệu; số lần
// xuất hiện của một sự kiện; khái niệm phân số, phân số và phép chia, tính chất cơ bản,
// quy đồng mẫu số; tìm phân số của một số.
// Các generator cũ ở lop4.ts giữ nguyên để đề đã import và link đề đã chia sẻ không đổi.
// scripts/sgk-toan-check.ts (recheck4) tính lại đáp án từ chữ trong đề và từ hình vẽ.

import { type Generator, type Rng, int, pick, chance, shuffle, mcOptions, fixedOptions, blanks, retry, range, fmtInt, gcd } from "../core";
import { cap } from "../shared";
import { protractorSvg, rectLabelSvg } from "../../exam5/figures";

const fill = (question: string, answer: number | string, explanation: string, tags: string[], hint: string, image?: string) => ({
  type: "fill_blank" as const, difficulty: "medium" as const, tags, question,
  ...blanks(typeof answer === "number" ? fmtInt(answer) : answer), explanation, hint, ...(image ? { image } : {}),
});
const mc = (question: string, opts: ReturnType<typeof mcOptions>, explanation: string, tags: string[], hint: string, image?: string) => ({
  type: "multiple_choice" as const, difficulty: "medium" as const, tags, question, ...opts, explanation, hint, ...(image ? { image } : {}),
});

/* ═════════════ Bài 3: Số chẵn, số lẻ ═════════════ */

export const chanLe: Generator = (r) => {
  const chan = chance(r, 0.5), ten = chan ? "chẵn" : "lẻ";
  switch (pick(r, ["loai", "loai", "dem", "lien"] as const)) {
    case "loai": {
      const make = (even: boolean) => { const x = int(r, 10, 9999); return x % 2 === (even ? 0 : 1) ? x : x + 1; };
      const c = make(chan), wrong = new Set<number>();
      while (wrong.size < 3) wrong.add(make(!chan));
      return mc(`Số nào dưới đây là số ${ten}?`, mcOptions(r, fmtInt(c), [...wrong].map(fmtInt)),
        `${fmtInt(c)} có chữ số tận cùng là ${c % 10} nên là số ${ten}.`, ["số chẵn, số lẻ"], "Số chẵn tận cùng là 0, 2, 4, 6, 8; số lẻ tận cùng là 1, 3, 5, 7, 9.");
    }
    case "dem": {
      const a = int(r, 1, 60), b = a + int(r, 6, 25);
      const n = chan ? Math.floor(b / 2) - Math.floor((a - 1) / 2) : (b - a + 1) - (Math.floor(b / 2) - Math.floor((a - 1) / 2));
      return fill(`Từ ${a} đến ${b} có ___ số ${ten}.`, n, `Các số ${ten} từ ${a} đến ${b} cách nhau 2 đơn vị; đếm được ${n} số.`, ["số chẵn, số lẻ"], "Hai số chẵn (hoặc hai số lẻ) liên tiếp hơn kém nhau 2.");
    }
    case "lien": {
      const x = int(r, 100, 99999), base = x % 2 === (chan ? 0 : 1) ? x : x + 1, up = chance(r, 0.5);
      return fill(`Số ${ten} liền ${up ? "sau" : "trước"} số ${fmtInt(base)} là ___`, up ? base + 2 : base - 2,
        `Hai số ${ten} liên tiếp hơn kém nhau 2: ${fmtInt(base)} ${up ? "+" : "-"} 2 = ${fmtInt(up ? base + 2 : base - 2)}.`, ["số chẵn, số lẻ"], "Hai số chẵn (hoặc lẻ) liên tiếp hơn kém nhau 2.");
    }
  }
};

/* ═════════════ Bài 4: Biểu thức chứa chữ ═════════════ */

export const bieuThucChu: Generator = (r) => {
  const v = int(r, 2, 30), k = int(r, 3, 50), m = int(r, 2, 9);
  const forms: [string, number][] = [
    [`a + ${k}`, v + k], [`${k + v + 10} - a`, k + 10], [`a × ${m}`, v * m], [`${k} + a × ${m}`, k + v * m], [`(a + ${k}) × ${m}`, (v + k) * m],
  ];
  if (chance(r, 0.25)) {
    const a = int(r, 3, 25);
    return chance(r, 0.5)
      ? fill(`Chu vi hình vuông cạnh a là P = a × 4. Với a = ${a} cm thì P = ___ cm.`, a * 4, `P = ${a} × 4 = ${a * 4} (cm).`, ["biểu thức chứa chữ", "chu vi"], "Thay a bằng số đo cạnh.")
      : fill(`Giá trị của biểu thức a + b với a = ${a * 10}, b = ${k} là ___`, a * 10 + k, `a + b = ${a * 10} + ${k} = ${a * 10 + k}.`, ["biểu thức chứa chữ"], "Thay chữ bằng số rồi tính.");
  }
  const [e, val] = pick(r, forms);
  return fill(`Giá trị của biểu thức ${e} với a = ${v} là ___`, val, `Thay a = ${v}: ${e.replace("a", String(v))} = ${val}.`, ["biểu thức chứa chữ"], "Thay chữ a bằng số rồi tính giá trị biểu thức.");
};

/* ═════════════ Bài 5: Bài toán có ba bước tính ═════════════ */

export const baBuoc: Generator = (r) => {
  switch (pick(r, ["kho", "thung", "mua"] as const)) {
    case "kho": {
      const b = int(r, 20, 90), c = int(r, 20, 90), d = int(r, 15, 80), a = b + c + int(r, 30, 300);
      return fill(`Kho có ${a} bao gạo. Ngày thứ nhất xuất ${b} bao, ngày thứ hai xuất ${c} bao, ngày thứ ba nhập thêm ${d} bao. Kho còn ___ bao gạo.`, a - b - c + d,
        `Sau hai ngày xuất: ${a} - ${b} - ${c} = ${a - b - c} (bao). Nhập thêm: ${a - b - c} + ${d} = ${a - b - c + d} (bao).`, ["ba bước tính", "toán có lời văn"], "Làm lần lượt theo từng ngày.");
    }
    case "thung": {
      const n = int(r, 3, 9), k = int(r, 12, 30), b = int(r, 5, n * k - 5), d = int(r, 10, 60);
      return fill(`Cửa hàng có ${n} thùng, mỗi thùng ${k} chai nước. Cửa hàng đã bán ${b} chai, sau đó nhập thêm ${d} chai. Cửa hàng có ___ chai nước.`, n * k - b + d,
        `Lúc đầu: ${k} × ${n} = ${n * k} (chai). Sau khi bán: ${n * k} - ${b} = ${n * k - b} (chai). Nhập thêm: ${n * k - b} + ${d} = ${n * k - b + d} (chai).`, ["ba bước tính", "toán có lời văn"], "Tìm số chai lúc đầu trước.");
    }
    case "mua": {
      const n = int(r, 2, 6), p = int(r, 5, 15) * 1000, q = int(r, 3, 12) * 1000;
      const t = Math.ceil((n * p + q + 1000) / 50000) * 50000;
      return fill(`Mẹ mua ${n} quyển vở, mỗi quyển giá ${fmtInt(p)} đồng và một chiếc bút giá ${fmtInt(q)} đồng. Mẹ đưa cô bán hàng ${fmtInt(t)} đồng. Cô bán hàng trả lại mẹ ___ đồng.`, t - n * p - q,
        `Tiền vở: ${fmtInt(p)} × ${n} = ${fmtInt(n * p)} (đồng). Tiền vở và bút: ${fmtInt(n * p)} + ${fmtInt(q)} = ${fmtInt(n * p + q)} (đồng). Trả lại: ${fmtInt(t)} - ${fmtInt(n * p + q)} = ${fmtInt(t - n * p - q)} (đồng).`,
        ["ba bước tính", "toán có lời văn"], "Tính tổng số tiền phải trả trước.");
    }
  }
};

/* ═════════════ Bài 7, 8: Đo góc, góc nhọn – tù – bẹt ═════════════ */

const GOC = ["Góc nhọn", "Góc vuông", "Góc tù", "Góc bẹt"];
const loaiCua = (d: number) => (d < 90 ? "Góc nhọn" : d === 90 ? "Góc vuông" : d < 180 ? "Góc tù" : "Góc bẹt");

export const doGoc: Generator = (r) => {
  if (chance(r, 0.75)) {
    const deg = pick(r, [10, 20, 30, 40, 50, 60, 70, 80, 100, 110, 120, 130, 140, 150, 160, 170]);
    return mc("Đặt thước đo góc như hình bên. Góc đỉnh O; cạnh OA, OB có số đo là:", mcOptions(r, `${deg}°`, [`${180 - deg}°`, `${deg + 10}°`, `${deg === 10 ? 30 : deg - 10}°`]),
      `Cạnh OA chỉ vạch 0 của vòng số ngoài, nên đọc số đo trên vòng số ngoài: cạnh OB chỉ vạch ${deg}°.`, ["đo góc", "hình vẽ"],
      "Cạnh OA ở vạch 0 của vòng số nào thì đọc số đo trên vòng số đó.", protractorSvg(deg));
  }
  const [q, a] = pick(r, [["Góc vuông có số đo là:", 90], ["Góc bẹt có số đo là:", 180], ["Góc bẹt bằng mấy góc vuông?", 2]] as const);
  return a === 2
    ? mc(q, fixedOptions(["1 góc vuông", "2 góc vuông", "3 góc vuông", "4 góc vuông"], "2 góc vuông"), "Góc bẹt 180° = 90° + 90°, bằng 2 góc vuông.", ["đo góc"], "180 = 90 + 90.")
    : mc(q, fixedOptions(["45°", "60°", "90°", "180°"], `${a}°`), `${q.replace(" là:", "")} ${a}°.`, ["đo góc"], "Góc vuông 90°, góc bẹt 180°.");
};

export const loaiGoc: Generator = (r) => {
  const d = pick(r, [...range(1, 17).map((x) => x * 5), 90, 90, 180, 180, ...range(19, 35).map((x) => x * 5)]);
  return mc(`Góc có số đo ${d}° là:`, fixedOptions(GOC, loaiCua(d)),
    `Góc nhọn bé hơn 90°, góc vuông bằng 90°, góc tù lớn hơn 90° nhưng bé hơn 180°, góc bẹt bằng 180°. ${d}° là ${loaiCua(d).toLowerCase()}.`, ["góc"], "So sánh số đo với 90° và 180°.");
};

/* ═════════════ Bài 10, 12: đọc, viết số có nhiều chữ số ═════════════ */

const SO = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** Đọc một nhóm ba chữ số; `dau` = nhóm đầu tiên (không đọc "không trăm"). */
function docNhom(g: number, dau: boolean): string {
  const [h, t, u] = [Math.floor(g / 100), Math.floor(g / 10) % 10, g % 10];
  const out: string[] = [];
  if (!dau || h) out.push(`${SO[h]} trăm`);
  if (t === 0) { if (u) out.push(dau && !h ? SO[u] : `linh ${SO[u]}`); }
  else if (t === 1) out.push(u ? `mười ${u === 5 ? "lăm" : SO[u]}` : "mười");
  else out.push(`${SO[t]} mươi${u ? ` ${u === 1 ? "mốt" : u === 4 ? "tư" : u === 5 ? "lăm" : SO[u]}` : ""}`);
  return out.join(" ");
}

/** Đọc số đến lớp triệu. Không nhận số có nhóm giữa bằng 0 (cách đọc chưa thống nhất). */
export function docSoLon(n: number): string {
  const groups = [Math.floor(n / 1e6), Math.floor(n / 1000) % 1000, n % 1000];
  const names = ["triệu", "nghìn", ""];
  const first = groups.findIndex((g) => g > 0);
  return groups.map((g, i) => {
    if (i < first || (i > first && g === 0 && groups.slice(i).every((x) => x === 0))) return "";
    return `${docNhom(g, i === first)}${names[i] ? ` ${names[i]}` : ""}`;
  }).filter(Boolean).join(" ");
}

/** Số có `len` chữ số, các nhóm sau nhóm đầu khác 0 (hoặc cùng bằng 0 ở cuối). */
function soNhieuChuSo(r: Rng, len: number): number {
  return retry(() => {
    const n = int(r, 10 ** (len - 1), 10 ** len - 1);
    const lo = n % 1000, mid = Math.floor(n / 1000) % 1000;
    if (len > 6 && mid === 0) return null;
    if (lo === 0 && chance(r, 0.7)) return null;
    return n;
  });
}

function nhamSo(n: number): number[] {
  const s = String(n), out: number[] = [];
  for (let i = 0; i + 1 < s.length; i++) if (s[i] !== s[i + 1] && !(i === 0 && s[1] === "0")) out.push(Number(s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)));
  const d = Number(s[s.length - 2]);
  out.push(n + 10 ** (s.length - 2) * (d === 9 ? -1 : 1), n + (n % 10 === 9 ? -1 : 1), n + 1000, n - 1000, n + 100, n - 100);
  // Bỏ số có nhóm nghìn bằng 0 ở giữa (cách đọc chưa thống nhất), như ở soNhieuChuSo.
  return [...new Set(out)].filter((x) => x !== n && String(x).length === s.length && (x < 1e6 || Math.floor(x / 1000) % 1000 !== 0));
}

export const docVietSo = (len: 6 | 9): Generator => (r) => {
  const n = soNhieuChuSo(r, len === 6 ? 6 : pick(r, [7, 8, 9]));
  const wrong = nhamSo(n);
  if (len === 6 && chance(r, 0.15))
    return fill("Số liền sau số 999.999 là ___", 1000000, "999.999 + 1 = 1.000.000 (một triệu).", ["số có nhiều chữ số"], "Thêm 1 đơn vị.");
  if (chance(r, 0.5))
    return mc(`Số “${docSoLon(n)}” viết là:`, mcOptions(r, fmtInt(n), wrong.map(fmtInt)),
      `Viết lần lượt từng lớp: ${fmtInt(n)}.`, ["đọc, viết số"], "Viết từng lớp từ trái sang phải, lớp nào thiếu hàng thì viết chữ số 0.");
  return mc(`Số ${fmtInt(n)} đọc là:`, mcOptions(r, cap(docSoLon(n)), wrong.map((x) => cap(docSoLon(x)))),
    `Đọc từng lớp từ trái sang phải: ${docSoLon(n)}.`, ["đọc, viết số"], "Tách số thành từng lớp ba chữ số rồi đọc từ trái sang phải.");
};

/* ═════════════ Bài 15: Dãy số tự nhiên ═════════════ */

export const daySoTN: Generator = (r) => {
  switch (pick(r, ["beNhat", "lien", "lien", "day", "dem"] as const)) {
    case "beNhat": return mc("Số tự nhiên bé nhất là:", fixedOptions(["0", "1", "10", "Không có số bé nhất"], "0"), "Dãy số tự nhiên bắt đầu từ 0: 0, 1, 2, 3, …", ["dãy số tự nhiên"], "Dãy số tự nhiên bắt đầu từ số nào?");
    case "lien": {
      const n = int(r, 1000, 9999999), up = chance(r, 0.5);
      return fill(`Số tự nhiên liền ${up ? "sau" : "trước"} số ${fmtInt(n)} là ___`, up ? n + 1 : n - 1, `Hai số tự nhiên liên tiếp hơn kém nhau 1 đơn vị.`, ["dãy số tự nhiên"], up ? "Thêm 1." : "Bớt 1.");
    }
    case "day": {
      const step = pick(r, [1, 2, 5, 10, 100]), a = int(r, 1000, 99999) * (step >= 10 ? step : 1), hole = int(r, 1, 3);
      const seq = range(0, 3).map((i) => a + i * step);
      return fill(`Điền số: ${seq.map((x, i) => (i === hole ? "___" : fmtInt(x))).join("; ")}`, seq[hole], `Mỗi số hơn số đứng trước ${step} đơn vị.`, ["dãy số tự nhiên"], "Xem hai số liền nhau hơn kém nhau bao nhiêu.");
    }
    case "dem": {
      const a = int(r, 10, 500), b = a + int(r, 9, 200);
      return fill(`Từ ${a} đến ${b} có ___ số tự nhiên.`, b - a + 1, `Số các số tự nhiên: ${b} - ${a} + 1 = ${b - a + 1}.`, ["dãy số tự nhiên"], "Lấy số cuối trừ số đầu rồi cộng 1.");
    }
  }
};

/* ═════════════ Bài 24, 40, 42: tính chất phép cộng, phép nhân ═════════════ */

export const tinhChat = (op: "+" | "×" | "phanPhoi"): Generator => (r) => {
  if (op === "phanPhoi") {
    const a = int(r, 3, 99), b = int(r, 2, 60), c = int(r, 2, 60);
    return chance(r, 0.5)
      ? fill(`${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ___`, c, `Nhân một số với một tổng: ${a} × (${b} + ${c}) = ${a} × ${b} + ${a} × ${c}.`, ["tính chất phân phối"], "Nhân số đó với từng số hạng rồi cộng lại.")
      : fill(`${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ___)`, c, `${a} × ${b} + ${a} × ${c} = ${a} × (${b} + ${c}).`, ["tính chất phân phối"], `Đặt ${a} ra ngoài dấu ngoặc.`);
  }
  const [a, b, c] = op === "+" ? [int(r, 100, 9999), int(r, 100, 9999), int(r, 100, 9999)] : [int(r, 2, 99), int(r, 2, 99), int(r, 2, 25)];
  const tc = op === "+" ? "phép cộng" : "phép nhân";
  return chance(r, 0.5)
    ? fill(`${fmtInt(a)} ${op} ${fmtInt(b)} = ${fmtInt(b)} ${op} ___`, a, `Tính chất giao hoán của ${tc}: đổi chỗ hai số thì kết quả không đổi.`, ["tính chất giao hoán"], "Đổi chỗ hai số.")
    : fill(`(${fmtInt(a)} ${op} ${fmtInt(b)}) ${op} ${fmtInt(c)} = ${fmtInt(a)} ${op} (${fmtInt(b)} ${op} ___)`, c, `Tính chất kết hợp của ${tc}.`, ["tính chất kết hợp"], "Thay đổi cách nhóm, kết quả không đổi.");
};

/* ═════════════ Bài 27, 29, 31: vuông góc, song song; hình bình hành, hình thoi ═════════════ */

const TEN_HCN = ["ABCD", "MNPQ", "EGHI"];
const canh = (s: string) => [s[0] + s[1], s[1] + s[2], s[2] + s[3], s[3] + s[0]];

export const vuongSongSong = (kind: "vuong" | "song"): Generator => (r) => {
  const s = pick(r, TEN_HCN), sq = chance(r, 0.3), es = canh(s), i = int(r, 0, 3), e = es[i];
  const ke = [es[(i + 1) % 4], es[(i + 3) % 4]].sort(), doi = es[(i + 2) % 4];
  const hinh = `Hình ${sq ? "vuông" : "chữ nhật"} ${s} (như hình bên)`;
  if (chance(r, 0.2))
    return kind === "vuong"
      ? mc("Hai đường thẳng vuông góc với nhau tạo thành mấy góc vuông chung đỉnh?", fixedOptions(["1", "2", "3", "4"], "4"), "Hai đường thẳng vuông góc tạo thành 4 góc vuông chung đỉnh.", ["vuông góc"], "Kiểm tra bằng ê ke.")
      : mc("Hai đường thẳng song song với nhau thì:", fixedOptions(["Không bao giờ cắt nhau", "Cắt nhau tại một điểm", "Tạo thành góc vuông"], "Không bao giờ cắt nhau"), "Hai đường thẳng song song thì không bao giờ cắt nhau.", ["song song"], "Kéo dài hai đường thẳng về hai phía.");
  if (kind === "vuong")
    return mc(`${hinh}: cạnh ${e} vuông góc với những cạnh nào?`, mcOptions(r, ke.join(" và "), [...[[doi, ke[0]], [doi, ke[1]]].map((p) => p.sort().join(" và ")), `Chỉ cạnh ${doi}`]),
      `Hai cạnh chung một đỉnh của hình ${sq ? "vuông" : "chữ nhật"} vuông góc với nhau: ${e} vuông góc với ${ke.join(" và ")}.`, ["vuông góc", "hình vẽ"], "Các cạnh chung đỉnh tạo thành góc vuông.", rectLabelSvg(s, sq));
  return mc(`${hinh}: cạnh ${e} song song với cạnh nào?`, fixedOptions(es.filter((x) => x !== e), doi),
    `Hai cạnh đối diện của hình ${sq ? "vuông" : "chữ nhật"} song song với nhau: ${e} song song với ${doi}.`, ["song song", "hình vẽ"], "Tìm cạnh đối diện.", rectLabelSvg(s, sq));
};

export const hbhThoi: Generator = (r) => {
  switch (pick(r, ["hbh", "thoi", "chuViThoi", "chuViHbh"] as const)) {
    case "hbh": return mc("Hình bình hành có đặc điểm nào dưới đây?", fixedOptions(["Hai cặp cạnh đối diện song song và bằng nhau", "Bốn góc đều là góc vuông", "Chỉ có một cặp cạnh song song"], "Hai cặp cạnh đối diện song song và bằng nhau"),
      "Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau.", ["hình bình hành"], "Nhớ lại các cạnh đối diện của hình bình hành.");
    case "thoi": return mc("Hình thoi có đặc điểm nào dưới đây?", fixedOptions(["Bốn góc đều là góc vuông", "Hai cặp cạnh đối diện song song và bốn cạnh bằng nhau", "Chỉ có một cặp cạnh song song"], "Hai cặp cạnh đối diện song song và bốn cạnh bằng nhau"),
      "Hình thoi có hai cặp cạnh đối diện song song và bốn cạnh bằng nhau.", ["hình thoi"], "Các cạnh của hình thoi dài bằng nhau.");
    case "chuViThoi": { const a = int(r, 3, 40); return fill(`Một hình thoi có cạnh dài ${a} cm. Chu vi hình thoi đó là ___ cm.`, a * 4, `Bốn cạnh hình thoi bằng nhau: ${a} × 4 = ${a * 4} (cm).`, ["hình thoi", "chu vi"], "Hình thoi có bốn cạnh bằng nhau."); }
    case "chuViHbh": { const a = int(r, 8, 40), b = int(r, 3, a - 1); return fill(`Một hình bình hành có hai cạnh liền nhau dài ${a} cm và ${b} cm. Chu vi hình bình hành đó là ___ cm.`, (a + b) * 2, `(${a} + ${b}) × 2 = ${(a + b) * 2} (cm).`, ["hình bình hành", "chu vi"], "Các cạnh đối diện bằng nhau."); }
  }
};

/* ═════════════ Bài 47: Bài toán liên quan đến rút về đơn vị ═════════════ */

export const rutVeDonVi: Generator = (r) => {
  const n1 = int(r, 2, 9), n2 = retry(() => { const x = int(r, 2, 12); return x !== n1 ? x : null; });
  switch (pick(r, ["vo", "xe", "oto"] as const)) {
    case "vo": { const u = int(r, 4, 15) * 1000; return fill(`Mua ${n1} quyển vở hết ${fmtInt(u * n1)} đồng. Mua ${n2} quyển vở như thế hết ___ đồng.`, u * n2,
      `Giá một quyển vở: ${fmtInt(u * n1)} : ${n1} = ${fmtInt(u)} (đồng). ${n2} quyển: ${fmtInt(u)} × ${n2} = ${fmtInt(u * n2)} (đồng).`, ["rút về đơn vị"], "Tìm giá tiền một quyển trước."); }
    case "xe": { const u = int(r, 20, 60); return fill(`${n1} xe tải chở được ${u * n1} bao xi măng. Hỏi ${n2} xe như thế chở được bao nhiêu bao xi măng? Trả lời: ___ bao.`, u * n2,
      `Một xe chở: ${u * n1} : ${n1} = ${u} (bao). ${n2} xe chở: ${u} × ${n2} = ${u * n2} (bao).`, ["rút về đơn vị"], "Tìm số bao một xe chở trước."); }
    case "oto": { const u = int(r, 35, 60); return fill(`Một ô tô đi ${n1} giờ được ${u * n1} km. Với vận tốc như thế, ô tô đi ${n2} giờ được ___ km.`, u * n2,
      `Một giờ đi: ${u * n1} : ${n1} = ${u} (km). ${n2} giờ đi: ${u} × ${n2} = ${u * n2} (km).`, ["rút về đơn vị"], "Tìm quãng đường đi trong 1 giờ trước."); }
  }
};

/* ═════════════ Bài 49, 51: dãy số liệu, số lần xuất hiện ═════════════ */

export const daySoLieu: Generator = (r) => {
  const n = int(r, 4, 6), lop = ["4A", "4B", "4C", "4D", "4E", "4G"].slice(0, n);
  const vals = shuffle(r, range(18, 40)).slice(0, n);
  const lead = `Số học sinh tham gia câu lạc bộ đọc sách của các lớp ${lop.join(", ")} lần lượt là: ${vals.join("; ")}.`;
  switch (pick(r, ["soLuong", "thu", "max", "chenh"] as const)) {
    case "soLuong": return fill(`${lead} Dãy số liệu trên có ___ số liệu.`, n, `Đếm các số trong dãy: có ${n} số liệu.`, ["dãy số liệu"], "Đếm các số trong dãy.");
    case "thu": { const k = int(r, 1, n); return fill(`${lead} Số liệu thứ ${k} của dãy là ___`, vals[k - 1], `Số thứ ${k} trong dãy là ${vals[k - 1]}.`, ["dãy số liệu"], "Đếm từ trái sang phải."); }
    case "max": { const big = chance(r, 0.5), v = big ? Math.max(...vals) : Math.min(...vals);
      return mc(`${lead} Lớp nào có ${big ? "nhiều" : "ít"} học sinh tham gia nhất?`, fixedOptions(lop, lop[vals.indexOf(v)]), `Số ${big ? "lớn" : "bé"} nhất trong dãy là ${v}, ứng với lớp ${lop[vals.indexOf(v)]}.`, ["dãy số liệu"], "Tìm số lớn nhất (bé nhất) trong dãy."); }
    case "chenh": return fill(`${lead} Lớp nhiều nhất hơn lớp ít nhất ___ học sinh.`, Math.max(...vals) - Math.min(...vals), `${Math.max(...vals)} - ${Math.min(...vals)} = ${Math.max(...vals) - Math.min(...vals)}.`, ["dãy số liệu"], "Lấy số lớn nhất trừ số bé nhất.");
  }
};

export const soLanXuatHien: Generator = (r) => {
  switch (pick(r, ["xu", "xucXac", "bong", "dem"] as const)) {
    case "xu": { const t = pick(r, [10, 20, 30, 40]), s = int(r, 3, t - 3); return fill(`Tung một đồng xu ${t} lần thì có ${s} lần xuất hiện mặt sấp. Số lần xuất hiện mặt ngửa là ___`, t - s, `${t} - ${s} = ${t - s} (lần).`, ["số lần xuất hiện"], "Mỗi lần tung chỉ ra mặt sấp hoặc mặt ngửa."); }
    case "xucXac": { const t = pick(r, [20, 30, 50]), k = int(r, 1, 6), s = int(r, 2, 12); return fill(`Gieo một con xúc xắc ${t} lần thì có ${s} lần xuất hiện mặt ${k} chấm. Số lần không xuất hiện mặt ${k} chấm là ___`, t - s, `${t} - ${s} = ${t - s} (lần).`, ["số lần xuất hiện"], "Lấy tổng số lần gieo trừ số lần xuất hiện mặt đó."); }
    case "bong": { const t = int(r, 12, 30), d = int(r, 3, t - 3); return fill(`An lấy bóng (có trả lại) từ hộp có bóng đỏ và bóng xanh ${t} lần, có ${d} lần lấy được bóng đỏ. Số lần lấy được bóng xanh là ___`, t - d, `${t} - ${d} = ${t - d} (lần).`, ["số lần xuất hiện"], "Mỗi lần lấy được bóng đỏ hoặc bóng xanh."); }
    case "dem": {
      const res = Array.from({ length: int(r, 8, 12) }, () => (chance(r, 0.5) ? "S" : "N"));
      const sap = chance(r, 0.5), c = res.filter((x) => x === (sap ? "S" : "N")).length;
      if (c === 0) return soLanXuatHien(r);
      return fill(`Kết quả tung đồng xu (S: mặt sấp, N: mặt ngửa): ${res.join(", ")}. Mặt ${sap ? "sấp" : "ngửa"} xuất hiện ___ lần.`, c, `Đếm các chữ ${sap ? "S" : "N"}: ${c} lần.`, ["số lần xuất hiện"], "Đánh dấu từng chữ khi đếm.");
    }
  }
};

/* ═════════════ Bài 53–57: phân số ═════════════ */

const SO_DEM = (n: number) => (n < 10 ? SO[n] : n === 10 ? "mười" : n < 20 ? `mười ${n === 15 ? "lăm" : SO[n % 10]}` : `${SO[Math.floor(n / 10)]} mươi${n % 10 ? ` ${n % 10 === 1 ? "mốt" : n % 10 === 5 ? "lăm" : SO[n % 10]}` : ""}`);
const docPS = (n: number, d: number) => `${SO_DEM(n)} phần ${SO_DEM(d)}`;

export const docPhanSo: Generator = (r) => {
  const d = int(r, 2, 20), n = retry(() => { const x = int(r, 1, 20); return x !== d ? x : null; });
  switch (pick(r, ["doc", "viet", "tu", "mau"] as const)) {
    case "doc": return mc(`Phân số ${n}/${d} đọc là:`, mcOptions(r, cap(docPS(n, d)), [docPS(d, n), docPS(n, d + 1), docPS(n + 1, d), docPS(n, d === 2 ? 3 : d - 1)].map(cap)),
      `Đọc tử số trước, rồi “phần”, rồi mẫu số: ${docPS(n, d)}.`, ["khái niệm phân số"], "Tử số đọc trước, mẫu số đọc sau.");
    case "viet": return mc(`Phân số “${docPS(n, d)}” viết là:`, mcOptions(r, `${n}/${d}`, [`${d}/${n}`, `${n}/${d + 1}`, `${n + 1}/${d}`]),
      `Tử số ${n} viết trên gạch ngang, mẫu số ${d} viết dưới: ${n}/${d}.`, ["khái niệm phân số"], "Số đọc trước là tử số.");
    case "tu": return fill(`Phân số ${n}/${d} có tử số là ___`, n, `Tử số viết trên gạch ngang: ${n}.`, ["khái niệm phân số"], "Tử số ở trên, mẫu số ở dưới.");
    case "mau": return fill(`Phân số ${n}/${d} có mẫu số là ___`, d, `Mẫu số viết dưới gạch ngang: ${d}.`, ["khái niệm phân số"], "Tử số ở trên, mẫu số ở dưới.");
  }
};

export const thuongPhanSo: Generator = (r) => {
  switch (pick(r, ["viet", "viet", "soTN", "lon1"] as const)) {
    case "viet": {
      const [a, b] = retry(() => { const x = int(r, 1, 30), y = int(r, 2, 30); return x !== y && gcd(x, y) === 1 ? [x, y] : null; });
      return fill(`Viết thương dưới dạng phân số: ${a} : ${b} = ___`, `${a}/${b}`, `Thương của phép chia ${a} : ${b} viết thành phân số ${a}/${b} (số bị chia là tử số, số chia là mẫu số).`, ["phân số và phép chia"], "Số bị chia là tử số, số chia là mẫu số.");
    }
    case "soTN": { const d = int(r, 2, 12), q = int(r, 2, 12); return fill(`Phân số ${d * q}/${d} bằng số tự nhiên ___`, q, `${d * q}/${d} = ${d * q} : ${d} = ${q}.`, ["phân số và phép chia"], "Lấy tử số chia cho mẫu số."); }
    case "lon1": {
      const d = int(r, 3, 12), big = d + int(r, 1, 6);
      return mc("Phân số nào dưới đây lớn hơn 1?", mcOptions(r, `${big}/${d}`, [`${d - 1}/${d}`, `${d}/${d}`, `${d - 2}/${d}`, `1/${d}`]),
        `${big}/${d} có tử số lớn hơn mẫu số nên lớn hơn 1.`, ["phân số và phép chia"], "Phân số có tử số lớn hơn mẫu số thì lớn hơn 1.");
    }
  }
};

export const tinhChatPS: Generator = (r) => {
  const d = int(r, 2, 9), n = retry(() => { const x = int(r, 1, d - 1); return gcd(x, d) === 1 ? x : null; }), k = int(r, 2, 9);
  return chance(r, 0.5)
    ? fill(`${n}/${d} = ___/${d * k}`, n * k, `Nhân cả tử số và mẫu số với ${k}: ${n}/${d} = ${n * k}/${d * k}.`, ["tính chất cơ bản của phân số"], `${d} nhân mấy được ${d * k}?`)
    : fill(`${n * k}/${d * k} = ${n}/___`, d, `Chia cả tử số và mẫu số cho ${k}: ${n * k}/${d * k} = ${n}/${d}.`, ["tính chất cơ bản của phân số"], `${n * k} chia mấy được ${n}?`);
};

export const quyDong: Generator = (r) => {
  const d1 = int(r, 2, 6), k = int(r, 2, 4), d2 = d1 * k;
  const n1 = retry(() => { const x = int(r, 1, d1 - 1); return gcd(x, d1) === 1 ? x : null; });
  const n2 = retry(() => { const x = int(r, 1, d2 - 1); return gcd(x, d2) === 1 ? x : null; });
  if (chance(r, 0.35))
    return mc(`Mẫu số chung bé nhất của hai phân số ${n1}/${d1} và ${n2}/${d2} là:`, mcOptions(r, String(d2), [String(d1 * d2), String(d1), String(d1 + d2)]),
      `${d2} chia hết cho ${d1} nên chọn ${d2} làm mẫu số chung.`, ["quy đồng mẫu số"], "Xem mẫu số lớn có chia hết cho mẫu số bé không.");
  return fill(`Quy đồng mẫu số hai phân số ${n1}/${d1} và ${n2}/${d2} (mẫu số chung ${d2}): ${n1}/${d1} = ___/${d2}`, n1 * k,
    `${d2} : ${d1} = ${k}; nhân cả tử và mẫu của ${n1}/${d1} với ${k}: ${n1 * k}/${d2}.`, ["quy đồng mẫu số"], `${d1} nhân mấy được ${d2}?`);
};

/* ═════════════ Bài 65: Tìm phân số của một số ═════════════ */

export const phanSoCuaSo: Generator = (r) => {
  const d = int(r, 2, 9), n = retry(() => { const x = int(r, 1, d - 1); return gcd(x, d) === 1 ? x : null; });
  switch (pick(r, ["so", "so", "lop", "gio"] as const)) {
    case "so": { const x = d * int(r, 2, 20); return fill(`${n}/${d} của ${x} là ___`, (x / d) * n, `${x} × ${n} : ${d} = ${(x / d) * n}.`, ["phân số của một số"], `Lấy ${x} nhân ${n} rồi chia ${d}.`); }
    case "lop": { const x = d * int(r, 4, 6); if (x < 24 || x > 40) return phanSoCuaSo(r);
      return fill(`Lớp 4A có ${x} học sinh, số học sinh nữ bằng ${n}/${d} số học sinh cả lớp. Lớp 4A có ___ học sinh nữ.`, (x / d) * n, `${x} × ${n} : ${d} = ${(x / d) * n} (học sinh).`, ["phân số của một số", "toán có lời văn"], "Tìm phân số của số học sinh cả lớp."); }
    case "gio": { const dd = pick(r, [2, 3, 4, 5, 6, 10, 12]), nn = retry(() => { const x = int(r, 1, dd - 1); return gcd(x, dd) === 1 ? x : null; });
      return fill(`${nn}/${dd} giờ = ___ phút`, (60 / dd) * nn, `1 giờ = 60 phút; 60 × ${nn} : ${dd} = ${(60 / dd) * nn} (phút).`, ["phân số của một số", "thời gian"], "1 giờ = 60 phút."); }
  }
};

export const KNTT4 = {
  chanLe, bieuThucChu, baBuoc, doGoc, loaiGoc, docVietSo6: docVietSo(6), docVietSo9: docVietSo(9), daySoTN,
  tinhChatCong: tinhChat("+"), tinhChatNhan: tinhChat("×"), phanPhoi: tinhChat("phanPhoi"),
  vuongGoc: vuongSongSong("vuong"), songSong: vuongSongSong("song"), hbhThoi, rutVeDonVi, daySoLieu, soLanXuatHien,
  docPhanSo, thuongPhanSo, tinhChatPS, quyDong, phanSoCuaSo,
};
