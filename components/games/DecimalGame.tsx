"use client";
import GameShell, { type GameRound } from "./GameShell";
import { CompareRow, Frac, SIGN_OPTIONS } from "./MathBits";
import { makeDecimalQuestion, type DecimalLevel } from "@/lib/games5";
import { fmtInt } from "@/lib/games";

const LEVELS = [
  { id: "so-sanh", label: "⚖️ So sánh", hint: "2,5 và 2,45 — số nào lớn hơn?" },
  { id: "hang", label: "🔍 Hàng của chữ số", hint: "Chữ số này thuộc hàng phần mười, phần trăm hay phần nghìn?" },
  { id: "phan-so", label: "✏️ Viết số thập phân", hint: "7/100 viết thành số thập phân là bao nhiêu?" },
];

const PROMPT: Record<DecimalLevel, string> = {
  "so-sanh": "So sánh hai số thập phân.",
  hang: "Chữ số tô màu thuộc hàng nào?",
  "phan-so": "Viết phân số thập phân thành số thập phân.",
};

const big = "text-4xl sm:text-5xl font-extrabold text-gray-800 tabular-nums";

function make(level: string): GameRound {
  const q = makeDecimalQuestion(level as DecimalLevel);
  const say = PROMPT[q.kind];
  if (q.kind === "so-sanh") {
    return { say, reveal: q.reveal, visual: <CompareRow left={q.a} right={q.b} />, options: SIGN_OPTIONS, cols: 3, answer: q.answer };
  }
  if (q.kind === "hang") {
    // Tô màu đúng một chữ số (năm chữ số khác nhau nên không lẫn).
    return {
      say,
      reveal: q.reveal,
      visual: (
        <p className={big}>
          {[...q.number].map((ch, i) => (
            <span key={i} className={ch === String(q.digit) ? "text-orange-500 underline decoration-4 underline-offset-8" : ""}>{ch}</span>
          ))}
        </p>
      ),
      options: q.options.map((o) => ({ key: o, label: <span className="text-lg sm:text-xl">{o}</span> })),
      cols: 2,
      answer: q.answer,
    };
  }
  return {
    say,
    reveal: q.reveal,
    visual: (
      <span className={`flex items-center gap-4 ${big}`}>
        <Frac n={q.n} d={fmtInt(q.d)} /> = <span className="text-orange-500">?</span>
      </span>
    ),
    options: q.options.map((o) => ({ key: o, label: <span className="text-2xl sm:text-3xl tabular-nums">{o}</span> })),
    answer: q.answer,
  };
}

export default function DecimalGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Số thập phân"
      intro="So sánh số thập phân, tìm hàng của chữ số, viết phân số thập phân thành số thập phân. Mỗi lượt 10 câu."
      levels={LEVELS}
      make={make}
      promptOnce
      backHref={backHref}
    />
  );
}
