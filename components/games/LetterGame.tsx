"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makeLetterQuestion, type LetterLevel } from "@/lib/games";

const LEVELS = [
  { id: "nguyen-am", label: "🅰️ Nguyên âm", hint: "a, ă, â, e, ê, i, o, ô, ơ, u, ư" },
  { id: "phu-am", label: "🅱️ Phụ âm", hint: "b, c, d, đ, g, h, l, m, n…" },
  { id: "tat-ca", label: "🔤 Tất cả các chữ", hint: "Trộn cả nguyên âm và phụ âm" },
];

function make(level: string, prev: GameRound | null): GameRound {
  const q = makeLetterQuestion(level as LetterLevel, prev?.answer);
  return {
    say: q.sound,
    visual: (
      <div className="text-center">
        <p className="text-6xl mb-2">👂</p>
        <p className="text-lg text-gray-500">Bé nghe rồi chọn chữ đúng nhé</p>
      </div>
    ),
    options: q.options.map((l) => ({
      key: l,
      label: <span className="text-6xl sm:text-7xl">{l}</span>,
    })),
    answer: q.answer,
  };
}

export default function LetterGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Nghe và chọn chữ"
      intro="Máy đọc một âm, bé chạm vào chữ đúng. Bấm 🔊 để nghe lại."
      levels={LEVELS}
      make={make}
      requiresSpeech
      optionCols={2}
      backHref={backHref}
    />
  );
}
