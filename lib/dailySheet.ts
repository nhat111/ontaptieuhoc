// lib/dailySheet.ts — "Phiếu luyện hằng ngày" lớp 1, lớp 2: phiếu in dày đặc kiểu luyện tay,
// mỗi bài là một khối nhiều ô nhỏ (khác phiếu theo chủ đề ở lib/worksheetExport.ts,
// vốn in từng câu trắc nghiệm / tự luận).
//
//   Lớp 1 Toán:       sơ đồ tách–gộp, điền > < =, tính, điền số thiếu, viết số theo thứ tự, dãy số.
//   Lớp 1 Tiếng Việt: điền âm đầu vào chỗ chấm (c/k, ch/tr, s/x, l/n, g/gh, ng/ngh, h/th/kh, v/d/gi).
//   Lớp 2 Toán:       tính nhẩm qua 10, cộng trừ có nhớ (phạm vi 100), bảng nhân chia 2 và 5,
//                     so sánh số có ba chữ số, trăm – chục – đơn vị, đếm thêm, đổi m – dm – cm.
//   Lớp 2 Tiếng Việt: điền r/d/gi; vần ao/au, ai/ay, an/ang.
//
// Không gọi AI: số do code sinh (cùng seed → cùng phiếu), từ Tiếng Việt lấy từ kho soạn
// tay bên dưới. scripts/daily-sheet-check.ts kiểm tra đáp án và luật chính tả của kho từ.
//
// Bố cục chỉ dùng bảng (Word bỏ qua CSS grid/flex khi mở .doc dạng HTML).

import { type Rng, mulberry32, seedFrom, int, pick, chance, shuffle } from "./mathGen/core";
import { escapeHtml } from "./exportLesson";
import { ART_CSS, artImg, bulletArt, decoratedHeader, type ArtName } from "./sheetArt";


/* ═══════════════ Kiểu dữ liệu ═══════════════ */

/** Một ô: chữ/số hiện sẵn, hoặc ô trống bé phải điền (`box` là đáp án). */
export type Cell = { text: string } | { box: string };

export type Item =
  | { kind: "inline"; cells: Cell[] }
  | { kind: "bond"; top: Cell; left: Cell; right: Cell }
  | { kind: "order"; nums: number[] }
  /** Từ có chỗ chấm: phần chữ thường xen phần cần điền. */
  | { kind: "spell"; parts: ({ text: string } | { blank: string })[] };

export interface Block {
  title: string;      // HTML an toàn (đã escape), có thể có <b>
  perRow: number;
  items: Item[];
}

export interface DailySheet {
  blocks: Block[];
}

const T = (text: string | number): Cell => ({ text: String(text) });
const B = (answer: string | number): Cell => ({ box: String(answer) });

/* ═══════════════ TOÁN ═══════════════ */

export type MathRange = 5 | 10 | 100;
export const MATH_RANGES: { value: MathRange; label: string }[] = [
  { value: 5, label: "Phạm vi 5" },
  { value: 10, label: "Phạm vi 10" },
  { value: 100, label: "Phạm vi 100" },
];

export type MathBlockId =
  | "bond" | "compare" | "calc" | "missing" | "order" | "seq"
  | "qua10" | "conho" | "thieu2" | "nhanchia" | "sosanh1000" | "tramchuc" | "demthem" | "donvi2";

type MathBlockDef = {
  id: MathBlockId;
  label: string;           // nhãn trên giao diện
  title: string;           // đề bài in trên phiếu
  perRow: number;
  count: number;
  /** Phạm vi lớn nhất dùng được (sơ đồ tách–gộp chỉ học trong phạm vi 10). */
  maxRange?: MathRange;
  make: (r: Rng, range: MathRange) => Item;
};

/** Cặp số cộng/trừ hợp với phạm vi. Phạm vi 100: không nhớ (đúng chương trình lớp 1). */
function pair(r: Rng, range: MathRange, op: "+" | "-"): [number, number, number] {
  if (range <= 10) {
    const c = int(r, 2, range);
    const a = int(r, 1, c - 1);
    return op === "+" ? [a, c - a, c] : [c, a, c - a];
  }
  for (;;) {
    if (op === "+") {
      const a1 = int(r, 1, 8), a0 = int(r, 0, 8);
      const b1 = int(r, 0, 9 - a1), b0 = int(r, b1 === 0 ? 1 : 0, 9 - a0);
      const a = a1 * 10 + a0, b = b1 * 10 + b0;
      return [a, b, a + b];
    }
    const a1 = int(r, 1, 9), a0 = int(r, 0, 9);
    const b1 = int(r, 0, a1), b0 = int(r, 0, a0);
    const a = a1 * 10 + a0, b = b1 * 10 + b0;
    if (b > 0 && b < a) return [a, b, a - b];
  }
}

const sign = (a: number, b: number) => (a > b ? ">" : a < b ? "<" : "=");

function distinct(r: Rng, n: number, lo: number, hi: number): number[] {
  const s = new Set<number>();
  while (s.size < n) s.add(int(r, lo, hi));
  return [...s];
}

export const MATH_BLOCKS: MathBlockDef[] = [
  {
    id: "bond", label: "Sơ đồ tách – gộp số", title: "Điền số vào ô trống", perRow: 4, count: 8, maxRange: 10,
    make: (r, range) => {
      const total = int(r, 2, range);
      const a = int(r, 1, total - 1), b = total - a;
      const hide = chance(r, 0.5) ? "top" : chance(r, 0.5) ? "left" : "right";
      return {
        kind: "bond",
        top: hide === "top" ? B(total) : T(total),
        left: hide === "left" ? B(a) : T(a),
        right: hide === "right" ? B(b) : T(b),
      };
    },
  },
  {
    id: "compare", label: "Điền dấu >, <, =", title: "Điền dấu &gt;, &lt;, = vào ô trống", perRow: 4, count: 16,
    make: (r, range) => {
      const [lo, hi] = range === 100 ? [10, 99] : [0, range];
      const a = int(r, lo, hi);
      let b: number;
      if (chance(r, 0.15)) b = a;
      else if (range === 100 && chance(r, 0.4)) b = Math.floor(a / 10) * 10 + int(r, 0, 9); // cùng hàng chục
      else b = int(r, lo, range === 100 ? 100 : hi);
      return { kind: "inline", cells: [T(a), B(sign(a, b)), T(b)] };
    },
  },
  {
    id: "calc", label: "Tính", title: "Tính", perRow: 3, count: 12,
    make: (r, range) => {
      const op = chance(r, 0.5) ? "+" : "-";
      const [a, b, c] = pair(r, range, op);
      return { kind: "inline", cells: [T(a), T(op), T(b), T("="), B(c)] };
    },
  },
  {
    id: "missing", label: "Điền số còn thiếu trong phép tính", title: "Điền số thích hợp vào ô trống", perRow: 3, count: 9,
    make: (r, range) => {
      const op = chance(r, 0.5) ? "+" : "-";
      const [a, b, c] = pair(r, range, op);
      const left = chance(r, 0.5);
      return { kind: "inline", cells: [left ? B(a) : T(a), T(op), left ? T(b) : B(b), T("="), T(c)] };
    },
  },
  {
    id: "order", label: "Viết số theo thứ tự", title: "Viết các số sau theo thứ tự", perRow: 2, count: 4,
    make: (r, range) => {
      const n = range === 5 ? 5 : range === 10 ? 6 : 5;
      const [lo, hi] = range === 100 ? [10, 100] : [0, range];
      for (;;) {
        const nums = distinct(r, n, lo, hi);
        const asc = [...nums].sort((x, y) => x - y).join();
        if (nums.join() !== asc && [...nums].reverse().join() !== asc) return { kind: "order", nums };
      }
    },
  },
  {
    id: "seq", label: "Dãy số còn thiếu", title: "Viết số còn thiếu vào ô trống", perRow: 2, count: 4,
    make: (r, range) => {
      const len = range === 5 ? 5 : 6;
      const max = range;
      const step = range === 100 ? pick(r, [1, -1, 10, -10]) : pick(r, [1, -1]);
      const span = Math.abs(step) * (len - 1);
      const start = step > 0 ? int(r, 0, max - span) : int(r, span, max);
      const nums = Array.from({ length: len }, (_, i) => start + step * i);
      // Giữ 2 số đầu để bé thấy dãy tăng hay giảm, giấu 2–3 số phía sau.
      const hidden = new Set(shuffle(r, Array.from({ length: len - 2 }, (_, i) => i + 2)).slice(0, len === 5 ? 2 : 3));
      return { kind: "inline", cells: nums.map((v, i) => (hidden.has(i) ? B(v) : T(v))) };
    },
  },
];

/* ═══════════════ TOÁN LỚP 2 ═══════════════
   Không có lựa chọn phạm vi: mỗi bài tự mang phạm vi của chương trình lớp 2. */

export const MATH_BLOCKS_2: MathBlockDef[] = [
  {
    id: "qua10", label: "Tính nhẩm qua 10 (phạm vi 20)", title: "Tính nhẩm", perRow: 4, count: 16,
    make: (r) => {
      // Cộng qua 10: hai số có tổng 11–18; trừ qua 10: số bị trừ 11–18, hàng đơn vị bé hơn số trừ.
      const a = int(r, 2, 9), b = int(r, 11 - a > 2 ? 11 - a : 2, 9);
      const c = a + b;
      return chance(r, 0.5)
        ? { kind: "inline", cells: [T(a), T("+"), T(b), T("="), B(c)] }
        : { kind: "inline", cells: [T(c), T("-"), T(a), T("="), B(b)] };
    },
  },
  {
    id: "conho", label: "Cộng, trừ có nhớ (phạm vi 100)", title: "Tính", perRow: 3, count: 12,
    make: (r) => {
      for (;;) {
        if (chance(r, 0.5)) {
          const a = int(r, 11, 89), b = int(r, 2, 99 - a);
          if ((a % 10) + (b % 10) >= 10) return { kind: "inline", cells: [T(a), T("+"), T(b), T("="), B(a + b)] };
        } else {
          const a = int(r, 21, 99), b = int(r, 2, a - 10);
          if ((a % 10) < (b % 10)) return { kind: "inline", cells: [T(a), T("-"), T(b), T("="), B(a - b)] };
        }
      }
    },
  },
  {
    id: "thieu2", label: "Tìm số còn thiếu (có nhớ)", title: "Điền số thích hợp vào ô trống", perRow: 3, count: 9,
    make: (r) => {
      for (;;) {
        const a = int(r, 11, 79), b = int(r, 5, 99 - a);
        if ((a % 10) + (b % 10) < 10) continue;
        return chance(r, 0.5)
          ? { kind: "inline", cells: [B(a), T("+"), T(b), T("="), T(a + b)] }
          : { kind: "inline", cells: [T(a + b), T("-"), B(b), T("="), T(a)] };
      }
    },
  },
  {
    id: "nhanchia", label: "Bảng nhân, bảng chia 2 và 5", title: "Tính nhẩm", perRow: 4, count: 16,
    make: (r) => {
      const k = pick(r, [2, 5]), x = int(r, 1, 10);
      return chance(r, 0.55)
        ? { kind: "inline", cells: chance(r, 0.5) ? [T(k), T("×"), T(x), T("="), B(k * x)] : [T(x), T("×"), T(k), T("="), B(k * x)] }
        : { kind: "inline", cells: [T(k * x), T(":"), T(k), T("="), B(x)] };
    },
  },
  {
    id: "sosanh1000", label: "So sánh số có ba chữ số", title: "Điền dấu &gt;, &lt;, = vào ô trống", perRow: 3, count: 12,
    make: (r) => {
      const a = int(r, 100, 999);
      let b: number;
      if (chance(r, 0.12)) b = a;
      else if (chance(r, 0.5)) b = Math.floor(a / 100) * 100 + int(r, 0, 99); // cùng hàng trăm
      else if (chance(r, 0.5)) b = Math.floor(a / 10) * 10 + int(r, 0, 9);    // cùng trăm, chục
      else b = int(r, 100, 999);
      return { kind: "inline", cells: [T(a), B(sign(a, b)), T(b)] };
    },
  },
  {
    id: "tramchuc", label: "Viết số thành tổng trăm, chục, đơn vị", title: "Viết số thành tổng các trăm, chục, đơn vị", perRow: 2, count: 6,
    make: (r) => {
      const h = int(r, 1, 9), t = int(r, 1, 9), u = int(r, 1, 9);
      return { kind: "inline", cells: [T(h * 100 + t * 10 + u), T("="), B(h * 100), T("+"), B(t * 10), T("+"), B(u)] };
    },
  },
  {
    id: "demthem", label: "Đếm thêm 2, 5, 10, 100", title: "Viết số còn thiếu vào ô trống", perRow: 2, count: 4,
    make: (r) => {
      const step = pick(r, [2, 5, 10, 100]);
      const len = 6;
      const max = step === 100 ? 1000 : 100;
      const start = step * int(r, step === 100 ? 1 : 0, Math.floor(max / step) - (len - 1));
      const nums = Array.from({ length: len }, (_, i) => start + step * i);
      const hidden = new Set(shuffle(r, [2, 3, 4, 5]).slice(0, 3));
      return { kind: "inline", cells: nums.map((v, i) => (hidden.has(i) ? B(v) : T(v))) };
    },
  },
  {
    id: "donvi2", label: "Đổi đơn vị: m, dm, cm", title: "Viết số thích hợp vào ô trống", perRow: 3, count: 9,
    make: (r) => {
      const [big, small, f] = pick(r, [["dm", "cm", 10], ["m", "dm", 10], ["m", "cm", 100]] as const);
      const n = int(r, 1, 9);
      return chance(r, 0.6)
        ? { kind: "inline", cells: [T(`${n} ${big}`), T("="), B(n * f), T(small)] }
        : { kind: "inline", cells: [T(`${n * f} ${small}`), T("="), B(n), T(big)] };
    },
  },
];

/* ═══════════════ TIẾNG VIỆT — điền âm đầu ═══════════════
   Kho từ soạn tay. Phần trong [ ] là chỗ chấm. Luật chính tả (c/k, g/gh, ng/ngh)
   được scripts/daily-sheet-check.ts kiểm tra cho từng từ. */

export type SpellGroupId = "c-k" | "ch-tr" | "s-x" | "l-n" | "g-gh" | "ng-ngh" | "h-th-kh" | "v-d-gi";

type SpellGroupDef = {
  id: SpellGroupId | SpellGroupId2;
  options: string[];
  words: string[];
  /** "van": chỗ chấm là vần (có thể cuối tiếng, mang dấu thanh: "ch[ào] cờ"). Mặc định là âm đầu. */
  part?: "van";
};

export const SPELL_GROUPS: SpellGroupDef[] = [
  {
    id: "c-k", options: ["c", "k"],
    words: [
      "con [c]ò", "cái [c]ốc", "cây [c]au", "[c]ủ [c]ải", "thước [k]ẻ", "[k]ể chuyện", "cái [k]éo", "con [k]iến",
      "que [k]em", "[k]ính lúp", "[c]ầu thang", "[c]ửa sổ", "[k]ệ sách", "[c]ô giáo", "[c]ặp sách", "[c]ánh diều",
      "[c]ỏ non", "[k]êu to", "[k]í hiệu", "con [c]ua", "cái [k]ẹo", "[c]on [c]á", "dòng [k]ênh", "[c]ơm nóng",
    ],
  },
  {
    id: "ch-tr", options: ["ch", "tr"],
    words: [
      "[tr]ăng sáng", "[ch]ăm [ch]ỉ", "cái [tr]ống", "[ch]ú bộ đội", "quả [ch]anh", "[tr]ang vở", "vui [ch]ơi", "bầu [tr]ời",
      "[ch]ợ quê", "[tr]ẻ em", "bàn [ch]ân", "[tr]ồng cây", "[ch]ong [ch]óng", "[tr]ò [ch]ơi", "[ch]ữ viết", "bức [tr]anh",
      "[ch]iếc lá", "[tr]ưa hè", "[ch]ạy nhảy", "con [tr]âu", "con [ch]ó", "[tr]ăng [tr]òn", "quả [tr]ứng", "cái [ch]ổi",
    ],
  },
  {
    id: "s-x", options: ["s", "x"],
    words: [
      "[x]e đạp", "ngôi [s]ao", "dòng [s]ông", "[x]ôi gấc", "quả [x]oài", "[s]ân trường", "[x]inh đẹp", "[s]ách vở",
      "màu [x]anh", "[s]ữa chua", "cây [x]ương rồng", "[s]ư tử", "[x]a [x]ôi", "[s]ạch [s]ẽ", "[x]ếp hàng", "[s]ấm [s]ét",
      "con [s]âu", "cái [x]ô", "hoa [s]en", "[x]e lửa", "[s]ắp [x]ếp", "con [s]óc", "hạt [s]en", "cái [x]ẻng",
    ],
  },
  {
    id: "l-n", options: ["l", "n"],
    words: [
      "[n]ồi cơm", "quả [l]ê", "[n]ón [l]á", "con [n]ai", "[l]ọ mực", "[n]ước mía", "[l]ửa trại", "[n]ụ hoa",
      "[l]á cờ", "[n]ắng vàng", "bông [l]úa", "[n]o [n]ê", "[l]ung [l]inh", "[n]ăm học", "[l]ớp học", "[n]ói chuyện",
      "trời [l]ạnh", "[n]ấu cơm", "[n]ét chữ", "quả [n]a", "[l]à quần áo", "[n]ằm ngủ", "[l]ăn bóng", "ngọn [n]úi",
    ],
  },
  {
    id: "g-gh", options: ["g", "gh"],
    words: [
      "cái [gh]ế", "con [g]à", "[g]ấu bông", "[gh]i nhớ", "cái [g]ối", "[g]ọn [g]àng", "cái [g]ương", "[gh]é thăm",
      "bàn [g]ỗ", "con [gh]ẹ", "hạt [g]ạo", "thác [gh]ềnh", "bé [g]ái", "[gh]i bàn", "[g]ửi thư", "[g]õ cửa",
      "[g]ấp áo", "[gh]e thuyền", "con [g]ấu", "[g]ạch đỏ",
    ],
  },
  {
    id: "ng-ngh", options: ["ng", "ngh"],
    words: [
      "con [ng]ựa", "[ngh]e nhạc", "[ng]ôi nhà", "suy [ngh]ĩ", "[ng]ón tay", "[ngh]ỉ hè", "[ng]ủ [ng]on", "[ngh]ệ sĩ",
      "củ [ngh]ệ", "[ng]ày mai", "[ng]ọn núi", "[ngh]ề [ngh]iệp", "[ng]ã ba", "bắp [ng]ô", "con [ngh]é", "con [ng]ỗng",
      "[ng]ồi học", "[ngh]iêng đầu", "[ng]ọt ngào", "[ngh]ìn sao",
    ],
  },
  {
    id: "h-th-kh", options: ["h", "th", "kh"],
    words: [
      "[h]oa [h]ồng", "con [th]ỏ", "con [kh]ỉ", "quả [kh]ế", "[th]ước kẻ", "[h]ọc bài", "[kh]ăn mặt", "[th]ợ mộc",
      "con [h]ổ", "[th]ả diều", "[kh]oai lang", "[h]át hay", "[th]ư viện", "[kh]uôn mặt", "[h]ộp bút", "con [th]uyền",
      "cá [kh]ô", "[h]ạt đậu", "[th]ịt gà", "[h]ành tây", "[th]ơm ngon", "[kh]óm cây", "[th]ỏ thẻ", "[kh]ung ảnh",
    ],
  },
  {
    id: "v-d-gi", options: ["v", "d", "gi"],
    words: [
      "[v]ui [v]ẻ", "con [d]ê", "cái [gi]ỏ", "quyển [v]ở", "[d]ưa hấu", "đôi [gi]ày", "con [v]ịt", "cô [d]ạy",
      "[gi]ó mát", "màu [v]àng", "[d]ũng cảm", "cái [gi]ường", "[v]ẽ tranh", "quả [d]ừa", "[gi]ọt nước", "[v]ườn rau",
      "sợi [d]ây", "[gi]a đình", "con [v]oi", "con [d]ế", "tờ [gi]ấy", "[v]ỗ tay", "[d]òng sông", "[gi]ữ gìn",
    ],
  },
];

/* Lớp 2: r/d/gi và các vần dễ lẫn. Chỗ chấm của vần mang luôn dấu thanh ("ch[ào]"):
   bé điền "ao" rồi đặt dấu — đề bài chỉ nêu "ao hay au". */

export type SpellGroupId2 = "r-d-gi" | "ao-au" | "ai-ay" | "an-ang";

export const SPELL_GROUPS_2: SpellGroupDef[] = [
  {
    id: "r-d-gi", options: ["r", "d", "gi"],
    words: [
      "con [r]ùa", "[r]ửa tay", "[r]ừng xanh", "[r]au muống", "cái [r]ổ", "[r]ực [r]ỡ", "[r]ung chuông", "con [r]ắn",
      "con [d]ao", "[d]ịu [d]àng", "quả [d]ứa", "[d]ế mèn", "[d]ép nhựa", "[d]ạy học", "[d]ỗ [d]ành", "[d]ễ thương",
      "[gi]ọng hát", "[gi]ặt áo", "[gi]ấc ngủ", "[gi]ữa trưa", "học [gi]ỏi", "[gi]ọt mưa", "cái [gi]ếng", "[gi]ận [d]ỗi",
    ],
  },
  {
    id: "ao-au", options: ["ao", "au"], part: "van",
    words: [
      "ngôi s[ao]", "con d[ao]", "b[ảo] vệ", "ch[ào] cờ", "quả t[áo]", "b[áo] tin", "c[ao] lớn", "đ[ào] đất",
      "s[áo] trúc", "cái m[ào] gà", "quả c[au]", "s[au] này", "tô m[àu]", "đ[au] bụng", "ch[áu] ngoan", "cùng nh[au]",
      "r[au] xanh", "l[au] nhà", "t[àu] thuỷ", "s[áu] tuổi", "m[au] lẹ", "con s[áo]",
    ],
  },
  {
    id: "ai-ay", options: ["ai", "ay"], part: "van",
    words: [
      "c[ái] ghế", "m[ai] mốt", "h[ai] tay", "tr[ái] cây", "con n[ai]", "ch[ai] nước", "b[ài] học", "l[ái] xe",
      "t[ai] nghe", "bên ph[ải]", "m[áy] b[ay]", "bàn t[ay]", "nh[ảy] dây", "ch[ạy] bộ", "h[ay] lắm", "x[ay] lúa",
      "d[ạy] học", "ớt c[ay]", "m[ay] áo", "ngủ s[ay]",
    ],
  },
  {
    id: "an-ang", options: ["an", "ang"], part: "van",
    words: [
      "b[àn] học", "hoa l[an]", "b[ạn] bè", "s[àn] nhà", "đ[àn] gà", "th[an] củi", "c[an] nước",
      "b[ảng] đen", "s[áng] sớm", "màu v[àng]", "tr[ang] sách", "l[àng] quê", "c[àng] cua", "h[àng] cây", "cây b[àng]",
      "h[ạn] hán", "l[ang] thang", "cái th[ang]",
    ],
  },
];

export const SPELL_PER_BLOCK = 16;

/** "[c]on [c]á" → các phần chữ/chỗ chấm. */
export function parseSpell(word: string): Extract<Item, { kind: "spell" }>["parts"] {
  const parts: Extract<Item, { kind: "spell" }>["parts"] = [];
  for (const m of word.matchAll(/\[([^\]]+)\]|([^[]+)/g)) {
    if (m[1]) parts.push({ blank: m[1] });
    else parts.push({ text: m[2] });
  }
  return parts;
}

export const spellLabel = (g: SpellGroupDef) =>
  g.options.length === 2 ? `${g.options[0]} / ${g.options[1]}` : g.options.join(" / ");

function spellTitle(g: SpellGroupDef): string {
  const o = g.options.map((x) => `<b>${escapeHtml(x)}</b>`);
  const list = o.length === 2 ? `${o[0]} hay ${o[1]}` : `${o.slice(0, -1).join(", ")} hay ${o[o.length - 1]}`;
  return `Điền ${list} vào chỗ chấm.`;
}

/* ═══════════════ Sinh phiếu ═══════════════ */

export type DailySubject = "toan" | "tieng-viet";

export type DailyGrade = 1 | 2;

export interface DailyOptions {
  /** Mặc định lớp 1 (phiếu cũ giữ nguyên seed). */
  grade?: DailyGrade;
  subject: DailySubject;
  range: MathRange;          // chỉ dùng cho Toán
  blockIds: string[];        // MathBlockId[] hoặc SpellGroupId[]
  count: number;             // số phiếu
  seed: string;
}

/** Các bài Toán dùng được: lớp 1 theo phạm vi đang chọn (sơ đồ tách–gộp chỉ đến 10), lớp 2 cố định. */
export const mathBlocksFor = (range: MathRange, grade: DailyGrade = 1) =>
  grade === 2 ? MATH_BLOCKS_2 : MATH_BLOCKS.filter((b) => !b.maxRange || range <= b.maxRange);

export const spellGroupsFor = (grade: DailyGrade = 1) => (grade === 2 ? SPELL_GROUPS_2 : SPELL_GROUPS);

function mathSheet(r: Rng, range: MathRange, ids: string[], grade: DailyGrade): DailySheet {
  const blocks = mathBlocksFor(range, grade).filter((b) => ids.includes(b.id)).map((def) => {
    const seen = new Set<string>();
    const items: Item[] = [];
    for (let i = 0; i < def.count; i++) {
      let it = def.make(r, range);
      for (let t = 0; t < 50 && seen.has(JSON.stringify(it)); t++) it = def.make(r, range);
      seen.add(JSON.stringify(it));
      items.push(it);
    }
    return { title: def.title, perRow: def.perRow, items };
  });
  return { blocks };
}

function spellSheet(r: Rng, ids: string[], grade: DailyGrade): DailySheet {
  const blocks = spellGroupsFor(grade).filter((g) => ids.includes(g.id)).map((g) => ({
    title: spellTitle(g),
    perRow: 4,
    items: shuffle(r, g.words).slice(0, SPELL_PER_BLOCK).map((w): Item => ({ kind: "spell", parts: parseSpell(w) })),
  }));
  return { blocks };
}

export function buildDailySheets(o: DailyOptions): DailySheet[] {
  const grade = o.grade ?? 1;
  return Array.from({ length: o.count }, (_, i) => {
    // Lớp 1 giữ nguyên chuỗi seed cũ để phiếu đã quen không đổi.
    const g = grade === 1 ? "" : `|lop${grade}`;
    const r = mulberry32(seedFrom(`ngay${g}|${o.subject}|${o.range}|${o.blockIds.join(",")}|${o.seed}|${i}`));
    return o.subject === "toan" ? mathSheet(r, o.range, o.blockIds, grade) : spellSheet(r, o.blockIds, grade);
  });
}

/* ═══════════════ Xuất HTML (Word .doc / in PDF) ═══════════════ */

const DOTS = "……";

function cellHtml(c: Cell, filled: boolean, inBond = false): string {
  if ("text" in c) return inBond ? `<td class="bx">${escapeHtml(c.text)}</td>` : `<td class="v">${escapeHtml(c.text)}</td>`;
  return `<td class="bx">${filled ? `<span class="key">${escapeHtml(c.box)}</span>` : "&nbsp;"}</td>`;
}

function itemHtml(it: Item, filled: boolean): string {
  switch (it.kind) {
    case "inline":
      return `<table class="it"><tr>${it.cells.map((c) => cellHtml(c, filled)).join("")}</tr></table>`;
    case "bond":
      return (
        `<table class="bond">` +
        `<tr><td class="g"></td>${cellHtml(it.top, filled, true)}<td class="g"></td></tr>` +
        `<tr><td class="sl">/</td><td class="g"></td><td class="sl">\\</td></tr>` +
        `<tr>${cellHtml(it.left, filled, true)}<td class="g"></td>${cellHtml(it.right, filled, true)}</tr>` +
        `</table>`
      );
    case "order": {
      const asc = [...it.nums].sort((a, b) => a - b).join(", ");
      const desc = [...it.nums].sort((a, b) => b - a).join(", ");
      const line = (label: string, ans: string) =>
        `<p class="ol">(${label}): ${filled ? `<span class="key">${ans}</span>` : "………………………"}</p>`;
      return `<p class="on">${it.nums.join("&nbsp;&nbsp;&nbsp;")}</p>` + line("từ bé đến lớn", asc) + line("từ lớn đến bé", desc);
    }
    case "spell":
      return `<span class="sp">${it.parts
        .map((p) => ("text" in p ? escapeHtml(p.text) : filled ? `<span class="key">${escapeHtml(p.blank)}</span>` : DOTS))
        .join("")}</span>`;
  }
}

function blockHtml(b: Block, n: number, filled: boolean, decor = false): string {
  const rows: string[] = [];
  for (let i = 0; i < b.items.length; i += b.perRow) {
    const cells = b.items.slice(i, i + b.perRow).map((it) => `<td>${itemHtml(it, filled)}</td>`);
    while (cells.length < b.perRow) cells.push("<td></td>");
    rows.push(`<tr>${cells.join("")}</tr>`);
  }
  const w = Math.floor(100 / b.perRow);
  return (
    `<p class="bt">${decor ? artImg(bulletArt(n - 1), 24, "bul") : ""}<b>Bài ${n}:</b> ${b.title}</p>` +
    `<table class="grid"><colgroup>${`<col width="${w}%"/>`.repeat(b.perRow)}</colgroup>${rows.join("")}</table>`
  );
}

export interface DailyHtmlOptions {
  title: string;        // VD "Phiếu luyện Toán lớp 1"
  withAnswers: boolean;
  autoPrint?: boolean;
  /** Dòng nhỏ cuối mỗi phiếu, VD tên miền của web. */
  footer?: string;
  /** Hình vui nhộn (mặt trời, cú mèo, hoa…) ở đầu phiếu và cạnh tên bài; trang đáp án vẫn để trơn. */
  decor?: boolean;
}

/** Cặp hình hai bên tiêu đề, đổi theo số phiếu cho đỡ giống nhau. */
const HEADER_ART: [ArtName, ArtName][] = [["owl", "sun"], ["pencil", "flower"], ["apple", "star"], ["cloud", "owl"]];

export function buildDailySheetHtml(sheets: DailySheet[], o: DailyHtmlOptions): string {
  const head = (i: number) => {
    const h = `<h1>${escapeHtml(o.title.toUpperCase())}${sheets.length > 1 ? ` – SỐ ${i + 1}` : ""}</h1>`;
    return (
      (o.decor ? decoratedHeader(h, ...HEADER_ART[i % HEADER_ART.length], 56) : h) +
      `<p class="who">Họ và tên: …………………………………………… Ngày: ……/……/………</p>`
    );
  };
  const foot = o.footer
    ? `<p class="ft">${o.decor ? artImg("flower", 18, "bul") : ""}${escapeHtml(o.footer)}${o.decor ? ` ${artImg("star", 18, "bul")}` : ""}</p>`
    : "";

  const pages = sheets.map((s, i) =>
    `<div class="${i ? "pb" : ""}">${head(i)}${s.blocks.map((b, k) => blockHtml(b, k + 1, false, o.decor)).join("")}${foot}</div>`,
  );
  const answers = o.withAnswers
    ? sheets.map((s, i) =>
        `<div class="pb"><h1>ĐÁP ÁN${sheets.length > 1 ? ` – PHIẾU SỐ ${i + 1}` : ""}</h1>` +
        `<p class="meta">(Dành cho thầy cô, phụ huynh)</p>${s.blocks.map((b, k) => blockHtml(b, k + 1, true)).join("")}</div>`,
      )
    : [];

  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"/>
<title>${escapeHtml(o.title)}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 15pt; color: #000; padding: 20px; max-width: 780px; margin: 0 auto; }
  h1 { font-size: 17pt; text-align: center; margin: 0 0 6px; color: #b91c1c; }
  .meta { text-align: center; font-style: italic; font-size: 12pt; margin: 0 0 8px; }
  .who { margin: 4px 0 10px; }
  .bt { margin: 14px 0 6px; color: #b91c1c; }
  .bt b { color: #b91c1c; }
  .grid { width: 100%; border-collapse: collapse; }
  .grid > tbody > tr > td, .grid > tr > td { padding: 6px 4px; vertical-align: top; }
  .it { border-collapse: collapse; }
  .it td { padding: 0 3px; text-align: center; }
  .v { font-size: 15pt; }
  .bx { border: 1.5px solid #000; width: 30px; min-width: 30px; height: 28px; text-align: center; font-size: 15pt; }
  .bond { border-collapse: collapse; margin: 0 auto; }
  .bond td { text-align: center; padding: 0; }
  .bond .g { width: 22px; }
  .bond .sl { font-size: 18pt; line-height: 18pt; height: 22px; }
  .on { margin: 0 0 2px; letter-spacing: 1px; }
  .ol { margin: 0 0 2px; font-size: 13pt; font-style: italic; }
  .sp { font-size: 14pt; white-space: nowrap; }
  .key { color: #c00; font-weight: bold; text-decoration: underline; }
  .ft { margin-top: 18px; text-align: center; font-size: 10pt; color: #777; }
  .pb { page-break-before: always; }
  @media print { body { padding: 0; } }${o.decor ? ART_CSS : ""}
</style></head>
<body>
${pages.join("")}${answers.join("")}
${o.autoPrint ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.focus();window.print();},200);});</script>` : ""}
</body></html>`;
}
