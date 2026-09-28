import { createHash } from "crypto";
import { GAME_CLIPS } from "./gameClips";

// Bản thu giọng thật cho trò chơi lớp 1 — thu ở /import/giong-tro-choi, cất ở
// Storage `question-audio/tro-choi/`. Có bản thu thì trò chơi phát bản thu,
// chưa có thì phát file Piper trong public/audio/tro-choi/.
//
// Chỉ dùng phía server (cần `crypto` của Node).

export const RECORD_DIR = "tro-choi";

/** Mọi câu các trò chơi có thể nói — cũng là danh sách được phép thu. */
export const GAME_TEXTS: string[] = Object.keys(GAME_CLIPS);

/**
 * Tên file cho một câu. Giống hệt `slug()` trong scripts/gen-game-audio.py để
 * bản thu và file Piper của cùng một câu dễ đối chiếu.
 */
export function clipSlug(text: string): string {
  const base = text
    .normalize("NFD")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return `${base}-${createHash("md5").update(text, "utf8").digest("hex").slice(0, 6)}`;
}

export function recordingPath(text: string): string {
  return `${RECORD_DIR}/${clipSlug(text)}.wav`;
}
