// scripts/ai-sheet-export.ts — xuất bản Word (.doc) của phiếu hoạt động AI để bán / gửi thầy cô.
// Trên web chỉ có In / lưu PDF; bản Word chỉnh sửa được thì xuất bằng script này.
// Mỗi khối: 1 file cả 12 tiết + 12 file lẻ, đều kèm trang thầy cô.
// Chạy: npx tsx scripts/ai-sheet-export.ts <thư-mục-đích>

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AI_GRADES, buildAiSheetHtml } from "../lib/aiSheets";

const out = process.argv[2];
if (!out) { console.error("Cách dùng: npx tsx scripts/ai-sheet-export.ts <thư-mục-đích>"); process.exit(1); }

for (const g of AI_GRADES) {
  const dir = join(out, `hoat-dong-ai-lop-${g.grade}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `hoat-dong-ai-lop-${g.grade}-ca-nam.doc`), buildAiSheetHtml(g.grade, g.sheets, { withTeacher: true }));
  for (const s of g.sheets)
    writeFileSync(join(dir, `tiet-${String(s.no).padStart(2, "0")}.doc`), buildAiSheetHtml(g.grade, [s], { withTeacher: true }));
  console.log(`Lớp ${g.grade}: ${g.sheets.length + 1} file → ${dir}`);
}
