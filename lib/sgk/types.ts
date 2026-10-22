// lib/sgk/types.ts — kiểu dữ liệu chung cho mục lục sách (lib/sgk/toan*.ts).

import { retry, type Draft, type Generator } from "../mathGen/core";

export interface SgkLesson {
  /** Số bài trong sách (đánh liên tục cả năm, tập hai nối tiếp tập một). */
  so: number;
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

/** Chỉ lấy những câu thoả điều kiện (sinh lại tới khi gặp). */
export const only = (g: Generator, ok: (d: Draft) => boolean): Generator => (r) =>
  retry(() => { const d = g(r); return ok(d) ? d : null; });
export const has = (re: RegExp) => (d: Draft) => re.test(d.question);
export const tagged = (tag: string) => (d: Draft) => d.tags.includes(tag);
