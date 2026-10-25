// lib/tvGen/lop3.ts — Luyện từ và câu Tiếng Việt 3 cho phiếu bài tập theo chủ đề.
// Kho câu SOẠN TAY (không chép sách). Quy tắc để mỗi câu có đúng MỘT đáp án:
//   • câu mẫu của mỗi kiểu câu (kể / hỏi / cảm / khiến) chỉ thuộc một kiểu;
//   • câu so sánh có đúng một từ so sánh, câu thường không có từ so sánh nào;
//   • bộ phận Khi nào? / Ở đâu? / Bằng gì? / Để làm gì? và các bộ phận nhiễu đều là
//     đoạn có thật trong câu, bộ phận nhiễu không trả lời được câu hỏi đang hỏi;
//   • cặp từ trái nghĩa gần nhau (to – nhỏ / cao – thấp…) không làm nhiễu cho nhau.
// scripts/tv-sheet-check.ts kiểm tra phần máy kiểm được. CẦN NGƯỜI DUYỆT.

import { pick, shuffle } from "../mathGen/core";
import { WORD_PAIRS } from "../games3";
import { itemRng, mc, mcFixed, type Generator } from "./core";

/* ───────────── Câu kể, câu hỏi, câu cảm, câu khiến ───────────── */

export type CauKind = "ke" | "hoi" | "cam" | "khien";

export const CAU_LABEL: Record<CauKind, string> = { ke: "Câu kể", hoi: "Câu hỏi", cam: "Câu cảm", khien: "Câu khiến" };

const CAU_WHY: Record<CauKind, string> = {
  ke: "dùng để kể, tả hoặc giới thiệu, cuối câu có dấu chấm",
  hoi: "dùng để hỏi, cuối câu có dấu chấm hỏi",
  cam: "dùng để bộc lộ cảm xúc (vui mừng, ngạc nhiên, thán phục…), thường có từ ôi, chà, quá, thật và dấu chấm than",
  khien: "dùng để yêu cầu, đề nghị, mời, thường có từ hãy, đừng, mời",
};

export const CAU: Record<CauKind, string[]> = {
  ke: [
    "Sáng nay, lớp em trồng cây ở vườn trường.", "Chú mèo nằm sưởi nắng bên hiên nhà.", "Bà em trồng một khóm cúc trước sân.",
    "Hôm qua, trời mưa rất to.", "Bạn Hoa viết chữ rất đẹp.", "Đàn vịt bơi trên mặt ao.", "Em thường đọc truyện trước khi ngủ.",
    "Mẹ em là y tá.",
  ],
  hoi: [
    "Bạn đã làm xong bài tập chưa?", "Nhà bạn ở đâu?", "Vì sao lá cây có màu xanh?", "Ai là lớp trưởng lớp bạn?",
    "Bao giờ lớp mình đi tham quan?", "Bạn thích môn học nào nhất?", "Con mèo nhà bạn tên là gì?", "Mấy giờ buổi biểu diễn bắt đầu?",
  ],
  cam: [
    "Ôi, bông hoa đẹp quá!", "Chà, chiếc bánh thơm thật!", "Ồ, bầu trời hôm nay xanh quá!", "Bạn Lan hát hay quá!",
    "Ôi chao, con diều bay cao quá!", "Chà, khu vườn rộng thật!", "Ôi, nước suối mát quá!", "Oa, bức tranh đẹp tuyệt!",
  ],
  khien: [
    "Các em hãy giữ trật tự!", "Con hãy tắt đèn trước khi ra khỏi phòng.", "Bạn đừng vứt rác ra sân trường nhé!",
    "Mời các bạn vào lớp.", "Em hãy đọc to bài thơ.", "Các con đừng chơi gần ao hồ.", "Cả lớp hãy mở sách ra.",
    "Mời bà ngồi ghế này ạ.",
  ],
};

const CAU_KINDS = Object.keys(CAU) as CauKind[];

/** "Câu nào dưới đây là câu khiến?" — một câu đúng kiểu, mỗi kiểu còn lại một câu. */
export const cauKieu = (kind: CauKind): Generator => (r) => {
  const right = pick(r, CAU[kind]);
  // Nhiễu rút theo chính câu đúng (itemRng): cùng câu đúng → cùng dòng, bộ lọc câu trùng bỏ được.
  const ir = itemRng("cau-kieu", right);
  const wrong = CAU_KINDS.filter((k) => k !== kind).map((k) => pick(ir, CAU[k]));
  return mc(`Câu nào dưới đây là ${CAU_LABEL[kind].toLowerCase()}?`, right, wrong,
    `“${right}” là ${CAU_LABEL[kind].toLowerCase()}: câu ${CAU_WHY[kind]}.`, ["kiểu câu", kind]);
};

/** "Câu “…” thuộc kiểu câu nào?" — bốn lựa chọn cố định. */
export const cauLaKieuGi: Generator = (r) => {
  const kind = pick(r, CAU_KINDS);
  const s = pick(r, CAU[kind]);
  return mcFixed(`Câu “${s}” thuộc kiểu câu nào?`, CAU_KINDS.map((k) => CAU_LABEL[k]), CAU_LABEL[kind],
    `Đây là ${CAU_LABEL[kind].toLowerCase()}: câu ${CAU_WHY[kind]}.`, ["kiểu câu", kind]);
};

/* ───────────── So sánh ─────────────
   `a` được so sánh với `b` qua từ so sánh `tu`; cả ba là đoạn có thật trong câu. */

export type SoSanh = { s: string; a: string; tu: string; b: string };

export const SO_SANH: SoSanh[] = [
  { s: "Mặt trăng tròn như cái đĩa bạc.", a: "Mặt trăng", tu: "như", b: "cái đĩa bạc" },
  { s: "Những ngôi sao lấp lánh như những ngọn đèn nhỏ.", a: "Những ngôi sao", tu: "như", b: "những ngọn đèn nhỏ" },
  { s: "Trẻ em như búp trên cành.", a: "Trẻ em", tu: "như", b: "búp trên cành" },
  { s: "Hai má em bé đỏ hồng như quả táo chín.", a: "Hai má em bé", tu: "như", b: "quả táo chín" },
  { s: "Mặt hồ phẳng lặng như một tấm gương.", a: "Mặt hồ", tu: "như", b: "một tấm gương" },
  { s: "Tiếng ve râm ran như một dàn đồng ca.", a: "Tiếng ve", tu: "như", b: "một dàn đồng ca" },
  { s: "Cánh đồng lúa chín vàng như một tấm thảm khổng lồ.", a: "Cánh đồng lúa", tu: "như", b: "một tấm thảm khổng lồ" },
  { s: "Mặt trời buổi sớm đỏ như quả cầu lửa.", a: "Mặt trời buổi sớm", tu: "như", b: "quả cầu lửa" },
  { s: "Đôi mắt chú mèo tròn xoe như hai hòn bi ve.", a: "Đôi mắt chú mèo", tu: "như", b: "hai hòn bi ve" },
  { s: "Bàn tay mẹ ấm áp như nắng mùa xuân.", a: "Bàn tay mẹ", tu: "như", b: "nắng mùa xuân" },
  { s: "Cây cầu cong cong giống như chiếc võng.", a: "Cây cầu", tu: "giống như", b: "chiếc võng" },
  { s: "Những bông cúc vàng tươi tựa những đốm nắng.", a: "Những bông cúc", tu: "tựa", b: "những đốm nắng" },
  { s: "Quê hương là cánh diều biếc.", a: "Quê hương", tu: "là", b: "cánh diều biếc" },
  { s: "Tiếng suối ngân nga như tiếng đàn.", a: "Tiếng suối", tu: "như", b: "tiếng đàn" },
  { s: "Đàn cò trắng bay lượn như những bông hoa giữa trời.", a: "Đàn cò trắng", tu: "như", b: "những bông hoa giữa trời" },
  { s: "Bông hoa súng tím biếc như chiếc chén nhỏ.", a: "Bông hoa súng", tu: "như", b: "chiếc chén nhỏ" },
];

/** Câu thường, không có hình ảnh so sánh — làm nhiễu cho "Câu nào có hình ảnh so sánh?". */
export const KHONG_SO_SANH: string[] = [
  "Mặt trăng đêm nay rất sáng.", "Bầu trời đêm có nhiều sao.", "Em bé đang ngủ ngon.", "Mặt hồ rộng mênh mông.",
  "Đàn cò bay qua cánh đồng.", "Mẹ em nấu cơm rất ngon.", "Cây bàng trước lớp đã ra lá non.", "Chú mèo nằm ngủ dưới gốc cây.",
  "Sân trường rợp bóng cây xanh.", "Ông em đang đọc báo.", "Hôm nay trời nắng đẹp.", "Dòng sông chảy qua làng em.",
];

/** Từ so sánh có thể có trong câu — câu thường không được chứa từ nào. */
export const TU_SO_SANH = ["như", "là", "tựa", "giống", "bằng", "hơn", "kém"];

export const coSoSanh: Generator = (r) => {
  const e = pick(r, SO_SANH);
  return mc("Câu nào dưới đây có hình ảnh so sánh?", e.s, KHONG_SO_SANH,
    `Câu “${e.s}” so sánh “${e.a}” với “${e.b}” qua từ “${e.tu}”.`, ["so sánh"]);
};

const lower = (s: string) => s.charAt(0).toLocaleLowerCase("vi") + s.slice(1);

export const soSanhVoi: Generator = (r) => {
  const e = pick(r, SO_SANH);
  const wrong = SO_SANH.filter((x) => x !== e).map((x) => x.b);
  return mc(`Trong câu “${e.s}”, ${lower(e.a)} được so sánh với gì?`, e.b, wrong,
    `Sau từ so sánh “${e.tu}” là “${e.b}”.`, ["so sánh"]);
};

const SO_SANH_NHU = SO_SANH.filter((e) => e.tu === "như");

export const dienTuSoSanh: Generator = (r) => {
  const e = pick(r, SO_SANH_NHU);
  const shown = e.s.replace(` như `, " … ");
  return mc(`Chọn từ thích hợp điền vào chỗ trống: “${shown}”`, "như", ["và", "nhưng", "vì", "nên"],
    `Cần một từ so sánh để nối “${e.a}” với “${e.b}”: “${e.s}”`, ["so sánh"]);
};

/* ───────────── Khi nào? Ở đâu? Bằng gì? Để làm gì? ─────────────
   `ai`, `lam` là bộ phận chỉ người/vật và hoạt động — dùng làm nhiễu, không trả lời được
   bốn câu hỏi trên. Mọi bộ phận phải là đoạn có thật trong câu. */

export type HoiKey = "khi" | "o" | "bang" | "de";

export const HOI_LABEL: Record<HoiKey, string> = { khi: "Khi nào?", o: "Ở đâu?", bang: "Bằng gì?", de: "Để làm gì?" };

const HOI_WHY: Record<HoiKey, string> = {
  khi: "chỉ thời gian", o: "chỉ nơi chốn", bang: "chỉ phương tiện hoặc chất liệu", de: "chỉ mục đích",
};

export type HoiCau = { s: string; ai: string; lam: string } & Partial<Record<HoiKey, string>>;

export const HOI_CAU: HoiCau[] = [
  { s: "Sáng sớm, ông em tập thể dục ngoài sân.", ai: "ông em", lam: "tập thể dục", khi: "Sáng sớm", o: "ngoài sân" },
  { s: "Mùa hè, hoa phượng nở đỏ rực trên sân trường.", ai: "hoa phượng", lam: "nở đỏ rực", khi: "Mùa hè", o: "trên sân trường" },
  { s: "Em đến trường bằng xe đạp.", ai: "Em", lam: "đến trường", bang: "bằng xe đạp" },
  { s: "Chiếc ghế này được làm bằng gỗ.", ai: "Chiếc ghế này", lam: "được làm", bang: "bằng gỗ" },
  { s: "Bà em ra chợ để mua rau.", ai: "Bà em", lam: "ra chợ", de: "để mua rau" },
  { s: "Chúng em trồng cây để bảo vệ môi trường.", ai: "Chúng em", lam: "trồng cây", de: "để bảo vệ môi trường" },
  { s: "Tối nay, cả nhà em xem xiếc ở rạp.", ai: "cả nhà em", lam: "xem xiếc", khi: "Tối nay", o: "ở rạp" },
  { s: "Bạn Minh vẽ bức tranh bằng bút sáp màu.", ai: "Bạn Minh", lam: "vẽ bức tranh", bang: "bằng bút sáp màu" },
  { s: "Vào thứ Hai, lớp em chào cờ dưới sân trường.", ai: "lớp em", lam: "chào cờ", khi: "Vào thứ Hai", o: "dưới sân trường" },
  { s: "Mẹ đan cho em chiếc khăn bằng len.", ai: "Mẹ", lam: "đan cho em chiếc khăn", bang: "bằng len" },
  { s: "Bố dậy sớm để tưới cây.", ai: "Bố", lam: "dậy sớm", de: "để tưới cây" },
  { s: "Trong vườn, chim hót líu lo.", ai: "chim", lam: "hót líu lo", o: "Trong vườn" },
  { s: "Đàn cá bơi lội tung tăng dưới hồ.", ai: "Đàn cá", lam: "bơi lội tung tăng", o: "dưới hồ" },
  { s: "Năm nay, em lên lớp Ba.", ai: "em", lam: "lên lớp Ba", khi: "Năm nay" },
  { s: "Các bạn nhỏ đi tham quan bảo tàng bằng xe buýt.", ai: "Các bạn nhỏ", lam: "đi tham quan bảo tàng", bang: "bằng xe buýt" },
  { s: "Em chăm chỉ học bài để bố mẹ vui lòng.", ai: "Em", lam: "chăm chỉ học bài", de: "để bố mẹ vui lòng" },
  { s: "Khi trời mưa, chú mèo nằm cuộn tròn trong bếp.", ai: "chú mèo", lam: "nằm cuộn tròn", khi: "Khi trời mưa", o: "trong bếp" },
  { s: "Cô giáo viết bài lên bảng bằng phấn trắng.", ai: "Cô giáo", lam: "viết bài lên bảng", bang: "bằng phấn trắng" },
  { s: "Chiều chủ nhật, em cùng bạn thả diều trên đê.", ai: "em cùng bạn", lam: "thả diều", khi: "Chiều chủ nhật", o: "trên đê" },
  { s: "Người dân đắp đê để ngăn lũ.", ai: "Người dân", lam: "đắp đê", de: "để ngăn lũ" },
];

export const HOI_KEYS = Object.keys(HOI_LABEL) as HoiKey[];

/** "Bộ phận nào trong câu “…” trả lời câu hỏi “Ở đâu?”?" */
export const boPhanTraLoi = (keys: HoiKey[] = HOI_KEYS): Generator => (r) => {
  const key = pick(r, keys);
  const e = pick(r, HOI_CAU.filter((x) => x[key]));
  const right = e[key]!;
  const wrong = [e.ai, e.lam, ...HOI_KEYS.filter((k) => k !== key && e[k]).map((k) => e[k]!)];
  return mc(`Bộ phận nào trong câu “${e.s}” trả lời câu hỏi “${HOI_LABEL[key]}”?`, right, wrong,
    `“${right}” ${HOI_WHY[key]} nên trả lời câu hỏi “${HOI_LABEL[key]}”.`, ["câu hỏi", key]);
};

/** "Bộ phận “…” trong câu “…” trả lời cho câu hỏi nào?" — bốn lựa chọn cố định. */
export const traLoiCauHoiNao: Generator = (r) => {
  const e = pick(r, HOI_CAU);
  const key = pick(r, HOI_KEYS.filter((k) => e[k]));
  const part = e[key]!;
  return mcFixed(`Bộ phận “${part}” trong câu “${e.s}” trả lời cho câu hỏi nào?`,
    HOI_KEYS.map((k) => HOI_LABEL[k]), HOI_LABEL[key],
    `“${part}” ${HOI_WHY[key]} nên trả lời câu hỏi “${HOI_LABEL[key]}”.`, ["câu hỏi", key]);
};

/* ───────────── Từ có nghĩa giống nhau, trái ngược nhau ─────────────
   Dùng lại các cặp đã soát của trò chơi Lật thẻ từ (lib/games3.ts → WORD_PAIRS). */

const TRAI = WORD_PAIRS["trai-nghia"];
const GIONG = WORD_PAIRS["cung-nghia"];

/**
 * Các cặp trái nghĩa gần nhau: từ của cặp này không làm nhiễu cho cặp kia, vì bé có thể
 * cãi là cũng trái nghĩa ("rộng" – "nhỏ", "đầy" – "ít", "sáng" – "đen").
 */
export const TRAI_GAN: string[][] = [
  ["to", "cao", "dài", "rộng", "dày"],
  ["ít", "đầy"],
  ["nhanh", "sớm"],
  ["sáng", "trắng"],
  ["già", "cũ"],
  ["khoẻ", "nặng"],
];

const pairOf = (w: string, list: [string, string][]) => list.find(([a, b]) => a === w || b === w);
const mate = (w: string, p: [string, string]) => (p[0] === w ? p[1] : p[0]);
const groupOf = (p: [string, string]) => TRAI_GAN.find((g) => g.includes(p[0]));

export const traiNghia: Generator = (r) => {
  const p = pick(r, TRAI);
  const w = pick(r, p);
  const right = mate(w, p);
  const g = groupOf(p);
  const same = pairOf(w, GIONG);
  const others = shuffle(itemRng("trai", w), TRAI.filter((x) => x !== p && (!g || !g.includes(x[0]))).flat());
  // Từ cùng nghĩa với từ đã cho là đáp án nhiễu "bẫy" hay gặp nhất — luôn đưa vào nếu có.
  const wrong = (same ? [mate(w, same), ...others] : others).slice(0, 3);
  return mc(`Từ nào có nghĩa trái ngược với từ “${w}”?`, right, wrong,
    `“${w}” và “${right}” có nghĩa trái ngược nhau.`, ["trái nghĩa"]);
};

export const dongNghia: Generator = (r) => {
  const p = pick(r, GIONG);
  const w = pick(r, p);
  const right = mate(w, p);
  const anti = pairOf(w, TRAI);
  const others = shuffle(itemRng("giong", w), GIONG.filter((x) => x !== p).flat().filter((x) => x !== w && x !== right));
  const wrong = [...new Set(anti ? [mate(w, anti), ...others] : others)].slice(0, 3);
  return mc(`Từ nào có nghĩa giống với từ “${w}”?`, right, wrong,
    `“${w}” và “${right}” có nghĩa giống nhau.`, ["cùng nghĩa"]);
};

export const capTuTraiNghia: Generator = (r) => {
  const p = pick(r, TRAI);
  const right = `${p[0]} – ${p[1]}`;
  const wrong = GIONG.map(([a, b]) => `${a} – ${b}`);
  return mc("Cặp từ nào dưới đây có nghĩa trái ngược nhau?", right, wrong,
    `“${p[0]}” và “${p[1]}” có nghĩa trái ngược nhau; các cặp còn lại có nghĩa giống nhau.`, ["trái nghĩa"]);
};

export const capTuDongNghia: Generator = (r) => {
  const p = pick(r, GIONG);
  const right = `${p[0]} – ${p[1]}`;
  const wrong = TRAI.map(([a, b]) => `${a} – ${b}`);
  return mc("Cặp từ nào dưới đây có nghĩa giống nhau?", right, wrong,
    `“${p[0]}” và “${p[1]}” có nghĩa giống nhau; các cặp còn lại có nghĩa trái ngược nhau.`, ["cùng nghĩa"]);
};

/* ───────────── Dấu câu: chấm, chấm hỏi, chấm than, phẩy, hai chấm, gạch ngang ─────────────
   "□" là chỗ đặt dấu. Đáp án nhiễu ghi tay cho từng câu, chỉ gồm dấu chắc chắn sai. */

type DauCau = { s: string; dau: string; wrong: string[]; why: string };

export const DAU_DIEN: DauCau[] = [
  { s: "Mẹ dặn em □ “Con nhớ học bài nhé!”", dau: "Dấu hai chấm", wrong: ["Dấu chấm hỏi", "Dấu phẩy", "Dấu chấm than"], why: "Trước lời nói của nhân vật đặt dấu hai chấm." },
  { s: "Bé reo lên □ “Mẹ về rồi!”", dau: "Dấu hai chấm", wrong: ["Dấu chấm hỏi", "Dấu phẩy", "Dấu chấm"], why: "Trước lời nói của nhân vật đặt dấu hai chấm." },
  { s: "Bạn Nam hỏi cô giáo □ “Thưa cô, ngày mai lớp mình có học vẽ không ạ?”", dau: "Dấu hai chấm", wrong: ["Dấu chấm hỏi", "Dấu phẩy", "Dấu chấm than"], why: "Trước lời nói của nhân vật đặt dấu hai chấm." },
  { s: "Vườn nhà em trồng nhiều loại cây □ cam, bưởi, nhãn, ổi.", dau: "Dấu hai chấm", wrong: ["Dấu chấm hỏi", "Dấu chấm than", "Dấu gạch ngang"], why: "Trước phần liệt kê (cam, bưởi, nhãn, ổi) đặt dấu hai chấm." },
  { s: "Em mang đủ đồ dùng học tập □ sách, vở, bút, thước.", dau: "Dấu hai chấm", wrong: ["Dấu chấm hỏi", "Dấu chấm than", "Dấu gạch ngang"], why: "Trước phần liệt kê (sách, vở, bút, thước) đặt dấu hai chấm." },
  { s: "Bạn có thích đọc truyện cổ tích không □", dau: "Dấu chấm hỏi", wrong: ["Dấu chấm", "Dấu hai chấm", "Dấu phẩy"], why: "Đây là câu hỏi nên cuối câu đặt dấu chấm hỏi." },
  { s: "Hôm nay là thứ mấy □", dau: "Dấu chấm hỏi", wrong: ["Dấu chấm", "Dấu hai chấm", "Dấu phẩy"], why: "Đây là câu hỏi nên cuối câu đặt dấu chấm hỏi." },
  { s: "Ai đang hát ngoài sân thế □", dau: "Dấu chấm hỏi", wrong: ["Dấu chấm", "Dấu hai chấm", "Dấu phẩy"], why: "Đây là câu hỏi nên cuối câu đặt dấu chấm hỏi." },
  { s: "Ôi, con diều bay cao quá □", dau: "Dấu chấm than", wrong: ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu phẩy"], why: "Câu bộc lộ cảm xúc nên cuối câu đặt dấu chấm than." },
  { s: "Chà, bức tranh đẹp quá □", dau: "Dấu chấm than", wrong: ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu phẩy"], why: "Câu bộc lộ cảm xúc nên cuối câu đặt dấu chấm than." },
  { s: "Bố em là bộ đội □", dau: "Dấu chấm", wrong: ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu phẩy"], why: "Câu kể (giới thiệu) nên cuối câu đặt dấu chấm." },
  { s: "Đàn gà đang mổ thóc ngoài sân □", dau: "Dấu chấm", wrong: ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu phẩy"], why: "Câu kể nên cuối câu đặt dấu chấm." },
  { s: "Trong lớp □ các bạn chăm chú nghe cô giảng bài.", dau: "Dấu phẩy", wrong: ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu chấm than"], why: "Dấu phẩy ngăn cách bộ phận chỉ nơi chốn “Trong lớp” với phần còn lại của câu." },
  { s: "Ngày mai □ lớp em đi tham quan vườn bách thú.", dau: "Dấu phẩy", wrong: ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu chấm than"], why: "Dấu phẩy ngăn cách bộ phận chỉ thời gian “Ngày mai” với phần còn lại của câu." },
  { s: "Sáng nào □ ông em cũng tưới cây.", dau: "Dấu phẩy", wrong: ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu chấm than"], why: "Dấu phẩy ngăn cách bộ phận chỉ thời gian “Sáng nào” với phần còn lại của câu." },
];

export const DAU_CONG_DUNG: DauCau[] = [
  { s: "Dấu hai chấm trong câu “Vườn nhà em có nhiều loại hoa: hồng, cúc, huệ.” dùng để làm gì?", dau: "Báo hiệu phần liệt kê", wrong: ["Đánh dấu câu hỏi", "Kết thúc câu", "Báo hiệu lời nói của nhân vật"], why: "Sau dấu hai chấm là các loại hoa được kể ra." },
  { s: "Trong câu Bạn Hà nói: “Tớ thích đọc truyện.”, dấu hai chấm dùng để làm gì?", dau: "Báo hiệu lời nói của nhân vật", wrong: ["Báo hiệu phần liệt kê", "Kết thúc câu", "Ngăn cách các từ cùng loại"], why: "Sau dấu hai chấm là lời bạn Hà nói." },
  { s: "Dấu gạch ngang ở đầu dòng “– Cháu chào bà ạ!” dùng để làm gì?", dau: "Đánh dấu lời nói của nhân vật", wrong: ["Báo hiệu phần liệt kê", "Kết thúc câu", "Ngăn cách các từ cùng loại"], why: "Dấu gạch ngang đặt ở đầu dòng để đánh dấu lời nói của nhân vật." },
  { s: "Dấu phẩy trong câu “Em mua sách, vở, bút chì.” dùng để làm gì?", dau: "Ngăn cách các từ cùng loại", wrong: ["Kết thúc câu", "Đánh dấu lời nói của nhân vật", "Báo hiệu câu hỏi"], why: "Dấu phẩy ngăn cách “sách”, “vở”, “bút chì” — các từ cùng chỉ đồ dùng học tập." },
  { s: "Dấu phẩy trong câu “Buổi sáng, em đi học.” dùng để làm gì?", dau: "Ngăn cách bộ phận chỉ thời gian với phần còn lại", wrong: ["Kết thúc câu", "Đánh dấu lời nói của nhân vật", "Báo hiệu phần liệt kê"], why: "“Buổi sáng” chỉ thời gian, dấu phẩy ngăn cách nó với “em đi học”." },
  { s: "Dấu chấm hỏi thường đặt ở cuối câu nào?", dau: "Câu hỏi", wrong: ["Câu kể", "Câu khiến", "Câu cảm"], why: "Cuối câu hỏi đặt dấu chấm hỏi." },
];

export const dienDauCau: Generator = (r) => {
  const e = pick(r, DAU_DIEN);
  return mc(`Dấu câu nào thích hợp đặt vào ô trống? ${e.s}`, e.dau, e.wrong, e.why, ["dấu câu"]);
};

export const congDungDau: Generator = (r) => {
  const e = pick(r, DAU_CONG_DUNG);
  return mc(e.s, e.dau, e.wrong, e.why, ["dấu câu"]);
};
