// Types và helpers — data thật load từ Supabase qua lib/db.ts

export type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type LessonMeta = {
  id: number;
  title: string;
};

export type QuizResult = {
  questions: Question[];
  answers: (string | null)[];
  lessonId: number;
  lessonTitle?: string;
};

export const LABELS = ["A", "B", "C", "D"] as const;

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Fallback khi không có data từ DB và không có import local
export function getQuestions(_lessonId: number): Question[] {
  return [];
}

export function getLessonMeta(lessonId: number): LessonMeta {
  return { id: lessonId, title: `Bài ${lessonId}` };
}
