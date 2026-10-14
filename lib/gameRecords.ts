// Kỷ lục và huy chương của trò chơi lớp 3, lưu trên máy (localStorage) như sao
// tích luỹ: mất cũng không sao, nên không cần DB. Đọc qua useSyncExternalStore.
//
// Mỗi kỷ lục là một số dưới một khoá, vd "dua-xe:3,4:tho" = số giây về đích nhanh
// nhất, "ban-bong:bang-7" = điểm cao nhất, "huy-chuong:7" = mức huy chương bảng 7.

import { useSyncExternalStore } from "react";

const KEY = "ontap_game_records_v1";
const listeners = new Set<() => void>();

function readAll(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as unknown;
    if (!raw || typeof raw !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    return out;
  } catch {
    return {};
  }
}

export function getRecord(key: string): number | null {
  return readAll()[key] ?? null;
}

/**
 * Ghi kết quả nếu tốt hơn kỷ lục cũ. `better: "lower"` cho thời gian / số lượt,
 * `"higher"` cho điểm. Trả về kỷ lục cũ (null nếu chưa có) và có phải kỷ lục mới không.
 */
export function submitRecord(key: string, value: number, better: "lower" | "higher") {
  const all = readAll();
  const prev = all[key] ?? null;
  const isNew = prev === null || (better === "lower" ? value < prev : value > prev);
  if (isNew) {
    all[key] = value;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(all));
    } catch {/* ignore */}
    listeners.forEach((l) => l());
  }
  return { prev, isNew };
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Kỷ lục của một khoá; null khi chưa có (và khi render phía server). */
export function useRecord(key: string): number | null {
  return useSyncExternalStore(subscribe, () => getRecord(key), () => null);
}
