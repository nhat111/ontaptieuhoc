// Tuỳ chọn làm bài, lưu ở localStorage để lần sau không phải chỉnh lại.
//
// Trả về boolean (không phải object) để dùng thẳng với useSyncExternalStore:
// snapshot kiểu nguyên thuỷ so sánh theo giá trị, khỏi phải cache tham chiếu.

const KEY_SHUFFLE_Q = "ontap_shuffle_questions";
const KEY_SHUFFLE_O = "ontap_shuffle_options";

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

export const getShuffleQuestions = () => read(KEY_SHUFFLE_Q);
export const getShuffleOptions = () => read(KEY_SHUFFLE_O);
export const setShuffleQuestions = (v: boolean) => write(KEY_SHUFFLE_Q, v);
export const setShuffleOptions = (v: boolean) => write(KEY_SHUFFLE_O, v);
