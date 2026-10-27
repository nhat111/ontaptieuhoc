// lib/challenge.ts
// "Thách bạn làm đề này": link mở lại ĐÚNG bộ câu vừa làm (đề có sẵn, đề tạo nhanh, bài theo
// sách, nhiệm vụ — đều sinh theo mã nên mở lại ra y hệt) kèm điểm và tên gọi của người thách.
//
// Không có tài khoản, không lưu gì trên máy chủ: mọi thứ nằm trong link. Điểm trong link sửa
// tay được — đây là trò chơi giữa anh em, bạn bè, không phải bảng xếp hạng.

export interface Challenge {
  score: number;
  total: number;
  /** Tên gọi người thách (tự gõ, có thể trống). */
  name: string;
}

export const MAX_NAME = 20;

/** Tên gọi: bỏ ký tự điều khiển, gộp khoảng trắng, tối đa MAX_NAME ký tự. */
export function cleanName(raw: string | null | undefined): string {
  return (raw ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME)
    .trim();
}

/** `thach=8-10&ten=Minh` → thử thách; sai định dạng hoặc tổng số câu không khớp → null. */
export function parseChallenge(thach: string | null | undefined, ten: string | null | undefined, questionCount: number): Challenge | null {
  const m = /^(\d{1,3})-(\d{1,3})$/.exec(thach ?? "");
  if (!m) return null;
  const score = Number(m[1]), total = Number(m[2]);
  // Đề đã đổi số câu (bài trong kho bị sửa) thì so điểm không còn ý nghĩa.
  if (total <= 0 || score > total || total !== questionCount) return null;
  return { score, total, name: cleanName(ten) };
}

/** Link thách: link mở lại bộ câu + điểm + tên. `shareHref` là đường dẫn trong site ("/quiz?…"). */
export function challengeUrl(origin: string, shareHref: string, score: number, total: number, name: string): string {
  const url = new URL(shareHref, origin);
  url.searchParams.delete("thach");
  url.searchParams.delete("ten");
  url.searchParams.set("thach", `${score}-${total}`);
  const n = cleanName(name);
  if (n) url.searchParams.set("ten", n);
  return url.toString();
}

export type Verdict = "win" | "draw" | "lose";

export function verdict(mine: number, theirs: number): Verdict {
  return mine > theirs ? "win" : mine === theirs ? "draw" : "lose";
}

/** Lời mời kèm link khi chia sẻ (Zalo, Messenger…). */
export function challengeText(name: string, score: number, total: number, title: string): string {
  const who = cleanName(name) || "Mình";
  return `${who} được ${score}/${total} bài “${title}”. Bạn làm thử xem được bao nhiêu nhé! 💪`;
}
