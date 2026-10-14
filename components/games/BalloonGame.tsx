"use client";

// Bắn bóng bay (lớp 3): bóng mang số / phép tính bay lên, bé chạm đúng bóng hợp
// luật ("kết quả bảng nhân 7", "phép tính bằng 24"). 45 giây, 3 trái tim — chạm
// nhầm mất một tim. 5 bóng đúng liền thì mỗi bóng được 2 điểm.

import { useEffect, useRef, useState } from "react";
import {
  EQUAL_TARGETS, TABLES, balloonRule, makeBalloon, type Balloon, type BalloonMode,
} from "@/lib/games3";
import { addStars } from "@/lib/games";
import { sfx } from "@/lib/sfx";
import { submitRecord, useRecord } from "@/lib/gameRecords";
import { ArcadeHeader, BigButton, Chip, ResultCard, Stat } from "./Arcade";

const DURATION_MS = 45_000;
const HEARTS = 3;
// 4 làn ngang (left %, bóng rộng 22%) — không thả hai quả liền nhau vào cùng làn để bóng khỏi chồng lên nhau.
const LANES = [3, 27, 51, 75];
const COLORS = ["#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"];

type Flying = Balloon & { x: number; dur: number; color: string; state: "fly" | "popped" | "wrong" };
type Phase = "setup" | "playing" | "done";

const modeKey = (m: BalloonMode) => (m.kind === "bang" ? `bang-${m.table}` : `bang-nhau-${m.target}`);

function BestScore({ mode }: { mode: BalloonMode }) {
  const best = useRecord(`ban-bong:${modeKey(mode)}`);
  return <p className="text-center text-sm text-gray-500 mt-3">{best !== null ? `🏅 Kỷ lục: ${best} điểm` : "Chưa có kỷ lục — chơi thử nhé!"}</p>;
}

export default function BalloonGame({ backHref }: { backHref: string }) {
  const [mode, setMode] = useState<BalloonMode>({ kind: "bang", table: 6 });
  const [phase, setPhase] = useState<Phase>("setup");
  const [balloons, setBalloons] = useState<Flying[]>([]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [streak, setStreak] = useState(0);
  const [left, setLeft] = useState(DURATION_MS);
  const [result, setResult] = useState<{ score: number; hits: number; misses: number; isNew: boolean; prev: number | null; stars: number } | null>(null);
  const startAt = useRef(0);
  const hits = useRef(0);
  const misses = useRef(0);
  const scoreRef = useRef(0);
  const slow = useRef(1);
  const ended = useRef(false);
  const lastLanes = useRef<number[]>([]);

  // Vòng lặp trò chơi: thả bóng, đếm giờ. Nhịp thả nhanh dần theo thời gian.
  useEffect(() => {
    if (phase !== "playing") return;
    let spawnTimer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      const t = performance.now() - startAt.current;
      const b = makeBalloon(mode);
      const free = LANES.map((_, i) => i).filter((i) => !lastLanes.current.includes(i));
      const lane = free[Math.floor(Math.random() * free.length)];
      lastLanes.current = [lane, ...lastLanes.current].slice(0, 2);
      setBalloons((cur) => [...cur, {
        ...b,
        x: LANES[lane] + Math.random() * 2,
        dur: (6.2 - (t / DURATION_MS) * 2) * slow.current,
        color: COLORS[b.id % COLORS.length],
        state: "fly",
      }]);
      spawnTimer = setTimeout(spawn, Math.max(520, 1050 - (t / DURATION_MS) * 500));
    };
    spawn();
    const clock = setInterval(() => {
      const remain = DURATION_MS - (performance.now() - startAt.current);
      setLeft(Math.max(0, remain));
      if (remain <= 0) end();
    }, 200);
    return () => { clearTimeout(spawnTimer); clearInterval(clock); };
    // end() chỉ đọc ref; vòng lặp chỉ cần chạy lại khi đổi phase / luật.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode]);

  function start() {
    sfx.pop(); // trong cú chạm: mở khoá âm thanh trên iOS
    slow.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1.6 : 1;
    hits.current = 0;
    misses.current = 0;
    scoreRef.current = 0;
    ended.current = false;
    setBalloons([]);
    setScore(0);
    setHearts(HEARTS);
    setStreak(0);
    setLeft(DURATION_MS);
    setResult(null);
    startAt.current = performance.now();
    setPhase("playing");
  }

  function end() {
    // Hết tim và hết giờ có thể trùng nhau trong cùng một nhịp.
    if (ended.current) return;
    ended.current = true;
    setPhase("done");
    const final = scoreRef.current;
    const { isNew, prev } = submitRecord(`ban-bong:${modeKey(mode)}`, final, "higher");
    const stars = Math.min(10, Math.floor(final / 3));
    addStars(stars);
    if (isNew && final > 0) sfx.win(); else sfx.lose();
    setResult({ score: final, hits: hits.current, misses: misses.current, isNew: isNew && final > 0, prev, stars });
  }

  function tap(b: Flying) {
    if (phase !== "playing" || b.state !== "fly") return;
    if (b.good) {
      const nextStreak = streak + 1;
      const pts = nextStreak >= 5 ? 2 : 1;
      hits.current += 1;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setStreak(nextStreak);
      sfx.pop();
      if (nextStreak % 5 === 0) sfx.whoosh();
      setBalloons((cur) => cur.map((x) => (x.id === b.id ? { ...x, state: "popped" } : x)));
    } else {
      misses.current += 1;
      setStreak(0);
      sfx.buzz();
      setBalloons((cur) => cur.map((x) => (x.id === b.id ? { ...x, state: "wrong" } : x)));
      const h = hearts - 1;
      setHearts(h);
      if (h <= 0) end();
    }
    setTimeout(() => setBalloons((cur) => cur.filter((x) => x.id !== b.id)), 450);
  }

  const header = <ArcadeHeader title="Bắn bóng bay" backHref={backHref} />;

  if (phase === "setup") {
    return (
      <div>
        {header}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="text-center text-gray-600">
            Bóng bay lên liên tục — chạm <b>đúng</b> bóng hợp luật để bắn. Chạm nhầm mất ❤️. <b>5 bóng đúng liền</b> thì mỗi bóng được 2 điểm!
          </p>
          <p className="mt-5 mb-2 font-bold text-gray-700">🎯 Bóng là kết quả của bảng nhân…</p>
          <div className="flex flex-wrap gap-2">
            {TABLES.map((t) => (
              <Chip key={t} on={mode.kind === "bang" && mode.table === t} onClick={() => setMode({ kind: "bang", table: t })}>
                {t}
              </Chip>
            ))}
          </div>
          <p className="mt-5 mb-2 font-bold text-gray-700">🧮 Hoặc: bóng có phép tính bằng…</p>
          <div className="flex flex-wrap gap-2">
            {EQUAL_TARGETS.map((t) => (
              <Chip key={t} on={mode.kind === "bang-nhau" && mode.target === t} onClick={() => setMode({ kind: "bang-nhau", target: t })}>
                = {t}
              </Chip>
            ))}
          </div>
          <BestScore mode={mode} />
          <div className="mt-5 text-center">
            <BigButton onClick={start} tone="green">🎈 Bắt đầu</BigButton>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div>
        {header}
        <ResultCard
          emoji={result.isNew ? "🏅" : "🎈"}
          title={`Bé được ${result.score} điểm!`}
          celebrate={result.isNew}
          lines={[
            <>Bắn trúng <b>{result.hits}</b> bóng · chạm nhầm <b>{result.misses}</b> bóng</>,
            <span key="rule" className="text-sm">{balloonRule(mode)}</span>,
          ]}
          record={result.isNew
            ? <span className="text-green-600">🎉 Kỷ lục mới{result.prev !== null ? ` (cũ: ${result.prev} điểm)` : ""}!</span>
            : <span className="text-gray-500">Kỷ lục của bé: {result.prev ?? result.score} điểm</span>}
          stars={result.stars}
          onAgain={start}
          onSetup={() => setPhase("setup")}
        />
      </div>
    );
  }

  return (
    <div>
      {header}
      <div className="flex justify-center gap-2 mb-3">
        <Stat label="Giây">{Math.ceil(left / 1000)}</Stat>
        <Stat label="Điểm">{score}</Stat>
        <Stat label="Tim">{"❤️".repeat(hearts)}{"🤍".repeat(Math.max(0, HEARTS - hearts))}</Stat>
      </div>
      <p className="text-center font-extrabold text-blue-700 mb-2">
        {balloonRule(mode)}
        {streak >= 5 && <span className="ml-2 text-orange-500 motion-safe:animate-pop inline-block">🔥 x2</span>}
      </p>
      <div
        className="relative h-[60vh] max-h-[520px] min-h-[380px] overflow-hidden rounded-3xl border border-sky-200 shadow-inner select-none touch-manipulation"
        style={{ background: "linear-gradient(#bae6fd, #e0f2fe 70%, #dcfce7)" }}
      >
        <span className="absolute left-4 top-6 text-4xl opacity-80" aria-hidden>☁️</span>
        <span className="absolute right-6 top-24 text-3xl opacity-70" aria-hidden>☁️</span>
        {balloons.map((b) => (
          <button
            key={b.id}
            onPointerDown={() => tap(b)}
            onAnimationEnd={(e) => {
              if (e.animationName === "rise") setBalloons((cur) => cur.filter((x) => x.id !== b.id));
            }}
            // animate-rise phải là class: Tailwind chỉ xuất @keyframes cho animation có dùng trong code.
            className="absolute w-[22%] max-w-[92px] aspect-[4/5] animate-rise"
            // Bóng đã chạm thì dừng tại chỗ (paused), không gỡ animation — gỡ thì bóng nhảy lên mép trên.
            style={{ left: `${b.x}%`, animationDuration: `${b.dur}s`, animationPlayState: b.state === "fly" ? "running" : "paused" }}
            aria-label={b.label}
          >
            {b.state === "popped" ? (
              <span className="text-4xl motion-safe:animate-pop inline-block">💥</span>
            ) : (
              <span className="block w-full h-full motion-safe:animate-sway">
                <span
                  className={`flex h-[82%] w-full items-center justify-center rounded-[50%] text-white font-extrabold shadow-md ${
                    b.state === "wrong" ? "grayscale opacity-60 motion-safe:animate-shake" : ""
                  } ${b.label.length > 3 ? "text-base sm:text-lg" : "text-2xl"}`}
                  style={{ background: `radial-gradient(circle at 30% 30%, #ffffffaa, ${b.color} 45%)` }}
                >
                  {b.label}
                </span>
                <span className="mx-auto block h-[18%] w-px bg-gray-500" aria-hidden />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
