"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Question, LessonMeta, formatTime } from "@/lib/quizData";
import { loadExamQuestions, loadExamMeta } from "@/lib/examStorage";
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

  // localStorage-imported exam takes priority; DB data is the fallback
  const [{ questions, lesson }] = useState(() => ({
    questions: loadExamQuestions(lessonId, () => initialQuestions),
    lesson: loadExamMeta(lessonId, () => initialLesson),
  }));

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
            {[
              { label: "Trang chủ", href: "/" },
              { label: `Lớp ${lessonId}`, href: `/lop/${lessonId}` },
              { label: "Toán", href: "#" },
              { label: "Đề kiểm tra", href: "#" },
            ].map(({ label, href }) => (
              <span key={label} className="flex items-center gap-1">
                <a href={href} className="text-blue-500 hover:underline">{label}</a>
                <span className="text-gray-400">›</span>
              </span>
            ))}
            <span className="text-orange-500 font-medium">{lesson.title}</span>
          </nav>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-800 text-center mb-5">
            {lesson.title}
          </h1>

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
