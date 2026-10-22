// scripts/tv-guide-check.ts — kiểm tra hướng dẫn Tiếng Việt theo chủ điểm (lib/tvGuide).
// Chạy: npx tsx scripts/tv-guide-check.ts
//  - bài mỗi tập đánh số liền 1..n, không trùng; chủ điểm phủ đúng mọi bài, không chồng nhau;
//  - bài lẻ có Luyện từ và câu, bài chẵn có phần Nói và nghe / Đọc mở rộng;
//  - mọi `ky` trỏ tới dạng có thật, đúng loại; dạng nào cũng được ít nhất một bài dùng;
//  - từ trong “ ” ở lời giải Luyện từ và câu có nguyên văn trong câu ví dụ;
//  - không có ngoặc kép thẳng trong nội dung.

import { TV_GUIDES, baiOf } from "../lib/tvGuide";

let errors = 0;
const fail = (msg: string) => { errors++; console.error("✗ " + msg); };

for (const g of TV_GUIDES) {
  const tag = `Lớp ${g.grade}`;

  for (const tap of [1, 2] as const) {
    const nums = g.bai.filter((b) => b.tap === tap).map((b) => b.so);
    nums.forEach((n, i) => { if (n !== i + 1) fail(`${tag} tập ${tap}: bài thứ ${i + 1} đánh số ${n}`); });
    const covered = g.chuDiem.filter((c) => c.tap === tap).flatMap((c) => baiOf(g, c).map((b) => b.so));
    if (covered.length !== nums.length || new Set(covered).size !== covered.length) {
      fail(`${tag} tập ${tap}: chủ điểm phủ ${covered.length} bài, sách có ${nums.length}`);
    }
  }
  g.chuDiem.forEach((c, i) => { if (c.so !== i + 1) fail(`${tag}: chủ điểm thứ ${i + 1} đánh số ${c.so}`); });

  const used = new Set<string>();
  for (const b of g.bai) {
    const where = `${tag} tập ${b.tap} bài ${b.so}`;
    if (b.so % 2 === 1 && !b.ltvc) fail(`${where}: bài lẻ thiếu Luyện từ và câu`);
    if (b.so % 2 === 0 && !b.them) fail(`${where}: bài chẵn thiếu Nói và nghe / Đọc mở rộng`);
    for (const [ref, loai] of [[b.ltvc, "ltvc"], [b.viet, "viet"]] as const) {
      if (!ref) continue;
      const s = g.skills[ref.ky];
      if (!s) fail(`${where}: không có dạng “${ref.ky}”`);
      else if (s.loai !== loai) fail(`${where}: “${ref.ky}” là ${s.loai}, cần ${loai}`);
      used.add(ref.ky);
    }
  }

  for (const s of Object.values(g.skills)) {
    if (!used.has(s.id)) fail(`${tag}: dạng “${s.id}” không bài nào dùng`);
    if (s.cachLam.length < 2) fail(`${tag} ${s.id}: cách làm quá ít bước`);
    if (s.loai === "ltvc" && s.viDu?.cau) {
      for (const [, w] of s.viDu.dapAn.matchAll(/“([^”]+)”/g)) {
        if (!s.viDu.cau.includes(w)) fail(`${tag} ${s.id}: “${w}” không có trong câu ví dụ`);
      }
    }
    const text = JSON.stringify([s.laGi, s.cachLam, s.viDu, s.loi]).replace(/\\"/g, "\u0000");
    if (text.includes("\u0000")) fail(`${tag} ${s.id}: có ngoặc kép thẳng, dùng “ ”`);
  }
  for (const c of g.chuDiem) {
    if (c.docHieu.includes('"')) fail(`${tag} chủ điểm ${c.so}: có ngoặc kép thẳng`);
  }

  if (!errors) console.log(`✓ ${tag}: ${g.chuDiem.length} chủ điểm, ${g.bai.length} bài, ${Object.keys(g.skills).length} dạng bài`);
}

process.exit(errors ? 1 : 0);
