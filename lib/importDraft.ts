// Kiểm tra câu hỏi đang soạn trong khu soạn đề (components/import/ImportClient).
//
// Một chỗ duy nhất quyết định "câu này đã lưu được chưa": danh sách "Còn thiếu"
// cạnh nút Lưu, huy hiệu trên đầu từng câu và lúc bấm Lưu đều đọc từ đây, nên
// không thể có chuyện câu hiện "xong" mà lưu lại bị từ chối.
//
// Lỗi đáng sợ nhất ở đây là lỗi im lặng: đề lưu được nhưng chấm sai. Vì vậy câu
// mới tạo KHÔNG chọn sẵn đáp án (correctIdx = -1) và các trường hợp chấm sai
// không ai thấy (đáp án trùng nhau, "1.250" bị hiểu là 1,25) đều bị chặn.

import type { QDraft } from "@/components/import/QuestionCard";
import type { Question } from "@/lib/quizData";

/** Chưa chọn đáp án đúng (câu trắc nghiệm). */
export const NO_ANSWER = -1;

/** Số viết kiểu ngăn nghìn bằng dấu chấm: 1.250, 12.000.000. */
const THOUSANDS_DOT = /^-?\d{1,3}(\.\d{3})+$/;
/** Một số hợp lệ cho câu "Điền số": nguyên hoặc thập phân, dấu phẩy hay dấu chấm. */
const PLAIN_NUMBER = /^-?\d+([.,]\d+)?$/;

/**
 * Mọi chỗ chưa ổn của một câu, viết bằng lời cho cô giáo đọc. Rỗng = lưu được.
 * Thứ tự là thứ tự người soạn sẽ sửa: nội dung → đáp án → đáp án đúng.
 */
export function draftProblems(q: QDraft): string[] {
  const out: string[] = [];
  if (!q.content.trim()) out.push("Chưa có nội dung câu hỏi");

  switch (q.type) {
    case "mcq":
    case "multi": {
      const filled = q.options.map((o) => o.trim());
      if (filled.filter(Boolean).length < 2) out.push("Cần ít nhất 2 đáp án");
      else if (filled.some((o) => !o)) out.push("Còn ô đáp án bỏ trống — điền hoặc xoá ô đó");
      // Chấm theo CHỮ của đáp án, nên hai đáp án giống nhau thì chọn ô nào cũng
      // được tính như nhau — đề sai mà không ai nhận ra.
      const keys = filled.filter(Boolean).map((o) => o.toLowerCase());
      if (new Set(keys).size < keys.length) out.push("Có hai đáp án giống nhau");
      if (q.type === "mcq" && (q.correctIdx < 0 || q.correctIdx >= q.options.length)) {
        out.push("Chưa chọn đáp án đúng");
      }
      if (q.type === "multi" && q.correctIdxs.length === 0) out.push("Chưa chọn đáp án đúng nào");
      break;
    }
    case "short":
      if (!q.answer.split("|").some((a) => a.trim())) out.push("Chưa có đáp án mẫu");
      break;
    case "numeric": {
      const a = q.answer.trim();
      if (!a) out.push("Chưa có đáp án");
      else if (THOUSANDS_DOT.test(a)) {
        out.push(`“${a}” sẽ bị hiểu là số thập phân — viết liền ${a.replace(/\./g, "")} nếu là số nghìn`);
      } else if (!PLAIN_NUMBER.test(a)) out.push("Đáp án phải là một số (vd 42 hoặc 3,5)");
      break;
    }
  }
  return out;
}

export type LessonProblem = {
  /** Vị trí câu (0-based) — `null` khi lỗi nằm ở phần thông tin bài. */
  index: number | null;
  /** id của câu để cuộn tới. */
  id?: string;
  text: string;
};

/** Toàn bộ chỗ còn thiếu trước khi lưu: thông tin bài trước, rồi từng câu. */
export function lessonProblems(input: { subject: string | null; title: string; questions: QDraft[] }): LessonProblem[] {
  const out: LessonProblem[] = [];
  if (!input.subject) out.push({ index: null, text: "Chưa chọn môn học" });
  if (!input.title.trim()) out.push({ index: null, text: "Chưa đặt tên bài" });
  if (!input.questions.length) out.push({ index: null, text: "Chưa có câu hỏi nào" });
  input.questions.forEach((q, i) => {
    for (const text of draftProblems(q)) out.push({ index: i, id: q.id, text });
  });
  return out;
}

/** Câu còn trống trơn (chưa gõ gì) — dùng để biết trang đang ở trạng thái "mới mở". */
export function isBlankDraft(q: QDraft): boolean {
  return !q.content.trim() && q.options.every((o) => !o.trim()) && !q.answer.trim() && !(q.images?.length);
}

/** Đáp án đúng theo cách lưu vào DB (xem CLAUDE.md, mục `correct_answer`). */
export function encodeCorrectAnswer(q: QDraft): string {
  switch (q.type) {
    case "mcq":
      return q.options[q.correctIdx] ?? "";
    case "multi":
      return JSON.stringify(q.correctIdxs.map((i) => q.options[i]).filter(Boolean));
    case "short":
    case "numeric":
      return q.answer.trim();
  }
}

/** Câu đang soạn → câu của trang làm bài, để "Xem như học sinh" dùng đúng thẻ câu hỏi thật. */
export function draftToQuestion(q: QDraft, i: number): Question {
  const images = (q.images ?? []).filter((img) => img && img.url);
  const choice = q.type === "mcq" || q.type === "multi";
  return {
    id: i + 1,
    type: q.type,
    question: q.content,
    options: choice ? q.options : [],
    correctAnswer: encodeCorrectAnswer(q),
    images,
    imageUrl: images[0]?.url,
    explanation: q.solution?.trim() || undefined,
  };
}
