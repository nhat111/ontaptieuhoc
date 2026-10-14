"use client";

// Chỉnh đồng hồ (lớp 3): đọc nhiệm vụ ("Trống vào học lúc 7 giờ 15 phút") rồi kéo
// kim cho đúng giờ. Kim giờ trượt theo kim phút như đồng hồ thật; kéo kim phút qua
// số 12 thì kim giờ nhảy sang giờ kế. Dùng GameShell (10 nhiệm vụ, sao, linh vật)
// với bảng chọn riêng: đồng hồ kéo được + nút "Xong".

import { useRef, useState, type PointerEvent } from "react";
import GameShell, { type BoardProps, type GameRound } from "./GameShell";
import { makeClockMission, readTime, type ClockSetLevel } from "@/lib/games3";
import { sfx } from "@/lib/sfx";

const LEVELS = [
  { id: "5-phut", label: "🕐 Chẵn 5 phút", hint: "7 giờ 15 phút, 3 giờ 40 phút…" },
  { id: "tung-phut", label: "🎯 Từng phút", hint: "6 giờ 23 phút, 9 giờ 47 phút…" },
  { id: "gio-kem", label: "⏳ Giờ kém", hint: "8 giờ kém 10 phút (= 7 giờ 50 phút)…" },
  { id: "sau-bao-lau", label: "🧠 Sau bao lâu?", hint: "Bây giờ 7 giờ 10 phút, 25 phút nữa là mấy giờ?" },
];

const key = (h: number, m: number) => `${h}:${m}`;
const norm12 = (h: number) => ((((h - 1) % 12) + 12) % 12) + 1;

function make(level: string, prev: GameRound | null): GameRound {
  let m = makeClockMission(level as ClockSetLevel);
  while (prev && key(m.hour, m.minute) === prev.answer) m = makeClockMission(level as ClockSetLevel);
  return {
    say: m.text,
    reveal: readTime(m.hour, m.minute),
    visual: (
      <div className="text-center">
        <p className="text-5xl">{m.emoji}</p>
        <p className="mt-2 text-xl sm:text-2xl font-extrabold text-gray-800">{m.text}</p>
        <p className="mt-1 text-sm text-gray-500">Kéo kim đồng hồ cho đúng giờ rồi bấm <b>Xong</b>.</p>
      </div>
    ),
    options: [],
    answer: key(m.hour, m.minute),
  };
}

/** Góc (độ, 0 = số 12, theo chiều kim đồng hồ) của điểm chạm so với tâm SVG. */
function angleOf(e: PointerEvent<SVGSVGElement>): { deg: number; dist: number } {
  const r = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - (r.left + r.width / 2);
  const y = e.clientY - (r.top + r.height / 2);
  const deg = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
  return { deg, dist: Math.hypot(x, y) / (r.width / 2) };
}

const angDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

function ClockBoard({ round, wrong, correctKey, shakeKey, choose, clearShake }: BoardProps) {
  const [h, setH] = useState(12);
  const [m, setM] = useState(0);
  const [drag, setDrag] = useState<"hour" | "minute" | null>(null);
  const lastMinute = useRef(0);

  const hourAngle = ((h % 12) + m / 60) * 30;
  const minuteAngle = m * 6;

  function setMinute(next: number) {
    const prev = lastMinute.current;
    // Kéo qua số 12: theo chiều kim → sang giờ sau, ngược chiều → lùi một giờ.
    if (prev >= 45 && next <= 15) setH((x) => norm12(x + 1));
    else if (prev <= 15 && next >= 45) setH((x) => norm12(x - 1));
    lastMinute.current = next;
    setM(next);
  }

  function down(e: PointerEvent<SVGSVGElement>) {
    if (correctKey) return;
    const { deg, dist } = angleOf(e);
    const dh = angDiff(deg, hourAngle), dm = angDiff(deg, minuteAngle);
    // Chạm gần kim nào thì cầm kim đó; hai kim chồng nhau thì gần tâm là kim giờ.
    const which = Math.abs(dh - dm) < 20 ? (dist < 0.55 ? "hour" : "minute") : dh < dm ? "hour" : "minute";
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(which);
    move(e, which);
  }

  function move(e: PointerEvent<SVGSVGElement>, which = drag) {
    if (!which || correctKey) return;
    const { deg } = angleOf(e);
    if (which === "minute") {
      const next = Math.round(deg / 6) % 60;
      if (next !== m) setMinute(next);
    } else {
      // Kim giờ nằm lệch theo số phút: trừ phần lệch rồi làm tròn ra giờ.
      const next = norm12(Math.round((deg - m * 0.5) / 30));
      if (next !== h) { setH(next); sfx.flip(); }
    }
  }

  // Gợi ý sau một lần sai: chỉ ra kim nào chưa đúng.
  const lastWrong = wrong[wrong.length - 1];
  const [ah, am] = round.answer.split(":").map(Number);
  let hint = "";
  if (lastWrong && !correctKey) {
    const [wh, wm] = lastWrong.split(":").map(Number);
    hint = wm !== am && wh !== ah ? "Cả hai kim đều chưa đúng. Chỉnh kim phút trước nhé!"
      : wm !== am ? "Kim giờ đúng rồi, kim phút (dài) chưa đúng."
        : "Kim phút đúng rồi, kim giờ (ngắn) chưa đúng.";
  }

  const btn = "rounded-xl border-2 border-b-4 border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 active:translate-y-0.5 active:border-b-2";

  return (
    <div className="mt-4 flex flex-col items-center">
      <svg
        viewBox="0 0 200 200"
        className={`h-64 w-64 sm:h-72 sm:w-72 touch-none select-none drop-shadow-md ${shakeKey ? "motion-safe:animate-shake" : ""}`}
        onPointerDown={down}
        onPointerMove={(e) => move(e)}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        onAnimationEnd={clearShake}
        role="img"
        aria-label="Đồng hồ kéo kim"
      >
        <circle cx="100" cy="100" r="94" fill={correctKey ? "#dcfce7" : "#fff"} stroke="#1e3a8a" strokeWidth="6" />
        {Array.from({ length: 60 }, (_, i) => {
          const big = i % 5 === 0;
          const a = (i * 6 * Math.PI) / 180;
          return (
            <line key={i}
              x1={100 + Math.sin(a) * (big ? 78 : 83)} y1={100 - Math.cos(a) * (big ? 78 : 83)}
              x2={100 + Math.sin(a) * 88} y2={100 - Math.cos(a) * 88}
              stroke={big ? "#1e3a8a" : "#94a3b8"} strokeWidth={big ? 3 : 1.2} />
          );
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const n = i + 1;
          const a = (n * 30 * Math.PI) / 180;
          return (
            <text key={n} x={100 + Math.sin(a) * 64} y={100 - Math.cos(a) * 64}
              textAnchor="middle" dominantBaseline="central" fontSize="17" fontWeight="700" fill="#0f172a">{n}</text>
          );
        })}
        <line x1="100" y1="100" x2="100" y2="54" stroke="#f97316" strokeWidth={drag === "hour" ? 11 : 8} strokeLinecap="round"
          transform={`rotate(${hourAngle} 100 100)`} />
        <line x1="100" y1="100" x2="100" y2="24" stroke="#2563eb" strokeWidth={drag === "minute" ? 7 : 4} strokeLinecap="round"
          transform={`rotate(${minuteAngle} 100 100)`} />
        <circle cx="100" cy="100" r="7" fill="#0f172a" />
      </svg>
      <p className="mt-1 text-xs text-gray-500">
        <span className="font-bold text-orange-500">Kim ngắn</span> chỉ giờ · <span className="font-bold text-blue-600">kim dài</span> chỉ phút
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button className={btn} onClick={() => setH((x) => norm12(x - 1))} disabled={!!correctKey}>− giờ</button>
        <button className={btn} onClick={() => setH((x) => norm12(x + 1))} disabled={!!correctKey}>+ giờ</button>
        <button className={btn} onClick={() => setMinute((m + 59) % 60)} disabled={!!correctKey}>− 1 phút</button>
        <button className={btn} onClick={() => setMinute((m + 1) % 60)} disabled={!!correctKey}>+ 1 phút</button>
      </div>

      {hint && <p className="mt-3 text-center font-bold text-orange-600">{hint}</p>}
      {correctKey && <p className="mt-3 text-center text-lg font-extrabold text-green-600">✓ {readTime(ah, am)}</p>}

      <button
        onClick={() => choose(key(h, m))}
        disabled={!!correctKey}
        className="mt-4 bg-green-500 hover:bg-green-400 text-white font-extrabold text-xl px-10 py-3 rounded-2xl border-2 border-b-[6px] border-green-700 active:translate-y-1 active:border-b-2 transition-all disabled:opacity-50"
      >
        Xong ✓
      </button>
    </div>
  );
}

export default function ClockSetGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Chỉnh đồng hồ"
      intro="Đọc nhiệm vụ rồi kéo kim đồng hồ cho đúng giờ. Kim ngắn chỉ giờ, kim dài chỉ phút."
      levels={LEVELS}
      make={make}
      Board={ClockBoard}
      backHref={backHref}
    />
  );
}
