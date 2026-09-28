// Từ một tiếng quen thuộc lớp 1, mỗi từ một hình emoji không thể hiểu nhầm.
// Tránh từ khác nhau theo vùng miền (lợn/heo, ô/dù), hình mơ hồ, hình ⭐ (lẫn
// với sao thưởng) và từ có hai kiểu đặt dấu (hoá/hóa).
//
// Đổi / thêm từ ở đây thì chạy lại scripts/gen-game-audio.py để có file đọc.

import { pick, shuffle } from "./games";

export type WordGroup = "con-vat" | "do-vat";

export type VietWord = { word: string; emoji: string; group: WordGroup };

export const WORDS: VietWord[] = [
  { word: "bò", emoji: "🐄", group: "con-vat" },
  { word: "cá", emoji: "🐟", group: "con-vat" },
  { word: "gà", emoji: "🐔", group: "con-vat" },
  { word: "mèo", emoji: "🐱", group: "con-vat" },
  { word: "chó", emoji: "🐶", group: "con-vat" },
  { word: "vịt", emoji: "🦆", group: "con-vat" },
  { word: "voi", emoji: "🐘", group: "con-vat" },
  { word: "khỉ", emoji: "🐒", group: "con-vat" },
  { word: "thỏ", emoji: "🐰", group: "con-vat" },
  { word: "rùa", emoji: "🐢", group: "con-vat" },
  { word: "ong", emoji: "🐝", group: "con-vat" },
  { word: "cua", emoji: "🦀", group: "con-vat" },
  { word: "dê", emoji: "🐐", group: "con-vat" },
  { word: "ngựa", emoji: "🐴", group: "con-vat" },
  { word: "nhà", emoji: "🏠", group: "do-vat" },
  { word: "xe", emoji: "🚗", group: "do-vat" },
  { word: "cây", emoji: "🌳", group: "do-vat" },
  { word: "lá", emoji: "🍃", group: "do-vat" },
  { word: "trăng", emoji: "🌙", group: "do-vat" },
  { word: "mưa", emoji: "🌧️", group: "do-vat" },
  { word: "kem", emoji: "🍦", group: "do-vat" },
  { word: "trứng", emoji: "🥚", group: "do-vat" },
  { word: "sách", emoji: "📖", group: "do-vat" },
  { word: "bút", emoji: "✏️", group: "do-vat" },
  { word: "ghế", emoji: "🪑", group: "do-vat" },
  { word: "cờ", emoji: "🚩", group: "do-vat" },
  { word: "tàu", emoji: "🚢", group: "do-vat" },
  { word: "chuối", emoji: "🍌", group: "do-vat" },
  { word: "nho", emoji: "🍇", group: "do-vat" },
  { word: "cam", emoji: "🍊", group: "do-vat" },
  { word: "mũ", emoji: "🧢", group: "do-vat" },
];

// ── Nhìn hình chọn chữ ───────────────────────────────────────────────────────

export type WordLevel = "con-vat" | "do-vat" | "tat-ca";

export type WordQuestion = { target: VietWord; options: string[] };

export function makeWordQuestion(level: WordLevel, avoid?: string): WordQuestion {
  const pool = level === "tat-ca" ? WORDS : WORDS.filter((w) => w.group === level);
  const target = pick(pool.filter((w) => w.word !== avoid));
  // Đáp án nhiễu lấy từ cả danh sách để có đủ 3 từ khác.
  const others = shuffle(WORDS.filter((w) => w.word !== target.word)).slice(0, 3);
  return { target, options: shuffle([target.word, ...others.map((w) => w.word)]) };
}

// ── Chọn dấu thanh ───────────────────────────────────────────────────────────
//
// Dấu thanh là dấu kết hợp Unicode; tách ra bằng NFD rồi gắn dấu khác vào đúng
// nguyên âm đó và NFC lại. Nhờ vậy không phải tự viết luật đặt dấu (hoà/hòa…):
// dấu nằm đúng chỗ như trong từ gốc.

export const TONES = [
  { id: "ngang", mark: "", name: "không dấu" },
  { id: "sac", mark: "́", name: "dấu sắc" },
  { id: "huyen", mark: "̀", name: "dấu huyền" },
  { id: "hoi", mark: "̉", name: "dấu hỏi" },
  { id: "nga", mark: "̃", name: "dấu ngã" },
  { id: "nang", mark: "̣", name: "dấu nặng" },
] as const;

const TONE_MARKS: string[] = TONES.map((t) => t.mark).filter(Boolean);

/** Tách từ thành (chữ bỏ dấu thanh, vị trí nguyên âm mang dấu, dấu). */
function splitTone(word: string): { chars: string[]; at: number; mark: string } {
  const chars = [...word.normalize("NFD")];
  const at = chars.findIndex((c) => TONE_MARKS.includes(c));
  if (at < 0) return { chars, at: -1, mark: "" };
  const mark = chars[at];
  chars.splice(at, 1);
  // Dấu đứng ngay sau ký tự (kể cả dấu mũ/móc) nó gắn vào.
  return { chars, at, mark };
}

/** Tất cả biến thể thanh điệu của một từ, theo thứ tự TONES. */
export function toneVariants(word: string): string[] {
  const { chars, at } = splitTone(word);
  // Từ có dấu: đặt dấu khác vào đúng chỗ dấu cũ (NFC tự sắp lại thứ tự dấu
  // kết hợp). Từ không dấu: tìm chỗ theo luật đặt dấu.
  const pos = at >= 0 ? at : tonePosition(chars.join("").normalize("NFC"));
  return TONES.map((t) => [...chars.slice(0, pos), t.mark, ...chars.slice(pos)].join("").normalize("NFC"));
}

const VOWELS = "aăâeêioôơuưy";
const MARKED = "ăâêôơư";

/**
 * Vị trí (trong chuỗi NFD) để gắn dấu thanh cho từ chưa có dấu:
 * 1. vần có nguyên âm mang mũ/móc/trăng → dấu vào nguyên âm đó (cuối cùng: ươ → ơ);
 * 2. một nguyên âm → vào nó;
 * 3. hai nguyên âm có phụ âm cuối → nguyên âm sau; không có → nguyên âm đầu (mèo, rùa).
 */
function tonePosition(nfc: string): number {
  const chars = [...nfc];
  const vs = chars.map((c, i) => (VOWELS.includes(c.toLowerCase()) ? i : -1)).filter((i) => i >= 0);
  if (!vs.length) return nfc.normalize("NFD").length;
  const marked = vs.filter((i) => MARKED.includes(chars[i].toLowerCase()));
  const last = vs[vs.length - 1];
  const hasFinal = last < chars.length - 1;
  const target = marked.length ? marked[marked.length - 1] : vs.length === 1 || hasFinal ? last : vs[0];
  // Đổi chỉ số NFC → NFD: cộng độ dài NFD của các ký tự đứng trước và của chính nó.
  return chars.slice(0, target + 1).join("").normalize("NFD").length;
}

export type ToneLevel = "sac-huyen" | "tat-ca";

export type ToneQuestion = { target: VietWord; options: string[] };

// Tiếng tận cùng c/ch/p/t chỉ mang được dấu sắc hoặc nặng: "sàch", "bủt"
// không phải tiếng Việt, đưa làm đáp án nhiễu là dạy bé cái sai. Bỏ hẳn.
const STOP_FINAL = /(c|ch|p|t)$/;

// Từ không dấu (ong, voi…) cũng dùng được: đáp án là "không dấu".
export function makeToneQuestion(level: ToneLevel, avoid?: string): ToneQuestion {
  const allowed: string[] = level === "sac-huyen" ? ["ngang", "sac", "huyen"] : TONES.map((t) => t.id);
  const pool = WORDS.filter(
    (w) => allowed.includes(toneOf(w.word)) && !STOP_FINAL.test(w.word) && w.word !== avoid
  );
  const target = pick(pool);
  const variants = toneVariants(target.word);
  const byId = new Map(TONES.map((t, i) => [t.id as string, variants[i]]));
  const wrong = shuffle(allowed.filter((id) => byId.get(id) !== target.word)).slice(0, level === "sac-huyen" ? 2 : 3);
  return { target, options: shuffle([target.word, ...wrong.map((id) => byId.get(id)!)]) };
}

export function toneOf(word: string): string {
  const { mark } = splitTone(word);
  return TONES.find((t) => t.mark === mark)?.id ?? "ngang";
}
