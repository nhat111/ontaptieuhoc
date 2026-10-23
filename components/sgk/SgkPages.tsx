import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenCheck, ChevronRight, Clock, PencilRuler } from "lucide-react";
import Header from "@/components/Header";
import QuizClient from "@/components/quiz/QuizClient";
import SgkTopicList, { type SgkTopicView } from "@/components/sgk/SgkTopicList";
import { gradeTheme } from "@/lib/gradeTheme";
import { cleanSeed, rowToQuestion } from "@/lib/quickExam";
import {
  baiLabel, buildSgkExamples, buildSgkRows, findSgkLesson, freshSeed, sgkBook, sgkHref, sgkLessons, sgkProgressKey, sgkReady,
} from "@/lib/sgk";

// Trang mục lục và trang từng bài của một cuốn sách (lib/sgk), dùng chung cho
// /lop/[grade]/toan và /lop/[grade]/tieng-viet: route chỉ truyền lớp và đoạn đường dẫn môn.

const tapName = (tap: 1 | 2) => (tap === 1 ? "một" : "hai");

export function sgkBookMetadata(grade: number, slug: string): Metadata {
  const book = sgkBook(grade, slug);
  if (!book) return {};
  const title = `${book.subject} ${grade} ${book.book} – luyện tập theo từng bài`;
  const description = `Bài luyện tập ${book.subject} lớp ${grade} theo đúng từng bài sách ${book.book}: làm trên máy, chấm điểm ngay, mỗi lần một bộ câu mới, in được phiếu. Miễn phí, không cần đăng nhập.`;
  const url = sgkHref(grade, slug);
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url } };
}

export function SgkBookView({ grade, slug }: { grade: number; slug: string }) {
  const book = sgkBook(grade, slug);
  if (!book) notFound();
  const theme = gradeTheme(grade);

  const view = (tap: 1 | 2): SgkTopicView[] => book.topics.filter((t) => t.tap === tap).map((t) => ({
    so: t.so, ten: t.ten,
    rows: t.bai.map((l) => ({
      so: l.so, label: baiLabel(l), ten: l.ten, href: sgkHref(grade, slug, l.so), progressKey: sgkProgressKey(grade, l.so, slug),
      status: sgkReady(grade, l, slug) ? "ready" : l.thucHanh ? "paper" : "soon", luyen: !!l.luyen,
    })),
  }));
  const all = sgkLessons(grade, slug);
  const ready = all.filter((x) => sgkReady(grade, x.lesson, slug)).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <nav aria-label="Đường dẫn" className="mb-5 flex items-center gap-1 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href={`/lop/${grade}`} className="hover:text-slate-700">Lớp {grade}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-slate-600">{book.subject} theo bài</span>
        </nav>

        <div className="mb-6 flex items-start gap-4">
          <span className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-b-4 ${theme.edge} ${theme.soft} ${theme.text} text-4xl font-black tabular-nums`} aria-hidden>
            {grade}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{book.subject} {grade} theo từng bài</h1>
            <p className="mt-1 text-sm text-slate-600">
              Đúng thứ tự bài trong sách <b>{book.book}</b>. Mỗi bài 10 câu, làm trên máy chấm ngay; mỗi lần vào là một bộ câu mới.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <BookOpenCheck className="h-3.5 w-3.5 text-success-600" aria-hidden />
              {ready}/{all.length} bài đã luyện được trên máy
            </p>
          </div>
        </div>

        {([1, 2] as const).map((tap) => (
          <section key={tap} className="mb-8">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">Tập {tapName(tap)}</h2>
            <SgkTopicList topics={view(tap)} accent={`${theme.soft} ${theme.text}`} topicLabel={book.topicLabel} />
          </section>
        ))}
      </div>
    </div>
  );
}

function load(grade: number, slug: string, bai: string) {
  const m = /^bai-(\d{1,3})$/.exec(bai);
  const found = m ? findSgkLesson(grade, Number(m[1]), slug) : null;
  const book = sgkBook(grade, slug);
  return found && book ? { book, ...found } : null;
}

export function sgkLessonMetadata(grade: number, slug: string, bai: string): Metadata {
  const x = load(grade, slug, bai);
  if (!x) return {};
  const { book, topic, lesson } = x;
  const n = baiLabel(lesson);
  const tap = book.topics.some((t) => t.tap === 2) && lesson.soTap ? ` tập ${tapName(topic.tap)}` : "";
  const title = `Bài ${n}: ${lesson.ten} – ${book.subject} ${grade}${tap} ${book.book}`;
  const ready = sgkReady(grade, lesson, slug);
  const label = (book.topicLabel ?? "Chủ đề").toLowerCase();
  const description = ready
    ? `Luyện tập ${book.subject} lớp ${grade}${tap} bài ${n} "${lesson.ten}" (sách ${book.book}, ${label} ${topic.so}): 10 câu làm trên máy, chấm điểm ngay, có lời giải, mỗi lần một bộ câu mới.`
    : `${book.subject} lớp ${grade} bài ${n} "${lesson.ten}" (sách ${book.book}).`;
  const url = sgkHref(grade, slug, lesson.so);
  return {
    title, description,
    alternates: { canonical: url },
    // Bài chưa có câu luyện thì không đưa vào chỉ mục.
    robots: ready ? undefined : { index: false, follow: true },
    openGraph: { title, description, url },
  };
}

export function SgkLessonView({ grade, slug, bai, seed: seedParam }: { grade: number; slug: string; bai: string; seed?: string }) {
  const x = load(grade, slug, bai);
  if (!x) notFound();
  const { book, topic, lesson } = x;
  const listHref = sgkHref(grade, slug);
  const label = book.topicLabel ?? "Chủ đề";
  const n = baiLabel(lesson);

  if (!sgkReady(grade, lesson, slug)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500" aria-hidden>
            {lesson.thucHanh ? <PencilRuler className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{book.subject} {grade} · {label} {topic.so} · Bài {n}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{lesson.ten}</h1>
          <p className="mt-3 text-slate-600">
            {lesson.thucHanh
              ? "Đây là bài thực hành — bé vẽ, đo, ghi chép trên giấy cùng thầy cô và bố mẹ, nên không có bài làm trên máy."
              : `Bài này đang được soạn câu luyện tập. Trong lúc chờ, bé có thể luyện các bài khác của ${label.toLowerCase()}.`}
          </p>
          <Link href={listHref} className="mt-6 inline-flex min-h-11 items-center gap-1 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-5 font-extrabold text-white hover:bg-primary-700 active:border-b-2">
            Xem các bài {book.subject} {grade}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  // Không có seed → bộ câu mới mỗi lần vào (bấm "Làm bộ câu mới" ở trang kết quả).
  const seed = cleanSeed(seedParam) ?? freshSeed();
  const questions = buildSgkRows(grade, lesson, seed, slug).map((r, i) => rowToQuestion(r, i + 1));
  const examples = buildSgkExamples(grade, lesson, slug).map((r, i) => rowToQuestion(r, i + 1));
  const tap = lesson.soTap ? ` (tập ${tapName(topic.tap)})` : "";

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <QuizClient
        initialQuestions={questions}
        initialLesson={{
          id: 0,
          title: `Bài ${n}${tap}. ${lesson.ten}`,
          grade,
          subjectName: book.subject,
          durationMinutes: 15,
        }}
        quickExamHref={sgkHref(grade, slug, lesson.so)}
        progressKey={sgkProgressKey(grade, lesson.so, slug)}
        backLink={{ href: listHref, label: `${book.subject} ${grade} theo bài` }}
        examples={examples}
        practice
      />
    </Suspense>
  );
}
