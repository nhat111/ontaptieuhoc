// lib/tvGuide/types.ts
// Hướng dẫn cách làm bài Tiếng Việt theo chủ điểm sách Kết nối tri thức (hiện trên tab
// Tiếng Việt của /lop/[grade]). Không dùng DB: mục lục và hướng dẫn là dữ liệu viết tay.

/** Một dạng bài: Luyện từ và câu hoặc Viết. */
export type TvSkill = {
  id: string;
  loai: "ltvc" | "viet";
  ten: string;
  /** Một hai câu: dạng này là gì. */
  laGi: string;
  /** Các bước làm, theo thứ tự. */
  cachLam: string[];
  /**
   * Ví dụ có lời giải. Với Luyện từ và câu, mọi từ đặt trong “ ” ở `dapAn` phải có
   * nguyên văn trong `cau` (scripts/tv-guide-check.ts kiểm tra).
   */
  viDu?: { de: string; cau?: string; dapAn: string };
  /** Lỗi các con hay mắc. */
  loi?: string;
  /** Trang hướng dẫn chi tiết hơn trong site (VD: /lam-van/lop-5/<dạng>). */
  link?: { href: string; label: string };
};

export type TvBaiRef = { ten: string; ky: string };

/** Một bài trong sách, tên lấy nguyên văn mục lục. */
export type TvBai = {
  tap: 1 | 2;
  so: number;
  /** Bài đọc. */
  doc: string;
  /** Luyện từ và câu (bài lẻ). `ky` = id trong `skills`. */
  ltvc?: TvBaiRef;
  /** Viết. `ky` = id trong `skills`. */
  viet: TvBaiRef;
  /** Nói và nghe / Đọc mở rộng (bài chẵn). */
  them?: string;
};

export type TvChuDiem = {
  so: number;
  ten: string;
  tap: 1 | 2;
  /** Bài đầu, bài cuối của chủ điểm trong tập. */
  tu: number;
  den: number;
  /** Gợi ý đọc hiểu riêng cho chủ điểm. */
  docHieu: string;
};

export type TvGuide = {
  grade: number;
  book: string;
  /** Nơi đã đối chiếu mục lục. */
  source: string;
  chuDiem: TvChuDiem[];
  bai: TvBai[];
  skills: Record<string, TvSkill>;
};
