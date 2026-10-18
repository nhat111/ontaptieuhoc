// Trò chơi có tự đọc câu hỏi / lời khen hay không. Mặc định TẮT: chỉ đọc khi người
// dùng bấm 🔊 Nghe, hoặc tự bật "Tự đọc" (lưu trên máy, `ontap_game_voice`).
// Đọc qua useSyncExternalStore như lib/sfx.ts.

const KEY = "ontap_game_voice";
const listeners = new Set<() => void>();

export function isAutoVoice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setAutoVoice(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {/* ignore */}
  listeners.forEach((l) => l());
}

export function subscribeAutoVoice(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
