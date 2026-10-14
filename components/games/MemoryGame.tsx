"use client";

// Lật thẻ từ (Tiếng Việt lớp 3): lật hai thẻ, ghép cặp từ trái nghĩa (cao – thấp)
// hoặc cùng nghĩa (to – lớn). Ít lượt lật nhất là kỷ lục. Mỗi ván có một lần
// "Nhìn trộm": mở hết thẻ trong 1,5 giây.

import { useEffect, useRef, useState } from "react";
import { PAIR_LABEL, makeMemoryDeck, type MemoryCard, type WordPairKind } from "@/lib/games3";
import { addStars } from "@/lib/games";
import { sfx } from "@/lib/sfx";
import { submitRecord, useRecord } from "@/lib/gameRecords";
import { ArcadeHeader, BigButton, Chip, ResultCard, Stat, secs } from "./Arcade";

const SIZES = [
  { pairs: 4, label: "Dễ · 8 thẻ" },
  { pairs: 6, label: "Vừa · 12 thẻ" },
  { pairs: 8, label: "Khó · 16 thẻ" },
] as const;

const KINDS: { id: WordPairKind; label: string; example: string }[] = [
  { id: "trai-nghia", label: "↔️ Trái nghĩa", example: "cao – thấp, nóng – lạnh" },
  { id: "cung-nghia", label: "🟰 Cùng nghĩa", example: "to – lớn, ngô – bắp" },
];

type Phase = "setup" | "playing" | "done";

// Chỉ gọi trong handler của cú chạm; để ngoài component cho lint React Compiler
// khỏi nhầm là gọi lúc render.
const clock = () => performance.now();

function Best({ kind, pairs }: { kind: WordPairKind; pairs: number }) {
  const best = useRecord(`lat-the:${kind}:${pairs}`);
  return <p className="text-center text-sm text-gray-500 mt-3">{best !== null ? `🏅 Kỷ lục: ${best} lượt lật` : "Chưa có kỷ lục — chơi thử nhé!"}</p>;
}

export default function MemoryGame({ backHref }: { backHref: string }) {
  const [kind, setKind] = useState<WordPairKind>("trai-nghia");
  const [pairs, setPairs] = useState<number>(6);
  const [phase, setPhase] = useState<Phase>("setup");
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [lastMatch, setLastMatch] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [peeking, setPeeking] = useState(false);
  const [peekUsed, setPeekUsed] = useState(false);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<{ moves: number; ms: number; isNew: boolean; prev: number | null; stars: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (phase !== "playing" || startAt === null) return;
    const id = setInterval(() => setNow(clock()), 250);
    return () => clearInterval(id);
  }, [phase, startAt]);

  function start() {
    if (timer.current) clearTimeout(timer.current);
    sfx.flip(); // trong cú chạm: mở khoá âm thanh trên iOS
    setDeck(makeMemoryDeck(kind, pairs));
    setOpen([]);
    setMatched(new Set());
    setLastMatch(null);
    setMoves(0);
    setPeeking(false);
    setPeekUsed(false);
    setStartAt(null);
    setResult(null);
    setPhase("playing");
  }

  function peek() {
    if (peekUsed || open.length === 2) return;
    setPeekUsed(true);
    setPeeking(true);
    sfx.whoosh();
    timer.current = setTimeout(() => setPeeking(false), 1500);
  }

  function flip(card: MemoryCard) {
    if (peeking || matched.has(card.pair) || open.includes(card.id) || open.length === 2) return;
    const t = startAt ?? clock();
    if (startAt === null) { setStartAt(t); setNow(t); }
    sfx.flip();
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;

    const [a, b] = next.map((id) => deck.find((c) => c.id === id)!);
    const m = moves + 1;
    setMoves(m);
    if (a.pair === b.pair) {
      const done = new Set(matched).add(a.pair);
      setMatched(done);
      setLastMatch(a.pair);
      setOpen([]);
      sfx.ding(done.size);
      if (done.size === pairs) {
        const ms = clock() - t;
        const { isNew, prev } = submitRecord(`lat-the:${kind}:${pairs}`, m, "lower");
        // Ván hoàn hảo (mỗi cặp lật đúng ngay) = 10 sao; mỗi lượt thừa bớt 1 sao.
        const stars = Math.max(2, Math.min(10, 10 - (m - pairs)));
        addStars(stars);
        timer.current = setTimeout(() => {
          sfx.win();
          setResult({ moves: m, ms, isNew, prev, stars });
          setPhase("done");
        }, 700);
      }
    } else {
      timer.current = setTimeout(() => setOpen([]), 900);
    }
  }

  const header = <ArcadeHeader title="Lật thẻ từ" backHref={backHref} />;

  if (phase === "setup") {
    return (
      <div>
        {header}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <p className="text-center text-gray-600">Lật hai thẻ một lượt. Hai từ hợp thành một cặp thì thẻ được giữ lại. Lật càng ít lượt càng giỏi!</p>
          <p className="mt-5 mb-2 font-bold text-gray-700">1. Ghép cặp từ…</p>
          <div className="grid grid-cols-2 gap-2">
            {KINDS.map((k) => (
              <button key={k.id} onClick={() => setKind(k.id)} aria-pressed={kind === k.id}
                className={`rounded-2xl border-2 border-b-[6px] p-3 text-left transition-all active:translate-y-1 active:border-b-2 ${
                  kind === k.id ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200 hover:border-blue-300"
                }`}>
                <p className="font-extrabold text-gray-800">{k.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{k.example}</p>
              </button>
            ))}
          </div>
          <p className="mt-5 mb-2 font-bold text-gray-700">2. Số thẻ</p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => <Chip key={s.pairs} on={pairs === s.pairs} onClick={() => setPairs(s.pairs)}>{s.label}</Chip>)}
          </div>
          <Best kind={kind} pairs={pairs} />
          <div className="mt-5 text-center"><BigButton onClick={start} tone="green">🃏 Bắt đầu</BigButton></div>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div>
        {header}
        <ResultCard
          emoji={result.moves === pairs ? "🧠" : "🃏"}
          title={result.moves === pairs ? "Trí nhớ siêu đỉnh!" : "Bé ghép xong hết rồi!"}
          celebrate
          lines={[<>Lật <b>{result.moves}</b> lượt trong <b>{secs(result.ms)}</b></>]}
          record={result.isNew
            ? <span className="text-green-600">🎉 Kỷ lục mới{result.prev !== null ? ` (cũ: ${result.prev} lượt)` : ""}!</span>
            : <span className="text-gray-500">Kỷ lục của bé: {result.prev} lượt</span>}
          stars={result.stars}
          onAgain={start}
          onSetup={() => setPhase("setup")}
        />
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-bold text-gray-700 mb-2">Các cặp từ {PAIR_LABEL[kind]}:</p>
          <div className="flex flex-wrap gap-2">
            {[...new Set(deck.map((c) => c.pair))].map((p) => {
              const [a, b] = deck.filter((c) => c.pair === p);
              return <span key={p} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{a.word} – {b.word}</span>;
            })}
          </div>
        </div>
      </div>
    );
  }

  const elapsed = startAt === null ? 0 : now - startAt;
  return (
    <div>
      {header}
      <div className="flex justify-center gap-2 mb-3">
        <Stat label="Lượt">{moves}</Stat>
        <Stat label="Cặp">{matched.size}/{pairs}</Stat>
        <Stat label="Giây">{Math.floor(elapsed / 1000)}</Stat>
      </div>
      <p className="text-center font-extrabold text-blue-700 mb-3">Tìm các cặp từ {PAIR_LABEL[kind]}</p>
      <div className={`grid gap-2 sm:gap-3 ${pairs === 4 ? "grid-cols-4" : pairs === 6 ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-4"}`}>
        {deck.map((c) => {
          const faceUp = peeking || open.includes(c.id) || matched.has(c.pair);
          const isMatched = matched.has(c.pair);
          return (
            <button
              key={c.id}
              onClick={() => flip(c)}
              className="relative aspect-[3/4] [perspective:600px]"
              aria-label={faceUp ? c.word : "Thẻ úp"}
            >
              <span
                className="absolute inset-0 transition-transform duration-300 [transform-style:preserve-3d] motion-reduce:transition-none"
                style={{ transform: faceUp ? "rotateY(180deg)" : "none" }}
              >
                {/* mặt sau */}
                <span className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-b-[5px] border-indigo-700 bg-indigo-500 text-3xl text-white [backface-visibility:hidden]">
                  ✦
                </span>
                {/* mặt trước */}
                <span
                  className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 border-b-[5px] px-1 text-center font-extrabold leading-tight [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isMatched ? "bg-green-50 border-green-400 text-green-700" : "bg-white border-blue-300 text-gray-800"
                  } ${c.word.length > 7 ? "text-sm sm:text-base" : "text-lg sm:text-xl"} ${
                    isMatched && lastMatch === c.pair ? "motion-safe:animate-pop" : ""
                  }`}
                >
                  {c.word}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <BigButton onClick={peek} tone="white" disabled={peekUsed}>👀 Nhìn trộm {peekUsed ? "(đã dùng)" : "(1 lần)"}</BigButton>
      </div>
    </div>
  );
}
