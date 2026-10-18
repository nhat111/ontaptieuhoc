"use client";
import GameShell, { type GameRound } from "./GameShell";
import { fillConnective, makeConnectiveQuestion } from "@/lib/games5";

const LEVELS = [{ id: "tat-ca", label: "🔗 Bắt đầu", hint: "và, nhưng, vì… nên…, nếu… thì…" }];

function make(_level: string, prev: GameRound | null): GameRound {
  // `reveal` là câu vừa hỏi đã điền kết từ — tránh hỏi lại liền câu đó.
  const q = makeConnectiveQuestion(prev?.reveal);
  const [before, after] = q.text.split("___");
  return {
    say: "Chọn kết từ thích hợp điền vào chỗ trống.",
    // Đọc lại cả câu đã điền đúng sau lời khen.
    reveal: fillConnective(q),
    visual: (
      <p className="text-xl sm:text-2xl leading-relaxed text-gray-800 text-center max-w-xl">
        {before}
        <span className="mx-1 inline-block min-w-[4.5rem] rounded-lg border-b-4 border-dashed border-orange-400 bg-orange-50 px-2 text-orange-500">
          ?
        </span>
        {after}
      </p>
    ),
    options: q.options.map((o) => ({ key: o, label: <span className="text-xl sm:text-2xl">{o}</span> })),
    answer: q.answer,
  };
}

export default function ConnectiveGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Kết từ"
      intro="Kết từ nối các từ, các vế câu: và, nhưng, hay, vì… nên…, nếu… thì…, tuy… nhưng… Chọn kết từ hợp với câu."
      levels={LEVELS}
      make={make}
      optionCols={2}
      promptOnce
      backHref={backHref}
    />
  );
}
