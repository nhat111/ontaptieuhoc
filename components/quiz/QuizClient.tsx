"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Question, LessonMeta, formatTime, scoreAnswer } from "@/lib/quizData";
import { buildExamHtml } from "@/lib/exportLesson";
import Header from "@/components/Header";
import QuestionCard from "./QuestionCard";
import QuestionPalette from "./QuestionPalette";

interface Props {
  initialQuestions: Question[];
  initialLesson: LessonMeta;
}

export default function QuizClient({ initialQuestions, initialLesson }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonId = Number(searchParams.get("lessonId") ?? "1");

  const questions = initialQuestions;
  const lesson = initialLesson;
  const durationMinutes = lesson.durationMinutes ?? 15;
  const totalSeconds = durationMinutes * 60;

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(questions.length).fill(null));
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submit = (finalAnswers: (string | null)[]) => {
    const score = finalAnswers.filter((a, i) => scoreAnswer(questions[i], a)).length;
    const total = questions.length;

    fetch("/api/quiz-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, score, total }),
    }).catch(() => {});

    sessionStorage.setItem(
      "quizResult",
      JSON.stringify({ questions, answers: finalAnswers, lessonId, lessonTitle: lesson.title })
    );
    router.push("/result");
  };

  // Timer only runs once user clicks Start.
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); submit(answersRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (questionIndex: number, answer: string) => {
    setCurrent(questionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = answer === "" || answer === "[]" ? null : answer;
      return next;
    });
  };

  const scrollToQuestion = (index: number) => {
    setCurrent(index);
    document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isLow = timeLeft < 60;

  const safeName = (lesson.title || `de-${lessonId}`).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

  function downloadDoc(withAnswers: boolean) {
    const html = buildExamHtml(lesson, questions, { withAnswers });
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}${withAnswers ? "-co-dap-an" : ""}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPdf(withAnswers: boolean) {
    // autoPrint script in the document waits for images to load before
    // opening the print dialog, so figures aren't blank in the PDF.
    const html = buildExamHtml(lesson, questions, { withAnswers, autoPrint: true });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  // ── Start screen ─────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <nav className="flex flex-wrap items-center gap-1 text-xs mb-6">
            <a href="/" className="text-blue-500 hover:underline">Trang chủ</a>
            <span className="text-gray-400">›</span>
            {lesson.grade && (
              <>
                <a href={`/lop/${lesson.grade}`} className="text-blue-500 hover:underline">Lớp {lesson.grade}</a>
                <span className="text-gray-400">›</span>
              </>
            )}
            <span className="text-orange-500 font-medium">{lesson.title}</span>
          </nav>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{lesson.title}</h1>
            {(lesson.grade || lesson.subjectName) && (
              <p className="text-sm text-gray-500 mb-6">
                {lesson.subjectName ?? ""}{lesson.subjectName && lesson.grade ? " · " : ""}
                {lesson.grade ? `Lớp ${lesson.grade}` : ""}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-7">
              <div className="bg-gray-50 rounded-xl border border-gray-100 py-4">
                <div className="text-2xl font-extrabold text-gray-800">{questions.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Câu hỏi</div>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 py-4">
                <div className="text-2xl font-extrabold text-gray-800">{durationMinutes}</div>
                <div className="text-xs text-gray-500 mt-0.5">Phút</div>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                Bài này chưa có câu hỏi nào.
              </div>
            ) : null}

            <button
              onClick={() => setStarted(true)}
              disabled={questions.length === 0}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base px-10 py-3.5 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              Bắt đầu làm bài
            </button>

            <p className="text-[11px] text-gray-400 mt-3">
              Đồng hồ bắt đầu đếm sau khi bấm. Hết giờ tự nộp bài.
            </p>

            {questions.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-gray-400 mr-1">Tải đề:</span>
                <button
                  onClick={() => downloadDoc(false)}
                  className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Word (.doc)
                </button>
                <button
                  onClick={() => openPdf(false)}
                  className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  PDF
                </button>
                <button
                  onClick={() => downloadDoc(true)}
                  className="text-xs font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-colors"
                  title="Tải kèm đáp án"
                >
                  + Đáp án
                </button>
              </div>
            )}

            <a
              href={`/import/edit/${lessonId}`}
              className="inline-flex items-center gap-1 mt-5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
              Sửa đề
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz running ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-6">
          <nav className="flex flex-wrap items-center gap-1 text-xs mb-5">
            <span className="flex items-center gap-1">
              <a href="/" className="text-blue-500 hover:underline">Trang chủ</a>
              <span className="text-gray-400">›</span>
            </span>
            {lesson.grade && (
              <span className="flex items-center gap-1">
                <a href={`/lop/${lesson.grade}`} className="text-blue-500 hover:underline">Lớp {lesson.grade}</a>
                <span className="text-gray-400">›</span>
              </span>
            )}
            {lesson.subjectName && (
              <span className="flex items-center gap-1">
                <a href={lesson.grade ? `/lop/${lesson.grade}?subject=${encodeURIComponent(lesson.subjectName)}` : '#'} className="text-blue-500 hover:underline">
                  {lesson.subjectName}
                </a>
                <span className="text-gray-400">›</span>
              </span>
            )}
            <span className="text-orange-500 font-medium">{lesson.title}</span>
          </nav>

          <div className="flex items-center justify-center gap-3 mb-5">
            <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
            <a
              href={`/import/edit/${lessonId}`}
              title="Chỉnh sửa bài học"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
              Sửa đề
            </a>
          </div>

          <div className={`flex items-center justify-center gap-2 font-mono font-bold text-2xl ${isLow ? "text-red-500 animate-pulse" : "text-green-500"}`}>
            <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 7v5l3 2" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[70%_30%] gap-5 items-start">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              selectedAnswer={answers[i]}
              onSelect={(answer) => handleSelect(i, answer)}
            />
          ))}
        </div>

        <QuestionPalette
          total={questions.length}
          current={current}
          answers={answers}
          onJump={scrollToQuestion}
          onSubmit={() => submit(answers)}
        />
      </div>
    </div>
  );
}
