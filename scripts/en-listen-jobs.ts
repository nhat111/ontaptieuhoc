// scripts/en-listen-jobs.ts — in ra (JSON) mọi hội thoại có thể vào phần Listening của đề
// Tiếng Anh (lib/exam5/tiengAnh.ts): mỗi `qa` của mọi Unit, lớp 3–5. scripts/gen-en-listen-audio.py
// đọc danh sách này để sinh file nghe, nên nội dung chỉ khai báo một chỗ (enContent*.ts).
// Chạy: npx tsx scripts/en-listen-jobs.ts

import { EN } from "../lib/quickExam";
import { listenScript } from "../lib/exam5/tiengAnh";

const seen = new Set<string>();
const jobs: { script: string; a: string; b: string }[] = [];
for (const c of Object.values(EN)) {
  for (const u of c.units) {
    for (const x of u.qa) {
      const script = listenScript(x);
      if (seen.has(script)) continue;
      seen.add(script);
      jobs.push({ script, a: x.q, b: x.a });
    }
  }
}
process.stdout.write(JSON.stringify(jobs, null, 1) + "\n");
