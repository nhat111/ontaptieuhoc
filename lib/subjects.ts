// ─────────────────────────────────────────────────────────────────────────────
// DANH MỤC MÔN HỌC — nguồn sự thật duy nhất của app.
//
// Môn học là dữ liệu cố định nên khai báo thẳng ở đây, không query Supabase.
// Muốn thêm/bớt/đổi tên môn: sửa đúng file này, không cần đụng DB.
//
// QUAN TRỌNG — tên môn ở đây là KHOÁ đối chiếu với cột `subjects.name` trong DB
// (cặp `grade` + `name`). Đổi tên một môn ở đây mà DB vẫn giữ tên cũ thì tab môn
// đó sẽ rỗng, vì không join được sang `chapters`. Khi đổi tên nhớ chạy kèm:
//
//   UPDATE subjects SET name = '<tên mới>' WHERE grade = <lớp> AND name = '<tên cũ>';
//
// Kiểm tra danh sách này có khớp DB không:  node --env-file=.env.local scripts/check-subjects.mjs
// ─────────────────────────────────────────────────────────────────────────────

export const GRADES = [1, 2, 3, 4, 5] as const;

export type Grade = (typeof GRADES)[number];

/** Môn học theo lớp, đúng thứ tự hiển thị trên tab. */
export const SUBJECTS_BY_GRADE: Record<Grade, readonly string[]> = {
  1: ["Toán", "Tiếng Việt", "Tự nhiên & Xã hội"],
  2: ["Toán", "Tiếng Việt", "Đạo đức"],
  3: ["Toán", "Tiếng Việt", "Khoa học"],
  4: ["Toán", "Tiếng Việt", "Khoa học"],
  5: ["Toán", "Tiếng Việt", "Khoa học"],
};

export function isGrade(value: unknown): value is Grade {
  return GRADES.includes(Number(value) as Grade);
}

/** Môn của một lớp; lớp không hợp lệ trả về mảng rỗng. */
export function getSubjects(grade: number): readonly string[] {
  return isGrade(grade) ? SUBJECTS_BY_GRADE[grade] : [];
}

/** Môn mặc định của một lớp (môn đầu tiên) — dùng khi URL không có `?subject=`. */
export function getDefaultSubject(grade: number): string | null {
  return getSubjects(grade)[0] ?? null;
}

/**
 * Chuẩn hoá `?subject=` từ URL về một môn có thật của lớp đó.
 * Tên không khớp (môn đã bị xoá, URL gõ sai) rơi về môn mặc định.
 */
export function resolveSubject(grade: number, name?: string | null): string | null {
  const subjects = getSubjects(grade);
  if (name && subjects.includes(name)) return name;
  return subjects[0] ?? null;
}

/** Mọi cặp (lớp, môn) — dùng cho sitemap. */
export function allGradeSubjectPairs(): { grade: Grade; subject: string }[] {
  return GRADES.flatMap((grade) =>
    SUBJECTS_BY_GRADE[grade].map((subject) => ({ grade, subject }))
  );
}
