"use client";
import { useSyncExternalStore } from "react";
import { missingVoice, subscribeVoice } from "@/lib/speech";

/**
 * Báo khi máy không có giọng đọc tiếng Việt.
 *
 * Không có giọng Việt thì `speakSegments` bỏ hẳn các đoạn tiếng Việt (để giọng
 * Anh không đọc sai dấu cho bé), nên bấm Nghe sẽ không ra tiếng — phải nói lý do
 * và cách cài, không thì phụ huynh tưởng web hỏng. Tự ẩn khi máy có giọng Việt
 * hoặc chưa biết (danh sách giọng chưa nạp).
 */
export default function NoVoiceNotice({ className = "" }: { className?: string }) {
  const missing = useSyncExternalStore(
    subscribeVoice,
    () => missingVoice("vi-VN"),
    () => false
  );
  if (!missing) return null;

  return (
    <div
      role="note"
      className={`rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs leading-relaxed text-amber-800 ${className}`}
    >
      <b>Máy này chưa có giọng đọc tiếng Việt</b>, nên web không đọc phần tiếng Việt
      (giọng nước ngoài đọc sẽ sai dấu). Cách thêm giọng: trên <b>Windows</b> vào Cài đặt →
      Thời gian và ngôn ngữ → Ngôn ngữ → thêm <b>Tiếng Việt</b> (chọn cả “Giọng nói”), rồi mở
      lại trình duyệt — hoặc dùng trình duyệt <b>Microsoft Edge</b>, có sẵn giọng Việt. Trên{" "}
      <b>Android</b> vào Cài đặt → Chuyển văn bản thành giọng nói, chọn công cụ của Google và
      tải dữ liệu giọng Tiếng Việt.
    </div>
  );
}
