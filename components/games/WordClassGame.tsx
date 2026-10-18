"use client";
import GameShell, { type GameRound } from "./GameShell";
import { CLASS_LABEL, makeWordClassQuestion, type WordClass } from "@/lib/games4";

const LEVELS = [{ id: "tat-ca", label: "🗂️ Bắt đầu", hint: "Danh từ, động từ hay tính từ?" }];

const CLASS_ICON: Record<WordClass, string> = { "danh-tu": "🏠", "dong-tu": "🏃", "tinh-tu": "🌈" };

function make(_level: string, prev: GameRound | null): GameRound {
  // `reveal` có dạng "<từ> là <từ loại>" — lấy lại từ vừa hỏi để không hỏi lặp liền.
  const q = makeWordClassQuestion(prev?.reveal?.split(" là ")[0]);
  return {
    say: "Từ này là danh từ, động từ hay tính từ?",
    reveal: `${q.word} là ${CLASS_LABEL[q.answer].toLowerCase()}`,
    visual: (
      <p key={q.word} className="rounded-2xl bg-amber-50 px-6 py-4 text-4xl sm:text-5xl font-extrabold text-gray-800">
        {q.word}
      </p>
    ),
    options: (Object.keys(CLASS_LABEL) as WordClass[]).map((k) => ({
      key: k,
      label: (
        <span className="flex items-center justify-center gap-2 text-lg sm:text-xl">
          <span className="text-2xl">{CLASS_ICON[k]}</span>
          {CLASS_LABEL[k]}
        </span>
      ),
    })),
    answer: q.answer,
  };
}

export default function WordClassGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Danh từ, động từ, tính từ"
      intro="Danh từ chỉ người, vật, hiện tượng; động từ chỉ hoạt động; tính từ chỉ đặc điểm, tính chất. Đọc từ rồi chọn."
      levels={LEVELS}
      make={make}
      optionCols={1}
      promptOnce
      backHref={backHref}
    />
  );
}
