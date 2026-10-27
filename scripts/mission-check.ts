// scripts/mission-check.ts — nhiệm vụ mỗi ngày (lib/missionRows.ts): mọi bài làm được của Toán
// lớp 1–5, vài ngày trong năm học → đủ 5 câu khác nhau, đáp án chấm đúng, cùng ngày ra cùng bộ,
// và mọi khung sticker có hình.
//
// Chạy: npx tsx scripts/mission-check.ts

import { MISSION_GRADES, MISSION_SIZE, STICKERS } from "../lib/mission";
import { buildMissionRows, missionBaiList } from "../lib/missionRows";
import { rowToQuestion } from "../lib/quickExam";
import { scoreAnswer } from "../lib/quizData";
import { STICKER_ART } from "../lib/stickerArt";

let failures = 0;
const fail = (where: string, msg: string) => { if (++failures <= 20) console.log(`✗ ${where}: ${msg}`); };
const DAYS = ["2026-09-08", "2026-10-27", "2027-01-15", "2027-04-02"];
let sets = 0;

for (const g of MISSION_GRADES) {
  const list = missionBaiList(g);
  if (list.length < 10) fail(`lớp ${g}`, `chỉ có ${list.length} bài làm được`);
  for (const b of list) {
    for (const day of DAYS) {
      const x = buildMissionRows(g, b.so, day);
      const where = `lớp ${g} ${b.label} ${day}`;
      if (!x) { fail(where, "không dựng được"); continue; }
      sets++;
      if (x.rows.length !== MISSION_SIZE) fail(where, `${x.rows.length} câu`);
      if (new Set(x.rows.map((r) => r.content + "\u0000" + r.options.join("\u0000"))).size !== x.rows.length) fail(where, "có câu lặp");
      x.rows.forEach((r, i) => {
        const q = rowToQuestion(r, i + 1);
        const answer = q.type === "short" ? q.correctAnswer.split("|")[0] : q.correctAnswer;
        if (!scoreAnswer(q, answer)) fail(where, `câu ${i + 1} chấm sai đáp án đúng: ${r.content}`);
      });
      if (JSON.stringify(buildMissionRows(g, b.so, day)) !== JSON.stringify(x)) fail(where, "cùng ngày ra bộ khác");
    }
  }
}
if (buildMissionRows(3, 99999, DAYS[0])) fail("bài lạ", "phải trả null");
for (const s of STICKERS) if (!STICKER_ART[s.id]?.startsWith("data:image/svg+xml")) fail("sticker", `thiếu hình ${s.id}`);

console.log(failures ? `✗ ${failures} lỗi` : `✓ Nhiệm vụ: ${sets} bộ (5 lớp × mọi bài × ${DAYS.length} ngày) đều đủ ${MISSION_SIZE} câu, chấm đúng, cố định theo ngày; ${STICKERS.length} sticker có hình`);
process.exit(failures ? 1 : 0);
