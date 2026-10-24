// lib/exam5/tvContent3.ts
// Nội dung đề Tiếng Việt lớp 3 — VIẾT TAY, không sinh bằng máy, không chép sách giáo khoa:
// bài đọc do Ôn Tập Cùng Con tự soạn theo các chủ điểm của Tiếng Việt 3 (trải nghiệm, trường
// học, gia đình, cộng đồng, thiên nhiên, bài học cuộc sống, đất nước, Trái Đất).
// CẦN NGƯỜI DUYỆT trước khi coi là xong: máy chỉ soát được hình thức, không soát được ý.
//
// Quy tắc như ./tvContent.ts (scripts/exam5-check.ts kiểm tra phần máy kiểm được):
//   • Mỗi câu trắc nghiệm có đúng MỘT đáp án đúng; đáp án nhiễu phải sai rõ ràng.
//   • `answer` phải trùng nguyên văn một phần tử của `options`.
//   • Câu hỏi trích từ bài đọc thì phần trích phải có nguyên văn trong `text`.
//   • Dùng ngoặc kép cong “ ” trong nội dung, không dùng " thẳng.
//   • Phạm vi luyện từ và câu theo kì (lớp 3, theo thứ tự sách): giữa HK I từ chỉ sự vật,
//     hoạt động, đặc điểm; cuối HK I so sánh, kiểu câu (kể, hỏi, cảm, khiến); giữa HK II từ
//     có nghĩa giống / trái ngược, câu hỏi Khi nào? Ở đâu? Bằng gì?; cuối HK II kiểu câu, dấu
//     câu (hai chấm, gạch ngang, ngoặc kép).
//   • Bài đọc ngắn hơn lớp 4: 130–260 tiếng; câu hỏi ngắn, đáp án nhiễu dễ loại.

import { M, type TvContent, type TvPassage } from "./tvContent";

const P = (p: TvPassage) => p;

const PASSAGES: TvPassage[] = [
  /* ═════════════ GIỮA HỌC KÌ I ═════════════ */
  P({
    id: "chuyen-di-bien", kinds: ["giua-hk1"], title: "Chuyến đi biển",
    text: `Nghỉ hè, bố mẹ cho Minh về quê ngoại ở gần biển. Đây là lần đầu tiên Minh được nhìn thấy biển.

Sáng sớm, ông ngoại dắt Minh ra bãi cát. Biển rộng mênh mông, nước xanh biếc. Những con sóng trắng xóa nối nhau chạy vào bờ. Minh reo lên rồi chạy ào xuống nước. Sóng vỗ vào chân mát lạnh.

Ông dạy Minh nhặt vỏ sò. Có vỏ màu hồng, có vỏ màu trắng, có vỏ nhỏ xíu như hạt đậu. Minh nhặt đầy một túi, định mang về tặng các bạn trong lớp. Ông còn chỉ cho Minh những chiếc thuyền đánh cá đang trở về. Thuyền nào cũng đầy ắp tôm cá.

Buổi chiều, hai ông cháu ngồi trên bờ cát ngắm hoàng hôn. Mặt trời đỏ rực từ từ lặn xuống biển. Minh nắm tay ông và nói:

– Sang năm, cháu lại về với ông nhé!

Ông cười hiền, gật đầu.`,
    questions: [
      { q: "Nghỉ hè, Minh được về đâu?", options: ["Quê ngoại ở gần biển", "Quê nội ở trên núi", "Nhà bác ở thành phố", "Trại hè của trường"], answer: "Quê ngoại ở gần biển", explain: "“Nghỉ hè, bố mẹ cho Minh về quê ngoại ở gần biển.”" },
      { q: "Ai dắt Minh ra bãi cát?", options: ["Ông ngoại", "Bố của Minh", "Mẹ của Minh", "Bà ngoại"], answer: "Ông ngoại", explain: "“Sáng sớm, ông ngoại dắt Minh ra bãi cát.”" },
      { q: "Biển trong bài được tả như thế nào?", options: ["Rộng mênh mông, nước xanh biếc", "Nhỏ hẹp, nước đục ngầu", "Lặng im, không có sóng", "Toàn đá, không có cát"], answer: "Rộng mênh mông, nước xanh biếc", explain: "“Biển rộng mênh mông, nước xanh biếc.”" },
      { q: "Minh nhặt vỏ sò để làm gì?", options: ["Mang về tặng các bạn trong lớp", "Bán cho khách du lịch", "Làm đồ chơi cho em bé", "Trả lại cho biển"], answer: "Mang về tặng các bạn trong lớp", explain: "Minh “định mang về tặng các bạn trong lớp”." },
      { q: "Những chiếc thuyền đánh cá trở về như thế nào?", options: ["Đầy ắp tôm cá", "Trống không", "Bị hỏng buồm", "Chở đầy khách"], answer: "Đầy ắp tôm cá", explain: "“Thuyền nào cũng đầy ắp tôm cá.”" },
      { q: "Câu nói của Minh cuối bài cho thấy điều gì?", options: ["Minh rất thích chuyến đi và yêu quý ông", "Minh muốn về nhà ngay", "Minh sợ biển", "Minh không thích ông ngoại"], answer: "Minh rất thích chuyến đi và yêu quý ông", explain: "Minh nắm tay ông và nói: “Sang năm, cháu lại về với ông nhé!”" },
    ],
    ltvc: { q: "Trong câu “Minh reo lên rồi chạy ào xuống nước.”, từ nào chỉ hoạt động?", options: ["chạy", "Minh", "nước", "ào"], answer: "chạy", explain: "“chạy” chỉ việc Minh làm nên là từ chỉ hoạt động; “Minh”, “nước” chỉ sự vật." },
    open: { q: "Kì nghỉ hè vừa rồi, em đã làm được điều gì thú vị? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, kể được một việc cụ thể. VD: “Hè vừa rồi, em được về quê và học cách câu cá cùng ông.”" },
  }),
  P({
    id: "ngay-dau-den-truong", kinds: ["giua-hk1"], title: "Ngày đầu đến trường mới",
    text: `Năm nay, nhà Hoa chuyển đến một thị trấn nhỏ. Hoa phải học ở một ngôi trường mới. Sáng đầu tiên, Hoa đứng ở cổng trường, tay nắm chặt quai cặp. Em chẳng quen ai cả.

Cô giáo chủ nhiệm ra đón Hoa vào lớp. Cô có mái tóc dài và giọng nói ấm áp. Cô giới thiệu Hoa với cả lớp rồi xếp cho Hoa ngồi cạnh bạn Linh. Linh có đôi mắt tròn, lúc nào cũng tươi cười. Linh cho Hoa mượn cây bút màu và chỉ cho Hoa thư viện, phòng vẽ, sân bóng của trường.

Giờ ra chơi, Linh rủ Hoa chơi nhảy dây cùng các bạn. Tiếng cười giòn tan vang khắp sân trường. Hoa thấy lòng mình nhẹ nhõm hẳn.

Buổi chiều về nhà, Hoa kể cho mẹ nghe về cô giáo hiền và người bạn mới tốt bụng. Em nói:

– Mẹ ơi, con thích trường mới lắm!

Mẹ ôm Hoa vào lòng, mỉm cười.`,
    questions: [
      { q: "Vì sao Hoa phải học ở trường mới?", options: ["Vì nhà Hoa chuyển đến thị trấn khác", "Vì trường cũ bị hỏng", "Vì Hoa lên cấp hai", "Vì Hoa muốn học gần bà"], answer: "Vì nhà Hoa chuyển đến thị trấn khác", explain: "“Năm nay, nhà Hoa chuyển đến một thị trấn nhỏ.”" },
      { q: "Sáng đầu tiên đứng ở cổng trường, Hoa cảm thấy thế nào?", options: ["Lo lắng vì chẳng quen ai", "Rất vui vì gặp bạn cũ", "Buồn ngủ", "Tức giận"], answer: "Lo lắng vì chẳng quen ai", explain: "Hoa “tay nắm chặt quai cặp. Em chẳng quen ai cả.”" },
      { q: "Ai ra đón Hoa vào lớp?", options: ["Cô giáo chủ nhiệm", "Bác bảo vệ", "Bạn Linh", "Mẹ của Hoa"], answer: "Cô giáo chủ nhiệm", explain: "“Cô giáo chủ nhiệm ra đón Hoa vào lớp.”" },
      { q: "Bạn Linh đã giúp Hoa những gì?", options: ["Cho mượn bút màu, chỉ cho Hoa các phòng của trường", "Làm bài tập giúp Hoa", "Đưa Hoa về nhà", "Mua quà cho Hoa"], answer: "Cho mượn bút màu, chỉ cho Hoa các phòng của trường", explain: "“Linh cho Hoa mượn cây bút màu và chỉ cho Hoa thư viện, phòng vẽ, sân bóng của trường.”" },
      { q: "Giờ ra chơi, Hoa và các bạn chơi trò gì?", options: ["Nhảy dây", "Đá bóng", "Trốn tìm", "Đá cầu"], answer: "Nhảy dây", explain: "“Linh rủ Hoa chơi nhảy dây cùng các bạn.”" },
      { q: "Câu chuyện muốn nói điều gì?", options: ["Sự quan tâm của thầy cô, bạn bè giúp bạn mới thấy vui", "Không nên chuyển trường", "Chỉ nên chơi với bạn cũ", "Giờ ra chơi rất ồn ào"], answer: "Sự quan tâm của thầy cô, bạn bè giúp bạn mới thấy vui", explain: "Nhờ cô giáo và Linh, Hoa nói: “Mẹ ơi, con thích trường mới lắm!”" },
    ],
    ltvc: { q: "Trong câu “Linh có đôi mắt tròn, lúc nào cũng tươi cười.”, từ nào chỉ đặc điểm?", options: ["tròn", "Linh", "đôi mắt", "có"], answer: "tròn", explain: "“tròn” nói về hình dáng đôi mắt nên là từ chỉ đặc điểm." },
    open: { q: "Nếu lớp em có một bạn mới, em sẽ làm gì để giúp bạn? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể. VD: “Em sẽ rủ bạn chơi cùng và chỉ cho bạn thư viện của trường.”" },
  }),

  /* ═════════════ CUỐI HỌC KÌ I ═════════════ */
  P({
    id: "bua-com-chu-nhat", kinds: ["cuoi-hk1"], title: "Bữa cơm Chủ nhật",
    text: `Chủ nhật nào nhà em cũng có một bữa cơm thật vui. Từ sáng sớm, mẹ đã đi chợ mua rau, mua cá. Bố quét dọn sân nhà sạch sẽ. Còn em được giao nhiệm vụ nhặt rau và lau bàn ăn.

Ông em không nấu được nữa vì đôi tay đã run. Nhưng ông vẫn ngồi bên bếp, kể chuyện ngày xưa cho cả nhà nghe. Giọng ông trầm ấm như tiếng chuông chùa. Em vừa nhặt rau vừa nghe, quên cả thời gian.

Trưa đến, mâm cơm được dọn ra giữa nhà. Có canh rau ngót, cá kho và đĩa trứng rán vàng ươm. Bố gắp cho ông miếng cá ngon nhất. Mẹ múc cho em bát canh nóng. Em gắp cho bà một miếng trứng. Bà cười, đôi mắt hiền như hai vầng trăng khuyết.

Cả nhà vừa ăn vừa trò chuyện rôm rả. Bữa cơm đơn sơ nhưng ấm áp vô cùng. Em mong tuần nào cũng có ngày Chủ nhật như thế.`,
    questions: [
      { q: "Sáng Chủ nhật, mẹ làm gì?", options: ["Đi chợ mua rau, mua cá", "Quét dọn sân nhà", "Kể chuyện ngày xưa", "Đi làm ở cơ quan"], answer: "Đi chợ mua rau, mua cá", explain: "“Từ sáng sớm, mẹ đã đi chợ mua rau, mua cá.”" },
      { q: "Bạn nhỏ được giao nhiệm vụ gì?", options: ["Nhặt rau và lau bàn ăn", "Nấu canh", "Quét sân", "Đi chợ cùng mẹ"], answer: "Nhặt rau và lau bàn ăn", explain: "“Còn em được giao nhiệm vụ nhặt rau và lau bàn ăn.”" },
      { q: "Vì sao ông không nấu được nữa?", options: ["Vì đôi tay ông đã run", "Vì ông bận đi làm", "Vì ông không biết nấu", "Vì ông đang ngủ"], answer: "Vì đôi tay ông đã run", explain: "“Ông em không nấu được nữa vì đôi tay đã run.”" },
      { q: "Trong mâm cơm Chủ nhật có những món gì?", options: ["Canh rau ngót, cá kho, trứng rán", "Phở, bánh mì, xôi", "Gà luộc, nem rán, bánh chưng", "Bún chả, chè, hoa quả"], answer: "Canh rau ngót, cá kho, trứng rán", explain: "“Có canh rau ngót, cá kho và đĩa trứng rán vàng ươm.”" },
      { q: "Khi ăn cơm, mọi người trong nhà làm gì cho nhau?", options: ["Gắp thức ăn cho nhau", "Mỗi người ăn một nơi", "Vừa ăn vừa xem ti vi", "Không ai nói chuyện"], answer: "Gắp thức ăn cho nhau", explain: "Bố gắp cá cho ông, mẹ múc canh cho em, em “gắp cho bà một miếng trứng”." },
      { q: "Bài văn cho em biết điều gì?", options: ["Gia đình bạn nhỏ rất yêu thương nhau", "Cá kho là món ngon nhất", "Ông rất thích nấu ăn", "Ngày Chủ nhật rất mệt"], answer: "Gia đình bạn nhỏ rất yêu thương nhau", explain: "“Bữa cơm đơn sơ nhưng ấm áp vô cùng.”" },
    ],
    ltvc: { q: "Câu “Giọng ông trầm ấm như tiếng chuông chùa.” so sánh giọng ông với sự vật nào?", options: ["tiếng chuông chùa", "đôi tay", "vầng trăng khuyết", "bếp lửa"], answer: "tiếng chuông chùa", explain: "Từ so sánh “như” đặt “Giọng ông” cạnh “tiếng chuông chùa”." },
    open: { q: "Em thường làm gì để giúp đỡ người thân trong gia đình? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể. VD: “Em thường giúp mẹ nhặt rau và rửa bát sau bữa cơm.”" },
  }),
  P({
    id: "bac-hang-xom", kinds: ["cuoi-hk1"], title: "Bác Tư hàng xóm",
    text: `Cạnh nhà em có bác Tư sống một mình. Bác đã già, tóc bạc trắng như cước, lưng hơi còng. Con cháu bác đều đi làm ăn ở xa.

Mỗi sáng, bác Tư dậy rất sớm, quét sạch cả đoạn đường trước ngõ. Bác bảo: “Đường sạch thì các cháu đi học mới vui.” Ngày mưa, bác lấy cuốc khơi rãnh cho nước chảy, để đường không bị ngập.

Một hôm, bác Tư bị ốm, nằm mãi không dậy. Mẹ em nấu một nồi cháo nóng mang sang. Bố em đi mua thuốc. Chú Bình nhà bên cạnh sang quét sân, tưới cây giúp bác. Còn em và mấy bạn trong xóm thay nhau sang đọc truyện cho bác nghe.

Ít hôm sau, bác Tư khỏe lại. Sáng hôm ấy, em lại nghe tiếng chổi tre xào xạc ngoài ngõ. Em chạy ra, thấy bác đang cười với cả xóm. Bác nói:

– Có bà con lối xóm, tôi chẳng bao giờ thấy mình cô đơn.`,
    questions: [
      { q: "Bác Tư sống với ai?", options: ["Bác sống một mình", "Bác sống với con cháu", "Bác sống với gia đình em", "Bác sống với chú Bình"], answer: "Bác sống một mình", explain: "“Cạnh nhà em có bác Tư sống một mình.”" },
      { q: "Mỗi sáng, bác Tư làm việc gì?", options: ["Quét sạch đoạn đường trước ngõ", "Đi chợ bán rau", "Tập thể dục ở công viên", "Đưa các cháu đi học"], answer: "Quét sạch đoạn đường trước ngõ", explain: "Bác “quét sạch cả đoạn đường trước ngõ”." },
      { q: "Ngày mưa, bác Tư khơi rãnh để làm gì?", options: ["Để đường không bị ngập", "Để bắt cá", "Để trồng rau", "Để chơi với các cháu"], answer: "Để đường không bị ngập", explain: "Bác khơi rãnh cho nước chảy, “để đường không bị ngập”." },
      { q: "Khi bác Tư bị ốm, mẹ của bạn nhỏ đã làm gì?", options: ["Nấu cháo nóng mang sang", "Đi mua thuốc", "Quét sân giúp bác", "Đọc truyện cho bác nghe"], answer: "Nấu cháo nóng mang sang", explain: "“Mẹ em nấu một nồi cháo nóng mang sang.”" },
      { q: "Bạn nhỏ và các bạn trong xóm đã giúp bác Tư bằng cách nào?", options: ["Thay nhau sang đọc truyện cho bác nghe", "Nấu cơm cho bác", "Đưa bác đi bệnh viện", "Gọi điện cho con cháu bác"], answer: "Thay nhau sang đọc truyện cho bác nghe", explain: "“em và mấy bạn trong xóm thay nhau sang đọc truyện cho bác nghe”." },
      { q: "Câu chuyện muốn nói điều gì?", options: ["Hàng xóm biết quan tâm, giúp đỡ nhau", "Người già nên sống một mình", "Trời mưa đường rất bẩn", "Quét đường là việc rất mệt"], answer: "Hàng xóm biết quan tâm, giúp đỡ nhau", explain: "Bác Tư nói: “Có bà con lối xóm, tôi chẳng bao giờ thấy mình cô đơn.”" },
    ],
    ltvc: { q: "Câu “Có bà con lối xóm, tôi chẳng bao giờ thấy mình cô đơn.” thuộc kiểu câu nào?", options: ["Câu kể", "Câu hỏi", "Câu cảm", "Câu khiến"], answer: "Câu kể", explain: "Câu dùng để nêu suy nghĩ, kết thúc bằng dấu chấm, không có từ hỏi, từ cảm hay từ khiến — đó là câu kể." },
    open: { q: "Em có thể làm gì để giúp đỡ hàng xóm của mình? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể. VD: “Em có thể giúp bà hàng xóm xách đồ khi bà đi chợ về.”" },
  }),

  /* ═════════════ GIỮA HỌC KÌ II ═════════════ */
  P({
    id: "con-mua-dau-mua", kinds: ["giua-hk2"], title: "Cơn mưa đầu mùa",
    text: `Mấy tuần liền trời nắng gắt. Đồng ruộng nứt nẻ, cây cối héo rũ. Lũ gà nằm im dưới gốc cây, há mỏ thở.

Một buổi chiều, bầu trời bỗng tối sầm lại. Gió thổi mạnh, những đám mây đen kéo đến ùn ùn. Rồi một tia chớp sáng lóe, tiếng sấm ầm ầm vang lên. Mưa bắt đầu rơi. Lúc đầu chỉ lộp độp vài hạt, sau mỗi lúc một nặng hạt hơn.

Mưa rơi xuống mái nhà, xuống sân, xuống những vạt cỏ khô. Cây cối như reo lên vui mừng. Những chiếc lá vẫy vẫy như đang uống nước. Đàn ếch dưới ao kêu ồm ộp. Lũ trẻ trong xóm đội nón chạy ra sân, tắm mưa, cười vang.

Mưa tạnh. Bầu trời trong xanh trở lại. Ngoài đồng, mặt ruộng đã ngập nước. Bố vác cày ra đồng, vui vẻ nói:

– Mưa thế này thì vụ lúa năm nay tốt lắm đây!`,
    questions: [
      { q: "Trước khi có mưa, cảnh vật như thế nào?", options: ["Đồng ruộng nứt nẻ, cây cối héo rũ", "Cây cối xanh tốt", "Ao hồ đầy nước", "Trời mát mẻ"], answer: "Đồng ruộng nứt nẻ, cây cối héo rũ", explain: "“Đồng ruộng nứt nẻ, cây cối héo rũ.”" },
      { q: "Trước cơn mưa, bầu trời thay đổi thế nào?", options: ["Tối sầm lại, mây đen kéo đến", "Có cầu vồng bảy sắc", "Trong xanh, nhiều nắng", "Đầy sao lấp lánh"], answer: "Tối sầm lại, mây đen kéo đến", explain: "“bầu trời bỗng tối sầm lại” và “những đám mây đen kéo đến ùn ùn”." },
      { q: "Lúc mới bắt đầu, mưa rơi như thế nào?", options: ["Lộp độp vài hạt", "Rất to ngay từ đầu", "Rơi thành băng tuyết", "Chỉ có sương mù"], answer: "Lộp độp vài hạt", explain: "“Lúc đầu chỉ lộp độp vài hạt”." },
      { q: "Khi trời mưa, đàn ếch dưới ao làm gì?", options: ["Kêu ồm ộp", "Nằm im dưới gốc cây", "Bơi ra sông", "Trốn vào nhà"], answer: "Kêu ồm ộp", explain: "“Đàn ếch dưới ao kêu ồm ộp.”" },
      { q: "Sau cơn mưa, bố vác cày ra đồng và nói gì?", options: ["Vụ lúa năm nay sẽ tốt", "Ruộng bị ngập hết rồi", "Phải chờ thêm một tháng nữa", "Không nên ra đồng nữa"], answer: "Vụ lúa năm nay sẽ tốt", explain: "Bố nói: “Mưa thế này thì vụ lúa năm nay tốt lắm đây!”" },
      { q: "Bài văn nói về điều gì?", options: ["Cơn mưa mang lại niềm vui cho cây cối, con vật và con người", "Mưa làm hỏng mùa màng", "Trẻ em không nên tắm mưa", "Sấm sét rất đáng sợ"], answer: "Cơn mưa mang lại niềm vui cho cây cối, con vật và con người", explain: "“Cây cối như reo lên vui mừng”, lũ trẻ “cười vang”, bố “vui vẻ nói”." },
    ],
    ltvc: { q: "Trong câu “Những chiếc lá vẫy vẫy như đang uống nước.”, từ ngữ nào là từ so sánh?", options: ["như", "vẫy vẫy", "chiếc lá", "uống nước"], answer: "như", explain: "“như” nối hai vế được so sánh với nhau — đó là từ so sánh." },
    open: { q: "Em thích trời mưa hay trời nắng? Vì sao? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được lựa chọn và lí do. VD: “Em thích trời mưa vì mưa làm cây cối xanh tươi.”" },
  }),
  P({
    id: "chu-kien-cham-chi", kinds: ["giua-hk2"], title: "Chú kiến chăm chỉ",
    text: `Mùa hè, trên cánh đồng cỏ, chú kiến nhỏ suốt ngày tha từng hạt thóc về tổ. Hạt thóc to gấp mấy lần người kiến, nhưng kiến vẫn kiên nhẫn kéo đi.

Bác châu chấu thấy vậy liền cười:

– Trời đẹp thế này, sao cậu không nhảy múa, ca hát cho vui?

Kiến đáp:

– Tôi phải để dành thức ăn cho mùa đông. Bác cũng nên chuẩn bị đi thôi!

Châu chấu lắc đầu, lại nhảy tanh tách trên ngọn cỏ.

Rồi mùa đông đến. Gió lạnh thổi từng cơn, cỏ cây khô héo. Châu chấu đói lả, run rẩy tìm đến tổ kiến. Kiến mở cửa, mời châu chấu vào nhà và chia cho bác mấy hạt thóc.

Châu chấu xấu hổ nói:

– Cảm ơn cậu. Từ nay tôi sẽ chăm chỉ như cậu.

Kiến cười:

– Chúng ta cùng chuẩn bị cho mùa đông năm sau nhé!`,
    questions: [
      { q: "Mùa hè, chú kiến nhỏ làm gì?", options: ["Tha từng hạt thóc về tổ", "Nhảy múa trên ngọn cỏ", "Ngủ say trong tổ", "Đi chơi xa"], answer: "Tha từng hạt thóc về tổ", explain: "“chú kiến nhỏ suốt ngày tha từng hạt thóc về tổ”." },
      { q: "Vì sao kiến chăm chỉ tha thóc?", options: ["Để dành thức ăn cho mùa đông", "Để bán cho châu chấu", "Để chơi cho vui", "Để xây nhà mới"], answer: "Để dành thức ăn cho mùa đông", explain: "Kiến đáp: “Tôi phải để dành thức ăn cho mùa đông.”" },
      { q: "Mùa hè, châu chấu làm gì?", options: ["Nhảy múa, ca hát", "Tha thóc giúp kiến", "Đào tổ dưới đất", "Đi tìm thức ăn"], answer: "Nhảy múa, ca hát", explain: "Châu chấu không chuẩn bị, “lại nhảy tanh tách trên ngọn cỏ”." },
      { q: "Khi mùa đông đến, châu chấu như thế nào?", options: ["Đói lả, run rẩy", "No đủ, ấm áp", "Vui vẻ ca hát", "Đi ngủ đông"], answer: "Đói lả, run rẩy", explain: "“Châu chấu đói lả, run rẩy tìm đến tổ kiến.”" },
      { q: "Kiến đã đối xử với châu chấu ra sao?", options: ["Mời vào nhà và chia thóc cho châu chấu", "Đóng cửa không cho vào", "Chê cười châu chấu", "Bắt châu chấu làm việc"], answer: "Mời vào nhà và chia thóc cho châu chấu", explain: "“Kiến mở cửa, mời châu chấu vào nhà và chia cho bác mấy hạt thóc.”" },
      { q: "Câu chuyện khuyên em điều gì?", options: ["Chăm chỉ, biết lo xa và sẵn lòng giúp đỡ người khác", "Chỉ nên vui chơi", "Không nên chia sẻ thức ăn", "Mùa đông không cần chuẩn bị gì"], answer: "Chăm chỉ, biết lo xa và sẵn lòng giúp đỡ người khác", explain: "Kiến chăm chỉ để dành thức ăn và còn chia cho châu chấu; châu chấu hứa “Từ nay tôi sẽ chăm chỉ như cậu.”" },
    ],
    ltvc: { q: "Từ nào trong bài có nghĩa trái ngược với từ “chăm chỉ”?", options: ["lười biếng", "kiên nhẫn", "siêng năng", "cần cù"], answer: "lười biếng", explain: "“kiên nhẫn”, “siêng năng”, “cần cù” gần nghĩa với “chăm chỉ”; “lười biếng” có nghĩa trái ngược." },
    open: { q: "Em đã làm gì để thể hiện mình là người chăm chỉ? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể. VD: “Ngày nào em cũng làm bài tập xong rồi mới đi chơi.”" },
  }),

  /* ═════════════ CUỐI HỌC KÌ II ═════════════ */
  P({
    id: "ruong-bac-thang", kinds: ["cuoi-hk2"], title: "Ruộng bậc thang",
    text: `Hè năm ngoái, em được theo bố lên vùng núi phía Bắc. Ở đó, em được ngắm những thửa ruộng bậc thang đẹp như tranh vẽ.

Ruộng nối nhau từ chân núi lên tận đỉnh đồi, giống như những bậc cầu thang khổng lồ. Mùa lúa chín, cả sườn núi vàng óng. Gió thổi qua, những bông lúa nghiêng mình, sóng lúa nhấp nhô như sóng biển.

Bác Chư là người dân tộc Mông dẫn đường cho bố con em. Bác kể rằng ruộng bậc thang do ông cha bác làm ra từ rất lâu rồi. Ngày ấy, người ta phải đào đất, xếp đá bằng tay. Mỗi thửa ruộng là mồ hôi của biết bao người.

Em đứng trên đỉnh đồi, nhìn xuống những bậc ruộng vàng. Em thầm cảm ơn những người nông dân cần cù đã làm ra cảnh đẹp này. Em hứa sẽ học thật giỏi để mai sau giới thiệu quê hương mình với bạn bè khắp nơi.`,
    questions: [
      { q: "Bạn nhỏ được ngắm ruộng bậc thang ở đâu?", options: ["Vùng núi phía Bắc", "Đồng bằng sông Cửu Long", "Bờ biển miền Trung", "Giữa thành phố"], answer: "Vùng núi phía Bắc", explain: "“em được theo bố lên vùng núi phía Bắc”." },
      { q: "Ruộng bậc thang được so sánh với gì?", options: ["Những bậc cầu thang khổng lồ", "Những con sông dài", "Những đám mây trắng", "Những ngôi nhà cao"], answer: "Những bậc cầu thang khổng lồ", explain: "Ruộng nối nhau “giống như những bậc cầu thang khổng lồ”." },
      { q: "Mùa lúa chín, sườn núi có màu gì?", options: ["Vàng óng", "Xanh biếc", "Đỏ rực", "Trắng xóa"], answer: "Vàng óng", explain: "“Mùa lúa chín, cả sườn núi vàng óng.”" },
      { q: "Ai là người dẫn đường cho bố con bạn nhỏ?", options: ["Bác Chư", "Ông nội", "Cô giáo", "Chú bộ đội"], answer: "Bác Chư", explain: "“Bác Chư là người dân tộc Mông dẫn đường cho bố con em.”" },
      { q: "Ngày xưa, người ta làm ruộng bậc thang bằng cách nào?", options: ["Đào đất, xếp đá bằng tay", "Dùng máy xúc lớn", "Nhờ nước mưa tự tạo ra", "Mua từ nơi khác về"], answer: "Đào đất, xếp đá bằng tay", explain: "“người ta phải đào đất, xếp đá bằng tay”." },
      { q: "Bạn nhỏ hứa điều gì?", options: ["Học thật giỏi để giới thiệu quê hương với bạn bè", "Không bao giờ quay lại vùng núi", "Ở lại làm ruộng cùng bác Chư", "Mang lúa về thành phố bán"], answer: "Học thật giỏi để giới thiệu quê hương với bạn bè", explain: "“Em hứa sẽ học thật giỏi để mai sau giới thiệu quê hương mình với bạn bè khắp nơi.”" },
    ],
    ltvc: { q: "Câu “Mùa lúa chín, cả sườn núi vàng óng.” trả lời cho câu hỏi “Khi nào?” bằng bộ phận nào?", options: ["Mùa lúa chín", "cả sườn núi", "vàng óng", "sườn núi vàng óng"], answer: "Mùa lúa chín", explain: "“Mùa lúa chín” cho biết thời gian sườn núi vàng óng — bộ phận trả lời câu hỏi “Khi nào?”." },
    open: { q: "Hãy viết 1–2 câu giới thiệu một cảnh đẹp của quê hương em (hoặc nơi em sống).", hint: "Câu đúng ngữ pháp, có tên cảnh và một nét đẹp; khuyến khích dùng so sánh. VD: “Hồ sen làng em mùa hè nở hồng như một tấm thảm hoa.”" },
  }),
  P({
    id: "ngay-trai-dat", kinds: ["cuoi-hk2"], title: "Lớp em đón Giờ Trái Đất",
    text: `Cô giáo nói với cả lớp: “Tối thứ Bảy này là Giờ Trái Đất. Mọi người cùng tắt đèn và các thiết bị điện không cần thiết trong một giờ để tiết kiệm năng lượng.” Cả lớp ai cũng háo hức.

Tối thứ Bảy, em nhắc bố mẹ tắt đèn, tắt ti vi. Cả nhà ra sân ngồi. Bầu trời đêm hiện lên thật rõ. Những ngôi sao lấp lánh như ai rắc kim cương lên tấm áo đen. Bố chỉ cho em chòm sao hình cái gáo. Mẹ kể chuyện chú Cuội ngồi gốc cây đa. Gió mát thổi, tiếng dế kêu ri ri trong vườn.

Em hỏi bố:

– Bố ơi, tắt đèn một giờ thì giúp được gì cho Trái Đất ạ?

Bố cười:

– Nếu nhà nào cũng tiết kiệm điện, chúng ta sẽ bớt được khói bụi. Trái Đất sẽ xanh và sạch hơn.

Từ hôm đó, em luôn nhớ tắt đèn, tắt quạt khi ra khỏi phòng. Em muốn ngày nào cũng là Giờ Trái Đất.`,
    questions: [
      { q: "Trong Giờ Trái Đất, mọi người cùng làm gì?", options: ["Tắt đèn và các thiết bị điện không cần thiết trong một giờ", "Trồng cây ở công viên", "Nhặt rác trên bãi biển", "Đi xe đạp đến trường"], answer: "Tắt đèn và các thiết bị điện không cần thiết trong một giờ", explain: "Cô giáo nói: “Mọi người cùng tắt đèn và các thiết bị điện không cần thiết trong một giờ để tiết kiệm năng lượng.”" },
      { q: "Tối thứ Bảy, bạn nhỏ đã nhắc bố mẹ việc gì?", options: ["Tắt đèn, tắt ti vi", "Đi ngủ sớm", "Mở thêm quạt", "Đi chơi công viên"], answer: "Tắt đèn, tắt ti vi", explain: "“em nhắc bố mẹ tắt đèn, tắt ti vi”." },
      { q: "Những ngôi sao được so sánh với gì?", options: ["Kim cương rắc lên tấm áo đen", "Những bóng đèn điện", "Những bông hoa trắng", "Những giọt mưa"], answer: "Kim cương rắc lên tấm áo đen", explain: "“Những ngôi sao lấp lánh như ai rắc kim cương lên tấm áo đen.”" },
      { q: "Mẹ đã kể chuyện gì cho bạn nhỏ nghe?", options: ["Chuyện chú Cuội ngồi gốc cây đa", "Chuyện Tấm Cám", "Chuyện Thánh Gióng", "Chuyện Sơn Tinh, Thủy Tinh"], answer: "Chuyện chú Cuội ngồi gốc cây đa", explain: "“Mẹ kể chuyện chú Cuội ngồi gốc cây đa.”" },
      { q: "Theo bố, tiết kiệm điện giúp gì cho Trái Đất?", options: ["Bớt khói bụi, Trái Đất xanh và sạch hơn", "Trái Đất quay nhanh hơn", "Có thêm nhiều ngôi sao", "Trời mưa nhiều hơn"], answer: "Bớt khói bụi, Trái Đất xanh và sạch hơn", explain: "Bố nói: “chúng ta sẽ bớt được khói bụi. Trái Đất sẽ xanh và sạch hơn.”" },
      { q: "Sau Giờ Trái Đất, bạn nhỏ đã thay đổi thế nào?", options: ["Luôn nhớ tắt đèn, tắt quạt khi ra khỏi phòng", "Không bao giờ bật đèn nữa", "Chỉ học bài vào ban ngày", "Quên ngay việc tiết kiệm điện"], answer: "Luôn nhớ tắt đèn, tắt quạt khi ra khỏi phòng", explain: "“Từ hôm đó, em luôn nhớ tắt đèn, tắt quạt khi ra khỏi phòng.”" },
    ],
    ltvc: { q: "Câu “Bố ơi, tắt đèn một giờ thì giúp được gì cho Trái Đất ạ?” thuộc kiểu câu nào?", options: ["Câu hỏi", "Câu kể", "Câu cảm", "Câu khiến"], answer: "Câu hỏi", explain: "Câu có từ hỏi “gì” và kết thúc bằng dấu chấm hỏi — đó là câu hỏi." },
    open: { q: "Em sẽ làm gì để bảo vệ Trái Đất? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, nêu được việc làm cụ thể. VD: “Em sẽ tắt đèn khi ra khỏi phòng và bỏ rác đúng nơi quy định.”" },
  }),
];

/* ═════════════ Ngân hàng luyện từ và câu lớp 3 (câu 8, câu 9 — 1 điểm/câu) ═════════════ */

const LTVC_BANK: Record<string, ReturnType<typeof M>[]> = {
  "su-vat-hoat-dong": [
    M("Dòng nào dưới đây gồm toàn từ chỉ sự vật?", "bàn, ghế, cặp sách", ["chạy, nhảy, hát", "xanh, đỏ, vàng", "cao, thấp, béo"], "“bàn”, “ghế”, “cặp sách” đều gọi tên đồ vật nên là từ chỉ sự vật."),
    M("Dòng nào dưới đây gồm toàn từ chỉ hoạt động?", "đọc, viết, vẽ", ["sách, vở, bút", "vui, buồn, đẹp", "mẹ, bố, ông"], "“đọc”, “viết”, “vẽ” đều chỉ việc làm nên là từ chỉ hoạt động."),
    M("Từ nào chỉ hoạt động trong câu “Bà em tưới rau ngoài vườn.”?", "tưới", ["bà", "rau", "vườn"], "“tưới” là việc bà làm nên là từ chỉ hoạt động."),
    M("Câu nào dưới đây là câu nêu hoạt động?", "Các bạn đang quét lớp.", ["Lớp em rất sạch.", "Đây là lớp 3A.", "Cái chổi màu xanh."], "Câu có từ chỉ hoạt động “quét”, trả lời câu hỏi “Làm gì?”."),
    M("Câu nào dưới đây là câu giới thiệu?", "Đây là bạn Nam, lớp trưởng lớp em.", ["Nam đang đọc sách.", "Nam chạy rất nhanh.", "Nam ơi, đi học thôi!"], "Câu dùng để giới thiệu một người, theo mẫu “Đây là …”."),
  ],
  "dac-diem": [
    M("Dòng nào dưới đây gồm toàn từ chỉ đặc điểm?", "xanh, tròn, cao", ["bàn, ghế, tủ", "ăn, uống, ngủ", "mẹ, cô, bà"], "“xanh”, “tròn”, “cao” nói về màu sắc, hình dáng, kích thước nên là từ chỉ đặc điểm."),
    M("Từ nào chỉ đặc điểm trong câu “Chú mèo có bộ lông trắng muốt.”?", "trắng muốt", ["chú mèo", "bộ lông", "có"], "“trắng muốt” nói về màu lông của mèo nên là từ chỉ đặc điểm."),
    M("Từ nào chỉ tính nết của người?", "chăm chỉ", ["cao lớn", "đỏ thắm", "tròn xoe"], "“chăm chỉ” nói về tính nết; các từ còn lại nói về hình dáng, màu sắc."),
    M("Từ chỉ đặc điểm nào thích hợp điền vào chỗ trống: “Quả cam chín … như mặt trời.”?", "vàng tươi", ["chạy nhảy", "cây cam", "hái quả"], "Chỗ trống cần một từ chỉ màu sắc của quả cam: “vàng tươi”."),
    M("Từ nào KHÔNG phải là từ chỉ đặc điểm?", "nhảy dây", ["hiền lành", "xanh biếc", "nhỏ bé"], "“nhảy dây” chỉ hoạt động; ba từ còn lại chỉ đặc điểm."),
  ],
  "so-sanh": [
    M("Câu nào dưới đây có hình ảnh so sánh?", "Mặt trăng tròn như cái đĩa bạc.", ["Mặt trăng rất sáng.", "Đêm nay có trăng.", "Em ngắm trăng cùng bà."], "Câu có từ so sánh “như”, so sánh “Mặt trăng” với “cái đĩa bạc”."),
    M("Trong câu “Tiếng suối trong như tiếng hát xa.”, tiếng suối được so sánh với gì?", "tiếng hát xa", ["tiếng suối", "dòng suối", "tiếng chim"], "Sau từ so sánh “như” là “tiếng hát xa”."),
    M("Từ nào là từ so sánh trong câu “Trẻ em là búp trên cành.”?", "là", ["trẻ em", "búp", "cành"], "Từ “là” nối “Trẻ em” với “búp trên cành” để so sánh."),
    M("Từ nào thích hợp điền vào chỗ trống: “Hai má em bé đỏ hồng … quả táo chín.”?", "như", ["và", "nhưng", "vì"], "Cần một từ so sánh để nối “Hai má em bé” với “quả táo chín”: “như”."),
    M("Câu “Đàn cò trắng bay như những bông hoa giữa trời.” so sánh hai sự vật nào?", "đàn cò trắng – những bông hoa", ["đàn cò – bầu trời", "bông hoa – bầu trời", "cánh cò – cánh hoa"], "“Đàn cò trắng” được so sánh với “những bông hoa” qua từ “như”."),
  ],
  "kieu-cau": [
    M("Câu nào dưới đây là câu hỏi?", "Bạn đã làm bài tập chưa?", ["Bạn làm bài tập đi!", "Bạn đã làm bài tập.", "Ôi, bài tập khó quá!"], "Câu dùng để hỏi, có từ “chưa” và dấu chấm hỏi."),
    M("Câu nào dưới đây là câu cảm?", "Ôi, bông hoa đẹp quá!", ["Bông hoa màu đỏ.", "Bông hoa này tên là gì?", "Em hãy tưới hoa đi."], "Câu bộc lộ cảm xúc, có từ “Ôi”, “quá” và dấu chấm than."),
    M("Câu nào dưới đây là câu khiến?", "Các em hãy giữ trật tự!", ["Các em giữ trật tự.", "Các em có giữ trật tự không?", "Các em giỏi quá!"], "Câu dùng để yêu cầu, có từ “hãy”."),
    M("Câu “Lan đang đọc truyện.” thuộc kiểu câu nào?", "Câu kể", ["Câu hỏi", "Câu cảm", "Câu khiến"], "Câu dùng để kể một hoạt động, kết thúc bằng dấu chấm — đó là câu kể."),
    M("Cuối câu khiến “Con nhớ đội mũ khi đi nắng nhé” cần đặt dấu câu nào?", "Dấu chấm hoặc dấu chấm than", ["Dấu chấm hỏi", "Dấu hai chấm", "Dấu phẩy"], "Câu khiến kết thúc bằng dấu chấm hoặc dấu chấm than."),
  ],
  "giong-trai-nghia": [
    M("Từ nào có nghĩa giống với từ “to lớn”?", "khổng lồ", ["nhỏ bé", "tí hon", "xinh xắn"], "“khổng lồ” và “to lớn” cùng chỉ kích thước rất lớn."),
    M("Từ nào có nghĩa giống với từ “siêng năng”?", "chăm chỉ", ["lười biếng", "nhanh nhẹn", "thông minh"], "“chăm chỉ” và “siêng năng” cùng chỉ người làm việc đều đặn, không ngại khó."),
    M("Cặp từ nào dưới đây có nghĩa trái ngược nhau?", "sáng – tối", ["xanh – biếc", "to – lớn", "vui – mừng"], "“sáng” và “tối” chỉ hai điều đối lập."),
    M("Từ nào có nghĩa trái ngược với từ “nhanh”?", "chậm", ["vội", "gấp", "lẹ"], "“chậm” trái nghĩa với “nhanh”; “vội”, “gấp”, “lẹ” gần nghĩa với “nhanh”."),
    M("Từ nào có nghĩa trái ngược với từ “dũng cảm”?", "nhút nhát", ["gan dạ", "can đảm", "anh dũng"], "“gan dạ”, “can đảm”, “anh dũng” gần nghĩa với “dũng cảm”; “nhút nhát” trái nghĩa."),
  ],
  "hoi-dap": [
    M("Bộ phận nào trong câu “Sáng sớm, ông em tập thể dục ngoài sân.” trả lời câu hỏi “Ở đâu?”?", "ngoài sân", ["Sáng sớm", "ông em", "tập thể dục"], "“ngoài sân” cho biết nơi ông tập thể dục."),
    M("Bộ phận nào trong câu “Mùa hè, hoa phượng nở đỏ rực.” trả lời câu hỏi “Khi nào?”?", "Mùa hè", ["hoa phượng", "nở", "đỏ rực"], "“Mùa hè” cho biết thời gian hoa phượng nở."),
    M("Bộ phận nào trong câu “Em đến trường bằng xe đạp.” trả lời câu hỏi “Bằng gì?”?", "bằng xe đạp", ["Em", "đến trường", "trường"], "“bằng xe đạp” cho biết phương tiện em đến trường."),
    M("Câu hỏi nào phù hợp với câu trả lời “Lớp em đi tham quan vào sáng thứ Bảy.”?", "Lớp em đi tham quan khi nào?", ["Lớp em đi tham quan ở đâu?", "Lớp em đi tham quan bằng gì?", "Lớp em đi tham quan để làm gì?"], "“vào sáng thứ Bảy” chỉ thời gian nên câu hỏi phải dùng “khi nào?”."),
    M("Bộ phận nào trong câu “Chiếc ghế này được làm bằng gỗ.” trả lời câu hỏi “Bằng gì?”?", "bằng gỗ", ["Chiếc ghế", "này", "được làm"], "“bằng gỗ” cho biết chất liệu làm ra chiếc ghế."),
  ],
  "dau-cau": [
    M("Dấu hai chấm trong câu “Vườn nhà em có nhiều loại hoa: hồng, cúc, huệ.” dùng để làm gì?", "Báo hiệu phần liệt kê", ["Kết thúc câu", "Đánh dấu câu hỏi", "Đánh dấu tên bài"], "Sau dấu hai chấm là các loại hoa được kể ra — phần liệt kê."),
    M("Dấu gạch ngang ở đầu dòng “– Con chào mẹ ạ!” dùng để làm gì?", "Đánh dấu lời nói của nhân vật", ["Báo hiệu phần liệt kê", "Kết thúc câu", "Nối hai từ"], "Dấu gạch ngang đặt ở đầu dòng để đánh dấu lời nói của nhân vật."),
    M("Trong câu: Em rất thích bài thơ “Mẹ của em”. Dấu ngoặc kép dùng để làm gì?", "Đánh dấu tên bài thơ", ["Đánh dấu lời nói của nhân vật", "Báo hiệu phần liệt kê", "Kết thúc câu"], "“Mẹ của em” là tên một bài thơ nên được đặt trong dấu ngoặc kép."),
    M("Dấu câu nào thích hợp đặt vào ô trống: “Mẹ dặn em □ Con nhớ học bài nhé!”?", "Dấu hai chấm", ["Dấu chấm hỏi", "Dấu phẩy", "Dấu chấm than"], "Trước lời nói của mẹ cần đặt dấu hai chấm."),
    M("Câu nào đặt dấu câu đúng?", "Bạn tên là gì?", ["Bạn tên là gì.", "Bạn tên là gì!", "Bạn tên là gì:"], "Câu hỏi kết thúc bằng dấu chấm hỏi."),
  ],
};

const LTVC_TOPIC_NAMES: Record<string, string> = {
  "su-vat-hoat-dong": "từ chỉ sự vật, hoạt động", "dac-diem": "từ chỉ đặc điểm", "so-sanh": "biện pháp so sánh",
  "kieu-cau": "câu kể, câu hỏi, câu cảm, câu khiến", "giong-trai-nghia": "từ có nghĩa giống nhau, trái ngược nhau",
  "hoi-dap": "câu hỏi Khi nào? Ở đâu? Bằng gì?", "dau-cau": "dấu hai chấm, dấu gạch ngang, dấu ngoặc kép",
};

/* ═════════════ Kiểm tra viết (đoạn văn lớp 3) ═════════════ */

const WRITING_PROMPTS: TvContent["writing"] = {
  "giua-hk1": [
    "Viết đoạn văn (khoảng 5–7 câu) kể lại một hoạt động em đã làm cùng người thân trong kì nghỉ hè.",
    "Viết đoạn văn (khoảng 5–7 câu) giới thiệu về bản thân em.",
    "Viết đoạn văn (khoảng 5–7 câu) nêu tình cảm, cảm xúc của em đối với một người bạn mà em yêu quý.",
  ],
  "cuoi-hk1": [
    "Viết đoạn văn (khoảng 5–7 câu) tả một đồ vật em yêu thích.",
    "Viết đoạn văn (khoảng 5–7 câu) nêu tình cảm của em đối với một người thân trong gia đình.",
    "Viết đoạn văn (khoảng 5–7 câu) tả ngôi nhà của em.",
  ],
  "giua-hk2": [
    "Viết đoạn văn (khoảng 5–7 câu) nêu tình cảm, cảm xúc của em về một cảnh vật em yêu thích.",
    "Viết đoạn văn (khoảng 5–7 câu) nêu lí do em thích (hoặc không thích) một nhân vật trong câu chuyện em đã đọc, đã nghe.",
    "Viết đoạn văn (khoảng 5–7 câu) về ước mơ của em.",
  ],
  "cuoi-hk2": [
    "Viết đoạn văn (khoảng 5–7 câu) nêu tình cảm, cảm xúc của em về một cảnh đẹp của quê hương, đất nước.",
    "Viết đoạn văn (khoảng 5–7 câu) kể lại một việc làm góp phần bảo vệ môi trường của em hoặc của người khác.",
    "Viết đoạn văn (khoảng 5–7 câu) về một nhân vật em yêu thích trong câu chuyện em đã đọc, đã nghe.",
  ],
};

export const TV3: TvContent = {
  grade: 3, passages: PASSAGES, ltvcBank: LTVC_BANK, topicNames: LTVC_TOPIC_NAMES,
  ltvcByKind: {
    "giua-hk1": ["su-vat-hoat-dong", "dac-diem"],
    "cuoi-hk1": ["so-sanh", "kieu-cau"],
    "giua-hk2": ["giong-trai-nghia", "hoi-dap"],
    "cuoi-hk2": ["kieu-cau", "dau-cau"],
  },
  writing: WRITING_PROMPTS, words: [130, 260],
};
