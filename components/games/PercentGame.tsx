"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makePercentQuestion, type PercentLevel } from "@/lib/games5";

const LEVELS = [
  { id: "tim-gia-tri", label: "🔢 Tìm giá trị", hint: "25% của 80 là bao nhiêu?" },
  { id: "ti-so", label: "📊 Tỉ số phần trăm", hint: "Bài toán: số này chiếm bao nhiêu phần trăm?" },
];

function make(level: string): GameRound {
  const q = makePercentQuestion(level as PercentLevel);
  const short = level === "tim-gia-tri";
  return {
    // Đọc cả đề (bài toán có lời văn khá dài); chỉ tự đọc ở câu đầu, sau đó bấm Nghe lại.
    say: q.text,
    reveal: q.reveal,
    visual: (
      <p className={short ? "text-4xl sm:text-5xl font-extrabold text-gray-800 text-center" : "text-lg sm:text-xl leading-relaxed text-gray-800 text-center max-w-xl"}>
        {q.text}
      </p>
    ),
    options: q.options.map((o) => ({ key: o, label: <span className="text-2xl sm:text-3xl">{o}</span> })),
    answer: q.answer,
  };
}

export default function PercentGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Tỉ số phần trăm"
      intro="Tìm phần trăm của một số và giải bài toán tỉ số phần trăm. Mỗi lượt 10 câu."
      levels={LEVELS}
      make={make}
      promptOnce
      backHref={backHref}
    />
  );
}
