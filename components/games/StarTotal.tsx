"use client";
import { useSyncExternalStore } from "react";
import { Star } from "lucide-react";
import { getTotalStars, subscribeStars } from "@/lib/games";

/** Tổng sao bé đã gom được trên máy này. */
export default function StarTotal() {
  const stars = useSyncExternalStore(subscribeStars, getTotalStars, () => 0);
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
      <span className="font-semibold tabular-nums text-slate-900">{stars}</span> ngôi sao đã gom
    </div>
  );
}
