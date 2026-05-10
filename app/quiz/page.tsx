import { Suspense } from "react";
import QuizClient from "@/components/quiz/QuizClient";

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Đang tải bài kiểm tra...</p>
        </div>
      }
    >
      <QuizClient />
    </Suspense>
  );
}
