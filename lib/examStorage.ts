import type { Question, LessonMeta } from "./quizData";

export type StoredExam = {
  lessonId: number;
  title: string;
  questions: Question[];
};

export function saveExam({ lessonId, title, questions }: StoredExam): void {
  localStorage.setItem(`exam_${lessonId}`, JSON.stringify(questions));
  localStorage.setItem(`examMeta_${lessonId}`, JSON.stringify({ id: lessonId, title }));
}

export function loadExamQuestions(lessonId: number, fallback: () => Question[]): Question[] {
  try {
    const raw = localStorage.getItem(`exam_${lessonId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return fallback();
}

export function loadExamMeta(lessonId: number, fallback: () => LessonMeta): LessonMeta {
  try {
    const raw = localStorage.getItem(`examMeta_${lessonId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback();
}

export function getAllStoredExams(): StoredExam[] {
  const exams: StoredExam[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("exam_") || key.startsWith("examMeta_")) continue;
    const lessonId = parseInt(key.slice(5));
    if (isNaN(lessonId)) continue;
    try {
      const questions = JSON.parse(localStorage.getItem(key)!);
      const metaRaw = localStorage.getItem(`examMeta_${lessonId}`);
      const meta = metaRaw ? JSON.parse(metaRaw) : { title: `Đề ${lessonId}` };
      exams.push({ lessonId, title: meta.title, questions });
    } catch {}
  }
  return exams.sort((a, b) => a.lessonId - b.lessonId);
}

export function deleteExam(lessonId: number): void {
  localStorage.removeItem(`exam_${lessonId}`);
  localStorage.removeItem(`examMeta_${lessonId}`);
}
