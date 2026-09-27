"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makeCountQuestion, type CountLevel, type CountQuestion } from "@/lib/games";

const LEVELS = [
  { id: "dem", label: "🔢 Đếm số", hint: "Đếm xem có mấy hình (1–10)" },
  { id: "cong5", label: "➕ Cộng trong phạm vi 5", hint: "Gộp hai nhóm hình lại" },
  { id: "cong10", label: "➕ Cộng trong phạm vi 10", hint: "Gộp hai nhóm, tổng đến 10" },
  { id: "tru10", label: "➖ Trừ trong phạm vi 10", hint: "Bớt đi mấy hình thì còn lại mấy" },
];

function Items({ emoji, count, crossed = 0 }: { emoji: string; count: number; crossed?: number }) {
  return (
    // 5 hình một hàng: bé lớp 1 đếm theo nhóm 5 dễ hơn một hàng dài.
    <div
      className="grid gap-1 sm:gap-2 text-4xl sm:text-5xl leading-none"
      style={{ gridTemplateColumns: `repeat(${Math.min(count, 5)}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }, (_, i) => {
        const gone = i >= count - crossed;
        return (
          <span
            key={i}
            // Từng hình bật ra lần lượt, như đang đếm.
            className="relative inline-flex items-center justify-center drop-shadow motion-safe:animate-pop"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className={gone ? "opacity-30" : ""}>{emoji}</span>
            {gone && <span className="absolute text-3xl sm:text-4xl">❌</span>}
          </span>
        );
      })}
    </div>
  );
}

function Visual({ q }: { q: CountQuestion }) {
  if (q.op === "dem") return <Items emoji={q.emoji} count={q.a} />;

  return (
    <div className="flex flex-col items-center gap-4">
      {q.op === "+" ? (
        // Điện thoại hẹp: xếp dọc để hai nhóm không bị ngắt dòng lẫn vào nhau.
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <Items emoji={q.emoji} count={q.a} />
          <span className="text-4xl font-extrabold text-blue-500">+</span>
          <Items emoji={q.emoji} count={q.b} />
        </div>
      ) : (
        <Items emoji={q.emoji} count={q.a} crossed={q.b} />
      )}
      <p className="text-4xl font-extrabold text-gray-700 tracking-wide">
        {q.a} {q.op === "+" ? "+" : "−"} {q.b} = <span className="text-orange-500">?</span>
      </p>
    </div>
  );
}

function make(level: string): GameRound {
  const q = makeCountQuestion(level as CountLevel);
  return {
    say: q.say,
    visual: <Visual q={q} />,
    options: q.options.map((n) => ({
      key: String(n),
      label: <span className="text-4xl sm:text-5xl">{n}</span>,
    })),
    answer: String(q.answer),
  };
}

export default function CountingGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Đếm hình"
      intro="Nhìn hình, đếm rồi chọn số đúng. Mỗi lượt 10 câu."
      levels={LEVELS}
      make={make}
      backHref={backHref}
    />
  );
}
