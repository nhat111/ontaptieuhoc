// lib/missionRows.ts — phía server: danh sách bài và câu hỏi của nhiệm vụ mỗi ngày (lib/mission.ts).
// Tách riêng vì kéo theo bộ sinh câu (nặng), trang /nhiem-vu phía trình duyệt không cần.

import { buildWorksheetQuestions, type GenQuestionRow } from "./mathGen";
import { MISSION_SIZE, type MissionBai } from "./mission";
import { baiLabel, sgkLessons, sgkProgressKey, sgkReady, sgkSpecs } from "./sgk";

/** Các bài Toán theo sách của lớp làm được trên máy, theo thứ tự sách. */
export function missionBaiList(grade: number): MissionBai[] {
  return sgkLessons(grade)
    .filter(({ lesson }) => sgkReady(grade, lesson))
    .map(({ lesson }) => ({ so: lesson.so, label: baiLabel(lesson), ten: lesson.ten, key: sgkProgressKey(grade, lesson.so) }));
}

/** Câu bài chính / câu ôn: bài đang học chiếm phần lớn, phần còn lại ôn hai bài liền trước. */
const MAIN = 3;

/**
 * 5 câu của nhiệm vụ ngày `day`, bài chính `so`. Cùng lớp + bài + ngày → cùng bộ câu,
 * nên link thách bạn mở lại đúng nhiệm vụ đó. Trả về null nếu bài không có / chưa làm được.
 */
export function buildMissionRows(grade: number, so: number, day: string): { rows: GenQuestionRow[]; bai: MissionBai; review: MissionBai[] } | null {
  const list = missionBaiList(grade);
  const i = list.findIndex((b) => b.so === so);
  if (i < 0) return null;
  const lessons = new Map(sgkLessons(grade).map(({ lesson }) => [lesson.so, lesson]));
  const specsOf = (b: MissionBai) => sgkSpecs(grade, lessons.get(b.so)!);
  const review = list.slice(Math.max(0, i - 2), i);

  const seed = `nv|${grade}|${so}|${day}`;
  if (!review.length) return { rows: buildWorksheetQuestions(specsOf(list[i]), MISSION_SIZE, seed), bai: list[i], review };

  const reviewSpecs = review.flatMap(specsOf).filter((s, k, all) => all.findIndex((x) => x.id === s.id) === k);
  const main = buildWorksheetQuestions(specsOf(list[i]), MAIN, `${seed}|bai`);
  const extra = buildWorksheetQuestions(reviewSpecs, MISSION_SIZE - MAIN + 2, `${seed}|on`)
    .filter((r) => !main.some((m) => m.content === r.content && m.options.join() === r.options.join()))
    .slice(0, MISSION_SIZE - MAIN);
  return { rows: [...main, ...extra], bai: list[i], review };
}
