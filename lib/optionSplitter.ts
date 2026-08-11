// Tách phần đáp án A/B/C/D ra khỏi nội dung câu hỏi khi người dùng dán cả cụm.
//
// Chép đề từ Word hay web thì câu hỏi và đáp án dính liền một khối. Trước đây
// phải tự tay cắt từng đáp án dán sang từng ô — việc lặp đi lặp lại và dễ sót.
//
// Nguyên tắc: **chỉ tách khi chắc chắn**. Đoán sai thì phá mất nội dung người
// dùng vừa dán, tệ hơn nhiều so với việc để họ tự cắt. Nên bắt buộc phải thấy
// một dãy nhãn liên tiếp bắt đầu từ A (A, B, rồi C, D…), đúng thứ tự.

export type SplitResult = {
  /** Nội dung câu hỏi sau khi đã bỏ phần đáp án. */
  stem: string;
  options: string[];
  /** Vị trí đáp án đúng nếu trong text có ghi "Đáp án: B"; không có thì null. */
  correctIdx: number | null;
};

const LETTERS = "ABCDEF";

/**
 * Nhãn đáp án: chữ cái + dấu phân cách, đứng đầu dòng hoặc sau khoảng trắng.
 *
 * Bắt buộc có dấu phân cách (`.`/`)`/`:`) — không thì mọi chữ "A" giữa câu đều
 * bị hiểu là nhãn.
 */
const LABEL = /(^|[\s\n])([A-Fa-f])\s*[.):]\s+/g;

const ANSWER_MARK = /(?:Đáp án|ĐÁP ÁN|Answer|Chọn)\s*[:.]?\s*([A-Fa-f])\b/;

/**
 * Thử tách. Trả `null` khi không đủ chắc — bên gọi giữ nguyên text người dùng dán.
 */
export function splitOptions(raw: string): SplitResult | null {
  const text = raw.replace(/\r\n?/g, "\n").trim();
  if (!text) return null;

  // Gom mọi vị trí nhãn tìm được.
  const hits: { letter: string; start: number; contentStart: number }[] = [];
  LABEL.lastIndex = 0;
  for (let m = LABEL.exec(text); m; m = LABEL.exec(text)) {
    hits.push({
      letter: m[2].toUpperCase(),
      start: m.index + m[1].length,
      contentStart: m.index + m[0].length,
    });
  }

  // Giữ dãy liên tiếp đúng thứ tự A, B, C… Bỏ qua nhãn lạc (ví dụ chữ "A." nằm
  // trong lời dẫn) bằng cách chỉ nhận nhãn khớp chữ cái đang chờ.
  const seq: typeof hits = [];
  for (const h of hits) {
    if (h.letter === LETTERS[seq.length]) seq.push(h);
  }
  if (seq.length < 2) return null;

  const stem = text.slice(0, seq[0].start).trim();
  // Không có phần câu hỏi thì đây không phải "câu hỏi kèm đáp án" — có thể
  // người dùng đang dán riêng danh sách đáp án. Đừng đụng vào.
  if (!stem) return null;

  const options: string[] = [];
  for (let i = 0; i < seq.length; i++) {
    const end = i + 1 < seq.length ? seq[i + 1].start : text.length;
    let value = text.slice(seq[i].contentStart, end).trim();

    // Dòng "Đáp án: B" thường nằm ngay sau đáp án cuối; cắt khỏi nội dung.
    const cut = value.search(/(?:Đáp án|ĐÁP ÁN|Answer|Chọn)\s*[:.]?\s*[A-Fa-f]\b/);
    if (cut >= 0) value = value.slice(0, cut).trim();

    // Đáp án rỗng nghĩa là nhận diện sai — thà không tách còn hơn tạo ô trống.
    if (!value) return null;
    options.push(value.replace(/\s*\n\s*/g, " "));
  }

  const mark = ANSWER_MARK.exec(text);
  const letter = mark?.[1]?.toUpperCase();
  const idx = letter ? LETTERS.indexOf(letter) : -1;

  return {
    stem: stem.replace(/\s*\n\s*/g, " "),
    options,
    correctIdx: idx >= 0 && idx < options.length ? idx : null,
  };
}
