"use client";
import GameShell, { type GameRound } from "./GameShell";
import { TONES, makeToneQuestion, toneOf, type ToneLevel } from "@/lib/vietWords";
import { GAME_CLIPS } from "@/lib/gameClips";

const LEVELS = [
  { id: "sac-huyen", label: "✏️ Dấu sắc, dấu huyền", hint: "Phân biệt cá / cà / ca" },
  { id: "tat-ca", label: "🎯 Đủ 5 dấu", hint: "Sắc, huyền, hỏi, ngã, nặng" },
];

function make(level: string, prev: GameRound | null): GameRound {
  const q = makeToneQuestion(level as ToneLevel, prev?.answer);
  const tone = TONES.find((t) => t.id === toneOf(q.target.word))!;
  return {
    // Đọc chính từ đó: bé nghe thanh điệu rồi chọn chữ mang đúng dấu.
    say: q.target.word,
    reveal: tone.name,
    visual: (
      <div className="text-center">
        <span className="text-8xl sm:text-9xl drop-shadow-lg">{q.target.emoji}</span>
        <p className="text-base text-gray-500 mt-2">Nghe rồi chọn chữ có dấu đúng</p>
      </div>
    ),
    options: q.options.map((w) => ({
      key: w,
      label: <span className="text-4xl sm:text-5xl">{w}</span>,
    })),
    answer: q.target.word,
  };
}

export default function ToneGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Chọn dấu thanh"
      intro="Nghe đọc tên hình, bé chạm vào chữ có dấu thanh đúng. Bấm 🔊 để nghe lại."
      levels={LEVELS}
      make={make}
      clips={GAME_CLIPS}
      optionCols={2}
      backHref={backHref}
    />
  );
}
