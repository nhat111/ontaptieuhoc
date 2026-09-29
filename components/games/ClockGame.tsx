"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makeClockQuestion, type ClockLevel } from "@/lib/games2";

const LEVELS = [
  { id: "gio-dung", label: "🕐 Giờ đúng", hint: "Kim phút chỉ số 12: 3 giờ, 7 giờ…" },
  { id: "gio-ruoi", label: "🕜 Giờ đúng và 30 phút", hint: "Kim phút chỉ số 12 hoặc số 6" },
  { id: "15-phut", label: "🕒 Thêm 15 phút, 45 phút", hint: "Kim phút chỉ số 3 hoặc số 9" },
];

/** Đồng hồ kim: kim giờ ngắn, đậm, màu cam; kim phút dài, mảnh, màu xanh. */
function Clock({ hour, minute }: { hour: number; minute: number }) {
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;
  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56 drop-shadow-md" role="img" aria-label="Đồng hồ">
      <circle cx="100" cy="100" r="94" fill="#fff" stroke="#1e3a8a" strokeWidth="6" />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const a = (i * 6 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={100 + Math.sin(a) * (big ? 78 : 83)}
            y1={100 - Math.cos(a) * (big ? 78 : 83)}
            x2={100 + Math.sin(a) * 88}
            y2={100 - Math.cos(a) * 88}
            stroke={big ? "#1e3a8a" : "#94a3b8"}
            strokeWidth={big ? 3 : 1.2}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1;
        const a = (n * 30 * Math.PI) / 180;
        return (
          <text
            key={n}
            x={100 + Math.sin(a) * 64}
            y={100 - Math.cos(a) * 64}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="17"
            fontWeight="700"
            fill="#0f172a"
          >
            {n}
          </text>
        );
      })}
      <line x1="100" y1="100" x2="100" y2="54" stroke="#f97316" strokeWidth="8" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`} />
      <line x1="100" y1="100" x2="100" y2="26" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" transform={`rotate(${minuteAngle} 100 100)`} />
      <circle cx="100" cy="100" r="6" fill="#0f172a" />
    </svg>
  );
}

function make(level: string, prev: GameRound | null): GameRound {
  let q = makeClockQuestion(level as ClockLevel);
  // Không ra lại đúng giờ vừa hỏi.
  while (prev && q.answer === prev.answer) q = makeClockQuestion(level as ClockLevel);
  return {
    say: "Đồng hồ chỉ mấy giờ?",
    reveal: q.answer,
    visual: (
      <div className="text-center">
        <Clock hour={q.hour} minute={q.minute} />
        <p className="mt-2 text-xs text-gray-500">
          <span className="font-bold text-orange-500">Kim ngắn</span> chỉ giờ ·{" "}
          <span className="font-bold text-blue-600">kim dài</span> chỉ phút
        </p>
      </div>
    ),
    options: q.options.map((t) => ({ key: t, label: <span className="text-xl sm:text-2xl">{t}</span> })),
    answer: q.answer,
  };
}

export default function ClockGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Xem đồng hồ"
      intro="Nhìn kim đồng hồ rồi chọn giờ đúng. Kim ngắn chỉ giờ, kim dài chỉ phút."
      levels={LEVELS}
      make={make}
      // Câu hỏi giống nhau mọi câu: chỉ đọc một lần ở đầu.
      promptOnce
      optionCols={2}
      backHref={backHref}
    />
  );
}
