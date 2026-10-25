// lib/tvGen/bank.ts — câu trắc nghiệm viết sẵn (đáp án đúng + nhiễu) thành Generator.
// Dùng cho ngân hàng luyện từ và câu của đề Tạo đề nhanh (lib/exam5/tvContent*.ts) và các
// câu soạn sẵn của phiếu Tiếng Việt lớp 4, 5.

import { pick } from "../mathGen/core";
import type { TvMcq } from "../exam5/tvContent";
import { mc, type Generator } from "./core";

export type { TvMcq };

/** Câu trắc nghiệm: đáp án đúng viết trước, các đáp án nhiễu sau (mc tự xáo theo itemRng). */
export const Q = (q: string, answer: string, wrong: string[], explain: string): TvMcq => ({ q, options: [answer, ...wrong], answer, explain });

/** Rút một câu trong `items`; cùng câu → cùng dòng nên bộ lọc câu trùng bỏ được. */
export const tuNganHang = (items: TvMcq[], tag: string): Generator => {
  if (items.length === 0) throw new Error(`tuNganHang ${tag}: không có câu`);
  return (r) => {
    const it = pick(r, items);
    return mc(it.q, it.answer, it.options.filter((o) => o !== it.answer), it.explain, ["luyện từ và câu", tag]);
  };
};

/** Cách viết hoa sai hay gặp của một tên riêng viết đúng (ít nhất 3 cách, khác nhau). */
export function wrongCaps(name: string): string[] {
  const lower = name.toLocaleLowerCase("vi");
  const cap = (s: string) => s.charAt(0).toLocaleUpperCase("vi") + s.slice(1);
  const every = lower.replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase("vi"));
  const firstOnly = cap(lower);
  const noFirst = name.charAt(0).toLocaleLowerCase("vi") + name.slice(1);
  const noHyphen = name.includes("-") ? name.replace(/-/g, " ") : "";
  return [...new Set([every, firstOnly, noFirst, noHyphen, lower].filter((x) => x && x !== name))];
}
