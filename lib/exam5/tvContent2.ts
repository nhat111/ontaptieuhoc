// lib/exam5/tvContent2.ts
// Nội dung đề Tiếng Việt lớp 2 — VIẾT TAY, không sinh bằng máy, không chép sách giáo khoa:
// bài đọc do Ôn Tập Cùng Con tự soạn theo chủ điểm của Tiếng Việt 2 (em lớn lên từng ngày,
// đi học vui sao, mái ấm gia đình, vẻ đẹp quanh em, hành tinh xanh, nghề nghiệp, quê hương).
// CẦN NGƯỜI DUYỆT trước khi coi là xong.
//
// Quy tắc (scripts/tv12-check.ts kiểm tra phần máy kiểm được):
//   • Mỗi câu trắc nghiệm 4 lựa chọn, đúng MỘT đáp án; `answer` nằm trong `options`.
//   • Câu hỏi trích bài đọc thì phần trích có nguyên văn trong bài; đoạn nghe – viết trích
//     nguyên văn bài đọc. Ngoặc kép cong “ ”.
//   • Luyện từ và câu theo kì (theo thứ tự sách): giữa HK I từ chỉ sự vật, hoạt động, câu giới
//     thiệu, câu nêu hoạt động, dấu chấm, dấu chấm hỏi; cuối HK I từ chỉ đặc điểm, câu nêu đặc
//     điểm, dấu phẩy, từ ngữ về gia đình; giữa HK II từ ngữ về các mùa, cây cối, con vật, dấu
//     chấm than; cuối HK II từ ngữ về nghề nghiệp, Bác Hồ, quê hương, ôn kiểu câu và dấu câu.
//   • Đề viết đoạn: 4–5 câu, có câu hỏi gợi ý như đề thật.

import { cauGi, cauLa, dauCuoiCau, dauPhay, tuChi, tuLaGi, vonTu } from "../tvGen/ltvc";
import { chinhTa, hoiNga } from "../tvGen/spell";
import type { Tv12Content, Tv12Passage } from "./tv12";

const P = (p: Tv12Passage) => p;

const PASSAGES: Tv12Passage[] = [
  /* ═════════════ GIỮA HỌC KÌ I ═════════════ */
  P({
    id: "chiec-but-muc", kinds: ["giua-hk1"], title: "Chiếc bút mực",
    text: `Hôm nay, cô giáo cho cả lớp tập viết bút mực. Ai cũng háo hức. Nam đã có bút từ hôm qua. Bố mua cho Nam chiếc bút màu xanh, ngòi sáng loáng.

Mai ngồi bên cạnh cứ lục mãi trong cặp. Mặt Mai đỏ bừng:

– Chết rồi, tớ để quên bút ở nhà!

Nam nhìn chiếc bút mới của mình, rồi nhìn Mai. Nam nhớ trong hộp bút còn chiếc bút cũ của anh trai. Nam lấy ra, đưa cho Mai:

– Bạn dùng tạm chiếc này nhé!

Mai cảm ơn Nam rối rít. Hai bạn cùng cúi xuống nắn nót từng chữ. Cuối giờ, cô giáo khen cả hai bạn viết đẹp. Nam thấy trong lòng thật vui.`,
    questions: [
      { q: "Hôm nay, cô giáo cho cả lớp làm gì?", options: ["Tập viết bút mực", "Vẽ tranh", "Hát múa", "Đọc truyện"], answer: "Tập viết bút mực", explain: "“Hôm nay, cô giáo cho cả lớp tập viết bút mực.”" },
      { q: "Vì sao mặt Mai đỏ bừng?", options: ["Vì Mai để quên bút ở nhà", "Vì Mai bị ốm", "Vì Mai được cô khen", "Vì Mai làm rơi cặp"], answer: "Vì Mai để quên bút ở nhà", explain: "Mai nói: “Chết rồi, tớ để quên bút ở nhà!”" },
      { q: "Nam đã làm gì để giúp Mai?", options: ["Cho Mai mượn chiếc bút cũ của anh trai", "Cho Mai chiếc bút mới màu xanh", "Viết bài giúp Mai", "Chạy về nhà lấy bút cho Mai"], answer: "Cho Mai mượn chiếc bút cũ của anh trai", explain: "“Nam nhớ trong hộp bút còn chiếc bút cũ của anh trai. Nam lấy ra, đưa cho Mai.”" },
      { q: "Câu chuyện khen bạn Nam điều gì?", options: ["Biết giúp đỡ bạn", "Viết chữ rất nhanh", "Có nhiều bút đẹp", "Hay nói chuyện trong lớp"], answer: "Biết giúp đỡ bạn", explain: "Nam cho Mai mượn bút khi bạn quên, nên cả hai bạn đều viết được bài." },
    ],
    ltvc: { q: "Trong câu “Hai bạn cùng cúi xuống nắn nót từng chữ.”, từ nào chỉ hoạt động?", options: ["cúi", "bạn", "chữ", "hai"], answer: "cúi", explain: "“cúi” chỉ việc hai bạn làm nên là từ chỉ hoạt động; “bạn”, “chữ” là từ chỉ sự vật." },
    open: { q: "Nếu bạn ngồi cạnh em quên đồ dùng học tập, em sẽ làm gì? Viết 1–2 câu.", hint: "Câu đúng, nêu được việc làm cụ thể. VD: “Em sẽ cho bạn mượn bút chì của em.”" },
    dictation: "Mai cảm ơn Nam rối rít. Hai bạn cùng cúi xuống nắn nót từng chữ. Cuối giờ, cô giáo khen cả hai bạn viết đẹp. Nam thấy trong lòng thật vui.",
  }),
  P({
    id: "goc-hoc-tap", kinds: ["giua-hk1"], title: "Góc học tập của Bi",
    text: `Bi vừa lên lớp Hai. Bố mẹ dành cho Bi một góc học tập nhỏ bên cửa sổ. Ở đó có chiếc bàn gỗ, chiếc ghế xinh và một ngọn đèn bàn màu vàng.

Ngày đầu, góc học tập rất gọn gàng. Nhưng chỉ vài hôm sau, sách vở, bút thước đã nằm lung tung khắp bàn. Có hôm, Bi tìm mãi không thấy quyển vở Tiếng Việt, suýt nữa thì muộn học.

Tối hôm ấy, mẹ ngồi xuống bên Bi, nhẹ nhàng bảo:

– Đồ đạc cũng cần có chỗ của chúng, con ạ.

Mẹ chỉ cho Bi xếp sách một bên, vở một bên, bút thước cho vào hộp. Từ đó, tối nào Bi cũng tự dọn góc học tập trước khi đi ngủ. Bi thấy mình đã lớn thật rồi.`,
    questions: [
      { q: "Góc học tập của Bi ở đâu?", options: ["Bên cửa sổ", "Cạnh giường ngủ", "Ở phòng khách", "Dưới gốc cây"], answer: "Bên cửa sổ", explain: "“Bố mẹ dành cho Bi một góc học tập nhỏ bên cửa sổ.”" },
      { q: "Vì sao có hôm Bi suýt muộn học?", options: ["Vì tìm mãi không thấy quyển vở Tiếng Việt", "Vì Bi ngủ dậy muộn", "Vì trời mưa to", "Vì Bi bị ốm"], answer: "Vì tìm mãi không thấy quyển vở Tiếng Việt", explain: "“Có hôm, Bi tìm mãi không thấy quyển vở Tiếng Việt, suýt nữa thì muộn học.”" },
      { q: "Mẹ đã chỉ cho Bi điều gì?", options: ["Cách xếp sách vở, bút thước gọn gàng", "Cách làm bài tập", "Cách bật đèn bàn", "Cách vẽ tranh"], answer: "Cách xếp sách vở, bút thước gọn gàng", explain: "“Mẹ chỉ cho Bi xếp sách một bên, vở một bên, bút thước cho vào hộp.”" },
      { q: "Từ đó, tối nào Bi cũng làm gì?", options: ["Tự dọn góc học tập trước khi đi ngủ", "Nhờ mẹ dọn góc học tập", "Xem ti vi đến khuya", "Đọc truyện cho mẹ nghe"], answer: "Tự dọn góc học tập trước khi đi ngủ", explain: "“Từ đó, tối nào Bi cũng tự dọn góc học tập trước khi đi ngủ.”" },
    ],
    ltvc: { q: "Trong câu “Ở đó có chiếc bàn gỗ, chiếc ghế xinh và một ngọn đèn bàn màu vàng.”, từ nào chỉ sự vật?", options: ["đèn bàn", "xinh", "vàng", "có"], answer: "đèn bàn", explain: "“đèn bàn” là đồ vật nên là từ chỉ sự vật; “xinh”, “vàng” là từ chỉ đặc điểm." },
    open: { q: "Em làm gì để giữ góc học tập của mình gọn gàng? Viết 1–2 câu.", hint: "Câu đúng, nêu được việc làm cụ thể. VD: “Học xong, em xếp sách vở vào cặp và cất bút vào hộp.”" },
    dictation: "Mẹ chỉ cho Bi xếp sách một bên, vở một bên, bút thước cho vào hộp. Từ đó, tối nào Bi cũng tự dọn góc học tập trước khi đi ngủ.",
  }),

  /* ═════════════ CUỐI HỌC KÌ I ═════════════ */
  P({
    id: "chiec-khan-len", kinds: ["cuoi-hk1"], title: "Chiếc khăn len",
    text: `Mùa đông năm nay lạnh hơn mọi năm. Bà ngoại của Hà ở quê lại hay bị đau họng. Hà nghĩ mãi xem nên làm gì để giúp bà.

Một hôm, Hà thấy mẹ đan áo len. Hà liền xin mẹ dạy cho mình đan. Lúc đầu, những mũi len cứ tuột ra, Hà phải tháo ra đan lại mấy lần. Mẹ bảo:

– Con cứ kiên nhẫn, rồi sẽ đan được thôi.

Hà chăm chỉ tập đan mỗi tối. Sau hai tuần, chiếc khăn len màu đỏ đã xong. Khăn chưa thật đẹp nhưng dày và ấm.

Chủ nhật, cả nhà về quê. Hà quàng chiếc khăn lên cổ bà. Bà ôm Hà vào lòng, mắt rưng rưng:

– Khăn của cháu ấm nhất trên đời!`,
    questions: [
      { q: "Vì sao Hà muốn giúp bà ngoại?", options: ["Vì trời lạnh, bà hay bị đau họng", "Vì bà sắp đến sinh nhật", "Vì bà nhờ Hà đan khăn", "Vì bà làm mất khăn"], answer: "Vì trời lạnh, bà hay bị đau họng", explain: "“Mùa đông năm nay lạnh hơn mọi năm. Bà ngoại của Hà ở quê lại hay bị đau họng.”" },
      { q: "Ai đã dạy Hà đan len?", options: ["Mẹ", "Bà ngoại", "Cô giáo", "Chị gái"], answer: "Mẹ", explain: "“Hà liền xin mẹ dạy cho mình đan.”" },
      { q: "Chiếc khăn Hà đan như thế nào?", options: ["Màu đỏ, chưa thật đẹp nhưng dày và ấm", "Màu xanh, rất mỏng", "Rất đẹp nhưng không ấm", "Màu trắng, có hoa"], answer: "Màu đỏ, chưa thật đẹp nhưng dày và ấm", explain: "“chiếc khăn len màu đỏ đã xong. Khăn chưa thật đẹp nhưng dày và ấm.”" },
      { q: "Câu chuyện cho em biết điều gì về bạn Hà?", options: ["Hà yêu thương bà và biết kiên nhẫn", "Hà thích đan len hơn đi học", "Hà không thích về quê", "Hà làm việc gì cũng vội vàng"], answer: "Hà yêu thương bà và biết kiên nhẫn", explain: "Hà tập đan mỗi tối, tháo ra đan lại mấy lần để có khăn quàng cho bà." },
    ],
    ltvc: { q: "Trong câu “Khăn chưa thật đẹp nhưng dày và ấm.”, từ nào chỉ đặc điểm?", options: ["dày", "khăn", "chưa", "nhưng"], answer: "dày", explain: "“dày” nói về chiếc khăn trông thế nào nên là từ chỉ đặc điểm; “khăn” là từ chỉ sự vật." },
    open: { q: "Em đã làm gì để thể hiện tình yêu thương với ông bà? Viết 1–2 câu.", hint: "Câu đúng, nêu được việc làm cụ thể. VD: “Em hay đấm lưng cho bà và kể chuyện ở lớp cho ông nghe.”" },
    dictation: "Hà chăm chỉ tập đan mỗi tối. Sau hai tuần, chiếc khăn len màu đỏ đã xong. Khăn chưa thật đẹp nhưng dày và ấm.",
  }),
  P({
    id: "con-duong-den-truong", kinds: ["cuoi-hk1"], title: "Con đường đến trường",
    text: `Con đường từ nhà em đến trường dài chừng một cây số. Hai bên đường là những hàng cây xà cừ cao vút. Mùa hè, tán lá xanh rì che mát cả lối đi.

Sáng sớm, con đường còn yên tĩnh. Chỉ có tiếng chim lích chích trên cành và tiếng chổi tre của cô lao công. Gần bảy giờ, đường bỗng nhộn nhịp hẳn lên. Các bạn học sinh mặc áo trắng, đeo khăn quàng đỏ ríu rít đến trường. Tiếng xe đạp leng keng, tiếng gọi nhau í ới.

Em yêu con đường này lắm. Mỗi sáng đi trên đường, em lại thầm chào hàng cây như chào những người bạn thân.`,
    questions: [
      { q: "Hai bên đường có những hàng cây gì?", options: ["Cây xà cừ", "Cây phượng", "Cây bàng", "Cây hoa sữa"], answer: "Cây xà cừ", explain: "“Hai bên đường là những hàng cây xà cừ cao vút.”" },
      { q: "Sáng sớm, trên con đường nghe thấy những âm thanh nào?", options: ["Tiếng chim lích chích và tiếng chổi tre", "Tiếng trống trường", "Tiếng còi ô tô", "Tiếng mưa rơi"], answer: "Tiếng chim lích chích và tiếng chổi tre", explain: "“Chỉ có tiếng chim lích chích trên cành và tiếng chổi tre của cô lao công.”" },
      { q: "Gần bảy giờ, con đường thế nào?", options: ["Nhộn nhịp hẳn lên", "Vẫn yên tĩnh", "Vắng tanh", "Ngập nước"], answer: "Nhộn nhịp hẳn lên", explain: "“Gần bảy giờ, đường bỗng nhộn nhịp hẳn lên.”" },
      { q: "Bạn nhỏ có tình cảm thế nào với con đường?", options: ["Rất yêu con đường", "Thấy con đường quá dài", "Sợ đi trên đường một mình", "Muốn đi đường khác"], answer: "Rất yêu con đường", explain: "“Em yêu con đường này lắm.”" },
    ],
    ltvc: { q: "Trong câu “Hai bên đường là những hàng cây xà cừ cao vút.”, từ nào chỉ đặc điểm?", options: ["cao vút", "hàng cây", "đường", "bên"], answer: "cao vút", explain: "“cao vút” cho biết hàng cây trông thế nào nên là từ chỉ đặc điểm." },
    open: { q: "Trên đường đến trường, em thường thấy những gì? Viết 1–2 câu.", hint: "Câu đúng, kể được sự vật cụ thể. VD: “Trên đường đến trường, em thấy hàng cây xanh và các bạn đạp xe ríu rít.”" },
    dictation: "Sáng sớm, con đường còn yên tĩnh. Chỉ có tiếng chim lích chích trên cành và tiếng chổi tre của cô lao công. Gần bảy giờ, đường bỗng nhộn nhịp hẳn lên.",
  }),

  /* ═════════════ GIỮA HỌC KÌ II ═════════════ */
  P({
    id: "chu-cho-muc", kinds: ["giua-hk2"], title: "Chú chó Mực",
    text: `Nhà em nuôi một chú chó tên là Mực. Mực có bộ lông đen nhánh, đôi mắt tròn và sáng. Mỗi chiều đi học về, vừa đến đầu ngõ đã thấy Mực chạy ra, vẫy đuôi rối rít.

Mực rất khôn. Có người lạ đến, nó sủa vang để báo cho cả nhà biết. Đêm đến, nó nằm trước cửa canh nhà.

Có lần Mực bị ốm, nằm im một chỗ, chẳng chịu ăn. Em lo lắm, cứ ngồi bên vuốt ve nó. Bố đưa Mực đi khám, mua thuốc về cho nó uống. Mấy hôm sau, Mực khỏe lại, chạy nhảy tung tăng quanh sân. Em vui mừng ôm chầm lấy nó.

Với em, Mực không chỉ là con vật nuôi mà còn là một người bạn thân thiết.`,
    questions: [
      { q: "Chú chó Mực có bộ lông màu gì?", options: ["Đen nhánh", "Vàng óng", "Trắng muốt", "Nâu sẫm"], answer: "Đen nhánh", explain: "“Mực có bộ lông đen nhánh, đôi mắt tròn và sáng.”" },
      { q: "Khi có người lạ đến, Mực làm gì?", options: ["Sủa vang để báo cho cả nhà biết", "Vẫy đuôi mừng rỡ", "Chạy trốn vào bếp", "Nằm im trước cửa"], answer: "Sủa vang để báo cho cả nhà biết", explain: "“Có người lạ đến, nó sủa vang để báo cho cả nhà biết.”" },
      { q: "Khi Mực bị ốm, bố đã làm gì?", options: ["Đưa Mực đi khám, mua thuốc cho nó uống", "Ngồi bên vuốt ve Mực", "Dắt Mực đi chơi", "Mua cho Mực một cái ổ mới"], answer: "Đưa Mực đi khám, mua thuốc cho nó uống", explain: "“Bố đưa Mực đi khám, mua thuốc về cho nó uống.”" },
      { q: "Bạn nhỏ coi Mực là gì?", options: ["Một người bạn thân thiết", "Một con vật đáng sợ", "Một món đồ chơi", "Một con vật hay nghịch"], answer: "Một người bạn thân thiết", explain: "“Mực không chỉ là con vật nuôi mà còn là một người bạn thân thiết.”" },
    ],
    ltvc: { q: "Câu “Mực rất khôn.” trả lời cho câu hỏi nào?", options: ["Con gì thế nào?", "Con gì là gì?", "Con gì làm gì?", "Ở đâu?"], answer: "Con gì thế nào?", explain: "Câu nói về đặc điểm của Mực (“rất khôn”) nên trả lời câu hỏi Con gì thế nào?" },
    open: { q: "Em thích con vật nuôi nào nhất? Vì sao? Viết 1–2 câu.", hint: "Câu đúng, nêu được con vật và lí do. VD: “Em thích con mèo nhất vì nó có bộ lông mềm và hay quấn quýt bên em.”" },
    dictation: "Mỗi chiều đi học về, vừa đến đầu ngõ đã thấy Mực chạy ra, vẫy đuôi rối rít. Mực rất khôn. Có người lạ đến, nó sủa vang để báo cho cả nhà biết.",
  }),
  P({
    id: "hat-dau-nay-mam", kinds: ["giua-hk2"], title: "Hạt đậu nảy mầm",
    text: `Đầu năm học, cô giáo phát cho mỗi bạn một hạt đậu và một cốc nhựa nhỏ. Cô dặn:

– Các em gieo hạt rồi chăm sóc, xem hạt đậu của ai nảy mầm nhé!

Về nhà, Lan cho đất vào cốc, vùi hạt đậu xuống rồi tưới một chút nước. Lan đặt cốc bên cửa sổ, nơi có ánh nắng. Ngày nào Lan cũng ghé xem. Ba hôm trôi qua, đất vẫn im lìm. Lan hơi buồn.

Sáng thứ tư, Lan reo lên. Từ trong đất, một mầm xanh nhỏ xíu đã nhú lên, cong cong như một dấu hỏi. Những ngày sau, mầm vươn cao, xòe ra hai chiếc lá non mơn mởn.

Lan mang cốc đậu đến lớp. Cô khen Lan biết kiên trì chăm sóc cây.`,
    questions: [
      { q: "Cô giáo phát cho mỗi bạn những gì?", options: ["Một hạt đậu và một cốc nhựa nhỏ", "Một cây non và một chậu đất", "Một gói hạt hoa", "Một bình tưới cây"], answer: "Một hạt đậu và một cốc nhựa nhỏ", explain: "“cô giáo phát cho mỗi bạn một hạt đậu và một cốc nhựa nhỏ”." },
      { q: "Lan đặt cốc đậu ở đâu?", options: ["Bên cửa sổ, nơi có ánh nắng", "Trong tủ bếp", "Dưới gầm giường", "Ngoài sân"], answer: "Bên cửa sổ, nơi có ánh nắng", explain: "“Lan đặt cốc bên cửa sổ, nơi có ánh nắng.”" },
      { q: "Mầm đậu mới nhú được so sánh với hình ảnh nào?", options: ["Một dấu hỏi", "Một chiếc lá non", "Một ngọn nến", "Một sợi chỉ"], answer: "Một dấu hỏi", explain: "Mầm xanh “cong cong như một dấu hỏi”." },
      { q: "Vì sao cô khen Lan?", options: ["Vì Lan biết kiên trì chăm sóc cây", "Vì cốc của Lan đẹp nhất", "Vì Lan mua được nhiều hạt", "Vì Lan đến lớp sớm"], answer: "Vì Lan biết kiên trì chăm sóc cây", explain: "“Cô khen Lan biết kiên trì chăm sóc cây.”" },
    ],
    ltvc: { q: "Trong câu “Những ngày sau, mầm vươn cao, xòe ra hai chiếc lá non mơn mởn.”, từ nào chỉ đặc điểm của chiếc lá?", options: ["mơn mởn", "vươn", "xòe", "ngày"], answer: "mơn mởn", explain: "“mơn mởn” cho biết chiếc lá non trông thế nào nên là từ chỉ đặc điểm; “vươn”, “xòe” chỉ hoạt động." },
    open: { q: "Em đã từng trồng hoặc chăm sóc một cây nào chưa? Hãy kể lại bằng 1–2 câu.", hint: "Câu đúng, kể được việc làm cụ thể. VD: “Em cùng bố trồng một cây ớt, ngày nào em cũng tưới nước cho cây.”" },
    dictation: "Sáng thứ tư, Lan reo lên. Từ trong đất, một mầm xanh nhỏ xíu đã nhú lên, cong cong như một dấu hỏi. Những ngày sau, mầm vươn cao, xòe ra hai chiếc lá non mơn mởn.",
  }),

  /* ═════════════ CUỐI HỌC KÌ II ═════════════ */
  P({
    id: "bac-dua-thu", kinds: ["cuoi-hk2"], title: "Bác đưa thư",
    text: `Ở khu phố em có bác Tâm làm nghề đưa thư. Ngày nào cũng vậy, bác đạp chiếc xe màu xanh đi khắp các ngõ. Trên xe là chiếc túi to đựng đầy thư, báo và những gói quà nhỏ.

Dù trời nắng hay mưa, bác vẫn đến đúng giờ. Mùa hè, mồ hôi ướt đẫm lưng áo. Mùa đông, gió lạnh làm đôi tay bác tím tái. Nhưng lúc nào bác cũng tươi cười.

Có lần, bà Tư nhận được thư của con trai ở xa gửi về. Mắt bà kém, không đọc được. Bác Tâm dựng xe, ngồi xuống đọc thư cho bà nghe. Bà vui lắm, cứ cảm ơn bác mãi.

Em nghĩ, nghề đưa thư thật đáng quý vì đã mang niềm vui đến cho mọi nhà.`,
    questions: [
      { q: "Bác Tâm làm nghề gì?", options: ["Đưa thư", "Bán báo", "Bác sĩ", "Lao công"], answer: "Đưa thư", explain: "“Ở khu phố em có bác Tâm làm nghề đưa thư.”" },
      { q: "Bác Tâm đi đưa thư bằng gì?", options: ["Chiếc xe đạp màu xanh", "Xe máy", "Ô tô", "Đi bộ"], answer: "Chiếc xe đạp màu xanh", explain: "“bác đạp chiếc xe màu xanh đi khắp các ngõ”." },
      { q: "Bác Tâm đã giúp bà Tư việc gì?", options: ["Đọc thư cho bà nghe", "Viết thư cho bà", "Mang quà đến cho bà", "Đưa bà đi chợ"], answer: "Đọc thư cho bà nghe", explain: "“Bác Tâm dựng xe, ngồi xuống đọc thư cho bà nghe.”" },
      { q: "Vì sao bạn nhỏ thấy nghề đưa thư đáng quý?", options: ["Vì mang niềm vui đến cho mọi nhà", "Vì được đi xe đạp khắp nơi", "Vì được nhận nhiều quà", "Vì không phải làm việc vất vả"], answer: "Vì mang niềm vui đến cho mọi nhà", explain: "“nghề đưa thư thật đáng quý vì đã mang niềm vui đến cho mọi nhà”." },
    ],
    ltvc: { q: "Trong câu “Ngày nào cũng vậy, bác đạp chiếc xe màu xanh đi khắp các ngõ.”, từ nào chỉ hoạt động?", options: ["đạp", "xe", "xanh", "ngõ"], answer: "đạp", explain: "“đạp” chỉ việc bác Tâm làm nên là từ chỉ hoạt động; “xe”, “ngõ” chỉ sự vật, “xanh” chỉ đặc điểm." },
    open: { q: "Lớn lên, em muốn làm nghề gì? Vì sao? Viết 1–2 câu.", hint: "Câu đúng, nêu được nghề và lí do. VD: “Lớn lên, em muốn làm bác sĩ để chữa bệnh cho mọi người.”" },
    dictation: "Dù trời nắng hay mưa, bác vẫn đến đúng giờ. Mùa hè, mồ hôi ướt đẫm lưng áo. Mùa đông, gió lạnh làm đôi tay bác tím tái.",
  }),
  P({
    id: "cho-noi-que-ngoai", kinds: ["cuoi-hk2"], title: "Chợ nổi quê ngoại",
    text: `Hè này, em được theo mẹ về thăm quê ngoại ở miền Tây. Quê ngoại có nhiều kênh rạch, nhà nào cũng có một chiếc xuồng nhỏ.

Sáng sớm, ông ngoại chèo xuồng đưa em đi chợ nổi. Trên sông, hàng trăm chiếc ghe, chiếc xuồng chở đầy cam, bưởi, chuối, khóm. Mỗi chiếc ghe treo một cây sào cao, trên đầu sào buộc thứ quả mà ghe ấy bán. Ông bảo đó là cách người bán mời khách mà không cần nói. Tiếng mời chào, tiếng nói cười rộn ràng cả một khúc sông.

Ông mua cho em một trái dừa xiêm. Nước dừa ngọt mát. Em ngồi trên xuồng, ngắm dòng sông lấp lánh nắng sớm, thấy yêu quê ngoại vô cùng.`,
    questions: [
      { q: "Quê ngoại của bạn nhỏ ở đâu?", options: ["Ở miền Tây", "Ở vùng núi cao", "Ở thành phố lớn", "Ở gần biển"], answer: "Ở miền Tây", explain: "“em được theo mẹ về thăm quê ngoại ở miền Tây”." },
      { q: "Ông ngoại đưa bạn nhỏ đi chợ nổi bằng gì?", options: ["Chiếc xuồng", "Xe đạp", "Ô tô", "Xe máy"], answer: "Chiếc xuồng", explain: "“Sáng sớm, ông ngoại chèo xuồng đưa em đi chợ nổi.”" },
      { q: "Vì sao người bán buộc quả lên đầu cây sào?", options: ["Để người mua biết ghe ấy bán gì", "Để quả không bị hỏng", "Để trang trí ghe cho đẹp", "Để làm mồi câu cá"], answer: "Để người mua biết ghe ấy bán gì", explain: "Trên đầu sào buộc thứ quả mà ghe ấy bán — “đó là cách người bán mời khách mà không cần nói”." },
      { q: "Câu cuối bài cho em biết điều gì?", options: ["Bạn nhỏ rất yêu quê ngoại", "Bạn nhỏ muốn về nhà", "Bạn nhỏ sợ đi xuồng", "Bạn nhỏ không thích nước dừa"], answer: "Bạn nhỏ rất yêu quê ngoại", explain: "Em “thấy yêu quê ngoại vô cùng”." },
    ],
    ltvc: { q: "Câu “Nước dừa ngọt mát.” là kiểu câu nào?", options: ["Câu nêu đặc điểm", "Câu giới thiệu", "Câu nêu hoạt động", "Câu hỏi"], answer: "Câu nêu đặc điểm", explain: "Câu trả lời câu hỏi Cái gì thế nào? (nước dừa – ngọt mát) nên là câu nêu đặc điểm." },
    open: { q: "Quê em (hoặc nơi em ở) có cảnh vật gì đẹp? Viết 1–2 câu.", hint: "Câu đúng, tả được một cảnh vật cụ thể. VD: “Quê em có cánh đồng lúa xanh mướt, chiều chiều gió thổi mát rượi.”" },
    dictation: "Sáng sớm, ông ngoại chèo xuồng đưa em đi chợ nổi. Trên sông, hàng trăm chiếc ghe, chiếc xuồng chở đầy cam, bưởi, chuối, khóm.",
  }),
];

const KINDS_3 = ["su-vat", "hoat-dong", "dac-diem"] as const;
const CAU_3 = ["gioi-thieu", "hoat-dong", "dac-diem"] as const;

export const TV2_EXAM: Tv12Content = {
  grade: 2,
  passages: PASSAGES,
  spelling: {
    "giua-hk1": [chinhTa("c-k"), chinhTa("g-gh"), chinhTa("ng-ngh"), chinhTa("ch-tr")],
    "cuoi-hk1": [chinhTa("s-x"), chinhTa("l-n"), chinhTa("ao-au"), chinhTa("ai-ay"), chinhTa("iu-uu")],
    "giua-hk2": [chinhTa("r-d-gi"), chinhTa("uon-uong"), chinhTa("ieu-uou"), chinhTa("en-eng")],
    "cuoi-hk2": [hoiNga, chinhTa("s-x"), chinhTa("ch-tr"), chinhTa("ien-ieng"), chinhTa("eo-oe")],
  },
  spellingNames: {
    "giua-hk1": "c / k, g / gh, ng / ngh, ch / tr",
    "cuoi-hk1": "s / x, l / n, vần ao / au, ai / ay, iu / ưu",
    "giua-hk2": "r / d / gi, vần uôn / uông, iêu / ươu, en / eng",
    "cuoi-hk2": "dấu hỏi / dấu ngã, s / x, ch / tr, vần iên / iêng, eo / oe",
  },
  ltvc: {
    "giua-hk1": {
      names: "từ chỉ sự vật, hoạt động; câu giới thiệu, câu nêu hoạt động; dấu chấm, dấu chấm hỏi",
      c6: [tuChi("su-vat"), tuChi("hoat-dong"), tuLaGi(["su-vat", "hoat-dong"]), vonTu("do-dung-hoc-tap")],
      c7: [cauGi(["gioi-thieu", "hoat-dong"]), cauLa("gioi-thieu", ["hoat-dong", "dac-diem"]), dauCuoiCau([".", "?"])],
    },
    "cuoi-hk1": {
      names: "từ chỉ đặc điểm; câu nêu đặc điểm; dấu phẩy; từ ngữ về gia đình",
      c6: [tuChi("dac-diem"), tuLaGi([...KINDS_3]), vonTu("tinh-cam-gia-dinh"), vonTu("gia-dinh")],
      c7: [cauLa("dac-diem", ["gioi-thieu", "hoat-dong"]), cauGi([...CAU_3]), dauPhay],
    },
    "giua-hk2": {
      names: "từ ngữ về các mùa, cây cối, con vật; dấu chấm, dấu chấm hỏi, dấu chấm than",
      c6: [vonTu("cac-mua"), vonTu("cay-coi"), vonTu("vat-nuoi"), vonTu("muong-thu")],
      c7: [dauCuoiCau([".", "?", "!"]), dauPhay],
    },
    "cuoi-hk2": {
      names: "từ ngữ về nghề nghiệp, Bác Hồ, quê hương; ôn kiểu câu và dấu câu",
      c6: [vonTu("nghe-nghiep"), vonTu("bac-ho"), vonTu("san-pham"), vonTu("duoi-bien")],
      c7: [cauGi([...CAU_3]), dauCuoiCau([".", "?", "!"]), dauPhay],
    },
  },
  writing: {
    "giua-hk1": [
      "Viết 4–5 câu giới thiệu về bản thân em. Gợi ý: Em tên là gì? Em học lớp mấy, trường nào? Em thích làm gì nhất? Ước mơ của em là gì?",
      "Viết 4–5 câu kể về một việc em đã làm ở nhà để giúp đỡ bố mẹ. Gợi ý: Em đã làm việc gì? Em làm việc đó lúc nào? Em làm như thế nào? Làm xong, em cảm thấy thế nào?",
      "Viết 4–5 câu tả một đồ dùng học tập của em. Gợi ý: Đó là đồ dùng gì? Nó có hình dáng, màu sắc thế nào? Em dùng nó để làm gì? Em giữ gìn nó ra sao?",
    ],
    "cuoi-hk1": [
      "Viết 4–5 câu tả một đồ chơi em yêu thích. Gợi ý: Đó là đồ chơi gì? Ai tặng hoặc mua cho em? Nó có hình dáng, màu sắc thế nào? Em chơi với nó ra sao? Em giữ gìn nó thế nào?",
      "Viết 4–5 câu kể về một việc người thân đã làm cho em. Gợi ý: Người thân đó là ai? Người đó đã làm việc gì cho em? Em có suy nghĩ, tình cảm gì về việc làm đó?",
      "Viết 4–5 câu thể hiện tình cảm của em với một người thân trong gia đình. Gợi ý: Người thân em muốn nói tới là ai? Người đó có đặc điểm gì? Người đó thường làm gì cho em? Tình cảm của em với người đó thế nào?",
    ],
    "giua-hk2": [
      "Viết 4–5 câu kể về một con vật nuôi mà em yêu thích. Gợi ý: Đó là con vật gì? Nó có đặc điểm gì nổi bật? Nó thường làm gì? Em chăm sóc nó thế nào? Tình cảm của em với nó ra sao?",
      "Viết 4–5 câu tả một đồ vật trong gia đình em. Gợi ý: Đó là đồ vật gì? Nó có hình dáng, màu sắc thế nào? Nó có ích lợi gì? Em giữ gìn nó ra sao?",
      "Viết 4–5 câu kể về một cây mà em thích. Gợi ý: Đó là cây gì? Cây được trồng ở đâu? Cây có đặc điểm gì (thân, lá, hoa, quả)? Cây có ích lợi gì? Em chăm sóc cây thế nào?",
    ],
    "cuoi-hk2": [
      "Viết 4–5 câu kể về công việc của một người mà em biết. Gợi ý: Người đó là ai, làm nghề gì? Hằng ngày, người đó làm những việc gì? Công việc đó có ích lợi gì? Em có suy nghĩ gì về người đó?",
      "Viết 4–5 câu nói về cảnh vật quê hương em hoặc nơi em ở. Gợi ý: Quê em ở đâu? Ở đó có cảnh vật gì đẹp? Cảnh vật ấy có đặc điểm gì? Em có tình cảm gì với quê hương?",
      "Viết 4–5 câu kể về một việc em đã làm để giữ gìn trường lớp, nhà cửa sạch đẹp. Gợi ý: Em đã làm việc gì? Em làm việc đó cùng ai, lúc nào? Em làm như thế nào? Làm xong, em cảm thấy thế nào?",
    ],
  },
  words: { "giua-hk1": [100, 200], "cuoi-hk1": [100, 200], "giua-hk2": [110, 210], "cuoi-hk2": [110, 210] },
  dictationWords: { "giua-hk1": [25, 45], "cuoi-hk1": [25, 50], "giua-hk2": [25, 50], "cuoi-hk2": [25, 50] },
  speed: {
    "giua-hk1": "khoảng 40–50 tiếng/phút",
    "cuoi-hk1": "khoảng 50–60 tiếng/phút",
    "giua-hk2": "khoảng 55–65 tiếng/phút",
    "cuoi-hk2": "khoảng 60–70 tiếng/phút",
  },
};
