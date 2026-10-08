// Đề nào có nút đọc to (Nghe / Nghe cả bài), đề nào có lối vào "Gắn giọng đọc".
//
// Đọc to dành cho bé CHƯA ĐỌC THẠO (lớp 1–2) và cho đề Tiếng Anh (nghe phát âm).
// Lớp 3–5 môn khác bé đã tự đọc được, mà giọng máy đọc "6 - ___ = 5" hay "3,75 m²"
// còn khó nghe hơn đọc chữ — nên ẩn đi cho gọn.
//
// "Gắn giọng đọc" (/import/giong-doc) là công cụ của người soạn đề, chỉ đáng làm
// cho đề Tiếng Anh; hiện nó trên đề Toán chỉ khiến phụ huynh bấm nhầm sang khu soạn đề.

export const ENGLISH_SUBJECT = "Tiếng Anh"; // khớp lib/subjects.ts

export function isEnglishSubject(subject?: string | null): boolean {
  return subject === ENGLISH_SUBJECT;
}

/**
 * Có hiện nút đọc to cho đề này không.
 * `hasAudioFiles`: người soạn đã cố tình gắn giọng cho đề → luôn tôn trọng.
 * Không rõ lớp (dữ liệu cũ thiếu join) → giữ như trước, tức là vẫn hiện.
 */
export function readAloudEnabled(
  grade: number | null | undefined,
  subject: string | null | undefined,
  hasAudioFiles = false,
): boolean {
  if (hasAudioFiles || isEnglishSubject(subject)) return true;
  if (!grade) return true;
  return grade <= 2;
}

/** Có hiện lối vào "Gắn giọng đọc" trên trang làm bài không. */
export function canAttachVoice(subject: string | null | undefined): boolean {
  return isEnglishSubject(subject);
}
