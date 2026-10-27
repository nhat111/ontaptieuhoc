// lib/similarRows.ts — phía server: "câu tương tự" cho Sổ câu sai (lib/wrongBook.ts).
// Một câu tự sinh mang `src` = `<id bài>#<thứ tự dạng>`; từ đó lấy lại đúng hàm sinh câu của
// dạng đó và sinh câu mới cùng kiểu, số khác. Tách khỏi lib/wrongBook.ts vì kéo theo bộ sinh câu.

import { toQuestionRow, type GenQuestionRow } from "./mathGen";
import { mulberry32, seedFrom } from "./mathGen/core";
import { sgkSpecById } from "./sgk";

export const SRC_RE = /^([a-z0-9-]{3,40})#(\d{1,2})$/;

/** Dạng câu còn sinh được (bài vẫn có, dạng vẫn ở vị trí đó), kèm link về bài. */
export function resolveSrc(src: string) {
  const m = SRC_RE.exec(src);
  if (!m) return null;
  const found = sgkSpecById(m[1]);
  const gi = Number(m[2]);
  const mix = found?.spec.mix[gi];
  if (!found || !mix) return null;
  // Các dạng khác của cùng bài: dùng để bù khi dạng này hết câu mới (bài âm đầu lớp 1 chỉ có vài tiếng).
  const siblings = found.spec.mix.map(([g], k) => ({ gen: g, src: `${m[1]}#${k}` })).filter((_, k) => k !== gi);
  return { gen: mix[0], title: found.spec.title, href: found.href, siblings };
}

/** `total` câu chia đều cho các dạng; mỗi dạng không lặp câu. Cùng seed → cùng bộ. */
export function similarRows(srcs: string[], total: number, seed: string): GenQuestionRow[] {
  const ok = [...new Set(srcs)].map((s) => ({ src: s, x: resolveSrc(s) })).filter((d) => !!d.x);
  if (!ok.length || total <= 0) return [];
  const r = mulberry32(seedFrom(`tuongtu|${ok.map((d) => d.src).join(",")}|${total}|${seed}`));
  const seen = new Set<string>();
  const key = (q: GenQuestionRow) => q.content + "\u0000" + q.options.join("\u0000");
  const rows: GenQuestionRow[] = [];
  ok.forEach(({ src, x }, i) => {
    const n = Math.floor(total / ok.length) + (i < total % ok.length ? 1 : 0);
    for (let k = 0; k < n; k++) {
      let row = toQuestionRow(x!.gen(r), r);
      let from = src;
      for (let t = 0; t < 30 && seen.has(key(row)); t++) row = toQuestionRow(x!.gen(r), r);
      // Dạng đã hết câu mới: bù bằng dạng khác của cùng bài (vẫn là bài con làm sai).
      for (let t = 0; t < 60 && seen.has(key(row)) && x!.siblings.length; t++) {
        const sib = x!.siblings[t % x!.siblings.length];
        row = toQuestionRow(sib.gen(r), r);
        from = sib.src;
      }
      if (seen.has(key(row))) continue; // cả bài ít câu: thà bớt một câu còn hơn lặp
      seen.add(key(row));
      rows.push({ ...row, src: from, srcTitle: x!.title });
    }
  });
  return rows;
}
