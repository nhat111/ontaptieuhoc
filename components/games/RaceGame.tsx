"use client";

// Đua xe bảng nhân (lớp 3): bé đua với Rùa / Thỏ / Tên lửa. Mỗi câu đúng xe tiến
// một chặng; 4 câu đúng liền nhau được NITRO (thêm một chặng). Sai thì xe xoay
// vòng, đứng 0,8 giây và phải trả lời lại đúng câu đó. Thắng thì được huy chương
// cho các bảng đã chọn: 🥉 thắng Rùa, 🥈 thắng Thỏ, 🥇 thắng Tên lửa.

import { useEffect, useRef, useState } from "react";
import { TABLES, makeTimesQuestion, type TimesQuestion } from "@/lib/games3";
import { addStars } from "@/lib/games";
import { sfx } from "@/lib/sfx";
import { submitRecord, useRecord } from "@/lib/gameRecords";
import { ArcadeHeader, BigButton, Chip, ResultCard, Stat, secs } from "./Arcade";
import { gradeFromPath, track } from "@/lib/usage";

const GOAL = 12;
const STUN_MS = 800;
const NITRO_EVERY = 4;

const RIVALS = [
  { id: "rua", emoji: "🐢", name: "Rùa", secsPerStep: 6.5, level: 1, flip: true },
  { id: "tho", emoji: "🐇", name: "Thỏ", secsPerStep: 4.5, level: 2, flip: true },
  { id: "ten-lua", emoji: "🚀", name: "Tên lửa", secsPerStep: 3, level: 3, flip: false },
] as const;
type Rival = (typeof RIVALS)[number];

const MEDAL = ["", "🥉", "🥈", "🥇"];

type Phase = "setup" | "countdown" | "racing" | "done";

function TableChip({ t, on, toggle }: { t: number; on: boolean; toggle: () => void }) {
  const medal = useRecord(`huy-chuong:${t}`);
  return (
    <Chip on={on} onClick={toggle}>
      Bảng {t}
      {medal ? <span className="absolute -top-2 -right-2 text-lg">{MEDAL[medal]}</span> : null}
    </Chip>
  );
}

function RivalCard({ r, on, tables, pick }: { r: Rival; on: boolean; tables: number[]; pick: () => void }) {
  const best = useRecord(`dua-xe:${tables.join(",")}:${r.id}`);
  return (
    <button
      onClick={pick}
      aria-pressed={on}
      className={`rounded-2xl border-2 border-b-[6px] p-3 text-center transition-all active:translate-y-1 active:border-b-2 ${
        on ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200 hover:border-blue-300"
      }`}
    >
      <span className={`inline-block text-4xl ${r.flip ? "-scale-x-100" : "rotate-45"}`}>{r.emoji}</span>
      <p className="font-extrabold text-gray-800">{r.name}</p>
      <p className="text-xs text-gray-500">{MEDAL[r.level]} {best ? `Kỷ lục ${secs(best)}` : "Chưa thắng"}</p>
    </button>
  );
}

export default function RaceGame({ backHref }: { backHref: string }) {
  const [tables, setTables] = useState<number[]>([3, 4]);
  const [rival, setRival] = useState<Rival>(RIVALS[0]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(3);
  const [q, setQ] = useState<TimesQuestion | null>(null);
  const [steps, setSteps] = useState(0);
  const [combo, setCombo] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [missedThis, setMissedThis] = useState(false);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [spinBeat, setSpinBeat] = useState(0);
  const [nitroBeat, setNitroBeat] = useState(0);
  const [stunned, setStunned] = useState(false);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<{ win: boolean; ms: number; isNew: boolean; prev: number | null; stars: number; medal: boolean } | null>(null);
  const startAt = useRef(0);
  // Bản sao của firstTry cho finish(): finish còn được gọi từ interval, nơi state đã cũ.
  const firstTryRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);

  const elapsed = phase === "racing" ? now - startAt.current : 0;
  const rivalProgress = phase === "racing" ? Math.min(1, elapsed / (rival.secsPerStep * GOAL * 1000)) : phase === "done" && result && !result.win ? 1 : 0;

  // Đồng hồ cuộc đua: cập nhật vị trí đối thủ, đối thủ về đích trước là thua.
  useEffect(() => {
    if (phase !== "racing") return;
    const id = setInterval(() => {
      const t = performance.now();
      setNow(t);
      if (t - startAt.current >= rival.secsPerStep * GOAL * 1000) finish(false, t - startAt.current);
    }, 100);
    return () => clearInterval(id);
    // finish chỉ đọc state qua tham số; chạy lại theo phase/rival là đủ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, rival]);

  function toggleTable(t: number) {
    setTables((cur) => (cur.includes(t) ? (cur.length > 1 ? cur.filter((x) => x !== t) : cur) : [...cur, t].sort((a, b) => a - b)));
  }

  function start() {
    track("game_start", { grade: gradeFromPath(location.pathname), detail: location.pathname });
    clearTimers();
    sfx.tick(); // gọi trong cú chạm: mở khoá âm thanh trên iOS
    setPhase("countdown");
    setCount(3);
    setSteps(0);
    setCombo(0);
    setFirstTry(0);
    firstTryRef.current = 0;
    setMistakes(0);
    setMissedThis(false);
    setWrongPick(null);
    setStunned(false);
    setResult(null);
    setQ(makeTimesQuestion(tables));
    [2, 1].forEach((n, i) => timers.current.push(setTimeout(() => { setCount(n); sfx.tick(); }, (i + 1) * 800)));
    timers.current.push(setTimeout(() => {
      setCount(0);
      sfx.go();
      startAt.current = performance.now();
      setNow(startAt.current);
      setPhase("racing");
    }, 2400));
  }

  function finish(win: boolean, ms: number) {
    setPhase("done");
    clearTimers();
    let isNew = false, prev: number | null = null, medal = false;
    if (win) {
      const r = submitRecord(`dua-xe:${tables.join(",")}:${rival.id}`, Math.round(ms), "lower");
      isNew = r.isNew; prev = r.prev;
      for (const t of tables) medal = submitRecord(`huy-chuong:${t}`, rival.level, "higher").isNew || medal;
      sfx.win();
    } else {
      sfx.lose();
    }
    const ft = firstTryRef.current;
    const stars = Math.min(10, win ? ft + 2 : Math.floor(ft / 2));
    addStars(stars);
    setResult({ win, ms, isNew, prev, stars, medal });
  }

  function answer(n: number) {
    if (phase !== "racing" || !q || stunned) return;
    if (n !== q.answer) {
      sfx.buzz();
      setWrongPick(n);
      setMissedThis(true);
      setMistakes((m) => m + 1);
      setCombo(0);
      setSpinBeat((b) => b + 1);
      setStunned(true);
      timers.current.push(setTimeout(() => { setStunned(false); setWrongPick(null); }, STUN_MS));
      return;
    }
    const nextCombo = combo + 1;
    const nitro = nextCombo % NITRO_EVERY === 0;
    const nextSteps = Math.min(GOAL, steps + 1 + (nitro ? 1 : 0));
    if (!missedThis) {
      firstTryRef.current += 1;
      setFirstTry(firstTryRef.current);
    }
    setCombo(nextCombo);
    setSteps(nextSteps);
    setMissedThis(false);
    setWrongPick(null);
    if (nitro) { sfx.whoosh(); setNitroBeat((b) => b + 1); } else sfx.ding(nextCombo);
    if (nextSteps >= GOAL) {
      finish(true, performance.now() - startAt.current);
      return;
    }
    setQ(makeTimesQuestion(tables, q.text));
  }

  // ── Cài đặt ────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div>
        <ArcadeHeader title="Đua xe bảng nhân" backHref={backHref} />
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="text-center text-gray-600">
            Trả lời đúng để xe 🏎️ chạy. <b>{NITRO_EVERY} câu đúng liền</b> được <b>NITRO</b> 🔥. Về đích trước đối thủ để giành huy chương!
          </p>
          <p className="mt-5 mb-2 font-bold text-gray-700">1. Chọn bảng (chọn nhiều cũng được)</p>
          <div className="flex flex-wrap gap-2">
            {TABLES.map((t) => <TableChip key={t} t={t} on={tables.includes(t)} toggle={() => toggleTable(t)} />)}
          </div>
          <p className="mt-5 mb-2 font-bold text-gray-700">2. Chọn đối thủ</p>
          <div className="grid grid-cols-3 gap-2">
            {RIVALS.map((r) => <RivalCard key={r.id} r={r} on={rival.id === r.id} tables={tables} pick={() => setRival(r)} />)}
          </div>
          <div className="mt-6 text-center">
            <BigButton onClick={start} tone="green">🏁 Vào đường đua!</BigButton>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">🥉 thắng Rùa · 🥈 thắng Thỏ · 🥇 thắng Tên lửa — huy chương hiện trên từng bảng.</p>
        </div>
      </div>
    );
  }

  // ── Kết quả ────────────────────────────────────────────────────────────────
  if (phase === "done" && result) {
    const accuracy = Math.round((100 * firstTry) / Math.max(1, firstTry + mistakes));
    return (
      <div>
        <ArcadeHeader title="Đua xe bảng nhân" backHref={backHref} />
        <Track steps={steps} rivalProgress={rivalProgress} rival={rival} spinBeat={spinBeat} nitroBeat={nitroBeat} />
        <ResultCard
          emoji={result.win ? "🏆" : rival.emoji}
          title={result.win ? `Bé thắng ${rival.name}!` : `${rival.name} về đích trước rồi!`}
          celebrate={result.win}
          lines={[
            result.win ? <>Về đích sau <b>{secs(result.ms)}</b></> : <>Xe của bé đi được <b>{steps}/{GOAL}</b> chặng</>,
            <>Đúng ngay lần đầu: <b>{accuracy}%</b> · Sai: <b>{mistakes}</b> câu</>,
          ]}
          record={
            result.win ? (
              result.isNew ? (
                <span className="text-green-600">🎉 Kỷ lục mới{result.prev ? ` (cũ: ${secs(result.prev)})` : ""}!</span>
              ) : (
                <span className="text-gray-500">Kỷ lục của bé: {secs(result.prev ?? result.ms)}</span>
              )
            ) : (
              <span className="text-orange-600">Thử lại nhé — hoặc chọn đối thủ chậm hơn để luyện trước!</span>
            )
          }
          stars={result.stars}
          onAgain={start}
          onSetup={() => setPhase("setup")}
        />
        {result.medal && (
          <p className="text-center mt-4 font-extrabold text-amber-600 motion-safe:animate-pop">
            {MEDAL[rival.level]} Huy chương mới cho bảng {tables.join(", ")}!
          </p>
        )}
      </div>
    );
  }

  // ── Đếm ngược + đang đua ───────────────────────────────────────────────────
  return (
    <div>
      <ArcadeHeader title="Đua xe bảng nhân" backHref={backHref} />
      <div className="flex justify-center gap-2 mb-3">
        <Stat label="Thời gian">{(elapsed / 1000).toFixed(1).replace(".", ",")}</Stat>
        <Stat label="Chặng">{steps}/{GOAL}</Stat>
        <Stat label="Combo">{combo > 0 ? `🔥${combo}` : "–"}</Stat>
      </div>
      <Track steps={steps} rivalProgress={rivalProgress} rival={rival} spinBeat={spinBeat} nitroBeat={nitroBeat} />

      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-lg p-5 sm:p-7 mt-4">
        {phase === "countdown" ? (
          <div className="h-[220px] flex items-center justify-center">
            <span key={count} className="text-8xl font-extrabold text-blue-600 motion-safe:animate-zoomin">{count}</span>
          </div>
        ) : q && (
          <>
            <p key={q.text} className="text-center text-6xl font-extrabold text-gray-800 tracking-wide motion-safe:animate-pop">
              {q.text} = <span className="text-orange-500">?</span>
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {q.options.map((n) => (
                <button
                  key={`${q.text}-${n}`}
                  onClick={() => answer(n)}
                  disabled={stunned}
                  className={`rounded-2xl border-4 border-b-[10px] py-4 text-3xl font-extrabold transition-all active:translate-y-1 active:border-b-4 ${
                    wrongPick === n
                      ? "bg-red-50 border-red-300 text-red-400 motion-safe:animate-shake"
                      : "bg-white border-blue-200 hover:border-blue-400 text-gray-800 disabled:opacity-60"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Đường đua hai làn: xe của bé ở trên, đối thủ ở dưới, cờ đích bên phải. */
function Track({ steps, rivalProgress, rival, spinBeat, nitroBeat }: {
  steps: number; rivalProgress: number; rival: Rival; spinBeat: number; nitroBeat: number;
}) {
  const lane = "relative h-14 border-b-2 border-dashed border-white/70";
  const pos = (p: number) => ({ left: `calc(${p * 100}% - ${p * 3}rem)` });
  return (
    <div className="relative rounded-2xl bg-slate-600 px-2 py-1 shadow-inner overflow-hidden">
      {/* vạch đích ô cờ */}
      <div
        className="absolute right-2 top-0 bottom-0 w-3 opacity-90"
        style={{ backgroundImage: "repeating-conic-gradient(#fff 0 25%, #111 0 50%)", backgroundSize: "12px 12px" }}
        aria-hidden
      />
      <div className={lane}>
        <span className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-300 ease-out text-4xl" style={pos(steps / GOAL)}>
          <span key={`s${spinBeat}`} className={`inline-block ${spinBeat ? "motion-safe:animate-spinout" : ""}`}>
            <span className="inline-block -scale-x-100">🏎️</span>
          </span>
          {nitroBeat > 0 && (
            <span key={`n${nitroBeat}`} className="absolute -left-7 top-1 text-2xl motion-safe:animate-pop" aria-hidden>🔥</span>
          )}
        </span>
      </div>
      <div className="relative h-14">
        <span className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-100 ease-linear text-4xl" style={pos(rivalProgress)}>
          <span className={`inline-block ${rival.flip ? "-scale-x-100" : "rotate-45"}`}>{rival.emoji}</span>
        </span>
      </div>
    </div>
  );
}
