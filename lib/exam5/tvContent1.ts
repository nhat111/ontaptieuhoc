// lib/exam5/tvContent1.ts
// Nội dung đề Tiếng Việt lớp 1 — VIẾT TAY, không sinh bằng máy, không chép sách giáo khoa:
// bài đọc do Ôn Tập Cùng Con tự soạn theo chủ đề của Tiếng Việt 1 (gia đình, bạn bè, trường
// học, thiên nhiên, quê hương). CẦN NGƯỜI DUYỆT trước khi coi là xong.
//
// Quy tắc (scripts/tv12-check.ts kiểm tra phần máy kiểm được):
//   • Học kì I bé mới học âm, vần: bài đọc giữa học kì I chỉ dùng âm, vần, dấu thanh đã học
//     hết bài 40 của tập một (oi, ôi, ơi); cuối học kì I dùng âm, vần của cả tập một. Lựa chọn
//     của câu hỏi và đoạn nghe – viết cũng vậy (câu hỏi do giáo viên đọc cho bé).
//   • Mỗi câu 3 lựa chọn, đúng MỘT đáp án, đáp án nhiễu sai rõ ràng; `answer` nằm trong `options`.
//   • Đoạn nghe – viết trích nguyên văn bài đọc. Ngoặc kép cong “ ”.

import { knownAtBai } from "../sgk/books/tv1";
import { parseTieng, knows } from "../tvGen/am";
import { chinhTa } from "../tvGen/spell";
import type { Tv12Content, Tv12Passage } from "./tv12";

const P = (p: Tv12Passage) => p;

/** Hết bài 40 (oi, ôi, ơi) — khoảng tuần 9, lúc kiểm tra giữa học kì I. */
export const KNOWN_GIUA_HK1 = knownAtBai(40);
/** Hết tập một. */
export const KNOWN_CUOI_HK1 = knownAtBai(83);

/** Từ (có thể nhiều tiếng) chỉ gồm tiếng bé đã học. */
const readable = (k: ReturnType<typeof knownAtBai>) => (w: string) =>
  (w.match(/\p{L}+/gu) ?? []).every((t) => knows(k, parseTieng(t)));

const PASSAGES: Tv12Passage[] = [
  /* ═════════════ GIỮA HỌC KÌ I ═════════════ */
  P({
    id: "be-na-ve-que", kinds: ["giua-hk1"], title: "Bé Na về quê",
    text: `Nghỉ hè, bé Na về quê với bà. Nhà bà có cây na, cây ổi. Bà hái cho Na quả na chín. Na cho đàn gà ăn.

Tối, bà kể cho Na nghe về thời bà còn bé. Na mê lắm. Na ngủ ngon trên tay bà.`,
    questions: [
      { q: "Nghỉ hè, bé Na về đâu?", options: ["Về quê với bà", "Về nhà dì", "Ra bờ hồ"], answer: "Về quê với bà", explain: "“Nghỉ hè, bé Na về quê với bà.”" },
      { q: "Bà hái cho Na quả gì?", options: ["Quả na", "Quả ổi", "Quả lê"], answer: "Quả na", explain: "“Bà hái cho Na quả na chín.”" },
      { q: "Buổi tối, bà làm gì cho Na?", options: ["Kể cho Na nghe", "Mua quà cho Na", "Đi chợ với Na"], answer: "Kể cho Na nghe", explain: "“Tối, bà kể cho Na nghe về thời bà còn bé.”" },
    ],
    dictation: "Nhà bà có cây na, cây ổi. Bà hái cho Na quả na chín.",
  }),
  P({
    id: "ra-bo-ho", kinds: ["giua-hk1"], title: "Ra bờ hồ",
    text: `Hôm nay, bố cho bé Hà ra bờ hồ chơi. Gió thổi nhè nhẹ. Trên hồ có đàn le le bơi. Hà chỉ tay:

– Bố ơi, le le kìa!

Bố mua cho Hà cái kem. Hà ăn kem, bố ngồi kề bên. Khi trời đã tối, bố và Hà mới về nhà.`,
    questions: [
      { q: "Bố cho Hà đi đâu chơi?", options: ["Ra bờ hồ", "Về quê", "Đi chợ"], answer: "Ra bờ hồ", explain: "“Hôm nay, bố cho bé Hà ra bờ hồ chơi.”" },
      { q: "Trên hồ có gì?", options: ["Đàn le le", "Đàn gà", "Con ngựa"], answer: "Đàn le le", explain: "“Trên hồ có đàn le le bơi.”" },
      { q: "Bố mua cho Hà cái gì?", options: ["Cái kem", "Quả na", "Cái mũ"], answer: "Cái kem", explain: "“Bố mua cho Hà cái kem.”" },
    ],
    dictation: "Gió thổi nhè nhẹ. Trên hồ có đàn le le bơi.",
  }),

  /* ═════════════ CUỐI HỌC KÌ I ═════════════ */
  P({
    id: "chu-ga-trong", kinds: ["cuoi-hk1"], title: "Chú gà trống",
    text: `Sáng sớm, chú gà trống nhảy lên đống rơm. Chú vươn cổ gáy: “Ò ó o…”. Tiếng gáy vang khắp xóm.

Bé Lan thức dậy. Lan đánh răng, rửa mặt rồi ăn sáng. Mẹ đưa Lan đến trường. Lan nghĩ: “Nhờ có gà trống mà mình không bị muộn học.”`,
    questions: [
      { q: "Gà trống nhảy lên đâu để gáy?", options: ["Đống rơm", "Mái nhà", "Cành cây"], answer: "Đống rơm", explain: "“Sáng sớm, chú gà trống nhảy lên đống rơm.”" },
      { q: "Tiếng gáy của gà trống thế nào?", options: ["Vang khắp xóm", "Nhỏ xíu", "Khàn khàn"], answer: "Vang khắp xóm", explain: "“Tiếng gáy vang khắp xóm.”" },
      { q: "Theo Lan, nhờ đâu mà Lan không bị muộn học?", options: ["Nhờ có gà trống gáy", "Nhờ có mẹ gọi dậy", "Nhờ có đồng hồ"], answer: "Nhờ có gà trống gáy", explain: "Lan nghĩ: “Nhờ có gà trống mà mình không bị muộn học.”" },
    ],
    dictation: "Bé Lan thức dậy. Lan đánh răng, rửa mặt rồi ăn sáng. Mẹ đưa Lan đến trường.",
  }),
  P({
    id: "vuon-nha-ong", kinds: ["cuoi-hk1"], title: "Vườn nhà ông",
    text: `Vườn nhà ông có nhiều cây ăn quả. Mùa hè, cây xoài trĩu quả. Mùa thu, cây bưởi treo những quả to tròn.

Ông chăm cây rất kĩ. Sáng nào ông cũng tưới nước, nhổ cỏ cho cây. Bé Bin hay theo ông ra vườn. Bin giúp ông nhặt lá khô. Ông bảo: “Cây cũng như người, có chăm thì mới tốt.”`,
    questions: [
      { q: "Mùa hè, cây nào trĩu quả?", options: ["Cây xoài", "Cây bưởi", "Cây na"], answer: "Cây xoài", explain: "“Mùa hè, cây xoài trĩu quả.” Cây bưởi có quả vào mùa thu." },
      { q: "Sáng nào ông cũng làm gì?", options: ["Tưới nước, nhổ cỏ cho cây", "Đi chợ mua quà", "Đưa Bin đến trường"], answer: "Tưới nước, nhổ cỏ cho cây", explain: "“Sáng nào ông cũng tưới nước, nhổ cỏ cho cây.”" },
      { q: "Bin giúp ông việc gì?", options: ["Nhặt lá khô", "Tưới nước", "Hái bưởi"], answer: "Nhặt lá khô", explain: "“Bin giúp ông nhặt lá khô.”" },
    ],
    dictation: "Sáng nào ông cũng tưới nước, nhổ cỏ cho cây. Bé Bin hay theo ông ra vườn.",
  }),

  /* ═════════════ GIỮA HỌC KÌ II ═════════════ */
  P({
    id: "ban-moi", kinds: ["giua-hk2"], title: "Bạn mới",
    text: `Hôm nay, lớp em có một bạn mới. Bạn tên là Hải, nhà ở xa, mới chuyển về đây.

Giờ ra chơi, Hải đứng một mình bên gốc bàng. Trông bạn có vẻ buồn. Em chạy đến, rủ Hải chơi đá cầu. Lúc đầu, Hải còn rụt rè. Một lúc sau, bạn đã cười tươi và đá cầu rất giỏi.

Từ hôm đó, chúng em trở thành đôi bạn thân. Em thấy vui vì Hải không còn lẻ loi nữa.`,
    questions: [
      { q: "Bạn Hải là ai?", options: ["Bạn mới của lớp em", "Anh trai của em", "Bạn hàng xóm của em"], answer: "Bạn mới của lớp em", explain: "“Hôm nay, lớp em có một bạn mới. Bạn tên là Hải…”" },
      { q: "Giờ ra chơi, Hải đứng ở đâu?", options: ["Bên gốc bàng", "Trong lớp học", "Ở cổng trường"], answer: "Bên gốc bàng", explain: "“Giờ ra chơi, Hải đứng một mình bên gốc bàng.”" },
      { q: "Em đã làm gì để Hải vui?", options: ["Rủ Hải chơi đá cầu", "Cho Hải mượn bút", "Đưa Hải về nhà"], answer: "Rủ Hải chơi đá cầu", explain: "“Em chạy đến, rủ Hải chơi đá cầu.”" },
    ],
    dictation: "Giờ ra chơi, Hải đứng một mình bên gốc bàng. Trông bạn có vẻ buồn. Em chạy đến, rủ Hải chơi đá cầu.",
  }),
  P({
    id: "ban-tay-me", kinds: ["giua-hk2"], title: "Bàn tay mẹ",
    text: `Bàn tay mẹ không còn mềm mại như xưa. Mỗi sáng, đôi bàn tay ấy nấu cơm, giặt áo cho cả nhà. Buổi chiều, mẹ lại ra đồng cấy lúa. Tối đến, mẹ ngồi khâu chiếc áo bị rách cho em.

Em nắm bàn tay mẹ, thấy chai sạn mà ấm áp vô cùng. Em thầm nghĩ: “Mình sẽ chăm ngoan, học giỏi để mẹ vui lòng.”`,
    questions: [
      { q: "Mỗi sáng, đôi bàn tay mẹ làm gì?", options: ["Nấu cơm, giặt áo cho cả nhà", "Cấy lúa ngoài đồng", "Khâu áo cho em"], answer: "Nấu cơm, giặt áo cho cả nhà", explain: "“Mỗi sáng, đôi bàn tay ấy nấu cơm, giặt áo cho cả nhà.”" },
      { q: "Tối đến, mẹ làm gì?", options: ["Khâu chiếc áo bị rách cho em", "Ra đồng cấy lúa", "Đi chợ mua rau"], answer: "Khâu chiếc áo bị rách cho em", explain: "“Tối đến, mẹ ngồi khâu chiếc áo bị rách cho em.”" },
      { q: "Em thầm hứa điều gì?", options: ["Chăm ngoan, học giỏi để mẹ vui lòng", "Đi chơi thật nhiều", "Mua cho mẹ chiếc áo mới"], answer: "Chăm ngoan, học giỏi để mẹ vui lòng", explain: "Em thầm nghĩ: “Mình sẽ chăm ngoan, học giỏi để mẹ vui lòng.”" },
    ],
    dictation: "Mỗi sáng, đôi bàn tay ấy nấu cơm, giặt áo cho cả nhà. Buổi chiều, mẹ lại ra đồng cấy lúa.",
  }),

  /* ═════════════ CUỐI HỌC KÌ II ═════════════ */
  P({
    id: "mua-rao", kinds: ["cuoi-hk2"], title: "Mưa rào",
    text: `Trưa hè, trời nắng chang chang. Bỗng mây đen kéo đến kín cả bầu trời. Gió thổi mạnh, lá cây bay xào xạc. Rồi mưa rào ập xuống.

Mưa rơi lộp bộp trên mái nhà. Cây cối như được tắm mát. Đàn vịt ngoài ao kêu cạp cạp, vui ra mặt.

Chỉ một lúc sau, mưa tạnh. Ông mặt trời lại ló ra. Trên bầu trời hiện lên một chiếc cầu vồng bảy sắc rất đẹp. Bé Mai reo lên:

– A, cầu vồng!`,
    questions: [
      { q: "Trước khi mưa, bầu trời thế nào?", options: ["Mây đen kéo đến kín cả bầu trời", "Trời trong xanh, không có mây", "Có cầu vồng bảy sắc"], answer: "Mây đen kéo đến kín cả bầu trời", explain: "“Bỗng mây đen kéo đến kín cả bầu trời.”" },
      { q: "Trong bài, mưa rơi trên mái nhà nghe thế nào?", options: ["Lộp bộp", "Ầm ầm", "Rì rào"], answer: "Lộp bộp", explain: "“Mưa rơi lộp bộp trên mái nhà.”" },
      { q: "Mưa tạnh, trên bầu trời hiện lên cái gì?", options: ["Một chiếc cầu vồng", "Một đàn chim", "Một vầng trăng"], answer: "Một chiếc cầu vồng", explain: "“Trên bầu trời hiện lên một chiếc cầu vồng bảy sắc rất đẹp.”" },
    ],
    dictation: "Mưa rơi lộp bộp trên mái nhà. Cây cối như được tắm mát. Đàn vịt ngoài ao kêu cạp cạp, vui ra mặt.",
  }),
  P({
    id: "ngay-hoi-o-ban", kinds: ["cuoi-hk2"], title: "Ngày hội ở bản",
    text: `Mùa xuân, bản của Pao mở hội. Từ sáng sớm, mọi người đã mặc quần áo đẹp, kéo nhau ra bãi cỏ.

Các chị đeo vòng bạc sáng lấp lánh. Các anh thổi khèn, tiếng khèn vang khắp núi rừng. Pao cùng các bạn chơi ném còn. Quả còn bay vút lên cao rồi rơi xuống. Ai cũng cười vui vẻ.

Pao mong năm nào bản mình cũng có ngày hội như thế.`,
    questions: [
      { q: "Bản của Pao mở hội vào mùa nào?", options: ["Mùa xuân", "Mùa hè", "Mùa đông"], answer: "Mùa xuân", explain: "“Mùa xuân, bản của Pao mở hội.”" },
      { q: "Các anh làm gì trong ngày hội?", options: ["Thổi khèn", "Đeo vòng bạc", "Nấu cơm"], answer: "Thổi khèn", explain: "“Các anh thổi khèn, tiếng khèn vang khắp núi rừng.”" },
      { q: "Pao cùng các bạn chơi trò gì?", options: ["Ném còn", "Đá cầu", "Nhảy dây"], answer: "Ném còn", explain: "“Pao cùng các bạn chơi ném còn.”" },
    ],
    dictation: "Các chị đeo vòng bạc sáng lấp lánh. Các anh thổi khèn, tiếng khèn vang khắp núi rừng. Pao cùng các bạn chơi ném còn.",
  }),
];

const hk1 = readable(KNOWN_GIUA_HK1);
const tap1 = readable(KNOWN_CUOI_HK1);

export const TV1_EXAM: Tv12Content = {
  grade: 1,
  passages: PASSAGES,
  spelling: {
    "giua-hk1": [chinhTa("c-k", undefined, hk1), chinhTa("g-gh", undefined, hk1), chinhTa("ng-ngh", undefined, hk1)],
    "cuoi-hk1": [chinhTa("c-k", undefined, tap1), chinhTa("g-gh", undefined, tap1), chinhTa("ng-ngh", undefined, tap1), chinhTa("ao-au", undefined, tap1)],
    "giua-hk2": [chinhTa("ch-tr"), chinhTa("s-x"), chinhTa("l-n"), chinhTa("v-d-gi")],
    "cuoi-hk2": [chinhTa("h-th-kh"), chinhTa("r-d-gi"), chinhTa("ao-au"), chinhTa("ai-ay"), chinhTa("an-ang")],
  },
  spellingNames: {
    "giua-hk1": "c / k, g / gh, ng / ngh",
    "cuoi-hk1": "c / k, g / gh, ng / ngh, ao / au",
    "giua-hk2": "ch / tr, s / x, l / n, v / d / gi",
    "cuoi-hk2": "h / th / kh, r / d / gi, vần ao / au, ai / ay, an / ang",
  },
  words: { "giua-hk1": [25, 55], "cuoi-hk1": [40, 80], "giua-hk2": [60, 110], "cuoi-hk2": [60, 120] },
  dictationWords: { "giua-hk1": [8, 16], "cuoi-hk1": [12, 25], "giua-hk2": [18, 35], "cuoi-hk2": [18, 35] },
  speed: {
    "giua-hk1": "khoảng 15–20 tiếng/phút",
    "cuoi-hk1": "khoảng 20–30 tiếng/phút",
    "giua-hk2": "khoảng 30–40 tiếng/phút",
    "cuoi-hk2": "khoảng 40–60 tiếng/phút",
  },
};
