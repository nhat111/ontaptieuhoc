// Tuỳ chọn làm bài, lưu ở localStorage để lần sau không phải chỉnh lại.
//
// Trả về boolean (không phải object) để dùng thẳng với useSyncExternalStore:
// snapshot kiểu nguyên thuỷ so sánh theo giá trị, khỏi phải cache tham chiếu.

const KEY_SHUFFLE_Q = "ontap_shuffle_questions";
const KEY_SHUFFLE_O = "ontap_shuffle_options";
const KEY_CLOUD_ON = "ontap_cloud_voice";
const KEY_CLOUD_VOICE = "ontap_cloud_voice_name";

const listeners = new Set<() => void>();

export function subscribeQuizPrefs(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function read(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function write(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {/* ignore */}
  listeners.forEach((l) => l());
}

/**
 * Giọng đám mây bật sẵn khi máy chủ có cấu hình key: người vào nghe đề tiếng
 * Anh muốn giọng chuẩn ngay, không phải mò bật. Nên đọc theo kiểu "khác '0' là
 * bật" thay vì "bằng '1' là bật" như các tuỳ chọn còn lại.
 */
export function getCloudVoiceOn(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY_CLOUD_ON) !== "0";
  } catch {
    return true;
  }
}

export function setCloudVoiceOn(v: boolean) {
  try {
    window.localStorage.setItem(KEY_CLOUD_ON, v ? "1" : "0");
  } catch {/* ignore */}
  listeners.forEach((l) => l());
}

/**
 * Tên giọng đã chọn, "" nghĩa là chưa chọn — lúc đó dùng giọng mặc định do
 * `GET /api/tts` trả về. Không kiểm tra tên ở đây: danh mục giọng phụ thuộc
 * nhà cung cấp nào đang bật, chỉ máy chủ mới biết.
 */
export function getCloudVoice(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(KEY_CLOUD_VOICE) ?? "";
  } catch {
    return "";
  }
}

export function setCloudVoice(v: string) {
  try {
    window.localStorage.setItem(KEY_CLOUD_VOICE, v);
  } catch {/* ignore */}
  listeners.forEach((l) => l());
}

export const getShuffleQuestions = () => read(KEY_SHUFFLE_Q);
export const getShuffleOptions = () => read(KEY_SHUFFLE_O);
export const setShuffleQuestions = (v: boolean) => write(KEY_SHUFFLE_Q, v);
export const setShuffleOptions = (v: boolean) => write(KEY_SHUFFLE_O, v);
