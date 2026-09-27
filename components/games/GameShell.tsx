"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { isSpeechSupported, speakSegments, stopSpeaking, type SpeakSegment } from "@/lib/speech";
import { addStars, pick } from "@/lib/games";

export type GameRound = {
  /** Câu đọc thành tiếng khi ra câu hỏi, và khi bấm 🔊 nghe lại. */
  say: string;
  visual: ReactNode;
  options: { key: string; label: ReactNode }[];
  answer: string;
};

export type GameLevel = { id: string; label: string; hint: string };

interface Props {
  title: string;
  intro: string;
  levels: GameLevel[];
  make: (level: string, prev: GameRound | null) => GameRound;
  /** Trò chỉ chơi được bằng tai (nghe chữ) thì cần giọng đọc. */
  requiresSpeech?: boolean;
  /** Lưới đáp án: 2 cột cho chữ to, 4 cột cho số. */
  optionCols?: 2 | 4;
  backHref: string;
}

const ROUNDS = 10;
const PRAISE = ["Giỏi quá!", "Đúng rồi!", "Tuyệt vời!", "Bé làm đúng rồi!"];
const vi = (text: string): SpeakSegment => ({ text, lang: "vi-VN" });

/**
 * Khung chung cho các trò lớp 1: chọn cấp độ → 10 câu → màn tổng kết.
 *
 * Sai không bị trừ gì, chỉ lắc nhẹ và cho chọn lại — bé lớp 1 rất dễ nản. Sao
 * chỉ tính cho câu đúng ngay lần đầu.
 *
 * Mọi lệnh đọc đều gọi thẳng trong handler của cú chạm, không qua effect hay
 * `await`: iOS chỉ cho phát tiếng trong luồng của cú chạm (xem lib/speech.ts).
 */
export default function GameShell({
  title, intro, levels, make, requiresSpeech, optionCols = 4, backHref,
}: Props) {
  const speech = useSyncExternalStore(
    () => () => {},
    () => isSpeechSupported(),
    () => true
  );

  const [level, setLevel] = useState<string | null>(null);
  const [round, setRound] = useState<GameRound | null>(null);
  const [index, setIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [correctKey, setCorrectKey] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    stopSpeaking();
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function start(levelId: string) {
    const first = make(levelId, null);
    setLevel(levelId);
    setRound(first);
    setIndex(0);
    setStars(0);
    setWrong([]);
    setCorrectKey(null);
    setDone(false);
    speakSegments([vi(first.say)]);
  }

  function choose(key: string) {
    if (!round || !level || correctKey) return;

    if (key !== round.answer) {
      if (!wrong.includes(key)) setWrong([...wrong, key]);
      setShakeKey(key);
      speakSegments([vi("Chưa đúng, bé thử lại nhé."), vi(round.say)]);
      return;
    }

    const earned = wrong.length === 0 ? 1 : 0;
    const total = stars + earned;
    const last = index + 1 >= ROUNDS;
    const next = last ? null : make(level, round);

    setCorrectKey(key);
    setStars(total);
    speakSegments(
      last
        ? [vi(pick(PRAISE)), vi(`Bé được ${total} ngôi sao!`)]
        : [vi(pick(PRAISE)), vi(next!.say)]
    );

    // Giữ ô đúng sáng lên một nhịp cho bé thấy rồi mới sang câu mới.
    timer.current = setTimeout(() => {
      setCorrectKey(null);
      setWrong([]);
      if (last) {
        addStars(total);
        setDone(true);
      } else {
        setRound(next);
        setIndex(index + 1);
      }
    }, 1100);
  }

  const header = (
    <div className="flex items-center justify-between gap-3 mb-5">
      <a href={backHref} className="w-20 shrink-0 whitespace-nowrap text-sm text-blue-600 hover:underline">‹ Trò chơi</a>
      <h1 className="text-base sm:text-xl font-extrabold text-gray-800 text-center">{title}</h1>
      <span className="w-20 shrink-0" />
    </div>
  );

  if (requiresSpeech && !speech) {
    return (
      <div>
        {header}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-600">
          <p className="text-4xl mb-3">🔇</p>
          Trình duyệt này không đọc được thành tiếng nên chưa chơi được trò này.
          Bé thử mở bằng Chrome hoặc Safari nhé.
        </div>
      </div>
    );
  }

  // ── Chọn cấp độ ────────────────────────────────────────────────────────────
  if (!level || !round) {
    return (
      <div>
        {header}
        <p className="text-center text-gray-500 mb-5">{intro}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levels.map((l) => (
            <button
              key={l.id}
              onClick={() => start(l.id)}
              className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-400 shadow-sm p-5 text-left transition-colors"
            >
              <p className="text-lg font-bold text-gray-800">{l.label}</p>
              <p className="text-sm text-gray-500 mt-1">{l.hint}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Tổng kết ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div>
        {header}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-5xl mb-3">🎉</p>
          <p className="text-2xl font-extrabold text-gray-800">Bé được {stars} ngôi sao!</p>
          <p className="flex flex-wrap justify-center gap-1 text-2xl sm:text-3xl mt-3">
            {Array.from({ length: ROUNDS }, (_, i) => (
              <span key={i} className={i < stars ? "" : "opacity-20"}>⭐</span>
            ))}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <button
              onClick={() => start(level)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-6 py-3 rounded-2xl"
            >
              Chơi lại
            </button>
            <button
              onClick={() => { stopSpeaking(); setLevel(null); setRound(null); }}
              className="bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 font-bold text-lg px-6 py-3 rounded-2xl"
            >
              Đổi cấp độ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Đang chơi ──────────────────────────────────────────────────────────────
  return (
    <div>
      {header}

      {/* Tiến độ: mỗi câu một chấm */}
      <div className="flex justify-center gap-1.5 mb-4" aria-label={`Câu ${index + 1} trên ${ROUNDS}`}>
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i < index ? "bg-green-500" : i === index ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
        <div className="min-h-[140px] flex items-center justify-center">{round.visual}</div>

        {speech && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => speakSegments([vi(round.say)])}
              className="inline-flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold px-5 py-2.5 rounded-full text-base"
            >
              🔊 Nghe lại
            </button>
          </div>
        )}

        <div className={`grid gap-3 mt-6 ${optionCols === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
          {round.options.map((o) => {
            const isWrong = wrong.includes(o.key);
            const isRight = correctKey === o.key;
            return (
              <button
                key={o.key}
                onClick={() => choose(o.key)}
                disabled={isWrong}
                onAnimationEnd={() => setShakeKey(null)}
                className={`rounded-2xl border-4 py-5 font-extrabold transition-colors ${
                  isRight
                    ? "bg-green-100 border-green-500 text-green-700"
                    : isWrong
                      ? "bg-gray-50 border-gray-100 text-gray-300"
                      : "bg-white border-blue-200 hover:border-blue-500 text-gray-800"
                } ${shakeKey === o.key ? "animate-shake" : ""}`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center mt-4 text-lg">
        ⭐ <span className="font-bold text-gray-700">{stars}</span>
      </p>
    </div>
  );
}
