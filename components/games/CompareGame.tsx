"use client";
import GameShell, { type GameRound } from "./GameShell";
import { CompareRow, SIGN_OPTIONS } from "./MathBits";
import { makeCompareQuestion, type CompareLevel } from "@/lib/games";

const LEVELS = [
  { id: "pham-vi-10", label: "🔟 Phạm vi 10", hint: "So sánh hai số từ 0 đến 10, có hình để đếm" },
  { id: "pham-vi-100", label: "💯 Phạm vi 100", hint: "So sánh hai số có hai chữ số" },
];

/** Số kèm từng ấy hình nhỏ bên dưới (chỉ phạm vi 10) để bé đếm nếu chưa chắc. */
function Side({ n, emoji, dots }: { n: number; emoji: string; dots: boolean }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <span>{n}</span>
      {dots && (
        <span className="grid grid-cols-5 gap-0.5 text-base sm:text-xl leading-none min-h-[1.25rem]">
          {Array.from({ length: n }, (_, i) => <span key={i}>{emoji}</span>)}
        </span>
      )}
    </span>
  );
}

function make(level: string): GameRound {
  const q = makeCompareQuestion(level as CompareLevel);
  const dots = level === "pham-vi-10";
  return {
    say: `So sánh ${q.a} và ${q.b}`,
    reveal: q.reveal,
    visual: <CompareRow left={<Side n={q.a} emoji={q.emoji} dots={dots} />} right={<Side n={q.b} emoji={q.emoji} dots={dots} />} />,
    options: SIGN_OPTIONS,
    answer: q.answer,
  };
}

export default function CompareGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="So sánh số"
      intro="Số nào lớn hơn? Chọn dấu lớn hơn, bé hơn hoặc bằng. Mỗi lượt 10 câu."
      levels={LEVELS}
      make={make}
      optionCols={3}
      backHref={backHref}
    />
  );
}
