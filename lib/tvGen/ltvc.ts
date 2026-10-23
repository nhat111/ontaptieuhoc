// lib/tvGen/ltvc.ts — Luyện từ và câu, viết hoa, bảng chữ cái cho Tiếng Việt 2.
// Kho từ, câu SOẠN TAY (không chép sách). Quy tắc để câu có đúng MỘT đáp án:
//   • một từ chỉ thuộc một nhóm (sự vật / hoạt động / đặc điểm), không có từ vừa là
//     sự vật vừa là hoạt động (cưa, quạt, cuốc…);
//   • câu mẫu của mỗi kiểu câu chỉ trả lời đúng một câu hỏi Ai là gì? / Ai làm gì? / Ai thế nào?;
//   • đáp án nhiễu của phần mở rộng vốn từ phải sai rõ ràng với chủ đề.
// scripts/sgk-tv-check.ts kiểm tra phần máy kiểm được. CẦN NGƯỜI DUYỆT.

import { pick, shuffle, type Rng } from "../mathGen/core";
import { ALPHABET, capFirst, itemRng, lowFirst, mc, mcFixed, type Generator } from "./core";

/* ───────────── Từ chỉ sự vật / hoạt động / đặc điểm ───────────── */

export type WordKind = "su-vat" | "hoat-dong" | "dac-diem";

export const KIND_LABEL: Record<WordKind, string> = {
  "su-vat": "sự vật", "hoat-dong": "hoạt động", "dac-diem": "đặc điểm",
};

export const KIND_WORDS: Record<WordKind, string[]> = {
  "su-vat": [
    "cái bàn", "bút chì", "cặp sách", "con mèo", "con chó", "cây bàng", "bông hoa", "học sinh", "cô giáo", "bác sĩ",
    "quả cam", "mặt trời", "dòng sông", "ngôi nhà", "xe đạp", "quyển vở", "con gà", "cây tre", "bầu trời", "đôi giày",
    "chiếc lá", "cái trống", "con trâu", "ông bà", "bảng đen",
  ],
  "hoat-dong": [
    "chạy", "nhảy dây", "đọc sách", "viết bài", "quét nhà", "tưới cây", "ăn cơm", "hát", "múa", "bơi",
    "đá bóng", "vẽ tranh", "rửa bát", "nấu cơm", "lau bàn", "gấp quần áo", "đi học", "nghe nhạc", "thả diều", "trồng cây",
    "tập thể dục", "giặt áo", "học bài", "leo núi", "chơi đu quay",
  ],
  "dac-diem": [
    "cao", "thấp", "xinh xắn", "đỏ tươi", "xanh biếc", "chăm chỉ", "ngoan ngoãn", "hiền lành", "tròn xoe", "ngọt lịm",
    "thơm phức", "nhanh nhẹn", "sạch sẽ", "mềm mại", "nhỏ xíu", "to lớn", "vàng óng", "trắng tinh", "dịu dàng", "thông minh",
    "vui vẻ", "nặng trĩu", "dài", "lạnh buốt", "thẳng tắp",
  ],
};

const KINDS = Object.keys(KIND_WORDS) as WordKind[];

/** "Từ nào dưới đây là từ chỉ …?" — một từ đúng nhóm, ba từ của các nhóm còn lại. */
export const tuChi = (kind: WordKind): Generator => (r) => {
  const word = pick(r, KIND_WORDS[kind]);
  const others = shuffle(r, KINDS.filter((k) => k !== kind).flatMap((k) => KIND_WORDS[k]));
  return mc(`Từ nào dưới đây là từ chỉ ${KIND_LABEL[kind]}?`, word, others, `“${word}” là từ chỉ ${KIND_LABEL[kind]}.`, ["từ loại", kind]);
};

/** "Từ “…” là từ chỉ gì?" trong các nhóm `kinds`. */
export const tuLaGi = (kinds: WordKind[] = KINDS): Generator => (r) => {
  const kind = pick(r, kinds);
  const word = pick(r, KIND_WORDS[kind]);
  return mcFixed(
    `Từ “${word}” là từ chỉ gì?`, kinds.map((k) => `Từ chỉ ${KIND_LABEL[k]}`), `Từ chỉ ${KIND_LABEL[kind]}`,
    `“${word}” là từ chỉ ${KIND_LABEL[kind]}.`, ["từ loại", kind],
  );
};

/* ───────────── Kiểu câu: giới thiệu / nêu hoạt động / nêu đặc điểm ───────────── */

export type SentenceKind = "gioi-thieu" | "hoat-dong" | "dac-diem";

export const SENTENCE_LABEL: Record<SentenceKind, string> = {
  "gioi-thieu": "Câu giới thiệu", "hoat-dong": "Câu nêu hoạt động", "dac-diem": "Câu nêu đặc điểm",
};
const SENTENCE_FRAME: Record<SentenceKind, string> = {
  "gioi-thieu": "Ai (cái gì) là gì?", "hoat-dong": "Ai (cái gì) làm gì?", "dac-diem": "Ai (cái gì) thế nào?",
};

export const SENTENCES: Record<SentenceKind, string[]> = {
  "gioi-thieu": [
    "Em là học sinh lớp 2A.", "Đây là cô giáo chủ nhiệm của em.", "Bố em là bác sĩ.", "Mai là bạn thân của em.",
    "Đây là chiếc cặp mới của em.", "Mẹ em là công nhân nhà máy dệt.", "Trường em là Trường Tiểu học Hoa Sen.",
    "Chú mèo này là bạn của bé Na.", "Đây là ông nội của em.", "Bạn Nam là lớp trưởng lớp em.",
  ],
  "hoat-dong": [
    "Mẹ đang nấu cơm.", "Các bạn nhảy dây ở sân trường.", "Em tưới cây mỗi sáng.", "Bà kể chuyện cổ tích cho em nghe.",
    "Bố sửa chiếc xe đạp.", "Chú gà trống gáy ò ó o.", "Lan đang đọc truyện.", "Anh em quét sân.",
    "Đàn chim bay về tổ.", "Các bạn nam đá bóng.",
  ],
  "dac-diem": [
    "Bông hoa hồng rất thơm.", "Mái tóc của bà bạc trắng.", "Con đường đến trường thẳng tắp.", "Chú mèo nhà em lông trắng muốt.",
    "Quả cam chín vàng.", "Bầu trời hôm nay trong xanh.", "Bạn Hà rất chăm chỉ.", "Cái cặp của em còn mới tinh.",
    "Nước suối mát lạnh.", "Đôi mắt em bé tròn xoe.",
  ],
};

/** "Câu nào dưới đây là câu nêu hoạt động?" — một câu đúng kiểu, các câu khác thuộc `others`. */
export const cauLa = (kind: SentenceKind, others: SentenceKind[]): Generator => (r) => {
  const right = pick(r, SENTENCES[kind]);
  const ir = itemRng("cau", right);
  const wrong = others.map((k) => pick(ir, SENTENCES[k]));
  return mc(`Câu nào dưới đây là ${SENTENCE_LABEL[kind].toLowerCase()}?`, right, wrong,
    `“${right}” trả lời câu hỏi ${SENTENCE_FRAME[kind]} nên là ${SENTENCE_LABEL[kind].toLowerCase()}.`, ["kiểu câu", kind]);
};

/** "Câu “…” là câu gì?" trong các kiểu `kinds`. */
export const cauGi = (kinds: SentenceKind[]): Generator => (r) => {
  const kind = pick(r, kinds);
  const s = pick(r, SENTENCES[kind]);
  return mcFixed(`Câu “${s}” là kiểu câu nào?`, kinds.map((k) => SENTENCE_LABEL[k]), SENTENCE_LABEL[kind],
    `Câu trả lời câu hỏi ${SENTENCE_FRAME[kind]} nên là ${SENTENCE_LABEL[kind].toLowerCase()}.`, ["kiểu câu", kind]);
};

/* ───────────── Dấu câu ───────────── */

type Mark = "." | "?" | "!";
const MARK_NAME: Record<Mark, string> = { ".": "Dấu chấm", "?": "Dấu chấm hỏi", "!": "Dấu chấm than" };

/** Câu không ghi dấu cuối; dấu đúng là khoá. Câu hỏi có từ hỏi, câu cảm có từ bộc lộ cảm xúc. */
export const END_MARKS: Record<Mark, string[]> = {
  ".": [
    "Em đi học lúc sáu giờ sáng", "Mẹ mua cho em một chiếc cặp mới", "Lớp em có ba mươi bạn", "Bà trồng rau ở sau nhà",
    "Chú mèo nằm ngủ bên bếp", "Em giúp mẹ quét nhà", "Mùa thu, lá vàng rơi đầy sân", "Bố đưa em đến trường",
  ],
  "?": [
    "Bạn tên là gì", "Hôm nay là thứ mấy", "Nhà bạn ở đâu", "Bao giờ lớp mình đi tham quan",
    "Bạn có thích đọc truyện không", "Vì sao bạn đi học muộn", "Ai là người trực nhật hôm nay", "Con mèo của bạn màu gì",
  ],
  "!": [
    "Ôi, bông hoa đẹp quá", "Chà, cái bánh ngon thật", "A, mẹ về rồi", "Ôi, bạn giỏi quá",
    "Ôi, bầu trời đầy sao", "Trời ơi, nóng quá", "Chà, cảnh biển đẹp quá", "Hoan hô đội bóng lớp mình",
  ],
};

/** Chọn dấu câu cho ô trống cuối câu, trong các dấu `marks`. */
export const dauCuoiCau = (marks: Mark[]): Generator => (r) => {
  const m = pick(r, marks);
  const s = pick(r, END_MARKS[m]);
  return mcFixed(`Chọn dấu câu thích hợp cho ô trống: “${s} □”`, marks.map((x) => MARK_NAME[x]), MARK_NAME[m],
    `Viết đúng: “${s}${m}”.`, ["dấu câu", m]);
};

/** Câu liệt kê: phần đầu + 3 sự vật cùng loại. Dấu phẩy ngăn cách các sự vật. */
const LISTS: { pre: string; items: [string, string, string] }[] = [
  { pre: "Vườn nhà em có", items: ["cam", "bưởi", "xoài"] },
  { pre: "Trong cặp của em có", items: ["sách", "vở", "bút chì"] },
  { pre: "Mẹ đi chợ mua", items: ["rau", "cá", "thịt"] },
  { pre: "Sân trường có", items: ["cây bàng", "cây phượng", "cây xà cừ"] },
  { pre: "Nhà bà nuôi", items: ["gà", "vịt", "ngan"] },
  { pre: "Em thích chơi", items: ["nhảy dây", "đá cầu", "trốn tìm"] },
  { pre: "Bé có nhiều đồ chơi như", items: ["búp bê", "ô tô", "gấu bông"] },
  { pre: "Trên bàn học có", items: ["đèn bàn", "lọ hoa", "hộp bút"] },
  { pre: "Ngày Tết, nhà em có", items: ["bánh chưng", "mứt", "hoa đào"] },
  { pre: "Ở vườn thú có", items: ["voi", "hổ", "hươu cao cổ"] },
];

export const dauPhay: Generator = (r) => {
  const { pre, items: [a, b, c] } = pick(r, LISTS);
  const [first, ...rest] = pre.split(" ");
  const right = `${pre} ${a}, ${b}, ${c}.`;
  const wrong = [
    `${pre} ${a} ${b} ${c}.`,
    `${first}, ${rest.join(" ")} ${a} ${b}, ${c}.`,
    `${pre}, ${a} ${b} ${c}.`,
  ];
  return mc("Câu nào dưới đây đặt dấu phẩy đúng?", right, wrong,
    `Dấu phẩy ngăn cách các sự vật được kể ra: “${a}, ${b}, ${c}”.`, ["dấu câu", "dấu phẩy"]);
};

/* ───────────── Mở rộng vốn từ theo chủ đề ───────────── */

type Theme = { q: string; right: string[]; wrong: string[] };

export const THEMES: Record<string, Theme> = {
  "do-dung-hoc-tap": {
    q: "Từ ngữ nào dưới đây chỉ đồ dùng học tập?",
    right: ["bút chì", "thước kẻ", "cục tẩy", "quyển vở", "hộp bút", "cặp sách", "bảng con"],
    wrong: ["cái nồi", "cái chổi", "con mèo", "cây bàng", "đôi dép", "cái giường", "quả bóng"],
  },
  "tinh-cam-ban-be": {
    q: "Từ ngữ nào dưới đây chỉ tình cảm bạn bè?",
    right: ["quý mến", "thân thiết", "gắn bó", "yêu quý", "đoàn kết", "thân thương"],
    wrong: ["giận dỗi", "ghen tị", "cãi nhau", "trêu chọc", "bắt nạt", "ích kỉ"],
  },
  "gia-dinh": {
    q: "Từ ngữ nào dưới đây chỉ người trong gia đình?",
    right: ["ông nội", "bà ngoại", "bố mẹ", "anh trai", "chị gái", "em bé", "cô ruột", "chú ruột"],
    wrong: ["cô giáo", "bác sĩ", "bạn học", "chú bảo vệ", "cô bán hàng", "bác nông dân"],
  },
  "tinh-cam-gia-dinh": {
    q: "Từ ngữ nào dưới đây chỉ tình cảm gia đình?",
    right: ["yêu thương", "chăm sóc", "che chở", "quan tâm", "kính yêu", "nhường nhịn"],
    wrong: ["cãi nhau", "giành giật", "hờn dỗi", "la mắng", "bỏ mặc", "tranh giành"],
  },
  "do-choi": {
    q: "Từ ngữ nào dưới đây chỉ đồ chơi?",
    right: ["búp bê", "ô tô đồ chơi", "gấu bông", "chong chóng", "con quay", "diều giấy", "lê-gô"],
    wrong: ["cái bàn", "cái nồi", "quyển vở", "cái chổi", "đôi đũa", "cái ghế"],
  },
  "cac-mua": {
    q: "Từ ngữ nào dưới đây là tên một mùa trong năm?",
    right: ["mùa xuân", "mùa hạ", "mùa thu", "mùa đông", "mùa hè"],
    wrong: ["mùa lúa", "buổi sáng", "ban đêm", "ngày Tết", "buổi chiều", "tháng Giêng"],
  },
  "ngay-tet": {
    q: "Từ ngữ nào dưới đây gắn với ngày Tết?",
    right: ["bánh chưng", "lì xì", "hoa đào", "câu đối", "mứt Tết", "chúc Tết", "pháo hoa"],
    wrong: ["bánh trung thu", "đèn ông sao", "khai giảng", "nghỉ hè", "tắm biển", "cặp sách"],
  },
  "cay-coi": {
    q: "Từ ngữ nào dưới đây chỉ bộ phận của cây?",
    right: ["rễ cây", "thân cây", "cành cây", "lá cây", "hoa", "quả", "ngọn cây"],
    wrong: ["cánh chim", "đuôi cá", "mái nhà", "bánh xe", "chân bàn", "cái chậu"],
  },
  "thien-nhien": {
    q: "Từ ngữ nào dưới đây chỉ sự vật trong thiên nhiên?",
    right: ["núi", "sông", "biển", "mây", "cầu vồng", "thác nước", "bầu trời"],
    wrong: ["cái bàn", "ngôi nhà", "xe buýt", "quyển sách", "cái ti vi", "đôi giày"],
  },
  "muong-thu": {
    q: "Con vật nào dưới đây sống trong rừng?",
    right: ["hổ", "voi", "khỉ", "hươu", "gấu", "sư tử", "báo"],
    wrong: ["gà", "vịt", "lợn", "trâu", "mèo", "chó nhà"],
  },
  "vat-nuoi": {
    q: "Con vật nào dưới đây là vật nuôi trong nhà?",
    right: ["gà", "vịt", "mèo", "chó", "lợn", "trâu", "thỏ"],
    wrong: ["hổ", "sư tử", "cá mập", "gấu", "voi rừng", "chó sói"],
  },
  "moi-truong": {
    q: "Việc làm nào dưới đây giúp bảo vệ môi trường?",
    right: ["trồng cây", "nhặt rác", "bỏ rác vào thùng", "tiết kiệm nước", "tắt đèn khi ra khỏi phòng", "tưới cây"],
    wrong: ["vứt rác ra đường", "bẻ cành cây", "xả rác xuống sông", "để vòi nước chảy mãi", "giẫm lên cỏ", "đốt rác bừa bãi"],
  },
  "vat-nho-be": {
    q: "Con vật nào dưới đây là loài vật nhỏ bé?",
    right: ["con kiến", "con ong", "con bướm", "cánh cam", "con dế", "con chuồn chuồn", "con ốc sên"],
    wrong: ["con voi", "con hổ", "con trâu", "con ngựa", "con gấu", "con cá voi"],
  },
  "dac-diem": {
    q: "Từ ngữ nào dưới đây chỉ đặc điểm?",
    right: ["xanh mướt", "cao vút", "mềm mại", "nhanh nhẹn", "đỏ thắm", "tròn xoe", "thơm ngát"],
    wrong: ["cái cây", "con chim", "chạy nhảy", "ca hát", "quả táo", "đọc sách"],
  },
  "giao-tiep": {
    q: "Từ ngữ nào dưới đây chỉ phương tiện để liên lạc, kết nối với nhau?",
    right: ["điện thoại", "lá thư", "bưu thiếp", "máy tính", "in-tơ-nét", "tin nhắn"],
    wrong: ["cái chổi", "đôi đũa", "cái gối", "quả bóng", "cái nồi", "cây bút sáp"],
  },
  "nghe-nghiep": {
    q: "Từ ngữ nào dưới đây chỉ nghề nghiệp?",
    right: ["giáo viên", "bác sĩ", "nông dân", "công nhân", "kĩ sư", "lái xe", "đầu bếp", "thợ may"],
    wrong: ["học sinh", "em bé", "ông nội", "bạn thân", "hàng xóm", "anh trai"],
  },
  "bac-ho": {
    q: "Từ ngữ nào dưới đây nói về tình cảm của thiếu nhi với Bác Hồ?",
    right: ["kính yêu", "biết ơn", "nhớ ơn", "kính trọng", "yêu quý"],
    wrong: ["ghen tị", "giận dỗi", "sợ hãi", "chán nản", "lười biếng"],
  },
  "san-pham": {
    q: "Từ ngữ nào dưới đây chỉ sản phẩm (đặc sản) của các miền đất nước?",
    right: ["vải thiều", "nước mắm", "chè xanh", "gạo thơm", "cà phê", "bưởi", "nón lá"],
    wrong: ["bàn học", "đôi dép", "cặp sách", "cái kéo", "chiếc ô", "quyển vở"],
  },
  "duoi-bien": {
    q: "Con vật nào dưới đây sống dưới biển?",
    right: ["cá heo", "sao biển", "cá voi", "rùa biển", "con mực", "tôm hùm", "cá mập"],
    wrong: ["con gà", "con mèo", "con voi", "con hổ", "con chim sẻ", "con trâu"],
  },
  "truong-hoc": {
    q: "Từ ngữ nào dưới đây chỉ người hoặc nơi ở trường học?",
    right: ["thầy giáo", "cô giáo", "học sinh", "lớp học", "thư viện", "sân trường", "bác bảo vệ"],
    wrong: ["chợ", "bệnh viện", "nhà ga", "cánh đồng", "rạp xiếc", "bến xe"],
  },
};

export const vonTu = (theme: keyof typeof THEMES): Generator => (r) => {
  const t = THEMES[theme];
  const right = pick(r, t.right);
  return mc(t.q, right, t.wrong, `Đáp án đúng: “${right}”.`, ["vốn từ", theme]);
};

/* ───────────── Viết hoa: tên riêng, chữ đầu câu ───────────── */

/**
 * Mỗi chữ cái hoa một ít tên riêng và câu bắt đầu bằng chữ đó. Tên riêng (địa danh, tên người)
 * viết hoa chữ đầu mỗi tiếng; câu viết hoa chữ đầu câu và tên riêng trong câu.
 */
export const CHU_HOA: Record<string, string[]> = {
  A: ["An Giang", "Anh Thư", "An Khê", "Ai cũng yêu quý bạn Lan.", "Anh trai em học lớp năm.", "Áo mới của em màu xanh."],
  Ă: ["Ăn chậm, nhai kĩ.", "Ăn quả nhớ kẻ trồng cây.", "Ăn sáng xong, em đi học.", "Ăn uống sạch sẽ để khoẻ mạnh.", "Ắt hẳn bạn ấy rất vui.", "Ăn cơm xong, em rửa bát."],
  Â: ["Âu Cơ", "Ấn Độ", "Ấm áp tình thương.", "Âm nhạc làm em vui.", "Ấm trà của ông còn nóng.", "Ẩn sau lá là chùm quả chín."],
  B: ["Bắc Ninh", "Bình Dương", "Bến Tre", "Bạc Liêu", "Bé Na chăm học.", "Bố em làm ở nhà máy."],
  C: ["Cao Bằng", "Cà Mau", "Cần Thơ", "Côn Đảo", "Cô giáo em rất hiền.", "Cây bàng trước lớp tỏa bóng mát."],
  D: ["Duy Anh", "Diệu Linh", "Dương Minh Châu", "Dòng sông quê em rất đẹp.", "Dưới gốc đa, các bạn ngồi đọc sách.", "Dế mèn kêu ri ri."],
  Đ: ["Đà Nẵng", "Điện Biên", "Đồng Nai", "Đắk Lắk", "Đi học về, em giúp mẹ quét nhà.", "Đàn gà con chạy theo mẹ."],
  E: ["Em yêu trường em.", "Em là học sinh lớp hai.", "Em bé cười khúc khích.", "Em giúp bà xâu kim.", "Em thích nghe chim hót.", "Em tưới cây mỗi sáng."],
  Ê: ["Ê-đê", "Êm đềm dòng sông quê.", "Ếch con ngồi trên lá sen.", "Ếch kêu ộp oạp ngoài ao.", "Ê, các bạn ơi, ra chơi thôi!"],
  G: ["Gia Lai", "Gò Vấp", "Gò Công", "Gà trống gáy vang.", "Gió thổi mát rượi.", "Gấu bông của em rất mềm."],
  H: ["Hà Nội", "Hải Phòng", "Hà Giang", "Hội An", "Hoa sen nở trong đầm.", "Hôm nay em được điểm mười."],
  I: ["In-đô-nê-xi-a", "Im lặng nghe cô giảng bài.", "Ít nước thì cây sẽ héo.", "Ích lợi của rau xanh rất nhiều.", "Im lặng, em bé đang ngủ."],
  K: ["Kon Tum", "Khánh Hoà", "Kiên Giang", "Kể chuyện cho bà nghe.", "Kéo co là trò chơi vui.", "Kiến tha mồi về tổ."],
  L: ["Lạng Sơn", "Lào Cai", "Long An", "Lâm Đồng", "Lá cờ đỏ sao vàng tung bay.", "Lớp em có ba mươi bạn."],
  M: ["Mộc Châu", "Móng Cái", "Mai Anh", "Mỹ Tho", "Mẹ em là cô giáo.", "Mùa xuân, cây cối đâm chồi."],
  N: ["Nam Định", "Ninh Bình", "Nghệ An", "Nha Trang", "Nhà em ở gần trường.", "Nắng sớm chiếu vào sân."],
  O: ["Ong chăm chỉ làm mật.", "Ong vàng bay quanh vườn.", "Oa, bánh sinh nhật to quá!", "Ò ó o, gà gáy sáng rồi.", "Óng ánh những giọt sương mai.", "Oanh vàng hót trên cành."],
  Ô: ["Ông em rất hiền.", "Ô tô chạy bon bon trên đường.", "Ốc sên bò chậm chạp.", "Ông mặt trời mọc đằng đông.", "Ổi chín thơm cả góc vườn.", "Ôn bài xong, em đi ngủ."],
  Ơ: ["Ơn thầy cô em ghi nhớ.", "Ở nhà, em giúp bố mẹ.", "Ớt chín đỏ trên cây.", "Ở trường, em có nhiều bạn.", "Ơi, mẹ về rồi kìa!"],
  P: ["Phú Thọ", "Phú Quốc", "Phan Thiết", "Pleiku", "Phố phường đông vui.", "Phượng nở đỏ rực sân trường."],
  Q: ["Quảng Ninh", "Quảng Nam", "Quy Nhơn", "Quảng Bình", "Quê em có cánh đồng lúa.", "Quả cam chín vàng trên cây."],
  R: ["Rạch Giá", "Rừng cây xanh mát.", "Ruộng lúa chín vàng.", "Rau muống xanh mướt.", "Rùa con bò chậm chạp.", "Rồng rắn lên mây là trò chơi vui."],
  S: ["Sơn La", "Sóc Trăng", "Sa Pa", "Sầm Sơn", "Sáng nào em cũng dậy sớm.", "Sân trường rợp bóng cây xanh."],
  T: ["Thái Bình", "Tây Ninh", "Thanh Hoá", "Tuyên Quang", "Trường em có nhiều cây xanh.", "Tết đến, nhà nhà vui vẻ."],
  U: ["Uông Bí", "U Minh", "Uống nước nhớ nguồn.", "Uống sữa giúp em khoẻ mạnh.", "Ủ ấm cho em bé khi trời lạnh.", "Út Hoa là em gái của Lan."],
  Ư: ["Ước mơ của em là làm bác sĩ.", "Ươm hạt giống vào chậu.", "Ướt hết áo vì mưa to.", "Ừ, mình sẽ đi cùng bạn.", "Ước gì em được bay lên trời."],
  V: ["Vĩnh Long", "Vũng Tàu", "Việt Nam", "Vĩnh Phúc", "Vườn nhà em có nhiều hoa.", "Voi con đi theo mẹ."],
  X: ["Xuân Lộc", "Xuân Mai", "Xe đạp của em màu xanh.", "Xếp hàng ngay ngắn vào lớp.", "Xin chào các bạn!", "Xanh xanh hàng tre đầu làng."],
  Y: ["Yên Bái", "Yên Bình", "Ý Yên", "Yêu Tổ quốc, yêu đồng bào.", "Yêu thương ông bà, cha mẹ.", "Yến là bạn cùng bàn với em."],
};

const isSentence = (s: string) => /[.!?]$/.test(s);
const isProper = (w: string) => w !== w.toLocaleLowerCase("vi");

/** Các cách viết sai (khác nhau, khác đáp án). */
function wrongCaps(r: Rng, s: string): string[] {
  const words = s.split(" ");
  const out = new Set<string>();
  if (isSentence(s)) {
    out.add(lowFirst(s));
    const idx = words.map((w, i) => (i > 0 && !isProper(w) ? i : -1)).filter((i) => i > 0);
    for (const i of shuffle(r, idx).slice(0, 2)) {
      out.add(words.map((w, j) => (j === i ? capFirst(w) : w)).join(" "));
    }
  } else {
    out.add(s.toLocaleLowerCase("vi"));
    out.add(lowFirst(s));
    if (words.length > 1) out.add(words.map((w, i) => (i === 0 ? w : lowFirst(w))).join(" "));
  }
  out.delete(s);
  return [...out];
}

/** "Cách viết nào đúng?" với tên riêng / câu bắt đầu bằng một trong `letters`. */
export const chuHoa = (letters: string[]): Generator => (r) => {
  const s = pick(r, letters.flatMap((l) => CHU_HOA[l]));
  const ir = itemRng("hoa", s);
  const why = isSentence(s) ? "Chữ đầu câu viết hoa; các tiếng khác viết thường (trừ tên riêng)." : "Tên riêng viết hoa chữ cái đầu của mỗi tiếng.";
  return mc(isSentence(s) ? "Câu nào dưới đây viết hoa đúng?" : "Tên riêng nào dưới đây viết đúng?", s, wrongCaps(ir, s),
    `Viết đúng: “${s}”. ${why}`, ["viết hoa", letters.join("")]);
};

/** Mọi tên riêng (không phải câu) — dùng cho bài viết hoa tên người, địa danh. */
export const tenRieng: Generator = (r) => {
  const names = Object.values(CHU_HOA).flat().filter((s) => !isSentence(s) && s.includes(" "));
  const s = pick(r, names);
  const ir = itemRng("hoa", s);
  return mc("Tên riêng nào dưới đây viết đúng?", s, wrongCaps(ir, s),
    `Viết đúng: “${s}”. Tên riêng viết hoa chữ cái đầu của mỗi tiếng.`, ["viết hoa", "tên riêng"]);
};

/* ───────────── Bảng chữ cái ───────────── */

export const chuCaiSau: Generator = (r) => {
  const i = Math.floor(r() * (ALPHABET.length - 1));
  const right = ALPHABET[i + 1];
  const wrong = [ALPHABET[i - 1], ALPHABET[i + 2], ALPHABET[i + 3], ALPHABET[i - 2]].filter((x): x is string => !!x && x !== ALPHABET[i]);
  return mc(`Trong bảng chữ cái, chữ nào đứng ngay sau chữ “${ALPHABET[i]}”?`, right, wrong,
    `Thứ tự: … ${ALPHABET.slice(Math.max(0, i - 1), i + 3).join(", ")} …`, ["bảng chữ cái"]);
};

/** Tên các bạn: chữ cái đầu khác nhau để xếp theo bảng chữ cái không bị lẫn. */
const NAMES = ["An", "Bình", "Cường", "Dũng", "Đức", "Giang", "Hà", "Khánh", "Lan", "Minh", "Nam", "Oanh", "Phương", "Quân", "Sơn", "Tú", "Uyên", "Vy", "Xuân", "Yến"];
const rank = (name: string) => ALPHABET.indexOf(name.charAt(0).toLocaleLowerCase("vi"));

export const xepTen: Generator = (r) => {
  const four = shuffle(r, NAMES).slice(0, 4);
  const sorted = [...four].sort((a, b) => rank(a) - rank(b));
  const right = sorted.join(", ");
  const wrong = new Set<string>([four.join(", "), [...sorted].reverse().join(", "), [sorted[1], sorted[0], ...sorted.slice(2)].join(", "), [...sorted.slice(0, 2), sorted[3], sorted[2]].join(", ")]);
  wrong.delete(right);
  return mc(`Dãy tên nào được xếp đúng thứ tự bảng chữ cái? (${four.join(", ")})`, right, [...wrong],
    `Xếp theo chữ cái đầu: ${sorted.map((n) => `${n.charAt(0)} (${n})`).join(", ")}.`, ["bảng chữ cái"]);
};
