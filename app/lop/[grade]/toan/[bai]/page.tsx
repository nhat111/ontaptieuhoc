import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, PencilRuler } from "lucide-react";
import Header from "@/components/Header";
import QuizClient from "@/components/quiz/QuizClient";
import { cleanSeed, rowToQuestion } from "@/lib/quickExam";
import {
  buildSgkRows, findSgkLesson, freshSeed, sgkBook, sgkProgressKey, sgkReady, sgkToanHref,
} from "@/lib/sgk";

interface Props {
  params: Promise<{ grade: string; bai: string }>;
  searchParams: Promise<{ seed?: string }>;
}

async function load(params: Props["params"]) {
  const { grade: g, bai } = await params;
  const grade = Number(g);
  const m = /^bai-(\d{1,3})$/.exec(bai);
  const found = m ? findSgkLesson(grade, Number(m[1])) : null;
  return found ? { grade, bookName: sgkBook(grade)!.book, ...found } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const x = await load(params);
  if (!x) return {};
  const title = `Bài ${x.lesson.so}: ${x.lesson.ten} – Toán ${x.grade} ${x.bookName}`;
  const ready = sgkReady(x.grade, x.lesson);
  const description = ready
    ? `Luyện tập Toán lớp ${x.grade} bài ${x.lesson.so} "${x.lesson.ten}" (sách ${x.bookName}, chủ đề ${x.topic.so}): 10 câu làm trên máy, chấm điểm ngay, có lời giải, mỗi lần một bộ câu mới.`
    : `Toán lớp ${x.grade} bài ${x.lesson.so} "${x.lesson.ten}" (sách ${x.bookName}).`;
  const url = sgkToanHref(x.grade, x.lesson.so);
  return {
    title, description,
    alternates: { canonical: url },
    // Bài chưa có câu luyện thì không đưa vào chỉ mục.
    robots: ready ? undefined : { index: false, follow: true },
    openGraph: { title, description, url },
  };
}

export default async function SgkLessonPage({ params, searchParams }: Props) {
  const x = await load(params);
  if (!x) notFound();
  const { grade, topic, lesson } = x;
  const listHref = sgkToanHref(grade);

  if (!sgkReady(grade, lesson)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500" aria-hidden>
            {lesson.thucHanh ? <PencilRuler className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Toán {grade} · Chủ đề {topic.so} · Bài {lesson.so}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{lesson.ten}</h1>
          <p className="mt-3 text-slate-600">
            {lesson.thucHanh
              ? "Đây là bài thực hành — bé vẽ, đo, ghi chép trên giấy cùng thầy cô và bố mẹ, nên không có bài làm trên máy."
              : "Bài này đang được soạn câu luyện tập. Trong lúc chờ, bé có thể luyện các bài khác của chủ đề."}
          </p>
          <Link href={listHref} className="mt-6 inline-flex min-h-11 items-center gap-1 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-5 font-extrabold text-white hover:bg-primary-700 active:border-b-2">
            Xem các bài Toán {grade}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  // Không có seed → bộ câu mới mỗi lần vào (bấm "Làm bộ câu mới" ở trang kết quả).
  const seed = cleanSeed((await searchParams).seed) ?? freshSeed();
  const questions = buildSgkRows(grade, lesson, seed).map((r, i) => rowToQuestion(r, i + 1));

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <QuizClient
        initialQuestions={questions}
        initialLesson={{
          id: 0,
          title: `Bài ${lesson.so}. ${lesson.ten}`,
          grade,
          subjectName: "Toán",
          durationMinutes: 15,
        }}
        quickExamHref={sgkToanHref(grade, lesson.so)}
        progressKey={sgkProgressKey(grade, lesson.so)}
        backLink={{ href: listHref, label: `Toán ${grade} theo bài` }}
        practice
      />
    </Suspense>
  );
}
