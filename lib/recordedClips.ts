"use client";
import { useEffect, useState } from "react";

// Bản thu giọng thật của trò chơi (GET /api/game-audio), tải một lần cho cả
// phiên. Lỗi mạng thì coi như chưa có bản thu — trò chơi dùng file Piper.

let cache: Promise<Record<string, string>> | null = null;

export function loadRecordedClips(force = false): Promise<Record<string, string>> {
  if (!cache || force) {
    cache = fetch("/api/game-audio", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { clips: {} }))
      .then((d) => (d?.clips ?? {}) as Record<string, string>)
      .catch(() => ({}));
  }
  return cache;
}

export function useRecordedClips(enabled = true): Record<string, string> {
  const [clips, setClips] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadRecordedClips().then((c) => {
      if (alive) setClips(c);
    });
    return () => {
      alive = false;
    };
  }, [enabled]);
  return clips;
}
