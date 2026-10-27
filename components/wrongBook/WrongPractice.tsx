"use client";
import Link from "next/link";
import QuizClient from "@/components/quiz/QuizClient";
import type { Question } from "@/lib/quizData";
import { useMounted, useWrongBook } from "./hooks";

const MAX = 10;
/** Câu gốc (không có dạng) kèm vào buổi ôn — tối đa bấy nhiêu câu. */
const MAX_ORIGINALS = 5;

/**
 * Buổi ôn của Sổ câu sai: câu tương tự (server sinh từ dạng) + câu gốc không có dạng
 * (chỉ có trên máy, nên ghép ở trình duyệt). Chưa đọc được máy thì chưa hiện bài.
 */
export default function WrongPractice({ similar, withOriginals, retryHref, shareHref }: {
  similar: Question[]; withOriginals: boolean; retryHref: string; shareHref?: string;
}) {
  const mounted = useMounted();
  const book = useWrongBook();
  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  const originals = withOriginals ? book.entries.filter((e) => !e.src).slice(0, MAX_ORIGINALS).map((e) => e.q) : [];
  const questions = [...similar.slice(0, MAX - originals.length), ...originals].map((q, i) => ({ ...q, id: i + 1 }));
  if (!questions.length) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-extrabold text-slate-800">Không còn câu nào để ôn.</p>
        <Link href="/so-cau-sai" className="mt-4 inline-block font-bold text-primary-700 underline">Về Sổ câu sai</Link>
      </div>
    );
  }
  return (
    <QuizClient
      key={questions.map((q) => q.question).join("|")}
      initialQuestions={questions}
      initialLesson={{ id: 0, title: "Ôn câu sai", durationMinutes: 15 }}
      quickExamHref={retryHref}
      shareHref={originals.length ? undefined : shareHref}
      backLink={{ href: "/so-cau-sai", label: "Sổ câu sai" }}
      retryLabel="Ôn bộ câu khác"
      practice
    />
  );
}
