"use client";
// Đọc tiến độ, sao, ngày hôm nay và lựa chọn của trang nhiệm vụ qua useSyncExternalStore:
// server luôn thấy trạng thái rỗng, nên không lệch hydration và không cần setState trong effect.

import { useSyncExternalStore } from "react";
import { getProgress, getServerProgress, subscribeProgress } from "@/lib/lessonProgress";
import { getTotalStars, subscribeStars } from "@/lib/games";
import { vnDate } from "@/lib/mission";

export const useProgress = () => useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
export const useGameStars = () => useSyncExternalStore(subscribeStars, getTotalStars, () => 0);

const noop = () => () => {};
/** Ngày hôm nay (giờ Việt Nam); null khi render ở server. */
export const useToday = () => useSyncExternalStore(noop, () => vnDate(), () => null);

/* ─── Lựa chọn: lớp, và bài do bố mẹ tự chọn cho từng lớp ─── */

const KEY = "ontap_mission_v1";
export interface MissionPrefs { grade: number | null; bai: Record<string, number> }
const EMPTY: MissionPrefs = { grade: null, bai: {} };
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: MissionPrefs = EMPTY;

function read(): MissionPrefs {
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(KEY); } catch { return EMPTY; }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const d = JSON.parse(raw ?? "null") as Partial<MissionPrefs> | null;
      cached = {
        grade: Number.isInteger(d?.grade) ? (d!.grade as number) : null,
        bai: d?.bai && typeof d.bai === "object" ? d.bai : {},
      };
    } catch {
      cached = EMPTY;
    }
  }
  return cached;
}

export function setMissionPrefs(next: Partial<MissionPrefs>) {
  const cur = read();
  try { window.localStorage.setItem(KEY, JSON.stringify({ ...cur, ...next })); } catch {/* bị chặn: chỉ mất lựa chọn */}
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
export const useMissionPrefs = () => useSyncExternalStore(subscribe, read, () => EMPTY);
