import { Suspense } from "react";
import type { Metadata } from "next";
import QuizClient from "@/components/quiz/QuizClient";
import { getQuestionsFromDB, getLessonMetaFromDB } from "@/lib/db";

interface Props {
  searchParams: Promise<{ lessonId?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lessonId: rawId } = await searchParams;
  const lessonId = Number(rawId ?? "1");

  const [lesson, questions] = await Promise.all([
    getLessonMetaFromDB(lessonId),
    getQuestionsFromDB(lessonId),
  ]);

  const context = [lesson.subjectName, lesson.grade ? `lớp ${lesson.grade}` : null]
    .filter(Boolean)
    .join(" ");

  const description = questions.length
    ? `${lesson.title}${context ? ` — ${context}` : ""}: ${questions.length} câu hỏi, ${lesson.durationMinutes ?? 15} phút. Làm bài trực tuyến miễn phí, chấm điểm ngay và xem lời giải từng câu.`
    : `${lesson.title}${context ? ` — ${context}` : ""} trên Ôn Tập Tiểu Học.`;

  return {
    title: lesson.title,
    description,
    alternates: { canonical: `/quiz?lessonId=${lessonId}` },
    // An empty lesson is a dead end for searchers, so keep it out of the index.
    robots: questions.length ? undefined : { index: false, follow: true },
    openGraph: {
      title: lesson.title,
      description,
      url: `/quiz?lessonId=${lessonId}`,
    },
    twitter: { title: lesson.title, description },
  };
}

export default async function QuizPage({ searchParams }: Props) {
  const { lessonId: rawId } = await searchParams;
  const lessonId = Number(rawId ?? "1");

  const [questions, lesson] = await Promise.all([
    getQuestionsFromDB(lessonId),
    getLessonMetaFromDB(lessonId),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Đang tải bài kiểm tra...</p>
        </div>
      }
    >
      <QuizClient initialQuestions={questions} initialLesson={lesson} />
    </Suspense>
  );
}
