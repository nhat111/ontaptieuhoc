// Nhiệm vụ mỗi ngày: chuỗi ngày, chọn bài và sticker đều tính lại từ tiến độ trên máy —
// sai ở đây thì bé mất chuỗi hay mất sticker mà không ai biết vì sao.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays, bestStreak, currentStreak, isDay, lessonStars, missionDays, missionKey, nextStarSticker, pickBai, schoolYearFraction,
  starsFor, STICKERS, stickerUnlocked, vnDate, type MissionBai,
} from "../lib/mission";
import type { LessonProgressMap } from "../lib/lessonProgress";

const rec = (best: number, attempts = 1) => ({ best, last: best, attempts });

test("ngày theo giờ Việt Nam: 23 giờ UTC đã sang ngày mới ở Việt Nam", () => {
  assert.equal(vnDate(new Date("2026-10-26T23:30:00Z")), "2026-10-27");
  assert.equal(vnDate(new Date("2026-10-26T16:59:00Z")), "2026-10-26");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2027-03-01", -1), "2027-02-28");
  assert.ok(isDay("2026-10-27"));
  assert.ok(!isDay("2026-02-30"));
  assert.ok(!isDay("27/10/2026"));
});

test("chuỗi ngày: đếm lùi từ hôm nay, hôm nay chưa làm thì chuỗi hôm qua vẫn còn", () => {
  const p: LessonProgressMap = {
    [missionKey(3, "2026-10-24")]: rec(60),
    [missionKey(3, "2026-10-25")]: rec(100),
    [missionKey(2, "2026-10-26")]: rec(20), // lớp khác vẫn tính, điểm thấp vẫn tính
    "nv-3-2026-10-20": rec(80, 0),         // chưa nộp lần nào → không tính
    "kntt-toan-3-15": rec(90),             // bài thường → không phải nhiệm vụ
  };
  const days = missionDays(p);
  assert.deepEqual([...days].sort(), ["2026-10-24", "2026-10-25", "2026-10-26"]);
  assert.equal(currentStreak(days, "2026-10-26"), 3);
  assert.equal(currentStreak(days, "2026-10-27"), 3, "hôm nay chưa làm, chuỗi chưa đứt");
  assert.equal(currentStreak(days, "2026-10-28"), 0);
  assert.equal(bestStreak(new Set(["2026-10-01", "2026-10-02", "2026-10-05", "2026-10-06", "2026-10-07"])), 3);
});

test("chọn bài: bài xa nhất đã làm; chưa làm bài nào thì theo thời điểm trong năm học", () => {
  const list: MissionBai[] = Array.from({ length: 40 }, (_, i) => ({ so: i + 1, label: `Bài ${i + 1}`, ten: "", key: `kntt-toan-3-${i + 1}` }));
  assert.deepEqual(pickBai(list, { "kntt-toan-3-7": rec(50), "kntt-toan-3-3": rec(100) }, "2026-10-27"), { bai: list[6], from: "progress" });
  assert.equal(pickBai(list, {}, "2026-09-05")!.bai.so, 1);
  assert.equal(pickBai(list, {}, "2027-05-30")!.bai.so, 40);
  assert.equal(pickBai(list, {}, "2026-07-15")!.bai.so, 40, "hè: ôn cuối năm");
  const mid = pickBai(list, {}, "2027-01-10")!.bai.so;
  assert.ok(mid > 15 && mid < 30, `giữa năm: ${mid}`);
  assert.equal(schoolYearFraction("2026-09-05"), 0);
  assert.equal(pickBai([], {}, "2026-10-27"), null);
});

test("sao: cùng mốc với trang kết quả, mỗi bài tính một lần theo điểm tốt nhất", () => {
  assert.deepEqual([49, 50, 69, 70, 84, 85, 100].map(starsFor), [0, 1, 1, 2, 2, 3, 3]);
  assert.equal(lessonStars({ a: rec(100), b: rec(72), c: rec(30), d: rec(90, 0) }), 5);
});

test("sticker: mốc tăng dần, mở theo sao hoặc theo chuỗi dài nhất, không mất khi đứt chuỗi", () => {
  const starNeeds = STICKERS.flatMap((s) => ("stars" in s.need ? [s.need.stars] : []));
  assert.deepEqual(starNeeds, [...starNeeds].sort((a, b) => a - b));
  assert.equal(new Set(STICKERS.map((s) => s.id)).size, STICKERS.length);
  const rocket = STICKERS.find((s) => s.id === "rocket")!;
  assert.ok(stickerUnlocked(rocket, 0, 7));
  assert.ok(!stickerUnlocked(rocket, 999, 6));
  assert.deepEqual(nextStarSticker(0), { sticker: STICKERS[0], missing: 1 });
  assert.equal(nextStarSticker(10_000), null);
});
