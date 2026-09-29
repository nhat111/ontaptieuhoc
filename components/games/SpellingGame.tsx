"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makeSpellQuestion, type SpellGroup } from "@/lib/games2";

const LEVELS = [
  { id: "ch-tr", label: "ch hay tr?", hint: "trường học, quả chuối…" },
  { id: "s-x", label: "s hay x?", hint: "sách vở, xe đạp…" },
  { id: "g-gh", label: "g/gh, ng/ngh?", hint: "gh, ngh đứng trước e, ê, i" },
  { id: "c-k", label: "c hay k?", hint: "k đứng trước e, ê, i" },
  { id: "l-n", label: "l hay n?", hint: "lá cây, giọt nước…" },
  { id: "tat-ca", label: "🔀 Trộn tất cả", hint: "Ôn hết các cặp chữ" },
];

function make(level: string, prev: GameRound | null): GameRound {
  const q = makeSpellQuestion(level as SpellGroup | "tat-ca", prev?.reveal);
  return {
    // Không đọc từ lên trước: ch/tr, s/x… nghe giống nhau, đọc ra cũng không
    // giúp gì mà còn làm bé tưởng đoán bằng tai được. Chọn đúng mới đọc từ.
    say: "Chọn chữ đúng để điền vào chỗ trống.",
    reveal: q.word,
    visual: (
      <div className="text-center">
        <span className="text-7xl sm:text-8xl drop-shadow-lg">{q.emoji}</span>
        <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-800">
          {q.before}
          <span className="mx-0.5 inline-block min-w-[2.2ch] border-b-4 border-dashed border-orange-400 text-orange-400">?</span>
          {q.after}
        </p>
      </div>
    ),
    options: q.options.map((o) => ({ key: o, label: <span className="text-4xl">{o}</span> })),
    answer: q.answer,
  };
}

export default function SpellingGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Điền chữ chính tả"
      intro="Nhìn hình, chọn chữ đúng điền vào chỗ trống. Chọn đúng sẽ được nghe đọc cả từ."
      levels={LEVELS}
      make={make}
      // Câu hỏi giống nhau mọi câu: chỉ đọc một lần ở đầu.
      promptOnce
      optionCols={2}
      backHref={backHref}
    />
  );
}
