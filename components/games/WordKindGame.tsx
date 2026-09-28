"use client";
import GameShell, { type GameRound } from "./GameShell";
import { KIND_LABEL, makeKindQuestion, type WordKind } from "@/lib/games2";

const LEVELS = [{ id: "tat-ca", label: "🗂️ Bắt đầu", hint: "Sự vật, hoạt động hay đặc điểm?" }];

const KIND_ICON: Record<WordKind, string> = { "su-vat": "🧸", "hoat-dong": "🏃", "dac-diem": "🌈" };

function make(_level: string, prev: GameRound | null): GameRound {
  // Câu hỏi có dạng "<từ>. Là từ chỉ gì?" — lấy lại từ vừa hỏi để không hỏi lặp.
  const q = makeKindQuestion(prev?.say.split(". ")[0]);
  return {
    say: `${q.word}. Là từ chỉ gì?`,
    reveal: KIND_LABEL[q.answer],
    visual: (
      <p key={q.word} className="rounded-2xl bg-amber-50 px-6 py-4 text-4xl sm:text-5xl font-extrabold text-gray-800">
        {q.word}
      </p>
    ),
    options: (Object.keys(KIND_LABEL) as WordKind[]).map((k) => ({
      key: k,
      label: (
        <span className="flex items-center justify-center gap-2 text-lg sm:text-xl">
          <span className="text-2xl">{KIND_ICON[k]}</span>
          {KIND_LABEL[k]}
        </span>
      ),
    })),
    answer: q.answer,
  };
}

export default function WordKindGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Từ chỉ gì?"
      intro="Đọc từ rồi chọn: từ chỉ sự vật (người, con vật, đồ vật, cây cối), từ chỉ hoạt động, hay từ chỉ đặc điểm."
      levels={LEVELS}
      make={make}
      optionCols={1}
      backHref={backHref}
    />
  );
}
