"use client";

// Phần dùng chung của các trò lớp 3 (đua xe, bắn bóng, lật thẻ): thanh tiêu đề
// có nút tắt/bật tiếng, ô chỉ số, và màn kết thúc có kỷ lục.

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { isMuted, setMuted, subscribeMuted } from "@/lib/sfx";
import { Burst } from "./Fx";

export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  return (
    <button
      onClick={() => setMuted(!muted)}
      className="w-20 shrink-0 text-right text-sm font-bold text-gray-500 hover:text-blue-600"
      aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
    >
      {muted ? "🔇 Tắt" : "🔊 Bật"}
    </button>
  );
}

export function ArcadeHeader({ title, backHref }: { title: string; backHref: string }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <Link href={backHref} className="w-20 shrink-0 whitespace-nowrap text-sm text-blue-600 hover:underline">‹ Trò chơi</Link>
      <h1 className="text-base sm:text-xl font-extrabold text-gray-800 text-center">{title}</h1>
      <SoundToggle />
    </div>
  );
}

/** Ô chỉ số nhỏ: "⏱ 12,4 giây", "❤️❤️🤍"… */
export function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-1.5 text-center min-w-[72px]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-lg font-extrabold text-gray-800 tabular-nums">{children}</p>
    </div>
  );
}

/** Nút chọn dạng "viên kẹo" dùng ở màn cài đặt. */
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`relative rounded-2xl border-2 border-b-[5px] px-4 py-2.5 font-extrabold transition-all active:translate-y-0.5 active:border-b-2 ${
        on ? "bg-blue-600 border-blue-800 text-white" : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
      }`}
    >
      {children}
    </button>
  );
}

export function BigButton({ onClick, children, tone = "blue", disabled }: {
  onClick: () => void; children: ReactNode; tone?: "blue" | "white" | "green"; disabled?: boolean;
}) {
  const cls = tone === "blue"
    ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-800"
    : tone === "green"
      ? "bg-green-500 hover:bg-green-400 text-white border-green-700"
      : "bg-white hover:border-blue-400 text-gray-700 border-gray-200";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${cls} font-extrabold text-lg px-6 py-3 rounded-2xl border-2 border-b-[6px] active:translate-y-1 active:border-b-2 transition-all disabled:opacity-40 disabled:active:translate-y-0`}
    >
      {children}
    </button>
  );
}

/** Màn kết thúc: tiêu đề, các dòng kết quả, dòng kỷ lục, và hai nút. */
export function ResultCard({ emoji, title, lines, record, stars, onAgain, onSetup, celebrate }: {
  emoji: string; title: string; lines: ReactNode[]; record: ReactNode; stars: number;
  onAgain: () => void; onSetup: () => void; celebrate: boolean;
}) {
  return (
    <div className="relative bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-8 text-center">
      {celebrate && <Burst id={1} />}
      <p className="text-6xl motion-safe:animate-jump inline-block">{emoji}</p>
      <p className="text-2xl font-extrabold text-gray-800 mt-2">{title}</p>
      <div className="mt-3 space-y-1 text-gray-600">{lines.map((l, i) => <p key={i}>{l}</p>)}</div>
      <div className="mt-3 text-sm font-bold">{record}</div>
      {stars > 0 && <p className="mt-3 text-lg font-bold text-yellow-700">+{stars} ⭐</p>}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <BigButton onClick={onAgain}>Chơi lại</BigButton>
        <BigButton onClick={onSetup} tone="white">Đổi kiểu chơi</BigButton>
      </div>
    </div>
  );
}

/** Thời gian kiểu Việt Nam: 12,4 giây. */
export const secs = (ms: number) => `${(ms / 1000).toFixed(1).replace(".", ",")} giây`;
