// lib/lamVan.ts
// Hướng dẫn làm văn (phần Viết) Tiếng Việt lớp 5 cho trang /lam-van/lop-5.
// Các dạng bài, thứ tự và đề bài theo phần Viết của sách Tiếng Việt 5 bộ "Kết nối tri thức
// với cuộc sống" — bộ sách dùng thống nhất toàn quốc từ năm học 2026–2027 (Quyết định
// 3588/QĐ-BGDĐT); `sgk` ghi bài tương ứng trong sách. Mỗi đề lớp 5 ở WRITING_PROMPTS
// (lib/exam5/tvContent.ts) phải thuộc một dạng ở đây — scripts/lam-van-check.ts kiểm tra.
// Bài tham khảo là bài tự viết, không chép SGK hay sách văn mẫu; dùng ngoặc kép cong “ ”.

import { WRITING_PROMPTS } from "./exam5/tvContent";

export type GuideId =
  | "ke-chuyen-sang-tao" | "bao-cao-cong-viec" | "ta-canh" | "gioi-thieu-nhan-vat" | "cam-xuc-cau-chuyen"
  | "cam-xuc-bai-tho" | "ta-nguoi" | "cam-xuc-su-viec" | "chuong-trinh-hoat-dong" | "neu-y-kien";

/** Bài văn (3 phần), đoạn văn (một đoạn) hay văn bản thông thường (báo cáo, chương trình). */
export type GuideForm = "bai-van" | "doan-van" | "van-ban";
/** Dạng có trong đề kiểm tra viết — có biểu điểm 10 điểm. */
export type ExamForm = Exclude<GuideForm, "van-ban">;

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

/** Một khối của bài tham khảo: đoạn văn, dòng căn giữa / căn phải (văn bản), hoặc bảng. */
export type SampleBlock = string | { center: string } | { right: string } | { head: string[]; rows: string[][] };

export interface Sample {
  prompt: string;
  paragraphs: SampleBlock[];
  /** "Vì sao bài này được điểm cao?" */
  note: string;
}

export interface WritingGuide {
  id: GuideId;
  /** Tên ngắn trên thẻ, mục lục. */
  name: string;
  title: string;
  /** Một câu giới thiệu dạng bài. */
  blurb: string;
  form: GuideForm;
  /** Bài tương ứng trong Tiếng Việt 5 Kết nối tri thức. */
  sgk: { tap: 1 | 2; bai: string };
  outline: OutlinePart[];
  tips: WritingTip[];
  openings: { label: string; text: string }[];
  endings: { label: string; text: string }[];
  words: { label: string; items: string[] }[];
  /** Bài tham khảo — dạng bài văn có thể có nhiều bài cho nhiều đề khác nhau. */
  samples: Sample[];
  /**
   * Đề luyện thêm ngoài WRITING_PROMPTS. Dạng bài chưa có trong Tạo đề nhanh dùng chỗ
   * này: thêm đề vào WRITING_PROMPTS sẽ đổi đề viết của mọi link đề lớp 5 đã chia sẻ.
   */
  extraPrompts?: string[];
  mistakes: string[];
  /** Mục tự kiểm tra riêng của dạng bài, thêm vào sau CHECKLIST chung. */
  check: string[];
}

/** Các bước làm bài trong 40 phút của phần Kiểm tra viết. */
export const STEPS: { title: string; minutes: string; text: string }[] = [
  {
    title: "Đọc kĩ đề, gạch chân từ quan trọng",
    minutes: "2 phút",
    text: "Đề bắt viết bài văn hay đoạn văn? Kể, tả, nêu cảm xúc hay nêu ý kiến? Kể, tả về ai, về cái gì? Đề có đòi hỏi thêm gì không, như “có thêm chi tiết sáng tạo”, “theo lời của nhân vật”, “khoảng 8–10 câu”?",
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
    title: "Đọc soát và chỉnh sửa",
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
  "Bài viết đúng yêu cầu của đề: đúng kiểu bài, đúng đối tượng.",
  "Không lặp một từ quá nhiều lần.",
  "Mỗi câu kết thúc bằng dấu câu; viết hoa chữ đầu câu và tên riêng.",
  "Chữ viết rõ ràng, không sai chính tả.",
];

/** Mục tự kiểm tra theo hình thức bài, đặt trước mục riêng của dạng bài. */
export const FORM_CHECK: Record<GuideForm, string[]> = {
  "bai-van": [
    "Bài có đủ ba phần: mở bài, thân bài, kết bài; thân bài chia thành vài đoạn.",
    "Có câu nói lên cảm xúc, suy nghĩ thật của em.",
  ],
  "doan-van": [
    "Bài viết liền một đoạn (chỉ lùi đầu dòng một lần), có câu mở đoạn và câu kết đoạn.",
    "Có câu nói lên cảm xúc, suy nghĩ thật của em.",
  ],
  "van-ban": [
    "Văn bản có đủ các phần theo mẫu.",
    "Nội dung trình bày theo mục, mỗi ý một dòng bắt đầu bằng gạch ngang — ngắn gọn, đúng sự thật.",
  ],
};

/** Gợi ý biểu điểm 10 điểm — dùng cả trên trang hướng dẫn và trong hướng dẫn chấm của đề in. */
export const RUBRIC: Record<ExamForm, [string, number][]> = {
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
export const formOfPrompt = (prompt: string): ExamForm =>
  /đoạn văn/i.test(prompt) ? "doan-van" : "bai-van";

export const GUIDES: WritingGuide[] = [
  {
    id: "ke-chuyen-sang-tao",
    name: "Kể chuyện sáng tạo",
    title: "Viết bài văn kể chuyện sáng tạo",
    blurb: "Kể lại câu chuyện đã đọc, đã nghe theo cách của em: thêm chi tiết, đổi kết thúc, hoặc đóng vai nhân vật để kể.",
    form: "bai-van",
    sgk: { tap: 1, bai: "Bài 1–5" },
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
    samples: [{
      prompt: "Viết bài văn kể sáng tạo một câu chuyện cổ tích em đã đọc hoặc đã nghe (thêm chi tiết, thay đổi kết thúc hoặc đóng vai nhân vật để kể).",
      paragraphs: [
        "Trong những câu chuyện cổ tích bà kể, em nhớ nhất là truyện “Cây khế”. Em đã thử tưởng tượng một kết thúc khác cho người anh tham lam.",
        "Ngày xưa, có hai anh em mồ côi cha mẹ. Khi chia gia tài, người anh lấy hết nhà cửa, ruộng vườn, chỉ để lại cho người em một túp lều nhỏ và cây khế ở góc vườn. Người em chăm chỉ chăm cây, đến mùa, cây khế trĩu quả, chín vàng cả một góc vườn.",
        "Một hôm, có con chim lạ bay đến ăn khế. Người em buồn rầu than thở, chim bèn nói: “Ăn một quả, trả cục vàng, may túi ba gang, mang đi mà đựng.” Người em may đúng túi ba gang, được chim chở ra đảo xa lấy vàng, từ đó trở nên khá giả.",
        "Nghe chuyện, người anh vội đổi cả gia tài lấy cây khế. Chim đến, anh may túi mười hai gang. Ra tới đảo, anh nhét vàng đầy túi, giắt cả vào người. Bay qua biển, chim mỏi cánh, chao nghiêng. Túi vàng nặng trĩu tuột khỏi vai, người anh hoảng hốt ôm chặt cổ chim, nghĩ thầm: “Chẳng lẽ vì mấy cục vàng mà ta phải bỏ mạng nơi này?”",
        "Chim cố sức bay về bờ, đặt anh xuống bãi cát rồi nói: “Ta cứu anh vì nhớ ơn người em tốt bụng. Của cải không quý bằng tình anh em.” Người anh ngồi lặng hồi lâu, nhìn túi vàng chìm dần dưới sóng mà không hề tiếc. Anh hiểu ra mình đã sai.",
        "Về nhà, người anh tìm đến xin lỗi em. Hai anh em cùng trồng thêm một cây khế mới, chia nhau từng mùa quả ngọt. Câu chuyện giúp em hiểu: tham lam thì có thể mất tất cả, còn biết nhận lỗi và thương yêu nhau mới là điều quý nhất.",
      ],
      note: "Giữ đủ các sự việc chính của truyện, chỉ đổi phần cuối; thêm suy nghĩ của người anh và lời của chim để kết thúc mới hợp lí.",
    }, {
      prompt: "Viết bài văn kể sáng tạo một câu chuyện có nhân vật chính là con vật hoặc đồ vật.",
      paragraphs: [
        "Tôi là Rùa. Chắc các bạn đã nghe chuyện tôi chạy thi với anh Thỏ. Hôm nay, tôi xin kể lại cuộc thi ấy, kể cả những điều mà ít ai biết.",
        "Sáng hôm ấy, tôi đang chậm rãi tập đi bên bờ suối thì anh Thỏ nhảy tới, cười giễu: “Đi như thế thì đến bao giờ mới tới nơi?” Tôi tức lắm nhưng vẫn bình tĩnh đáp: “Anh đừng chê tôi. Ta thử chạy thi xem ai về đích trước nào!” Anh Thỏ cười lăn cười bò, nhận lời ngay.",
        "Bác Voi làm trọng tài, cả khu rừng kéo đến xem. Vừa nghe hiệu lệnh, anh Thỏ đã phóng vụt đi, chỉ còn thấy đám bụi mù. Còn tôi biết mình chậm nên cứ cắm cúi bò, không dừng lại phút nào. Nắng mỗi lúc một gắt, bốn cái chân tôi mỏi rã rời. Có lúc tôi đã định bỏ cuộc, nhưng nghĩ đến lời hứa với mọi người, tôi lại cố bò tiếp.",
        "Đi được nửa đường, tôi thấy anh Thỏ nằm ngủ ngon lành dưới gốc cây. Tôi nhẹ nhàng bò qua. Gần tới đích, tôi chợt nghe tiếng kêu sau lưng. Thì ra anh Thỏ vừa tỉnh dậy, vội chạy nên vấp phải rễ cây, đau chân không đi nổi. Tôi đứng lặng một lúc. Đích đến chỉ còn vài bước, nhưng tôi quay lại, để anh tì lên mai tôi, rồi hai chúng tôi tập tễnh cùng đi về.",
        "Cả khu rừng vỗ tay vang dội khi thấy chúng tôi cùng bước qua vạch đích. Anh Thỏ đỏ mặt, nói nhỏ: “Cảm ơn Rùa. Tôi xin lỗi vì đã coi thường bạn.” Từ hôm đó, chúng tôi trở thành đôi bạn thân.",
        "Các bạn ạ, cuộc thi ấy dạy tôi rằng chậm mà chắc thì vẫn tới đích, và giúp đỡ bạn bè còn quý hơn cả chiến thắng.",
      ],
      note: "Xưng “tôi” từ đầu đến cuối; giữ các sự việc chính (Thỏ chê Rùa, chạy thi, Thỏ ngủ quên); chi tiết sáng tạo là Rùa quay lại giúp Thỏ — hợp với tính kiên nhẫn, hiền lành của Rùa; có lời thoại và suy nghĩ của nhân vật.",
    }],
    mistakes: [
      "Kể lại y nguyên truyện, không có chi tiết sáng tạo nào trong khi đề yêu cầu.",
      "Sáng tạo quá đà: làm sai tính cách nhân vật hoặc bỏ mất sự việc chính.",
      "Đang xưng “tôi” lại chuyển sang gọi tên nhân vật.",
      "Lời thoại không có dấu câu, người đọc không biết ai đang nói.",
    ],
    check: [
      "Mở bài giới thiệu câu chuyện hấp dẫn, gây tò mò.",
      "Đủ các sự việc chính, kể đúng trình tự.",
      "Có chi tiết sáng tạo thú vị nhưng không làm đổi nội dung chính và ý nghĩa của câu chuyện.",
      "Lời thoại có dấu hai chấm và dấu ngoặc kép (hoặc gạch đầu dòng).",
    ],
  },
  {
    id: "bao-cao-cong-viec",
    name: "Báo cáo công việc",
    title: "Viết báo cáo công việc",
    blurb: "Trong vai tổ trưởng, lớp trưởng hay chi đội trưởng, báo cáo thầy cô những việc đã làm — ngắn gọn, đúng sự thật, có số liệu.",
    form: "van-ban",
    sgk: { tap: 1, bai: "Bài 6–8" },
    outline: [
      { part: "Phần đầu", points: ["Quốc hiệu, tiêu ngữ hoặc tên tổ chức (Đội, lớp…).", "Địa điểm, thời gian viết báo cáo."] },
      {
        part: "Phần chính",
        points: [
          "Tiêu đề: BÁO CÁO … (báo cáo việc gì, của ai, thời gian nào).",
          "Người nhận: Kính gửi …",
          "Nội dung: các công việc đã thực hiện, chia thành mục (học tập, nề nếp, phong trào…); mỗi ý một dòng bắt đầu bằng gạch ngang, có số liệu cụ thể; có thể kèm bảng thống kê và đề xuất.",
        ],
      },
      { part: "Phần cuối", points: ["Người viết báo cáo: chức vụ, chữ kí, họ và tên."] },
    ],
    tips: [
      {
        title: "Ghi chép, lập bảng trước khi viết",
        text: "Thu thập số liệu của cả tháng (bao nhiêu bạn, bao nhiêu lần, kết quả ra sao) rồi lập bảng thống kê — viết báo cáo sẽ rất nhanh.",
      },
      {
        title: "Số liệu cụ thể, chính xác",
        text: "Báo cáo cần con số, không cần lời khen chung chung.",
        example: "Thay “Tổ học khá tốt” bằng “6/10 bạn đạt điểm 10 bài kiểm tra Toán giữa kì.”",
      },
      {
        title: "Trình bày theo mục, gạch đầu dòng",
        text: "Mỗi mục một tiêu đề nhỏ, mỗi ý một dòng bắt đầu bằng dấu gạch ngang để thầy cô dễ theo dõi.",
      },
      {
        title: "Báo cáo không phải bài văn",
        text: "Không cần tả, không kể dài, không bộc lộ cảm xúc. Chỉ nói đã làm gì, kết quả thế nào, đề xuất gì.",
      },
    ],
    openings: [
      { label: "Phần đầu", text: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM — Độc lập – Tự do – Hạnh phúc. Hà Nội, ngày 30 tháng 10 năm 2026." },
      { label: "Tiêu đề và người nhận", text: "BÁO CÁO HOẠT ĐỘNG THÁNG 10 CỦA TỔ 2 – LỚP 5A. Kính gửi: Cô giáo chủ nhiệm lớp 5A." },
    ],
    endings: [
      { label: "Phần cuối", text: "Người viết báo cáo — Tổ trưởng — (kí) — Nguyễn Minh Anh." },
      { label: "Câu chuyển vào nội dung", text: "Em xin báo cáo các hoạt động của tổ 2 trong tháng 10 như sau:" },
    ],
    words: [
      { label: "Tên mục", items: ["Về học tập", "Về nề nếp", "Về các phong trào", "Đề xuất"] },
      { label: "Từ ngữ báo cáo", items: ["đã thực hiện", "hoàn thành", "đạt", "chưa đạt", "tham gia", "đề nghị"] },
      { label: "Số liệu", items: ["… / … bạn", "… lượt", "… lần", "… ki-lô-gam", "100%"] },
    ],
    samples: [{
      prompt: "Trong vai tổ trưởng, báo cáo cô giáo về các hoạt động của tổ trong tháng qua.",
      paragraphs: [
        { center: "CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc" },
        { right: "Hà Nội, ngày 30 tháng 10 năm 2026" },
        { center: "BÁO CÁO HOẠT ĐỘNG THÁNG 10\nCỦA TỔ 2 – LỚP 5A" },
        "Kính gửi: Cô giáo chủ nhiệm lớp 5A",
        "Em xin báo cáo các hoạt động của tổ 2 trong tháng 10 như sau:",
        "1. Về học tập",
        "– 10/10 bạn làm đủ bài tập về nhà; 6 bạn đạt điểm 10 bài kiểm tra Toán giữa kì.",
        "– Tổ đã chia nhóm giúp bạn Lan ôn bảng đơn vị đo; bạn đã tiến bộ, bài kiểm tra đạt điểm 8.",
        "2. Về nề nếp",
        "– Cả tháng tổ chỉ có 1 lượt đi học muộn (có lí do).",
        "– 2 buổi trực nhật của tổ được cô khen sạch sẽ.",
        "3. Về các phong trào",
        { head: ["Phong trào", "Kết quả của tổ"], rows: [
          ["Kế hoạch nhỏ (thu gom giấy vụn)", "12 ki-lô-gam"],
          ["Đọc sách giờ ra chơi", "10/10 bạn, mỗi bạn đọc ít nhất 2 cuốn"],
          ["Tập văn nghệ chào mừng 20 tháng 11", "Đang tập 1 tiết mục múa"],
        ] },
        "4. Đề xuất",
        "– Tổ đề nghị cô cho các bạn mắt kém được ngồi gần bảng hơn.",
        { right: "Người viết báo cáo\nTổ trưởng\n(kí)\nNguyễn Minh Anh" },
      ],
      note: "Đủ ba phần; nội dung chia mục, mỗi ý một gạch ngang; số liệu cụ thể; có bảng thống kê; lời lẽ ngắn gọn, đúng sự thật, không tả hay kể dài.",
    }],
    extraPrompts: [
      "Trong vai tổ trưởng hoặc lớp trưởng, báo cáo thầy cô về các hoạt động của tổ hoặc của lớp trong tháng qua.",
      "Trong vai chi đội trưởng, báo cáo thầy cô Tổng phụ trách Đội về các hoạt động của chi đội trong tháng qua.",
    ],
    mistakes: [
      "Viết như một bài văn kể chuyện, không chia mục.",
      "Thiếu người nhận, hoặc thiếu chữ kí, họ tên người viết.",
      "Số liệu chung chung: “nhiều bạn”, “khá tốt”.",
      "Thêm lời tả, lời bình, cảm xúc không cần thiết.",
    ],
    check: [
      "Đủ ba phần: phần đầu, phần chính, phần cuối.",
      "Có người nhận; nội dung chia mục rõ ràng, số liệu chính xác.",
      "Bảng biểu (nếu có) rõ ràng, sạch đẹp.",
    ],
  },
  {
    id: "ta-canh",
    name: "Tả phong cảnh",
    title: "Viết bài văn tả phong cảnh",
    blurb: "Vẽ lại bằng lời một cảnh thiên nhiên: ao hồ, sông suối, biển đảo, núi rừng, cánh đồng…",
    form: "bai-van",
    sgk: { tap: 1, bai: "Bài 9–16; luyện thêm ở tập hai, Bài 23–24" },
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
        text: "Đừng đang tả bờ sông lại nhảy lên bầu trời rồi quay về bờ. Người đọc đi theo mắt em nhìn.",
      },
      {
        title: "Tả kĩ nét riêng làm nên vẻ đẹp của cảnh",
        text: "Cảnh nào cũng có cây, có nước. Hãy tìm điều chỉ cảnh ấy mới có và tả kĩ hơn cả.",
        example: "Vịnh nhỏ ở quê em đẹp nhất lúc hoàng hôn, khi cả mặt nước nhuộm một màu hồng tím.",
      },
      {
        title: "Cho cảnh thay đổi theo thời gian",
        text: "Cảnh lúc nắng lên khác lúc sương sớm — tả sự thay đổi làm bài có chiều sâu.",
        example: "Mặt trời lên cao, sương tan dần, cánh đồng từ màu xám bạc chuyển sang xanh mướt.",
      },
      {
        title: "Đánh thức các giác quan",
        text: "Thêm tiếng chim, tiếng sóng, mùi lúa non, làn gió mát trên má.",
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
        text: "Quê ngoại em ở gần biển. Em thích nhất là ngắm biển vào buổi sáng sớm, khi mặt trời vừa nhô lên khỏi mặt nước.",
      },
      {
        label: "Mở bài gián tiếp",
        text: "Ai đi xa cũng có một nơi để nhớ. Với em, đó là dòng sông nhỏ đầu làng, nơi em lớn lên cùng những buổi chiều thả diều trên bãi cỏ.",
      },
    ],
    endings: [
      {
        label: "Kết bài không mở rộng",
        text: "Em yêu biển quê ngoại, nơi mùa hè nào em cũng mong được trở về.",
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
    samples: [{
      prompt: "Tả một cảnh ao hồ, sông suối ở quê hương em hoặc ở nơi gia đình em sinh sống.",
      paragraphs: [
        "Quê em có con sông nhỏ chảy uốn quanh làng. Em yêu dòng sông ấy nhất vào những buổi chiều hè, khi nắng đã dịu và gió bắt đầu thổi.",
        "Đứng trên đê nhìn xuống, dòng sông như một dải lụa xanh mềm mại vắt ngang cánh đồng. Hai bên bờ, những bãi ngô, bãi mía xanh rì nối nhau chạy mãi về phía cuối trời.",
        "Lại gần hơn, em thấy nước sông trong vắt, soi rõ bóng mây trắng và hàng tre nghiêng mình bên bến. Mặt nước lăn tăn gợn sóng mỗi khi gió thổi qua. Thỉnh thoảng, một con cá quẫy mạnh làm vỡ tan những vòng sóng tròn. Ở bến đò đầu làng, chiếc thuyền nan cũ nằm nghỉ, sợi dây buộc thuyền đung đưa theo nhịp nước.",
        "Chiều xuống, dòng sông như đông vui hẳn lên. Lũ trẻ chúng em rủ nhau ra bãi cỏ thả diều, tiếng cười giòn tan vang khắp triền đê. Các bác nông dân dắt trâu xuống sông tắm; những chú trâu đầm mình thích thú, chỉ nhô lên cái đầu với đôi sừng cong. Mặt trời đỏ ối từ từ lặn xuống sau rặng tre, nhuộm cả mặt sông thành một màu hồng tím lấp lánh.",
        "Khi những ngọn đèn trong làng bắt đầu sáng, dòng sông lại trở về vẻ yên ả. Chỉ còn tiếng nước vỗ nhẹ vào bờ và tiếng ếch nhái râm ran ngoài đồng.",
        "Dòng sông đã gắn bó với tuổi thơ của em bằng biết bao kỉ niệm. Em mong dòng sông quê mãi trong xanh và tự nhủ sẽ không bao giờ vứt rác xuống sông.",
      ],
      note: "Tả theo không gian (nhìn từ trên đê → lại gần mặt nước) rồi theo thời gian (chiều → hoàng hôn → tối); dòng sông được so sánh với dải lụa, hàng tre “nghiêng mình”; có người và con vật làm cảnh thêm sống động.",
    }, {
      prompt: "Tả một cảnh biển đảo em đã được thấy tận mắt hoặc xem trên phim ảnh.",
      paragraphs: [
        "Mùa hè năm ngoái, em được bố mẹ cho đi chơi biển Sầm Sơn. Đã gần một năm trôi qua, nhưng cảnh biển buổi sáng sớm hôm ấy vẫn in đậm trong trí nhớ của em.",
        "Khi em ra tới bờ, trời mới tờ mờ sáng. Bầu trời phía đông ửng hồng rồi chuyển dần sang màu cam rực rỡ. Mặt trời như một quả cầu lửa đỏ ối từ từ nhô lên khỏi mặt nước, rải xuống biển muôn ngàn tia sáng lấp lánh.",
        "Biển buổi sớm thật hiền hoà. Mặt biển xanh thẳm trải rộng mênh mông, xa tít tới tận chân trời. Từng con sóng nhỏ đuổi nhau vào bờ, vỗ ì oạp rồi lại rút ra, để lại trên cát những đường viền bọt trắng xoá. Bãi cát vàng mịn, mát lạnh dưới chân em. Gió biển thổi lồng lộng, mang theo vị mặn mòi và mùi rong biển.",
        "Xa xa, những chiếc thuyền đánh cá nối đuôi nhau trở về sau một đêm ra khơi, thân thuyền chở nặng cá tôm. Trên bờ, các bác ngư dân tất bật kéo lưới; các cô, các chị mua bán cá tươi rộn rã cả một góc bãi. Mấy cánh chim biển chao liệng trên đầu sóng, thỉnh thoảng lại sà xuống mặt nước như muốn trêu đùa.",
        "Mặt trời lên cao dần, biển chuyển từ màu hồng sang xanh biếc. Bãi biển bắt đầu đông vui với những người ra tắm, tiếng cười nói hoà cùng tiếng sóng rì rào.",
        "Biển buổi sáng đẹp như một bức tranh mà em không bao giờ quên. Em mong mùa hè năm nay lại được về với biển, và em sẽ nhắc mọi người không vứt rác trên bãi cát để biển mãi sạch đẹp.",
      ],
      note: "Tả theo thời gian (tờ mờ sáng → mặt trời mọc → nắng lên cao); chọn nét riêng của biển buổi sớm (mặt trời mọc, sóng, thuyền về); có màu sắc, âm thanh, mùi vị; so sánh mặt trời với quả cầu lửa; có người và chim biển làm cảnh thêm sống động.",
    }],
    mistakes: [
      "Kể việc em làm (đi chơi, ăn uống, tắm biển) nhiều hơn tả cảnh.",
      "Liệt kê “có núi, có cây, có thuyền” mà không tả cái nào trông ra sao.",
      "Tả lộn xộn, không theo trình tự nào.",
      "Kết bài chỉ một câu “Em rất yêu cảnh này.” — chưa đủ cảm xúc.",
    ],
    check: [
      "Có đoạn tả bao quát trước khi tả chi tiết.",
      "Tả theo một trình tự: không gian hoặc thời gian.",
      "Có ít nhất một âm thanh hoặc mùi hương, và một hình ảnh so sánh hoặc nhân hoá.",
    ],
  },
  {
    id: "gioi-thieu-nhan-vat",
    name: "Giới thiệu nhân vật",
    title: "Viết đoạn văn giới thiệu nhân vật trong sách, phim hoạt hình",
    blurb: "Giới thiệu một nhân vật em biết qua sách, truyện hoặc phim hoạt hình để người đọc biết và muốn làm quen.",
    form: "doan-van",
    sgk: { tap: 1, bai: "Bài 17–20 (nhân vật trong sách) và Bài 29–32 (nhân vật phim hoạt hình)" },
    outline: [
      { part: "Câu mở đoạn", points: ["Giới thiệu nhân vật: tên, xuất hiện trong cuốn sách (của ai) hoặc bộ phim nào."] },
      {
        part: "Các câu phát triển",
        points: [
          "Một vài nét ngoại hình dễ nhận ra nhất.",
          "Tính cách, tài năng — kèm một việc làm tiêu biểu của nhân vật trong truyện, phim.",
          "Điều làm nhân vật đặc biệt, khác các nhân vật khác (hoặc nhân vật đã thay đổi thế nào).",
        ],
      },
      { part: "Câu kết đoạn", points: ["Tình cảm của em với nhân vật, và lời mời người đọc tìm đọc, tìm xem."] },
    ],
    tips: [
      {
        title: "Viết cho người chưa biết nhân vật",
        text: "Tưởng tượng bạn đọc chưa từng đọc truyện ấy: họ cần biết gì để hình dung ra nhân vật?",
      },
      {
        title: "Mở đầu và kết thúc gây chú ý",
        text: "Câu đầu khiến người đọc tò mò, câu cuối khiến họ muốn tìm đọc, tìm xem.",
        example: "Có một chú mèo máy không có tai mà trẻ em khắp nơi đều yêu quý — đó là Đô-rê-mon.",
      },
      {
        title: "Giới thiệu khác kể chuyện",
        text: "Đoạn giới thiệu trả lời “nhân vật là ai, như thế nào”, không kể diễn biến từ đầu đến cuối.",
      },
      {
        title: "Chọn một việc làm tiêu biểu",
        text: "Một việc làm đủ cho thấy nhân vật là người thế nào.",
        example: "Trên đường phiêu lưu, Dế Mèn đứng ra bênh vực chị Nhà Trò yếu ớt.",
      },
      {
        title: "Kết bằng lời mời",
        text: "Một câu mời đọc, mời xem làm đoạn văn giới thiệu tròn trịa và hấp dẫn.",
        example: "Nếu bạn thích phiêu lưu, hãy đọc ngay cuốn sách này để cùng Dế Mèn đi khắp thế gian.",
      },
    ],
    openings: [
      { label: "Câu mở đoạn", text: "Dế Mèn là nhân vật chính trong cuốn sách “Dế Mèn phiêu lưu kí” của nhà văn Tô Hoài." },
      { label: "Câu mở đoạn", text: "Nếu được chọn một người bạn trong truyện, em sẽ chọn Dế Mèn — chàng dế dũng cảm trong “Dế Mèn phiêu lưu kí”." },
    ],
    endings: [
      { label: "Câu kết đoạn", text: "Nếu bạn thích phiêu lưu, hãy đọc ngay cuốn sách này để cùng Dế Mèn đi khắp thế gian." },
      { label: "Câu kết đoạn", text: "Em quý Dế Mèn vì chú biết nhận lỗi và luôn bênh vực kẻ yếu." },
    ],
    words: [
      { label: "Giới thiệu", items: ["là nhân vật chính", "xuất hiện trong", "được biết đến là", "nổi tiếng với"] },
      { label: "Tính cách", items: ["dũng cảm", "tốt bụng", "thông minh", "hài hước", "nghĩa hiệp", "biết nhận lỗi"] },
      { label: "Mời đọc, mời xem", items: ["hãy cùng", "đừng bỏ lỡ", "chắc chắn bạn sẽ thích", "hãy tìm đọc"] },
    ],
    samples: [{
      prompt: "Viết đoạn văn (khoảng 8–10 câu) giới thiệu một nhân vật em yêu thích trong cuốn sách em đã đọc.",
      paragraphs: [
        "Dế Mèn là nhân vật chính trong cuốn sách “Dế Mèn phiêu lưu kí” của nhà văn Tô Hoài. Mèn là một chàng dế thanh niên có thân hình khoẻ mạnh, đôi càng to bóng và những chiếc vuốt sắc nhọn. Bộ cánh dài cùng đôi râu dài làm Mèn trông rất oai vệ. Lúc đầu, Mèn khá kiêu căng, hay trêu chọc mọi người. Chính một trò nghịch dại của Mèn đã khiến người hàng xóm Dế Choắt phải chết oan, làm Mèn ân hận mãi. Từ đó, Mèn thay đổi hẳn và lên đường phiêu lưu để học hỏi. Trên đường đi, Mèn luôn bênh vực kẻ yếu, như lần đứng ra bảo vệ chị Nhà Trò bị bọn nhện ức hiếp. Em quý Dế Mèn vì chú biết nhận lỗi và sống nghĩa hiệp. Nếu bạn thích phiêu lưu, hãy đọc ngay cuốn sách này để cùng Dế Mèn đi khắp thế gian.",
      ],
      note: "Câu đầu có tên nhân vật, tên sách, tác giả; có ngoại hình, sự thay đổi tính cách và một việc làm tiêu biểu (bênh vực Nhà Trò); không kể lại cả truyện; câu cuối mời người đọc.",
    }, {
      prompt: "Viết đoạn văn (khoảng 8–10 câu) giới thiệu về một nhân vật trong bộ phim hoạt hình em đã được xem.",
      paragraphs: [
        "Trong những bộ phim hoạt hình em đã xem, em thích nhất nhân vật Đô-rê-mon trong bộ phim cùng tên của Nhật Bản. Đô-rê-mon là một chú mèo máy đến từ thế kỉ hai mươi hai, có thân hình tròn trịa màu xanh da trời và chiếc bụng trắng. Điều đặc biệt là chú không có tai, vì đôi tai đã bị một con chuột máy gặm mất. Trước bụng Đô-rê-mon có chiếc túi thần kì đựng rất nhiều bảo bối như chong chóng tre, cánh cửa thần kì. Chú được gửi về quá khứ để giúp đỡ cậu bé Nô-bi-ta hậu đậu, hay khóc nhè. Dù đôi khi bực mình vì Nô-bi-ta lười biếng, Đô-rê-mon vẫn luôn ở bên, động viên bạn cố gắng. Em thấy buồn cười nhất là chú rất sợ chuột và mê món bánh rán. Đô-rê-mon cho em hiểu thế nào là một người bạn thật sự. Nếu chưa xem, bạn hãy xem ngay bộ phim này để làm quen với chú mèo máy đáng yêu ấy nhé!",
      ],
      note: "Câu đầu nêu tên nhân vật và bộ phim; có ngoại hình (thân xanh, không tai), hoạt động (giúp Nô-bi-ta), tính cách, cả điểm buồn cười làm nhân vật gần gũi; câu cuối mời người đọc xem phim.",
    }],
    extraPrompts: [
      "Viết đoạn văn giới thiệu một nhân vật trong cuốn sách em đã đọc.",
      "Viết đoạn văn giới thiệu về một nhân vật trong bộ phim hoạt hình em đã được xem.",
    ],
    mistakes: [
      "Kể lại diễn biến cả câu chuyện thay vì giới thiệu nhân vật.",
      "Quên nêu tên cuốn sách hoặc bộ phim.",
      "Chỉ tả ngoại hình, không nói tính cách và việc làm.",
      "Khen chung chung “nhân vật rất hay” mà không nói hay ở đâu.",
    ],
    check: [
      "Câu đầu có tên nhân vật và tên sách (hoặc phim).",
      "Có ngoại hình, tính cách và một việc làm tiêu biểu.",
      "Câu cuối nói tình cảm của em hoặc mời người đọc tìm đọc, tìm xem.",
    ],
  },
  {
    id: "cam-xuc-cau-chuyen",
    name: "Cảm xúc về câu chuyện",
    title: "Viết đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện",
    blurb: "Viết một đoạn nói lên em yêu thích, xúc động hay khâm phục điều gì trong câu chuyện đã đọc, đã nghe — và vì sao.",
    form: "doan-van",
    sgk: { tap: 1, bai: "Bài 21–24" },
    outline: [
      { part: "Câu mở đoạn", points: ["Giới thiệu câu chuyện (tên truyện, tác giả nếu có) và nói chung tình cảm, cảm xúc của em."] },
      {
        part: "Các câu phát triển",
        points: [
          "Nêu cảm xúc về 2–3 điều đáng nhớ: nhân vật, một chi tiết, cách kết thúc, ý nghĩa câu chuyện.",
          "Mỗi cảm xúc kèm một chi tiết trong truyện làm dẫn chứng, nói rõ vì sao em xúc động, khâm phục, thương cảm…",
          "Có thể nói thêm: câu chuyện giúp em hiểu, học được điều gì.",
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
        text: "Truyện “Thánh Gióng” là câu chuyện em yêu thích nhất, vì nó cho em thấy sức mạnh của lòng yêu nước.",
      },
      {
        label: "Câu mở đoạn",
        text: "Đọc truyện “Sọ Dừa”, em vô cùng xúc động trước một chàng trai xấu xí mà tài giỏi, tốt bụng.",
      },
    ],
    endings: [
      { label: "Câu kết đoạn", text: "Câu chuyện giúp em hiểu rằng lòng yêu nước có thể làm nên sức mạnh phi thường." },
      { label: "Câu kết đoạn", text: "Truyện “Sọ Dừa” giúp em hiểu: không nên đánh giá một người qua vẻ bề ngoài." },
    ],
    words: [
      { label: "Tình cảm, cảm xúc", items: ["yêu mến", "quý trọng", "khâm phục", "cảm phục", "xúc động", "thương cảm", "tự hào"] },
      { label: "Phẩm chất nhân vật, ý nghĩa câu chuyện", items: ["dũng cảm", "kiên trì", "thật thà", "nhân hậu", "hiếu thảo", "tài giỏi", "biết ơn"] },
      { label: "Từ nối ý", items: ["trước hết", "không chỉ … mà còn …", "đặc biệt", "vì thế", "chính vì vậy"] },
    ],
    samples: [{
      prompt: "Viết đoạn văn (khoảng 8–10 câu) thể hiện tình cảm, cảm xúc của em về một câu chuyện em đã đọc, đã nghe.",
      paragraphs: [
        "Truyện “Thánh Gióng” là câu chuyện em yêu thích nhất, và em đặc biệt khâm phục cậu bé làng Gióng. Lên ba tuổi, Gióng vẫn chưa biết nói, chưa biết cười. Vậy mà khi nghe sứ giả đi tìm người đánh giặc, cậu bỗng cất tiếng nói đầu tiên để xin đi giết giặc cứu nước. Chi tiết ấy làm em rất xúc động, vì tiếng nói đầu tiên của Gióng là tiếng nói của lòng yêu nước. Em càng thấy thú vị khi Gióng lớn nhanh như thổi, cả làng góp gạo nuôi cậu. Khi roi sắt gãy, Gióng nhổ ngay những bụi tre bên đường quật vào giặc. Em cảm phục sự dũng cảm và nhanh trí của Gióng: gặp khó khăn vẫn không lùi bước. Đánh tan giặc, Gióng không ở lại nhận thưởng mà cưỡi ngựa bay về trời. Điều đó cho em thấy Gióng đánh giặc vì đất nước chứ không vì bản thân. Câu chuyện giúp em hiểu rằng lòng yêu nước có thể làm nên sức mạnh phi thường.",
      ],
      note: "Đúng một đoạn, mười câu. Mỗi cảm xúc (xúc động, thú vị, cảm phục) đi kèm một chi tiết trong truyện; câu đầu nêu tên truyện và tình cảm của em, câu cuối nói ý nghĩa câu chuyện.",
    }],
    extraPrompts: ["Viết đoạn văn thể hiện tình cảm, cảm xúc về một câu chuyện em đã đọc, đã nghe."],
    mistakes: [
      "Kể lại gần hết câu chuyện, hầu như không nói cảm xúc của em.",
      "Chia thành nhiều đoạn, xuống dòng liên tục.",
      "Chỉ có cảm xúc chung chung (“em rất thích nhân vật này vì nhân vật này hay”) mà không có dẫn chứng.",
      "Viết quá ngắn (3–4 câu) hoặc dài quá một trang.",
    ],
    check: [
      "Khoảng 8–10 câu (hoặc đúng số câu đề yêu cầu).",
      "Câu đầu nêu rõ tên câu chuyện và tình cảm chung của em.",
      "Mỗi cảm xúc có một chi tiết trong truyện làm dẫn chứng.",
    ],
  },
  {
    id: "cam-xuc-bai-tho",
    name: "Cảm xúc về bài thơ",
    title: "Viết đoạn văn thể hiện tình cảm, cảm xúc về một bài thơ",
    blurb: "Nói lên em thích bài thơ ở đâu: hình ảnh nào, câu thơ nào làm em xúc động — và bài thơ để lại cho em điều gì.",
    form: "doan-van",
    sgk: { tap: 1, bai: "Bài 25–28" },
    outline: [
      { part: "Câu mở đoạn", points: ["Giới thiệu bài thơ (tên bài, tác giả) và nêu chung cảm xúc của em."] },
      {
        part: "Các câu phát triển",
        points: [
          "Nêu 2–3 hình ảnh, câu thơ em thích nhất; có thể trích vài từ ngữ trong ngoặc kép.",
          "Nói cảm xúc của em trước mỗi hình ảnh và vì sao (bài thơ làm em nhớ đến ai, điều gì).",
          "Có thể nói về cách viết: nhịp thơ, từ ngữ, hình ảnh so sánh, nhân hoá làm em thích.",
        ],
      },
      { part: "Câu kết đoạn", points: ["Điều bài thơ để lại cho em: tình cảm, bài học, mong muốn."] },
    ],
    tips: [
      {
        title: "Trích ngắn, nói nhiều",
        text: "Chỉ trích vài từ, một dòng thơ làm dẫn chứng, rồi dành phần lớn đoạn văn nói cảm xúc của em.",
        example: "Em thích nhất hình ảnh hạt gạo có “vị phù sa”, vì nó cho em thấy cả dòng sông quê đã góp phần làm nên hạt gạo.",
      },
      {
        title: "Dùng từ ngữ giàu biểu cảm",
        text: "Cảm xúc về bài thơ cần từ ngữ tinh tế: xúc động, bồi hồi, xót xa, thích thú, tự hào…",
      },
      {
        title: "Sắp xếp ý hợp lí",
        text: "Đi theo thứ tự bài thơ (khổ đầu → khổ cuối) hoặc theo từng cảm xúc, đừng nhảy qua lại.",
      },
      {
        title: "Liên hệ với em",
        text: "Hình ảnh trong bài thơ làm em nhớ tới ai, cảnh nào? Một câu liên hệ làm đoạn văn chân thật hơn.",
        example: "Hình ảnh ấy làm em nhớ đến dáng mẹ em lom khom trên ruộng mỗi mùa cấy.",
      },
    ],
    openings: [
      { label: "Câu mở đoạn", text: "Đọc bài thơ “Hạt gạo làng ta” của nhà thơ Trần Đăng Khoa, em thấy thương và quý từng hạt gạo hơn bao giờ hết." },
      { label: "Câu mở đoạn", text: "Trong những bài thơ viết về tuổi thơ, em yêu nhất bài thơ “Tuổi Ngựa” của nhà thơ Xuân Quỳnh." },
    ],
    endings: [
      { label: "Câu kết đoạn", text: "Từ nay, em sẽ không để rơi vãi cơm và sẽ biết ơn những người làm ra hạt gạo." },
      { label: "Câu kết đoạn", text: "Mỗi lần đọc lại bài thơ, em lại thấy yêu mẹ nhiều hơn." },
    ],
    words: [
      { label: "Cảm xúc", items: ["xúc động", "bồi hồi", "xót xa", "thích thú", "tự hào", "biết ơn", "thương"] },
      { label: "Nói về câu thơ", items: ["hình ảnh", "câu thơ", "khổ thơ", "nhịp thơ nhẹ nhàng", "lời thơ giản dị"] },
      { label: "Dẫn ý", items: ["em thích nhất", "đặc biệt", "đọc đến … em thấy", "bài thơ giúp em hiểu"] },
    ],
    samples: [{
      prompt: "Viết đoạn văn (khoảng 8–10 câu) thể hiện tình cảm, cảm xúc của em về một bài thơ em yêu thích.",
      paragraphs: [
        "Đọc bài thơ “Hạt gạo làng ta” của nhà thơ Trần Đăng Khoa, em thấy thương và quý từng hạt gạo hơn bao giờ hết. Ngay từ những dòng đầu, hạt gạo hiện lên thật đẹp vì có “vị phù sa”, có “hương sen thơm” và cả lời mẹ hát ngọt bùi. Em thích cách nhà thơ nói về hạt gạo như nói về một điều quý giá của cả làng quê. Đọc đến đoạn những trưa tháng sáu nắng nóng như nấu nước, cá chết, cua ngoi lên bờ mà mẹ vẫn xuống cấy, em thấy xót xa vô cùng. Hình ảnh ấy làm em nhớ đến dáng mẹ em lom khom trên ruộng mỗi mùa cấy. Em cũng cảm động khi các bạn nhỏ trong bài thơ cùng tát nước chống hạn, bắt sâu cho lúa. Những câu thơ ngắn, nhịp nhàng như lời hát khiến em đọc mãi không chán. Bài thơ giúp em hiểu mỗi hạt gạo chứa bao giọt mồ hôi của người nông dân. Từ nay, em sẽ không để rơi vãi cơm và sẽ biết ơn những người làm ra hạt gạo.",
      ],
      note: "Câu đầu có tên bài thơ, tác giả và cảm xúc chung; trích ngắn hai hình ảnh (“vị phù sa”, “hương sen thơm”) rồi nói cảm xúc; có liên hệ với mẹ của em; nhắc cả nhịp thơ; câu cuối là điều bài thơ để lại.",
    }],
    extraPrompts: [
      "Viết đoạn văn thể hiện tình cảm, cảm xúc của em về một bài thơ thuộc chủ điểm Thế giới tuổi thơ.",
      "Viết đoạn văn thể hiện tình cảm, cảm xúc của em về một bài thơ ca ngợi vẻ đẹp của thiên nhiên.",
    ],
    mistakes: [
      "Chép lại gần hết bài thơ thay cho cảm xúc của em.",
      "Kể lại nội dung từng khổ như văn xuôi mà không nói em cảm thấy thế nào.",
      "Quên nêu tên bài thơ, tác giả.",
      "Chỉ viết “bài thơ rất hay” mà không chỉ ra hay ở hình ảnh, câu thơ nào.",
    ],
    check: [
      "Câu đầu có tên bài thơ, tác giả và cảm xúc chung của em.",
      "Có 2–3 hình ảnh, câu thơ cụ thể kèm cảm xúc và lí do.",
      "Các ý sắp xếp hợp lí; có từ ngữ, câu văn giàu biểu cảm.",
    ],
  },
  {
    id: "ta-nguoi",
    name: "Tả người",
    title: "Viết bài văn tả người",
    blurb: "Tả người thân, thầy cô, bạn bè — để người đọc như thấy người ấy hiện ra trước mắt.",
    form: "bai-van",
    sgk: { tap: 2, bai: "Bài 1–8; luyện thêm ở Bài 25–26" },
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
        title: "Vừa tả vừa bộc lộ cảm nghĩ",
        text: "Xen vào lời tả vài câu nói em nghĩ gì, thấy thế nào về người ấy.",
        example: "Nhìn đôi bàn tay gầy guộc của bà, em thương bà vô cùng.",
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
    samples: [{
      prompt: "Viết bài văn tả một người thân trong gia đình em.",
      paragraphs: [
        "Trong gia đình, người em yêu quý nhất là bà nội. Năm nay bà đã gần bảy mươi tuổi nhưng vẫn nhanh nhẹn, sáng nào cũng dậy sớm ra vườn tưới rau.",
        "Bà nhỏ người, lưng hơi còng. Mái tóc bà bạc trắng như cước, lúc nào cũng được búi gọn sau gáy. Khuôn mặt bà có nhiều nếp nhăn, nhất là ở khoé mắt; mỗi khi bà cười, những nếp nhăn ấy lại xoè ra như những tia nắng nhỏ. Mắt bà đã kém, đọc báo phải đeo kính, nhưng ánh nhìn lúc nào cũng hiền từ. Em thích nhất đôi bàn tay bà: gầy, nổi gân xanh, ram ráp mà rất ấm.",
        "Bà em là người chịu thương chịu khó. Mảnh vườn sau nhà được bà chia thành từng luống rau cải, rau thơm thẳng tắp. Buổi tối, bà vừa nhặt rau vừa kể cho em nghe chuyện “Tấm Cám”, chuyện “Sọ Dừa”. Giọng bà chậm rãi, ấm áp; nhiều hôm em ngủ thiếp đi lúc nào không hay. Có lần em bị sốt, bà thức gần như cả đêm, cứ một lúc lại đặt tay lên trán em, khẽ hỏi: “Cháu đỡ chưa?”.",
        "Em rất yêu bà. Em mong bà luôn mạnh khoẻ để em được nghe bà kể chuyện thật nhiều năm nữa. Em sẽ ngoan ngoãn, chăm học để bà vui lòng.",
      ],
      note: "Chỉ chọn vài nét riêng (tóc búi, nếp nhăn khi cười, đôi tay ấm) và kể việc làm cụ thể (chăm vườn, kể chuyện, thức đêm khi em ốm) để thấy tính tình — không có câu khen chung chung nào.",
    }, {
      prompt: "Viết bài văn tả một người đã để lại cho em những ấn tượng tốt đẹp.",
      paragraphs: [
        "Đã hai năm trôi qua nhưng em vẫn nhớ như in cô Hạnh, cô giáo chủ nhiệm năm lớp ba của em. Cô là người đã giúp em từ một học sinh rụt rè trở nên mạnh dạn hơn.",
        "Cô Hạnh năm nay khoảng ba mươi tuổi, dáng người thon thả. Cô thường mặc áo dài màu xanh nhạt mỗi khi lên lớp. Mái tóc cô dài, đen mượt, buộc gọn bằng chiếc nơ nhỏ. Khuôn mặt cô tròn, lúc nào cũng tươi tắn. Em nhớ nhất đôi mắt cô: đen láy, hiền hậu, như biết cười cùng với miệng.",
        "Giọng cô nhẹ nhàng, trong trẻo. Mỗi khi cô đọc mẫu bài tập đọc, cả lớp im phăng phắc lắng nghe. Cô rất kiên nhẫn: bạn nào chưa hiểu bài, cô giảng lại lần thứ hai, thứ ba mà không hề cáu gắt. Chữ cô viết trên bảng tròn trịa, ngay ngắn như in, chúng em ai cũng muốn viết được như cô.",
        "Em vẫn nhớ hôm đầu năm, em được gọi lên bảng đọc bài mà run quá, đọc lắp bắp mãi không xong. Cả lớp bắt đầu xì xào. Cô bước đến bên cạnh, đặt nhẹ tay lên vai em và nói: “Con cứ đọc chậm thôi, cô tin con làm được.” Câu nói ấy như tiếp thêm sức cho em. Từ hôm đó, giờ học nào em cũng giơ tay phát biểu.",
        "Giờ em đã lên lớp năm, không còn học cô nữa, nhưng mỗi lần đi ngang lớp cũ, em vẫn nán lại nhìn vào. Em sẽ cố gắng học thật giỏi để cô luôn tự hào về học trò của mình.",
      ],
      note: "Ngoại hình chỉ chọn vài nét (áo dài xanh, đôi mắt như biết cười); tính tình hiện ra qua việc làm (giảng lại nhiều lần, viết chữ đẹp) và một kỉ niệm có lời nói của cô.",
    }],
    extraPrompts: [
      "Viết bài văn tả một người em chỉ gặp một vài lần nhưng nhớ mãi.",
      "Viết bài văn tả một người là nhân vật chính trong bộ phim hoặc vở kịch mà em đã xem.",
    ],
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
    id: "cam-xuc-su-viec",
    name: "Cảm xúc về sự việc",
    title: "Viết đoạn văn thể hiện tình cảm, cảm xúc về một sự việc",
    blurb: "Một lễ hội, một buổi ngoại khoá, một ngày gói bánh chưng… — kể ngắn sự việc, rồi nói rõ em cảm thấy thế nào và vì sao.",
    form: "doan-van",
    sgk: { tap: 2, bai: "Bài 9–12; luyện thêm ở Bài 22" },
    outline: [
      { part: "Câu mở đoạn", points: ["Giới thiệu sự việc (việc gì, xảy ra khi nào, ở đâu) và nêu chung cảm xúc của em."] },
      {
        part: "Các câu phát triển",
        points: [
          "Kể ngắn gọn 2–3 chi tiết đáng nhớ nhất: khung cảnh, hoạt động, người tham gia.",
          "Sau mỗi chi tiết, nói cảm xúc của em (vui sướng, xúc động, hồi hộp, tiếc nuối…) và vì sao em có cảm xúc ấy.",
          "Có thể nói điều em nhận ra sau sự việc.",
        ],
      },
      { part: "Câu kết đoạn", points: ["Khẳng định lại cảm xúc, hoặc nêu mong muốn, lời hứa của em."] },
    ],
    tips: [
      {
        title: "Cảm xúc là chính, kể là phụ",
        text: "Chỉ kể đủ để người đọc hiểu chuyện gì đã xảy ra; phần lớn đoạn văn là em cảm thấy thế nào.",
      },
      {
        title: "Gọi đúng tên cảm xúc",
        text: "Thay “em rất vui” bằng từ ngữ cụ thể hơn, hoặc tả biểu hiện của cảm xúc.",
        example: "Tim em đập thình thịch, hai bàn tay nắm chặt đến toát mồ hôi.",
      },
      {
        title: "Cho cảm xúc thay đổi theo sự việc",
        text: "Hồi hộp lúc đầu, vỡ oà lúc cuối — kể sự thay đổi làm đoạn văn có chiều sâu.",
        example: "Lúc đầu em lo lắng vô cùng, nhưng khi cô gọi tên đội em, mọi lo lắng bỗng tan biến.",
      },
      {
        title: "Cảm xúc nào cũng có lí do",
        text: "Viết thêm “vì…”, “bởi em nghĩ đến…” để người đọc hiểu và đồng cảm với em.",
      },
    ],
    openings: [
      { label: "Câu mở đoạn", text: "Buổi lễ khai giảng năm học lớp năm đã để lại trong em biết bao cảm xúc khó quên." },
      { label: "Câu mở đoạn", text: "Lần đầu tiên tự tay nấu một bữa cơm cho cả nhà, em vừa hồi hộp vừa tự hào." },
    ],
    endings: [
      { label: "Câu kết đoạn", text: "Em sẽ nhớ mãi buổi khai giảng ấy — buổi khai giảng cuối cùng dưới mái trường tiểu học." },
      { label: "Câu kết đoạn", text: "Bữa cơm hôm ấy giúp em hiểu bố mẹ đã vất vả thế nào mỗi ngày." },
    ],
    words: [
      { label: "Cảm xúc vui", items: ["sung sướng", "háo hức", "rộn ràng", "tự hào", "vỡ oà", "hạnh phúc"] },
      { label: "Cảm xúc lo, buồn, nhớ", items: ["hồi hộp", "bồi hồi", "nao nao", "tiếc nuối", "bâng khuâng", "ân hận"] },
      { label: "Biểu hiện cảm xúc", items: ["tim đập thình thịch", "mắt rưng rưng", "cười tít mắt", "lâng lâng", "nghẹn ngào"] },
    ],
    samples: [{
      prompt: "Viết đoạn văn (khoảng 8–10 câu) thể hiện tình cảm, cảm xúc của em về một sự việc đáng nhớ ở trường.",
      paragraphs: [
        "Buổi lễ khai giảng năm học lớp năm đã để lại trong em biết bao cảm xúc khó quên. Sáng hôm ấy, em dậy thật sớm, mặc bộ đồng phục mới mà lòng rộn ràng như ngày đầu đi học. Bước vào sân trường rực rỡ cờ hoa, em bỗng thấy bồi hồi khi nghĩ đây là lần khai giảng cuối cùng của mình ở mái trường tiểu học. Em xúc động nhất là lúc các em lớp một nắm tay nhau bước qua cổng trường, đôi mắt tròn xoe vừa ngơ ngác vừa háo hức. Nhìn các em, em nhớ lại chính mình bốn năm trước, cũng nhút nhát nắm chặt tay mẹ như thế. Khi tiếng trống khai trường vang lên, tim em đập rộn ràng, mắt em bỗng rưng rưng. Em thấy biết ơn thầy cô đã dạy dỗ em suốt những năm qua. Em tự hứa năm học này sẽ chăm chỉ hơn để làm gương cho các em nhỏ. Em sẽ nhớ mãi buổi khai giảng ấy — buổi khai giảng cuối cùng dưới mái trường tiểu học.",
      ],
      note: "Kể rất ngắn (dậy sớm, vào sân trường, các em lớp một, tiếng trống) nhưng câu nào cũng gắn với một cảm xúc: rộn ràng, bồi hồi, xúc động, biết ơn — và cảm xúc nào cũng có lí do.",
    }],
    extraPrompts: [
      "Viết đoạn văn thể hiện tình cảm, cảm xúc về một lễ hội của quê hương.",
      "Viết đoạn văn thể hiện tình cảm, cảm xúc về một buổi hoạt động ngoại khoá của trường hoặc lớp em.",
      "Viết đoạn văn thể hiện tình cảm, cảm xúc về hoạt động gói bánh chưng hoặc bánh tét ngày Tết.",
    ],
    mistakes: [
      "Kể dài như bài văn kể chuyện, chỉ có một câu cảm xúc ở cuối.",
      "Lặp “em rất vui” nhiều lần thay vì dùng từ ngữ chỉ cảm xúc khác nhau.",
      "Chọn sự việc quá chung chung (“một ngày đi học”) nên không có gì đáng nhớ.",
      "Xuống dòng nhiều lần, thành nhiều đoạn.",
    ],
    check: [
      "Câu đầu nói rõ sự việc và cảm xúc chung của em.",
      "Có cảm xúc về khung cảnh, hoạt động hoặc người tham gia sự việc; cảm xúc nào cũng có lí do.",
      "Có ít nhất ba từ chỉ cảm xúc khác nhau.",
    ],
  },
  {
    id: "chuong-trinh-hoat-dong",
    name: "Chương trình hoạt động",
    title: "Viết chương trình hoạt động",
    blurb: "Lên kế hoạch cho một hoạt động của lớp, của trường: làm để làm gì, khi nào, ở đâu, chuẩn bị gì, ai phụ trách việc gì.",
    form: "van-ban",
    sgk: { tap: 2, bai: "Bài 13–16" },
    outline: [
      { part: "Tên chương trình", points: ["Tên đơn vị (lớp, chi đội) và tên chương trình viết in hoa ở giữa."] },
      { part: "I. Mục đích", points: ["Hoạt động nhằm đạt được điều gì — 2–3 ý ngắn."] },
      { part: "II. Thời gian và địa điểm", points: ["Giờ, ngày, tháng cụ thể; nơi tổ chức."] },
      { part: "III. Chuẩn bị", points: ["Những việc cần làm trước, phân công cho từng tổ, từng bạn; phương tiện, dụng cụ cần có."] },
      {
        part: "IV. Kế hoạch thực hiện",
        points: [
          "Bảng ba cột: Thời gian – Nội dung – Người phụ trách, các việc xếp theo thứ tự thời gian.",
          "Cuối văn bản: người lập chương trình (chức vụ, chữ kí, họ và tên).",
        ],
      },
    ],
    tips: [
      {
        title: "Mục đích ngắn gọn, rõ ràng",
        text: "Nói hoạt động giúp được gì, không cần giải thích dài.",
        example: "Góp sách để lớp có một tủ sách chung; khuyến khích các bạn đọc sách mỗi ngày.",
      },
      {
        title: "Rõ người, rõ việc",
        text: "Việc nào cũng phải có người phụ trách. Một việc không ai nhận thì chắc chắn bị bỏ quên.",
      },
      {
        title: "Kế hoạch là bảng, không phải đoạn văn",
        text: "Kẻ bảng ba cột và ghi giờ cụ thể; viết thành đoạn văn dài thì người đọc khó theo dõi.",
      },
      {
        title: "Dự kiến cả dụng cụ",
        text: "Cần loa, bàn ghế, giấy màu, hộp đựng…? Ghi vào mục Chuẩn bị và giao cho người mang.",
      },
    ],
    openings: [
      { label: "Tên chương trình", text: "CHƯƠNG TRÌNH PHÁT ĐỘNG PHONG TRÀO XÂY DỰNG TỦ SÁCH LỚP 5A" },
      { label: "I. Mục đích", text: "– Góp sách, truyện để lớp có một tủ sách chung. – Khuyến khích các bạn đọc sách mỗi ngày và chia sẻ sách hay với nhau." },
    ],
    endings: [
      { label: "Phần cuối", text: "Người lập chương trình — Lớp trưởng — (kí) — Trần Gia Huy." },
      { label: "Một dòng trong bảng kế hoạch", text: "15 giờ – 15 giờ 10 | Lớp trưởng nêu mục đích phong trào | Lớp trưởng" },
    ],
    words: [
      { label: "Mục đích", items: ["nhằm", "giúp", "để", "góp phần", "khuyến khích"] },
      { label: "Chuẩn bị", items: ["phân công", "phụ trách", "dụng cụ", "trang trí", "liên hệ"] },
      { label: "Thời gian", items: ["từ … đến …", "ngày … tháng …", "buổi sáng thứ …", "trước … ngày"] },
    ],
    samples: [{
      prompt: "Viết chương trình phát động phong trào xây dựng tủ sách của lớp.",
      paragraphs: [
        { center: "CHƯƠNG TRÌNH PHÁT ĐỘNG PHONG TRÀO\nXÂY DỰNG TỦ SÁCH LỚP 5A" },
        "I. MỤC ĐÍCH",
        "– Góp sách, truyện để lớp có một tủ sách chung.",
        "– Khuyến khích các bạn đọc sách mỗi ngày, chia sẻ sách hay với nhau.",
        "II. THỜI GIAN VÀ ĐỊA ĐIỂM",
        "– Thời gian: 15 giờ chiều thứ Sáu, ngày 6 tháng 11 năm 2026.",
        "– Địa điểm: phòng học lớp 5A.",
        "III. CHUẨN BỊ",
        "– Tổ 1: lau dọn chiếc tủ cũ ở cuối lớp, chuẩn bị hộp đựng sách.",
        "– Tổ 2: làm sổ mượn – trả sách và nhãn dán gáy sách.",
        "– Tổ 3: trang trí góc tủ sách, viết khẩu hiệu “Mỗi tuần một cuốn sách hay”.",
        "– Mỗi bạn mang ít nhất một cuốn sách, truyện phù hợp với học sinh tiểu học.",
        "IV. KẾ HOẠCH THỰC HIỆN",
        { head: ["Thời gian", "Nội dung", "Người phụ trách"], rows: [
          ["15 giờ – 15 giờ 10", "Nêu mục đích phong trào", "Lớp trưởng"],
          ["15 giờ 10 – 15 giờ 30", "Các tổ góp sách, ghi tên sách vào sổ", "Ba tổ trưởng"],
          ["15 giờ 30 – 15 giờ 45", "Giới thiệu một cuốn sách hay", "Bạn Thu Hà"],
          ["15 giờ 45 – 16 giờ", "Xếp sách lên tủ, chụp ảnh lưu niệm", "Tổ 3"],
        ] },
        { right: "Người lập chương trình\nLớp trưởng\n(kí)\nTrần Gia Huy" },
      ],
      note: "Đủ bốn mục theo mẫu; mục đích ngắn gọn; chuẩn bị phân công cho từng tổ; kế hoạch là bảng ba cột theo thứ tự thời gian, việc nào cũng có người phụ trách; có người lập chương trình.",
    }],
    extraPrompts: [
      "Viết chương trình hoạt động lễ kỉ niệm ngày thành lập Đội Thiếu niên Tiền phong Hồ Chí Minh (15 tháng 5).",
      "Viết chương trình cho một hoạt động mà trường em sắp tổ chức.",
      "Viết chương trình hoạt động quyên góp ủng hộ đồng bào vùng lũ lụt.",
      "Viết chương trình hoạt động tham gia hội diễn văn nghệ chào mừng ngày Nhà giáo Việt Nam (20 tháng 11).",
    ],
    mistakes: [
      "Thiếu mục, nhất là mục Chuẩn bị hoặc cột Người phụ trách.",
      "Kế hoạch viết thành đoạn văn dài thay vì bảng.",
      "Thời gian mơ hồ (“buổi chiều”) — không ghi giờ, ngày cụ thể.",
      "Có việc không ai phụ trách.",
    ],
    check: [
      "Đủ bốn mục: mục đích; thời gian và địa điểm; chuẩn bị; kế hoạch thực hiện.",
      "Mỗi việc trong kế hoạch có thời gian và người phụ trách.",
      "Bảng kế hoạch rõ ràng, sạch đẹp; có người lập chương trình.",
    ],
  },
  {
    id: "neu-y-kien",
    name: "Nêu ý kiến",
    title: "Viết đoạn văn nêu ý kiến tán thành hoặc phản đối một sự việc, hiện tượng",
    blurb: "Nói rõ em tán thành hay phản đối một việc, rồi đưa lí do và ví dụ để thuyết phục người đọc.",
    form: "doan-van",
    sgk: { tap: 2, bai: "Bài 17–21 (tán thành) và Bài 27–30 (phản đối)" },
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
      { label: "Câu mở đoạn — tán thành", text: "Em hoàn toàn tán thành phong trào trồng và bảo vệ cây xanh." },
    ],
    endings: [
      { label: "Câu kết đoạn", text: "Vì vậy, em mong các bạn hãy cùng trồng và chăm sóc cây để trường lớp mình ngày càng xanh hơn." },
      { label: "Câu kết đoạn", text: "Tóm lại, khi còn nhỏ, chúng ta nên dành thời gian cho sách vở, vui chơi và gia đình hơn là cho chiếc điện thoại." },
    ],
    words: [
      { label: "Tán thành", items: ["em tán thành", "ủng hộ quan điểm", "hoàn toàn đồng ý", "rất xác đáng", "hoàn toàn đồng tình"] },
      { label: "Phản đối", items: ["em không đồng ý", "không đúng", "khó chấp nhận", "em phản đối", "không nên"] },
      { label: "Nối lí do", items: ["thứ nhất", "thứ hai", "hơn nữa", "ngoài ra", "bởi vì", "chẳng hạn"] },
      { label: "Kết luận", items: ["vì vậy", "chính vì thế", "tóm lại", "như vậy"] },
    ],
    samples: [{
      prompt: "Viết đoạn văn (khoảng 8–10 câu) nêu ý kiến phản đối việc học sinh tiểu học dùng điện thoại thông minh riêng.",
      paragraphs: [
        "Theo em, học sinh tiểu học chưa nên có điện thoại thông minh riêng. Thứ nhất, dùng điện thoại nhiều rất hại mắt và sức khoẻ. Em có một người bạn mải chơi điện tử trên điện thoại đến khuya, mới lớp năm đã phải đeo kính. Thứ hai, điện thoại dễ làm chúng ta sao nhãng việc học. Chỉ một tin nhắn hay một đoạn phim ngắn cũng có thể kéo ta rời bài tập hàng giờ liền. Hơn nữa, trên mạng có nhiều thông tin không phù hợp với trẻ em mà chúng ta chưa đủ hiểu biết để tránh. Có bạn cho rằng điện thoại giúp tra cứu bài học, nhưng việc đó hoàn toàn có thể làm cùng bố mẹ trên máy tính ở nhà. Vì vậy, khi còn học tiểu học, chúng ta nên dành thời gian cho sách vở, vui chơi và gia đình. Em mong các bạn hãy cùng nói “không” với chiếc điện thoại riêng.",
      ],
      note: "Câu đầu chốt ngay ý kiến phản đối; ba lí do có từ nối (thứ nhất, thứ hai, hơn nữa), hai lí do có ví dụ; có nhắc ý kiến ngược lại rồi trả lời; câu cuối nêu lời khuyên.",
    }, {
      prompt: "Viết đoạn văn (khoảng 8–10 câu) nêu ý kiến tán thành phong trào trồng và bảo vệ cây xanh.",
      paragraphs: [
        "Em hoàn toàn tán thành phong trào trồng và bảo vệ cây xanh. Thứ nhất, cây xanh làm cho không khí trong lành, mát mẻ hơn. Từ khi lớp em trồng hàng cây trước cửa lớp, giờ ra chơi sân trường mát hẳn, chúng em không còn phải tránh nắng. Thứ hai, trồng và chăm cây giúp chúng em biết thêm nhiều điều bổ ích. Em đã học được cách xới đất, tưới nước và hiểu vì sao cây cần ánh sáng. Hơn nữa, khi tự tay trồng cây, chúng em sẽ biết quý cây xanh, không bẻ cành, hái lá bừa bãi. Có bạn cho rằng trồng cây làm mất thời gian học, nhưng mỗi tuần chỉ cần vài phút chăm sóc là đủ. Vì vậy, em mong các bạn hãy cùng trồng và chăm sóc cây để trường lớp mình ngày càng xanh hơn.",
      ],
      note: "Câu đầu chốt ngay ý kiến tán thành; ba lí do có từ nối, lí do nào cũng có việc thật ở lớp làm ví dụ; trả lời ý kiến ngược lại; câu cuối là lời kêu gọi.",
    }],
    extraPrompts: [
      "Viết đoạn văn nêu ý kiến tán thành việc lập Câu lạc bộ Đọc sách.",
      "Viết đoạn văn nêu ý kiến tán thành việc phát triển hoạt động thể dục, thể thao trong nhà trường.",
      "Viết đoạn văn nêu ý kiến tán thành hoạt động ủng hộ, giúp đỡ các bạn học sinh vùng thiên tai.",
      "Viết đoạn văn nêu ý kiến phản đối hiện tượng vứt rác bừa bãi.",
      "Viết đoạn văn nêu ý kiến phản đối hiện tượng chen lấn khi xếp hàng.",
    ],
    mistakes: [
      "Không nói rõ em tán thành hay phản đối.",
      "Chỉ nêu lí do mà không có ví dụ nào.",
      "Lặp một lí do bằng nhiều cách nói khác nhau cho đủ câu.",
      "Lời lẽ chê bai, chỉ trích người khác.",
    ],
    check: [
      "Câu đầu nói rõ em tán thành hay phản đối.",
      "Có ít nhất 2 lí do xác đáng, mỗi lí do có dẫn chứng.",
      "Có từ nối: thứ nhất, thứ hai, vì vậy…",
    ],
  },
];

export const guideById = (id: string): WritingGuide | undefined => GUIDES.find((g) => g.id === id);

/**
 * Dạng bài của một đề lớp 5 (theo cách đề hay ra). Thứ tự quan trọng: đề nêu ý kiến hay
 * nêu cảm xúc có thể có chữ "câu chuyện", "nhân vật", nên xét trước đề kể chuyện, tả người.
 */
export function guideForPrompt(prompt: string): WritingGuide | undefined {
  const p = prompt.toLowerCase();
  if (/báo cáo/.test(p)) return guideById("bao-cao-cong-viec");
  if (/chương trình/.test(p)) return guideById("chuong-trinh-hoat-dong");
  if (/nêu ý kiến|tán thành|phản đối/.test(p)) return guideById("neu-y-kien");
  if (/giới thiệu/.test(p) && /nhân vật/.test(p)) return guideById("gioi-thieu-nhan-vat");
  if (/tình cảm, cảm xúc/.test(p)) {
    if (/bài thơ/.test(p)) return guideById("cam-xuc-bai-tho");
    if (/câu chuyện|nhân vật/.test(p)) return guideById("cam-xuc-cau-chuyen");
    return guideById("cam-xuc-su-viec");
  }
  if (/kể lại|kể chuyện|kể sáng tạo/.test(p)) return guideById("ke-chuyen-sang-tao");
  if (/tả (một )?(người|thầy|cô|bạn|ông|bà|bố|mẹ|anh|chị|em bé)/.test(p)) return guideById("ta-nguoi");
  if (/tả (một )?(cảnh|phong cảnh)/.test(p)) return guideById("ta-canh");
  return undefined;
}

/** Đề lớp 5 của Tạo đề nhanh thuộc dạng bài này, cộng đề luyện thêm — mục "Đề thường gặp". */
export function promptsForGuide(id: GuideId): string[] {
  const all = Object.values(WRITING_PROMPTS).flat();
  return [...new Set([...all.filter((p) => guideForPrompt(p)?.id === id), ...(guideById(id)?.extraPrompts ?? [])])];
}
