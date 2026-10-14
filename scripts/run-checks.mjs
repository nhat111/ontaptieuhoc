// scripts/run-checks.mjs — chạy lần lượt mọi script kiểm tra nội dung tự sinh
// (scripts/*-check.ts: Toán tự sinh, phiếu hằng ngày, phiếu AI, trò chơi…).
// Script mới chỉ cần đặt tên đuôi "-check.ts" là được chạy theo. Dùng trong `npm run check`.

import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter((f) => f.endsWith("-check.ts")).sort();
let failed = 0;
for (const f of files) {
  console.log(`\n▶ ${f}`);
  const r = spawnSync(process.execPath, ["--import", "tsx", path.join(dir, f)], { stdio: "inherit" });
  if (r.status !== 0) failed++;
}
console.log(failed ? `\n✗ ${failed}/${files.length} script kiểm tra lỗi` : `\n✓ ${files.length} script kiểm tra đều qua`);
process.exit(failed ? 1 : 0);
