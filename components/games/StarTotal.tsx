"use client";
import { useSyncExternalStore } from "react";
import { Star } from "lucide-react";
import { getTotalStars, subscribeStars } from "@/lib/games";

/** Tổng sao bé đã gom được trên máy này. */
export default function StarTotal() {
  const stars = useSyncExternalStore(subscribeStars, getTotalStars, () => 0);
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-star-50 px-3.5 py-1.5 text-sm font-semibold text-star-800 ring-1 ring-star-200">
      <Star className="h-5 w-5 fill-star-400 text-star-400" aria-hidden />
      <span className="font-black tabular-nums text-slate-900">{stars}</span> ngôi sao đã gom
    </div>
  );
}
