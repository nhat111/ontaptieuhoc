// lib/tvGen/lop4.ts — Luyện từ và câu Tiếng Việt 4 cho phiếu bài tập theo chủ đề.
// Kho câu VIẾT SẴN (không chép sách). Quy tắc để mỗi câu có đúng MỘT đáp án:
//   • danh từ / động từ / tính từ: dùng WORD_CLASSES của trò chơi Từ loại (lib/games4.ts),
//     mỗi từ chỉ thuộc một nhóm;
//   • câu nhân hoá gọi hoặc tả sự vật như người; câu thường không có từ xưng gọi người
//     (ông, bà, chú, cô, chị, anh, bác) và không có lời gọi "ơi";
//   • chủ ngữ, vị ngữ, trạng ngữ và đoạn nhiễu `x` đều là đoạn có thật trong câu.
// scripts/tv-sheet-check.ts kiểm tra phần máy kiểm được. CẦN NGƯỜI DUYỆT.

import { pick } from "../mathGen/core";
import { CLASS_LABEL, WORD_CLASSES, type WordClass } from "../games4";
import { mc, mcFixed, type Generator } from "./core";
import { Q, wrongCaps, type TvMcq } from "./bank";

/* ───────────── Danh từ, động từ, tính từ ───────────── */

const CLASSES = Object.keys(WORD_CLASSES) as WordClass[];

export const tuLoai4 = (cls: WordClass): Generator => (r) => {
  const word = pick(r, WORD_CLASSES[cls]);
  const wrong = CLASSES.filter((c) => c !== cls).flatMap((c) => WORD_CLASSES[c]);
  return mc(`Từ nào dưới đây là ${CLASS_LABEL[cls].toLowerCase()}?`, word, wrong,
    `“${word}” là ${CLASS_LABEL[cls].toLowerCase()}.`, ["từ loại", cls]);
};

export const tuLoaiLaGi4: Generator = (r) => {
  const cls = pick(r, CLASSES);
  const word = pick(r, WORD_CLASSES[cls]);
  return mcFixed(`Từ “${word}” thuộc từ loại nào?`, CLASSES.map((c) => CLASS_LABEL[c]), CLASS_LABEL[cls],
    `“${word}” là ${CLASS_LABEL[cls].toLowerCase()}.`, ["từ loại", cls]);
};

/* ───────────── Danh từ chung, danh từ riêng ───────────── */

export const DT_RIENG = [
  "Hà Nội", "Đà Nẵng", "Cần Thơ", "Lê Lợi", "Trần Hưng Đạo", "Võ Thị Sáu", "Phú Quốc", "Hạ Long", "Trường Sơn",
  "Kim Đồng", "Việt Nam", "Tây Nguyên", "Huế", "Lan", "Minh",
];

export const DT_CHUNG = [
  "thành phố", "dòng sông", "ngọn núi", "hòn đảo", "học sinh", "cô giáo", "anh hùng", "vịnh biển", "đất nước",
  "quyển sách", "con đường", "ngôi trường", "cánh đồng", "bông hoa", "cầu thủ",
];

export const danhTuRieng: Generator = (r) => {
  const right = pick(r, DT_RIENG);
  return mc("Từ nào dưới đây là danh từ riêng?", right, DT_CHUNG,
    `“${right}” là tên riêng của một người hoặc một nơi, được viết hoa — đó là danh từ riêng.`, ["danh từ riêng"]);
};

export const danhTuChung: Generator = (r) => {
  const right = pick(r, DT_CHUNG);
  return mc("Từ nào dưới đây là danh từ chung?", right, DT_RIENG,
    `“${right}” là tên chung của một loại sự vật — đó là danh từ chung.`, ["danh từ chung"]);
};

/* ───────────── Viết hoa tên riêng, tên cơ quan, tổ chức ───────────── */

export type TenKind = "viet" | "nuoc-ngoai" | "to-chuc";

export const TEN: Record<TenKind, string[]> = {
  viet: [
    "Trần Quốc Toản", "Võ Thị Sáu", "Lê Quý Đôn", "Nguyễn Du", "Kim Đồng", "Hải Phòng", "Cần Thơ", "Tây Nguyên",
    "Hà Giang", "Vũng Tàu", "Điện Biên Phủ", "Đồng Tháp",
  ],
  "nuoc-ngoai": [
    "Lu-i Pa-xtơ", "Mát-xcơ-va", "An-đéc-xen", "Pa-ri", "Ma-ri Quy-ri", "Niu-tơn", "Ê-đi-xơn", "Oa-sinh-tơn",
    "Luân Đôn", "Bắc Kinh",
  ],
  "to-chuc": [
    "Bộ Giáo dục và Đào tạo", "Trường Tiểu học Kim Đồng", "Đội Thiếu niên Tiền phong Hồ Chí Minh", "Hội Chữ thập đỏ Việt Nam",
    "Thư viện Quốc gia Việt Nam", "Nhà xuất bản Kim Đồng", "Ủy ban nhân dân thành phố Hà Nội",
  ],
};

const TEN_RULE: Record<TenKind, string> = {
  viet: "Tên người, tên địa lí Việt Nam viết hoa chữ cái đầu của mỗi tiếng.",
  "nuoc-ngoai": "Tên nước ngoài phiên âm viết hoa chữ cái đầu của mỗi bộ phận, các tiếng trong một bộ phận nối với nhau bằng dấu gạch nối; tên phiên âm theo âm Hán Việt (Luân Đôn, Bắc Kinh) viết như tên Việt Nam.",
  "to-chuc": "Tên cơ quan, tổ chức viết hoa chữ cái đầu của mỗi bộ phận tạo thành tên (và tên riêng có trong đó).",
};

const TEN_Q: Record<TenKind, string> = {
  viet: "Tên riêng nào dưới đây viết đúng quy tắc viết hoa?",
  "nuoc-ngoai": "Tên nước ngoài nào dưới đây viết đúng quy tắc?",
  "to-chuc": "Tên cơ quan, tổ chức nào dưới đây viết đúng quy tắc?",
};

export const vietHoa4 = (kind: TenKind): Generator => (r) => {
  const name = pick(r, TEN[kind]);
  return mc(TEN_Q[kind], name, wrongCaps(name), `Viết đúng: “${name}”. ${TEN_RULE[kind]}`, ["viết hoa", kind]);
};

/* ───────────── Nhân hoá ───────────── */

export type NhanHoa = { s: string; vat: string; khac: string[] };

export const NHAN_HOA: NhanHoa[] = [
  { s: "Chị gió dịu dàng ru những tán lá ngủ say.", vat: "gió", khac: ["tán lá"] },
  { s: "Ông mặt trời vươn vai thức dậy sau rặng tre.", vat: "mặt trời", khac: ["rặng tre"] },
  { s: "Bác trống trường nằm im, chờ đến giờ ra chơi.", vat: "trống trường", khac: [] },
  { s: "Cô mây trắng thong thả dạo chơi trên bầu trời.", vat: "mây trắng", khac: ["bầu trời"] },
  { s: "Những chú kiến cần mẫn tha mồi về tổ.", vat: "kiến", khac: ["mồi", "tổ"] },
  { s: "Cây bàng già đứng lặng lẽ, che mát cho chúng em.", vat: "cây bàng", khac: [] },
  { s: "Chú gà trống gân cổ gọi mọi người thức dậy.", vat: "gà trống", khac: [] },
  { s: "Dòng sông mải miết hát bài ca của mình.", vat: "dòng sông", khac: ["bài ca"] },
  { s: "Mấy bông hoa hồng thẹn thùng nép dưới lá.", vat: "hoa hồng", khac: ["lá"] },
  { s: "Trăng ơi, trăng từ đâu đến?", vat: "trăng", khac: [] },
  { s: "Chiếc xe đạp nằm nghỉ ngơi sau một ngày dài.", vat: "xe đạp", khac: [] },
  { s: "Bác xe lu chăm chỉ làm việc trên con đường mới.", vat: "xe lu", khac: ["con đường"] },
];

export const KHONG_NHAN_HOA: string[] = [
  "Gió thổi mạnh làm cây đổ.", "Mặt trời mọc ở đằng đông.", "Trống trường vang lên báo giờ ra chơi.", "Bầu trời có nhiều mây trắng.",
  "Đàn kiến bò thành hàng dài.", "Cây bàng trước cổng trường rất cao.", "Con gà trống có bộ lông sặc sỡ.", "Dòng sông chảy qua cánh đồng.",
  "Vườn nhà em có nhiều hoa hồng.", "Đêm nay trăng rất sáng.", "Chiếc xe đạp của em màu xanh.", "Hôm nay trời mưa to.",
];

/** Từ xưng gọi người — câu thường không được có (sẽ thành nhân hoá). */
export const TU_GOI_NGUOI = ["ông", "bà", "chú", "cô", "chị", "anh", "bác", "ơi"];

export const coNhanHoa: Generator = (r) => {
  const e = pick(r, NHAN_HOA);
  return mc("Câu nào dưới đây có sử dụng biện pháp nhân hoá?", e.s, KHONG_NHAN_HOA,
    `Trong câu “${e.s}”, ${e.vat} được gọi hoặc tả bằng từ ngữ dùng cho người.`, ["nhân hoá"]);
};

export const nhanHoaVat: Generator = (r) => {
  const e = pick(r, NHAN_HOA);
  const others = NHAN_HOA.filter((x) => x !== e && !e.s.toLocaleLowerCase("vi").includes(x.vat)).map((x) => x.vat);
  return mc(`Trong câu “${e.s}”, sự vật nào được nhân hoá?`, e.vat, [...e.khac, ...others].slice(0, Math.max(3, e.khac.length)),
    `${e.vat.charAt(0).toLocaleUpperCase("vi") + e.vat.slice(1)} được gọi hoặc tả bằng từ ngữ dùng cho người.`, ["nhân hoá"]);
};

/* ───────────── Chủ ngữ, vị ngữ, trạng ngữ ─────────────
   `x`: một đoạn khác trong câu (thường là danh từ trong vị ngữ), chỉ dùng làm nhiễu. */

export type TrangNgu = "thoi-gian" | "noi-chon" | "nguyen-nhan" | "muc-dich" | "phuong-tien";

export const TN_LABEL: Record<TrangNgu, string> = {
  "thoi-gian": "Thời gian", "noi-chon": "Nơi chốn", "nguyen-nhan": "Nguyên nhân", "muc-dich": "Mục đích", "phuong-tien": "Phương tiện",
};

const TN_HOI: Record<TrangNgu, string> = {
  "thoi-gian": "Khi nào?", "noi-chon": "Ở đâu?", "nguyen-nhan": "Vì sao?", "muc-dich": "Để làm gì?", "phuong-tien": "Bằng gì?",
};

export type Cau4 = { s: string; cn: string; vn: string; tn?: string; loai?: TrangNgu; x?: string };

export const CAU4: Cau4[] = [
  { s: "Sáng sớm, bà em ra vườn tưới rau.", tn: "Sáng sớm", loai: "thoi-gian", cn: "bà em", vn: "ra vườn tưới rau" },
  { s: "Trên cành cây, mấy chú chim đang hót líu lo.", tn: "Trên cành cây", loai: "noi-chon", cn: "mấy chú chim", vn: "đang hót líu lo" },
  { s: "Nhờ chăm chỉ luyện tập, Hoa đã đạt giải Nhất.", tn: "Nhờ chăm chỉ luyện tập", loai: "nguyen-nhan", cn: "Hoa", vn: "đã đạt giải Nhất", x: "giải Nhất" },
  { s: "Vì trời mưa to, trận bóng đá bị hoãn.", tn: "Vì trời mưa to", loai: "nguyen-nhan", cn: "trận bóng đá", vn: "bị hoãn" },
  { s: "Để bảo vệ môi trường, lớp em nhặt rác quanh trường.", tn: "Để bảo vệ môi trường", loai: "muc-dich", cn: "lớp em", vn: "nhặt rác quanh trường" },
  { s: "Bằng đôi tay khéo léo, mẹ đã khâu cho em chiếc áo mới.", tn: "Bằng đôi tay khéo léo", loai: "phuong-tien", cn: "mẹ", vn: "đã khâu cho em chiếc áo mới", x: "chiếc áo mới" },
  { s: "Mùa xuân, cây cối đâm chồi nảy lộc.", tn: "Mùa xuân", loai: "thoi-gian", cn: "cây cối", vn: "đâm chồi nảy lộc" },
  { s: "Ngoài đồng, các bác nông dân đang gặt lúa.", tn: "Ngoài đồng", loai: "noi-chon", cn: "các bác nông dân", vn: "đang gặt lúa" },
  { s: "Với chiếc xe đạp cũ, bố đưa em đến trường mỗi sáng.", tn: "Với chiếc xe đạp cũ", loai: "phuong-tien", cn: "bố", vn: "đưa em đến trường mỗi sáng" },
  { s: "Để có sức khoẻ tốt, em tập thể dục hằng ngày.", tn: "Để có sức khoẻ tốt", loai: "muc-dich", cn: "em", vn: "tập thể dục hằng ngày" },
  { s: "Tối qua, cả nhà em quây quần xem ti vi.", tn: "Tối qua", loai: "thoi-gian", cn: "cả nhà em", vn: "quây quần xem ti vi" },
  { s: "Tại thư viện, các bạn đang say sưa đọc sách.", tn: "Tại thư viện", loai: "noi-chon", cn: "các bạn", vn: "đang say sưa đọc sách" },
  { s: "Do mải chơi, Tuấn quên làm bài tập.", tn: "Do mải chơi", loai: "nguyen-nhan", cn: "Tuấn", vn: "quên làm bài tập", x: "bài tập" },
  { s: "Bằng giọng nói ấm áp, cô giáo kể cho chúng em nghe một câu chuyện.", tn: "Bằng giọng nói ấm áp", loai: "phuong-tien", cn: "cô giáo", vn: "kể cho chúng em nghe một câu chuyện" },
  { s: "Để chuẩn bị cho ngày khai giảng, các bạn trang trí lớp học.", tn: "Để chuẩn bị cho ngày khai giảng", loai: "muc-dich", cn: "các bạn", vn: "trang trí lớp học" },
  { s: "Đàn gà con chạy theo mẹ kiếm mồi.", cn: "Đàn gà con", vn: "chạy theo mẹ kiếm mồi", x: "kiếm mồi" },
  { s: "Bạn Lan là lớp trưởng lớp em.", cn: "Bạn Lan", vn: "là lớp trưởng lớp em", x: "lớp trưởng" },
  { s: "Những bông hoa cúc vàng rực trong nắng sớm.", cn: "Những bông hoa cúc", vn: "vàng rực trong nắng sớm", x: "nắng sớm" },
  { s: "Con đường làng em rợp bóng tre xanh.", cn: "Con đường làng em", vn: "rợp bóng tre xanh", x: "tre xanh" },
  { s: "Chú bộ đội đứng gác ngoài biên cương.", cn: "Chú bộ đội", vn: "đứng gác ngoài biên cương", x: "biên cương" },
];

const extra = (e: Cau4) => [e.tn, e.x].filter((x): x is string => !!x);

export const chuNgu4: Generator = (r) => {
  const e = pick(r, CAU4);
  return mc(`Chủ ngữ của câu “${e.s}” là bộ phận nào?`, e.cn, [e.vn, ...extra(e)],
    `“${e.cn}” cho biết ai (cái gì, con gì) được nói đến — đó là chủ ngữ; vị ngữ là “${e.vn}”.`, ["chủ ngữ"]);
};

export const viNgu4: Generator = (r) => {
  const e = pick(r, CAU4);
  return mc(`Vị ngữ của câu “${e.s}” là bộ phận nào?`, e.vn, [e.cn, ...extra(e)],
    `“${e.vn}” nói về hoạt động, đặc điểm của “${e.cn}” — đó là vị ngữ.`, ["vị ngữ"]);
};

const CO_TN = CAU4.filter((e) => e.tn && e.loai);

export const trangNgu4: Generator = (r) => {
  const e = pick(r, CO_TN);
  return mc(`Trạng ngữ của câu “${e.s}” là bộ phận nào?`, e.tn!, [e.cn, e.vn, ...(e.x ? [e.x] : [])],
    `“${e.tn}” đứng đầu câu, ngăn cách bằng dấu phẩy, cho biết ${TN_LABEL[e.loai!].toLowerCase()} — đó là trạng ngữ.`, ["trạng ngữ"]);
};

const TN_KINDS = Object.keys(TN_LABEL) as TrangNgu[];

export const trangNguChiGi: Generator = (r) => {
  const e = pick(r, CO_TN);
  return mcFixed(`Trạng ngữ “${e.tn}” trong câu “${e.s}” chỉ gì?`, TN_KINDS.map((k) => TN_LABEL[k]), TN_LABEL[e.loai!],
    `“${e.tn}” trả lời câu hỏi “${TN_HOI[e.loai!]}” nên là trạng ngữ chỉ ${TN_LABEL[e.loai!].toLowerCase()}.`, ["trạng ngữ", e.loai!]);
};

/* ───────────── Dấu câu ───────────── */

const OTHER = ["Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh", "Ngăn cách trạng ngữ với chủ ngữ và vị ngữ"];

export const DAU_CAU4: TvMcq[] = [
  Q("Trong câu: Bố bảo: “Con phải học bài trước khi đi chơi.” Dấu ngoặc kép dùng để làm gì?", "Đánh dấu lời nói trực tiếp của nhân vật", OTHER, "Phần trong ngoặc kép là lời bố nói."),
  Q("Trong câu: Đà Lạt (Lâm Đồng) có nhiều loài hoa đẹp. Dấu ngoặc đơn dùng để làm gì?", "Đánh dấu phần chú thích", ["Đánh dấu lời nói trực tiếp của nhân vật", "Nối các từ ngữ trong một liên danh", "Kết thúc câu"], "“Lâm Đồng” chú thích Đà Lạt thuộc tỉnh nào."),
  Q("Trong câu: Cuộc thi chạy tiếp sức Hà Nội – Huế diễn ra sôi nổi. Dấu gạch ngang dùng để làm gì?", "Nối các từ ngữ trong một liên danh", ["Đánh dấu lời nói trực tiếp của nhân vật", "Đánh dấu phần chú thích", "Kết thúc câu"], "Dấu gạch ngang nối hai địa danh là điểm đầu và điểm cuối của cuộc thi."),
  Q("Trong câu: Em gọi chú mèo nhà mình là “ông hoàng ngủ nướng”. Dấu ngoặc kép dùng để làm gì?", "Đánh dấu từ ngữ được dùng với ý nghĩa đặc biệt", ["Đánh dấu lời nói trực tiếp của nhân vật", "Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh"], "“ông hoàng ngủ nướng” là cách gọi vui, có ý nghĩa đặc biệt."),
  Q("Trong đoạn “Lớp em có ba câu lạc bộ: – bóng đá; – cờ vua; – vẽ.”, dấu gạch ngang dùng để làm gì?", "Đánh dấu các ý được liệt kê", ["Đánh dấu lời nói trực tiếp của nhân vật", "Nối các từ ngữ trong một liên danh", "Kết thúc câu"], "Mỗi câu lạc bộ được kể ra sau một dấu gạch ngang."),
  Q("Trong câu: Thầy giáo hỏi: “Em nào xung phong lên bảng?” Dấu ngoặc kép dùng để làm gì?", "Đánh dấu lời nói trực tiếp của nhân vật", OTHER, "Phần trong ngoặc kép là câu thầy giáo hỏi."),
  Q("Trong câu: Sa Pa (Lào Cai) là nơi có khí hậu mát mẻ. Dấu ngoặc đơn dùng để làm gì?", "Đánh dấu phần chú thích", ["Đánh dấu lời nói trực tiếp của nhân vật", "Nối các từ ngữ trong một liên danh", "Kết thúc câu"], "“Lào Cai” chú thích Sa Pa thuộc tỉnh nào."),
  Q("Trong câu: Tuyến xe buýt Bến Thành – Chợ Lớn rất đông khách. Dấu gạch ngang dùng để làm gì?", "Nối các từ ngữ trong một liên danh", ["Đánh dấu lời nói trực tiếp của nhân vật", "Đánh dấu phần chú thích", "Kết thúc câu"], "Dấu gạch ngang nối điểm đầu và điểm cuối của tuyến xe buýt."),
  Q("Trong đoạn hội thoại “– Mẹ ơi, con về rồi! – Con vào rửa tay đi!”, dấu gạch ngang dùng để làm gì?", "Đánh dấu lời nói trực tiếp của nhân vật", ["Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh", "Đánh dấu các ý được liệt kê"], "Mỗi lượt lời của nhân vật bắt đầu bằng dấu gạch ngang."),
  Q("Trong câu: Bà gọi em là “cô bé hạt tiêu”. Dấu ngoặc kép dùng để làm gì?", "Đánh dấu từ ngữ được dùng với ý nghĩa đặc biệt", ["Đánh dấu lời nói trực tiếp của nhân vật", "Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh"], "“cô bé hạt tiêu” là cách gọi vui, có ý nghĩa đặc biệt."),
  Q("Trong câu: Lan reo lên: “A, mẹ về rồi!” Dấu ngoặc kép dùng để làm gì?", "Đánh dấu lời nói trực tiếp của nhân vật", OTHER, "Phần trong ngoặc kép là lời Lan reo lên."),
  Q("Trong câu: Hồ Ba Bể (Bắc Kạn) có phong cảnh rất đẹp. Dấu ngoặc đơn dùng để làm gì?", "Đánh dấu phần chú thích", ["Đánh dấu lời nói trực tiếp của nhân vật", "Nối các từ ngữ trong một liên danh", "Kết thúc câu"], "“Bắc Kạn” chú thích hồ Ba Bể ở tỉnh nào."),
  Q("Trong câu: Cả nhà em đi chuyến tàu Hà Nội – Lào Cai. Dấu gạch ngang dùng để làm gì?", "Nối các từ ngữ trong một liên danh", ["Đánh dấu lời nói trực tiếp của nhân vật", "Đánh dấu phần chú thích", "Kết thúc câu"], "Dấu gạch ngang nối ga đầu và ga cuối của chuyến tàu."),
  Q("Trong đoạn “Mẹ dặn em: – học bài; – tưới cây; – cho mèo ăn.”, dấu gạch ngang dùng để làm gì?", "Đánh dấu các ý được liệt kê", ["Đánh dấu lời nói trực tiếp của nhân vật", "Nối các từ ngữ trong một liên danh", "Kết thúc câu"], "Mỗi việc mẹ dặn được kể ra sau một dấu gạch ngang."),
  Q("Trong câu: Vịnh Hạ Long (Quảng Ninh) được công nhận là Di sản thiên nhiên thế giới. Phần nào được đặt trong dấu ngoặc đơn?", "Quảng Ninh", ["Vịnh Hạ Long", "Di sản thiên nhiên thế giới", "thế giới"], "Dấu ngoặc đơn bao quanh phần chú thích “Quảng Ninh”."),
];
