"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, RotateCw, X } from "lucide-react";
import { Burst } from "@/components/games/Fx";

// "Làm thử một câu" ở trang chủ: phụ huynh hiểu web làm gì trong vài giây —
// bấm là chấm, không cần đăng ký. Câu mẫu viết sẵn (không lấy từ DB) để trang
// chủ không phụ thuộc dữ liệu và luôn có một câu hay để thử.
const SAMPLES = [
  { grade: 1, question: "5 + 3 = ?", options: ["7", "8", "9", "6"], answer: "8" },
  { grade: 2, question: "Số liền sau của 49 là số nào?", options: ["48", "40", "50", "59"], answer: "50" },
  { grade: 3, question: "Từ nào viết đúng chính tả?", options: ["xạch sẽ", "sạch sẽ", "sạch xẽ", "xạch xẽ"], answer: "sạch sẽ" },
  { grade: 4, question: "1 giờ 15 phút = … phút?", options: ["65", "115", "75", "90"], answer: "75" },
  { grade: 5, question: "0,5 viết dưới dạng phân số là?", options: ["1/5", "1/2", "5/100", "2/5"], answer: "1/2" },
];

export default function TryQuestion() {
  const [i, setI] = useState(1);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [lastWrong, setLastWrong] = useState(false);
  const [beat, setBeat] = useState(0);
  const q = SAMPLES[i];

  function pick(o: string) {
    if (done || wrong.includes(o)) return;
    setBeat((b) => b + 1);
    if (o === q.answer) {
      setDone(true);
      setLastWrong(false);
    } else {
      setWrong([...wrong, o]);
      setLastWrong(true);
    }
  }

  function next() {
    setI((i + 1) % SAMPLES.length);
    setWrong([]);
    setDone(false);
    setLastWrong(false);
    setBeat((b) => b + 1);
  }

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.18)] sm:p-6">
      {done && <Burst key={beat} id={beat} />}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">Làm thử một câu · Lớp {q.grade}</p>
        <p
          aria-live="polite"
          className={`inline-flex items-center gap-1 text-xs font-medium ${done ? "text-green-600" : lastWrong ? "text-rose-600" : "text-transparent"}`}
        >
          {done ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          {done ? "Đúng rồi!" : "Chưa đúng, thử lại"}
        </p>
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{q.question}</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {q.options.map((o) => {
          const isWrong = wrong.includes(o);
          const isRight = done && o === q.answer;
          return (
            <button
              key={o}
              onClick={() => pick(o)}
              disabled={isWrong || done}
              className={`rounded-lg border px-3 py-3 text-lg font-semibold transition-colors ${
                isRight
                  ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                  : isWrong
                    ? "border-slate-100 bg-slate-50 text-slate-300 line-through"
                    : "border-slate-200 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50/40"
              } ${isWrong && beat ? "motion-safe:animate-shake" : ""}`}
            >
              {o}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button onClick={next} className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-slate-900">
          <RotateCw className="h-3.5 w-3.5" aria-hidden />
          Câu khác
        </button>
        {done && (
          <Link href={`/lop/${q.grade}`} className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700">
            Làm tiếp bài lớp {q.grade}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
