"use client";
import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";
import { currentStreak, lessonStars, missionDays, nextStarSticker } from "@/lib/mission";
import { useGameStars, useProgress, useToday } from "./hooks";

/** Trang kết quả của một nhiệm vụ: chuỗi ngày, số sao và lối sang album. */
export default function MissionDoneCard() {
  const today = useToday();
  const progress = useProgress();
  const stars = useGameStars() + lessonStars(progress);
  if (!today) return null;
  const streak = currentStreak(missionDays(progress), today);
  const next = nextStarSticker(stars);
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500" aria-hidden>
        <Flame className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-orange-900">Xong nhiệm vụ! Chuỗi {streak} ngày liên tục.</p>
        <p className="text-sm text-orange-800">
          Album có <b className="tabular-nums">{stars}</b> sao{next ? <>, thêm <b className="tabular-nums">{next.missing}</b> sao để mở {next.sticker.name}.</> : "."}
        </p>
      </div>
      </div>
      <Link href="/nhiem-vu#album" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-sm font-bold text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100">
        <Sparkles className="h-4 w-4" aria-hidden /> Xem album
      </Link>
    </div>
  );
}
