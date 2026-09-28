"use client";
import Link from "next/link";
import { useState } from "react";
import { Burst, Mascot, type Mood } from "@/components/games/Fx";

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
  const [mood, setMood] = useState<Mood>("idle");
  const [beat, setBeat] = useState(0);
  const q = SAMPLES[i];

  function pick(o: string) {
    if (done || wrong.includes(o)) return;
    setBeat((b) => b + 1);
    if (o === q.answer) {
      setDone(true);
      setMood("happy");
    } else {
      setWrong([...wrong, o]);
      setMood("sad");
    }
  }

  function next() {
    setI((i + 1) % SAMPLES.length);
    setWrong([]);
    setDone(false);
    setMood("idle");
    setBeat((b) => b + 1);
  }

  const bubble = done ? "Đúng rồi! Giỏi quá!" : mood === "sad" ? "Chưa đúng, thử lại nhé!" : "Bé thử câu này nhé!";

  return (
    <div className="relative rounded-3xl border border-amber-100 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(180,120,20,0.25)] sm:p-6">
      {done && <Burst key={beat} id={beat} />}
      <Mascot mood={mood} text={bubble} beat={beat} />

      <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Làm thử · Lớp {q.grade}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-800 sm:text-2xl">{q.question}</p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {q.options.map((o) => {
          const isWrong = wrong.includes(o);
          const isRight = done && o === q.answer;
          return (
            <button
              key={o}
              onClick={() => pick(o)}
              disabled={isWrong || done}
              className={`rounded-2xl border-2 px-3 py-3 text-lg font-bold transition-all ${
                isRight
                  ? "border-green-500 bg-green-50 text-green-700 border-b-[6px]"
                  : isWrong
                    ? "border-slate-100 bg-slate-50 text-slate-300"
                    : "border-slate-200 border-b-[6px] bg-white text-slate-800 hover:border-blue-400 active:translate-y-1 active:border-b-2"
              } ${isWrong && beat ? "motion-safe:animate-shake" : ""}`}
            >
              {o}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <button onClick={next} className="font-semibold text-slate-500 hover:text-blue-600">
          ↻ Câu khác
        </button>
        {done && (
          <Link href={`/lop/${q.grade}`} className="font-bold text-blue-600 hover:underline">
            Làm tiếp bài lớp {q.grade} →
          </Link>
        )}
      </div>
    </div>
  );
}
