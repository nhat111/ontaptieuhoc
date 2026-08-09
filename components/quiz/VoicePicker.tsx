"use client";
import { useSyncExternalStore } from "react";
import {
  getPreferredVoice,
  setPreferredVoice,
  subscribeVoice,
  voicesFor,
  type SpeechLang,
} from "@/lib/speech";

/**
 * Cho người dùng chọn giọng đọc trong số giọng máy có sẵn.
 *
 * Chất lượng giọng phụ thuộc thiết bị và khác nhau rất nhiều — máy có thể có
 * vài giọng cho cùng một ngôn ngữ, hay dở lẫn lộn. Chỉ người nghe mới biết
 * giọng nào ổn, nên đưa ra cho họ chọn thay vì đoán hộ.
 *
 * Tự ẩn khi máy chỉ có một giọng (hoặc không có) — lúc đó không có gì để chọn.
 */
export default function VoicePicker({ lang, label }: { lang: SpeechLang; label: string }) {
  // Danh sách giọng nạp bất đồng bộ; subscribe để hiện ra khi đã có.
  const key = useSyncExternalStore(
    subscribeVoice,
    () => voicesFor(lang).map((v) => v.voiceURI).join("|"),
    () => ""
  );
  const preferred = useSyncExternalStore(
    subscribeVoice,
    () => getPreferredVoice(lang),
    () => null
  );

  const voices = key ? voicesFor(lang) : [];
  if (voices.length < 2) return null;

  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-gray-500">
      {label}
      <select
        value={preferred ?? ""}
        onChange={(e) => setPreferredVoice(lang, e.target.value || null)}
        className="max-w-[9.5rem] rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Tự chọn (đề xuất)</option>
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name}
          </option>
        ))}
      </select>
    </label>
  );
}
