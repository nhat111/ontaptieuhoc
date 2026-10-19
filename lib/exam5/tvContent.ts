// lib/exam5/tvContent.ts
// Nội dung đề Tiếng Việt lớp 5 — VIẾT TAY, không sinh bằng máy, không chép sách giáo khoa:
// bài đọc do Ôn Tập Phổ Thông tự soạn theo các chủ điểm của chương trình GDPT 2018.
//
// Quy tắc khi thêm/sửa (scripts/exam5-check.ts kiểm tra phần máy kiểm được):
//   • Mỗi câu trắc nghiệm có đúng MỘT đáp án đúng; đáp án nhiễu phải sai rõ ràng.
//   • `answer` phải trùng nguyên văn một phần tử của `options`.
//   • Câu hỏi trích từ bài đọc thì phần trích phải có nguyên văn trong `text`.
//   • Dùng ngoặc kép cong “ ” trong nội dung, không dùng " thẳng.
//   • Phạm vi luyện từ và câu theo kì: giữa HK I đồng nghĩa, đa nghĩa; cuối HK I đại từ,
//     kết từ; giữa HK II câu ghép, cặp kết từ, dấu gạch ngang; cuối HK II liên kết câu,
//     dấu gạch ngang, điệp từ.

import type { ExamKind } from "../quickExam";

export interface TvMcq {
  q: string;
  options: string[];
  answer: string;
  explain: string;
}

export interface TvPassage {
  id: string;
  kinds: ExamKind[];
  title: string;
  /** Các đoạn cách nhau một dòng trống; lời thoại bắt đầu bằng "– ". */
  text: string;
  /** Câu 1–6: đọc hiểu nội dung (0,5 điểm/câu). */
  questions: TvMcq[];
  /** Câu 7: luyện từ và câu gắn với bài đọc (1 điểm). */
  ltvc: TvMcq;
  /** Câu 10: câu hỏi mở, chỉ in (1 điểm). */
  open: { q: string; hint: string };
}

const P = (p: TvPassage) => p;

export const PASSAGES: TvPassage[] = [
  /* ═════════════ GIỮA HỌC KÌ I ═════════════ */
  P({
    id: "canh-dieu-cua-ong", kinds: ["giua-hk1"], title: "Cánh diều của ông",
    text: `Hè năm ấy, Minh về quê chơi với ông. Một buổi chiều, ông mang ra mấy thanh tre đã vót sẵn và một tờ giấy báo cũ. Ông bảo:

– Hôm nay ông cháu mình làm một con diều nhé!

Minh reo lên sung sướng. Ông tỉ mỉ uốn khung, buộc chỉ, dán giấy. Minh ngồi bên cạnh, lúc đưa hồ dán, lúc giữ đầu khung cho ông. Chẳng mấy chốc, một con diều cánh cong đã nằm gọn trong tay hai ông cháu.

Gió chiều thổi lồng lộng trên cánh đồng. Ông cầm dây, Minh nâng diều chạy ngược chiều gió. Con diều chao đi chao lại mấy lần rồi vút lên cao. Trên nền trời xanh mênh mông, cánh diều nhỏ xíu như một cánh chim đang bay lượn. Minh ngửa cổ nhìn theo, lòng lâng lâng một niềm vui khó tả.

– Ông ơi, sao diều bay được cao thế ạ? – Minh hỏi.

Ông cười hiền:

– Vì có gió nâng và có sợi dây giữ chặt cháu ạ. Nếu đứt dây, diều sẽ rơi ngay. Con người cũng vậy, đi xa đến đâu cũng cần có gia đình làm sợi dây để vững vàng.

Minh nắm chặt sợi dây trong tay. Em hiểu rằng ông vừa dạy em một điều thật quý.`,
    questions: [
      { q: "Ông và Minh làm diều bằng những vật liệu gì?", options: ["Thanh tre và giấy báo cũ", "Nan nhựa và vải", "Giấy màu và que gỗ", "Thanh tre và túi ni lông"], answer: "Thanh tre và giấy báo cũ", explain: "Ông mang ra “mấy thanh tre đã vót sẵn và một tờ giấy báo cũ”." },
      { q: "Khi ông làm diều, Minh đã làm gì?", options: ["Đưa hồ dán và giữ đầu khung cho ông", "Chạy ra đồng chơi một mình", "Ngồi xem ti vi", "Tự làm một con diều khác"], answer: "Đưa hồ dán và giữ đầu khung cho ông", explain: "“Minh ngồi bên cạnh, lúc đưa hồ dán, lúc giữ đầu khung cho ông.”" },
      { q: "Hai ông cháu thả diều ở đâu?", options: ["Trên cánh đồng", "Trên bãi biển", "Trong sân trường", "Trên sân thượng"], answer: "Trên cánh đồng", explain: "“Gió chiều thổi lồng lộng trên cánh đồng.”" },
      { q: "Cánh diều trên bầu trời được so sánh với hình ảnh nào?", options: ["Một cánh chim đang bay lượn", "Một chiếc lá vàng", "Một đám mây trắng", "Một chiếc thuyền buồm"], answer: "Một cánh chim đang bay lượn", explain: "“cánh diều nhỏ xíu như một cánh chim đang bay lượn”." },
      { q: "Theo ông, vì sao diều bay được cao?", options: ["Vì có gió nâng và có sợi dây giữ chặt", "Vì diều được làm bằng giấy báo", "Vì Minh chạy rất nhanh", "Vì diều có cánh cong"], answer: "Vì có gió nâng và có sợi dây giữ chặt", explain: "Ông nói: “Vì có gió nâng và có sợi dây giữ chặt cháu ạ.”" },
      { q: "Câu chuyện muốn nói với em điều gì?", options: ["Gia đình là chỗ dựa giúp mỗi người vững vàng", "Thả diều là trò chơi nguy hiểm", "Muốn diều bay cao phải chạy thật nhanh", "Chỉ nên thả diều vào mùa hè"], answer: "Gia đình là chỗ dựa giúp mỗi người vững vàng", explain: "Ông dạy: đi xa đến đâu cũng cần có gia đình làm sợi dây để vững vàng." },
    ],
    ltvc: { q: "Từ nào đồng nghĩa với từ “mênh mông” trong câu “Trên nền trời xanh mênh mông, cánh diều nhỏ xíu như một cánh chim đang bay lượn.”?", options: ["bao la", "nhỏ hẹp", "xanh biếc", "cao vút"], answer: "bao la", explain: "“Mênh mông” và “bao la” đều chỉ không gian rộng lớn đến mức như không có giới hạn." },
    open: { q: "Nếu là Minh, em sẽ nói gì với ông sau buổi thả diều? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, thể hiện lòng biết ơn, yêu quý ông. VD: “Cháu cảm ơn ông. Cháu sẽ nhớ mãi lời ông dạy.”" },
  }),
  P({
    id: "buoi-som-tren-doi-che", kinds: ["giua-hk1"], title: "Buổi sớm trên đồi chè",
    text: `Mặt trời còn chưa lên khỏi rặng núi phía đông, đồi chè đã thức giấc. Màn sương mỏng như tấm voan trắng phủ lên những hàng chè xanh mướt chạy vòng quanh sườn đồi. Từ chân đồi nhìn lên, các hàng chè uốn lượn như những bậc thang khổng lồ dẫn lên bầu trời.

Khi những tia nắng đầu tiên chiếu xuống, sương tan dần. Từng búp chè non tơ còn đọng hạt sương long lanh như những viên ngọc nhỏ. Gió nhẹ đưa hương chè thoang thoảng khắp nơi.

Các cô, các chị đã có mặt trên đồi từ sớm. Chiếc gùi tre đeo sau lưng, đôi tay thoăn thoắt hái những búp chè một tôm hai lá. Tiếng nói cười rộn rã cả một vùng đồi. Thỉnh thoảng, một đàn chim sâu lích chích chuyền cành như muốn góp vui cùng mọi người.

Đến trưa, những chiếc gùi đã đầy ắp búp chè xanh. Chè được mang về xưởng sao, sấy để làm ra những mẻ chè thơm ngon. Nhìn đồi chè trải dài dưới nắng, ai cũng thấy lòng mình rộn lên niềm vui của một mùa chè bội thu.`,
    questions: [
      { q: "Bài văn bắt đầu tả đồi chè vào thời điểm nào?", options: ["Buổi sáng sớm", "Buổi chiều", "Buổi tối", "Lúc nửa đêm"], answer: "Buổi sáng sớm", explain: "“Mặt trời còn chưa lên khỏi rặng núi phía đông, đồi chè đã thức giấc.”" },
      { q: "Màn sương trên đồi chè được so sánh với gì?", options: ["Tấm voan trắng", "Làn khói bếp", "Đám mây đen", "Dải lụa hồng"], answer: "Tấm voan trắng", explain: "“Màn sương mỏng như tấm voan trắng”." },
      { q: "Nhìn từ chân đồi, các hàng chè giống như gì?", options: ["Những bậc thang khổng lồ", "Những con sóng biển", "Những dòng sông", "Những chiếc gùi tre"], answer: "Những bậc thang khổng lồ", explain: "“các hàng chè uốn lượn như những bậc thang khổng lồ dẫn lên bầu trời”." },
      { q: "Người hái chè hái những búp chè như thế nào?", options: ["Một tôm hai lá", "Chỉ hái lá già", "Hái cả cành", "Hái những búp đã khô"], answer: "Một tôm hai lá", explain: "“đôi tay thoăn thoắt hái những búp chè một tôm hai lá”." },
      { q: "Chi tiết nào cho thấy không khí trên đồi chè rất vui?", options: ["Tiếng nói cười rộn rã cả một vùng đồi", "Mặt trời còn chưa lên", "Sương tan dần", "Chè được mang về xưởng"], answer: "Tiếng nói cười rộn rã cả một vùng đồi", explain: "Tiếng nói cười “rộn rã cả một vùng đồi” cho thấy không khí vui tươi." },
      { q: "Nội dung chính của bài là gì?", options: ["Tả vẻ đẹp của đồi chè buổi sớm và niềm vui của người hái chè", "Kể về cách làm ra chè khô", "Tả một trận mưa trên đồi", "Kể về một đàn chim sâu"], answer: "Tả vẻ đẹp của đồi chè buổi sớm và niềm vui của người hái chè", explain: "Bài tả cảnh đồi chè từ sớm đến trưa và niềm vui mùa chè bội thu." },
    ],
    ltvc: { q: "Trong câu “Từ chân đồi nhìn lên, các hàng chè uốn lượn như những bậc thang khổng lồ dẫn lên bầu trời.”, từ “chân” được dùng với nghĩa nào?", options: ["Nghĩa chuyển: phần dưới cùng, sát mặt đất của quả đồi", "Nghĩa gốc: bộ phận dưới cùng của cơ thể người", "Nghĩa gốc: bộ phận dùng để đi của con vật", "Nghĩa chuyển: bộ phận dùng để đỡ cái bàn"], answer: "Nghĩa chuyển: phần dưới cùng, sát mặt đất của quả đồi", explain: "“Chân đồi” là phần dưới cùng của quả đồi — nghĩa chuyển của từ “chân”." },
    open: { q: "Viết 1–2 câu tả một cảnh đẹp vào buổi sáng ở nơi em sống.", hint: "Câu đúng ngữ pháp, có hình ảnh cụ thể (nắng, sương, cây cối, âm thanh…); khuyến khích dùng so sánh." },
  }),

  /* ═════════════ CUỐI HỌC KÌ I ═════════════ */
  P({
    id: "thay-giao-ben-kia-song", kinds: ["cuoi-hk1"], title: "Thầy giáo bên kia sông",
    text: `Ngôi trường nhỏ của làng nằm bên kia con sông rộng. Mỗi sáng, thầy Tâm lại chèo chiếc thuyền nan cũ sang sông để dạy học. Những hôm trời mưa to, nước sông chảy xiết, thầy vẫn khoác áo mưa, cẩn thận chèo từng nhịp. Thầy bảo: “Các em đang chờ thầy, thầy không thể đến muộn.”

Lớp học của thầy có hai mươi bạn nhỏ. Nhiều bạn nhà nghèo, thiếu cả sách vở. Thầy dành dụm tiền lương ít ỏi để mua thêm bút, vở cho các em. Buổi tối, thầy còn mở lớp học thêm miễn phí ngay trong căn nhà nhỏ của mình. Ngọn đèn dầu nhà thầy sáng đến khuya, soi rõ những khuôn mặt chăm chú của học trò.

Thấm thoắt đã hơn hai mươi năm. Học trò của thầy, người trở thành bác sĩ, người làm kĩ sư, người lại về làng làm thầy giáo giống như thầy. Năm nay, họ rủ nhau góp tiền xây một cây cầu nhỏ bắc qua sông. Ngày khánh thành, họ đặt tên cho nó là “cầu Thầy Tâm”. Thầy đứng trên cầu, đôi mắt rưng rưng:

– Thầy chỉ làm những việc nhỏ thôi, các em ạ.

Nhưng ai cũng biết, chính những việc nhỏ ấy đã thắp sáng ước mơ cho cả một thế hệ học trò.`,
    questions: [
      { q: "Mỗi sáng, thầy Tâm đến trường bằng cách nào?", options: ["Chèo thuyền nan sang sông", "Đi xe đạp qua cầu", "Đi bộ qua cánh đồng", "Đi xe máy"], answer: "Chèo thuyền nan sang sông", explain: "“thầy Tâm lại chèo chiếc thuyền nan cũ sang sông để dạy học”." },
      { q: "Vì sao những hôm mưa to thầy vẫn sang sông dạy học?", options: ["Vì thầy không muốn học trò phải chờ", "Vì thầy thích chèo thuyền", "Vì trời mưa thì sông lặng", "Vì thầy muốn được khen"], answer: "Vì thầy không muốn học trò phải chờ", explain: "Thầy bảo: “Các em đang chờ thầy, thầy không thể đến muộn.”" },
      { q: "Thầy Tâm đã giúp những học trò nghèo bằng cách nào?", options: ["Dành tiền lương mua bút, vở và mở lớp học thêm miễn phí", "Xin tiền của người trong làng", "Cho học trò nghỉ học để đi làm", "Tặng mỗi bạn một chiếc thuyền"], answer: "Dành tiền lương mua bút, vở và mở lớp học thêm miễn phí", explain: "Thầy “dành dụm tiền lương ít ỏi để mua thêm bút, vở” và “mở lớp học thêm miễn phí”." },
      { q: "Chi tiết “Ngọn đèn dầu nhà thầy sáng đến khuya” nói lên điều gì về thầy Tâm?", options: ["Thầy tận tụy dạy học trò đến tận khuya", "Thầy rất thích đèn dầu", "Thầy sợ bóng tối", "Thầy không ngủ được"], answer: "Thầy tận tụy dạy học trò đến tận khuya", explain: "Đèn sáng đến khuya vì thầy vẫn đang dạy những học trò chăm chú." },
      { q: "Hơn hai mươi năm sau, các học trò đã làm gì để tỏ lòng biết ơn thầy?", options: ["Góp tiền xây cầu qua sông và đặt tên là “cầu Thầy Tâm”", "Tặng thầy một chiếc thuyền mới", "Mời thầy lên thành phố sống", "Viết một cuốn sách về thầy"], answer: "Góp tiền xây cầu qua sông và đặt tên là “cầu Thầy Tâm”", explain: "Họ “góp tiền xây một cây cầu nhỏ bắc qua sông” và đặt tên là “cầu Thầy Tâm”." },
      { q: "Câu chuyện ca ngợi điều gì?", options: ["Tấm lòng tận tụy, yêu thương học trò của người thầy", "Vẻ đẹp của con sông quê", "Cách xây một cây cầu", "Tài chèo thuyền của thầy Tâm"], answer: "Tấm lòng tận tụy, yêu thương học trò của người thầy", explain: "Những việc nhỏ của thầy “đã thắp sáng ước mơ cho cả một thế hệ học trò”." },
    ],
    ltvc: { q: "Câu “Thầy dành dụm tiền lương ít ỏi để mua thêm bút, vở cho các em.” có những kết từ nào?", options: ["để, cho", "dành dụm, mua", "tiền lương, bút", "ít ỏi, thêm"], answer: "để, cho", explain: "“để” nối với mục đích, “cho” nối với đối tượng được hưởng — đều là kết từ." },
    open: { q: "Em muốn nói gì với thầy Tâm? Viết 1–2 câu.", hint: "Câu đúng ngữ pháp, thể hiện lòng kính trọng, biết ơn thầy. VD: “Em cảm ơn thầy đã không quản mưa gió sang sông dạy chúng em.”" },
  }),
  P({
    id: "buc-tranh-cua-ha", kinds: ["cuoi-hk1"], title: "Bức tranh của Hà",
    text: `Trường tổ chức cuộc thi vẽ tranh với chủ đề “Gia đình em”. Hà háo hức lắm. Suốt mấy buổi tối, em cặm cụi vẽ cảnh cả nhà quây quần bên mâm cơm: bố đang gắp thức ăn cho bà, mẹ mỉm cười, còn Hà thì ngồi cạnh bà.

Chỉ còn một ngày nữa là nộp tranh. Bé Bin, em trai Hà, vừa tròn ba tuổi, lon ton chạy vào phòng. Bin với tay lấy cốc nước trên bàn, chẳng may làm đổ cả vào bức tranh. Màu nước loang lổ, nhòe hết một góc. Hà òa khóc. Bin sợ hãi đứng nép sau cánh cửa.

Mẹ nhẹ nhàng ôm Hà vào lòng:

– Bức tranh hỏng, con có thể vẽ lại. Nhưng em con đang rất sợ, con có thấy không?

Hà quay lại nhìn em. Đôi mắt Bin đỏ hoe. Hà lau nước mắt, kéo em vào lòng rồi nói:

– Không sao đâu, chị vẽ lại cho cả Bin vào tranh nữa nhé!

Tối hôm ấy, Hà vẽ lại bức tranh. Lần này, bên mâm cơm gia đình có thêm cậu bé Bin đang cười toe toét. Bức tranh không được giải Nhất, nhưng cô giáo đã dán nó lên bảng tin của lớp với lời nhận xét: “Bức tranh ấm áp nhất.”`,
    questions: [
      { q: "Cuộc thi vẽ tranh của trường có chủ đề gì?", options: ["Gia đình em", "Quê hương em", "Mái trường mến yêu", "Em yêu thiên nhiên"], answer: "Gia đình em", explain: "Cuộc thi “với chủ đề “Gia đình em””." },
      { q: "Vì sao bức tranh đầu tiên của Hà bị hỏng?", options: ["Bin làm đổ cốc nước vào tranh", "Hà để quên tranh ngoài mưa", "Bin vẽ bậy lên tranh", "Con mèo làm rách tranh"], answer: "Bin làm đổ cốc nước vào tranh", explain: "Bin “chẳng may làm đổ cả vào bức tranh”." },
      { q: "Khi thấy chị khóc, Bin đã làm gì?", options: ["Sợ hãi đứng nép sau cánh cửa", "Cười thật to", "Chạy đi mách bố", "Lấy bút vẽ tiếp vào tranh"], answer: "Sợ hãi đứng nép sau cánh cửa", explain: "“Bin sợ hãi đứng nép sau cánh cửa.”" },
      { q: "Lời nói của mẹ giúp Hà nhận ra điều gì?", options: ["Em trai đang rất sợ và cần được chị an ủi", "Bức tranh không quan trọng chút nào", "Hà vẽ chưa đẹp", "Bin cần bị phạt thật nặng"], answer: "Em trai đang rất sợ và cần được chị an ủi", explain: "Mẹ nói: “em con đang rất sợ, con có thấy không?”" },
      { q: "Bức tranh vẽ lại có gì khác bức tranh đầu tiên?", options: ["Có thêm hình cậu bé Bin đang cười", "Được vẽ bằng bút chì", "Không có hình bà", "Vẽ cảnh cả nhà đi công viên"], answer: "Có thêm hình cậu bé Bin đang cười", explain: "“bên mâm cơm gia đình có thêm cậu bé Bin đang cười toe toét”." },
      { q: "Câu chuyện khuyên em điều gì?", options: ["Biết yêu thương, bao dung với người thân", "Không nên tham gia thi vẽ", "Nên vẽ tranh thật nhanh", "Chỉ vẽ khi có người lớn ngồi cạnh"], answer: "Biết yêu thương, bao dung với người thân", explain: "Hà tha thứ, ôm em vào lòng và vẽ cả em vào tranh." },
    ],
    ltvc: { q: "Trong câu “Không sao đâu, chị vẽ lại cho cả Bin vào tranh nữa nhé!”, Hà dùng từ “chị” để làm gì?", options: ["Để tự xưng khi nói với em", "Để gọi mẹ", "Để gọi cô giáo", "Để gọi bà"], answer: "Để tự xưng khi nói với em", explain: "Hà là chị của Bin; “chị” là từ Hà dùng để xưng hô, chỉ chính mình khi nói với em." },
    open: { q: "Nếu là Hà, em có tha thứ cho bé Bin không? Vì sao? Viết 1–2 câu.", hint: "Nêu rõ ý kiến và lí do hợp lí, câu đúng ngữ pháp. VD: “Em sẽ tha thứ cho Bin vì em còn nhỏ và không cố ý.”" },
  }),

  /* ═════════════ GIỮA HỌC KÌ II ═════════════ */
  P({
    id: "cay-gao-dau-lang", kinds: ["giua-hk2"], title: "Cây gạo đầu làng",
    text: `Ở đầu làng tôi có một cây gạo già. Thân cây to đến mức ba đứa trẻ dang tay ôm mới xuể. Rễ cây nổi lên mặt đất, ngoằn ngoèo như những con rắn lớn.

Mùa xuân đến, cây gạo bắt đầu trổ hoa. Hàng ngàn bông hoa đỏ rực bừng lên như hàng ngàn ngọn lửa thắp sáng cả một góc trời. Chim chóc từ khắp nơi bay về. Chào mào, sáo sậu, sáo đen… đàn đàn lũ lũ lượn lên lượn xuống, gọi nhau ríu rít. Cây gạo như một ngày hội tưng bừng.

Gốc gạo là nơi hẹn hò của lũ trẻ chúng tôi. Chiều chiều, chúng tôi rủ nhau ra đó nhặt hoa rụng, xâu thành những chuỗi vòng đỏ thắm. Người lớn đi làm đồng về cũng hay dừng chân dưới bóng cây nghỉ mát.

Rồi tôi lớn lên, đi học xa nhà. Mỗi lần về quê, từ xa tôi đã nhìn thấy ngọn gạo cao vút. Cây gạo vẫn đứng đó, lặng lẽ và hiền hậu như một người ông già đón đứa cháu đi xa trở về.`,
    questions: [
      { q: "Thân cây gạo đầu làng to như thế nào?", options: ["Ba đứa trẻ dang tay ôm mới xuể", "Một đứa trẻ ôm vừa", "To bằng cái cột nhà", "Nhỏ như cây chuối"], answer: "Ba đứa trẻ dang tay ôm mới xuể", explain: "“Thân cây to đến mức ba đứa trẻ dang tay ôm mới xuể.”" },
      { q: "Cây gạo trổ hoa vào mùa nào?", options: ["Mùa xuân", "Mùa hạ", "Mùa thu", "Mùa đông"], answer: "Mùa xuân", explain: "“Mùa xuân đến, cây gạo bắt đầu trổ hoa.”" },
      { q: "Những bông hoa gạo được so sánh với hình ảnh nào?", options: ["Hàng ngàn ngọn lửa", "Những chiếc ô nhỏ", "Những ngôi sao", "Những chiếc lá đỏ"], answer: "Hàng ngàn ngọn lửa", explain: "“như hàng ngàn ngọn lửa thắp sáng cả một góc trời”." },
      { q: "Gốc gạo gắn với kỉ niệm nào của tác giả và các bạn?", options: ["Nhặt hoa rụng xâu thành những chuỗi vòng", "Trèo lên cây bắt chim", "Ngồi học bài dưới gốc cây", "Hái hoa gạo mang ra chợ bán"], answer: "Nhặt hoa rụng xâu thành những chuỗi vòng", explain: "“chúng tôi rủ nhau ra đó nhặt hoa rụng, xâu thành những chuỗi vòng đỏ thắm”." },
      { q: "Ở câu cuối bài, cây gạo được so sánh với ai?", options: ["Một người ông già đón cháu trở về", "Một người mẹ hiền", "Một người bạn nhỏ", "Một người lính gác"], answer: "Một người ông già đón cháu trở về", explain: "“như một người ông già đón đứa cháu đi xa trở về”." },
      { q: "Bài văn thể hiện tình cảm gì của tác giả?", options: ["Tình yêu và nỗi nhớ quê hương", "Nỗi sợ cây gạo già", "Mong muốn chặt cây gạo đi", "Niềm vui khi được rời xa quê"], answer: "Tình yêu và nỗi nhớ quê hương", explain: "Tác giả nhớ cây gạo, nhớ kỉ niệm tuổi thơ mỗi lần về quê." },
    ],
    ltvc: { q: "Câu nào dưới đây trong bài là câu ghép?", options: ["Mùa xuân đến, cây gạo bắt đầu trổ hoa.", "Chim chóc từ khắp nơi bay về.", "Cây gạo như một ngày hội tưng bừng.", "Gốc gạo là nơi hẹn hò của lũ trẻ chúng tôi."], answer: "Mùa xuân đến, cây gạo bắt đầu trổ hoa.", explain: "Câu có hai vế: “Mùa xuân / đến” và “cây gạo / bắt đầu trổ hoa”, mỗi vế có chủ ngữ và vị ngữ riêng." },
    open: { q: "Ở nơi em sống có cảnh vật nào gắn bó với em? Viết 1–2 câu về cảnh vật đó.", hint: "Nêu được tên cảnh vật và tình cảm của em; câu đúng ngữ pháp." },
  }),
  P({
    id: "cho-noi-tren-song", kinds: ["giua-hk2"], title: "Chợ nổi trên sông",
    text: `Trời còn mờ sáng, khúc sông đã nhộn nhịp hẳn lên. Hàng trăm chiếc ghe, chiếc xuồng từ khắp các ngả kênh rạch đổ về, nối đuôi nhau thành một khu chợ lênh đênh trên mặt nước. Đó là chợ nổi – nét đẹp riêng của miền sông nước Nam Bộ.

Ở chợ nổi, người ta không cần rao hàng. Mỗi chiếc ghe dựng một cây sào cao, gọi là cây bẹo. Bán thứ gì, người ta treo thứ ấy lên cây bẹo: ghe treo mấy trái bí, ghe treo chùm khóm, ghe lại treo cả nải chuối chín vàng. Nhìn cây bẹo, khách mua biết ngay ghe ấy bán gì.

Tiếng máy nổ xình xịch, tiếng mái chèo khua nước, tiếng mời chào, mặc cả vang lên khắp nơi. Những chiếc xuồng nhỏ len lỏi giữa các ghe lớn, bán hủ tiếu, cà phê nóng cho người đi chợ. Mùi trái cây chín thơm lừng lan khắp mặt sông.

Khi mặt trời lên cao, chợ thưa dần. Các ghe lần lượt tỏa đi, mang theo hàng hóa về những miền quê. Mặt sông lại trở về vẻ yên ả vốn có.`,
    questions: [
      { q: "Chợ nổi bắt đầu nhộn nhịp vào lúc nào?", options: ["Lúc trời còn mờ sáng", "Vào buổi trưa", "Vào buổi tối", "Lúc nửa đêm"], answer: "Lúc trời còn mờ sáng", explain: "“Trời còn mờ sáng, khúc sông đã nhộn nhịp hẳn lên.”" },
      { q: "Chợ nổi là nét đẹp riêng của vùng nào?", options: ["Miền sông nước Nam Bộ", "Vùng núi Tây Bắc", "Vùng biển miền Trung", "Thủ đô Hà Nội"], answer: "Miền sông nước Nam Bộ", explain: "“nét đẹp riêng của miền sông nước Nam Bộ”." },
      { q: "Cây bẹo dùng để làm gì?", options: ["Treo hàng để khách biết ghe bán gì", "Để chèo ghe", "Để buộc ghe vào bờ", "Để phơi quần áo"], answer: "Treo hàng để khách biết ghe bán gì", explain: "“Bán thứ gì, người ta treo thứ ấy lên cây bẹo.”" },
      { q: "Những âm thanh nào vang lên ở chợ nổi?", options: ["Tiếng máy nổ, tiếng mái chèo, tiếng mời chào, mặc cả", "Tiếng chuông chùa", "Tiếng còi tàu hỏa", "Tiếng gà gáy"], answer: "Tiếng máy nổ, tiếng mái chèo, tiếng mời chào, mặc cả", explain: "Bài kể “Tiếng máy nổ xình xịch, tiếng mái chèo khua nước, tiếng mời chào, mặc cả”." },
      { q: "Khi mặt trời lên cao, chợ nổi thay đổi thế nào?", options: ["Thưa dần, các ghe lần lượt tỏa đi", "Đông vui hơn", "Mới bắt đầu họp", "Bị mưa to làm tan"], answer: "Thưa dần, các ghe lần lượt tỏa đi", explain: "“Khi mặt trời lên cao, chợ thưa dần. Các ghe lần lượt tỏa đi”." },
      { q: "Bài văn giới thiệu điều gì?", options: ["Cảnh họp chợ độc đáo trên sông ở Nam Bộ", "Cách đóng một chiếc ghe", "Cách trồng chuối, trồng bí", "Một chuyến đi biển"], answer: "Cảnh họp chợ độc đáo trên sông ở Nam Bộ", explain: "Cả bài tả cảnh chợ nổi từ lúc họp đến lúc tan." },
    ],
    ltvc: { q: "Dấu gạch ngang trong câu “Đó là chợ nổi – nét đẹp riêng của miền sông nước Nam Bộ.” dùng để làm gì?", options: ["Đánh dấu phần chú thích, giải thích", "Đánh dấu lời nói của nhân vật", "Nối các từ ngữ trong một liên danh", "Đánh dấu các ý được liệt kê"], answer: "Đánh dấu phần chú thích, giải thích", explain: "Phần sau dấu gạch ngang giải thích thêm chợ nổi là gì." },
    open: { q: "Em thích nhất hình ảnh nào trong bài? Vì sao? Viết 1–2 câu.", hint: "Nêu đúng một hình ảnh trong bài và lí do hợp lí; câu đúng ngữ pháp." },
  }),

  /* ═════════════ CUỐI HỌC KÌ II ═════════════ */
  P({
    id: "nhung-luong-rau-tren-dao", kinds: ["cuoi-hk2"], title: "Những luống rau trên đảo",
    text: `Đảo nhỏ giữa biển khơi quanh năm nắng gió. Đất trên đảo toàn cát và san hô, cây cối rất khó mọc. Vậy mà trong khu doanh trại của các chú bộ đội vẫn xanh mướt những luống rau cải, rau muống.

Để có được những luống rau ấy, các chú phải làm việc rất vất vả. Đất được chở từ đất liền ra bằng tàu, từng bao một. Nước ngọt trên đảo rất quý, các chú dùng nước vo gạo, nước rửa rau để tưới cây. Những ngày có bão, các chú lấy lưới, lấy bạt che chắn cho từng luống rau như che chở cho những đứa con nhỏ.

Chú Hải là người chăm vườn giỏi nhất đảo. Chú bảo: “Rau xanh trên đảo không chỉ để ăn. Nhìn thấy màu xanh, anh em thấy như quê hương đang ở rất gần.” Mỗi khi có tàu ra thăm đảo, chú lại hái những bó rau tươi nhất để tặng khách.

Giữa mênh mông sóng nước, những luống rau xanh như lời khẳng định: các chú vẫn ngày đêm vững vàng giữ gìn từng tấc đất, tấc biển thiêng liêng của Tổ quốc.`,
    questions: [
      { q: "Vì sao trồng rau trên đảo rất khó?", options: ["Vì đất toàn cát, san hô và nước ngọt rất quý", "Vì trên đảo có nhiều chuột", "Vì các chú không có hạt giống", "Vì trên đảo mưa quanh năm"], answer: "Vì đất toàn cát, san hô và nước ngọt rất quý", explain: "“Đất trên đảo toàn cát và san hô” và “Nước ngọt trên đảo rất quý”." },
      { q: "Đất để trồng rau trên đảo được lấy từ đâu?", options: ["Chở từ đất liền ra bằng tàu", "Đào từ đáy biển", "Mua ở chợ trên đảo", "Lấy trên núi của đảo"], answer: "Chở từ đất liền ra bằng tàu", explain: "“Đất được chở từ đất liền ra bằng tàu, từng bao một.”" },
      { q: "Các chú bộ đội tưới rau bằng gì?", options: ["Nước vo gạo, nước rửa rau", "Nước biển", "Nước khoáng đóng chai", "Nước giếng khoan"], answer: "Nước vo gạo, nước rửa rau", explain: "“các chú dùng nước vo gạo, nước rửa rau để tưới cây”." },
      { q: "Những ngày có bão, các chú làm gì để giữ rau?", options: ["Lấy lưới, lấy bạt che chắn cho từng luống rau", "Nhổ hết rau mang vào nhà", "Bỏ mặc vườn rau", "Gieo hạt rau mới"], answer: "Lấy lưới, lấy bạt che chắn cho từng luống rau", explain: "“các chú lấy lưới, lấy bạt che chắn cho từng luống rau”." },
      { q: "Theo chú Hải, rau xanh trên đảo còn có ý nghĩa gì?", options: ["Giúp anh em thấy quê hương như đang ở rất gần", "Để bán lấy tiền", "Để trang trí doanh trại", "Để làm thức ăn cho cá"], answer: "Giúp anh em thấy quê hương như đang ở rất gần", explain: "“Nhìn thấy màu xanh, anh em thấy như quê hương đang ở rất gần.”" },
      { q: "Bài đọc ca ngợi điều gì?", options: ["Sự kiên trì và tinh thần vững vàng giữ đảo của các chú bộ đội", "Vẻ đẹp của biển lúc bình minh", "Cách nấu canh rau muống", "Những con tàu chở hàng"], answer: "Sự kiên trì và tinh thần vững vàng giữ đảo của các chú bộ đội", explain: "Các chú vất vả trồng rau và “ngày đêm vững vàng giữ gìn từng tấc đất, tấc biển”." },
    ],
    ltvc: { q: "Câu “Vậy mà trong khu doanh trại của các chú bộ đội vẫn xanh mướt những luống rau cải, rau muống.” liên kết với câu đứng trước bằng từ ngữ nối nào?", options: ["Vậy mà", "các chú", "xanh mướt", "rau muống"], answer: "Vậy mà", explain: "“Vậy mà” là từ ngữ nối, thể hiện ý trái ngược với câu trước (đất khó trồng cây)." },
    open: { q: "Em muốn gửi lời nhắn gì tới các chú bộ đội trên đảo? Viết 1–2 câu.", hint: "Lời nhắn chân thành (cảm ơn, chúc sức khỏe, hứa học tốt…); câu đúng ngữ pháp." },
  }),
  P({
    id: "nhung-chai-nhua-no-hoa", kinds: ["cuoi-hk2"], title: "Những chai nhựa biết nở hoa",
    text: `Sau giờ ra chơi, sân trường lại ngổn ngang chai nhựa, vỏ hộp sữa. Nhìn cảnh ấy, Mai – lớp trưởng lớp 5C – nghĩ mãi một cách để giúp sân trường sạch đẹp hơn.

Tối hôm đó, Mai đọc được một bài báo về những chậu cây làm từ chai nhựa. Hôm sau, em trình bày ý tưởng trước lớp: mỗi bạn gom chai nhựa đã dùng, rửa sạch, cắt đôi, rồi trồng vào đó một cây hoa nhỏ. Cả lớp hưởng ứng nhiệt liệt.

Chỉ sau hai tuần, dọc hành lang lớp 5C đã treo đầy những chậu hoa xinh xắn. Nào hoa mười giờ đỏ thắm, nào cúc vàng rực rỡ, nào sen đá xanh mát. Các lớp khác thấy vậy cũng làm theo. Sân trường vắng hẳn bóng chai nhựa bị vứt bừa bãi.

Cuối năm, cô hiệu trưởng khen ngợi lớp 5C trước toàn trường. Mai cười: “Chúng em chỉ muốn những chiếc chai nhựa được nở hoa thay vì nằm trên mặt đất.” Từ một ý tưởng nhỏ, cả trường đã cùng nhau làm một việc có ích cho môi trường.`,
    questions: [
      { q: "Điều gì khiến Mai suy nghĩ?", options: ["Sân trường ngổn ngang chai nhựa, vỏ hộp sữa sau giờ ra chơi", "Lớp em không có cây xanh", "Mai muốn được làm lớp trưởng", "Trường sắp có cuộc thi vẽ"], answer: "Sân trường ngổn ngang chai nhựa, vỏ hộp sữa sau giờ ra chơi", explain: "“Sau giờ ra chơi, sân trường lại ngổn ngang chai nhựa, vỏ hộp sữa.”" },
      { q: "Mai tìm ra ý tưởng từ đâu?", options: ["Từ một bài báo về chậu cây làm từ chai nhựa", "Do cô giáo gợi ý", "Do mẹ kể cho nghe", "Từ một bộ phim hoạt hình"], answer: "Từ một bài báo về chậu cây làm từ chai nhựa", explain: "“Mai đọc được một bài báo về những chậu cây làm từ chai nhựa.”" },
      { q: "Để làm chậu hoa, các bạn đã làm những việc gì?", options: ["Gom chai nhựa, rửa sạch, cắt đôi rồi trồng cây hoa", "Mua chậu mới ở chợ", "Vẽ tranh lên chai nhựa", "Bán chai nhựa lấy tiền mua hoa"], answer: "Gom chai nhựa, rửa sạch, cắt đôi rồi trồng cây hoa", explain: "“mỗi bạn gom chai nhựa đã dùng, rửa sạch, cắt đôi, rồi trồng vào đó một cây hoa nhỏ”." },
      { q: "Sau hai tuần, hành lang lớp 5C thay đổi thế nào?", options: ["Treo đầy những chậu hoa xinh xắn", "Đầy chai nhựa vứt bừa bãi", "Được sơn màu mới", "Có thêm bàn ghế"], answer: "Treo đầy những chậu hoa xinh xắn", explain: "“dọc hành lang lớp 5C đã treo đầy những chậu hoa xinh xắn”." },
      { q: "Ý tưởng của Mai đã mang lại kết quả gì cho cả trường?", options: ["Các lớp cùng làm theo, sân trường sạch đẹp hơn", "Mai được nhận nhiều quà", "Lớp 5C được nghỉ học", "Các bạn bán được nhiều hoa"], answer: "Các lớp cùng làm theo, sân trường sạch đẹp hơn", explain: "“Các lớp khác thấy vậy cũng làm theo. Sân trường vắng hẳn bóng chai nhựa”." },
      { q: "Câu chuyện muốn nhắn nhủ em điều gì?", options: ["Mỗi việc làm nhỏ đều có thể góp phần bảo vệ môi trường", "Không nên uống sữa hộp", "Chỉ lớp trưởng mới cần giữ vệ sinh", "Hoa mười giờ là loài hoa đẹp nhất"], answer: "Mỗi việc làm nhỏ đều có thể góp phần bảo vệ môi trường", explain: "“Từ một ý tưởng nhỏ, cả trường đã cùng nhau làm một việc có ích cho môi trường.”" },
    ],
    ltvc: { q: "Trong câu “Các lớp khác thấy vậy cũng làm theo.”, từ “vậy” thay thế cho nội dung nào?", options: ["Việc lớp 5C treo những chậu hoa làm từ chai nhựa", "Việc Mai đọc báo", "Việc cô hiệu trưởng khen lớp 5C", "Việc sân trường có nhiều rác"], answer: "Việc lớp 5C treo những chậu hoa làm từ chai nhựa", explain: "“vậy” thay cho việc ở câu trước: hành lang lớp 5C treo đầy chậu hoa — đây là cách liên kết câu bằng thay thế từ ngữ." },
    open: { q: "Em có ý tưởng gì để giữ gìn trường lớp sạch đẹp? Viết 1–2 câu.", hint: "Nêu được một việc làm cụ thể, khả thi; câu đúng ngữ pháp." },
  }),
];

/* ═════════════ Ngân hàng luyện từ và câu (câu 8, câu 9 — 1 điểm/câu) ═════════════ */

export type LtvcTopic = "dong-nghia" | "da-nghia" | "dai-tu" | "ket-tu" | "cau-ghep" | "lien-ket" | "dau-gach-ngang";

const M = (q: string, answer: string, wrong: string[], explain: string): TvMcq => ({ q, options: [answer, ...wrong], answer, explain });

export const LTVC_BANK: Record<LtvcTopic, TvMcq[]> = {
  "dong-nghia": [
    M("Từ nào đồng nghĩa với từ “siêng năng”?", "chăm chỉ", ["lười biếng", "thông minh", "nhanh nhẹn"], "“Siêng năng” và “chăm chỉ” cùng chỉ người làm việc đều đặn, không ngại khó."),
    M("Từ nào đồng nghĩa với từ “dũng cảm”?", "gan dạ", ["nhút nhát", "hiền lành", "cẩn thận"], "“Dũng cảm” và “gan dạ” cùng chỉ người không sợ nguy hiểm."),
    M("Dòng nào gồm các từ đồng nghĩa với từ “Tổ quốc”?", "đất nước, non sông, giang sơn", ["làng xóm, phố phường, thôn bản", "ruộng đồng, núi rừng, sông suối", "đồng bào, nhân dân, dân tộc"], "“Đất nước, non sông, giang sơn” đều chỉ Tổ quốc."),
    M("Từ nào KHÔNG đồng nghĩa với các từ còn lại?", "dữ dằn", ["hiền lành", "hiền hậu", "nhân hậu"], "Ba từ kia cùng chỉ tính tốt, hiền; “dữ dằn” mang nghĩa ngược lại."),
    M("Dòng nào gồm các từ đồng nghĩa?", "xanh biếc, xanh thẳm, xanh ngắt", ["xanh, đỏ, tím", "trắng, đen, vàng", "cao, thấp, dài"], "Các từ “xanh biếc, xanh thẳm, xanh ngắt” đều chỉ màu xanh (đồng nghĩa không hoàn toàn)."),
    M("Từ “thoăn thoắt” trong câu “Đôi tay mẹ thoăn thoắt nhặt rau.” gần nghĩa với từ nào nhất?", "nhanh nhẹn", ["chậm chạp", "mệt mỏi", "lười nhác"], "“Thoăn thoắt” tả động tác nhanh, liên tục — gần nghĩa với “nhanh nhẹn”."),
    M("Từ nào đồng nghĩa với từ “to lớn”?", "khổng lồ", ["bé nhỏ", "tí hon", "xinh xắn"], "“Khổng lồ” chỉ kích thước rất lớn."),
  ],
  "da-nghia": [
    M("Trong câu nào, từ “chân” được dùng với nghĩa gốc?", "Bé bị đau chân.", ["Chân núi phủ đầy mây.", "Cái bàn bị gãy một chân.", "Mẹ đứng chờ ở chân cầu thang."], "Nghĩa gốc của “chân” là bộ phận cơ thể dùng để đi, đứng."),
    M("Trong câu nào, từ “mắt” được dùng với nghĩa chuyển?", "Quả na đã mở mắt.", ["Mắt em bé đen láy.", "Bà đeo kính vì mắt kém.", "Em dụi mắt rồi thức dậy."], "“Mắt” của quả na là các múi nở ra trên vỏ — nghĩa chuyển."),
    M("Trong câu nào, từ “ăn” được dùng với nghĩa gốc?", "Cả nhà quây quần ăn cơm tối.", ["Tàu đang ăn hàng ở cảng.", "Da em bé rất ăn nắng.", "Hai màu áo này rất ăn nhau."], "Nghĩa gốc của “ăn” là đưa thức ăn vào miệng."),
    M("Từ “đầu” trong câu “Lan đứng đầu hàng.” mang nghĩa gì?", "Vị trí trước tiên", ["Bộ phận trên cùng của cơ thể", "Mái tóc", "Suy nghĩ"], "“Đầu hàng” là vị trí trước tiên của hàng — nghĩa chuyển."),
    M("Trong câu nào, từ “lá” được dùng với nghĩa chuyển?", "Em viết lá thư gửi bà.", ["Lá bàng đỏ rực.", "Gió thổi lá rơi xào xạc.", "Chú sâu gặm lá cải."], "“Lá thư” là tờ thư mỏng như chiếc lá — nghĩa chuyển."),
    M("Từ “ngọt” trong câu “Bạn ấy nói rất ngọt.” có nghĩa là gì?", "Dịu dàng, dễ nghe", ["Có vị như đường", "Rất sắc bén", "Rất lạnh"], "“Nói ngọt” là lời nói dịu dàng, dễ nghe — nghĩa chuyển của “ngọt”."),
  ],
  "dai-tu": [
    M("Trong câu “Nam ơi, tớ cho cậu mượn quyển truyện nhé!”, các đại từ xưng hô là:", "tớ, cậu", ["Nam, quyển", "cho, mượn", "truyện, nhé"], "“tớ” chỉ người nói, “cậu” chỉ người nghe."),
    M("Trong câu “Ai là người đã trồng hàng cây ở sân trường?”, đại từ dùng để hỏi là:", "Ai", ["người", "trồng", "hàng cây"], "“Ai” là đại từ nghi vấn, dùng để hỏi về người."),
    M("Câu nào có đại từ xưng hô?", "Chúng em cùng nhau quét lớp.", ["Mặt trời mọc ở đằng đông.", "Cây phượng nở hoa đỏ rực.", "Con mèo nằm sưởi nắng."], "“Chúng em” là đại từ xưng hô chỉ nhóm người nói."),
    M("Trong đoạn “Bé có một chú mèo. Nó rất thích nằm sưởi nắng.”, từ “Nó” thay thế cho từ ngữ nào?", "chú mèo", ["Bé", "nắng", "sưởi"], "“Nó” là đại từ thay thế cho “chú mèo” ở câu trước."),
    M("Trong câu “Bạn định đi đâu đấy?”, từ nào là đại từ dùng để hỏi?", "đâu", ["định", "đi", "đấy"], "“đâu” là đại từ nghi vấn, dùng để hỏi về nơi chốn."),
    M("Trong đoạn “Mẹ dặn em học bài xong mới đi chơi. Em đã làm đúng như thế.”, từ “thế” dùng để làm gì?", "Thay thế cho việc học bài xong mới đi chơi", ["Chỉ người nói", "Hỏi về thời gian", "Chỉ nơi chốn"], "“thế” là đại từ thay thế cho nội dung đã nói ở câu trước."),
  ],
  "ket-tu": [
    M("Chọn kết từ thích hợp điền vào chỗ trống: “Vì trời mưa to … trận đấu bị hoãn.”", "nên", ["nhưng", "thì", "hay"], "Cặp kết từ “vì … nên” chỉ nguyên nhân – kết quả."),
    M("Chọn kết từ thích hợp điền vào chỗ trống: “Tuy nhà xa … bạn Minh chưa bao giờ đi học muộn.”", "nhưng", ["nên", "thì", "và"], "Cặp kết từ “tuy … nhưng” chỉ quan hệ tương phản."),
    M("Chọn kết từ thích hợp điền vào chỗ trống: “Em đến thư viện … mượn sách.”", "để", ["của", "nhưng", "hay"], "“để” nối với mục đích của hành động."),
    M("Chọn kết từ thích hợp điền vào chỗ trống: “Quyển sách … Nam bị bỏ quên trên bàn.”", "của", ["bằng", "để", "nhưng"], "“của” chỉ quan hệ sở hữu."),
    M("Chọn kết từ thích hợp điền vào chỗ trống: “Chúng em đi tham quan … ô tô.”", "bằng", ["của", "để", "nhưng"], "“bằng” chỉ phương tiện."),
    M("Chọn kết từ thích hợp điền vào chỗ trống: “Con muốn uống sữa … nước cam?”", "hay", ["nhưng", "nên", "vì"], "“hay” chỉ quan hệ lựa chọn."),
    M("Kết từ trong câu “Mẹ mua cho em một quyển truyện và một hộp bút màu.” là từ nào?", "và", ["mua", "cho em", "hộp"], "“và” nối hai sự vật cùng loại (quan hệ đồng thời)."),
  ],
  "cau-ghep": [
    M("Câu nào dưới đây là câu ghép?", "Trời nắng, chim hót líu lo.", ["Những chú chim hót líu lo trên cành.", "Sáng nay, em đi học rất sớm.", "Bạn Lan và bạn Hoa đều học giỏi."], "“Trời / nắng” và “chim / hót líu lo” là hai vế câu, mỗi vế có chủ ngữ, vị ngữ riêng."),
    M("Câu ghép “Mưa rào ào ạt, sấm chớp đùng đùng.” có mấy vế câu?", "2 vế", ["1 vế", "3 vế", "4 vế"], "Hai vế: “Mưa rào / ào ạt” và “sấm chớp / đùng đùng”."),
    M("Các vế trong câu ghép “Vì bạn Nam chăm chỉ nên bạn ấy học rất giỏi.” được nối với nhau bằng gì?", "Cặp kết từ “vì … nên”", ["Dấu phẩy", "Dấu chấm phẩy", "Không dùng từ nối"], "Hai vế được nối bằng cặp kết từ “vì … nên”."),
    M("Câu ghép nào có các vế được nối trực tiếp, không dùng từ nối?", "Mặt trời lên cao, sương tan dần.", ["Trời mưa nên đường trơn.", "Tuy nhà xa nhưng Hà đi học đúng giờ.", "Nếu em chăm học thì em sẽ tiến bộ."], "Hai vế chỉ ngăn cách bằng dấu phẩy, không có kết từ."),
    M("Chọn vế câu thích hợp để hoàn thành câu ghép: “Tuy trời rét đậm, …”", "nhưng các bạn vẫn đến lớp đúng giờ", ["nên các bạn ở nhà", "vì các bạn mặc áo ấm", "thì các bạn được nghỉ học"], "“Tuy … nhưng …” là cặp kết từ chỉ quan hệ tương phản."),
    M("Cặp kết từ “Nếu … thì …” trong câu “Nếu trời đẹp thì lớp em đi cắm trại.” thể hiện quan hệ gì?", "Điều kiện – kết quả", ["Nguyên nhân – kết quả", "Tương phản", "Tăng tiến"], "“Nếu … thì …” nêu điều kiện (giả thiết) và kết quả."),
    M("Cặp kết từ “Không những … mà còn …” thể hiện quan hệ gì giữa các vế câu?", "Tăng tiến", ["Tương phản", "Nguyên nhân – kết quả", "Lựa chọn"], "Vế sau nói thêm ý ở mức cao hơn vế trước — quan hệ tăng tiến."),
  ],
  "lien-ket": [
    M("Hai câu “Ông em là một người lính. Ông đã từng chiến đấu ở Điện Biên Phủ.” được liên kết bằng cách nào?", "Lặp lại từ ngữ", ["Thay thế từ ngữ", "Dùng từ ngữ nối", "Không có liên kết"], "Từ “Ông” ở câu đầu được lặp lại ở câu sau."),
    M("Hai câu “Bé Mai rất thích vẽ. Em thường vẽ tranh về biển.” được liên kết bằng cách nào?", "Thay thế từ ngữ", ["Lặp lại từ ngữ", "Dùng từ ngữ nối", "Không có liên kết"], "Từ “Em” ở câu sau thay thế cho “Bé Mai” ở câu trước."),
    M("Hai câu “Trời đổ mưa to. Tuy vậy, các bạn vẫn đến lớp đầy đủ.” được liên kết bằng cách nào?", "Dùng từ ngữ nối", ["Lặp lại từ ngữ", "Thay thế từ ngữ", "Không có liên kết"], "“Tuy vậy” là từ ngữ nối hai câu."),
    M("Chọn từ ngữ nối thích hợp: “Lan học rất chăm. …, bạn ấy luôn đạt điểm cao.”", "Vì vậy", ["Tuy nhiên", "Trái lại", "Thế nhưng"], "Câu sau là kết quả của câu trước nên dùng “Vì vậy”."),
    M("Trong đoạn “Cánh đồng lúa đã chín vàng. Nó trải dài tới tận chân trời.”, từ “Nó” thay thế cho từ ngữ nào?", "Cánh đồng lúa", ["chân trời", "chín vàng", "tận"], "“Nó” thay thế cho “Cánh đồng lúa” ở câu trước."),
  ],
  "dau-gach-ngang": [
    M("Dấu gạch ngang trong câu “Bạn Minh – lớp trưởng lớp 5A – vừa đạt giải Nhất cuộc thi vẽ.” dùng để làm gì?", "Đánh dấu phần chú thích, giải thích", ["Đánh dấu lời nói của nhân vật", "Nối các từ ngữ trong một liên danh", "Đánh dấu các ý được liệt kê"], "“lớp trưởng lớp 5A” giải thích thêm về bạn Minh."),
    M("Dấu gạch ngang đặt ở đầu dòng trong đoạn hội thoại dùng để làm gì?", "Đánh dấu chỗ bắt đầu lời nói của nhân vật", ["Đánh dấu phần chú thích", "Nối các từ ngữ trong một liên danh", "Kết thúc câu hỏi"], "Mỗi lượt lời của nhân vật bắt đầu bằng dấu gạch ngang."),
    M("Dấu gạch ngang trong cụm từ “chuyến tàu Hà Nội – Hải Phòng” dùng để làm gì?", "Nối các từ ngữ trong một liên danh", ["Đánh dấu lời nói của nhân vật", "Đánh dấu phần chú thích", "Đánh dấu các ý được liệt kê"], "Dấu gạch ngang nối hai địa danh là điểm đầu và điểm cuối của chuyến tàu."),
    M("Câu “Nhớ con sông quê, nhớ bến đò, nhớ cánh diều tuổi thơ.” sử dụng biện pháp nghệ thuật nào?", "Điệp từ", ["So sánh", "Nhân hóa", "Nói quá"], "Từ “nhớ” được lặp lại nhiều lần để nhấn mạnh nỗi nhớ."),
  ],
};

export const LTVC_TOPIC_NAMES: Record<LtvcTopic, string> = {
  "dong-nghia": "từ đồng nghĩa", "da-nghia": "từ đa nghĩa", "dai-tu": "đại từ", "ket-tu": "kết từ",
  "cau-ghep": "câu ghép", "lien-ket": "liên kết câu", "dau-gach-ngang": "dấu gạch ngang, điệp từ",
};

/** Chủ đề của câu 8 và câu 9 theo kì. */
export const LTVC_BY_KIND: Record<ExamKind, [LtvcTopic, LtvcTopic]> = {
  "giua-hk1": ["dong-nghia", "da-nghia"],
  "cuoi-hk1": ["dai-tu", "ket-tu"],
  "giua-hk2": ["cau-ghep", "dau-gach-ngang"],
  "cuoi-hk2": ["lien-ket", "dau-gach-ngang"],
};

/* ═════════════ Kiểm tra viết (tập làm văn) ═════════════ */

export const WRITING_PROMPTS: Record<ExamKind, string[]> = {
  "giua-hk1": [
    "Viết bài văn kể lại một câu chuyện cổ tích mà em yêu thích, trong đó có thêm những chi tiết sáng tạo của em (thay đổi kết thúc, thêm nhân vật, …).",
    "Viết bài văn tả cảnh một buổi sáng (hoặc một buổi chiều) ở nơi em sống.",
    "Viết bài văn tả cảnh trường em trước giờ vào học.",
  ],
  "cuoi-hk1": [
    "Viết bài văn tả một cảnh đẹp ở quê hương em (một dòng sông, một cánh đồng, một ngọn núi, một bãi biển, …).",
    "Hãy tưởng tượng em là một nhân vật trong câu chuyện em đã đọc. Viết bài văn kể lại câu chuyện đó theo lời của nhân vật, có thêm những chi tiết sáng tạo.",
    "Viết đoạn văn (khoảng 8–10 câu) nêu tình cảm, cảm xúc của em về một nhân vật trong câu chuyện em đã đọc hoặc đã nghe.",
  ],
  "giua-hk2": [
    "Viết bài văn tả một người thân trong gia đình em.",
    "Viết bài văn tả thầy giáo hoặc cô giáo đã để lại cho em nhiều ấn tượng.",
    "Viết đoạn văn (khoảng 8–10 câu) nêu ý kiến của em về việc học sinh tham gia trồng cây, giữ gìn môi trường xanh – sạch – đẹp.",
  ],
  "cuoi-hk2": [
    "Viết bài văn tả một người bạn thân của em.",
    "Viết đoạn văn (khoảng 8–10 câu) nêu ý kiến tán thành hoặc phản đối việc học sinh tiểu học sử dụng điện thoại thông minh.",
    "Viết bài văn tả một cảnh đẹp mà em đã được ngắm nhìn trong dịp hè hoặc trong một chuyến tham quan.",
    "Viết bài văn kể lại một câu chuyện về lòng biết ơn, trong đó có thêm những chi tiết sáng tạo của em.",
  ],
};
