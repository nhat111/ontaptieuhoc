"use client";
import GameShell, { type GameRound } from "./GameShell";
import { fmtInt, makeUnitQuestion, type UnitLevel } from "@/lib/games4";

const LEVELS = [
  { id: "khoi-luong", label: "⚖️ Khối lượng", hint: "kg, yến, tạ, tấn" },
  { id: "thoi-gian", label: "⏱️ Thời gian", hint: "giây, phút, giờ, năm, thế kỉ" },
  { id: "dien-tich", label: "📐 Diện tích", hint: "mm², cm², dm², m²" },
];

function make(level: string): GameRound {
  const q = makeUnitQuestion(level as UnitLevel);
  return {
    say: "Điền số thích hợp vào chỗ trống.",
    reveal: q.reveal,
    visual: (
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-3xl sm:text-4xl font-extrabold text-gray-800">
        <span>{q.left}</span>
        <span>=</span>
        <span className="rounded-xl border-4 border-dashed border-orange-300 px-4 text-orange-500">?</span>
        <span>{q.unit}</span>
      </p>
    ),
    options: q.options.map((n) => ({ key: String(n), label: <span className="text-2xl sm:text-3xl">{fmtInt(n)}</span> })),
    answer: String(q.answer),
  };
}

export default function UnitGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Đổi đơn vị đo"
      intro="1 yến = 10 kg, 1 tạ = 100 kg, 1 tấn = 1 000 kg · 1 phút = 60 giây, 1 thế kỉ = 100 năm · 1 m² = 100 dm² = 10 000 cm²."
      levels={LEVELS}
      make={make}
      promptOnce
      backHref={backHref}
    />
  );
}
