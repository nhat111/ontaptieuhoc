// lib/sgk/types.ts — khuôn chung cho mục lục sách (lib/sgk/books/*.ts). Thêm một cuốn sách
// = thêm một file `SgkBook` vào books/ và khai báo trong SGK_BOOKS (lib/sgk/index.ts).

import { retry, type Draft, type Generator } from "../mathGen/core";

export interface SgkLesson {
  /** Số bài trong sách (đánh liên tục cả năm, tập hai nối tiếp tập một). */
  so: number;
  /** Số bài trong tập, khi sách đánh số lại từ 1 ở tập hai (Tiếng Việt). Hiển thị thay cho `so`. */
  soTap?: number;
  ten: string;
  /** Dạng câu tự sinh và số câu mỗi dạng trong 10 câu. Không có → bài đang soạn. */
  mix?: [Generator, number][];
  /** Luyện tập chung / ôn tập: trộn câu của các bài khác. */
  luyen?: true;
  /** Các bài được trộn. Bỏ trống với `luyen` = mọi bài học trước đó trong cùng chủ đề. */
  tron?: number[];
  /** Bài thực hành (vẽ, đo thật) — làm trên giấy, không chấm trên máy. */
  thucHanh?: true;
}

export interface SgkTopic {
  so: number;
  tap: 1 | 2;
  ten: string;
  bai: SgkLesson[];
}

/** Một cuốn sách: mục lục chép đúng sách, đánh số bài liên tục cả năm. */
export interface SgkBook {
  /** "kntt-toan-3" — cũng là tiền tố khoá tiến độ trên máy (`kntt-toan-3-15`). */
  id: string;
  subject: string;
  /** Đoạn đường dẫn của môn: /lop/<grade>/<slug>. */
  slug: string;
  grade: number;
  book: string;
  /** Nguồn đối chiếu mục lục (ghi lại để lần sau soát). */
  source: string;
  /** Tên gọi một nhóm bài: "Chủ đề" (Toán, mặc định) hay "Chủ điểm" (Tiếng Việt). */
  topicLabel?: string;
  topics: SgkTopic[];
}

/** Chỉ lấy những câu thoả điều kiện (sinh lại tới khi gặp). */
export const only = (g: Generator, ok: (d: Draft) => boolean): Generator => (r) =>
  retry(() => { const d = g(r); return ok(d) ? d : null; });
export const has = (re: RegExp) => (d: Draft) => re.test(d.question);
export const tagged = (tag: string) => (d: Draft) => d.tags.includes(tag);
