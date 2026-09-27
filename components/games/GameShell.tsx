"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { isSpeechSupported, speakSegments, stopSpeaking, type SpeakSegment } from "@/lib/speech";
import { speakAudioFiles, stopAudioFiles } from "@/lib/audioSpeech";
import { addStars, pick } from "@/lib/games";
import { Burst, Mascot, type Mood } from "./Fx";

export type GameRound = {
  /** Câu đọc thành tiếng khi ra câu hỏi, và khi bấm 🔊 nghe lại. */
  say: string;
  visual: ReactNode;
  options: { key: string; label: ReactNode }[];
  answer: string;
};

export type GameLevel = { id: string; label: string; hint: string };

/** Những gì một bảng chọn đáp án tự vẽ (vd: cây táo) cần biết. */
export type BoardProps = {
  round: GameRound;
  wrong: string[];
  correctKey: string | null;
  shakeKey: string | null;
  choose: (key: string) => void;
  clearShake: () => void;
};

interface Props {
  title: string;
  intro: string;
  levels: GameLevel[];
  make: (level: string, prev: GameRound | null) => GameRound;
  /** Trò chỉ chơi được bằng tai (nghe chữ) thì cần giọng đọc. */
  requiresSpeech?: boolean;
  /** Lưới đáp án: 2 cột cho chữ to, 4 cột cho số. */
  optionCols?: 2 | 4;
  /**
   * File đọc sẵn theo câu (vd: lib/letterClips.ts). Một lượt nói mà mọi câu
   * đều có file thì phát file; thiếu câu nào thì cả lượt dùng giọng máy, để
   * không lẫn hai giọng trong một lượt.
   */
  clips?: Record<string, string>;
  /** Bảng chọn riêng thay cho lưới nút mặc định (vd: cây táo). */
  Board?: ComponentType<BoardProps>;
  backHref: string;
}

const ROUNDS = 10;
const PRAISE = ["Giỏi quá!", "Đúng rồi!", "Tuyệt vời!", "Bé làm đúng rồi!"];
const IDLE_TEXT = "Bé chọn đi nào!";
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
  title, intro, levels, make, requiresSpeech, optionCols = 4, clips, Board, backHref,
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
  const [mood, setMood] = useState<Mood>("idle");
  const [bubble, setBubble] = useState(IDLE_TEXT);
  // Tăng mỗi lần cú phản ứng / pháo giấy bung, để animation chạy lại.
  const [beat, setBeat] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    stopSpeaking();
    stopAudioFiles();
    if (timer.current) clearTimeout(timer.current);
  }, []);

  /** Nói một lượt. Gọi thẳng trong handler của cú chạm (luật iOS). */
  function say(texts: string[]) {
    const urls = clips ? texts.map((t) => clips[t]) : [];
    if (clips && urls.every(Boolean)) {
      stopSpeaking();
      speakAudioFiles(urls.map((url) => ({ url })));
    } else {
      stopAudioFiles();
      speakSegments(texts.map(vi));
    }
  }

  function react(m: Mood, text: string) {
    setMood(m);
    setBubble(text);
    setBeat((b) => b + 1);
  }

  function start(levelId: string) {
    if (timer.current) clearTimeout(timer.current);
    const first = make(levelId, null);
    setLevel(levelId);
    setRound(first);
    setIndex(0);
    setStars(0);
    setWrong([]);
    setCorrectKey(null);
    setDone(false);
    react("idle", IDLE_TEXT);
    say([first.say]);
  }

  function choose(key: string) {
    if (!round || !level || correctKey) return;

    if (key !== round.answer) {
      if (!wrong.includes(key)) setWrong([...wrong, key]);
      setShakeKey(key);
      react("sad", "Thử lại nhé!");
      say(["Chưa đúng, bé thử lại nhé.", round.say]);
      return;
    }

    const earned = wrong.length === 0 ? 1 : 0;
    const total = stars + earned;
    const last = index + 1 >= ROUNDS;
    const next = last ? null : make(level, round);
    const praise = pick(PRAISE);

    setCorrectKey(key);
    setStars(total);
    react("happy", praise);
    say(last ? [praise, `Bé được ${total} ngôi sao!`] : [praise, next!.say]);

    // Giữ ô đúng sáng lên một nhịp cho bé thấy (và cho táo kịp rơi) rồi mới
    // sang câu mới.
    timer.current = setTimeout(() => {
      setCorrectKey(null);
      setWrong([]);
      setMood("idle");
      setBubble(IDLE_TEXT);
      if (last) {
        addStars(total);
        setDone(true);
      } else {
        setRound(next);
        setIndex(index + 1);
      }
    }, 1200);
  }

  const header = (
    <div className="flex items-center justify-between gap-3 mb-4">
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
        <Mascot mood="idle" text="Chào bé! Chọn một cấp độ nhé." beat={0} />
        <p className="text-center text-gray-500 mb-5">{intro}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levels.map((l) => (
            <button
              key={l.id}
              onClick={() => start(l.id)}
              className="bg-white rounded-2xl border-2 border-b-[6px] border-gray-200 hover:border-blue-400 active:translate-y-1 active:border-b-2 shadow-sm p-5 text-left transition-all"
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
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <Burst key={beat} id={beat} />
          <Mascot mood="happy" text="Bé giỏi lắm!" beat={beat} />
          <p className="text-2xl font-extrabold text-gray-800">Bé được {stars} ngôi sao!</p>
          <p className="flex flex-wrap justify-center gap-1 text-2xl sm:text-3xl mt-3">
            {Array.from({ length: ROUNDS }, (_, i) => (
              <span
                key={i}
                // Sao hiện lần lượt từng ngôi một.
                className={`inline-block motion-safe:animate-pop ${i < stars ? "" : "opacity-20"}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                ⭐
              </span>
            ))}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <button
              onClick={() => start(level)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-6 py-3 rounded-2xl border-b-[6px] border-blue-800 active:translate-y-1 active:border-b-2 transition-all"
            >
              Chơi lại
            </button>
            <button
              onClick={() => { stopSpeaking(); stopAudioFiles(); setLevel(null); setRound(null); }}
              className="bg-white border-2 border-b-[6px] border-gray-200 hover:border-blue-400 text-gray-700 font-bold text-lg px-6 py-3 rounded-2xl active:translate-y-1 active:border-b-2 transition-all"
            >
              Đổi cấp độ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Đang chơi ──────────────────────────────────────────────────────────────
  const board = Board ? (
    <Board
      round={round}
      wrong={wrong}
      correctKey={correctKey}
      shakeKey={shakeKey}
      choose={choose}
      clearShake={() => setShakeKey(null)}
    />
  ) : (
    <div className={`grid gap-3 mt-6 ${optionCols === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
      {round.options.map((o, i) => {
        const isWrong = wrong.includes(o.key);
        const isRight = correctKey === o.key;
        return (
          <button
            key={o.key}
            onClick={() => choose(o.key)}
            disabled={isWrong}
            onAnimationEnd={() => setShakeKey(null)}
            style={{ animationDelay: shakeKey === o.key ? "0ms" : `${i * 60}ms` }}
            // Nút "nổi khối": viền đáy dày, bấm xuống thì lún.
            className={`rounded-2xl border-4 py-5 font-extrabold transition-all ${
              isRight
                ? "border-b-[10px] bg-green-100 border-green-500 text-green-700"
                : isWrong
                  ? "border-b-4 translate-y-1 bg-gray-50 border-gray-100 text-gray-300"
                  : "border-b-[10px] active:translate-y-1 active:border-b-4 bg-white border-blue-200 hover:border-blue-400 text-gray-800"
            } ${
              // Nút đã sai thì thôi animation, để lắc xong không "bật" lại.
              shakeKey === o.key ? "motion-safe:animate-shake" : isWrong ? "" : "motion-safe:animate-pop"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      {header}

      {/* Tiến độ: mỗi câu một chấm */}
      <div className="flex justify-center gap-1.5 mb-3" aria-label={`Câu ${index + 1} trên ${ROUNDS}`}>
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i < index ? "bg-green-500" : i === index ? "bg-blue-500" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <Mascot mood={mood} text={bubble} beat={beat} />

      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-lg p-5 sm:p-8">
        {correctKey && <Burst key={beat} id={beat} />}

        {/* key theo câu để mỗi câu mới "bật" vào */}
        <div key={index} className="min-h-[140px] flex items-center justify-center motion-safe:animate-pop">
          {round.visual}
        </div>

        {(speech || clips) && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => say([round.say])}
              className="inline-flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold px-5 py-2.5 rounded-full text-base border-b-4 border-orange-300 active:translate-y-0.5 active:border-b-2 transition-all"
            >
              🔊 Nghe lại
            </button>
          </div>
        )}

        <div key={`b${index}`}>{board}</div>
      </div>

      <p className="text-center mt-4 text-lg">
        ⭐ <span key={stars} className="inline-block font-bold text-gray-700 motion-safe:animate-pop">{stars}</span>
      </p>
    </div>
  );
}
