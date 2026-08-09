"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { stopSpeaking, isSpeechSupported, speakSegments, type SpeakSegment } from "@/lib/speech";

interface Props {
  segments: SpeakSegment[];
  /** Nhãn phụ cạnh icon, bỏ trống thì chỉ hiện icon. */
  label?: string;
  className?: string;
}

/**
 * Nút 🔊 đọc nội dung thành tiếng. Bấm lần nữa (hoặc rời trang) thì dừng.
 * Ẩn hẳn khi trình duyệt không hỗ trợ, thay vì hiện nút bấm không ăn thua.
 */
export default function SpeakButton({ segments, label, className = "" }: Props) {
  const [speaking, setSpeaking] = useState(false);

  // Server không có `window.speechSynthesis` nên phải trả false lúc SSR, không
  // thì lệch hydration. Khả năng này không đổi trong vòng đời trang nên
  // subscribe là hàm rỗng.
  const supported = useSyncExternalStore(
    () => () => {},
    () => isSpeechSupported(),
    () => false
  );

  // Dừng đọc khi component biến mất (chuyển câu, rời trang).
  useEffect(() => () => stopSpeaking(), []);

  if (!supported) return null;

  function handleClick() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakSegments(segments, { onEnd: () => setSpeaking(false) });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={speaking ? "Dừng đọc" : "Nghe đọc"}
      title={speaking ? "Dừng đọc" : "Nghe đọc"}
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors ${
        speaking
          ? "border-orange-300 bg-orange-50 text-orange-600"
          : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
      } ${className}`}
    >
      {speaking ? (
        // Ô vuông "dừng"
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <rect x="5" y="5" width="10" height="10" rx="1.5" />
        </svg>
      ) : (
        // Loa + sóng âm
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
          <path strokeLinecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
        </svg>
      )}
      {label && <span>{speaking ? "Dừng" : label}</span>}
    </button>
  );
}
