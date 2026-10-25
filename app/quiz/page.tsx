import { Suspense } from "react";
import type { Metadata } from "next";
import QuizClient from "@/components/quiz/QuizClient";
import { getQuestionsFromDB, getLessonMetaFromDB } from "@/lib/db";
import { cleanSeed, quickExamById, quickExamHref, rowToQuestion } from "@/lib/quickExam";
import { paperRows } from "@/lib/exam5/paper";
import { passageAudio } from "@/lib/exam5/tiengAnh";
import type { Reading } from "@/lib/quizData";

interface Props {
  searchParams: Promise<{ lessonId?: string; de?: string; seed?: string }>;
}

/** `?de=toan-3-cuoi-hk1&seed=abc` — đề tự sinh (lib/quickExam.ts), không có trong DB. */
function quickExamOf(sp: { de?: string; seed?: string }) {
  const spec = quickExamById(sp.de);
  const seed = cleanSeed(sp.seed);
  return spec && seed ? { spec, seed } : null;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const quick = quickExamOf(sp);
  // Mỗi seed là một đề khác nhau, vô số URL — không cho vào chỉ mục.
  if (quick) return { title: quick.spec.title, robots: { index: false, follow: true } };
  const { lessonId: rawId } = sp;
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
    : `${lesson.title}${context ? ` — ${context}` : ""} trên Ôn Tập Cùng Con.`;

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

/** Bài đọc tiếng Anh có file đọc sẵn thì gắn vào, để ReadingCard hiện nút nghe. */
function withAudio(p: Reading | undefined): Reading | undefined {
  if (!p) return p;
  const audioUrl = passageAudio(p);
  return audioUrl ? { ...p, audioUrl } : p;
}

export default async function QuizPage({ searchParams }: Props) {
  const sp = await searchParams;
  const quick = quickExamOf(sp);
  const lessonId = Number(sp.lessonId ?? "1");

  const paper = quick ? quick.spec.paper(quick.seed) : null;
  const [questions, lesson] = quick && paper
    ? [
        paperRows(paper).map((r, i) => rowToQuestion(r, i + 1)),
        {
          reading: paper.reading
            ? { title: paper.reading.title, text: paper.reading.text }
            : withAudio(paper.sections.find((x) => x.passage)?.passage),
          id: 0,
          title: quick.spec.title,
          grade: quick.spec.grade,
          subjectName: quick.spec.subject,
          durationMinutes: quick.spec.minutes,
        },
      ]
    : await Promise.all([getQuestionsFromDB(lessonId), getLessonMetaFromDB(lessonId)]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400">Đang tải bài kiểm tra...</p>
        </div>
      }
    >
      <QuizClient
        initialQuestions={questions}
        initialLesson={lesson}
        quickExamHref={quick ? quickExamHref(quick.spec, quick.seed) : undefined}
      />
    </Suspense>
  );
}
