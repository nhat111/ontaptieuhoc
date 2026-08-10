// Types và helpers — data thật load từ Supabase qua lib/db.ts

export type QType = "mcq" | "multi" | "short" | "numeric";

// One question may have multiple images, each positioned before or after the
// question text (and before the answer options).
export type QImage = {
  url: string;
  position: "before" | "after";
};

export type Question = {
  id: number;
  type: QType;
  question: string;
  options: string[]; // [] for short/numeric
  correctAnswer: string; // see scoreAnswer below for per-type encoding
  images?: QImage[];
  /** @deprecated legacy single-image field, mirrors images[0]?.url */
  imageUrl?: string;
  explanation?: string; // optional worked solution / "lời giải", shown on the result page
  /**
   * File giọng đọc gắn sẵn cho câu này (sinh ngoài bằng Piper rồi tải lên).
   * Có nó thì phát thẳng, không gọi TTS đám mây — không hạn mức, không chờ.
   */
  audioUrl?: string;
};

export type LessonMeta = {
  id: number;
  title: string;
  grade?: number | null;
  subjectName?: string | null;
  durationMinutes?: number;
};

export type QuizResult = {
  questions: Question[];
  answers: (string | null)[];
  lessonId: number;
  lessonTitle?: string;
  // Carried over from LessonMeta so /result can build a correct breadcrumb —
  // it has no server props of its own, only this sessionStorage payload.
  grade?: number | null;
  subjectName?: string | null;
};

export const LABELS = ["A", "B", "C", "D", "E", "F"] as const;

/** Fisher-Yates, trả mảng mới — không đụng vào mảng gốc từ server props. */
function shuffled<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Trộn đề trước khi làm.
 *
 * Trộn đáp án an toàn vì `correctAnswer` lưu **nội dung** đáp án chứ không phải
 * vị trí (xem scoreAnswer) — đổi chỗ options không làm sai điểm. Câu short/
 * numeric không có options nên giữ nguyên.
 */
export function shuffleQuiz(
  questions: Question[],
  opts: { questions?: boolean; options?: boolean }
): Question[] {
  const list = opts.questions ? shuffled(questions) : questions;
  if (!opts.options) return list;
  return list.map((q) =>
    q.options.length > 1 ? { ...q, options: shuffled(q.options) } : q
  );
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Per-type scoring. `answer` is what the quiz UI stores in answers[i]:
//   mcq:     selected option text
//   multi:   JSON.stringify(string[]) of selected option texts
//   short:   raw user input
//   numeric: raw user input (may contain ',' as decimal separator)
export function scoreAnswer(q: Question, answer: string | null): boolean {
  if (answer === null || answer === "") return false;
  switch (q.type) {
    case "mcq":
      return answer === q.correctAnswer;
    case "multi": {
      try {
        const got = JSON.parse(answer) as string[];
        const want = JSON.parse(q.correctAnswer) as string[];
        if (!Array.isArray(got) || !Array.isArray(want)) return false;
        if (got.length !== want.length) return false;
        const set = new Set(want);
        return got.every((x) => set.has(x));
      } catch {
        return false;
      }
    }
    case "short": {
      const accepted = q.correctAnswer.split("|").map((s) => s.trim().toLowerCase());
      return accepted.includes(answer.trim().toLowerCase());
    }
    case "numeric": {
      const a = parseFloat(answer.replace(",", "."));
      const b = parseFloat(q.correctAnswer.replace(",", "."));
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      return Math.abs(a - b) < 1e-9;
    }
  }
}

// Fallback khi không có data từ DB và không có import local
export function getQuestions(_lessonId: number): Question[] {
  return [];
}

export function getLessonMeta(lessonId: number): LessonMeta {
  return { id: lessonId, title: `Bài ${lessonId}` };
}
