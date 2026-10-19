"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, RotateCw, Sparkles } from "lucide-react";
import { Burst } from "@/components/games/Fx";
import { sfx } from "@/lib/sfx";

// "Làm thử một câu" ở trang chủ: phụ huynh hiểu web làm gì trong vài giây —
// bấm là chấm, không cần đăng ký. Câu mẫu viết sẵn (không lấy từ DB) để trang
// chủ không phụ thuộc dữ liệu và luôn có một câu hay để thử.
// Đúng: nút bật nảy + pháo giấy + tiếng "ding"; sai: nút rung nhẹ + tiếng "bụp" khẽ.
// Âm thanh dùng chung nút tắt tiếng của trò chơi (lib/sfx.ts) và gọi trong cú chạm (iOS).
const SAMPLES = [
  { grade: 1, question: "5 + 3 = ?", options: ["7", "8", "9", "6"], answer: "8" },
  { grade: 2, question: "Số liền sau của 49 là số nào?", options: ["48", "40", "50", "59"], answer: "50" },
  { grade: 3, question: "Từ nào viết đúng chính tả?", options: ["xạch sẽ", "sạch sẽ", "sạch xẽ", "xạch xẽ"], answer: "sạch sẽ" },
  { grade: 4, question: "1 giờ 15 phút = … phút?", options: ["65", "115", "75", "90"], answer: "75" },
  { grade: 5, question: "0,5 viết dưới dạng phân số là?", options: ["1/5", "1/2", "5/100", "2/5"], answer: "1/2" },
];

const LETTERS = ["A", "B", "C", "D"];

export default function TryQuestion() {
  const [i, setI] = useState(1);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [lastWrong, setLastWrong] = useState<string | null>(null);
  const [beat, setBeat] = useState(0);
  const q = SAMPLES[i];

  function pick(o: string) {
    if (done || wrong.includes(o)) return;
    setBeat((b) => b + 1);
    if (o === q.answer) {
      sfx.ding();
      setDone(true);
      setLastWrong(null);
    } else {
      sfx.buzz();
      setWrong([...wrong, o]);
      setLastWrong(o);
    }
  }

  function next() {
    setI((i + 1) % SAMPLES.length);
    setWrong([]);
    setDone(false);
    setLastWrong(null);
    setBeat((b) => b + 1);
  }

  return (
    <div className="relative rounded-3xl border border-primary-100 bg-white p-5 shadow-pop sm:p-6">
      {done && <Burst key={beat} id={beat} />}
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Làm thử một câu · Lớp {q.grade}
        </p>
        <p
          aria-live="polite"
          className={`text-xs font-bold ${done ? "text-success-700" : lastWrong ? "text-coral-700" : "text-transparent"}`}
        >
          {done ? "Đúng rồi, giỏi quá!" : "Chưa đúng, thử lại nhé"}
        </p>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">{q.question}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((o, k) => {
          const isWrong = wrong.includes(o);
          const isRight = done && o === q.answer;
          return (
            <button
              key={o}
              onClick={() => pick(o)}
              disabled={isWrong || done}
              className={`group flex items-center gap-2.5 rounded-2xl border-2 border-b-4 px-3 py-3 text-left text-lg font-extrabold transition-all duration-150 ${
                isRight
                  ? "border-success-500 bg-success-50 text-success-700 motion-safe:animate-boing"
                  : isWrong
                    ? "border-coral-200 bg-coral-50 text-coral-400"
                    : done
                      ? "border-slate-100 bg-white text-slate-400"
                      : "border-slate-200 bg-white text-slate-800 hover:border-primary-400 hover:bg-primary-50 active:translate-y-0.5 active:border-b-2 motion-safe:hover:scale-[1.04]"
              } ${isWrong && lastWrong === o ? "motion-safe:animate-shake" : ""}`}
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                  isRight ? "bg-success-500 text-white" : isWrong ? "bg-coral-100 text-coral-500" : "bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-700"
                }`}
                aria-hidden
              >
                {isRight ? <Check className="h-4 w-4" /> : LETTERS[k]}
              </span>
              <span className={isWrong ? "line-through decoration-2" : ""}>{o}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <button onClick={next} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900">
          <RotateCw className="h-4 w-4" aria-hidden />
          Câu khác
        </button>
        {done && (
          <Link
            href={`/lop/${q.grade}`}
            className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-primary-600 px-4 font-bold text-white shadow-sm hover:bg-primary-700"
          >
            Làm tiếp bài lớp {q.grade}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
