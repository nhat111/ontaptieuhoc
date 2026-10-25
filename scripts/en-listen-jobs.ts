// scripts/en-listen-jobs.ts — in ra (JSON) mọi thứ cần file đọc sẵn trong đề Tiếng Anh
// (lib/exam5/tiengAnh.ts), lớp 3–5: hội thoại của phần Listening (mỗi `qa` của mọi Unit) và bài
// đọc của phần Reading. scripts/gen-en-listen-audio.py đọc danh sách này để sinh file, nên nội dung
// chỉ khai báo một chỗ (enContent*.ts).
// Chạy: npx tsx scripts/en-listen-jobs.ts

import { EN } from "../lib/quickExam";
import { listenScript, passageKey } from "../lib/exam5/tiengAnh";

const seen = new Set<string>();
const dialogues: { script: string; a: string; b: string }[] = [];
const passages: { key: string; title: string; text: string }[] = [];
for (const c of Object.values(EN)) {
  for (const u of c.units) {
    for (const x of u.qa) {
      const script = listenScript(x);
      if (seen.has(script)) continue;
      seen.add(script);
      dialogues.push({ script, a: x.q, b: x.a });
    }
  }
  for (const p of c.passages) {
    const key = passageKey(p);
    if (seen.has(key)) continue;
    seen.add(key);
    passages.push({ key, title: p.title, text: p.text });
  }
}
process.stdout.write(JSON.stringify({ dialogues, passages }, null, 1) + "\n");
