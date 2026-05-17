import type { Question } from "./quizData";

export type DraftQuestion = Omit<Question, "correctAnswer"> & {
  correctAnswer: string | null;
};

export function parseExamText(text: string): DraftQuestion[] {
  const lines = text.split("\n").map(l => l.trim());
  const questions: DraftQuestion[] = [];
  let draft: { text: string; options: string[]; answer: string | null } | null = null;

  function commit() {
    if (!draft || !draft.text.trim() || draft.options.length < 2) return;
    const idx = draft.answer ? "ABCD".indexOf(draft.answer) : -1;
    const correctAnswer = idx >= 0 ? (draft.options[idx] ?? null) : null;
    questions.push({ id: questions.length + 1, question: draft.text.trim(), options: draft.options, correctAnswer });
    draft = null;
  }

  for (const line of lines) {
    if (!line) continue;

    // New question: "Câu 1." or "Câu 1:" (with optional space)
    if (/^Câu\s*\d+[:.]/i.test(line)) {
      commit();
      draft = { text: line.replace(/^Câu\s*\d+[:.]\s*/i, "").trim(), options: [], answer: null };
      continue;
    }

    if (!draft) continue; // skip header lines before first "Câu"

    // Answer marker: "Đáp án: C", "Answer: C", or "Chọn C." (loigiaihay.com style)
    const ans = line.match(/^(?:(?:Đáp án|ĐÁP ÁN|Answer)\s*[:\s]+|Chọn\s+)([A-D])/i);
    if (ans) { draft.answer = ans[1].toUpperCase(); continue; }

    // Two options on one line: "A. text    B. text" (2+ spaces between)
    const two = line.match(/^([A-D])[.)]\s*(.+?)\s{2,}([A-D])[.)]\s*(.+)/i);
    if (two) {
      draft.options.push(two[2].trim(), two[4].trim());
      continue;
    }

    // Single option: "A. text"
    const one = line.match(/^([A-D])[.)]\s*(.+)/i);
    if (one) { draft.options.push(one[2].trim()); continue; }

    // Continuation of question text (before options start)
    if (draft.options.length === 0) draft.text += " " + line;
  }

  commit();
  return questions;
}
