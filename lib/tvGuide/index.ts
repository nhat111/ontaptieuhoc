// lib/tvGuide/index.ts — hướng dẫn cách làm bài Tiếng Việt theo chủ điểm, mỗi lớp một file.
// Trang /lop/[grade] (tab Tiếng Việt, Bài tập) chỉ đọc danh sách này.

import { TV_GUIDE_3 } from "./lop3";
import { TV_GUIDE_4 } from "./lop4";
import { TV_GUIDE_5 } from "./lop5";
import type { TvBai, TvBaiRef, TvChuDiem, TvGuide, TvSkill } from "./types";

export type { TvBai, TvChuDiem, TvGuide, TvSkill } from "./types";

export const TV_GUIDES: TvGuide[] = [TV_GUIDE_3, TV_GUIDE_4, TV_GUIDE_5];

export function tvGuide(grade: number): TvGuide | null {
  return TV_GUIDES.find((g) => g.grade === grade) ?? null;
}

/** Các id dạng bài của một mục (một hoặc nhiều). */
export function kyOf(ref: TvBaiRef): string[] {
  return typeof ref.ky === "string" ? [ref.ky] : ref.ky;
}

/** Các bài thuộc một chủ điểm, theo thứ tự sách. */
export function baiOf(g: TvGuide, cd: TvChuDiem): TvBai[] {
  return g.bai.filter((b) => b.tap === cd.tap && b.so >= cd.tu && b.so <= cd.den);
}

/** Các dạng bài (không trùng) xuất hiện trong chủ điểm, theo thứ tự gặp trong sách. */
export function skillsOf(g: TvGuide, cd: TvChuDiem): { ltvc: TvSkill[]; viet: TvSkill[] } {
  const ltvc: TvSkill[] = [];
  const viet: TvSkill[] = [];
  for (const b of baiOf(g, cd)) {
    for (const [ref, list] of [[b.ltvc, ltvc], [b.viet, viet]] as const) {
      for (const ky of ref ? kyOf(ref) : []) {
        const s = g.skills[ky];
        if (s && !list.includes(s)) list.push(s);
      }
    }
  }
  return { ltvc, viet };
}
