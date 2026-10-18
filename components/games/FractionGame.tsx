"use client";
import GameShell, { type GameRound } from "./GameShell";
import { CompareRow, Frac, SIGN_OPTIONS, fracLabel } from "./MathBits";
import { makeFractionQuestion, type FractionLevel } from "@/lib/games4";

const LEVELS = [
  { id: "doc-hinh", label: "🍫 Nhìn hình", hint: "Phần tô màu là phân số nào?" },
  { id: "so-sanh", label: "⚖️ So sánh", hint: "Cùng mẫu số, cùng tử số, hoặc quy đồng" },
  { id: "rut-gon", label: "✂️ Rút gọn", hint: "Rút gọn thành phân số tối giản" },
];

const PROMPT: Record<FractionLevel, string> = {
  "doc-hinh": "Phần tô màu là phân số nào?",
  "so-sanh": "So sánh hai phân số.",
  "rut-gon": "Rút gọn thành phân số tối giản.",
};

/** Thanh sô-cô-la chia `parts` ô bằng nhau, tô `shaded` ô đầu. */
function Bar({ shaded, parts }: { shaded: number; parts: number }) {
  const w = 300;
  const cell = w / parts;
  return (
    <svg viewBox={`0 0 ${w + 4} 64`} className="w-full max-w-sm" role="img" aria-label={`Hình chia ${parts} phần bằng nhau, tô màu ${shaded} phần`}>
      {Array.from({ length: parts }, (_, i) => (
        <rect
          key={i}
          x={2 + i * cell}
          y={2}
          width={cell}
          height={60}
          rx={4}
          className={i < shaded ? "fill-orange-400" : "fill-white"}
          stroke="#64748b"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

const big = "text-4xl sm:text-5xl font-extrabold text-gray-800";

function make(level: string): GameRound {
  const q = makeFractionQuestion(level as FractionLevel);
  const say = PROMPT[q.kind];
  if (q.kind === "doc-hinh") {
    return {
      say,
      reveal: q.reveal,
      visual: <Bar shaded={q.shaded} parts={q.parts} />,
      options: q.options.map((o) => ({ key: o, label: fracLabel(o, "text-3xl") })),
      answer: q.answer,
    };
  }
  if (q.kind === "so-sanh") {
    return {
      say,
      reveal: q.reveal,
      visual: <CompareRow left={<Frac n={q.a.n} d={q.a.d} />} right={<Frac n={q.b.n} d={q.b.d} />} />,
      options: SIGN_OPTIONS,
      cols: 3,
      answer: q.answer,
    };
  }
  return {
    say,
    reveal: q.reveal,
    visual: (
      <span className={`flex items-center gap-4 ${big}`}>
        <Frac n={q.from.n} d={q.from.d} /> = <span className="text-orange-500">?</span>
      </span>
    ),
    options: q.options.map((o) => ({ key: o, label: fracLabel(o, "text-3xl") })),
    answer: q.answer,
  };
}

export default function FractionGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Phân số"
      intro="Đọc phân số trên hình, so sánh và rút gọn phân số. Mỗi lượt 10 câu."
      levels={LEVELS}
      make={make}
      optionCols={4}
      promptOnce
      backHref={backHref}
    />
  );
}
