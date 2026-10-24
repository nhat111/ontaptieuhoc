// lib/tvGuide/lop3.ts
// Tiếng Việt 3 – Kết nối tri thức: mục lục và hướng dẫn cách làm từng dạng bài.
// Hướng dẫn và ví dụ do Ôn Tập Cùng Con TỰ VIẾT, không chép sách. CẦN NGƯỜI DUYỆT nội dung.
// Dùng ngoặc kép cong “ ”. `npx tsx scripts/tv-guide-check.ts` kiểm tra phần máy kiểm được.
//
// Sách lớp 3 xếp khác lớp 4, 5: bài lẻ = Đọc · Nói và nghe / Kể chuyện · Nghe – viết;
// bài chẵn = Đọc · Ôn chữ viết hoa / Đọc mở rộng · Luyện tập (Luyện từ và câu + Luyện viết
// đoạn). Vì vậy `ltvcBai: "chan"`. Tên bài đọc, Nói và nghe, Nghe – viết lấy nguyên văn mục
// lục; mục lục chỉ ghi “Luyện tập” nên tên phần Luyện từ và câu, Viết của bài chẵn là tóm tắt
// theo các yêu cầu bài tập trong sách.

import type { TvGuide, TvSkill } from "./types";

const S = (s: TvSkill) => s;

const SKILLS: TvSkill[] = [
  /* ───────────── Luyện từ và câu ───────────── */
  S({
    id: "su-vat-hoat-dong", loai: "ltvc", ten: "Từ ngữ chỉ sự vật, hoạt động",
    laGi: "Từ chỉ sự vật gọi tên người, con vật, đồ vật, cây cối (bạn, mèo, bàn, cây bàng). Từ chỉ hoạt động nói về việc người, vật làm (chạy, đọc, quét).",
    cachLam: [
      "Đọc câu hoặc nhìn tranh, tìm từng từ.",
      "Hỏi: “Ai? Cái gì? Con gì?” Trả lời được thì là từ chỉ sự vật.",
      "Hỏi: “Làm gì?” Trả lời được thì là từ chỉ hoạt động.",
      "Khi đặt câu nêu hoạt động, câu cần trả lời được: Ai (cái gì) làm gì?",
    ],
    viDu: {
      de: "Tìm từ chỉ sự vật, từ chỉ hoạt động trong câu:",
      cau: "Mẹ tưới cây, em quét sân.",
      dapAn: "Sự vật: “Mẹ”, “cây”, “em”, “sân”. Hoạt động: “tưới”, “quét”.",
    },
    loi: "Viết câu nêu hoạt động mà thiếu từ chỉ hoạt động (VD: “Em và mẹ ở sân.”).",
  }),
  S({
    id: "dac-diem", loai: "ltvc", ten: "Từ ngữ chỉ đặc điểm",
    laGi: "Từ chỉ đặc điểm nói về màu sắc, hình dáng, kích thước, tính nết… của sự vật (đỏ thắm, tròn xoe, cao, chăm chỉ).",
    cachLam: [
      "Tìm sự vật trong câu.",
      "Hỏi: sự vật đó “thế nào?” (màu gì, hình gì, to hay nhỏ, tính nết ra sao). Từ trả lời là từ chỉ đặc điểm.",
      "Nếu đề bắt xếp nhóm, xếp theo: màu sắc, hình dáng, kích thước, tính nết…",
    ],
    viDu: {
      de: "Tìm từ chỉ đặc điểm trong câu:",
      cau: "Quả bóng tròn xoe, đỏ rực nằm giữa sân.",
      dapAn: "“tròn xoe” (hình dáng), “đỏ rực” (màu sắc).",
    },
    loi: "Gạch cả từ chỉ sự vật (“Quả bóng”) hoặc hoạt động (“nằm”).",
  }),
  S({
    id: "von-tu", loai: "ltvc", ten: "Mở rộng vốn từ theo chủ điểm",
    laGi: "Tìm thêm, xếp nhóm các từ ngữ cùng một chủ đề: mùa hè, nhà trường, người thân, đồ dùng trong nhà, thiên nhiên…",
    cachLam: [
      "Đọc kĩ tên các nhóm đề cho (VD: người thân bên nội, bên ngoại).",
      "Với từng từ, hỏi: từ này nói về điều gì, hợp với nhóm nào?",
      "Tìm thêm từ bằng cách nghĩ đến những gì em thấy, em làm trong chủ đề đó.",
      "Đặt câu với từ tìm được để chắc là em hiểu nghĩa.",
    ],
    viDu: {
      de: "Xếp các từ sau vào hai nhóm người thân bên nội, bên ngoại:",
      cau: "ông nội, bà ngoại, cô, dì, chú, cậu.",
      dapAn: "Bên nội: “ông nội”, “cô”, “chú”. Bên ngoại: “bà ngoại”, “dì”, “cậu”.",
    },
    loi: "Xếp một từ vào hai nhóm, hoặc tìm từ lạc chủ đề.",
  }),
  S({
    id: "giong-nghia", loai: "ltvc", ten: "Từ có nghĩa giống nhau",
    laGi: "Từ có nghĩa giống nhau là những từ nói cùng một ý, có thể thay cho nhau trong câu (to – lớn, chăm chỉ – siêng năng).",
    cachLam: [
      "Đọc từ đề cho, nghĩ xem từ đó nói về điều gì.",
      "Tìm từ khác nói cùng điều đó.",
      "Thay thử từ mới vào câu: câu vẫn đúng nghĩa và nghe tự nhiên là được.",
    ],
    viDu: {
      de: "Tìm từ có nghĩa giống với từ in đậm:",
      cau: "Bạn Hà rất chăm chỉ.",
      dapAn: "Từ “chăm chỉ” có thể thay bằng: siêng năng, chịu khó.",
    },
    loi: "Chọn từ gần chủ đề nhưng khác nghĩa (chăm chỉ – thông minh).",
  }),
  S({
    id: "trai-nghia", loai: "ltvc", ten: "Từ có nghĩa trái ngược nhau",
    laGi: "Từ có nghĩa trái ngược nhau nói về hai điều đối lập (cao – thấp, sáng – tối, vui – buồn).",
    cachLam: [
      "Đọc từ đề cho, xem nó nói về đặc điểm hay hoạt động gì.",
      "Nghĩ điều ngược lại của đặc điểm, hoạt động đó.",
      "Ghép thành cặp và đặt câu có cả hai từ để kiểm tra.",
    ],
    viDu: {
      de: "Tìm cặp từ có nghĩa trái ngược nhau:",
      cau: "Con voi to lớn đứng cạnh chú chuột nhỏ bé.",
      dapAn: "“to lớn” – “nhỏ bé”.",
    },
    loi: "Ghép hai từ chỉ khác nhau chứ không đối lập (to – đỏ).",
  }),
  S({
    id: "kieu-cau", loai: "ltvc", ten: "Câu kể, câu hỏi, câu cảm, câu khiến",
    laGi: "Câu kể dùng để kể, giới thiệu, nêu hoạt động (cuối câu có dấu chấm). Câu hỏi dùng để hỏi (dấu chấm hỏi). Câu cảm bộc lộ cảm xúc (dấu chấm than, thường có ôi, quá, thật). Câu khiến dùng để đề nghị, yêu cầu (thường có hãy, đừng, nhé, nào, dấu chấm than hoặc dấu chấm).",
    cachLam: [
      "Đọc câu và hỏi: câu này dùng để làm gì (kể, hỏi, bộc lộ cảm xúc hay đề nghị)?",
      "Nhìn từ đặc biệt trong câu: ai, gì, sao, không… (câu hỏi); ôi, quá, thật (câu cảm); hãy, đừng, chớ, nhé, nào (câu khiến).",
      "Nhìn dấu cuối câu để kiểm tra lại.",
      "Khi chuyển câu: thêm hoặc bỏ các từ đặc biệt và đổi dấu cuối câu.",
    ],
    viDu: {
      de: "Mỗi câu sau thuộc kiểu câu gì?",
      cau: "Hoa nở đẹp quá! Em hãy tưới cây nhé.",
      dapAn: "“Hoa nở đẹp quá!” là câu cảm. “Em hãy tưới cây nhé.” là câu khiến.",
    },
    loi: "Chỉ nhìn dấu chấm than mà xếp câu khiến vào câu cảm.",
  }),
  S({
    id: "so-sanh", loai: "ltvc", ten: "Biện pháp so sánh",
    laGi: "So sánh là đặt hai sự vật có nét giống nhau cạnh nhau để câu văn sinh động hơn, thường nối bằng như, là, tựa, giống như.",
    cachLam: [
      "Tìm từ so sánh: như, là, tựa, giống như, như là…",
      "Sự vật đứng trước từ so sánh là sự vật được so sánh; sự vật đứng sau là sự vật dùng để so sánh.",
      "Nêu nét giống nhau giữa hai sự vật (màu sắc, hình dáng, âm thanh…).",
      "Khi đặt câu so sánh, chọn hai sự vật thật sự có nét giống nhau.",
    ],
    viDu: {
      de: "Tìm hình ảnh so sánh:",
      cau: "Mặt trăng tròn như cái đĩa bạc.",
      dapAn: "“Mặt trăng” được so sánh với “cái đĩa bạc”, từ so sánh “như”, giống nhau ở chỗ “tròn”.",
    },
    loi: "Đặt câu so sánh hai sự vật không có nét giống (VD: “Con mèo như cái bàn”).",
  }),
  S({
    id: "dau-hai-cham", loai: "ltvc", ten: "Dấu hai chấm",
    laGi: "Dấu hai chấm dùng để báo hiệu phần liệt kê, phần giải thích, hoặc lời nói của nhân vật phía sau.",
    cachLam: [
      "Tìm dấu hai chấm trong câu.",
      "Đọc phần đứng sau dấu hai chấm: là một danh sách → báo hiệu liệt kê; nói rõ ý phía trước → giải thích; là lời nhân vật → báo hiệu lời nói.",
      "Khi chọn dấu: trước một danh sách hay lời giải thích thì dùng dấu hai chấm, hết câu thì dùng dấu chấm.",
    ],
    viDu: {
      de: "Dấu hai chấm trong câu sau dùng để làm gì?",
      cau: "Vườn nhà em có nhiều loại quả: cam, bưởi, xoài.",
      dapAn: "Báo hiệu phần liệt kê các loại quả: “cam, bưởi, xoài”.",
    },
    loi: "Viết hoa chữ đầu phần liệt kê sau dấu hai chấm.",
  }),
  S({
    id: "gach-ngang-ngoac-kep", loai: "ltvc", ten: "Dấu gạch ngang, dấu ngoặc kép, lời đối thoại",
    laGi: "Dấu gạch ngang đặt đầu dòng đánh dấu lời đối thoại của nhân vật. Dấu ngoặc kép đánh dấu lời nói được dẫn lại, hoặc tên bài, tên sách, từ ngữ cần chú ý.",
    cachLam: [
      "Tìm lời của nhân vật trong đoạn văn.",
      "Lời đối thoại xuống dòng, đứng sau dấu hai chấm → đặt dấu gạch ngang đầu dòng.",
      "Lời nói nằm ngay trong câu kể, hoặc tên bài, tên truyện → đặt trong dấu ngoặc kép.",
    ],
    viDu: {
      de: "Dấu ngoặc kép trong câu sau dùng để làm gì?",
      cau: "Em vừa đọc xong truyện “Cóc kiện Trời”.",
      dapAn: "Đánh dấu tên truyện “Cóc kiện Trời”.",
    },
    loi: "Dùng dấu ngoặc kép cho lời đối thoại đã xuống dòng (chỗ đó cần dấu gạch ngang).",
  }),
  S({
    id: "hoi-dap", loai: "ltvc", ten: "Đặt và trả lời câu hỏi Khi nào? Ở đâu? Bằng gì? Để làm gì?",
    laGi: "Mỗi câu hỏi hỏi về một điều: Khi nào? (thời gian), Ở đâu? (nơi chốn), Bằng gì? (phương tiện, cách thức, chất liệu), Để làm gì? (mục đích).",
    cachLam: [
      "Đọc câu hoặc nhìn tranh, xác định điều cần hỏi: thời gian, nơi chốn, phương tiện hay mục đích.",
      "Đặt câu hỏi có từ hỏi tương ứng, cuối câu có dấu chấm hỏi.",
      "Trả lời bằng một câu đủ ý, có bộ phận trả lời đúng câu hỏi.",
    ],
    viDu: {
      de: "Bộ phận nào trả lời câu hỏi Bằng gì?",
      cau: "Chú thợ làm chiếc ghế bằng gỗ.",
      dapAn: "“bằng gỗ”.",
    },
    loi: "Trả lời lạc câu hỏi (hỏi Ở đâu? mà trả lời thời gian).",
  }),

  /* ───────────── Viết ───────────── */
  S({
    id: "chinh-ta", loai: "viet", ten: "Nghe – viết, Nhớ – viết và bài tập chính tả",
    laGi: "Nghe – viết: nghe đọc rồi viết lại. Nhớ – viết: viết lại đoạn thơ, đoạn văn đã thuộc. Sau đó làm bài tập phân biệt chữ dễ lẫn (c/k, g/gh, ng/ngh, ch/tr, s/x, l/n, r/d/gi, vần…).",
    cachLam: [
      "Đọc trước đoạn viết, để ý tên riêng, chữ khó, dấu câu.",
      "Nghe trọn một cụm từ rồi mới viết, không viết từng tiếng một.",
      "Viết hoa chữ đầu câu, chữ đầu dòng thơ và tên riêng.",
      "Viết xong, đọc lại, soát lỗi và sửa.",
      "Bài tập chính tả: nhớ quy tắc k, gh, ngh đứng trước e, ê, i; các cặp khác thì đọc to và nghĩ nghĩa của từ.",
    ],
    viDu: {
      de: "Điền c hoặc k: …on cá, cái …ính, …ái kéo.",
      dapAn: "con cá, cái kính, cái kéo (k đứng trước i, e).",
    },
    loi: "Quên viết hoa chữ đầu dòng thơ; viết “ghà” thay cho “gà”.",
  }),
  S({
    id: "chu-hoa", loai: "viet", ten: "Ôn chữ viết hoa",
    laGi: "Luyện viết đúng mẫu chữ hoa, viết tên riêng và câu ứng dụng có chữ hoa đó.",
    cachLam: [
      "Quan sát mẫu chữ hoa: độ cao, các nét và điểm đặt bút.",
      "Viết chữ hoa theo đúng thứ tự nét, nối liền với chữ thường phía sau.",
      "Viết tên riêng, câu ứng dụng: chữ đầu câu và tên riêng viết hoa, khoảng cách giữa các chữ bằng một con chữ o.",
    ],
    loi: "Viết chữ hoa thấp bằng chữ thường, hoặc nhấc bút giữa chữ hoa và chữ thường.",
  }),
  S({
    id: "tin-nhan", loai: "viet", ten: "Viết tin nhắn",
    laGi: "Tin nhắn ngắn gọn báo cho người khác biết một việc khi không gặp trực tiếp được.",
    cachLam: [
      "Xác định nhắn cho ai, nhắn việc gì.",
      "Viết lời xưng hô phù hợp (Mẹ ơi, Bạn Lan ơi…).",
      "Nêu việc cần báo ngắn gọn, đủ ý: việc gì, ở đâu, lúc nào.",
      "Cuối tin nhắn ghi tên mình.",
    ],
    viDu: {
      de: "Em đi sang nhà bà, nhắn cho mẹ biết.",
      dapAn: "Mẹ ơi, con sang nhà bà chơi, 5 giờ chiều con về ạ. Con: Minh.",
    },
    loi: "Quên ghi tên người nhắn hoặc thời gian.",
  }),
  S({
    id: "ke-viec", loai: "viet", ten: "Kể lại một hoạt động, một việc làm",
    laGi: "Viết đoạn văn ngắn (3–5 câu) kể lại một hoạt động em đã làm hoặc thấy trong tranh, theo thứ tự trước – sau.",
    cachLam: [
      "Câu mở đầu: hoạt động gì, diễn ra khi nào, ở đâu, có những ai.",
      "Các câu tiếp theo: kể lần lượt việc làm trước, việc làm sau (dùng: đầu tiên, sau đó, cuối cùng).",
      "Câu kết: cảm nghĩ của em về hoạt động đó.",
    ],
    viDu: {
      de: "Kể lại một việc em làm cùng bố.",
      dapAn: "Sáng Chủ nhật, em cùng bố trồng cây trước nhà. Đầu tiên, bố đào hố, em đặt cây con xuống. Sau đó, hai bố con lấp đất và tưới nước. Em rất vui vì đã trồng được một cây xanh.",
    },
    loi: "Kể lộn xộn, việc sau trước việc trước; thiếu câu nêu cảm nghĩ.",
  }),
  S({
    id: "cac-buoc", loai: "viet", ten: "Viết các bước làm một việc",
    laGi: "Viết lại cách làm một việc (nấu món ăn, làm đồ chơi…) theo từng bước, để người đọc làm theo được.",
    cachLam: [
      "Nêu việc cần làm và đồ dùng, nguyên liệu cần chuẩn bị.",
      "Viết các bước theo đúng thứ tự, mỗi bước một câu (Bước 1, Bước 2… hoặc đầu tiên, tiếp theo, cuối cùng).",
      "Mỗi câu bắt đầu bằng từ chỉ hoạt động (rửa, cắt, trộn…).",
    ],
    viDu: {
      de: "Viết các bước pha nước chanh.",
      dapAn: "Đầu tiên, vắt chanh vào cốc. Tiếp theo, cho đường và nước, khuấy đều. Cuối cùng, thả thêm vài viên đá.",
    },
    loi: "Bỏ sót bước hoặc đảo thứ tự các bước.",
  }),
  S({
    id: "cam-xuc-nguoi", loai: "viet", ten: "Đoạn văn nêu tình cảm, cảm xúc về một người",
    laGi: "Viết đoạn văn nói em yêu quý ai (bạn, người thân, thầy cô) và vì sao, qua những việc làm cụ thể.",
    cachLam: [
      "Câu mở đầu: giới thiệu người em muốn viết về.",
      "Kể một hai việc làm, cử chỉ của người đó làm em nhớ.",
      "Nêu tình cảm, cảm xúc của em (yêu quý, biết ơn, nhớ…) và vì sao.",
      "Câu kết: mong muốn hoặc việc em sẽ làm cho người đó.",
    ],
    viDu: {
      de: "Viết đoạn văn nêu tình cảm của em với bà.",
      dapAn: "Người em yêu quý nhất là bà nội. Tối nào bà cũng kể chuyện cổ tích cho em nghe. Khi em ốm, bà ngồi cạnh quạt cho em ngủ. Em thương bà lắm. Em sẽ chăm ngoan để bà luôn vui.",
    },
    loi: "Chỉ tả hình dáng mà không nói được tình cảm của mình.",
  }),
  S({
    id: "cam-xuc-canh", loai: "viet", ten: "Đoạn văn nêu tình cảm, cảm xúc về cảnh vật",
    laGi: "Viết đoạn văn nói em thích một cảnh vật (cảnh quê hương, cảnh đẹp đất nước, cảnh trong tranh) và cảm xúc của em về cảnh đó.",
    cachLam: [
      "Câu mở đầu: giới thiệu cảnh vật em yêu thích.",
      "Nêu vài nét đẹp nổi bật của cảnh (màu sắc, âm thanh, hình ảnh), có thể dùng so sánh.",
      "Nói cảm xúc của em khi ngắm cảnh đó và vì sao.",
      "Câu kết: tình cảm, mong muốn của em với cảnh vật.",
    ],
    viDu: {
      de: "Viết về cánh đồng lúa quê em.",
      dapAn: "Em rất thích cánh đồng lúa quê em. Mùa lúa chín, cả cánh đồng vàng óng như tấm thảm khổng lồ. Gió thổi, sóng lúa rì rào. Đứng giữa cánh đồng, em thấy lòng thật dễ chịu. Em mong quê em mãi đẹp như thế.",
    },
    loi: "Liệt kê cảnh vật mà không nói cảm xúc của mình.",
  }),
  S({
    id: "don", loai: "viet", ten: "Viết đơn",
    laGi: "Đơn là giấy viết theo mẫu để đề nghị một việc (VD: đơn xin vào Đội).",
    cachLam: [
      "Viết đúng phần đầu: Quốc hiệu, tiêu ngữ, nơi và ngày viết đơn, tên đơn.",
      "Ghi người nhận đơn (Kính gửi…).",
      "Giới thiệu bản thân: họ tên, ngày sinh, lớp, trường.",
      "Nêu điều đề nghị và lời hứa.",
      "Cuối đơn: người làm đơn kí và ghi rõ họ tên.",
    ],
    loi: "Quên ngày tháng hoặc chữ kí; điền thông tin không đúng ô.",
  }),
  S({
    id: "gioi-thieu", loai: "viet", ten: "Đoạn văn giới thiệu bản thân",
    laGi: "Viết vài câu cho người khác biết về em: tên, tuổi, lớp, sở thích, ước mơ.",
    cachLam: [
      "Câu đầu: lời chào và tên em.",
      "Nêu tuổi, lớp, trường.",
      "Nêu sở thích, điều em giỏi hoặc ước mơ.",
      "Câu cuối: mong muốn làm quen, kết bạn.",
    ],
    viDu: {
      de: "Viết đoạn văn giới thiệu bản thân.",
      dapAn: "Xin chào các bạn! Mình tên là Lan, học lớp 3A Trường Tiểu học Hoa Sen. Mình thích vẽ và đọc truyện. Ước mơ của mình là trở thành họa sĩ. Rất vui được làm quen với các bạn!",
    },
    loi: "Viết thành danh sách rời rạc thay vì các câu nối với nhau.",
  }),
  S({
    id: "thong-bao", loai: "viet", ten: "Viết thông báo",
    laGi: "Thông báo cho nhiều người biết một việc sắp diễn ra.",
    cachLam: [
      "Đầu thông báo: tên tập thể thông báo và tên thông báo (VD: THÔNG BÁO).",
      "Nêu việc gì, thời gian, địa điểm, ai tham gia.",
      "Nêu điều cần làm (đăng kí với ai, trước ngày nào).",
      "Cuối: người viết thông báo.",
    ],
    loi: "Thiếu thời gian hoặc địa điểm, người đọc không biết đến lúc nào, ở đâu.",
  }),
  S({
    id: "ta-do-vat", loai: "viet", ten: "Đoạn văn tả đồ vật, ngôi nhà",
    laGi: "Viết đoạn văn tả một đồ vật hoặc ngôi nhà: hình dáng, màu sắc, các bộ phận, công dụng và tình cảm của em.",
    cachLam: [
      "Quan sát kĩ bằng mắt, tay, tai (to nhỏ, màu sắc, chất liệu, âm thanh).",
      "Câu mở đầu: giới thiệu đồ vật (ngôi nhà) em tả.",
      "Tả các đặc điểm nổi bật, từ bao quát đến từng bộ phận, dùng từ chỉ đặc điểm và so sánh.",
      "Nêu công dụng và tình cảm của em với đồ vật (ngôi nhà).",
    ],
    viDu: {
      de: "Tả chiếc cặp sách của em.",
      dapAn: "Chiếc cặp sách của em do mẹ mua hồi đầu năm. Cặp màu xanh nước biển, hình chữ nhật. Bên trong có ba ngăn đựng sách vở và bút thước. Hai quai đeo êm, đeo lên vai rất nhẹ. Em giữ gìn chiếc cặp cẩn thận như một người bạn.",
    },
    loi: "Kể chuyện về đồ vật mà quên tả đặc điểm của nó.",
  }),
  S({
    id: "ta-tranh", loai: "viet", ten: "Đoạn văn tả bức tranh",
    laGi: "Viết đoạn văn tả những gì có trong một bức tranh: cảnh vật, màu sắc, hoạt động và ý nghĩa của bức tranh.",
    cachLam: [
      "Câu mở đầu: bức tranh vẽ gì.",
      "Tả lần lượt từ chỗ chính đến các chi tiết xung quanh (giữa, trên, dưới, hai bên).",
      "Nêu màu sắc, hình ảnh nổi bật.",
      "Câu kết: bức tranh muốn nói điều gì, em cảm thấy thế nào.",
    ],
    loi: "Tả lộn xộn, không theo thứ tự vị trí trong tranh.",
  }),
  S({
    id: "nhan-vat", loai: "viet", ten: "Đoạn văn về một nhân vật trong câu chuyện",
    laGi: "Viết đoạn văn nói em thích (hoặc không thích) một nhân vật trong câu chuyện đã đọc, đã nghe, và nêu lí do.",
    cachLam: [
      "Câu mở đầu: tên nhân vật và tên câu chuyện (đặt trong dấu ngoặc kép).",
      "Kể ngắn việc làm, lời nói của nhân vật mà em nhớ nhất.",
      "Nêu lí do em thích hoặc không thích nhân vật (dùng: vì, bởi vì).",
      "Câu kết: điều em học được từ nhân vật.",
    ],
    viDu: {
      de: "Viết về một nhân vật em thích.",
      dapAn: "Em rất thích chú Cóc trong truyện “Cóc kiện Trời”. Tuy nhỏ bé, Cóc vẫn dũng cảm lên thiên đình đòi mưa cho muôn loài. Em thích Cóc vì chú biết đoàn kết với bạn bè và không sợ khó khăn. Em sẽ học tập sự dũng cảm của Cóc.",
    },
    loi: "Kể lại cả câu chuyện mà không nói lí do mình thích.",
  }),
  S({
    id: "uoc-mo", loai: "viet", ten: "Đoạn văn về ước mơ",
    laGi: "Viết đoạn văn kể ước mơ của em: em mơ làm gì, vì sao và em sẽ làm gì để đạt được.",
    cachLam: [
      "Câu mở đầu: ước mơ của em là gì.",
      "Vì sao em có ước mơ đó (ai, điều gì làm em thích).",
      "Em sẽ cố gắng làm gì từ bây giờ để đạt ước mơ.",
    ],
    viDu: {
      de: "Viết về ước mơ của em.",
      dapAn: "Ước mơ của em là trở thành bác sĩ. Em muốn chữa bệnh cho mọi người giống như cô bác sĩ đã chữa cho em khi em ốm. Từ bây giờ, em sẽ học thật giỏi và rèn luyện sức khỏe.",
    },
    loi: "Chỉ nêu ước mơ mà không nói lí do và việc cần làm.",
  }),
  S({
    id: "thu", loai: "viet", ten: "Viết thư, thư điện tử",
    laGi: "Viết thư để hỏi thăm, kể chuyện với người ở xa. Thư điện tử gửi qua máy tính, điện thoại.",
    cachLam: [
      "Đầu thư: nơi viết, ngày tháng (thư điện tử: địa chỉ người nhận, tiêu đề).",
      "Lời xưng hô với người nhận (Bà kính yêu!, Hoa thân mến!).",
      "Nội dung: hỏi thăm sức khỏe, kể tin của em, tình cảm với người nhận.",
      "Cuối thư: lời chúc, lời hứa, kí tên.",
    ],
    viDu: {
      de: "Viết vài câu hỏi thăm trong thư gửi ông bà.",
      dapAn: "Ông bà dạo này có khỏe không ạ? Vườn rau của bà đã xanh tốt chưa? Cháu nhớ ông bà nhiều lắm.",
    },
    loi: "Quên lời xưng hô ở đầu thư hoặc chữ kí ở cuối thư.",
  }),
  S({
    id: "ban-tin", loai: "viet", ten: "Viết bản tin",
    laGi: "Bản tin ngắn báo cho mọi người biết một sự việc vừa diễn ra.",
    cachLam: [
      "Đặt tiêu đề ngắn, nêu đúng sự việc.",
      "Câu đầu: sự việc gì, diễn ra khi nào, ở đâu, ai tham gia.",
      "Các câu sau: hoạt động chính và kết quả.",
      "Câu cuối: ý nghĩa hoặc lời kêu gọi.",
    ],
    viDu: {
      de: "Viết bản tin về buổi tổng vệ sinh của lớp.",
      dapAn: "LỚP 3A TỔNG VỆ SINH SÂN TRƯỜNG. Sáng thứ Bảy, học sinh lớp 3A đã tham gia tổng vệ sinh sân trường. Các bạn nhặt rác, quét lá và tưới cây. Sân trường trở nên sạch đẹp hơn.",
    },
    loi: "Thiếu thời gian, địa điểm của sự việc.",
  }),
];

export const TV_GUIDE_3: TvGuide = {
  grade: 3,
  book: "Tiếng Việt 3 – Kết nối tri thức với cuộc sống",
  source: "Mục lục và yêu cầu bài tập tập 1, tập 2 đối chiếu trên loigiaihay.com (10/2026)",
  ltvcBai: "chan",
  chuDiem: [
    { so: 1, ten: "Những trải nghiệm thú vị", tap: 1, tu: 1, den: 8, docHieu: "Các bài đọc kể về mùa hè, những lần đầu được thử điều mới. Chú ý nhân vật đã làm gì, ở đâu và cảm thấy thế nào." },
    { so: 2, ten: "Cổng trường rộng mở", tap: 1, tu: 9, den: 16, docHieu: "Các bài đọc nói về trường lớp, thầy cô, bạn bè. Tìm chi tiết cho thấy tình cảm với trường lớp và điều nhân vật học được." },
    { so: 3, ten: "Mái nhà yêu thương", tap: 1, tu: 17, den: 24, docHieu: "Các bài đọc nói về gia đình, người thân. Tìm việc làm, lời nói thể hiện tình yêu thương giữa các thành viên." },
    { so: 4, ten: "Cộng đồng gắn bó", tap: 1, tu: 25, den: 32, docHieu: "Các bài đọc nói về hàng xóm, những người quanh em. Chú ý việc tốt nhân vật làm cho người khác và ý nghĩa của việc đó." },
    { so: 5, ten: "Những sắc màu thiên nhiên", tap: 2, tu: 1, den: 8, docHieu: "Các bài đọc tả bầu trời, mưa, cây cối, con vật. Tìm từ ngữ chỉ màu sắc, âm thanh, hình ảnh so sánh đẹp." },
    { so: 6, ten: "Bài học từ cuộc sống", tap: 2, tu: 9, den: 16, docHieu: "Các bài đọc là những câu chuyện có bài học. Trả lời được: nhân vật làm gì, kết quả ra sao, câu chuyện khuyên em điều gì." },
    { so: 7, ten: "Đất nước ngàn năm", tap: 2, tu: 17, den: 24, docHieu: "Các bài đọc nói về cảnh đẹp, lịch sử, con người Việt Nam. Ghi nhớ địa danh, nhân vật, sự việc chính và tình cảm của tác giả." },
    { so: 8, ten: "Trái Đất của chúng mình", tap: 2, tu: 25, den: 30, docHieu: "Các bài đọc nói về môi trường, khoa học, các nước trên thế giới. Tìm thông tin chính và việc em có thể làm để bảo vệ Trái Đất." },
  ],
  bai: [
    // Tập 1
    { tap: 1, so: 1, doc: "Ngày gặp lại", viet: { ten: "Nghe - viết: Em yêu mùa hè", ky: "chinh-ta" }, them: "Nói và nghe: Mùa hè của em" },
    { tap: 1, so: 2, doc: "Về thăm quê", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động; câu giới thiệu, câu nêu hoạt động", ky: ["su-vat-hoat-dong", "kieu-cau"] }, viet: { ten: "Viết tin nhắn", ky: "tin-nhan" }, them: "Ôn chữ viết hoa A, Ă, Â" },
    { tap: 1, so: 3, doc: "Cánh rừng trong nắng", viet: { ten: "Nghe - viết: Cánh rừng trong nắng", ky: "chinh-ta" }, them: "Kể chuyện Sự tích loài hoa của mùa hạ" },
    { tap: 1, so: 4, doc: "Lần đầu ra biển", ltvc: { ten: "Từ ngữ chỉ đặc điểm", ky: "dac-diem" }, viet: { ten: "Kể lại một hoạt động cùng người thân", ky: "ke-viec" }, them: "Đọc mở rộng" },
    { tap: 1, so: 5, doc: "Nhật kí tập bơi", viet: { ten: "Nghe - viết: Mặt trời nhỏ", ky: "chinh-ta" }, them: "Nói và nghe: Một buổi tập luyện" },
    { tap: 1, so: 6, doc: "Tập nấu ăn", ltvc: { ten: "Từ ngữ chỉ hoạt động; câu nêu hoạt động", ky: "su-vat-hoat-dong" }, viet: { ten: "Viết các bước làm một việc", ky: "cac-buoc" }, them: "Ôn chữ viết hoa B, C" },
    { tap: 1, so: 7, doc: "Mùa hè lấp lánh", viet: { ten: "Nghe - viết: Mùa hè lấp lánh", ky: "chinh-ta" }, them: "Kể chuyện Chó đốm con và mặt trời" },
    { tap: 1, so: 8, doc: "Tạm biệt mùa hè", ltvc: { ten: "Từ ngữ về mùa hè; dấu hai chấm", ky: ["von-tu", "dau-hai-cham"] }, viet: { ten: "Viết câu thể hiện tình cảm, cảm xúc với bạn", ky: "cam-xuc-nguoi" }, them: "Đọc mở rộng" },
    { tap: 1, so: 9, doc: "Đi học vui sao", viet: { ten: "Nhớ - viết: Đi học vui sao", ky: "chinh-ta" }, them: "Nói và nghe: Tới lớp, tới trường" },
    { tap: 1, so: 10, doc: "Con đường đến trường", ltvc: { ten: "Từ ngữ chỉ đặc điểm", ky: "dac-diem" }, viet: { ten: "Viết đoạn văn nêu tình cảm, cảm xúc với người em yêu quý", ky: "cam-xuc-nguoi" }, them: "Ôn chữ viết hoa D, Đ" },
    { tap: 1, so: 11, doc: "Lời giải toán đặc biệt", viet: { ten: "Nghe - viết: Lời giải toán đặc biệt", ky: "chinh-ta" }, them: "Kể chuyện Đội viên tương lai" },
    { tap: 1, so: 12, doc: "Bài tập làm văn", ltvc: { ten: "Từ ngữ về nhà trường", ky: "von-tu" }, viet: { ten: "Điền thông tin vào đơn xin vào Đội", ky: "don" }, them: "Đọc mở rộng" },
    { tap: 1, so: 13, doc: "Bàn tay cô giáo", viet: { ten: "Nghe - viết: Nghe thầy đọc thơ", ky: "chinh-ta" }, them: "Nói và nghe: Một giờ học thú vị" },
    { tap: 1, so: 14, doc: "Cuộc họp của chữ viết", ltvc: { ten: "Câu kể; dấu chấm, dấu chấm hỏi, dấu chấm than", ky: "kieu-cau" }, viet: { ten: "Viết đoạn văn giới thiệu bản thân", ky: "gioi-thieu" }, them: "Ôn chữ viết hoa E, Ê" },
    { tap: 1, so: 15, doc: "Thư viện", viet: { ten: "Nghe - viết: Thư viện", ky: "chinh-ta" }, them: "Kể chuyện Mặt trời mọc ở đằng... tây!" },
    { tap: 1, so: 16, doc: "Ngày em vào Đội", ltvc: { ten: "Câu cảm", ky: "kieu-cau" }, viet: { ten: "Viết thông báo", ky: "thong-bao" }, them: "Đọc mở rộng" },
    { tap: 1, so: 17, doc: "Ngưỡng cửa", viet: { ten: "Nghe - viết: Đồ đạc trong nhà", ky: "chinh-ta" }, them: "Kể chuyện Sự tích nhà sàn" },
    { tap: 1, so: 18, doc: "Món quà đặc biệt", ltvc: { ten: "Từ ngữ chỉ đặc điểm; câu khiến", ky: ["dac-diem", "kieu-cau"] }, viet: { ten: "Viết câu tả đồ vật", ky: "ta-do-vat" }, them: "Ôn viết chữ hoa G, H" },
    { tap: 1, so: 19, doc: "Khi cả nhà bé tí", viet: { ten: "Nghe - viết: Khi cả nhà bé tí", ky: "chinh-ta" }, them: "Nói và nghe: Những người yêu thương" },
    { tap: 1, so: 20, doc: "Trò chuyện cùng mẹ", ltvc: { ten: "Từ ngữ chỉ người thân; dấu hai chấm", ky: ["von-tu", "dau-hai-cham"] }, viet: { ten: "Viết đoạn văn tả ngôi nhà", ky: "ta-do-vat" }, them: "Đọc mở rộng" },
    { tap: 1, so: 21, doc: "Tia nắng bé nhỏ", viet: { ten: "Nghe - viết: Kho sách của ông bà", ky: "chinh-ta" }, them: "Kể chuyện Tia nắng bé nhỏ" },
    { tap: 1, so: 22, doc: "Để cháu nắm tay ông", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động, đặc điểm; câu kể", ky: ["su-vat-hoat-dong", "kieu-cau"] }, viet: { ten: "Viết đoạn văn thể hiện tình cảm với người thân", ky: "cam-xuc-nguoi" }, them: "Ôn chữ viết hoa I, K" },
    { tap: 1, so: 23, doc: "Tôi yêu em tôi", viet: { ten: "Nghe - viết: Tôi yêu em tôi", ky: "chinh-ta" }, them: "Nói và nghe: Tình cảm anh chị em" },
    { tap: 1, so: 24, doc: "Bạn nhỏ trong nhà", ltvc: { ten: "Từ ngữ về đồ dùng trong nhà; so sánh", ky: ["von-tu", "so-sanh"] }, viet: { ten: "Viết đoạn văn tả đồ vật em yêu thích", ky: "ta-do-vat" }, them: "Đọc mở rộng" },
    { tap: 1, so: 25, doc: "Những bậc đá chạm mây", viet: { ten: "Nghe - viết: Những bậc đá chạm mây", ky: "chinh-ta" }, them: "Kể chuyện Những bậc đá chạm mây" },
    { tap: 1, so: 26, doc: "Đi tìm mặt trời", ltvc: { ten: "Từ có nghĩa trái ngược nhau; câu khiến", ky: ["trai-nghia", "kieu-cau"] }, viet: { ten: "Viết câu nêu lí do thích hoặc không thích một nhân vật", ky: "nhan-vat" }, them: "Ôn chữ viết hoa L" },
    { tap: 1, so: 27, doc: "Những chiếc áo ấm", viet: { ten: "Nghe - viết: Trong vườn", ky: "chinh-ta" }, them: "Nói và nghe: Thêm sức thêm tài" },
    { tap: 1, so: 28, doc: "Con đường của bé", ltvc: { ten: "Từ ngữ theo chủ điểm; câu hỏi", ky: ["von-tu", "kieu-cau"] }, viet: { ten: "Viết đoạn văn về một nhân vật trong câu chuyện", ky: "nhan-vat" }, them: "Đọc mở rộng" },
    { tap: 1, so: 29, doc: "Ngôi nhà trong cỏ", viet: { ten: "Nghe - viết: Gió", ky: "chinh-ta" }, them: "Kể chuyện Hàng xóm của tắc kè" },
    { tap: 1, so: 30, doc: "Những ngọn hải đăng", ltvc: { ten: "Từ ngữ chỉ sự vật, hoạt động", ky: "su-vat-hoat-dong" }, viet: { ten: "Viết câu hỏi thăm trong thư", ky: "thu" }, them: "Ôn viết chữ hoa M, N" },
    { tap: 1, so: 31, doc: "Người làm đồ chơi", viet: { ten: "Nghe - viết: Người làm đồ chơi", ky: "chinh-ta" }, them: "Kể chuyện Người làm đồ chơi" },
    { tap: 1, so: 32, doc: "Cây bút thần", ltvc: { ten: "Từ ngữ chỉ sự vật, đặc điểm; so sánh âm thanh", ky: ["dac-diem", "so-sanh"] }, viet: { ten: "Viết thư cho bạn hoặc người thân", ky: "thu" }, them: "Đọc mở rộng" },
    // Tập 2
    { tap: 2, so: 1, doc: "Bầu trời", viet: { ten: "Nghe - viết: Buổi sáng", ky: "chinh-ta" }, them: "Nói và nghe: Bầu trời trong mắt em" },
    { tap: 2, so: 2, doc: "Mưa", ltvc: { ten: "Mở rộng vốn từ về các hiện tượng tự nhiên", ky: ["von-tu", "kieu-cau"] }, viet: { ten: "Ôn chữ viết hoa O, Ô, Ơ", ky: "chu-hoa" } },
    { tap: 2, so: 3, doc: "Cóc kiện Trời", viet: { ten: "Nghe - viết: Trăng trên biển", ky: "chinh-ta" }, them: "Kể chuyện Cóc kiện Trời" },
    { tap: 2, so: 4, doc: "Những cái tên đáng yêu", ltvc: { ten: "Từ có nghĩa giống nhau; câu hỏi Khi nào?", ky: ["giong-nghia", "hoi-dap"] }, viet: { ten: "Viết đoạn văn kể lại hoạt động trong tranh", ky: "ke-viec" }, them: "Đọc mở rộng" },
    { tap: 2, so: 5, doc: "Ngày hội rừng xanh", viet: { ten: "Nghe - viết: Chim chích bông", ky: "chinh-ta" }, them: "Nói và nghe: Rừng" },
    { tap: 2, so: 6, doc: "Cây gạo", ltvc: { ten: "So sánh; câu hỏi Ở đâu?", ky: ["so-sanh", "hoi-dap"] }, viet: { ten: "Viết tình cảm, cảm xúc về cảnh vật", ky: "cam-xuc-canh" }, them: "Ôn chữ viết hoa P, Q" },
    { tap: 2, so: 7, doc: "Mặt trời xanh của tôi", viet: { ten: "Nhớ - viết: Mặt trời xanh của tôi", ky: "chinh-ta" }, them: "Kể chuyện Sự tích hoa mào gà" },
    { tap: 2, so: 8, doc: "Bầy voi rừng Trường Sơn", ltvc: { ten: "Từ ngữ theo chủ điểm; câu hỏi Ở đâu?, Khi nào?", ky: ["von-tu", "hoi-dap"] }, viet: { ten: "Viết đoạn văn nêu tình cảm, cảm xúc về cảnh vật", ky: "cam-xuc-canh" }, them: "Đọc mở rộng" },
    { tap: 2, so: 9, doc: "Lời kêu gọi toàn dân tập thể dục", viet: { ten: "Nghe - viết: Lời kêu gọi toàn dân tập thể dục", ky: "chinh-ta" }, them: "Nói và nghe: Học từ bạn" },
    { tap: 2, so: 10, doc: "Quả hồng của thỏ con", ltvc: { ten: "Từ có nghĩa giống nhau; dấu câu đánh dấu lời nói", ky: ["giong-nghia", "gach-ngang-ngoac-kep"] }, viet: { ten: "Viết đoạn văn nêu lí do thích hoặc không thích một nhân vật", ky: "nhan-vat" }, them: "Ôn chữ viết hoa R, S" },
    { tap: 2, so: 11, doc: "Chuyện bên cửa sổ", viet: { ten: "Nghe - viết: Chuyện bên cửa sổ", ky: "chinh-ta" }, them: "Kể chuyện Cậu bé đánh giày" },
    { tap: 2, so: 12, doc: "Tay trái và tay phải", ltvc: { ten: "Dấu câu đánh dấu lời đối thoại; câu hỏi Bằng gì?", ky: ["gach-ngang-ngoac-kep", "hoi-dap"] }, viet: { ten: "Viết đoạn văn nêu lí do thích hoặc không thích một nhân vật", ky: "nhan-vat" }, them: "Đọc mở rộng" },
    { tap: 2, so: 13, doc: "Mèo đi câu cá", viet: { ten: "Nghe - viết: Bài học của gấu", ky: "chinh-ta" }, them: "Nói và nghe: Cùng vui làm việc" },
    { tap: 2, so: 14, doc: "Học nghề", ltvc: { ten: "Dấu gạch ngang; lời đối thoại", ky: "gach-ngang-ngoac-kep" }, viet: { ten: "Viết đoạn văn về ước mơ", ky: "uoc-mo" }, them: "Ôn chữ viết hoa T, U, Ư" },
    { tap: 2, so: 15, doc: "Ngày như thế nào là đẹp?", viet: { ten: "Nghe - viết: Ngày như thế nào là đẹp?", ky: "chinh-ta" }, them: "Kể chuyện Ngày như thế nào là đẹp?" },
    { tap: 2, so: 16, doc: "A lô, tớ đây", ltvc: { ten: "Từ ngữ chỉ thái độ lịch sự; câu kể, câu hỏi", ky: ["von-tu", "kieu-cau"] }, viet: { ten: "Viết thư điện tử", ky: "thu" }, them: "Đọc mở rộng" },
    { tap: 2, so: 17, doc: "Đất nước là gì?", viet: { ten: "Nghe - viết: Bản em", ky: "chinh-ta" }, them: "Nói và nghe: Cảnh đẹp đất nước" },
    { tap: 2, so: 18, doc: "Núi quê tôi", ltvc: { ten: "Từ có nghĩa giống nhau; so sánh", ky: ["giong-nghia", "so-sanh"] }, viet: { ten: "Viết đoạn văn nêu tình cảm, cảm xúc về cảnh vật quê hương", ky: "cam-xuc-canh" }, them: "Ôn chữ viết hoa V, X" },
    { tap: 2, so: 19, doc: "Sông Hương", viet: { ten: "Nghe - viết: Chợ Hòn gai", ky: "chinh-ta" }, them: "Kể chuyện Sơn Tinh, Thủy Tinh" },
    { tap: 2, so: 20, doc: "Tiếng nước mình", ltvc: { ten: "Câu cảm, câu khiến", ky: "kieu-cau" }, viet: { ten: "Viết đoạn văn nêu tình cảm, cảm xúc về một cảnh đẹp đất nước", ky: "cam-xuc-canh" }, them: "Đọc mở rộng" },
    { tap: 2, so: 21, doc: "Nhà rông", viet: { ten: "Nghe - viết: Nhà rông", ky: "chinh-ta" }, them: "Nói và nghe: Quê hương em" },
    { tap: 2, so: 22, doc: "Sự tích ông Đùng, bà Đùng", ltvc: { ten: "Dấu ngoặc kép, dấu gạch ngang", ky: "gach-ngang-ngoac-kep" }, viet: { ten: "Viết câu nêu lí do yêu thích một nhân vật", ky: "nhan-vat" }, them: "Ôn chữ viết hoa Y" },
    { tap: 2, so: 23, doc: "Hai Bà Trưng", viet: { ten: "Nghe - viết: Hai Bà Trưng", ky: "chinh-ta" }, them: "Kể chuyện Hai Bà Trưng" },
    { tap: 2, so: 24, doc: "Cùng Bác qua suối", ltvc: { ten: "Dấu ngoặc kép, dấu gạch ngang", ky: "gach-ngang-ngoac-kep" }, viet: { ten: "Viết đoạn văn về một nhân vật em yêu thích", ky: "nhan-vat" }, them: "Đọc mở rộng" },
    { tap: 2, so: 25, doc: "Ngọn lửa Ô-lim-pích", viet: { ten: "Nghe - viết: Ngọn lửa Ô-lim-pích", ky: "chinh-ta" }, them: "Kể chuyện Đất quý, đất yêu" },
    { tap: 2, so: 26, doc: "Rô-bốt ở quanh ta", ltvc: { ten: "Dấu hai chấm; câu hỏi Để làm gì?", ky: ["dau-hai-cham", "hoi-dap"] }, viet: { ten: "Viết bản tin", ky: "ban-tin" }, them: "Ôn chữ viết hoa A, Ă, Â, Q (kiểu 2)" },
    { tap: 2, so: 27, doc: "Thư của ông Trái Đất gửi các bạn nhỏ", viet: { ten: "Nghe - viết: Em nghĩ về Trái Đất", ky: "chinh-ta" }, them: "Nói và nghe: Môi trường của chúng ta" },
    { tap: 2, so: 28, doc: "Những điều nhỏ tớ làm cho Trái Đất", ltvc: { ten: "Dấu gạch ngang, dấu ngoặc kép, dấu hai chấm; câu cảm, câu khiến", ky: ["gach-ngang-ngoac-kep", "kieu-cau"] }, viet: { ten: "Viết đoạn văn kể lại một việc làm bảo vệ môi trường", ky: "ke-viec" }, them: "Đọc mở rộng" },
    { tap: 2, so: 29, doc: "Bác sĩ Y-éc-xanh", viet: { ten: "Nghe - viết: Bác sĩ Y-éc-xanh", ky: "chinh-ta" }, them: "Nói và nghe: Người nổi tiếng" },
    { tap: 2, so: 30, doc: "Một mái nhà chung", ltvc: { ten: "Từ ngữ theo chủ điểm; câu cảm, câu khiến", ky: ["von-tu", "kieu-cau"] }, viet: { ten: "Viết đoạn văn tả bức tranh", ky: "ta-tranh" }, them: "Ôn chữ viết hoa M, N, V (kiểu 2)" },
  ],
  skills: Object.fromEntries(SKILLS.map((s) => [s.id, s])),
};
