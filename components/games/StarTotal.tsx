"use client";
import { useSyncExternalStore } from "react";
import { getTotalStars, subscribeStars } from "@/lib/games";

/** Tổng sao bé đã gom được trên máy này. */
export default function StarTotal() {
  const stars = useSyncExternalStore(subscribeStars, getTotalStars, () => 0);
  return (
    <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 font-bold px-4 py-2 rounded-full">
      ⭐ Bé đã có {stars} ngôi sao
    </div>
  );
}
