// Âm thanh hiệu ứng cho trò chơi lớp 3, tổng hợp bằng Web Audio — không cần file,
// không tải gì thêm. Chỉ là phần thêm: trình duyệt không có Web Audio thì im lặng.
//
// iOS chỉ cho AudioContext chạy sau một cú chạm: lần đầu gọi `sfx.*` phải nằm trong
// handler của cú chạm (nút Bắt đầu). Sau đó gọi từ timer cũng được.
// Tắt / bật tiếng lưu ở localStorage (`ontap_sfx_muted`), đọc qua useSyncExternalStore.
//
// iOS: Web Audio mặc định bị gạt im lặng (chuông) chặn hẳn — máy để im lặng thì bật
// tiếng trong game cũng không nghe gì. Safari/WebKit iOS 17+ có Audio Session API:
// đặt `navigator.audioSession.type = "playback"` thì trang phát như trình nghe nhạc,
// không phụ thuộc gạt im lặng. Máy cũ hơn không có API này thì vẫn như trước.

const MUTE_KEY = "ontap_sfx_muted";
const listeners = new Set<() => void>();
let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {/* ignore */}
  listeners.forEach((l) => l());
}

export function subscribeMuted(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** iOS 17+: cho âm thanh của trang phát cả khi máy đang để chế độ im lặng. */
function allowPlaybackWhenSilenced() {
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {/* trình duyệt không có Audio Session API */}
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || isMuted()) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      allowPlaybackWhenSilenced();
      ctx = new AC();
    }
    // "suspended" (chưa có cú chạm) hoặc "interrupted" (iOS sau khi khoá máy, có cuộc gọi).
    if (ctx.state !== "running") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Một nốt: tần số `freq` (Hz) bắt đầu sau `at` giây, dài `dur` giây. */
function tone(freq: number, at: number, dur: number, type: OscillatorType = "sine", gain = 0.18, slideTo?: number) {
  const a = audio();
  if (!a) return;
  const t0 = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  /** Đúng: hai nốt đi lên. `streak` càng cao thì càng cao giọng — nghe "lên tay". */
  ding(streak = 0) {
    const base = 660 * 2 ** (Math.min(streak, 8) / 12);
    tone(base, 0, 0.12, "triangle");
    tone(base * 1.5, 0.08, 0.18, "triangle");
  },
  /** Sai: tiếng "bụp" trầm, ngắn — không doạ bé. */
  buzz() {
    tone(180, 0, 0.22, "square", 0.08, 110);
  },
  /** Bóng nổ. */
  pop() {
    tone(900, 0, 0.08, "triangle", 0.2, 300);
  },
  /** Đếm ngược 3-2-1. */
  tick() {
    tone(520, 0, 0.12, "sine", 0.2);
  },
  /** XUẤT PHÁT! */
  go() {
    tone(1040, 0, 0.35, "sine", 0.22);
  },
  /** Nitro / combo. */
  whoosh() {
    tone(300, 0, 0.35, "sawtooth", 0.06, 1200);
  },
  /** Lật thẻ. */
  flip() {
    tone(1200, 0, 0.05, "sine", 0.08);
  },
  /** Thắng: một đoạn kèn ngắn. */
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.45 : 0.14, "triangle", 0.2));
  },
  /** Thua / hết giờ: hai nốt đi xuống, nhẹ nhàng. */
  lose() {
    tone(440, 0, 0.2, "triangle", 0.15);
    tone(330, 0.18, 0.35, "triangle", 0.15);
  },
};
