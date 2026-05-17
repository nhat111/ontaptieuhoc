"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Question, LessonMeta, formatTime } from "@/lib/quizData";
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

  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(questions.length).fill(null));
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submit = (finalAnswers: (string | null)[]) => {
    sessionStorage.setItem(
      "quizResult",
      JSON.stringify({ questions, answers: finalAnswers, lessonId, lessonTitle: lesson.title })
    );
    router.push("/result");
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); submit(answersRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (questionIndex: number, answer: string) => {
    setCurrent(questionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = answer;
      return next;
    });
  };

  const scrollToQuestion = (index: number) => {
    setCurrent(index);
    document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isLow = timeLeft < 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-6">
          {/* Breadcrumb */}
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

          {/* Title + edit link */}
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

          {/* Timer */}
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
