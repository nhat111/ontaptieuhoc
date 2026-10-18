"use client";
import GameShell, { type GameRound } from "./GameShell";
import { makeMoneyQuestion, moneyText, type MoneyLevel } from "@/lib/games2";
import { fmtInt } from "@/lib/games";

const LEVELS = [
  { id: "dem-tien", label: "💵 Đếm tiền", hint: "Cộng các tờ 100, 200, 500 đồng" },
  { id: "tra-lai", label: "🛒 Đi chợ", hint: "Đưa tờ 1 000 đồng, được trả lại bao nhiêu?" },
];

// Màu tự chọn cho từng mệnh giá — chỉ để phân biệt, không vẽ giống tờ tiền thật.
const NOTE_STYLE: Record<number, string> = {
  100: "bg-amber-100 border-amber-400 text-amber-800",
  200: "bg-rose-100 border-rose-400 text-rose-800",
  500: "bg-emerald-100 border-emerald-400 text-emerald-800",
  1000: "bg-sky-100 border-sky-400 text-sky-800",
};

function Note({ value }: { value: number }) {
  return (
    <span className={`flex h-16 w-28 sm:h-20 sm:w-36 flex-col items-center justify-center rounded-xl border-2 shadow-sm ${NOTE_STYLE[value]}`}>
      <span className="text-2xl sm:text-3xl font-extrabold leading-none">{fmtInt(value)}</span>
      <span className="text-xs font-semibold">đồng</span>
    </span>
  );
}

function make(level: string): GameRound {
  const q = makeMoneyQuestion(level as MoneyLevel);
  const options = q.options.map((n) => ({ key: String(n), label: <span className="text-xl sm:text-2xl">{moneyText(n)}</span> }));
  if (level === "dem-tien") {
    return {
      // Đọc từng tờ: bé lớp 2 nghe được, vẫn phải tự cộng.
      say: `${q.notes.map((n) => `tờ ${n} đồng`).join(", ")}. Có tất cả bao nhiêu tiền?`,
      reveal: q.reveal,
      visual: (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {q.notes.map((n, i) => <Note key={i} value={n} />)}
        </div>
      ),
      options,
      answer: String(q.answer),
    };
  }
  return {
    say: `Mua ${q.item!.name} giá ${q.price} đồng, đưa tờ 1000 đồng. Được trả lại bao nhiêu tiền?`,
    reveal: q.reveal,
    visual: (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-lg sm:text-xl text-gray-700">
          <span className="text-4xl align-middle mr-1">{q.item!.emoji}</span>
          {q.item!.name} giá <b>{moneyText(q.price!)}</b>
        </p>
        <p className="flex items-center gap-2 text-gray-600">Bé đưa <Note value={1000} /></p>
        <p className="text-lg font-bold text-gray-800">Được trả lại bao nhiêu tiền?</p>
      </div>
    ),
    options,
    answer: String(q.answer),
  };
}

export default function MoneyGame({ backHref }: { backHref: string }) {
  return (
    <GameShell
      title="Tiền Việt Nam"
      intro="Đếm tiền và tính tiền trả lại với các tờ 100, 200, 500 và 1 000 đồng. Mỗi lượt 10 câu."
      levels={LEVELS}
      make={make}
      optionCols={2}
      backHref={backHref}
    />
  );
}
