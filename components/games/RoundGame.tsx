"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makeRoundQuestion, type RoundLevel } from "@/lib/games3";
import { fmtInt } from "@/lib/games";

const LEVELS = [
  { id: "hang-chuc", label: "🔟 Đến hàng chục", hint: "Nhìn chữ số hàng đơn vị: từ 5 trở lên thì làm tròn lên" },
  { id: "hang-tram", label: "💯 Đến hàng trăm", hint: "Nhìn chữ số hàng chục: từ 5 trở lên thì làm tròn lên" },
];

/**
 * Số với chữ số hàng cần làm tròn gạch chân xanh và chữ số ngay sau nó tô cam —
 * chỉ chỗ cần nhìn, không nói ra đáp án.
 */
function Digits({ n, to }: { n: number; to: number }) {
  const s = String(n);
  const target = s.length - (to === 10 ? 2 : 3);
  // Vị trí của từng ký tự trong dãy chữ số (dấu cách ngăn nghìn = -1).
  const chars: { ch: string; at: number }[] = [];
  let at = 0;
  for (const ch of fmtInt(n)) chars.push({ ch, at: ch === " " ? -1 : at++ });
  return (
    <span className="text-5xl sm:text-6xl font-extrabold tracking-wide text-gray-800 tabular-nums">
      {chars.map(({ ch, at: k }, i) =>
        k < 0 ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <span
            key={i}
            className={k === target ? "underline decoration-blue-500 decoration-4 underline-offset-8 text-blue-700" : k === target + 1 ? "text-orange-500" : ""}
          >
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

function make(level: string): GameRound {
  const q = makeRoundQuestion(level as RoundLevel);
  const label = q.to === 10 ? "hàng chục" : "hàng trăm";
  return {
    say: `Làm tròn số ${q.n} đến ${label}`,
    reveal: q.reveal,
    visual: (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-gray-600">Làm tròn đến <b>{label}</b></p>
        <Digits n={q.n} to={q.to} />
      </div>
    ),
    options: q.options.map((n) => ({ key: String(n), label: <span className="text-2xl sm:text-3xl">{fmtInt(n)}</span> })),
    answer: String(q.answer),
  };
}

export default function RoundGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Làm tròn số"
      intro="Nhìn chữ số màu cam: từ 5 trở lên thì làm tròn lên, bé hơn 5 thì làm tròn xuống. Mỗi lượt 10 câu."
      levels={LEVELS}
      make={make}
      backHref={backHref}
    />
  );
}
