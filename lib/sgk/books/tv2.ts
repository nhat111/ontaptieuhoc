// lib/sgk/books/tv2.ts — Tiếng Việt 2, sách Kết nối tri thức với cuộc sống: 9 chủ điểm,
// tập một bài 1–32, tập hai bài 1–30. Tên chủ điểm, tên bài đọc chép đúng mục lục; mỗi tập
// đánh số lại từ 1 nên `so` đánh liên tục cả năm (URL, khoá tiến độ) và `soTap` là số trong tập.
// Mục lục và yêu cầu bài tập đối chiếu trên loigiaihay.com (10/2026).
//
// Sách xếp mỗi bài hai kiểu: bài lẻ = Đọc · Viết chữ hoa · Nói và nghe; bài chẵn = Đọc ·
// Nghe – viết (kèm bài tập chính tả) · Luyện tập (luyện từ và câu, viết đoạn) · Đọc mở rộng.
// Bài chẵn: 5 câu chính tả đúng các âm, vần của phần Nghe – viết + 5 câu luyện từ và câu đúng
// nội dung phần Luyện tập. Bài lẻ: 4 câu viết hoa chữ cái của bài + 6 câu ôn bài chẵn liền trước
// (bài 1 của mỗi tập: làm quen bài chẵn liền sau).

import type { Generator } from "../../mathGen/core";
import { chinhTa, hoiNga } from "../../tvGen/spell";
import {
  cauGi, cauLa, chuCaiSau, chuHoa, dauCuoiCau, dauPhay, tenRieng, tuChi, tuLaGi, vonTu, xepTen,
} from "../../tvGen/ltvc";
import type { SgkBook, SgkLesson, SgkTopic } from "../types";

type Mix = [Generator, number][];

const ct = chinhTa;
const hd = cauLa("hoat-dong", ["gioi-thieu", "dac-diem"]);
const dd = cauLa("dac-diem", ["gioi-thieu", "hoat-dong"]);
const gt = cauLa("gioi-thieu", ["hoat-dong", "dac-diem"]);
const cham2 = dauCuoiCau([".", "?"]);
const cham3 = dauCuoiCau([".", "?", "!"]);

/** Bộ câu của bài chẵn, theo tập → số bài trong tập. */
const EVEN: Record<1 | 2, Record<number, Mix>> = {
  1: {
    2: [[chuCaiSau, 3], [xepTen, 2], [tuChi("su-vat"), 2], [gt, 2], [cauGi(["gioi-thieu", "hoat-dong"]), 1]],
    4: [[chuCaiSau, 2], [xepTen, 3], [tuChi("su-vat"), 1], [tuChi("hoat-dong"), 2], [hd, 2]],
    6: [[chuCaiSau, 2], [xepTen, 3], [tuChi("dac-diem"), 3], [dd, 2]],
    8: [[tenRieng, 3], [xepTen, 2], [tuChi("su-vat"), 2], [hd, 2], [tuLaGi(["su-vat", "hoat-dong"]), 1]],
    10: [[ct("c-k"), 2], [ct("ch-tr"), 2], [ct("v-d-gi", ["v", "d"]), 1], [tuChi("su-vat"), 1], [tuChi("hoat-dong"), 2], [hd, 2]],
    12: [[ct("g-gh"), 2], [ct("s-x"), 2], [hoiNga, 1], [tuChi("su-vat"), 1], [tuChi("dac-diem"), 2], [dd, 2]],
    14: [[ct("ng-ngh"), 2], [ct("r-d-gi"), 2], [ct("an-ang"), 1], [vonTu("do-dung-hoc-tap"), 2], [cham2, 3]],
    16: [[ct("l-n"), 3], [tenRieng, 2], [tuChi("dac-diem"), 2], [dd, 1], [cham2, 2]],
    18: [[ct("c-k"), 2], [ct("ieu-uou"), 2], [ct("en-eng"), 1], [vonTu("tinh-cam-ban-be"), 2], [cham3, 3]],
    20: [[ct("iu-uu"), 3], [ct("ien-ieng"), 2], [tuChi("dac-diem"), 1], [tuChi("hoat-dong"), 2], [hd, 2]],
    22: [[ct("ch-tr"), 3], [ct("uon-uong"), 2], [vonTu("do-choi"), 2], [dd, 2], [tuChi("su-vat"), 1]],
    24: [[ct("r-d-gi", ["d", "gi"]), 3], [ct("uon-uong-2"), 2], [dauPhay, 3], [vonTu("do-choi"), 2]],
    26: [[ct("ien-yen-uyen"), 3], [ct("ai-ay"), 2], [vonTu("gia-dinh"), 2], [tuChi("dac-diem"), 2], [gt, 1]],
    28: [[ct("l-n"), 2], [ct("ao-au"), 2], [tenRieng, 1], [vonTu("tinh-cam-gia-dinh"), 2], [cham3, 3]],
    30: [[ct("ch-tr"), 3], [ct("ac-at"), 2], [tuChi("su-vat"), 1], [tuChi("hoat-dong"), 2], [hd, 2]],
    32: [[ct("iu-uu"), 2], [ct("ac-at-2"), 2], [ct("ac-at-3"), 1], [vonTu("tinh-cam-gia-dinh"), 2], [dauPhay, 3]],
  },
  2: {
    2: [[ct("c-k"), 2], [ct("ch-tr"), 2], [ct("ac-at"), 1], [vonTu("cac-mua"), 2], [cham2, 3]],
    4: [[ct("g-gh"), 2], [ct("s-x"), 2], [ct("uc-ut"), 1], [vonTu("ngay-tet"), 2], [hd, 2], [tuChi("hoat-dong"), 1]],
    6: [[ct("ng-ngh"), 2], [ct("r-d-gi"), 3], [vonTu("cay-coi"), 2], [hd, 2], [tuChi("hoat-dong"), 1]],
    8: [[ct("uynh-uych"), 2], [ct("l-n"), 2], [ct("iet-iec"), 1], [vonTu("thien-nhien"), 2], [dd, 2], [tuChi("dac-diem"), 1]],
    10: [[ct("uya-uyu"), 2], [ct("ieu-uou"), 2], [ct("uoc-uot-2"), 1], [vonTu("muong-thu"), 2], [cham3, 3]],
    12: [[ct("r-d-gi", ["d", "gi"]), 2], [ct("iu-uu"), 2], [ct("uoc-uot"), 1], [vonTu("vat-nuoi"), 2], [dd, 2], [tuChi("dac-diem"), 1]],
    14: [[ct("ng-ngh"), 2], [ct("ch-tr"), 2], [ct("et-ech"), 1], [vonTu("moi-truong"), 2], [dauPhay, 3]],
    16: [[ct("oanh-oach"), 2], [ct("s-x"), 2], [hoiNga, 1], [vonTu("vat-nho-be"), 2], [cham3, 3]],
    18: [[ct("ch-tr"), 3], [hoiNga, 2], [vonTu("dac-diem"), 2], [cham3, 1], [dauPhay, 2]],
    20: [[ct("eo-oe"), 2], [ct("l-n"), 2], [ct("en-enh"), 1], [vonTu("giao-tiep"), 2], [cham2, 1], [dauPhay, 2]],
    22: [[ct("s-x"), 3], [ct("ip-iep"), 2], [vonTu("nghe-nghiep"), 2], [hd, 2], [tuChi("hoat-dong"), 1]],
    24: [[tenRieng, 1], [ct("iu-uu"), 2], [ct("im-iem"), 2], [vonTu("bac-ho"), 2], [dd, 2], [tuChi("dac-diem"), 1]],
    26: [[tenRieng, 1], [ct("ch-tr"), 2], [ct("iu-ieu"), 2], [vonTu("san-pham"), 2], [gt, 2], [cauGi(["gioi-thieu", "hoat-dong", "dac-diem"]), 1]],
    28: [[ct("it-uyt"), 2], [ct("ieu-uou"), 2], [ct("in-inh"), 1], [vonTu("duoi-bien"), 2], [cham3, 2], [dauPhay, 1]],
    30: [[ct("r-d-gi"), 3], [hoiNga, 2], [vonTu("nghe-nghiep"), 2], [hd, 2], [tuChi("hoat-dong"), 1]],
  },
};

/** Bài lẻ: chữ hoa của bài (trong ngoặc là chữ hoa phần Viết). */
const ODD_LETTERS: Record<1 | 2, Record<number, string[]>> = {
  1: { 1: ["A"], 3: ["Ă", "Â"], 5: ["B"], 7: ["C"], 9: ["D"], 11: ["Đ"], 13: ["E", "Ê"], 15: ["G"], 17: ["H"], 19: ["I", "K"], 21: ["L"], 23: ["M"], 25: ["N"], 27: ["O"], 29: ["Ô", "Ơ"], 31: ["P"] },
  2: { 1: ["Q"], 3: ["R"], 5: ["S"], 7: ["T"], 9: ["U", "Ư"], 11: ["V"], 13: ["X"], 15: ["Y"], 17: ["A"], 19: ["M"], 21: ["N"], 23: ["Q"], 25: ["V"], 27: ["A", "M", "N"], 29: ["Q", "V"] },
};

/** Tên bài đọc theo tập (chép đúng mục lục). */
const DOC: Record<1 | 2, string[]> = {
  1: [
    "Tôi là học sinh lớp 2", "Ngày hôm qua đâu rồi?", "Niềm vui của Bi và Bống", "Làm việc thật là vui",
    "Em có xinh không?", "Một giờ học", "Cây xấu hổ", "Cầu thủ dự bị",
    "Cô giáo lớp em", "Thời khóa biểu", "Cái trống trường em", "Danh sách học sinh",
    "Yêu lắm trường ơi!", "Em học vẽ", "Cuốn sách của em", "Khi trang sách mở ra",
    "Gọi bạn", "Tớ nhớ cậu", "Chữ A và những người bạn", "Nhím nâu kết bạn",
    "Thả diều", "Tớ là Lê-gô", "Rồng rắn lên mây", "Nặn đồ chơi",
    "Sự tích hoa tỉ muội", "Em mang về yêu thương", "Mẹ", "Trò chơi của bố",
    "Cánh cửa nhớ bà", "Thương ông", "Ánh sáng của yêu thương", "Chơi chong chóng",
  ],
  2: [
    "Chuyện bốn mùa", "Mùa nước nổi", "Họa mi hót", "Tết đến rồi",
    "Giọt nước và biển lớn", "Mùa vàng", "Hạt thóc", "Lũy tre",
    "Vè chim", "Khủng long", "Sự tích cây thì là", "Bờ tre đón khách",
    "Tiếng chổi tre", "Cỏ non cười rồi", "Những con sao biển", "Tạm biệt cánh cam",
    "Những cách chào độc đáo", "Thư viện biết đi", "Cảm ơn anh hà mã", "Từ chú bồ câu đến in-tơ-nét",
    "Mai An Tiêm", "Thư gửi bố ngoài đảo", "Bóp nát quả cam", "Chiếc rễ đa tròn",
    "Đất nước chúng mình", "Trên các miền đất nước", "Chuyện quả bầu", "Khám phá đáy biển ở Trường Sa",
    "Hồ Gươm", "Cánh đồng quê em",
  ],
};

const CHU_DIEM: { ten: string; tap: 1 | 2; tu: number; den: number }[] = [
  { ten: "Em lớn lên từng ngày", tap: 1, tu: 1, den: 8 },
  { ten: "Đi học vui sao", tap: 1, tu: 9, den: 16 },
  { ten: "Niềm vui tuổi thơ", tap: 1, tu: 17, den: 24 },
  { ten: "Mái ấm gia đình", tap: 1, tu: 25, den: 32 },
  { ten: "Vẻ đẹp quanh em", tap: 2, tu: 1, den: 8 },
  { ten: "Hành tinh xanh của em", tap: 2, tu: 9, den: 16 },
  { ten: "Giao tiếp và kết nối", tap: 2, tu: 17, den: 20 },
  { ten: "Con người Việt Nam", tap: 2, tu: 21, den: 24 },
  { ten: "Việt Nam quê hương em", tap: 2, tu: 25, den: 30 },
];

/** Bài lẻ ôn 6 câu của bài chẵn liền trước (giữ đúng tỉ lệ các dạng). */
const review = (m: Mix): Mix => m.map(([g, n]) => [g, n * 0.6]);

function lessonOf(tap: 1 | 2, soTap: number): SgkLesson {
  const so = tap === 1 ? soTap : 32 + soTap;
  const ten = DOC[tap][soTap - 1];
  if (soTap % 2 === 0) return { so, soTap, ten, mix: EVEN[tap][soTap] };
  const ref = EVEN[tap][soTap - 1] ?? EVEN[tap][soTap + 1];
  return { so, soTap, ten, mix: [[chuHoa(ODD_LETTERS[tap][soTap]), 4], ...review(ref)] };
}

const topics: SgkTopic[] = CHU_DIEM.map((c, i) => ({
  so: i + 1, tap: c.tap, ten: c.ten,
  bai: Array.from({ length: c.den - c.tu + 1 }, (_, k) => lessonOf(c.tap, c.tu + k)),
}));

export const TV2: SgkBook = {
  id: "kntt-tv-2",
  subject: "Tiếng Việt",
  slug: "tieng-viet",
  grade: 2,
  book: "Kết nối tri thức với cuộc sống",
  source: "Mục lục và bài tập Tiếng Việt 2 tập một, tập hai đối chiếu trên loigiaihay.com (10/2026)",
  topicLabel: "Chủ điểm",
  topics,
};

/** Chữ hoa của bài lẻ (cho scripts/sgk-tv-check.ts). */
export const TV2_ODD_LETTERS = ODD_LETTERS;
