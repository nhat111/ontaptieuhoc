// scripts/tv-guide-check.ts — kiểm tra hướng dẫn Tiếng Việt theo chủ điểm (lib/tvGuide).
// Chạy: npx tsx scripts/tv-guide-check.ts
//  - bài mỗi tập đánh số liền 1..n, không trùng; chủ điểm phủ đúng mọi bài, không chồng nhau;
//  - bài lẻ có Luyện từ và câu, bài chẵn có phần Nói và nghe / Đọc mở rộng (trừ tiết dành cho
//    “Bài viết số …”, như Tiếng Việt 5 tập hai bài 6); lớp 3 (`ltvcBai: "chan"`) ngược lại:
//    bài chẵn có Luyện từ và câu, bài lẻ có Kể chuyện / Nói và nghe;
//  - link sang /lam-van/lop-5/<dạng> trỏ tới dạng có thật;
//  - mọi `ky` trỏ tới dạng có thật, đúng loại; dạng nào cũng được ít nhất một bài dùng;
//  - từ trong “ ” ở lời giải Luyện từ và câu có nguyên văn trong câu ví dụ;
//  - không có ngoặc kép thẳng trong nội dung.

import { TV_GUIDES, baiOf, kyOf } from "../lib/tvGuide";
import { guideById } from "../lib/lamVan";

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
    const ltvcParity = g.ltvcBai === "chan" ? 0 : 1;
    if (b.so % 2 === ltvcParity && !b.ltvc) fail(`${where}: thiếu Luyện từ và câu`);
    if (b.so % 2 !== ltvcParity && !b.them && !/Bài viết số/.test(b.viet.ten)) fail(`${where}: thiếu Nói và nghe / Đọc mở rộng`);
    for (const [ref, loai] of [[b.ltvc, "ltvc"], [b.viet, "viet"]] as const) {
      if (!ref) continue;
      for (const ky of kyOf(ref)) {
        const s = g.skills[ky];
        if (!s) fail(`${where}: không có dạng “${ky}”`);
        else if (s.loai !== loai) fail(`${where}: “${ky}” là ${s.loai}, cần ${loai}`);
        used.add(ky);
      }
    }
  }

  for (const s of Object.values(g.skills)) {
    if (!used.has(s.id)) fail(`${tag}: dạng “${s.id}” không bài nào dùng`);
    if (s.cachLam.length < 2) fail(`${tag} ${s.id}: cách làm quá ít bước`);
    const lv = s.link?.href.match(/^\/lam-van\/lop-5\/([a-z-]+)$/);
    if (s.link && (!lv || !guideById(lv[1]))) fail(`${tag} ${s.id}: link không tới trang nào: ${s.link.href}`);
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
