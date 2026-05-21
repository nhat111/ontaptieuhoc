// Types và helpers — data thật load từ Supabase qua lib/db.ts

export type QType = "mcq" | "multi" | "short" | "numeric";

export type Question = {
  id: number;
  type: QType;
  question: string;
  options: string[]; // [] for short/numeric
  correctAnswer: string; // see scoreAnswer below for per-type encoding
  imageUrl?: string;
};

export type LessonMeta = {
  id: number;
  title: string;
  grade?: number | null;
  subjectName?: string | null;
};

export type QuizResult = {
  questions: Question[];
  answers: (string | null)[];
  lessonId: number;
  lessonTitle?: string;
};

export const LABELS = ["A", "B", "C", "D", "E", "F"] as const;

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
