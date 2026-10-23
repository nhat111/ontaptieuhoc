// lib/tvGen/am.ts — âm, vần, dấu thanh cho Tiếng Việt 1 (tập một học từng âm, vần).
// Máy tự tách mỗi tiếng thành âm đầu + vần + dấu thanh (`parseTieng`), nên câu hỏi chỉ
// dùng tiếng ghép từ những âm, vần, dấu bé ĐÃ HỌC tới bài đó (`Known`). Kho tiếng soạn tay:
// tiếng quen thuộc, có nghĩa với bé lớp 1. CẦN NGƯỜI DUYỆT kho tiếng.

import { pick, shuffle } from "../mathGen/core";
import { itemRng, mc, mcFixed, stripTone, toneOf, type Generator } from "./core";

/* ───────────── Tách tiếng ───────────── */

const ONSETS = ["ngh", "ng", "nh", "ch", "gh", "gi", "kh", "ph", "th", "tr", "qu", "b", "c", "d", "đ", "g", "h", "k", "l", "m", "n", "p", "r", "s", "t", "v", "x"];

export type Tone = ReturnType<typeof toneOf>;
export type Tieng = { text: string; onset: string; rhyme: string; tone: Tone };

/**
 * "giếng" → gi + iêng + sắc; "quyển" → qu + uyên + hỏi; "ăn" → "" + ăn.
 * Sau "gi" mà vần bắt đầu bằng ê (gi-êng) hoặc sau "qu" mà vần bắt đầu bằng y (qu-yên),
 * chữ i / u của vần được viết gộp vào âm đầu, nên trả lại cho vần.
 */
export function parseTieng(text: string): Tieng {
  const bare = stripTone(text.toLocaleLowerCase("vi"));
  const tone = toneOf(text);
  const onset = ONSETS.find((o) => bare.startsWith(o) && bare.length > o.length) ?? "";
  let rhyme = bare.slice(onset.length);
  if (onset === "gi" && rhyme.startsWith("ê")) rhyme = "i" + rhyme;
  if (onset === "qu" && rhyme.startsWith("y")) rhyme = "u" + rhyme;
  return { text, onset, rhyme, tone };
}

/* ───────────── Đặt dấu thanh ───────────── */

const MARK: Record<Exclude<Tone, "">, string> = { huyen: "̀", sac: "́", hoi: "̉", nga: "̃", nang: "̣" };
const VOWELS = "aăâeêioôơuưy";
const ENDS = ["ch", "ng", "nh", "c", "m", "n", "p", "t"];

/** Vị trí nguyên âm mang dấu trong vần; null khi cách đặt dấu chưa thống nhất (oa, oe, uy mở). */
function tonePos(rhyme: string): number | null {
  if (rhyme.includes("ơ")) return rhyme.indexOf("ơ");
  for (const v of "âăêôư") if (rhyme.includes(v)) return rhyme.indexOf(v);
  const closed = ENDS.some((e) => rhyme.endsWith(e) && rhyme.length > e.length);
  const vs = [...rhyme].map((ch, i) => (VOWELS.includes(ch) ? i : -1)).filter((i) => i >= 0);
  if (vs.length === 0) return null;
  if (closed || vs.length === 1) return vs[vs.length - 1];
  if (["oa", "oe", "uy", "uya", "uyu"].includes(rhyme)) return null;
  if (vs.length === 3) return vs[1];
  return vs[0];
}

/** Ghép âm đầu + vần + dấu thanh thành tiếng; null nếu vần chưa có cách đặt dấu thống nhất. */
export function ghep(onset: string, rhyme: string, tone: Tone): string | null {
  let r = rhyme;
  if (onset === "gi" && r.startsWith("iê")) r = r.slice(1);
  if (onset === "qu" && r.startsWith("uy")) r = r.slice(1);
  if (tone === "") return onset + r;
  const p = tonePos(r);
  if (p === null) return null;
  return (onset + r.slice(0, p + 1) + MARK[tone] + r.slice(p + 1)).normalize("NFC");
}

/* ───────────── Kho tiếng ───────────── */

/** Tiếng quen thuộc với bé lớp 1, xếp theo vần cho dễ soát. */
export const TIENG: string[] = [
  // a, e, ê, o, ô, ơ, i, u, ư, y
  "ba", "bà", "bá", "ca", "cà", "cá", "da", "dạ", "đã", "đá", "gà", "lá", "lạ", "má", "mạ", "na", "nhà", "ngã", "ra", "xa", "quà", "quạ", "giá", "cha", "khá", "trà", "thả", "tạ", "cả",
  "bé", "bè", "chè", "kẻ", "mẹ", "nhẹ", "xe", "ve", "vẽ", "me", "mè", "sẻ", "tre", "trẻ", "nghe", "nghé", "hè", "ghe", "té",
  "bê", "bế", "dế", "dê", "đê", "kể", "lê", "lễ", "khế", "ghế", "nghệ", "về", "quê", "chê", "hề", "bể", "kê", "trễ",
  "bò", "bó", "bỏ", "cỏ", "có", "cọ", "chó", "đỏ", "gió", "giỏ", "ho", "kho", "lo", "lọ", "mỏ", "no", "ngõ", "nhỏ", "to", "thỏ", "trò", "họ", "vỏ", "cò", "nho",
  "bố", "bộ", "cô", "cổ", "cỗ", "đỗ", "dỗ", "đổ", "đồ", "gỗ", "hồ", "hổ", "ngô", "rổ", "sổ", "tô", "tổ", "xô", "phố", "chỗ", "khô", "mổ", "số", "lỗ", "ô",
  "bơ", "cờ", "chợ", "gỡ", "đỡ", "mơ", "nhớ", "sợ", "tờ", "thơ", "vở", "phở", "bờ", "chờ", "mỡ", "giờ", "nở",
  "bi", "bí", "chì", "dì", "đi", "ghi", "kì", "kí", "mì", "nghỉ", "thi", "vì", "chị", "bị", "kĩ", "tí",
  "bú", "củ", "cụ", "đủ", "hũ", "lũ", "mũ", "ngủ", "nụ", "rủ", "thu", "tủ", "xu", "cú", "đu", "chú", "dù",
  "chữ", "dữ", "hư", "thư", "từ", "tư", "sứ",
  "ý", "quý",
  // ia, ua, ưa
  "bia", "chia", "đĩa", "kìa", "mía", "thìa",
  "búa", "chua", "cua", "của", "lúa", "múa", "mua", "rùa", "đũa", "vua", "thua", "chùa",
  "cửa", "dưa", "đưa", "lửa", "mưa", "ngựa", "sữa", "thưa", "trưa", "vừa", "xưa", "bữa",
  // an ăn ân, on ôn ơn, en ên in un
  "bàn", "lan", "đàn", "nhãn", "gan", "chán", "cạn", "ván", "ngan", "than", "gián", "bán", "rán",
  "ăn", "khăn", "chăn", "lăn", "mặn", "nặn", "rắn", "sắn", "bắn", "cắn",
  "cân", "chân", "sân", "thân", "dân", "gần", "lần", "bận", "mận", "cần",
  "con", "hòn", "lon", "non", "ngon", "tròn", "còn", "nón", "gọn", "đón",
  "bốn", "chồn", "hôn", "khôn", "trốn", "thôn", "ôn",
  "hơn", "lợn", "sơn", "cơn", "trơn", "ơn", "đơn",
  "đèn", "kèn", "sen", "len", "khen", "chen", "hẹn", "quen", "nén",
  "bên", "đến", "nến", "tên", "lên", "nhện", "sên", "quên", "hến",
  "xin", "tin", "nhìn", "chín", "mịn", "kín", "vịn",
  "bún", "cún", "giun", "lùn", "phun", "run", "vun", "đun",
  // am ăm âm, om ôm ơm, em êm im um
  "cam", "làm", "khám", "nam", "tám", "xám", "chạm", "đám", "ham",
  "chăm", "tắm", "nằm", "thăm", "cắm", "gặm", "lắm", "sắm", "ngắm", "năm",
  "nấm", "mầm", "hầm", "chấm", "ấm", "cầm", "sấm", "đậm", "tấm",
  "gom", "nhóm", "khóm", "xóm", "chòm", "tóm",
  "tôm", "hôm", "gốm", "đốm", "cốm", "ôm",
  "cơm", "thơm", "rơm", "bờm", "sớm", "đơm",
  "kem", "xem", "tem", "em", "nem", "rèm", "thèm", "kém",
  "đêm", "mềm", "nệm", "thêm", "êm", "nếm",
  "chim", "tim", "kim", "phim", "sim", "nhím", "tìm", "lim",
  "chum", "cúm", "xúm", "chụm", "trùm",
  // ai ay ây, oi ôi ơi, ui ưi
  "tai", "hai", "mai", "gái", "trái", "vai", "nai", "chai", "bài", "dài", "sai", "phải",
  "tay", "bay", "cày", "chạy", "máy", "nhảy", "may", "xay", "gáy", "váy", "thay",
  "cây", "mây", "dây", "đầy", "lấy", "thấy", "cấy", "đẩy", "xây", "vây",
  "còi", "hỏi", "mỏi", "nói", "voi", "gói", "ngói", "sỏi", "khói", "giỏi", "đói",
  "tôi", "nồi", "đôi", "gối", "chổi", "cối", "mỗi", "rối", "ổi", "xôi", "thổi", "lội", "sôi",
  "bơi", "chơi", "mời", "trời", "lời", "phơi", "nơi", "với", "rơi", "tới", "hơi",
  "túi", "núi", "vui", "mùi", "đùi", "cúi", "bụi", "lùi", "củi", "chui",
  "gửi", "ngửi", "cửi",
  // ao eo, au âu êu, iu ưu
  "bao", "cao", "sao", "dao", "táo", "gạo", "chào", "báo", "mào", "rào", "áo", "vào", "đào", "bảo",
  "mèo", "kéo", "kẹo", "leo", "trèo", "béo", "heo", "chèo", "đèo", "bèo",
  "cau", "rau", "sau", "màu", "tàu", "đau", "cháu", "nhau", "lau", "mau",
  "câu", "sâu", "trâu", "bầu", "đầu", "dâu", "cầu", "lâu", "nấu", "gấu",
  "kêu", "lều", "phễu", "rêu", "sếu", "đều", "thêu", "mếu",
  "rìu", "xíu", "líu", "dịu", "trĩu", "chịu", "níu", "địu",
  "cừu", "hưu", "lựu", "cứu", "mưu", "bưu",
  // ac ăc âc, oc ôc uc ưc, at ăt ât, ot ôt ơt, et êt it, ut ưt
  "bác", "các", "hạc", "lạc", "nhạc", "rác", "thác", "vác", "khác",
  "mắc", "sắc", "bắc", "đặc", "mặc", "lắc", "chắc",
  "gấc", "bậc", "nhấc", "tấc", "giấc",
  "cóc", "góc", "học", "móc", "sóc", "ngọc", "khóc", "đọc", "bọc", "nóc", "lọc",
  "ốc", "cốc", "gốc", "mốc", "dốc", "tốc", "bốc", "lốc",
  "cúc", "xúc", "bục", "chúc", "lúc", "đúc", "giục", "phúc", "trúc",
  "mực", "sức", "thức", "nực", "bức", "ngực", "rực", "mức", "đực",
  "bát", "cát", "hát", "mát", "nhạt", "khát", "đạt", "lát", "chát", "hạt", "phát",
  "mặt", "cắt", "bắt", "chặt", "đắt", "ngắt", "giặt", "mắt", "sắt", "thắt", "tắt",
  "đất", "mật", "thật", "vật", "bật", "gật", "nhất", "tất", "chất", "lật", "giật",
  "ngọt", "hót", "rót", "vót", "gọt", "lọt", "nhót", "chót",
  "tốt", "cột", "bột", "một", "nốt", "đốt", "sốt", "lột", "hột", "chốt",
  "ớt", "vợt", "thớt", "bớt", "nhớt",
  "két", "vẹt", "hét", "nét", "sét", "khét", "ghét", "mét",
  "tết", "hết", "mệt", "dệt", "kết", "nết", "rết", "vết",
  "mít", "vịt", "ít", "thịt", "hít", "khít", "bịt",
  "bút", "phút", "sút", "rút", "hút", "mút", "chút", "cụt", "đút",
  "mứt", "đứt", "nứt", "bứt", "vứt", "sứt",
  // ap ăp âp, op ôp ơp, ep êp ip up
  "tháp", "đạp", "ráp", "áp", "sáp", "nạp", "rạp", "đáp",
  "cặp", "bắp", "sắp", "gặp", "lắp", "nắp", "chắp", "đắp", "khắp",
  "tập", "nấp", "mập", "cấp", "đập", "thấp", "lập", "ấp",
  "họp", "góp", "cọp", "chóp", "bóp", "móp",
  "hộp", "lốp", "xốp", "gộp", "tốp", "chộp",
  "lớp", "chớp", "hợp", "đớp", "rợp",
  "dép", "đẹp", "kẹp", "hẹp", "chép", "xẹp", "tép",
  "bếp", "xếp", "nếp",
  "kịp", "nhịp", "dịp",
  "búp", "giúp", "chụp", "núp", "súp", "húp",
  // anh ênh inh, ach êch ich, ang ăng âng, ong ông ung ưng
  "canh", "xanh", "chanh", "bánh", "nhanh", "tranh", "hành", "mạnh", "cành", "lành", "gánh", "đánh", "cánh",
  "kênh", "bệnh", "lệnh", "ghềnh",
  "xinh", "tính", "kính", "bình", "hình", "đỉnh", "mình", "tình", "sinh", "vịnh",
  "sách", "vách", "cách", "gạch", "khách", "mạch", "rách", "xách",
  "ếch", "lệch", "xệch", "chệch", "hếch",
  "lịch", "xích", "thích", "đích", "ích", "kịch", "chích", "tích",
  "bàng", "càng", "làng", "vàng", "sáng", "trang", "hàng", "mang", "tháng", "đang", "bảng", "ngang",
  "nắng", "măng", "răng", "trăng", "căng", "bằng", "vắng", "xăng", "tặng",
  "tầng", "vâng", "nâng", "dâng", "tâng",
  "ong", "bóng", "cong", "dòng", "lòng", "mong", "sóng", "trong", "võng", "xong", "đóng", "nóng",
  "ông", "bông", "công", "đông", "hồng", "lông", "sông", "trống", "không", "nông", "rồng", "thông",
  "trung", "cung", "dùng", "khung", "súng", "chung", "sung", "thùng", "vùng",
  "rừng", "mừng", "bưng", "sừng", "gừng", "lưng", "trứng", "đựng", "ngừng", "dừng",
  // iêc iên iêp, iêng iêm yên, iêt iêu yêu
  "tiệc", "xiếc", "việc", "chiếc", "biếc", "liếc", "tiếc",
  "tiên", "biển", "kiến", "viên", "điện", "hiền", "tiền", "miền", "liền",
  "tiếp", "diếp", "thiếp", "hiệp",
  "tiếng", "siêng", "riềng", "chiêng", "khiêng", "kiềng", "miệng", "giếng", "biếng",
  "tiêm", "kiểm", "niềm", "điểm", "kiếm", "hiếm", "liềm", "diêm",
  "yên", "yến",
  "viết", "biết", "tiết", "siết",
  "diều", "chiều", "niêu", "hiểu", "tiêu", "phiếu", "hiếu", "nhiều", "điều",
  "yêu", "yếu",
  // uôi uôm, uôc uôt, uôn uông, ươi ươu, ươc ươt, ươm ươp, ươn ương
  "muối", "chuối", "đuôi", "cuối", "tuổi", "buổi", "nuôi", "suối", "ruồi", "muỗi",
  "buồm", "nhuộm", "muỗm", "chuôm",
  "thuốc", "đuốc", "cuốc", "buộc", "luộc", "cuộc", "guốc",
  "chuột", "buốt", "ruột", "suốt", "tuốt", "vuốt", "nuốt",
  "buồn", "cuộn", "muốn", "luôn", "khuôn", "chuồn", "uốn", "nguồn",
  "chuông", "ruộng", "xuống", "buồng", "luống", "cuống", "uống", "muống", "vuông",
  "mười", "cười", "lưới", "tưới", "người", "bưởi", "sưởi", "lười", "tươi", "dưới",
  "hươu", "khướu", "bướu", "bươu",
  "nước", "bước", "thước", "được", "rước", "lược", "trước",
  "lướt", "mượt", "vượt", "trượt", "ướt", "rượt", "lượt",
  "bướm", "gươm", "ươm", "chườm",
  "mướp", "ướp", "cướp",
  "vườn", "lươn", "vươn", "sườn", "mượn", "lượn", "trườn",
  "đường", "gương", "sương", "hương", "thương", "giường", "trường", "nương", "phượng", "tường", "xương",
  // oa oe, oan oăn oat oăt, oai uê uy, uân uât, uyên uyêt
  "hoa", "loa", "toa", "xoa", "khoá",
  "xoè", "khoẻ", "choè", "hoe",
  "ngoan", "toán", "khoan", "đoán", "xoan", "soạn",
  "xoăn", "ngoằn", "thoăn",
  "hoạt", "thoát", "soát",
  "hoắt", "thoắt", "choắt", "loắt",
  "khoai", "ngoài", "loài", "xoài",
  "huệ", "thuê", "thuế",
  "huy", "luỹ", "suy", "thuỷ", "khuy", "tuỳ",
  "xuân", "tuần", "huân", "khuân",
  "luật", "xuất", "thuật",
  "chuyện", "thuyền", "khuyên", "truyện", "quyển", "chuyền",
  "tuyết", "quyết", "khuyết",
];

export const TIENG_INFO: Tieng[] = TIENG.map(parseTieng);

/* ───────────── Những gì bé đã học ───────────── */

export type Known = { onsets: Set<string>; rhymes: Set<string>; tones: Set<Tone> };

export const knows = (k: Known, t: Tieng) => (t.onset === "" || k.onsets.has(t.onset)) && k.rhymes.has(t.rhyme) && k.tones.has(t.tone);
export const knownTieng = (k: Known) => TIENG_INFO.filter((t) => knows(k, t));

const TONE_NAME: Record<Tone, string> = { "": "Không có dấu thanh", huyen: "Dấu huyền", sac: "Dấu sắc", hoi: "Dấu hỏi", nga: "Dấu ngã", nang: "Dấu nặng" };
const TONE_ORDER: Tone[] = ["", "huyen", "sac", "hoi", "nga", "nang"];

/* ───────────── Câu hỏi ───────────── */

/** Chữ dễ nhầm hình dạng — đáp án nhiễu cho câu nhận chữ. */
const LOOKALIKE: Record<string, string[]> = {
  a: ["ă", "â", "o", "d"], ă: ["a", "â", "o"], â: ["a", "ă", "ơ"], b: ["d", "p", "h", "đ"], c: ["e", "o", "x"], d: ["b", "đ", "p", "q"],
  đ: ["d", "b", "p"], e: ["ê", "c", "o"], ê: ["e", "ô", "c"], o: ["ô", "ơ", "a"], ô: ["o", "ơ", "ê"], ơ: ["o", "ô", "ư"],
  i: ["l", "t", "u"], k: ["h", "b", "l"], h: ["k", "n", "b"], l: ["i", "t", "h"], u: ["ư", "n", "ơ"], ư: ["u", "ơ", "n"],
  m: ["n", "u", "w"], n: ["m", "u", "h"], g: ["q", "p", "y"], r: ["n", "v", "x"], s: ["x", "r", "c"], t: ["l", "i", "đ"],
  v: ["y", "r", "u"], x: ["s", "k", "c"], y: ["v", "g", "u"], p: ["q", "b", "d"], q: ["p", "g", "d"],
};

/** "Chữ nào là chữ “b”?" — bé nhận mặt chữ giữa các chữ giống hình. */
export const nhanChu = (letters: string[]): Generator => (r) => {
  const l = pick(r, letters);
  return mc(`Chữ nào là chữ “${l}”?`, l, LOOKALIKE[l] ?? ["o", "a", "e"], `Đây là chữ “${l}”.`, ["âm", "nhận chữ"]);
};

/** Số câu khác nhau một dạng có thể ra (để không bắt một dạng ít tiếng ra quá nhiều câu). */
export const poolSize = {
  amDau: (onsets: string[], k: Known) => knownTieng(k).filter((t) => onsets.includes(t.onset)).length,
  coAmVan: (kind: "am" | "van", targets: string[], k: Known) => knownTieng(k).filter((t) => targets.includes(kind === "am" ? t.onset : t.rhyme)).length,
  ghep: (k: Known, rhymes?: string[]) => knownTieng(k).filter((t) => t.onset && (!rhymes || rhymes.includes(t.rhyme)) && ghep(t.onset, t.rhyme, t.tone) === t.text).length,
  dauThanh: (k: Known, rhymes?: string[]) => knownTieng(k).filter((t) => !rhymes || rhymes.includes(t.rhyme)).length,
};

/** "Tiếng “bà” bắt đầu bằng chữ nào?" — âm đầu trong `onsets`, tiếng bé đọc được. */
export const amDau = (onsets: string[], k: Known): Generator => {
  const pool = knownTieng(k).filter((t) => onsets.includes(t.onset));
  if (pool.length === 0) throw new Error(`amDau: không có tiếng cho ${onsets.join("/")}`);
  return (r) => {
    const t = pick(r, pool);
    // Đáp án nhiễu là chữ bé đã học; mới học ít chữ thì thêm chữ giống hình.
    const learnt = [...k.onsets].filter((o) => o !== t.onset);
    const wrong = learnt.length >= 3 ? learnt : [...learnt, ...(LOOKALIKE[t.onset] ?? []), ...ONSETS].filter((o, i, a) => o !== t.onset && a.indexOf(o) === i).slice(0, 3);
    return mc(`Tiếng “${t.text}” bắt đầu bằng chữ nào?`, t.onset, wrong,
      `“${t.text}” = ${t.onset} + ${t.rhyme}${t.tone ? " + " + TONE_NAME[t.tone].toLowerCase() : ""}.`, ["âm", t.onset]);
  };
};

/** "Tiếng nào có âm “b”?" / "Tiếng nào có vần “an”?" — một tiếng có, ba tiếng không có. */
export const coAmVan = (kind: "am" | "van", targets: string[], k: Known): Generator => {
  const known = knownTieng(k);
  const part = (t: Tieng) => (kind === "am" ? t.onset : t.rhyme);
  const yes = known.filter((t) => targets.includes(part(t)));
  if (yes.length === 0) throw new Error(`coAmVan: không có tiếng cho ${targets.join("/")}`);
  return (r) => {
    const t = pick(r, yes);
    const target = part(t);
    const ir = itemRng("amvan", t.text, target);
    // Ưu tiên tiếng có âm / vần cùng bài (dễ lẫn), rồi tới tiếng bé đã học.
    const near = known.filter((x) => part(x) !== target && targets.includes(part(x)));
    const far = known.filter((x) => part(x) !== target && !targets.includes(part(x)));
    const wrong = [...shuffle(ir, near).slice(0, 2), ...shuffle(ir, far)].slice(0, 3).map((x) => x.text);
    const what = kind === "am" ? "âm" : "vần";
    return mc(`Tiếng nào có ${what} “${target}”?`, t.text, wrong, `“${t.text}” = ${t.onset ? t.onset + " + " : ""}${t.rhyme}.`, [what, target]);
  };
};

/** "Tiếng “cá” có dấu thanh gì?" trong các dấu bé đã học (`rhymes`: chỉ hỏi tiếng có vần mới). */
export const dauThanh = (k: Known, rhymes?: string[]): Generator => {
  const tones = TONE_ORDER.filter((t) => k.tones.has(t));
  const pool = knownTieng(k).filter((t) => !rhymes || rhymes.includes(t.rhyme));
  if (tones.length < 2 || pool.length === 0) throw new Error("dauThanh: chưa đủ dấu thanh");
  return (r) => {
    const t = pick(r, pool);
    return mcFixed(`Tiếng “${t.text}” có dấu thanh gì?`, tones.map((x) => TONE_NAME[x]), TONE_NAME[t.tone],
      `“${t.text}”: ${TONE_NAME[t.tone].toLowerCase()}.`, ["dấu thanh"]);
  };
};

/** "Ghép âm “b”, vần “a” và dấu huyền được tiếng nào?" — đáp án nhiễu đổi dấu hoặc đổi âm đầu. */
export const ghepTieng = (k: Known, rhymes?: string[]): Generator => {
  const pool = knownTieng(k).filter((t) => t.onset && (!rhymes || rhymes.includes(t.rhyme)) && ghep(t.onset, t.rhyme, t.tone) === t.text);
  if (pool.length === 0) throw new Error(`ghepTieng: không có tiếng${rhymes ? " cho " + rhymes.join("/") : ""}`);
  return (r) => {
    const t = pick(r, pool);
    const ir = itemRng("ghep", t.text);
    const otherTones = TONE_ORDER.filter((x) => x !== t.tone && k.tones.has(x)).map((x) => ghep(t.onset, t.rhyme, x));
    // Âm đầu thay thế phải viết được trước vần này (không ra "kai", "ga" → "ghe"…).
    const front = /^[eêi]/.test(t.rhyme);
    const okOnset = (o: string) => o !== t.onset && o !== "qu" && o !== "gi" && (front ? !["c", "g", "ng"].includes(o) : !["k", "gh", "ngh"].includes(o));
    const otherOnsets = shuffle(ir, [...k.onsets].filter(okOnset)).slice(0, 2).map((o) => ghep(o, t.rhyme, t.tone));
    const wrong = [...shuffle(ir, otherTones).slice(0, 2), ...otherOnsets].filter((x): x is string => !!x && x !== t.text);
    const dau = t.tone ? ` và ${TONE_NAME[t.tone].toLowerCase()}` : " (không có dấu thanh)";
    return mc(`Ghép âm “${t.onset}”, vần “${t.rhyme}”${dau} được tiếng nào?`, t.text, wrong,
      `${t.onset} + ${t.rhyme}${t.tone ? " + " + TONE_NAME[t.tone].toLowerCase() : ""} = ${t.text}.`, ["ghép tiếng"]);
  };
};

/** "Tiếng nào cùng vần với tiếng “bánh”?" (tập hai). */
export const cungVan = (k: Known): Generator => {
  const known = knownTieng(k);
  const byRhyme = new Map<string, Tieng[]>();
  for (const t of known) byRhyme.set(t.rhyme, [...(byRhyme.get(t.rhyme) ?? []), t]);
  const pool = known.filter((t) => (byRhyme.get(t.rhyme)?.length ?? 0) >= 2);
  return (r) => {
    const t = pick(r, pool);
    const ir = itemRng("cungvan", t.text);
    const right = pick(ir, byRhyme.get(t.rhyme)!.filter((x) => x.text !== t.text)).text;
    const wrong = shuffle(ir, known.filter((x) => x.rhyme !== t.rhyme)).map((x) => x.text);
    return mc(`Tiếng nào cùng vần với tiếng “${t.text}”?`, right, wrong, `“${t.text}” và “${right}” cùng có vần “${t.rhyme}”.`, ["vần", t.rhyme]);
  };
};
