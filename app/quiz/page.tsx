import { Suspense } from "react";
import QuizClient from "@/components/quiz/QuizClient";
import { getQuestionsFromDB, getLessonMetaFromDB } from "@/lib/db";

interface Props {
  searchParams: Promise<{ lessonId?: string }>;
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
