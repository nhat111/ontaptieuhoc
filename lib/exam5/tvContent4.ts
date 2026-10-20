// lib/exam5/tvContent4.ts
// Nội dung đề Tiếng Việt lớp 4 — VIẾT TAY, không sinh bằng máy, không chép sách giáo khoa:
// bài đọc do Ôn Tập Phổ Thông tự soạn theo các chủ điểm của chương trình GDPT 2018
// (trải nghiệm – khám phá, sáng tạo – ước mơ, yêu thương – nhớ nguồn, quê hương – đoàn kết).
// CẦN NGƯỜI DUYỆT trước khi coi là xong: máy chỉ soát được hình thức, không soát được ý.
//
// Quy tắc như ./tvContent.ts (scripts/exam5-check.ts kiểm tra phần máy kiểm được):
//   • Mỗi câu trắc nghiệm có đúng MỘT đáp án đúng; đáp án nhiễu phải sai rõ ràng.
//   • `answer` phải trùng nguyên văn một phần tử của `options`.
//   • Câu hỏi trích từ bài đọc thì phần trích phải có nguyên văn trong `text`.
//   • Dùng ngoặc kép cong “ ” trong nội dung, không dùng " thẳng.
//   • Phạm vi luyện từ và câu theo kì (lớp 4): giữa HK I danh từ, động từ; cuối HK I tính
//     từ, nhân hoá; giữa HK II chủ ngữ – vị ngữ, trạng ngữ; cuối HK II trạng ngữ, dấu câu.
//   • Bài đọc ngắn hơn lớp 5: 180–320 tiếng.

import { M, type TvContent, type TvPassage } from "./tvContent";

const P = (p: TvPassage) => p;

const PASSAGES: TvPassage[] = [
  /* ═════════════ GIỮA HỌC KÌ I ═════════════ */
  P({
    id: "lan-dau-xuong-nuoc", kinds: ["giua-hk1"], title: "Lần đầu xuống nước",
    text: `Mùa hè năm nay, bố đăng kí cho Nam học bơi ở bể bơi của phường. Buổi học đầu tiên, nhìn làn nước xanh trong vắt, Nam thấy chân tay mình run run. Cậu đứng mãi trên bậc thềm, không dám bước xuống.

Thầy dạy bơi là một người cao lớn, nước da rám nắng. Thầy ngồi xuống cạnh Nam, nói nhỏ:

– Ai lần đầu cũng sợ cả. Con cứ bám vào thành bể, thầy ở ngay bên cạnh.

Nam hít một hơi thật sâu rồi từ từ bước xuống. Nước mát lạnh ôm lấy người cậu. Thầy dạy Nam cách nín thở, úp mặt xuống nước rồi đạp chân thật đều. Lúc đầu, Nam sặc nước mấy lần, mũi cay xè. Có lúc cậu muốn bỏ cuộc. Nhưng nhớ lời thầy, cậu lại cố gắng tập tiếp.

Sau mười buổi học, Nam đã bơi được một vòng bể mà không cần bám thành. Hôm ấy, bố đến đón, Nam khoe rối rít. Bố xoa đầu cậu:

– Con giỏi lắm! Điều khó nhất không phải là bơi, mà là dám bước xuống nước.

Nam mỉm cười. Cậu biết mình vừa vượt qua nỗi sợ của chính mình.`,
    questions: [
      { q: "Ai đã đăng kí cho Nam đi học bơi?", options: ["Bố của Nam", "Mẹ của Nam", "Cô giáo chủ nhiệm", "Ông nội của Nam"], answer: "Bố của Nam", explain: "“bố đăng kí cho Nam học bơi ở bể bơi của phường”." },
      { q: "Buổi học đầu tiên, vì sao Nam đứng mãi trên bậc thềm?", options: ["Vì Nam sợ, chân tay run run", "Vì nước trong bể quá bẩn", "Vì Nam quên mang kính bơi", "Vì thầy dạy bơi chưa đến"], answer: "Vì Nam sợ, chân tay run run", explain: "“Nam thấy chân tay mình run run” nên không dám bước xuống." },
      { q: "Thầy dạy bơi đã nói gì để Nam bớt sợ?", options: ["Ai lần đầu cũng sợ, thầy ở ngay bên cạnh", "Con phải nhảy xuống ngay lập tức", "Nếu sợ thì con về nhà đi", "Bơi rất dễ, không cần tập"], answer: "Ai lần đầu cũng sợ, thầy ở ngay bên cạnh", explain: "Thầy nói: “Ai lần đầu cũng sợ cả.” và “thầy ở ngay bên cạnh”." },
      { q: "Khi tập bơi, Nam đã gặp khó khăn gì?", options: ["Sặc nước mấy lần, mũi cay xè", "Bị ngã trên bậc thềm", "Không có ai dạy", "Bị lạc mất bố"], answer: "Sặc nước mấy lần, mũi cay xè", explain: "“Lúc đầu, Nam sặc nước mấy lần, mũi cay xè.”" },
      { q: "Sau bao nhiêu buổi học, Nam bơi được một vòng bể mà không cần bám thành?", options: ["Mười buổi", "Hai buổi", "Năm buổi", "Hai mươi buổi"], answer: "Mười buổi", explain: "“Sau mười buổi học, Nam đã bơi được một vòng bể mà không cần bám thành.”" },
      { q: "Câu chuyện khuyên em điều gì?", options: ["Dũng cảm vượt qua nỗi sợ và kiên trì tập luyện", "Không nên học bơi vì rất nguy hiểm", "Chỉ học bơi khi có bố đi cùng", "Muốn bơi giỏi phải bơi thật nhanh"], answer: "Dũng cảm vượt qua nỗi sợ và kiên trì tập luyện", explain: "Bố nói: “Điều khó nhất không phải là bơi, mà là dám bước xuống nước.”" },
    ],
    ltvc: { q: "Trong câu “Thầy dạy Nam cách nín thở, úp mặt xuống nước rồi đạp chân thật đều.”, từ nào dưới đây là danh từ?", options: ["nước", "dạy", "úp", "đều"], answer: "nước", explain: "“nước” chỉ sự vật nên là danh từ; “dạy”, “úp” chỉ hoạt động (động từ), “đều” chỉ đặc điểm (tính từ)." },
    open: { q: "Em đã từng vượt qua một nỗi sợ nào chưa? Viết 1–2 câu kể lại.", hint: "Câu đúng ngữ pháp, nêu được nỗi sợ và cách em vượt qua. VD: “Em từng sợ bóng tối, nhưng em đã tập ngủ một mình và giờ em không sợ nữa.”" },
  }),
  P({
    id: "khu-vuon-cua-ba", kinds: ["giua-hk1"], title: "Khu vườn của bà",
    text: `Sau nhà bà ngoại có một khu vườn nhỏ. Bà chia vườn thành từng luống ngay ngắn: luống cải xanh mướt, luống hành lá thẳng tắp, luống cà chua đỏ mọng. Góc vườn là cây khế già, cành lá sum suê, mùa nào cũng trĩu quả.

Sáng nào bà cũng dậy từ khi gà gáy. Bà xách từng thùng nước tưới cho rau, nhặt cỏ, bắt sâu. Bà bảo rau cũng như người, phải được chăm chút thì mới lớn khỏe. Nghỉ hè về quê, tôi theo bà ra vườn. Bà dạy tôi cách gieo hạt, cách vun gốc, cách nhận ra con sâu nằm dưới mặt lá.

Mỗi buổi chiều, khu vườn lại rộn ràng tiếng ong bay, tiếng chim hót. Những bông hoa bí vàng rực khoe sắc dưới nắng. Bà cắt rau nấu canh, hái quả khế chua làm món cá kho. Bữa cơm quê đơn sơ mà ngon đến lạ.

Ngày tôi trở lại thành phố, bà gói cho tôi một túi hạt giống. Bà dặn: “Cháu gieo vào chậu, ngày ngày tưới nước, rồi cháu sẽ thấy niềm vui lớn lên cùng cây.” Bây giờ, trên ban công nhà tôi đã xanh một chậu rau cải. Mỗi lần tưới rau, tôi lại nhớ bà và khu vườn nhỏ ở quê.`,
    questions: [
      { q: "Khu vườn của bà nằm ở đâu?", options: ["Sau nhà bà ngoại", "Trước cổng làng", "Bên bờ sông", "Trên sân thượng"], answer: "Sau nhà bà ngoại", explain: "“Sau nhà bà ngoại có một khu vườn nhỏ.”" },
      { q: "Trong vườn của bà có những luống gì?", options: ["Cải, hành lá, cà chua", "Bắp cải, su hào, cà rốt", "Rau muống, mướp, đậu", "Xà lách, dưa chuột, ớt"], answer: "Cải, hành lá, cà chua", explain: "“luống cải xanh mướt, luống hành lá thẳng tắp, luống cà chua đỏ mọng”." },
      { q: "Mỗi sáng, bà chăm sóc vườn rau như thế nào?", options: ["Tưới nước, nhặt cỏ, bắt sâu", "Chỉ tưới khi trời nắng to", "Nhờ hàng xóm làm giúp", "Để rau tự mọc"], answer: "Tưới nước, nhặt cỏ, bắt sâu", explain: "“Bà xách từng thùng nước tưới cho rau, nhặt cỏ, bắt sâu.”" },
      { q: "Bà đã dạy bạn nhỏ những việc gì?", options: ["Gieo hạt, vun gốc, nhận ra con sâu", "Nấu canh, kho cá", "Hái khế, cắt rau", "Đọc sách, viết chữ"], answer: "Gieo hạt, vun gốc, nhận ra con sâu", explain: "“Bà dạy tôi cách gieo hạt, cách vun gốc, cách nhận ra con sâu nằm dưới mặt lá.”" },
      { q: "Khi bạn nhỏ trở lại thành phố, bà đã tặng gì?", options: ["Một túi hạt giống", "Một rổ khế", "Một chậu cây cảnh", "Một bó hoa bí"], answer: "Một túi hạt giống", explain: "“bà gói cho tôi một túi hạt giống”." },
      { q: "Bài văn nói lên điều gì?", options: ["Tình yêu thương của bà và niềm vui khi chăm sóc cây cối", "Cách nấu món cá kho khế", "Cuộc sống ở thành phố rất buồn", "Rau ở quê rẻ hơn rau ở thành phố"], answer: "Tình yêu thương của bà và niềm vui khi chăm sóc cây cối", explain: "Bà chăm vườn, dạy cháu trồng rau; bà dặn “rồi cháu sẽ thấy niềm vui lớn lên cùng cây”." },
    ],
    ltvc: { q: "Dòng nào dưới đây gồm toàn động từ có trong bài?", options: ["tưới, nhặt, gieo", "luống, vườn, khế", "xanh mướt, đỏ mọng, vàng rực", "bà, tôi, cháu"], answer: "tưới, nhặt, gieo", explain: "“tưới”, “nhặt”, “gieo” đều chỉ hoạt động nên là động từ." },
    open: { q: "Nếu được bà tặng một túi hạt giống, em sẽ làm gì? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể. VD: “Em sẽ gieo hạt vào chậu và tưới nước mỗi ngày.”" },
  }),

  /* ═════════════ CUỐI HỌC KÌ I ═════════════ */
  P({
    id: "chiec-may-tuoi-cay", kinds: ["cuoi-hk1"], title: "Chiếc máy tưới cây",
    text: `Cô giáo giao cho lớp 4A chăm sóc vườn hoa trước cửa lớp. Ngày thường, các bạn thay nhau tưới cây. Nhưng cứ đến hai ngày nghỉ cuối tuần, không ai tưới, những khóm hoa lại héo rũ, lá vàng úa.

Tuấn suy nghĩ mãi. Một tối, cậu nhìn thấy mẹ treo chai nước truyền cho ông nội. Từng giọt nước nhỏ xuống đều đặn qua ống dây. Tuấn reo lên: “Mình sẽ làm như thế cho cây!”

Hôm sau, Tuấn mang đến lớp mấy chai nhựa cũ, một cuộn dây mềm và mấy que tre nhỏ. Cậu cùng các bạn khoét lỗ nắp chai, luồn dây, rồi treo chai lên những cọc tre cắm bên khóm hoa. Nước trong chai chảy chậm qua ống dây, nhỏ từng giọt xuống gốc cây. Mỗi chai đầy có thể tưới cho cây suốt hai ngày.

Thứ Hai tuần sau, cả lớp hồi hộp chạy ra vườn. Những khóm hoa vẫn tươi tắn, lá xanh mơn mởn, như đang mỉm cười chào các bạn nhỏ. Cô giáo khen Tuấn và cả nhóm đã biết biến những vật bỏ đi thành một sáng chế có ích. Từ đó, vườn hoa lớp 4A trở thành vườn hoa đẹp nhất trường.`,
    questions: [
      { q: "Cô giáo giao cho lớp 4A việc gì?", options: ["Chăm sóc vườn hoa trước cửa lớp", "Trồng cây ở sân trường", "Quét dọn thư viện", "Làm báo tường"], answer: "Chăm sóc vườn hoa trước cửa lớp", explain: "“Cô giáo giao cho lớp 4A chăm sóc vườn hoa trước cửa lớp.”" },
      { q: "Vì sao những khóm hoa hay bị héo?", options: ["Vì hai ngày nghỉ cuối tuần không ai tưới", "Vì trời mưa quá nhiều", "Vì bị sâu ăn lá", "Vì các bạn tưới quá nhiều nước"], answer: "Vì hai ngày nghỉ cuối tuần không ai tưới", explain: "“cứ đến hai ngày nghỉ cuối tuần, không ai tưới, những khóm hoa lại héo rũ”." },
      { q: "Điều gì đã gợi cho Tuấn ý tưởng làm máy tưới cây?", options: ["Chai nước truyền nhỏ giọt đều đặn", "Chiếc vòi phun nước trong công viên", "Cơn mưa ngoài cửa sổ", "Một chương trình trên ti vi"], answer: "Chai nước truyền nhỏ giọt đều đặn", explain: "Tuấn “nhìn thấy mẹ treo chai nước truyền cho ông nội. Từng giọt nước nhỏ xuống đều đặn qua ống dây.”" },
      { q: "Tuấn đã dùng những vật liệu gì để làm máy tưới cây?", options: ["Chai nhựa cũ, dây mềm và que tre", "Ống nước mới và máy bơm", "Xô nhựa và gáo múc nước", "Bình tưới bằng sắt"], answer: "Chai nhựa cũ, dây mềm và que tre", explain: "Tuấn mang đến “mấy chai nhựa cũ, một cuộn dây mềm và mấy que tre nhỏ”." },
      { q: "Mỗi chai nước đầy tưới được cho cây trong bao lâu?", options: ["Suốt hai ngày", "Một buổi sáng", "Một tuần", "Một tháng"], answer: "Suốt hai ngày", explain: "“Mỗi chai đầy có thể tưới cho cây suốt hai ngày.”" },
      { q: "Câu chuyện khen ngợi điều gì ở Tuấn và các bạn?", options: ["Biết quan sát, sáng tạo để giải quyết khó khăn", "Chạy nhanh nhất trường", "Học giỏi môn Toán", "Hay giúp mẹ nấu cơm"], answer: "Biết quan sát, sáng tạo để giải quyết khó khăn", explain: "Cô khen các bạn “đã biết biến những vật bỏ đi thành một sáng chế có ích”." },
    ],
    ltvc: { q: "Câu nào trong bài có sử dụng biện pháp nhân hoá?", options: ["Những khóm hoa vẫn tươi tắn, lá xanh mơn mởn, như đang mỉm cười chào các bạn nhỏ.", "Ngày thường, các bạn thay nhau tưới cây.", "Nước trong chai chảy chậm qua ống dây.", "Tuấn suy nghĩ mãi."], answer: "Những khóm hoa vẫn tươi tắn, lá xanh mơn mởn, như đang mỉm cười chào các bạn nhỏ.", explain: "Khóm hoa được tả bằng hoạt động của người: “mỉm cười chào các bạn nhỏ”." },
    open: { q: "Em có ý tưởng gì để chăm sóc cây xanh ở lớp em? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được một việc làm cụ thể. VD: “Em sẽ đề nghị lớp chia nhóm, mỗi nhóm chăm một chậu cây.”" },
  }),
  P({
    id: "uoc-mo-cua-lan", kinds: ["cuoi-hk1"], title: "Ước mơ của Lan",
    text: `Nhà Lan ở một xóm nhỏ ven đồi. Con chó Mực nhà Lan bị ốm, nằm bỏ ăn mấy ngày liền. Cả nhà lo lắng lắm. Bố phải đưa Mực xuống tận thị trấn, cách nhà gần hai mươi cây số, mới có phòng khám thú y.

Bác sĩ thú y là một cô gái trẻ, giọng nói dịu dàng. Cô nhẹ nhàng xem mắt, nghe tim cho Mực rồi tiêm thuốc. Cô còn tỉ mỉ dặn Lan cách cho Mực ăn cháo loãng, uống nước ấm. Ba hôm sau, Mực đã vẫy đuôi chạy ra cổng đón Lan đi học về.

Từ hôm ấy, Lan có một ước mơ: lớn lên sẽ trở thành bác sĩ thú y. Em muốn mở một phòng khám ngay trong xóm, để không chú chó, chú mèo nào phải đi xa khi bị ốm. Lan bắt đầu tìm đọc sách về các loài vật. Em chăm sóc đàn gà, chú mèo mướp và cả con Mực chu đáo hơn.

Một tối, Lan kể ước mơ của mình cho bố nghe. Bố mỉm cười:

– Ước mơ đẹp lắm! Nhưng muốn làm bác sĩ thì con phải học thật giỏi đấy.

Lan gật đầu thật mạnh. Đêm ấy, em mơ thấy mình mặc áo blu trắng, đứng giữa một phòng khám nhỏ đầy tiếng chó sủa, mèo kêu.`,
    questions: [
      { q: "Chuyện gì đã xảy ra với con Mực?", options: ["Mực bị ốm, bỏ ăn mấy ngày liền", "Mực bị lạc đường", "Mực cắn hỏng giày", "Mực sinh được đàn con"], answer: "Mực bị ốm, bỏ ăn mấy ngày liền", explain: "“Con chó Mực nhà Lan bị ốm, nằm bỏ ăn mấy ngày liền.”" },
      { q: "Vì sao bố phải đưa Mực xuống thị trấn?", options: ["Vì chỉ ở đó mới có phòng khám thú y", "Vì bố muốn đi chợ phiên", "Vì Mực thích đi chơi xa", "Vì ở thị trấn có trường học"], answer: "Vì chỉ ở đó mới có phòng khám thú y", explain: "Bố đưa Mực xuống tận thị trấn “mới có phòng khám thú y”." },
      { q: "Cô bác sĩ thú y đã dặn Lan điều gì?", options: ["Cho Mực ăn cháo loãng, uống nước ấm", "Cho Mực chạy nhảy thật nhiều", "Không cho Mực ăn gì cả", "Tắm cho Mực bằng nước lạnh"], answer: "Cho Mực ăn cháo loãng, uống nước ấm", explain: "Cô dặn Lan “cách cho Mực ăn cháo loãng, uống nước ấm”." },
      { q: "Ước mơ của Lan là gì?", options: ["Trở thành bác sĩ thú y", "Trở thành cô giáo", "Trở thành người bán hàng", "Trở thành nhà văn"], answer: "Trở thành bác sĩ thú y", explain: "“lớn lên sẽ trở thành bác sĩ thú y”." },
      { q: "Vì sao Lan muốn mở phòng khám ngay trong xóm?", options: ["Để vật nuôi bị ốm không phải đi xa", "Để được ở gần trường học", "Để bán thức ăn cho chó mèo", "Để bố không phải đi làm"], answer: "Để vật nuôi bị ốm không phải đi xa", explain: "“để không chú chó, chú mèo nào phải đi xa khi bị ốm”." },
      { q: "Lan đã làm gì để chuẩn bị cho ước mơ của mình?", options: ["Tìm đọc sách về loài vật, chăm sóc vật nuôi chu đáo hơn", "Nghỉ học để ở nhà chăm Mực", "Xin bố mua áo blu trắng", "Mở ngay một phòng khám"], answer: "Tìm đọc sách về loài vật, chăm sóc vật nuôi chu đáo hơn", explain: "“Lan bắt đầu tìm đọc sách về các loài vật.” và chăm sóc đàn gà, chú mèo, con Mực “chu đáo hơn”." },
    ],
    ltvc: { q: "Trong câu “Bác sĩ thú y là một cô gái trẻ, giọng nói dịu dàng.”, những từ nào là tính từ?", options: ["trẻ, dịu dàng", "bác sĩ, cô gái", "giọng nói, thú y", "là, một"], answer: "trẻ, dịu dàng", explain: "“trẻ” và “dịu dàng” chỉ đặc điểm của người nên là tính từ." },
    open: { q: "Ước mơ của em là gì? Em sẽ làm gì để thực hiện ước mơ ấy? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được ước mơ và một việc làm cụ thể. VD: “Em mơ làm kĩ sư nên em sẽ học thật tốt môn Toán.”" },
  }),

  /* ═════════════ GIỮA HỌC KÌ II ═════════════ */
  P({
    id: "hu-gao-tinh-thuong", kinds: ["giua-hk2"], title: "Hũ gạo tình thương",
    text: `Ở góc sân trường em có một chiếc hũ sành to, bên ngoài dán dòng chữ “Hũ gạo tình thương”. Mỗi sáng thứ Hai, các bạn học sinh lại mang theo một nắm gạo nhỏ, nhẹ nhàng đổ vào hũ.

Ý tưởng ấy bắt đầu từ bạn Hùng lớp 4B. Hùng biết bạn Thảo cùng lớp, nhà ở cuối xóm, bố mẹ đau ốm luôn, nhiều hôm đi học mà bụng đói. Hùng kể với cô Tổng phụ trách. Cô liền họp Liên đội và cả trường hưởng ứng ngay.

Mỗi bạn chỉ góp một nắm gạo, chẳng đáng là bao. Nhưng góp lại, cuối tháng, hũ gạo đã đầy ắp. Thầy cô và các bạn mang gạo đến tặng gia đình Thảo và mấy gia đình khó khăn khác trong xã. Mẹ Thảo cầm túi gạo, rơm rớm nước mắt cảm ơn.

Giờ đây, Thảo đã đi học đều đặn hơn. Em còn nhận làm “người giữ hũ”, sáng nào cũng đứng bên chiếc hũ, tươi cười cảm ơn từng bạn. Chiếc hũ gạo nhỏ ở góc sân đã giúp cả trường hiểu rằng: mỗi người góp một chút, lá lành đùm lá rách, sẽ chẳng ai bị bỏ lại phía sau.`,
    questions: [
      { q: "Hũ gạo tình thương được đặt ở đâu?", options: ["Ở góc sân trường", "Trong lớp 4B", "Ở nhà văn hoá xã", "Trước cổng chợ"], answer: "Ở góc sân trường", explain: "“Ở góc sân trường em có một chiếc hũ sành to”." },
      { q: "Ai là người nghĩ ra ý tưởng hũ gạo?", options: ["Bạn Hùng lớp 4B", "Cô Tổng phụ trách", "Bạn Thảo", "Mẹ của Thảo"], answer: "Bạn Hùng lớp 4B", explain: "“Ý tưởng ấy bắt đầu từ bạn Hùng lớp 4B.”" },
      { q: "Vì sao Hùng muốn giúp bạn Thảo?", options: ["Vì nhà Thảo khó khăn, nhiều hôm Thảo đi học mà bụng đói", "Vì Thảo học chưa giỏi", "Vì Thảo hay đi học muộn", "Vì Thảo nhờ Hùng giúp"], answer: "Vì nhà Thảo khó khăn, nhiều hôm Thảo đi học mà bụng đói", explain: "Bố mẹ Thảo “đau ốm luôn, nhiều hôm đi học mà bụng đói”." },
      { q: "Mỗi sáng thứ Hai, các bạn góp gì vào hũ?", options: ["Một nắm gạo nhỏ", "Một bao gạo lớn", "Một ít tiền", "Một quyển vở"], answer: "Một nắm gạo nhỏ", explain: "“các bạn học sinh lại mang theo một nắm gạo nhỏ”." },
      { q: "Sau khi được giúp đỡ, Thảo đã thay đổi thế nào?", options: ["Đi học đều đặn hơn và nhận làm “người giữ hũ”", "Chuyển sang học trường khác", "Nghỉ học để ở nhà", "Đi xin gạo các nhà trong xóm"], answer: "Đi học đều đặn hơn và nhận làm “người giữ hũ”", explain: "“Giờ đây, Thảo đã đi học đều đặn hơn.” Em còn nhận làm “người giữ hũ”." },
      { q: "Câu tục ngữ nào trong bài nói lên ý nghĩa của câu chuyện?", options: ["Lá lành đùm lá rách", "Có công mài sắt, có ngày nên kim", "Uống nước nhớ nguồn", "Ăn quả nhớ kẻ trồng cây"], answer: "Lá lành đùm lá rách", explain: "Bài viết: “mỗi người góp một chút, lá lành đùm lá rách”." },
    ],
    ltvc: { q: "Chủ ngữ của câu “Mẹ Thảo cầm túi gạo, rơm rớm nước mắt cảm ơn.” là bộ phận nào?", options: ["Mẹ Thảo", "túi gạo", "cầm túi gạo", "nước mắt"], answer: "Mẹ Thảo", explain: "Bộ phận trả lời câu hỏi “Ai?” là chủ ngữ; phần còn lại là vị ngữ." },
    open: { q: "Ở trường hoặc nơi em sống có hoạt động nào giúp đỡ người gặp khó khăn? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được một hoạt động cụ thể. VD: “Trường em có phong trào quyên góp sách vở cho các bạn vùng lũ.”" },
  }),
  P({
    id: "banh-chung-ngay-tet", kinds: ["giua-hk2"], title: "Bánh chưng ngày Tết",
    text: `Chiều hai mươi tám Tết, cả nhà em quây quần ở sân để gói bánh chưng. Ông nội ngồi giữa, trước mặt là chiếc mâm gỗ bày đủ lá dong xanh, gạo nếp trắng ngần, đậu xanh vàng óng và những thớ thịt lợn tươi hồng.

Ông vừa gói vừa kể cho chúng em nghe sự tích bánh chưng, bánh giầy. Ngày xưa, Lang Liêu là người nghèo nhất trong các hoàng tử, không có của ngon vật lạ dâng vua cha. Chàng lấy gạo nếp, thứ hạt quý mà người nông dân làm ra, gói thành bánh vuông tượng trưng cho đất. Vua cha khen bánh ngon, lại có ý nghĩa sâu xa, nên truyền ngôi cho chàng.

Ông dạy em cách xếp lá, đổ gạo, rải đậu, đặt thịt rồi gấp mép cho vuông vức. Chiếc bánh đầu tay của em méo xệch, ai nhìn cũng bật cười. Ông lại ân cần chỉ cho em gói lại.

Đêm ấy, nồi bánh sôi lục bục trên bếp lửa hồng. Cả nhà ngồi canh bánh, chuyện trò rôm rả. Ông bảo: “Gói bánh chưng là để nhớ ơn tổ tiên, nhớ ơn những người làm ra hạt gạo.” Em nhìn ngọn lửa bập bùng và thấy cái Tết năm nay thật ấm áp.`,
    questions: [
      { q: "Gia đình bạn nhỏ gói bánh chưng vào lúc nào?", options: ["Chiều hai mươi tám Tết", "Sáng mùng một Tết", "Tối giao thừa", "Rằm tháng Giêng"], answer: "Chiều hai mươi tám Tết", explain: "“Chiều hai mươi tám Tết, cả nhà em quây quần ở sân để gói bánh chưng.”" },
      { q: "Nguyên liệu gói bánh chưng trong bài gồm những gì?", options: ["Lá dong, gạo nếp, đậu xanh, thịt lợn", "Lá chuối, bột mì, đường, trứng", "Lá sen, gạo tẻ, vừng, lạc", "Lá dong, bột sắn, dừa, chuối"], answer: "Lá dong, gạo nếp, đậu xanh, thịt lợn", explain: "Mâm gỗ bày “lá dong xanh, gạo nếp trắng ngần, đậu xanh vàng óng” và thịt lợn." },
      { q: "Theo sự tích, Lang Liêu gói bánh hình vuông để tượng trưng cho gì?", options: ["Đất", "Trời", "Mặt trời", "Biển cả"], answer: "Đất", explain: "Chàng “gói thành bánh vuông tượng trưng cho đất”." },
      { q: "Vì sao vua cha truyền ngôi cho Lang Liêu?", options: ["Vì bánh ngon và có ý nghĩa sâu xa", "Vì Lang Liêu là con cả", "Vì Lang Liêu dâng nhiều vàng bạc", "Vì Lang Liêu giỏi võ nhất"], answer: "Vì bánh ngon và có ý nghĩa sâu xa", explain: "“Vua cha khen bánh ngon, lại có ý nghĩa sâu xa, nên truyền ngôi cho chàng.”" },
      { q: "Chiếc bánh đầu tiên bạn nhỏ gói như thế nào?", options: ["Méo xệch, ai nhìn cũng bật cười", "Vuông vức, rất đẹp", "Bị rách hết lá", "To nhất trong nồi"], answer: "Méo xệch, ai nhìn cũng bật cười", explain: "“Chiếc bánh đầu tay của em méo xệch, ai nhìn cũng bật cười.”" },
      { q: "Theo ông, gói bánh chưng ngày Tết để làm gì?", options: ["Để nhớ ơn tổ tiên và những người làm ra hạt gạo", "Để mang ra chợ bán", "Để thi xem ai gói nhanh nhất", "Để ăn thay cơm cả tháng"], answer: "Để nhớ ơn tổ tiên và những người làm ra hạt gạo", explain: "Ông bảo: “Gói bánh chưng là để nhớ ơn tổ tiên, nhớ ơn những người làm ra hạt gạo.”" },
    ],
    ltvc: { q: "Trạng ngữ trong câu “Đêm ấy, nồi bánh sôi lục bục trên bếp lửa hồng.” là bộ phận nào?", options: ["Đêm ấy", "nồi bánh", "sôi lục bục", "lửa hồng"], answer: "Đêm ấy", explain: "“Đêm ấy” đứng đầu câu, ngăn cách bằng dấu phẩy, cho biết thời gian — đó là trạng ngữ." },
    open: { q: "Gia đình em thường làm gì để chuẩn bị đón Tết? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể. VD: “Nhà em dọn dẹp nhà cửa, cắm hoa đào và cùng nhau gói bánh chưng.”" },
  }),

  /* ═════════════ CUỐI HỌC KÌ II ═════════════ */
  P({
    id: "dong-song-tuoi-tho", kinds: ["cuoi-hk2"], title: "Dòng sông tuổi thơ",
    text: `Quê tôi có một dòng sông nhỏ chảy vòng quanh làng. Dòng sông hiền hòa ấy đã gắn bó với tuổi thơ của tôi.

Buổi sáng, mặt sông phủ một lớp sương mỏng. Khi mặt trời lên, nước sông lấp lánh như dát bạc. Hai bên bờ, những rặng tre xanh rì nghiêng mình soi bóng. Thỉnh thoảng, một chiếc thuyền chở đầy rau quả lướt nhẹ trên mặt nước, để lại phía sau những gợn sóng lăn tăn.

Mùa hè, sông là chỗ vui chơi của lũ trẻ chúng tôi. Chúng tôi rủ nhau tắm sông, thi bơi, té nước vào nhau cười như nắc nẻ. Bố tôi bao giờ cũng đi cùng để trông chừng, vì sông có những đoạn nước sâu. Chiều chiều, chúng tôi ngồi trên bờ đê thả diều, ngắm đàn cò trắng bay về tổ.

Bây giờ, tôi đã lên thành phố học. Thành phố có những tòa nhà cao, những con đường rộng, nhưng không có dòng sông của tôi. Mỗi lần nhớ quê, tôi lại nhắm mắt và nghe như có tiếng sóng vỗ vào bờ. Đó là âm thanh dịu dàng, thân thương mà tôi sẽ mang theo suốt cuộc đời.`,
    questions: [
      { q: "Dòng sông trong bài chảy ở đâu?", options: ["Vòng quanh làng", "Giữa thành phố", "Dưới chân núi", "Qua sân trường"], answer: "Vòng quanh làng", explain: "“Quê tôi có một dòng sông nhỏ chảy vòng quanh làng.”" },
      { q: "Khi mặt trời lên, nước sông được so sánh với gì?", options: ["Như dát bạc", "Như tấm gương vỡ", "Như dải lụa đào", "Như bầu trời đêm"], answer: "Như dát bạc", explain: "“nước sông lấp lánh như dát bạc”." },
      { q: "Hai bên bờ sông có gì?", options: ["Những rặng tre xanh rì", "Những hàng phi lao", "Những tòa nhà cao tầng", "Những cánh đồng hoa hướng dương"], answer: "Những rặng tre xanh rì", explain: "“những rặng tre xanh rì nghiêng mình soi bóng”." },
      { q: "Vì sao bố luôn đi cùng khi các bạn nhỏ tắm sông?", options: ["Vì sông có những đoạn nước sâu", "Vì bố thích bơi", "Vì bố muốn bắt cá", "Vì các bạn chưa biết đường"], answer: "Vì sông có những đoạn nước sâu", explain: "Bố đi cùng để trông chừng, “vì sông có những đoạn nước sâu”." },
      { q: "Buổi chiều, các bạn nhỏ thường làm gì trên bờ đê?", options: ["Thả diều, ngắm đàn cò bay về tổ", "Chăn trâu, cắt cỏ", "Câu cá, bắt ốc", "Đá bóng, đá cầu"], answer: "Thả diều, ngắm đàn cò bay về tổ", explain: "“chúng tôi ngồi trên bờ đê thả diều, ngắm đàn cò trắng bay về tổ”." },
      { q: "Tình cảm của tác giả với dòng sông quê như thế nào?", options: ["Gắn bó, yêu thương và luôn nhớ về dòng sông", "Sợ hãi vì sông có chỗ sâu", "Không còn nhớ gì về dòng sông", "Thích thành phố hơn dòng sông"], answer: "Gắn bó, yêu thương và luôn nhớ về dòng sông", explain: "“Dòng sông hiền hòa ấy đã gắn bó với tuổi thơ của tôi.” Tiếng sóng là âm thanh tác giả “sẽ mang theo suốt cuộc đời”." },
    ],
    ltvc: { q: "Trạng ngữ trong câu “Chiều chiều, chúng tôi ngồi trên bờ đê thả diều, ngắm đàn cò trắng bay về tổ.” cho biết điều gì?", options: ["Thời gian", "Nơi chốn", "Nguyên nhân", "Mục đích"], answer: "Thời gian", explain: "“Chiều chiều” cho biết sự việc diễn ra khi nào — trạng ngữ chỉ thời gian." },
    open: { q: "Viết 1–2 câu về một cảnh đẹp ở quê hương em (hoặc nơi em sống).", hint: "Câu đúng ngữ pháp, có hình ảnh cụ thể; khuyến khích dùng so sánh hoặc nhân hoá. VD: “Cánh đồng lúa quê em chín vàng như một tấm thảm khổng lồ.”" },
  }),
  P({
    id: "nguoi-ban-moi", kinds: ["cuoi-hk2"], title: "Người bạn mới",
    text: `Đầu năm học, lớp 4C đón một bạn mới tên là Mỷ. Mỷ là người dân tộc Mông, theo bố mẹ từ bản xa xuống thị trấn sinh sống. Bạn mặc chiếc váy xòe thêu hoa văn sặc sỡ, nói tiếng phổ thông còn chưa sõi.

Mấy ngày đầu, Mỷ chỉ ngồi lặng lẽ ở góc lớp. Giờ ra chơi, bạn đứng một mình bên gốc phượng. Có bạn tò mò trêu cách nói của Mỷ. Mỷ cúi mặt, đôi mắt đỏ hoe.

Lớp trưởng Hà thấy vậy liền đến bên Mỷ, rủ bạn chơi nhảy dây. Hà còn đề nghị mỗi ngày cả lớp giúp Mỷ luyện đọc một bài, còn Mỷ dạy lại các bạn một câu hát của quê mình. Các bạn thích thú lắm. Chẳng bao lâu, cả lớp đã hát được một bài hát ru của người Mông.

Cuối học kì, trong buổi văn nghệ của trường, Mỷ cùng các bạn lớp 4C biểu diễn một điệu múa của dân tộc Mông. Mỷ mặc chiếc váy xòe thêu hoa, xoay tròn giữa sân khấu, nụ cười rạng rỡ. Cả trường vỗ tay vang dội. Bạn từng trêu Mỷ ngày nào chạy lên tặng Mỷ một bông hoa và nói lời xin lỗi.

Mỷ nắm tay bạn, cười hiền. Từ đó, lớp 4C có thêm một người bạn thân, và ai cũng hiểu rằng mỗi dân tộc có một vẻ đẹp riêng đáng trân trọng.`,
    questions: [
      { q: "Bạn mới của lớp 4C là người dân tộc nào?", options: ["Dân tộc Mông", "Dân tộc Tày", "Dân tộc Ê-đê", "Dân tộc Khmer"], answer: "Dân tộc Mông", explain: "“Mỷ là người dân tộc Mông”." },
      { q: "Những ngày đầu đến lớp, Mỷ như thế nào?", options: ["Ngồi lặng lẽ ở góc lớp, ra chơi đứng một mình", "Nói cười vui vẻ với mọi người", "Hay trêu chọc các bạn", "Xin chuyển sang lớp khác"], answer: "Ngồi lặng lẽ ở góc lớp, ra chơi đứng một mình", explain: "“Mỷ chỉ ngồi lặng lẽ ở góc lớp. Giờ ra chơi, bạn đứng một mình bên gốc phượng.”" },
      { q: "Lớp trưởng Hà đã làm gì để giúp Mỷ?", options: ["Rủ Mỷ chơi nhảy dây và đề nghị cả lớp giúp Mỷ luyện đọc", "Mách cô giáo phạt bạn trêu Mỷ", "Tặng Mỷ một chiếc váy mới", "Đưa Mỷ về tận nhà"], answer: "Rủ Mỷ chơi nhảy dây và đề nghị cả lớp giúp Mỷ luyện đọc", explain: "Hà “rủ bạn chơi nhảy dây” và đề nghị “cả lớp giúp Mỷ luyện đọc một bài”." },
      { q: "Mỷ đã dạy lại các bạn điều gì?", options: ["Một câu hát của quê mình", "Cách thêu hoa văn", "Cách nấu món ăn vùng cao", "Cách chơi nhảy dây"], answer: "Một câu hát của quê mình", explain: "“Mỷ dạy lại các bạn một câu hát của quê mình”." },
      { q: "Trong buổi văn nghệ, bạn từng trêu Mỷ đã làm gì?", options: ["Lên tặng Mỷ một bông hoa và nói lời xin lỗi", "Bỏ về nhà trước", "Tiếp tục trêu Mỷ", "Ngồi im không vỗ tay"], answer: "Lên tặng Mỷ một bông hoa và nói lời xin lỗi", explain: "Bạn ấy “chạy lên tặng Mỷ một bông hoa và nói lời xin lỗi”." },
      { q: "Câu chuyện muốn nói với em điều gì?", options: ["Cần đoàn kết, tôn trọng bạn bè thuộc mọi dân tộc", "Không nên chơi với bạn mới", "Chỉ nên chơi với bạn cùng xóm", "Học sinh không nên tham gia văn nghệ"], answer: "Cần đoàn kết, tôn trọng bạn bè thuộc mọi dân tộc", explain: "Ai cũng hiểu “mỗi dân tộc có một vẻ đẹp riêng đáng trân trọng”." },
    ],
    ltvc: { q: "Vị ngữ của câu “Cả trường vỗ tay vang dội.” là bộ phận nào?", options: ["vỗ tay vang dội", "Cả trường", "vang dội", "Cả trường vỗ tay"], answer: "vỗ tay vang dội", explain: "“Cả trường” là chủ ngữ (trả lời câu hỏi Ai?); “vỗ tay vang dội” là vị ngữ (trả lời câu hỏi Làm gì?)." },
    open: { q: "Nếu có một bạn mới chuyển đến lớp em, em sẽ làm gì để giúp bạn? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể, thể hiện sự thân thiện. VD: “Em sẽ rủ bạn chơi cùng và giới thiệu bạn với cả lớp.”" },
  }),
];

/* ═════════════ Ngân hàng luyện từ và câu lớp 4 (câu 8, câu 9 — 1 điểm/câu) ═════════════ */

const LTVC_BANK: Record<string, ReturnType<typeof M>[]> = {
  "danh-tu": [
    M("Dòng nào dưới đây gồm toàn danh từ?", "bàn, ghế, cây bút", ["chạy, nhảy, hát", "xanh, đỏ, tím", "đẹp, cao, nhanh"], "“bàn”, “ghế”, “cây bút” đều chỉ sự vật nên là danh từ."),
    M("Từ nào dưới đây là danh từ riêng?", "Hà Nội", ["thành phố", "dòng sông", "ngọn núi"], "“Hà Nội” là tên riêng của một địa danh, được viết hoa — đó là danh từ riêng."),
    M("Từ nào dưới đây là danh từ chỉ hiện tượng tự nhiên?", "mưa", ["bàn", "học sinh", "chạy"], "“mưa” là hiện tượng tự nhiên; “bàn” chỉ đồ vật, “học sinh” chỉ người, “chạy” là động từ."),
    M("Từ nào dưới đây là danh từ chung?", "học sinh", ["Lan", "Việt Nam", "Nguyễn Trãi"], "“học sinh” là tên chung của một loại người; ba từ còn lại là tên riêng."),
    M("Tên người nào dưới đây được viết đúng chính tả?", "Trần Quốc Toản", ["Trần quốc Toản", "trần Quốc Toản", "Trần Quốc toản"], "Tên người Việt Nam viết hoa chữ cái đầu của mỗi tiếng."),
  ],
  "dong-tu": [
    M("Dòng nào dưới đây gồm toàn động từ?", "đọc, viết, chạy", ["sách, vở, bút", "vui, buồn, đẹp", "cao, thấp, xa"], "“đọc”, “viết”, “chạy” đều chỉ hoạt động nên là động từ."),
    M("Từ nào là động từ trong câu “Chú mèo nằm sưởi nắng bên hiên.”?", "nằm", ["chú mèo", "hiên", "nắng"], "“nằm” chỉ trạng thái, hoạt động của chú mèo nên là động từ."),
    M("Trong câu “Em đang làm bài tập.”, từ nào bổ sung ý nghĩa thời gian cho động từ “làm”?", "đang", ["em", "bài tập", "làm"], "“đang” cho biết hoạt động “làm” đang diễn ra."),
    M("Động từ nào thích hợp điền vào chỗ trống: “Các bạn học sinh … cây ở vườn trường.”?", "trồng", ["xanh", "đất", "vườn"], "Chỗ trống cần một từ chỉ hoạt động: “trồng cây”."),
    M("Từ nào dưới đây KHÔNG phải là động từ?", "xinh đẹp", ["nhảy", "hát", "bơi"], "“xinh đẹp” chỉ đặc điểm nên là tính từ; “nhảy”, “hát”, “bơi” là động từ."),
  ],
  "tinh-tu": [
    M("Dòng nào dưới đây gồm toàn tính từ?", "xanh, cao, ngọt", ["bàn, ghế, tủ", "ăn, uống, ngủ", "mẹ, cô, bà"], "“xanh”, “cao”, “ngọt” đều chỉ đặc điểm nên là tính từ."),
    M("Từ nào là tính từ trong câu “Dòng suối chảy qua bản, nước trong vắt.”?", "trong vắt", ["dòng suối", "chảy", "bản"], "“trong vắt” chỉ đặc điểm của nước nên là tính từ."),
    M("Từ nào dưới đây chỉ mức độ cao nhất của màu đỏ?", "đỏ rực", ["đo đỏ", "hơi đỏ", "đỏ nhạt"], "“đo đỏ”, “hơi đỏ”, “đỏ nhạt” chỉ mức độ thấp; “đỏ rực” chỉ mức độ rất cao."),
    M("Tính từ nào thích hợp điền vào chỗ trống: “Bầu trời mùa thu … và cao vời vợi.”?", "trong xanh", ["bay lượn", "đám mây", "mặt trời"], "Chỗ trống cần một từ chỉ đặc điểm của bầu trời: “trong xanh”."),
    M("Từ nào trái nghĩa với tính từ “chăm chỉ”?", "lười biếng", ["cần cù", "siêng năng", "chịu khó"], "“cần cù”, “siêng năng”, “chịu khó” gần nghĩa với “chăm chỉ”; “lười biếng” trái nghĩa."),
  ],
  "nhan-hoa": [
    M("Câu nào dưới đây có sử dụng biện pháp nhân hoá?", "Chị gió dịu dàng ru những tán lá ngủ say.", ["Gió thổi mạnh làm cây đổ.", "Hôm nay trời có gió.", "Gió mùa đông bắc tràn về."], "Gió được gọi là “chị” và có hoạt động “ru … ngủ say” như người."),
    M("Trong câu “Ông mặt trời vươn vai thức dậy sau rặng tre.”, sự vật nào được nhân hoá?", "mặt trời", ["rặng tre", "vai", "bầu trời"], "Mặt trời được gọi là “ông” và “vươn vai thức dậy” như người."),
    M("Trong câu “Những chú chim sẻ trò chuyện ríu rít trên cành.”, những từ nào cho thấy chim sẻ được nhân hoá?", "chú, trò chuyện", ["chim sẻ, cành", "ríu rít, trên", "những, cành"], "Chim sẻ được gọi bằng “chú” như gọi người và có hoạt động “trò chuyện” của người."),
    M("Câu nào nhân hoá bằng cách nói với sự vật như nói với người?", "Trăng ơi, trăng từ đâu đến?", ["Trăng tròn như quả bóng.", "Đêm nay trăng rất sáng.", "Trăng chiếu xuống sân nhà."], "Gọi “Trăng ơi” và hỏi trăng như hỏi một người bạn."),
    M("Biện pháp nhân hoá trong câu “Cây bàng già đứng lặng lẽ, che mát cho chúng em.” có tác dụng gì?", "Làm cây bàng trở nên gần gũi như một con người", ["Cho biết cây bàng rất cao", "Cho biết cây bàng có nhiều lá", "Cho biết cây bàng sắp bị chặt"], "Cây bàng “đứng lặng lẽ, che mát” như một người bạn, nên trở nên gần gũi."),
  ],
  "chu-vi": [
    M("Chủ ngữ của câu “Đàn gà con chạy theo mẹ kiếm mồi.” là bộ phận nào?", "Đàn gà con", ["chạy theo mẹ", "mẹ", "kiếm mồi"], "“Đàn gà con” trả lời câu hỏi “Con gì?” — đó là chủ ngữ."),
    M("Vị ngữ của câu “Bạn Lan là lớp trưởng lớp em.” là bộ phận nào?", "là lớp trưởng lớp em", ["Bạn Lan", "lớp em", "lớp trưởng"], "“là lớp trưởng lớp em” trả lời câu hỏi “Là gì?” — đó là vị ngữ."),
    M("Chủ ngữ của câu “Mùa xuân, cây cối đâm chồi nảy lộc.” là bộ phận nào?", "cây cối", ["Mùa xuân", "đâm chồi nảy lộc", "nảy lộc"], "“Mùa xuân” là trạng ngữ; “cây cối” là chủ ngữ; “đâm chồi nảy lộc” là vị ngữ."),
    M("Chủ ngữ trong câu thường trả lời cho câu hỏi nào?", "Ai? Cái gì? Con gì?", ["Làm gì? Thế nào?", "Khi nào?", "Ở đâu?"], "Chủ ngữ nêu người, vật được nói đến, trả lời câu hỏi “Ai? Cái gì? Con gì?”."),
    M("Vị ngữ của câu “Những bông hoa cúc vàng rực trong nắng sớm.” là bộ phận nào?", "vàng rực trong nắng sớm", ["Những bông hoa cúc", "hoa cúc", "nắng sớm"], "“vàng rực trong nắng sớm” trả lời câu hỏi “Thế nào?” — đó là vị ngữ."),
  ],
  "trang-ngu": [
    M("Trạng ngữ trong câu “Sáng sớm, bà em ra vườn tưới rau.” là bộ phận nào?", "Sáng sớm", ["bà em", "ra vườn", "tưới rau"], "“Sáng sớm” đứng đầu câu, cho biết thời gian — đó là trạng ngữ."),
    M("Trạng ngữ trong câu “Nhờ chăm chỉ học tập, Nam đã đạt danh hiệu học sinh giỏi.” cho biết điều gì?", "Nguyên nhân", ["Thời gian", "Nơi chốn", "Phương tiện"], "“Nhờ chăm chỉ học tập” cho biết vì sao Nam đạt danh hiệu — trạng ngữ chỉ nguyên nhân."),
    M("Trạng ngữ trong câu “Để có sức khỏe tốt, em tập thể dục mỗi sáng.” cho biết điều gì?", "Mục đích", ["Thời gian", "Nơi chốn", "Nguyên nhân"], "“Để có sức khỏe tốt” cho biết em tập thể dục để làm gì — trạng ngữ chỉ mục đích."),
    M("Trạng ngữ trong câu “Bằng đôi tay khéo léo, mẹ đã khâu cho em chiếc áo mới.” cho biết điều gì?", "Phương tiện", ["Thời gian", "Nơi chốn", "Mục đích"], "“Bằng đôi tay khéo léo” cho biết mẹ khâu áo bằng gì — trạng ngữ chỉ phương tiện."),
    M("Trạng ngữ trong câu “Trên cành cây, mấy chú chim đang hót líu lo.” cho biết điều gì?", "Nơi chốn", ["Thời gian", "Nguyên nhân", "Mục đích"], "“Trên cành cây” cho biết chim hót ở đâu — trạng ngữ chỉ nơi chốn."),
    M("Trạng ngữ nào thích hợp điền vào chỗ trống: “…, chúng em được nghỉ học ở nhà.”?", "Vì trời mưa bão", ["Ở trên cành cây", "Bằng chiếc bút chì", "Để học thật giỏi"], "Chỉ “Vì trời mưa bão” nêu được nguyên nhân hợp lí của việc nghỉ học."),
  ],
  "dau-cau": [
    M("Dấu gạch ngang ở đầu dòng “– Cháu chào bà ạ!” dùng để làm gì?", "Đánh dấu lời nói trực tiếp của nhân vật", ["Đánh dấu phần chú thích", "Nối các từ trong một liên danh", "Kết thúc câu"], "Dấu gạch ngang đặt ở đầu dòng để đánh dấu lời nói của nhân vật."),
    M("Trong câu: Cả lớp gọi Hùng là “nhà thơ nhí”. Dấu ngoặc kép dùng để làm gì?", "Đánh dấu từ ngữ được dùng với ý nghĩa đặc biệt", ["Đánh dấu lời nói của nhân vật", "Đánh dấu phần chú thích", "Ngăn cách các bộ phận cùng chức vụ"], "“nhà thơ nhí” là cách gọi vui, dùng với ý nghĩa đặc biệt nên đặt trong ngoặc kép."),
    M("Trong câu: Vịnh Hạ Long (Quảng Ninh) thu hút rất nhiều du khách. Dấu ngoặc đơn dùng để làm gì?", "Đánh dấu phần chú thích", ["Đánh dấu lời nói trực tiếp", "Kết thúc câu hỏi", "Ngăn cách trạng ngữ với chủ ngữ"], "Phần trong ngoặc đơn chú thích vịnh Hạ Long ở tỉnh nào."),
    M("Dấu phẩy trong câu “Sáng nay, em đi học sớm.” dùng để làm gì?", "Ngăn cách trạng ngữ với chủ ngữ và vị ngữ", ["Ngăn cách các từ cùng làm vị ngữ", "Đánh dấu lời nói trực tiếp", "Kết thúc câu"], "“Sáng nay” là trạng ngữ, dấu phẩy ngăn cách nó với phần còn lại của câu."),
    M("Câu nào dùng dấu gạch ngang để nối các từ trong một liên danh?", "Chuyến tàu Hà Nội – Hải Phòng khởi hành lúc 6 giờ.", ["Chuyến tàu Hà Nội, Hải Phòng khởi hành lúc 6 giờ.", "Chuyến tàu Hà Nội (Hải Phòng) khởi hành lúc 6 giờ.", "Chuyến tàu Hà Nội: Hải Phòng khởi hành lúc 6 giờ."], "Dấu gạch ngang nối hai địa danh là điểm đầu và điểm cuối của chuyến tàu."),
  ],
};

const LTVC_TOPIC_NAMES: Record<string, string> = {
  "danh-tu": "danh từ", "dong-tu": "động từ", "tinh-tu": "tính từ", "nhan-hoa": "biện pháp nhân hoá",
  "chu-vi": "chủ ngữ, vị ngữ", "trang-ngu": "trạng ngữ", "dau-cau": "dấu gạch ngang, dấu ngoặc kép, dấu ngoặc đơn",
};

/* ═════════════ Kiểm tra viết (tập làm văn lớp 4) ═════════════ */

const WRITING_PROMPTS: TvContent["writing"] = {
  "giua-hk1": [
    "Viết bài văn kể lại một câu chuyện em đã đọc hoặc đã nghe về lòng dũng cảm hoặc lòng trung thực.",
    "Viết đoạn văn (khoảng 6–8 câu) nêu ý kiến của em về một câu chuyện em đã đọc, trong đó nói rõ vì sao em thích câu chuyện ấy.",
    "Viết đoạn văn (khoảng 6–8 câu) tưởng tượng chiếc cặp sách của em biết nói và kể lại một ngày đi học cùng nó.",
  ],
  "cuoi-hk1": [
    "Viết bài văn tả một con vật nuôi trong nhà mà em yêu thích.",
    "Viết bài văn kể lại một câu chuyện cổ tích mà em đã đọc hoặc đã nghe.",
    "Viết đoạn văn (khoảng 6–8 câu) nêu tình cảm, cảm xúc của em về một người thân trong gia đình.",
  ],
  "giua-hk2": [
    "Viết bài văn tả một cây bóng mát (hoặc một cây hoa, một cây ăn quả) mà em yêu thích.",
    "Viết đoạn văn (khoảng 6–8 câu) nêu tình cảm, cảm xúc của em về một nhân vật trong câu chuyện em đã đọc.",
    "Viết một bức thư gửi người bạn hoặc người thân ở xa để thăm hỏi và kể về việc học tập của em.",
  ],
  "cuoi-hk2": [
    "Viết bài văn tả một con vật mà em đã được quan sát (ở nhà, ở vườn thú hoặc trên ti vi).",
    "Viết bài văn tả một cây gắn bó với tuổi thơ của em.",
    "Viết đoạn văn (khoảng 6–8 câu) nêu lí do em thích một nhân vật trong câu chuyện em đã đọc hoặc đã nghe.",
    "Viết bài văn kể lại một câu chuyện về tình yêu quê hương, đất nước mà em đã đọc hoặc đã nghe.",
  ],
};

export const TV4: TvContent = {
  grade: 4, passages: PASSAGES, ltvcBank: LTVC_BANK, topicNames: LTVC_TOPIC_NAMES,
  ltvcByKind: {
    "giua-hk1": ["danh-tu", "dong-tu"],
    "cuoi-hk1": ["tinh-tu", "nhan-hoa"],
    "giua-hk2": ["chu-vi", "trang-ngu"],
    "cuoi-hk2": ["trang-ngu", "dau-cau"],
  },
  writing: WRITING_PROMPTS, words: [180, 320],
};
