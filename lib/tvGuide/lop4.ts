// lib/tvGuide/lop4.ts
// Tiếng Việt 4 – Kết nối tri thức: mục lục (nguyên văn) và hướng dẫn cách làm từng dạng bài.
// Hướng dẫn và ví dụ do Ôn Tập Cùng Con TỰ VIẾT, không chép sách. CẦN NGƯỜI DUYỆT nội dung.
// Dùng ngoặc kép cong “ ”. `npx tsx scripts/tv-guide-check.ts` kiểm tra phần máy kiểm được.

import type { TvGuide, TvSkill } from "./types";

const S = (s: TvSkill) => s;

const SKILLS: TvSkill[] = [
  /* ───────────── Luyện từ và câu ───────────── */
  S({
    id: "danh-tu", loai: "ltvc", ten: "Danh từ",
    laGi: "Danh từ là từ chỉ sự vật: người, con vật, đồ vật, cây cối, hiện tượng tự nhiên, thời gian…",
    cachLam: [
      "Đọc kĩ câu, tách từng từ.",
      "Với mỗi từ, hỏi: “Đây là ai? Cái gì? Con gì?” Trả lời được thì đó là danh từ.",
      "Nếu đề bắt xếp nhóm, xếp theo: chỉ người, chỉ vật, chỉ hiện tượng, chỉ thời gian.",
    ],
    viDu: {
      de: "Tìm danh từ trong câu:",
      cau: "Sáng sớm, mặt trời nhô lên sau dãy núi.",
      dapAn: "“Sáng sớm” (thời gian), “mặt trời” (hiện tượng tự nhiên), “dãy núi” (sự vật).",
    },
    loi: "Nhầm từ chỉ hoạt động (“nhô”) hoặc đặc điểm là danh từ.",
  }),
  S({
    id: "danh-tu-chung-rieng", loai: "ltvc", ten: "Danh từ chung, danh từ riêng",
    laGi: "Danh từ chung gọi tên chung một loại sự vật (sông, thành phố). Danh từ riêng là tên riêng của một sự vật cụ thể (sông Hồng, Huế) và luôn viết hoa.",
    cachLam: [
      "Tìm các danh từ trong câu.",
      "Hỏi: từ này gọi chung cả một loại hay là tên riêng của một người, một nơi cụ thể?",
      "Tên riêng thì kiểm tra đã viết hoa đúng chưa.",
    ],
    viDu: {
      de: "Tìm danh từ chung và danh từ riêng:",
      cau: "Bạn Lan sống ở thành phố Huế.",
      dapAn: "Danh từ riêng: “Lan”, “Huế”. Danh từ chung: “Bạn”, “thành phố”.",
    },
    loi: "Quên viết hoa tên người, tên địa danh.",
  }),
  S({
    id: "ten-co-quan", loai: "ltvc", ten: "Viết tên cơ quan, tổ chức",
    laGi: "Tên cơ quan, tổ chức viết hoa chữ cái đầu của mỗi bộ phận tạo thành tên.",
    cachLam: [
      "Chia tên thành các bộ phận (VD: Trường / Tiểu học / Kim Đồng).",
      "Viết hoa chữ cái đầu của tiếng đầu mỗi bộ phận; các tiếng còn lại viết thường, trừ tên riêng.",
    ],
    viDu: {
      de: "Viết lại cho đúng: “trường tiểu học kim đồng”, “bộ giáo dục và đào tạo”.",
      dapAn: "Trường Tiểu học Kim Đồng; Bộ Giáo dục và Đào tạo.",
    },
    loi: "Viết hoa tất cả các chữ (“Trường Tiểu Học”).",
  }),
  S({
    id: "dong-tu", loai: "ltvc", ten: "Động từ",
    laGi: "Động từ là từ chỉ hoạt động (chạy, viết), trạng thái (ngủ, tan) hoặc tình cảm, cảm xúc (yêu, nhớ) của người, vật.",
    cachLam: [
      "Tìm chủ thể trong câu (ai, con gì, cái gì).",
      "Hỏi: chủ thể đó “làm gì?” hoặc “đang ra sao?” Từ trả lời là động từ.",
      "Thử thêm “đang”, “đã”, “sẽ” trước từ đó: nghe hợp thì nhiều khả năng là động từ.",
    ],
    viDu: {
      de: "Tìm động từ trong câu:",
      cau: "Chim hót líu lo, đàn em nhỏ chạy ra sân.",
      dapAn: "“hót”, “chạy”.",
    },
    loi: "Nhầm từ chỉ đặc điểm (“líu lo”, “nhỏ”) là động từ.",
  }),
  S({
    id: "tu-dien", loai: "ltvc", ten: "Cách dùng từ điển",
    laGi: "Từ điển giải thích nghĩa của từ, thường có ví dụ cách dùng. Các từ được xếp theo thứ tự bảng chữ cái.",
    cachLam: [
      "Xác định chữ cái đầu của từ cần tra, mở đến phần chữ cái đó.",
      "Dò tiếp theo các chữ cái sau của từ, đúng thứ tự bảng chữ cái.",
      "Đọc các nghĩa, chọn nghĩa hợp với câu đang đọc.",
    ],
    loi: "Chọn nghĩa đầu tiên mà không đối chiếu với câu.",
  }),
  S({
    id: "nhan-hoa", loai: "ltvc", ten: "Biện pháp nhân hoá",
    laGi: "Nhân hoá là gọi, tả hoặc nói với sự vật bằng những từ ngữ vốn dùng cho người, làm sự vật trở nên gần gũi, sinh động.",
    cachLam: [
      "Tìm sự vật không phải người trong câu (cây, gió, mặt trời…).",
      "Xem sự vật đó có được gọi như người (ông, chị, bác…), tả bằng hoạt động, tính nết của người, hoặc được trò chuyện như người không.",
      "Ghi rõ từ ngữ nhân hoá và cách nhân hoá.",
    ],
    viDu: {
      de: "Tìm từ ngữ nhân hoá:",
      cau: "Ông mặt trời thức dậy, mỉm cười với cánh đồng.",
      dapAn: "Gọi mặt trời là “Ông”; tả bằng hoạt động của người: “thức dậy”, “mỉm cười”.",
    },
    loi: "Nhầm so sánh là nhân hoá: “mặt trời như quả bóng lửa” là so sánh.",
  }),
  S({
    id: "tinh-tu", loai: "ltvc", ten: "Tính từ",
    laGi: "Tính từ là từ chỉ đặc điểm của sự vật, hoạt động, trạng thái: màu sắc, hình dáng, kích thước, tính tình…",
    cachLam: [
      "Tìm sự vật hoặc hoạt động trong câu.",
      "Hỏi: sự vật, hoạt động đó “thế nào?” Từ trả lời là tính từ.",
      "Thử thêm “rất”, “quá”, “lắm”: nghe hợp thì nhiều khả năng là tính từ.",
    ],
    viDu: {
      de: "Tìm tính từ trong câu:",
      cau: "Chú mèo nhỏ có bộ lông trắng muốt.",
      dapAn: "“nhỏ”, “trắng muốt”.",
    },
    loi: "Gạch cả cụm “bộ lông trắng muốt”: “bộ lông” là danh từ.",
  }),
  S({
    id: "gach-ngang", loai: "ltvc", ten: "Dấu gạch ngang",
    laGi: "Dấu gạch ngang dùng để: đánh dấu lời nói của nhân vật; đánh dấu các ý liệt kê; nối các từ ngữ trong một liên danh (tuyến đường Hà Nội – Hải Phòng).",
    cachLam: [
      "Tìm dấu gạch ngang trong đoạn văn.",
      "Đứng đầu dòng, sau là lời nhân vật → đánh dấu lời nói.",
      "Đứng đầu mỗi ý của một danh sách → đánh dấu ý liệt kê.",
      "Đứng giữa hai tên riêng → nối các từ ngữ trong liên danh.",
    ],
    viDu: {
      de: "Dấu gạch ngang trong câu sau dùng để làm gì?",
      cau: "Chuyến tàu Hà Nội – Hải Phòng khởi hành lúc 6 giờ sáng.",
      dapAn: "Nối “Hà Nội” và “Hải Phòng” trong một liên danh (tên tuyến đường).",
    },
    loi: "Viết dấu gạch nối ngắn (-) thay cho dấu gạch ngang (–).",
  }),
  S({
    id: "tu-loai", loai: "ltvc", ten: "Danh từ, động từ, tính từ",
    laGi: "Phân biệt ba từ loại bằng câu hỏi: danh từ trả lời “cái gì, con gì, ai?”, động từ trả lời “làm gì?”, tính từ trả lời “thế nào?”.",
    cachLam: [
      "Gạch dưới từng từ cần xếp loại.",
      "Đặt câu hỏi cho từng từ như trên.",
      "Kiểm tra lại: thêm “đang” (động từ), thêm “rất” (tính từ).",
    ],
    viDu: {
      de: "Xếp các từ in trong câu vào ba nhóm:",
      cau: "Bạn Nam chăm chỉ quét sân.",
      dapAn: "Danh từ: “Bạn Nam”, “sân”. Động từ: “quét”. Tính từ: “chăm chỉ”.",
    },
  }),
  S({
    id: "cau", loai: "ltvc", ten: "Câu",
    laGi: "Câu diễn đạt một ý trọn vẹn. Đầu câu viết hoa, cuối câu có dấu chấm, dấu chấm hỏi hoặc dấu chấm than.",
    cachLam: [
      "Đọc lên xem đã đủ ý chưa: người nghe có hiểu ai (cái gì) làm gì, thế nào không?",
      "Thiếu ý thì thêm phần còn thiếu.",
      "Kiểm tra chữ viết hoa đầu câu và dấu câu ở cuối.",
    ],
    viDu: {
      de: "“Những bông hoa trong vườn.” đã là câu chưa? Sửa lại.",
      dapAn: "Chưa, vì chưa biết những bông hoa thế nào. Sửa: “Những bông hoa trong vườn đã nở rộ.”",
    },
  }),
  S({
    id: "chu-ngu-vi-ngu", loai: "ltvc", ten: "Chủ ngữ và vị ngữ",
    laGi: "Chủ ngữ nêu người, vật được nói đến (trả lời “ai, cái gì, con gì?”). Vị ngữ nêu hoạt động, đặc điểm của chủ ngữ (trả lời “làm gì, thế nào, là gì?”).",
    cachLam: [
      "Hỏi “Ai (cái gì, con gì)?” để tìm chủ ngữ.",
      "Hỏi tiếp “làm gì? thế nào? là gì?” để tìm vị ngữ.",
      "Gạch một gạch dưới chủ ngữ, hai gạch dưới vị ngữ (hoặc ngăn bằng //).",
    ],
    viDu: {
      de: "Tìm chủ ngữ, vị ngữ:",
      cau: "Đàn cò trắng bay lả bay la trên cánh đồng.",
      dapAn: "Chủ ngữ: “Đàn cò trắng”. Vị ngữ: “bay lả bay la trên cánh đồng”.",
    },
    loi: "Tách thiếu khi chủ ngữ dài: “Đàn cò” chưa đủ, chủ ngữ là “Đàn cò trắng”.",
  }),
  S({
    id: "trang-ngu", loai: "ltvc", ten: "Trạng ngữ",
    laGi: "Trạng ngữ bổ sung thông tin cho câu: thời gian (khi nào?), nơi chốn (ở đâu?), nguyên nhân (vì sao?), mục đích (để làm gì?), phương tiện (bằng gì?). Trạng ngữ thường đứng đầu câu, ngăn với chủ ngữ bằng dấu phẩy.",
    cachLam: [
      "Tìm chủ ngữ và vị ngữ trước; phần còn lại, thường đứng trước dấu phẩy ở đầu câu, là trạng ngữ.",
      "Đặt câu hỏi cho trạng ngữ để biết loại: khi nào, ở đâu, vì sao, để làm gì, bằng gì.",
      "Từ báo hiệu thường gặp: “vì, nhờ, tại” (nguyên nhân); “để, nhằm” (mục đích); “bằng, với” (phương tiện).",
    ],
    viDu: {
      de: "Tìm trạng ngữ và cho biết nó bổ sung thông tin gì:",
      cau: "Bằng đôi tay khéo léo, bà đã đan cho em chiếc khăn len.",
      dapAn: "Trạng ngữ “Bằng đôi tay khéo léo” chỉ phương tiện, trả lời câu hỏi: Bằng gì?",
    },
    loi: "Quên dấu phẩy sau trạng ngữ đứng đầu câu.",
  }),
  S({
    id: "ngoac-kep", loai: "ltvc", ten: "Dấu ngoặc kép",
    laGi: "Dấu ngoặc kép đánh dấu lời nói trực tiếp của nhân vật, tên tác phẩm, hoặc từ ngữ được dùng với nghĩa đặc biệt.",
    cachLam: [
      "Đọc phần nằm trong ngoặc kép.",
      "Là lời ai đó nói ra → lời nói trực tiếp. Là tên bài, tên truyện → tên tác phẩm. Là một từ được hiểu khác nghĩa thường → từ ngữ có nghĩa đặc biệt.",
    ],
    viDu: {
      de: "Dấu ngoặc kép trong câu sau dùng để làm gì?",
      cau: "Em rất thích truyện “Dế Mèn phiêu lưu kí”.",
      dapAn: "Đánh dấu tên tác phẩm “Dế Mèn phiêu lưu kí”.",
    },
  }),
  S({
    id: "ngoac-don", loai: "ltvc", ten: "Dấu ngoặc đơn",
    laGi: "Dấu ngoặc đơn đánh dấu phần chú thích, giải thích thêm. Bỏ phần trong ngoặc đi, câu vẫn đủ ý.",
    cachLam: [
      "Tìm phần nằm trong ngoặc đơn.",
      "Thử bỏ phần đó: câu vẫn đúng thì phần ấy là chú thích.",
      "Nói rõ phần đó giải thích cho từ ngữ nào.",
    ],
    viDu: {
      de: "Phần trong ngoặc đơn giải thích điều gì?",
      cau: "Vịnh Hạ Long (Quảng Ninh) là di sản thiên nhiên thế giới.",
      dapAn: "“Quảng Ninh” cho biết vịnh “Hạ Long” thuộc tỉnh nào.",
    },
  }),
  S({
    id: "lua-chon-tu", loai: "ltvc", ten: "Lựa chọn từ ngữ",
    laGi: "Chọn từ đúng nghĩa và hợp với câu, giúp câu văn rõ ràng, hay hơn.",
    cachLam: [
      "Đọc cả câu để hiểu đang nói về ai, điều gì.",
      "Lần lượt thay từng từ vào chỗ trống, đọc thầm.",
      "Chọn từ đúng nghĩa và hợp nhất với ý cả câu.",
    ],
    viDu: {
      de: "Chọn từ thích hợp: “Bạn Minh rất …, ai nhờ gì cũng giúp.” (tốt bụng, cao lớn, xanh biếc)",
      dapAn: "“tốt bụng”: câu nói về tính nết hay giúp người.",
    },
  }),
  S({
    id: "dau-cau", loai: "ltvc", ten: "Dấu câu",
    laGi: "Ôn lại công dụng các dấu câu: chấm, chấm hỏi, chấm than, phẩy, hai chấm, gạch ngang, ngoặc kép, ngoặc đơn.",
    cachLam: [
      "Dấu chấm: kết thúc câu kể. Dấu chấm hỏi: câu hỏi. Dấu chấm than: câu cảm, câu khiến.",
      "Dấu phẩy: ngăn các từ cùng loại, ngăn trạng ngữ với chủ ngữ, vị ngữ.",
      "Dấu hai chấm: báo hiệu lời nói hoặc phần liệt kê, giải thích đi sau.",
      "Đọc lại cả đoạn, ngắt hơi ở đâu thì xem có cần dấu ở đó không.",
    ],
    viDu: {
      de: "Điền dấu câu thích hợp: “Trong vườn có cam bưởi ổi”",
      dapAn: "“Trong vườn có cam, bưởi, ổi.”",
    },
  }),

  /* ───────────── Viết ───────────── */
  S({
    id: "doan-van", loai: "viet", ten: "Đoạn văn và câu chủ đề",
    laGi: "Đoạn văn gồm nhiều câu cùng nói về một ý, chữ đầu đoạn lùi vào và viết hoa. Câu chủ đề nêu ý chính của cả đoạn, thường đứng đầu hoặc cuối đoạn.",
    cachLam: [
      "Đọc cả đoạn, tự hỏi: đoạn này nói về điều gì?",
      "Tìm câu nói đúng điều đó: đó là câu chủ đề.",
      "Khi tự viết: mở đầu bằng câu chủ đề, các câu sau làm rõ ý đó.",
    ],
    loi: "Viết các câu mỗi câu một ý, không cùng nói về một điều.",
  }),
  S({
    id: "doan-y-kien", loai: "viet", ten: "Đoạn văn nêu ý kiến",
    laGi: "Đoạn văn nói rõ em nghĩ gì (thích hay không thích, đồng tình hay không) về một sự việc, câu chuyện, nhân vật, kèm lí do.",
    cachLam: [
      "Câu mở đoạn: nêu ý kiến của em.",
      "Các câu tiếp: nêu 2–3 lí do, mỗi lí do có ví dụ, dẫn chứng.",
      "Câu kết: khẳng định lại ý kiến hoặc nêu mong muốn.",
    ],
    loi: "Chỉ nêu ý kiến mà không có lí do, hoặc lí do chung chung (“vì nó hay”).",
  }),
  S({
    id: "bao-cao", loai: "viet", ten: "Báo cáo thảo luận nhóm",
    laGi: "Văn bản ghi lại một cuộc thảo luận của nhóm: bàn về vấn đề gì, ai tham gia, đi đến kết quả nào.",
    cachLam: [
      "Tên báo cáo (nêu vấn đề thảo luận).",
      "Thời gian, địa điểm, thành phần tham gia.",
      "Nội dung và kết quả thảo luận: ghi từng ý, rõ ràng, ngắn gọn.",
      "Người viết báo cáo ký tên.",
    ],
  }),
  S({
    id: "thuat-lai", loai: "viet", ten: "Bài văn thuật lại một sự việc",
    laGi: "Kể lại một sự việc em đã chứng kiến hoặc tham gia (buổi lao động, ngày hội…) theo đúng trình tự diễn ra.",
    cachLam: [
      "Mở bài: giới thiệu sự việc, thời gian, địa điểm.",
      "Thân bài: thuật lại theo trình tự trước – trong – sau; nêu những chi tiết đáng nhớ.",
      "Kết bài: suy nghĩ, cảm xúc của em về sự việc.",
    ],
    loi: "Kể lộn xộn, không theo thứ tự thời gian.",
  }),
  S({
    id: "ke-chuyen", loai: "viet", ten: "Bài văn kể lại một câu chuyện",
    laGi: "Kể lại câu chuyện đã đọc, đã nghe bằng lời của em, đủ nhân vật và các sự việc chính.",
    cachLam: [
      "Mở bài: giới thiệu câu chuyện, nhân vật (trực tiếp hoặc gián tiếp).",
      "Thân bài: kể các sự việc theo trình tự; có thể thêm lời nói, cảm xúc của nhân vật.",
      "Kết bài: kết thúc câu chuyện, có thể nêu suy nghĩ của em (kết bài mở rộng).",
    ],
    loi: "Chép lại nguyên văn truyện thay vì kể bằng lời của mình.",
  }),
  S({
    id: "tuong-tuong", loai: "viet", ten: "Đoạn văn tưởng tượng",
    laGi: "Viết đoạn văn kể một câu chuyện do em tưởng tượng, hoặc tưởng tượng thêm cho một câu chuyện đã biết (kết thúc khác, thêm nhân vật…).",
    cachLam: [
      "Chọn câu chuyện hoặc ý tưởng, nghĩ xem em sẽ thay đổi, thêm điều gì.",
      "Sắp xếp các sự việc theo thứ tự hợp lí.",
      "Viết đoạn văn, dùng từ ngữ gợi tả và lời nói của nhân vật cho sinh động.",
    ],
    loi: "Tưởng tượng không ăn nhập với câu chuyện gốc.",
  }),
  S({
    id: "huong-dan-viec", loai: "viet", ten: "Hướng dẫn thực hiện một công việc",
    laGi: "Văn bản chỉ cho người khác cách làm một việc (gấp thuyền giấy, trồng cây…) theo từng bước.",
    cachLam: [
      "Tên công việc.",
      "Chuẩn bị: cần những gì.",
      "Các bước thực hiện: đánh số 1, 2, 3…, mỗi bước một việc, câu ngắn, dễ làm theo.",
      "Lưu ý (nếu có).",
    ],
  }),
  S({
    id: "don", loai: "viet", ten: "Đơn",
    laGi: "Đơn là giấy trình bày nguyện vọng của mình với người có thẩm quyền (xin nghỉ học, xin tham gia câu lạc bộ…).",
    cachLam: [
      "Quốc hiệu, tiêu ngữ; địa điểm, ngày tháng năm.",
      "Tên đơn (VD: ĐƠN XIN THAM GIA CÂU LẠC BỘ).",
      "Kính gửi: người hoặc nơi nhận đơn.",
      "Giới thiệu bản thân; trình bày nguyện vọng và lí do; lời hứa, lời cảm ơn.",
      "Người viết đơn ký và ghi họ tên.",
    ],
    loi: "Thiếu phần “Kính gửi” hoặc quên ký tên.",
  }),
  S({
    id: "ta-con-vat", loai: "viet", ten: "Bài văn miêu tả con vật",
    laGi: "Tả một con vật em yêu thích: hình dáng, hoạt động, thói quen, tình cảm của em với nó.",
    cachLam: [
      "Quan sát kĩ bằng nhiều giác quan: mắt nhìn, tai nghe, tay sờ.",
      "Mở bài: giới thiệu con vật.",
      "Thân bài: tả hình dáng (từ bao quát đến từng bộ phận), rồi tả hoạt động, thói quen.",
      "Kết bài: tình cảm của em; dùng so sánh, nhân hoá cho bài sinh động.",
    ],
    loi: "Chỉ liệt kê bộ phận, không có từ ngữ gợi tả.",
  }),
  S({
    id: "thu", loai: "viet", ten: "Viết thư",
    laGi: "Thư để thăm hỏi, kể chuyện, bày tỏ tình cảm với người ở xa.",
    cachLam: [
      "Đầu thư: địa điểm, ngày tháng; lời xưng hô (VD: Bà kính yêu!).",
      "Phần chính: hỏi thăm sức khoẻ, kể tình hình của em, chúc và hứa hẹn.",
      "Cuối thư: lời chào, ký tên.",
    ],
  }),
  S({
    id: "cam-xuc-nguoi", loai: "viet", ten: "Đoạn văn nêu tình cảm, cảm xúc về một người",
    laGi: "Bày tỏ tình cảm của em với một người gần gũi, thân thiết (ông bà, cha mẹ, thầy cô, bạn bè).",
    cachLam: [
      "Câu mở đoạn: giới thiệu người đó và tình cảm của em.",
      "Kể một vài kỉ niệm, việc làm của người đó khiến em yêu quý.",
      "Dùng từ ngữ bộc lộ cảm xúc: yêu quý, biết ơn, tự hào…",
      "Câu kết: mong ước hoặc lời hứa của em.",
    ],
    loi: "Chỉ tả ngoại hình mà không nói tình cảm.",
  }),
  S({
    id: "cam-xuc-nhan-vat", loai: "viet", ten: "Đoạn văn nêu tình cảm, cảm xúc về một nhân vật",
    laGi: "Bày tỏ tình cảm của em với một nhân vật trong truyện, bài đọc.",
    cachLam: [
      "Giới thiệu nhân vật và tác phẩm.",
      "Nêu điều em ấn tượng (việc làm, phẩm chất), kèm chi tiết trong truyện.",
      "Nói rõ cảm xúc của em và điều em học được từ nhân vật.",
    ],
  }),
  S({
    id: "huong-dan-san-pham", loai: "viet", ten: "Hướng dẫn sử dụng một sản phẩm",
    laGi: "Văn bản giúp người khác biết cách dùng một đồ vật (quạt điện, máy tính cầm tay…) đúng và an toàn.",
    cachLam: [
      "Tên sản phẩm; các bộ phận chính và công dụng.",
      "Các bước sử dụng, đánh số theo thứ tự.",
      "Lưu ý an toàn và cách bảo quản.",
    ],
  }),
  S({
    id: "ta-cay", loai: "viet", ten: "Bài văn miêu tả cây cối",
    laGi: "Tả một cây em yêu thích (cây bóng mát, cây hoa, cây ăn quả).",
    cachLam: [
      "Mở bài: giới thiệu cây (cây gì, ở đâu, ai trồng).",
      "Thân bài: tả bao quát rồi tả từng bộ phận (gốc, thân, cành, lá, hoa, quả); hoặc tả cây qua các mùa.",
      "Nêu lợi ích của cây, kỉ niệm của em gắn với cây.",
      "Kết bài: tình cảm của em với cây.",
    ],
  }),
  S({
    id: "giay-moi", loai: "viet", ten: "Giấy mời",
    laGi: "Giấy mời người khác đến dự một sự kiện.",
    cachLam: [
      "Tiêu đề: GIẤY MỜI.",
      "Kính gửi: người được mời.",
      "Nội dung sự kiện; thời gian; địa điểm.",
      "Lời mong người được mời đến dự; người mời ký tên.",
    ],
    loi: "Thiếu thời gian hoặc địa điểm.",
  }),
];

export const TV_GUIDE_4: TvGuide = {
  grade: 4,
  book: "Tiếng Việt 4 – Kết nối tri thức với cuộc sống",
  source: "Mục lục tập 1, tập 2 đối chiếu trên loigiaihay.com (10/2026)",
  chuDiem: [
    { so: 1, ten: "Mỗi người một vẻ", tap: 1, tu: 1, den: 8, docHieu: "Các bài đọc nói về nét riêng của mỗi người. Khi trả lời, để ý điều làm nhân vật khác người khác và vì sao điều đó đáng quý." },
    { so: 2, ten: "Trải nghiệm và khám phá", tap: 1, tu: 9, den: 16, docHieu: "Các bài đọc kể về những lần thử, lần khám phá. Chú ý nhân vật đã làm gì, gặp khó khăn gì và rút ra điều gì." },
    { so: 3, ten: "Niềm vui sáng tạo", tap: 1, tu: 17, den: 24, docHieu: "Các bài đọc nói về sáng tạo trong học tập, nghệ thuật, phát minh. Tìm chi tiết cho thấy sự sáng tạo và niềm vui của nhân vật." },
    { so: 4, ten: "Chắp cánh ước mơ", tap: 1, tu: 25, den: 32, docHieu: "Các bài đọc nói về ước mơ. Trả lời được: nhân vật mơ ước điều gì, vì sao, đã làm gì để thực hiện ước mơ." },
    { so: 5, ten: "Sống để yêu thương", tap: 2, tu: 1, den: 8, docHieu: "Các bài đọc nói về tình yêu thương, sự quan tâm giữa mọi người. Tìm việc làm thể hiện tình yêu thương và cảm xúc của nhân vật." },
    { so: 6, ten: "Uống nước nhớ nguồn", tap: 2, tu: 9, den: 16, docHieu: "Các bài đọc nói về lịch sử, truyền thống, lòng biết ơn. Ghi nhớ nhân vật, sự kiện chính và bài học về lòng biết ơn." },
    { so: 7, ten: "Quê hương trong tôi", tap: 2, tu: 17, den: 24, docHieu: "Các bài đọc tả cảnh đẹp, con người quê hương. Tìm từ ngữ, hình ảnh tả cảnh và tình cảm của tác giả với quê hương." },
    { so: 8, ten: "Vì một thế giới hòa bình", tap: 2, tu: 25, den: 30, docHieu: "Các bài đọc nói về thiên nhiên, môi trường, các nước trên thế giới. Chú ý thông tin chính và thông điệp bảo vệ, chung sống hoà bình." },
  ],
  bai: [
    // Tập 1
    { tap: 1, so: 1, doc: "Điều kì diệu", ltvc: { ten: "Danh từ", ky: "danh-tu" }, viet: { ten: "Tìm hiểu đoạn văn và câu chủ đề", ky: "doan-van" } },
    { tap: 1, so: 2, doc: "Thi nhạc", viet: { ten: "Tìm hiểu cách viết đoạn văn nêu ý kiến", ky: "doan-y-kien" }, them: "Tôi và bạn" },
    { tap: 1, so: 3, doc: "Anh em sinh đôi", ltvc: { ten: "Danh từ chung, danh từ riêng", ky: "danh-tu-chung-rieng" }, viet: { ten: "Tìm ý cho đoạn văn nêu ý kiến", ky: "doan-y-kien" } },
    { tap: 1, so: 4, doc: "Công chúa và người dẫn chuyện", viet: { ten: "Viết đoạn văn nêu ý kiến", ky: "doan-y-kien" }, them: "Đọc mở rộng" },
    { tap: 1, so: 5, doc: "Thằn lằn xanh và tắc kè", ltvc: { ten: "Luyện tập về danh từ", ky: "danh-tu" }, viet: { ten: "Trả bài viết đoạn văn nêu ý kiến", ky: "doan-y-kien" } },
    { tap: 1, so: 6, doc: "Nghệ sĩ trống", viet: { ten: "Tìm hiểu cách viết báo cáo thảo luận nhóm", ky: "bao-cao" }, them: "Kể chuyện Bốn anh tài" },
    { tap: 1, so: 7, doc: "Những bức chân dung", ltvc: { ten: "Quy tắc viết tên cơ quan, tổ chức", ky: "ten-co-quan" }, viet: { ten: "Lập dàn ý cho báo cáo thảo luận nhóm", ky: "bao-cao" } },
    { tap: 1, so: 8, doc: "Đò ngang", viet: { ten: "Viết báo cáo thảo luận nhóm", ky: "bao-cao" }, them: "Đọc mở rộng" },
    { tap: 1, so: 9, doc: "Bầu trời trong quả trứng", ltvc: { ten: "Động từ", ky: "dong-tu" }, viet: { ten: "Tìm hiểu cách viết bài văn thuật lại một sự việc", ky: "thuat-lai" } },
    { tap: 1, so: 10, doc: "Tiếng nói của cỏ cây", viet: { ten: "Lập dàn ý cho bài văn thuật lại một sự việc", ky: "thuat-lai" }, them: "Trải nghiệm đáng nhớ" },
    { tap: 1, so: 11, doc: "Tập làm văn", ltvc: { ten: "Luyện tập về động từ", ky: "dong-tu" }, viet: { ten: "Viết bài văn thuật lại một sự việc", ky: "thuat-lai" } },
    { tap: 1, so: 12, doc: "Nhà phát minh 6 tuổi", viet: { ten: "Tìm hiểu cách viết bài văn kể lại một câu chuyện", ky: "ke-chuyen" }, them: "Đọc mở rộng" },
    { tap: 1, so: 13, doc: "Con vẹt xanh", ltvc: { ten: "Luyện tập về động từ", ky: "dong-tu" }, viet: { ten: "Luyện viết mở bài, kết bài cho bài văn kể lại một câu chuyện", ky: "ke-chuyen" } },
    { tap: 1, so: 14, doc: "Chân trời cuối phố", viet: { ten: "Lập dàn ý cho bài văn kể lại một câu chuyện", ky: "ke-chuyen" }, them: "Việc làm có ích" },
    { tap: 1, so: 15, doc: "Gặt chữ trên non", ltvc: { ten: "Cách dùng và công dụng của từ điển", ky: "tu-dien" }, viet: { ten: "Viết bài văn kể lại một câu chuyện", ky: "ke-chuyen" } },
    { tap: 1, so: 16, doc: "Trước ngày xa quê", viet: { ten: "Trả bài văn kể lại một câu chuyện", ky: "ke-chuyen" }, them: "Đọc mở rộng" },
    { tap: 1, so: 17, doc: "Vẽ màu", ltvc: { ten: "Biện pháp nhân hóa", ky: "nhan-hoa" }, viet: { ten: "Tìm hiểu cách viết đoạn văn tưởng tượng", ky: "tuong-tuong" } },
    { tap: 1, so: 18, doc: "Đồng cỏ nở hoa", viet: { ten: "Tìm ý cho đoạn văn tưởng tượng", ky: "tuong-tuong" }, them: "Chúng em sáng tạo" },
    { tap: 1, so: 19, doc: "Thanh âm của núi", ltvc: { ten: "Luyện tập về biện pháp nhân hóa", ky: "nhan-hoa" }, viet: { ten: "Viết đoạn văn tưởng tượng", ky: "tuong-tuong" } },
    { tap: 1, so: 20, doc: "Bầu trời mùa thu", viet: { ten: "Trả bài viết đoạn văn tưởng tượng", ky: "tuong-tuong" }, them: "Đọc mở rộng" },
    { tap: 1, so: 21, doc: "Làm thỏ con bằng giấy", ltvc: { ten: "Tính từ", ky: "tinh-tu" }, viet: { ten: "Tìm hiểu cách viết hướng dẫn thực hiện một công việc", ky: "huong-dan-viec" } },
    { tap: 1, so: 22, doc: "Bức tường có nhiều phép lạ", viet: { ten: "Viết hướng dẫn thực hiện một công việc", ky: "huong-dan-viec" }, them: "Kể chuyện: Nhà phát minh và bà cụ" },
    { tap: 1, so: 23, doc: "Bét-tô-ven và bản xô-nát Ánh trăng", ltvc: { ten: "Luyện tập về tính từ", ky: "tinh-tu" }, viet: { ten: "Tìm hiểu cách viết đơn", ky: "don" } },
    { tap: 1, so: 24, doc: "Người tìm đường lên các vì sao", viet: { ten: "Viết đơn", ky: "don" }, them: "Đọc mở rộng" },
    { tap: 1, so: 25, doc: "Bay cùng ước mơ", ltvc: { ten: "Luyện tập về tính từ", ky: "tinh-tu" }, viet: { ten: "Tìm hiểu cách viết bài văn miêu tả con vật", ky: "ta-con-vat" } },
    { tap: 1, so: 26, doc: "Con trai người làm vườn", viet: { ten: "Quan sát con vật", ky: "ta-con-vat" }, them: "Ước mơ của em" },
    { tap: 1, so: 27, doc: "Nếu em có một khu vườn", ltvc: { ten: "Dấu gạch ngang", ky: "gach-ngang" }, viet: { ten: "Luyện viết đoạn văn miêu tả con vật", ky: "ta-con-vat" } },
    { tap: 1, so: 28, doc: "Bốn mùa mơ ước", viet: { ten: "Lập dàn ý cho bài văn miêu tả con vật", ky: "ta-con-vat" }, them: "Đọc mở rộng" },
    { tap: 1, so: 29, doc: "Ở vương quốc tương lai", ltvc: { ten: "Luyện tập về dấu gạch ngang", ky: "gach-ngang" }, viet: { ten: "Viết bài văn miêu tả con vật", ky: "ta-con-vat" } },
    { tap: 1, so: 30, doc: "Cánh chim nhỏ", viet: { ten: "Trả bài văn miêu tả con vật", ky: "ta-con-vat" }, them: "Kể chuyện Đôi cánh của ngựa trắng" },
    { tap: 1, so: 31, doc: "Nếu chúng mình có phép lạ", ltvc: { ten: "Luyện tập về danh từ, động từ, tính từ", ky: "tu-loai" }, viet: { ten: "Tìm hiểu cách viết thư", ky: "thu" } },
    { tap: 1, so: 32, doc: "Anh Ba", viet: { ten: "Viết thư", ky: "thu" }, them: "Đọc mở rộng" },
    // Tập 2
    { tap: 2, so: 1, doc: "Hải Thượng Lãn Ông", ltvc: { ten: "Câu", ky: "cau" }, viet: { ten: "Tìm hiểu cách viết đoạn văn nêu tình cảm, cảm xúc", ky: "cam-xuc-nguoi" } },
    { tap: 2, so: 2, doc: "Vệt phấn trên mặt bàn", viet: { ten: "Tìm ý cho đoạn văn nêu tình cảm, cảm xúc về một người gần gũi, thân thiết", ky: "cam-xuc-nguoi" }, them: "Giúp bạn" },
    { tap: 2, so: 3, doc: "Ông Bụt đã đến", ltvc: { ten: "Hai thành phần chính của câu", ky: "chu-ngu-vi-ngu" }, viet: { ten: "Viết đoạn văn nêu tình cảm, cảm xúc về một người gần gũi, thân thiết", ky: "cam-xuc-nguoi" } },
    { tap: 2, so: 4, doc: "Quả ngọt cuối mùa", viet: { ten: "Tìm ý cho đoạn văn nêu tình cảm, cảm xúc về một nhân vật trong văn học", ky: "cam-xuc-nhan-vat" }, them: "Đọc mở rộng" },
    { tap: 2, so: 5, doc: "Tờ báo tường của tôi", ltvc: { ten: "Luyện tập về chủ ngữ", ky: "chu-ngu-vi-ngu" }, viet: { ten: "Viết đoạn văn nêu tình cảm, cảm xúc về một nhân vật trong văn học", ky: "cam-xuc-nhan-vat" } },
    { tap: 2, so: 6, doc: "Tiếng ru", viet: { ten: "Trả bài viết đoạn văn nêu tình cảm, cảm xúc về một nhân vật trong văn học", ky: "cam-xuc-nhan-vat" }, them: "Kể chuyện bài học quý" },
    { tap: 2, so: 7, doc: "Con muốn làm một cái cây", ltvc: { ten: "Luyện tập về vị ngữ", ky: "chu-ngu-vi-ngu" }, viet: { ten: "Tìm hiểu cách viết hướng dẫn sử dụng một sản phẩm", ky: "huong-dan-san-pham" } },
    { tap: 2, so: 8, doc: "Trên khóm tre đầu ngõ", viet: { ten: "Viết hướng dẫn sử dụng một sản phẩm", ky: "huong-dan-san-pham" }, them: "Đọc mở rộng" },
    { tap: 2, so: 9, doc: "Sự tích con rồng cháu tiên", ltvc: { ten: "Luyện tập về hai thành phần chính của câu", ky: "chu-ngu-vi-ngu" }, viet: { ten: "Lập dàn ý cho bài văn kể lại một câu chuyện", ky: "ke-chuyen" } },
    { tap: 2, so: 10, doc: "Cảm xúc Trường Sa", viet: { ten: "Viết bài văn kể lại một câu chuyện", ky: "ke-chuyen" }, them: "Những tấm gương sáng" },
    { tap: 2, so: 11, doc: "Sáng tháng Năm", ltvc: { ten: "Trạng ngữ", ky: "trang-ngu" }, viet: { ten: "Trả bài văn kể lại một câu chuyện", ky: "ke-chuyen" } },
    { tap: 2, so: 12, doc: "Chàng trai làng Phù Ủng", viet: { ten: "Viết đoạn văn nêu ý kiến", ky: "doan-y-kien" }, them: "Đọc mở rộng" },
    { tap: 2, so: 13, doc: "Vườn của ông tôi", ltvc: { ten: "Trạng ngữ chỉ thời gian, nơi chốn", ky: "trang-ngu" }, viet: { ten: "Trả bài viết đoạn văn nêu ý kiến", ky: "doan-y-kien" } },
    { tap: 2, so: 14, doc: "Trong lời mẹ hát", viet: { ten: "Lập dàn ý cho bài văn thuật lại một sự việc", ky: "thuat-lai" }, them: "Truyền thống uống nước nhớ nguồn" },
    { tap: 2, so: 15, doc: "Người thầy đầu tiên của bố tôi", ltvc: { ten: "Trạng ngữ chỉ nguyên nhân, mục đích", ky: "trang-ngu" }, viet: { ten: "Viết bài văn thuật lại một sự việc", ky: "thuat-lai" } },
    { tap: 2, so: 16, doc: "Ngựa biên phòng", viet: { ten: "Trả bài văn thuật lại một sự việc", ky: "thuat-lai" }, them: "Đọc mở rộng" },
    { tap: 2, so: 17, doc: "Cây đa quê hương", ltvc: { ten: "Trạng ngữ chỉ phương tiện", ky: "trang-ngu" }, viet: { ten: "Tìm hiểu cách viết bài văn miêu tả cây cối", ky: "ta-cay" } },
    { tap: 2, so: 18, doc: "Bước mùa xuân", viet: { ten: "Tìm hiểu cách viết bài văn miêu tả cây cối (tiếp theo)", ky: "ta-cay" }, them: "Những miền quê yêu dấu" },
    { tap: 2, so: 19, doc: "Đi hội chùa Hương", ltvc: { ten: "Dấu ngoặc kép", ky: "ngoac-kep" }, viet: { ten: "Quan sát cây cối", ky: "ta-cay" } },
    { tap: 2, so: 20, doc: "Chiều ngoại ô", viet: { ten: "Luyện viết đoạn văn miêu tả cây cối", ky: "ta-cay" }, them: "Đọc mở rộng" },
    { tap: 2, so: 21, doc: "Những cánh buồm", ltvc: { ten: "Dấu ngoặc đơn", ky: "ngoac-don" }, viet: { ten: "Luyện viết mở bài, kết bài cho bài văn miêu tả cây cối", ky: "ta-cay" } },
    { tap: 2, so: 22, doc: "Cái cầu", viet: { ten: "Lập dàn ý cho bài văn miêu tả cây cối", ky: "ta-cay" }, them: "Kể chuyện Về quê ngoại" },
    { tap: 2, so: 23, doc: "Đường đi Sa Pa", ltvc: { ten: "Luyện tập viết tên cơ quan, tổ chức", ky: "ten-co-quan" }, viet: { ten: "Viết bài văn miêu tả cây cối", ky: "ta-cay" } },
    { tap: 2, so: 24, doc: "Quê ngoại", viet: { ten: "Trả bài văn miêu tả cây cối", ky: "ta-cay" }, them: "Đọc mở rộng" },
    { tap: 2, so: 25, doc: "Khu bảo tồn động vật hoang dã Ngô-rông-gô-rô", ltvc: { ten: "Lựa chọn từ ngữ", ky: "lua-chon-tu" }, viet: { ten: "Viết đoạn văn tưởng tượng", ky: "tuong-tuong" } },
    { tap: 2, so: 26, doc: "Ngôi nhà của yêu thương", viet: { ten: "Trả bài viết đoạn văn tưởng tượng", ky: "tuong-tuong" }, them: "Chung tay bảo vệ động vật" },
    { tap: 2, so: 27, doc: "Băng tan", ltvc: { ten: "Luyện tập lựa chọn từ ngữ", ky: "lua-chon-tu" }, viet: { ten: "Viết đoạn văn tưởng tượng", ky: "tuong-tuong" } },
    { tap: 2, so: 28, doc: "Chuyến du lịch thú vị", viet: { ten: "Hướng dẫn cách viết thư", ky: "thu" }, them: "Đọc mở rộng" },
    { tap: 2, so: 29, doc: "Lễ hội ở Nhật Bản", ltvc: { ten: "Luyện tập về dấu câu", ky: "dau-cau" }, viet: { ten: "Viết thư", ky: "thu" } },
    { tap: 2, so: 30, doc: "Ngày hội", viet: { ten: "Viết giấy mời", ky: "giay-moi" }, them: "Cuộc sống xanh" },
  ],
  skills: Object.fromEntries(SKILLS.map((s) => [s.id, s])),
};
