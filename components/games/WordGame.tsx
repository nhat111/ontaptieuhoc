"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makeWordQuestion, type WordLevel } from "@/lib/vietWords";
import { GAME_CLIPS } from "@/lib/gameClips";

const LEVELS = [
  { id: "con-vat", label: "🐾 Con vật", hint: "cá, gà, mèo, chó, voi…" },
  { id: "do-vat", label: "🏠 Đồ vật, cây quả", hint: "nhà, xe, cây, sách, cam…" },
  { id: "tat-ca", label: "🔤 Tất cả", hint: "Trộn cả con vật và đồ vật" },
];

// Câu hỏi không đọc tên hình: trò này luyện ĐỌC chữ, đọc ra là lộ đáp án.
// Tên hình chỉ được đọc sau khi bé chọn đúng (`reveal`).
export const WORD_PROMPT = "Đây là gì? Bé chọn chữ đúng nhé.";

function make(level: string, prev: GameRound | null): GameRound {
  const q = makeWordQuestion(level as WordLevel, prev?.answer);
  return {
    say: WORD_PROMPT,
    reveal: q.target.word,
    visual: <span className="text-8xl sm:text-9xl drop-shadow-lg">{q.target.emoji}</span>,
    options: q.options.map((w) => ({
      key: w,
      label: <span className="text-4xl sm:text-5xl">{w}</span>,
    })),
    answer: q.target.word,
  };
}

export default function WordGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Nhìn hình chọn chữ"
      intro="Nhìn hình rồi chạm vào chữ đúng. Chọn đúng sẽ được nghe đọc từ đó."
      levels={LEVELS}
      make={make}
      // Câu hỏi giống nhau mọi câu: chỉ đọc một lần ở đầu.
      promptOnce
      clips={GAME_CLIPS}
      optionCols={2}
      backHref={backHref}
    />
  );
}
