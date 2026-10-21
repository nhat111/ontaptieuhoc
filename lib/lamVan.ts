// lib/lamVan.ts
// Hướng dẫn làm văn (phần B. Kiểm tra viết) Tiếng Việt lớp 5 cho trang /lam-van/lop-5.
// Nội dung viết tay, theo các dạng bài viết trong chương trình lớp 5 (GDPT 2018) đúng như
// các đề ở WRITING_PROMPTS (lib/exam5/tvContent.ts): mỗi đề lớp 5 phải thuộc một dạng ở
// đây — scripts/lam-van-check.ts kiểm tra. Bài tham khảo là bài tự viết, không chép SGK
// hay sách văn mẫu; dùng ngoặc kép cong “ ”, không dùng ngoặc thẳng.

import { WRITING_PROMPTS } from "./exam5/tvContent";

export type GuideId = "ta-canh" | "ta-nguoi" | "ke-chuyen-sang-tao" | "cam-xuc-nhan-vat" | "neu-y-kien";

export interface OutlinePart {
  /** "Mở bài" / "Thân bài" / "Kết bài", hoặc "Câu mở đoạn"… với đoạn văn. */
  part: string;
  points: string[];
}

export interface WritingTip {
  title: string;
  text: string;
  /** Câu ví dụ minh hoạ mẹo. */
  example?: string;
}

export interface WritingGuide {
  id: GuideId;
  /** Tên ngắn trên thẻ, mục lục. */
  name: string;
  title: string;
  /** Một câu giới thiệu dạng bài. */
  blurb: string;
  /** Bài văn (3 phần) hay đoạn văn (một đoạn). */
  form: "bai-van" | "doan-van";
  outline: OutlinePart[];
  tips: WritingTip[];
  openings: { label: string; text: string }[];
  endings: { label: string; text: string }[];
  words: { label: string; items: string[] }[];
  sample: { prompt: string; paragraphs: string[]; note: string };
  mistakes: string[];
  /** Mục tự kiểm tra riêng của dạng bài, thêm vào sau CHECKLIST chung. */
  check: string[];
}

/** Các bước làm bài trong 40 phút của phần Kiểm tra viết. */
export const STEPS: { title: string; minutes: string; text: string }[] = [
  {
    title: "Đọc kĩ đề, gạch chân từ quan trọng",
    minutes: "2 phút",
    text: "Đề bắt viết bài văn hay đoạn văn? Kể, tả hay nêu ý kiến? Kể, tả về ai, về cái gì? Đề có đòi hỏi thêm gì không, như “có thêm chi tiết sáng tạo”, “theo lời của nhân vật”, “khoảng 8–10 câu”?",
  },
  {
    title: "Chọn điều em biết rõ nhất, lập dàn ý ra nháp",
    minutes: "5 phút",
    text: "Tả người em gần gũi nhất, cảnh em đã tận mắt thấy, câu chuyện em nhớ rõ nhất. Dàn ý chỉ cần ghi ý chính bằng vài chữ cho mỗi phần.",
  },
  {
    title: "Viết bài theo dàn ý",
    minutes: "25–28 phút",
    text: "Mỗi ý lớn viết thành một đoạn, đầu đoạn lùi vào một ô. Viết đến đâu nhìn dàn ý đến đó để không sót ý, không lạc đề.",
  },
  {
    title: "Đọc lại và sửa",
    minutes: "5 phút",
    text: "Soát chính tả, dấu câu, chữ viết hoa; gạch bớt từ bị lặp; thêm từ cho câu còn thiếu ý. Dùng bảng tự kiểm tra ở cuối mỗi dạng bài.",
  },
];

/** Mẹo viết hay dùng được cho mọi dạng bài. */
export const GENERAL_TIPS: WritingTip[] = [
  {
    title: "Viết bằng nhiều giác quan",
    text: "Không chỉ mắt nhìn: tai nghe tiếng gì, mũi ngửi mùi gì, tay chạm thấy thế nào.",
    example: "Nắng sớm vàng nhạt như mật ong, rải lên mái ngói còn đọng sương.",
  },
  {
    title: "So sánh, nhân hoá — vừa đủ, đúng chỗ",
    text: "Một vài hình ảnh so sánh, nhân hoá làm bài sinh động; dùng quá nhiều thì rối.",
    example: "Hàng phượng đứng nghiêm như những người lính gác cổng trường.",
  },
  {
    title: "Chọn chi tiết riêng, đừng viết chung chung",
    text: "Thay lời khen chung bằng một nét chỉ người, cảnh ấy mới có.",
    example: "Thay “Mẹ em rất đẹp” bằng “Mẹ có nốt ruồi nhỏ bên khoé miệng, mỗi lần mẹ cười nó lại như nhảy lên.”",
  },
  {
    title: "Nói cảm xúc thật của em",
    text: "Người đọc nhớ bài văn có tình cảm. Xen vào bài vài câu nói em nghĩ gì, thấy thế nào.",
    example: "Mỗi lần bước qua cổng trường, em lại thấy lòng mình rộn ràng như ngày đầu đi học.",
  },
  {
    title: "Xen câu dài với câu ngắn, nối các đoạn cho liền",
    text: "Toàn câu dài thì mệt, toàn câu ngắn thì cụt. Đầu đoạn dùng từ nối để chuyển ý.",
    example: "“Bước vào cổng trường, …”, “Gần trưa, …”, “Không chỉ … mà còn …”",
  },
];

/** Bảng tự kiểm tra chung — dùng cho mọi dạng bài. */
export const CHECKLIST: string[] = [
  "Bài viết đúng yêu cầu của đề: đúng kiểu bài (kể, tả hay nêu ý kiến), đúng đối tượng.",
  "Không lặp một từ quá nhiều lần.",
  "Mỗi câu kết thúc bằng dấu câu; viết hoa chữ đầu câu và tên riêng.",
  "Có câu nói lên cảm xúc, suy nghĩ thật của em.",
  "Chữ viết rõ ràng, không sai chính tả.",
];

export const FORM_CHECK: Record<WritingGuide["form"], string> = {
  "bai-van": "Bài có đủ ba phần: mở bài, thân bài, kết bài; thân bài chia thành vài đoạn.",
  "doan-van": "Bài viết liền một đoạn (chỉ lùi đầu dòng một lần), có câu mở đoạn và câu kết đoạn.",
};

/** Gợi ý biểu điểm 10 điểm — dùng cả trên trang hướng dẫn và trong hướng dẫn chấm của đề in. */
export const RUBRIC: Record<WritingGuide["form"], [string, number][]> = {
  "bai-van": [
    ["Mở bài đúng yêu cầu", 1.5],
    ["Thân bài đủ ý, có trình tự, có hình ảnh và cảm xúc", 5],
    ["Kết bài", 1.5],
    ["Chữ viết rõ ràng, đúng chính tả", 0.5],
    ["Dùng từ, đặt câu đúng", 0.5],
    ["Bài viết có sáng tạo", 1],
  ],
  "doan-van": [
    ["Câu mở đoạn nêu đúng vấn đề", 1.5],
    ["Các câu phát triển đủ ý, có dẫn chứng và cảm xúc", 5],
    ["Câu kết đoạn", 1.5],
    ["Chữ viết rõ ràng, đúng chính tả", 0.5],
    ["Dùng từ, đặt câu đúng; viết đúng hình thức đoạn văn", 0.5],
    ["Bài viết có sáng tạo", 1],
  ],
};

/** Đề "đoạn văn" hay "bài văn" — dùng được cho đề mọi lớp (chọn biểu điểm). */
export const formOfPrompt = (prompt: string): WritingGuide["form"] =>
  /đoạn văn/i.test(prompt) ? "doan-van" : "bai-van";

export const GUIDES: WritingGuide[] = [
  {
    id: "ta-canh",
    name: "Tả cảnh",
    title: "Viết bài văn tả cảnh",
    blurb: "Vẽ lại một cảnh bằng lời: trường em, dòng sông, cánh đồng, một buổi sáng ở nơi em sống…",
    form: "bai-van",
    outline: [
      { part: "Mở bài", points: ["Giới thiệu cảnh định tả: cảnh gì, ở đâu, em ngắm cảnh vào lúc nào."] },
      {
        part: "Thân bài",
        points: [
          "Tả bao quát: nhìn chung, cảnh rộng hay nhỏ, màu sắc nổi bật là gì.",
          "Tả chi tiết theo một trình tự: theo không gian (từ xa đến gần, từ ngoài vào trong) hoặc theo thời gian (sáng sớm → trưa → chiều).",
          "Chọn 3–4 cảnh vật nổi bật nhất, tả màu sắc, âm thanh, mùi hương và sự thay đổi của chúng.",
          "Tả cả người, con vật hoạt động trong cảnh để cảnh “sống” lên.",
        ],
      },
      { part: "Kết bài", points: ["Tình cảm, cảm nghĩ của em về cảnh; mong ước hoặc việc em sẽ làm để giữ gìn cảnh đẹp."] },
    ],
    tips: [
      {
        title: "Chọn một trình tự và giữ đến hết bài",
        text: "Đừng đang tả cổng trường lại nhảy ra sân rồi quay về cổng. Người đọc đi theo mắt em nhìn.",
      },
      {
        title: "Cho cảnh thay đổi theo thời gian",
        text: "Cảnh lúc nắng lên khác lúc sương sớm — tả sự thay đổi làm bài có chiều sâu.",
        example: "Mặt trời lên cao, sương tan dần, cánh đồng từ màu xám bạc chuyển sang xanh mướt.",
      },
      {
        title: "Đánh thức các giác quan",
        text: "Thêm tiếng chim, tiếng trống, mùi lúa non, làn gió mát trên má.",
        example: "Gió đồng thổi về mát rượi, mang theo mùi thơm ngai ngái của lúa đang thì con gái.",
      },
      {
        title: "Nhân hoá cảnh vật",
        text: "Gán cho cảnh vật hoạt động, tình cảm như người.",
        example: "Dòng sông khẽ trở mình, ôm lấy bãi ngô non xanh mướt.",
      },
    ],
    openings: [
      {
        label: "Mở bài trực tiếp",
        text: "Trường em nằm bên con đường nhỏ rợp bóng bàng. Em thích nhất là ngắm trường vào buổi sáng, khi trống chưa điểm giờ vào học.",
      },
      {
        label: "Mở bài gián tiếp",
        text: "Ai đi xa cũng có một nơi để nhớ. Với em, đó là dòng sông nhỏ đầu làng, nơi em lớn lên cùng những buổi chiều thả diều trên bãi cỏ.",
      },
    ],
    endings: [
      {
        label: "Kết bài không mở rộng",
        text: "Em yêu những buổi sáng ở trường, nơi ngày nào em cũng được học thêm một điều mới.",
      },
      {
        label: "Kết bài mở rộng",
        text: "Mai này dù có đi đâu, em vẫn nhớ dòng sông nhỏ đầu làng. Em tự nhủ sẽ cùng các bạn nhặt rác ven bờ để dòng sông mãi trong xanh.",
      },
    ],
    words: [
      { label: "Màu sắc", items: ["xanh mướt", "xanh ngắt", "vàng óng", "vàng ruộm", "đỏ rực", "trắng xoá", "tím biếc"] },
      { label: "Âm thanh", items: ["ríu rít", "rì rào", "lao xao", "róc rách", "ầm ào", "râm ran"] },
      { label: "Hình ảnh, cảm giác", items: ["mát rượi", "thoang thoảng", "lấp lánh", "mờ ảo", "rực rỡ", "yên ả"] },
    ],
    sample: {
      prompt: "Viết bài văn tả cảnh trường em trước giờ vào học.",
      paragraphs: [
        "Trường em nằm bên con đường nhỏ rợp bóng bàng. Mỗi buổi sáng, em thường đến sớm để ngắm ngôi trường thân yêu trước giờ vào học.",
        "Lúc em tới, trời vừa sáng hẳn. Ánh nắng đầu ngày còn nhạt, rải nhẹ lên mái ngói đỏ của ba dãy lớp học xếp thành hình chữ U. Sân trường rộng, lát gạch đỏ, vẫn còn ướt vì bác lao công vừa quét và tưới nước.",
        "Giữa sân, cây bàng già xoè tán như một chiếc ô khổng lồ. Mấy chú chim sẻ nhảy nhót trên cành, ríu rít gọi nhau như cũng đang chờ vào lớp. Dọc hai bên lối đi, những bồn hoa mười giờ đã kịp hé những cánh hồng, cánh tím xinh xinh. Gió sớm thổi qua mát rượi, mang theo mùi hoa sữa thoang thoảng từ đầu ngõ.",
        "Càng gần giờ học, sân trường càng nhộn nhịp. Các bạn học sinh lần lượt bước qua cổng, chiếc khăn quàng đỏ thắm trên vai. Nhóm thì rủ nhau đá cầu, nhóm thì túm tụm ôn bài dưới gốc bàng. Tiếng nói cười lao xao khắp sân. Cô giáo trực tuần đứng ở cổng, mỉm cười chào từng bạn.",
        "Bỗng “Tùng! Tùng! Tùng!”, tiếng trống vang lên giòn giã. Cả sân trường như lắng lại, chúng em nhanh chân xếp hàng vào lớp.",
        "Em yêu ngôi trường của em, yêu cả những phút giây trước giờ vào học. Em sẽ chăm ngoan, học giỏi để xứng đáng với mái trường đã cho em bao điều tốt đẹp.",
      ],
      note: "Tả theo thời gian (vừa sáng → gần giờ học → trống vào lớp); có màu sắc, âm thanh, mùi hương; có người hoạt động trong cảnh; mở bài và kết bài đều nói tình cảm của em.",
    },
    mistakes: [
      "Kể việc em làm (dậy sớm, ăn sáng, đi học) nhiều hơn tả cảnh.",
      "Liệt kê “có cây, có hoa, có ghế đá” mà không tả cái nào trông ra sao.",
      "Tả lộn xộn, không theo trình tự nào.",
      "Kết bài chỉ một câu “Em rất yêu trường em.” — chưa đủ cảm xúc.",
    ],
    check: [
      "Có đoạn tả bao quát trước khi tả chi tiết.",
      "Tả theo một trình tự: không gian hoặc thời gian.",
      "Có ít nhất một âm thanh hoặc mùi hương, và một hình ảnh so sánh hoặc nhân hoá.",
    ],
  },
  {
    id: "ta-nguoi",
    name: "Tả người",
    title: "Viết bài văn tả người",
    blurb: "Tả người thân, thầy cô, bạn bè — để người đọc như thấy người ấy hiện ra trước mắt.",
    form: "bai-van",
    outline: [
      { part: "Mở bài", points: ["Giới thiệu người định tả: là ai, có quan hệ thế nào với em, ấn tượng chung của em về người ấy."] },
      {
        part: "Thân bài",
        points: [
          "Tả ngoại hình: chọn 2–3 nét nổi bật nhất (dáng người, khuôn mặt, đôi mắt, mái tóc, nụ cười, đôi tay, cách ăn mặc). Không cần tả hết từ đầu đến chân.",
          "Tả tính tình qua việc làm, lời nói, cử chỉ: kể 1–2 việc cụ thể cho thấy người ấy hiền hậu, chăm chỉ, vui tính…",
          "Kể một kỉ niệm, hoặc nói tình cảm giữa em và người ấy.",
        ],
      },
      { part: "Kết bài", points: ["Tình cảm của em với người được tả; mong ước hoặc lời hứa của em."] },
    ],
    tips: [
      {
        title: "Ngoại hình nói lên con người",
        text: "Chọn nét ngoại hình cho thấy được cuộc sống, tính nết của người ấy.",
        example: "Đôi bàn tay bố chai sần vì bao năm cầm cày, cầm cuốc.",
      },
      {
        title: "Cho tính tình hiện ra qua việc làm",
        text: "Đừng chỉ khen. Kể một việc cụ thể, người đọc sẽ tự thấy.",
        example: "Thay “Bà rất thương con cháu” bằng “Bà để dành cho em quả ổi chín nhất vườn, gói cẩn thận trong chiếc khăn tay.”",
      },
      {
        title: "Thêm lời nói, thói quen quen thuộc",
        text: "Một câu nói hay một thói quen riêng làm nhân vật “sống” trong bài.",
        example: "Cô hay nói: “Chữ đẹp là nết người đẹp.” rồi cầm tay em uốn từng nét.",
      },
      {
        title: "Tả đúng người thật",
        text: "“Mắt to tròn, tóc đen dài” thì ai cũng giống ai. Hãy nhìn kĩ người em tả và ghi lại nét chỉ người ấy có.",
      },
    ],
    openings: [
      {
        label: "Mở bài trực tiếp",
        text: "Trong gia đình, người em yêu quý nhất là bà nội. Năm nay bà đã gần bảy mươi tuổi nhưng vẫn nhanh nhẹn, ngày nào cũng ra vườn chăm cây.",
      },
      {
        label: "Mở bài gián tiếp",
        text: "Mỗi lần cầm viên phấn trắng lên bảng, em lại nhớ đến cô Lan — cô giáo chủ nhiệm năm lớp ba, người đã dạy em viết những nét chữ nắn nót đầu tiên.",
      },
    ],
    endings: [
      {
        label: "Kết bài không mở rộng",
        text: "Em rất yêu bà. Em mong bà luôn mạnh khoẻ để mãi kể chuyện cổ tích cho em nghe.",
      },
      {
        label: "Kết bài mở rộng",
        text: "Dù sau này lên lớp trên, em vẫn nhớ mãi giọng nói ấm áp và ánh mắt hiền từ của cô. Em tự hứa sẽ học thật chăm để cô vui lòng.",
      },
    ],
    words: [
      { label: "Dáng người", items: ["cao dong dỏng", "nhỏ nhắn", "thấp đậm", "mảnh khảnh", "rắn rỏi"] },
      { label: "Khuôn mặt, đôi mắt", items: ["phúc hậu", "bầu bĩnh", "hiền từ", "đen láy", "sáng long lanh", "nheo lại khi cười"] },
      { label: "Tính tình", items: ["hiền hậu", "chu đáo", "vui tính", "tận tuỵ", "nghiêm khắc mà ấm áp", "hay giúp đỡ mọi người"] },
    ],
    sample: {
      prompt: "Viết bài văn tả một người thân trong gia đình em.",
      paragraphs: [
        "Trong gia đình, người em yêu quý nhất là bà nội. Năm nay bà đã gần bảy mươi tuổi nhưng vẫn nhanh nhẹn, sáng nào cũng dậy sớm ra vườn tưới rau.",
        "Bà nhỏ người, lưng hơi còng. Mái tóc bà bạc trắng như cước, lúc nào cũng được búi gọn sau gáy. Khuôn mặt bà có nhiều nếp nhăn, nhất là ở khoé mắt; mỗi khi bà cười, những nếp nhăn ấy lại xoè ra như những tia nắng nhỏ. Mắt bà đã kém, đọc báo phải đeo kính, nhưng ánh nhìn lúc nào cũng hiền từ. Em thích nhất đôi bàn tay bà: gầy, nổi gân xanh, ram ráp mà rất ấm.",
        "Bà em là người chịu thương chịu khó. Mảnh vườn sau nhà được bà chia thành từng luống rau cải, rau thơm thẳng tắp. Buổi tối, bà vừa nhặt rau vừa kể cho em nghe chuyện “Tấm Cám”, chuyện “Sọ Dừa”. Giọng bà chậm rãi, ấm áp; nhiều hôm em ngủ thiếp đi lúc nào không hay. Có lần em bị sốt, bà thức gần như cả đêm, cứ một lúc lại đặt tay lên trán em, khẽ hỏi: “Cháu đỡ chưa?”.",
        "Em rất yêu bà. Em mong bà luôn mạnh khoẻ để em được nghe bà kể chuyện thật nhiều năm nữa. Em sẽ ngoan ngoãn, chăm học để bà vui lòng.",
      ],
      note: "Chỉ chọn vài nét riêng (tóc búi, nếp nhăn khi cười, đôi tay ấm) và kể việc làm cụ thể (chăm vườn, kể chuyện, thức đêm khi em ốm) để thấy tính tình — không có câu khen chung chung nào.",
    },
    mistakes: [
      "Tả ngoại hình như bản kê: “Mắt bà đen, mũi bà cao, miệng bà nhỏ…” mà không chọn nét nổi bật.",
      "Chỉ khen chung “bà rất hiền, rất tốt” mà không có việc làm nào chứng minh.",
      "Biến bài tả thành bài kể một câu chuyện dài.",
      "Cách gọi không thống nhất: lúc “bà”, lúc “cụ”, lúc “người”.",
    ],
    check: [
      "Chọn được 2–3 nét ngoại hình nổi bật, riêng của người ấy.",
      "Có ít nhất một việc làm cụ thể cho thấy tính tình.",
      "Có một kỉ niệm, một lời nói hoặc một thói quen của người ấy.",
    ],
  },
  {
    id: "ke-chuyen-sang-tao",
    name: "Kể chuyện sáng tạo",
    title: "Viết bài văn kể chuyện sáng tạo",
    blurb: "Kể lại câu chuyện đã đọc, đã nghe — thêm chi tiết mới, đổi kết thúc, hoặc kể bằng lời của nhân vật.",
    form: "bai-van",
    outline: [
      {
        part: "Mở bài",
        points: [
          "Giới thiệu câu chuyện: tên truyện, em đọc hay nghe ở đâu, em định sáng tạo điều gì.",
          "Nếu kể theo lời nhân vật: nhân vật tự giới thiệu “Tôi là …”.",
        ],
      },
      {
        part: "Thân bài",
        points: [
          "Kể các sự việc theo trình tự: mở đầu → sự việc chính → lúc gay cấn nhất → kết thúc. Giữ đúng các sự việc chính của truyện.",
          "Thêm chi tiết sáng tạo: tả thêm cảnh, thêm suy nghĩ, cảm xúc của nhân vật, thêm lời đối thoại, thêm một nhân vật phụ hoặc đổi kết thúc — nhưng phải hợp với tính cách nhân vật.",
          "Nếu kể theo lời nhân vật: xưng “tôi” từ đầu đến cuối, kể những gì nhân vật thấy, nghe, nghĩ.",
        ],
      },
      { part: "Kết bài", points: ["Kết thúc câu chuyện (như truyện, hoặc kết thúc mới của em) và điều em rút ra từ câu chuyện."] },
    ],
    tips: [
      {
        title: "Sáng tạo nhưng không bịa lung tung",
        text: "Chi tiết mới phải hợp với nhân vật và không làm mất sự việc chính. Cô Tấm hiền lành thì đừng để cô trả thù độc ác.",
      },
      {
        title: "Thêm lời thoại cho nhân vật",
        text: "Lời nói làm câu chuyện sinh động. Nhớ dấu hai chấm và dấu ngoặc kép (hoặc xuống dòng, gạch đầu dòng).",
        example: "Chim ăn xong, cất tiếng: “Ăn một quả, trả cục vàng, may túi ba gang, mang đi mà đựng.”",
      },
      {
        title: "Kể cả suy nghĩ, cảm xúc",
        text: "Cho người đọc biết nhân vật nghĩ gì, sợ gì, mong gì.",
        example: "Tôi run lên vì sợ, nhưng nghĩ tới mẹ đang chờ ở nhà, tôi lại bước tiếp.",
      },
      {
        title: "Giữ một cách xưng hô",
        text: "Đã xưng “tôi” thì giữ đến hết bài, đừng chuyển sang gọi “cậu bé”, “chàng”.",
      },
    ],
    openings: [
      {
        label: "Mở bài giới thiệu truyện",
        text: "Trong những câu chuyện cổ tích bà kể, em nhớ nhất là truyện “Cây khế”. Em đã thử tưởng tượng một kết thúc khác cho người anh tham lam.",
      },
      {
        label: "Mở bài theo lời nhân vật",
        text: "Tôi là Sọ Dừa. Ngày tôi ra đời, ai cũng sợ hãi vì tôi không có chân tay, tròn lông lốc như một quả dừa.",
      },
    ],
    endings: [
      {
        label: "Kết bài nêu bài học",
        text: "Câu chuyện “Cây khế” giúp em hiểu: sống tham lam thì có thể mất tất cả, còn sống thật thà, biết đủ sẽ được mọi người yêu quý.",
      },
      {
        label: "Kết bài bằng kết thúc mới",
        text: "Từ hôm ấy, người anh không còn tham lam nữa. Anh trồng thêm một cây khế bên nhà người em, và hai anh em lại sống hoà thuận như ngày cha mẹ còn.",
      },
    ],
    words: [
      { label: "Từ nối thời gian", items: ["ngày xửa ngày xưa", "một hôm", "sáng hôm sau", "ít lâu sau", "bỗng nhiên", "cuối cùng"] },
      { label: "Cảm xúc nhân vật", items: ["mừng rỡ", "sửng sốt", "bàng hoàng", "ân hận", "hồi hộp", "nhẹ nhõm"] },
      { label: "Dẫn lời thoại", items: ["hỏi", "đáp", "reo lên", "thì thầm", "nói như mếu", "ôn tồn bảo"] },
    ],
    sample: {
      prompt: "Viết bài văn kể lại một câu chuyện cổ tích mà em yêu thích, trong đó có thêm những chi tiết sáng tạo của em.",
      paragraphs: [
        "Trong những câu chuyện cổ tích bà kể, em nhớ nhất là truyện “Cây khế”. Em đã thử tưởng tượng một kết thúc khác cho người anh tham lam.",
        "Ngày xưa, có hai anh em mồ côi cha mẹ. Khi chia gia tài, người anh lấy hết nhà cửa, ruộng vườn, chỉ để lại cho người em một túp lều nhỏ và cây khế ở góc vườn. Người em chăm chỉ chăm cây, đến mùa, cây khế trĩu quả, chín vàng cả một góc vườn.",
        "Một hôm, có con chim lạ bay đến ăn khế. Người em buồn rầu than thở, chim bèn nói: “Ăn một quả, trả cục vàng, may túi ba gang, mang đi mà đựng.” Người em may đúng túi ba gang, được chim chở ra đảo xa lấy vàng, từ đó trở nên khá giả.",
        "Nghe chuyện, người anh vội đổi cả gia tài lấy cây khế. Chim đến, anh may túi mười hai gang. Ra tới đảo, anh nhét vàng đầy túi, giắt cả vào người. Bay qua biển, chim mỏi cánh, chao nghiêng. Túi vàng nặng trĩu tuột khỏi vai, người anh hoảng hốt ôm chặt cổ chim, nghĩ thầm: “Chẳng lẽ vì mấy cục vàng mà ta phải bỏ mạng nơi này?”",
        "Chim cố sức bay về bờ, đặt anh xuống bãi cát rồi nói: “Ta cứu anh vì nhớ ơn người em tốt bụng. Của cải không quý bằng tình anh em.” Người anh ngồi lặng hồi lâu, nhìn túi vàng chìm dần dưới sóng mà không hề tiếc. Anh hiểu ra mình đã sai.",
        "Về nhà, người anh tìm đến xin lỗi em. Hai anh em cùng trồng thêm một cây khế mới, chia nhau từng mùa quả ngọt. Câu chuyện giúp em hiểu: tham lam thì có thể mất tất cả, còn biết nhận lỗi và thương yêu nhau mới là điều quý nhất.",
      ],
      note: "Giữ đủ các sự việc chính của truyện, chỉ đổi phần cuối; thêm suy nghĩ của người anh và lời của chim để kết thúc mới hợp lí.",
    },
    mistakes: [
      "Kể lại y nguyên truyện, không có chi tiết sáng tạo nào trong khi đề yêu cầu.",
      "Sáng tạo quá đà: làm sai tính cách nhân vật hoặc bỏ mất sự việc chính.",
      "Đang xưng “tôi” lại chuyển sang gọi tên nhân vật.",
      "Lời thoại không có dấu câu, người đọc không biết ai đang nói.",
    ],
    check: [
      "Đủ các sự việc chính, kể đúng trình tự.",
      "Có ít nhất một chi tiết sáng tạo hợp lí (nếu đề yêu cầu).",
      "Lời thoại có dấu hai chấm và dấu ngoặc kép (hoặc gạch đầu dòng).",
    ],
  },
  {
    id: "cam-xuc-nhan-vat",
    name: "Cảm xúc về nhân vật",
    title: "Viết đoạn văn nêu tình cảm, cảm xúc về một nhân vật",
    blurb: "Viết một đoạn khoảng 8–10 câu nói lên em yêu mến, khâm phục hay thương nhân vật nào và vì sao.",
    form: "doan-van",
    outline: [
      { part: "Câu mở đoạn", points: ["Giới thiệu nhân vật (tên, trong truyện nào) và nói chung tình cảm của em với nhân vật."] },
      {
        part: "Các câu phát triển",
        points: [
          "Nêu 2–3 điều đáng quý ở nhân vật; mỗi điều kèm một chi tiết, một việc làm trong truyện làm dẫn chứng.",
          "Nói cảm xúc của em trước chi tiết ấy: xúc động, khâm phục, thương cảm, vui mừng…",
          "Có thể nói thêm: nhân vật giúp em học được điều gì.",
        ],
      },
      { part: "Câu kết đoạn", points: ["Khẳng định lại tình cảm của em, hoặc nêu mong muốn, bài học."] },
    ],
    tips: [
      {
        title: "Viết thành một đoạn",
        text: "Chỉ lùi đầu dòng một lần, không xuống dòng giữa chừng. Viết xong đếm lại: khoảng 8–10 câu là vừa.",
      },
      {
        title: "Mỗi cảm xúc cần một dẫn chứng",
        text: "Nói em khâm phục điều gì, rồi chỉ ra chi tiết nào trong truyện làm em khâm phục.",
        example: "Em khâm phục Gióng vì khi roi sắt gãy, Gióng nhổ ngay bụi tre bên đường quật vào giặc.",
      },
      {
        title: "Dùng từ chỉ cảm xúc cho đa dạng",
        text: "Đừng lặp “em rất thích” nhiều lần. Thay bằng: yêu mến, cảm phục, xúc động, thương…",
      },
      {
        title: "Không kể lại cả truyện",
        text: "Chỉ nhắc những chi tiết cần cho ý của em. Phần lớn đoạn văn là cảm xúc, suy nghĩ của em.",
      },
    ],
    openings: [
      {
        label: "Câu mở đoạn",
        text: "Trong truyện “Thánh Gióng”, nhân vật em yêu thích và khâm phục nhất là cậu bé làng Gióng.",
      },
      {
        label: "Câu mở đoạn",
        text: "Đọc truyện “Sọ Dừa”, em vô cùng quý mến Sọ Dừa — một chàng trai xấu xí mà tài giỏi, tốt bụng.",
      },
    ],
    endings: [
      { label: "Câu kết đoạn", text: "Em mong mình cũng có lòng yêu nước và sự dũng cảm như người anh hùng làng Gióng." },
      { label: "Câu kết đoạn", text: "Nhân vật Sọ Dừa giúp em hiểu: không nên đánh giá một người qua vẻ bề ngoài." },
    ],
    words: [
      { label: "Tình cảm, cảm xúc", items: ["yêu mến", "quý trọng", "khâm phục", "cảm phục", "xúc động", "thương cảm", "tự hào"] },
      { label: "Phẩm chất nhân vật", items: ["dũng cảm", "kiên trì", "thật thà", "nhân hậu", "hiếu thảo", "tài giỏi", "biết ơn"] },
      { label: "Từ nối ý", items: ["trước hết", "không chỉ … mà còn …", "đặc biệt", "vì thế", "chính vì vậy"] },
    ],
    sample: {
      prompt: "Viết đoạn văn (khoảng 8–10 câu) nêu tình cảm, cảm xúc của em về một nhân vật trong câu chuyện em đã đọc hoặc đã nghe.",
      paragraphs: [
        "Trong truyện “Thánh Gióng”, nhân vật em yêu thích và khâm phục nhất là cậu bé làng Gióng. Lên ba tuổi, Gióng vẫn chưa biết nói, chưa biết cười. Vậy mà khi nghe sứ giả đi tìm người đánh giặc, cậu bỗng cất tiếng nói đầu tiên để xin đi giết giặc cứu nước. Chi tiết ấy làm em rất xúc động, vì tiếng nói đầu tiên của Gióng là tiếng nói của lòng yêu nước. Em càng thấy thú vị khi Gióng lớn nhanh như thổi, cả làng góp gạo nuôi cậu. Khi roi sắt gãy, Gióng nhổ ngay những bụi tre bên đường quật vào giặc. Em cảm phục sự dũng cảm và nhanh trí của Gióng: gặp khó khăn vẫn không lùi bước. Đánh tan giặc, Gióng không ở lại nhận thưởng mà cưỡi ngựa bay về trời. Điều đó cho em thấy Gióng đánh giặc vì đất nước chứ không vì bản thân. Em mong mình cũng có lòng yêu nước và sự dũng cảm như người anh hùng làng Gióng.",
      ],
      note: "Đúng một đoạn, mười câu. Mỗi cảm xúc (xúc động, thú vị, cảm phục) đi kèm một chi tiết trong truyện; câu đầu và câu cuối đều nói tình cảm của em.",
    },
    mistakes: [
      "Kể lại gần hết câu chuyện, hầu như không nói cảm xúc của em.",
      "Chia thành nhiều đoạn, xuống dòng liên tục.",
      "Chỉ có cảm xúc chung chung (“em rất thích nhân vật này vì nhân vật này hay”) mà không có dẫn chứng.",
      "Viết quá ngắn (3–4 câu) hoặc dài quá một trang.",
    ],
    check: [
      "Khoảng 8–10 câu (hoặc đúng số câu đề yêu cầu).",
      "Câu đầu nêu rõ tên nhân vật và tình cảm của em.",
      "Mỗi cảm xúc có một chi tiết trong truyện làm dẫn chứng.",
    ],
  },
  {
    id: "neu-y-kien",
    name: "Nêu ý kiến",
    title: "Viết đoạn văn nêu ý kiến tán thành hoặc phản đối",
    blurb: "Nói rõ em tán thành hay phản đối một việc, rồi đưa lí do và ví dụ để thuyết phục người đọc.",
    form: "doan-van",
    outline: [
      { part: "Câu mở đoạn", points: ["Giới thiệu vấn đề và nêu rõ ý kiến của em: tán thành (đồng ý) hay phản đối (không đồng ý)."] },
      {
        part: "Các câu phát triển",
        points: [
          "Đưa ra 2–3 lí do, mỗi lí do mở đầu bằng từ nối: thứ nhất, thứ hai, hơn nữa…",
          "Mỗi lí do kèm một ví dụ: việc em đã thấy, đã làm ở trường, ở nhà.",
          "Có thể nhắc tới ý kiến ngược lại và giải thích vì sao em vẫn giữ ý kiến của mình.",
        ],
      },
      { part: "Câu kết đoạn", points: ["Khẳng định lại ý kiến; nêu lời khuyên hoặc đề nghị."] },
    ],
    tips: [
      {
        title: "Chọn một phía và giữ đến cuối",
        text: "Đầu đoạn tán thành thì cuối đoạn vẫn tán thành. Đừng viết “vừa tốt vừa không tốt” mà không chốt ý.",
      },
      {
        title: "Lí do nào cũng cần ví dụ",
        text: "Lí do làm người đọc hiểu, ví dụ làm người đọc tin.",
        example: "Trồng cây làm không khí mát mẻ hơn. Từ khi lớp em trồng hàng cây trước cửa, giờ ra chơi sân trường mát hẳn.",
      },
      {
        title: "Dùng từ nối lập luận",
        text: "Từ nối giúp các lí do rõ ràng, nối tiếp nhau.",
        example: "thứ nhất, thứ hai, hơn nữa, bởi vì, chẳng hạn, vì vậy, tóm lại",
      },
      {
        title: "Lời lẽ lịch sự, ôn hoà",
        text: "Phản đối một việc làm chứ không chê bai, chế giễu người khác.",
      },
    ],
    openings: [
      { label: "Câu mở đoạn — phản đối", text: "Theo em, học sinh tiểu học chưa nên có điện thoại thông minh riêng." },
      { label: "Câu mở đoạn — tán thành", text: "Em hoàn toàn tán thành việc học sinh tham gia trồng cây, giữ gìn môi trường xanh – sạch – đẹp." },
    ],
    endings: [
      { label: "Câu kết đoạn", text: "Vì vậy, em mong các bạn hãy cùng trồng và chăm sóc cây để trường lớp mình ngày càng xanh hơn." },
      { label: "Câu kết đoạn", text: "Tóm lại, khi còn nhỏ, chúng ta nên dành thời gian cho sách vở, vui chơi và gia đình hơn là cho chiếc điện thoại." },
    ],
    words: [
      { label: "Nêu ý kiến", items: ["theo em", "em cho rằng", "em tán thành", "em không đồng ý", "em tin rằng"] },
      { label: "Nối lí do", items: ["thứ nhất", "thứ hai", "hơn nữa", "ngoài ra", "bởi vì", "chẳng hạn"] },
      { label: "Kết luận", items: ["vì vậy", "chính vì thế", "tóm lại", "như vậy"] },
    ],
    sample: {
      prompt: "Viết đoạn văn (khoảng 8–10 câu) nêu ý kiến tán thành hoặc phản đối việc học sinh tiểu học sử dụng điện thoại thông minh.",
      paragraphs: [
        "Theo em, học sinh tiểu học chưa nên có điện thoại thông minh riêng. Thứ nhất, dùng điện thoại nhiều rất hại mắt và sức khoẻ. Em có một người bạn mải chơi điện tử trên điện thoại đến khuya, mới lớp năm đã phải đeo kính. Thứ hai, điện thoại dễ làm chúng ta sao nhãng việc học. Chỉ một tin nhắn hay một đoạn phim ngắn cũng có thể kéo ta rời bài tập hàng giờ liền. Hơn nữa, trên mạng có nhiều thông tin không phù hợp với trẻ em mà chúng ta chưa đủ hiểu biết để tránh. Có bạn cho rằng điện thoại giúp tra cứu bài học, nhưng việc đó hoàn toàn có thể làm cùng bố mẹ trên máy tính ở nhà. Vì vậy, khi còn học tiểu học, chúng ta nên dành thời gian cho sách vở, vui chơi và gia đình. Em mong các bạn hãy cùng nói “không” với chiếc điện thoại riêng.",
      ],
      note: "Câu đầu chốt ngay ý kiến phản đối; ba lí do có từ nối (thứ nhất, thứ hai, hơn nữa), hai lí do có ví dụ; có nhắc ý kiến ngược lại rồi trả lời; câu cuối nêu lời khuyên.",
    },
    mistakes: [
      "Không nói rõ em tán thành hay phản đối.",
      "Chỉ nêu lí do mà không có ví dụ nào.",
      "Lặp một lí do bằng nhiều cách nói khác nhau cho đủ câu.",
      "Lời lẽ chê bai, chỉ trích người khác.",
    ],
    check: [
      "Câu đầu nói rõ em tán thành hay phản đối.",
      "Có ít nhất 2 lí do, mỗi lí do có ví dụ.",
      "Có từ nối: thứ nhất, thứ hai, vì vậy…",
    ],
  },
];

export const guideById = (id: string): WritingGuide | undefined => GUIDES.find((g) => g.id === id);

/**
 * Dạng bài của một đề lớp 5 (theo cách đề hay ra). Thứ tự quan trọng: đề nêu ý kiến hay
 * nêu cảm xúc có thể có chữ "câu chuyện", nên xét trước đề kể chuyện.
 */
export function guideForPrompt(prompt: string): WritingGuide | undefined {
  const p = prompt.toLowerCase();
  if (/nêu ý kiến|tán thành|phản đối/.test(p)) return guideById("neu-y-kien");
  if (/tình cảm, cảm xúc/.test(p) && /nhân vật/.test(p)) return guideById("cam-xuc-nhan-vat");
  if (/kể lại|kể chuyện/.test(p)) return guideById("ke-chuyen-sang-tao");
  if (/tả (một )?(người|thầy|cô|bạn|ông|bà|bố|mẹ|anh|chị|em bé)/.test(p)) return guideById("ta-nguoi");
  if (/tả (một )?cảnh/.test(p)) return guideById("ta-canh");
  return undefined;
}

/** Các đề lớp 5 của Tạo đề nhanh thuộc dạng bài này — hiện ở mục "Đề thường gặp". */
export function promptsForGuide(id: GuideId): string[] {
  const all = Object.values(WRITING_PROMPTS).flat();
  return [...new Set(all)].filter((p) => guideForPrompt(p)?.id === id);
}
