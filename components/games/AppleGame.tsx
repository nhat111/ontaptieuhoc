"use client";
import GameShell, { type BoardProps, type GameRound } from "./GameShell";
import { makeCountQuestion, type CountLevel } from "@/lib/games";

const LEVELS = [
  { id: "cong5", label: "➕ Cộng trong phạm vi 5", hint: "Hái quả có kết quả phép cộng" },
  { id: "cong10", label: "➕ Cộng trong phạm vi 10", hint: "Tổng đến 10" },
  { id: "tru10", label: "➖ Trừ trong phạm vi 10", hint: "Hái quả có kết quả phép trừ" },
];

// Chỗ treo 4 quả trên tán cây, tính theo % khung cây.
const SLOTS = [
  { left: 26, top: 20 },
  { left: 70, top: 16 },
  { left: 40, top: 44 },
  { left: 76, top: 46 },
];
// Miệng giỏ, nơi quả đúng rơi vào.
const BASKET = { left: 50, top: 86 };

function make(level: string): GameRound {
  const q = makeCountQuestion(level as CountLevel);
  const word = q.op === "+" ? "cộng" : "trừ";
  return {
    say: `Hái quả táo có kết quả ${q.a} ${word} ${q.b}`,
    visual: (
      <p className="text-5xl font-extrabold text-gray-700 tracking-wide">
        {q.a} {q.op === "+" ? "+" : "−"} {q.b} = <span className="text-orange-500">?</span>
      </p>
    ),
    options: q.options.map((n) => ({ key: String(n), label: n })),
    answer: String(q.answer),
  };
}

/** Cây táo: tán, thân, cỏ, giỏ — vẽ bằng CSS, không dùng ảnh. */
function AppleTree({ round, wrong, correctKey, shakeKey, choose, clearShake }: BoardProps) {
  return (
    <div className="relative mx-auto mt-4 h-[300px] w-full max-w-sm select-none">
      {/* Thân cây */}
      <div className="absolute left-1/2 bottom-8 h-[45%] w-10 -translate-x-1/2 rounded-md bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 shadow-md" />
      {/* Tán cây: vài khối tròn chồng nhau cho có chiều sâu */}
      <div className="absolute left-[4%] top-[6%] h-[48%] w-[50%] rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg" />
      <div className="absolute right-[4%] top-[4%] h-[50%] w-[52%] rounded-full bg-gradient-to-br from-green-400 to-green-700 shadow-lg" />
      <div className="absolute left-[18%] top-[22%] h-[44%] w-[64%] rounded-full bg-gradient-to-b from-green-500 to-green-700 shadow-xl" />
      {/* Cỏ */}
      <div className="absolute inset-x-0 bottom-0 h-10 rounded-b-3xl bg-gradient-to-b from-lime-300 to-green-400" />
      {/* Giỏ */}
      <div className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 text-6xl drop-shadow-lg" aria-hidden>
        🧺
      </div>

      {round.options.map((o, i) => {
        const isWrong = wrong.includes(o.key);
        const isRight = correctKey === o.key;
        const pos = isRight ? BASKET : SLOTS[i];
        return (
          <button
            key={o.key}
            onClick={() => choose(o.key)}
            disabled={isWrong}
            aria-label={`Quả táo số ${o.label}`}
            style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            // Rơi xuống giỏ: đổi left/top với ease-in cho giống trọng lực.
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-[left,top,opacity,filter] duration-700 ease-in ${
              isWrong ? "opacity-40 grayscale" : ""
            }`}
          >
            <span
              onAnimationEnd={clearShake}
              className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fca5a5,#dc2626_55%,#991b1b)] text-2xl font-extrabold text-white shadow-[0_6px_0_#7f1d1d] ${
                shakeKey === o.key ? "motion-safe:animate-shake" : isRight ? "scale-75" : "motion-safe:animate-float"
              }`}
              style={{ animationDelay: `${i * 400}ms` }}
            >
              {/* Cuống + lá */}
              <span className="absolute -top-2 left-1/2 h-3 w-1 -translate-x-1/2 rounded bg-amber-900" />
              <span className="absolute -top-3 left-[55%] h-3 w-5 rotate-[-20deg] rounded-full bg-green-500" />
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function AppleGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Hái táo"
      intro="Tính nhẩm rồi chạm vào quả táo có kết quả đúng — táo sẽ rơi vào giỏ!"
      levels={LEVELS}
      make={make}
      Board={AppleTree}
      backHref={backHref}
    />
  );
}
