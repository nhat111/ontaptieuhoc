"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizResult } from "@/lib/quizData";
import Header from "@/components/Header";
import ResultSummary from "@/components/result/ResultSummary";
import ResultItem from "@/components/result/ResultItem";
import { createClient } from "@/lib/supabase/client";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizResult");
    if (!raw) { router.push("/"); return; }
    setResult(JSON.parse(raw));

    createClient().auth.getUser().then(({ data }) => {
      setIsGuest(!data.user);
    });
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Đang tải kết quả...</p>
      </div>
    );
  }

  const { questions, answers, lessonId, lessonTitle } = result;
  const title = lessonTitle ?? `Bài ${lessonId}`;

  const { correct, wrong, unanswered } = questions.reduce(
    (acc, q, i) => {
      if (answers[i] === null) acc.unanswered++;
      else if (answers[i] === q.correctAnswer) acc.correct++;
      else acc.wrong++;
      return acc;
    },
    { correct: 0, wrong: 0, unanswered: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-6">
          <nav className="flex flex-wrap items-center gap-1 text-xs mb-5">
            {[
              { label: "Trang chủ", href: "/" },
              { label: `Lớp ${lessonId}`, href: `/lop/${lessonId}` },
              { label: "Toán", href: "#" },
              { label: title, href: `/quiz?lessonId=${lessonId}` },
            ].map(({ label, href }) => (
              <span key={label} className="flex items-center gap-1">
                <a href={href} className="text-blue-500 hover:underline">{label}</a>
                <span className="text-gray-400">›</span>
              </span>
            ))}
            <span className="text-orange-500 font-medium">Kết quả</span>
          </nav>

          <h1 className="text-xl font-bold text-gray-800 text-center mb-1">
            Kết quả bài làm
          </h1>
          <p className="text-center text-sm text-gray-400">{title}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <ResultSummary
          correct={correct}
          wrong={wrong}
          unanswered={unanswered}
          total={questions.length}
        />

        <h2 className="text-base font-bold text-gray-700 mb-3">Chi tiết từng câu</h2>
        <div className="space-y-3 mb-8">
          {questions.map((q, i) => (
            <ResultItem key={q.id} question={q} userAnswer={answers[i]} index={i} />
          ))}
        </div>

        {isGuest && (
          <div className="mb-5 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-800">Đăng nhập để lưu tiến độ</p>
              <p className="text-xs text-blue-600 mt-0.5">Kết quả bài làm sẽ được lưu vào tài khoản của bạn.</p>
            </div>
            <Link
              href={`/login?redirect=/progress`}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
            >
              Đăng nhập
            </Link>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/quiz?lessonId=${lessonId}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Làm lại
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-white text-gray-700 font-bold py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    </div>
  );
}
