// Phát file giọng đọc đã gắn sẵn cho câu hỏi (sinh ngoài bằng Piper, hoặc thu
// âm thật) — xem `/import/giong-doc/[id]`.
//
// Không gọi API nào, không hạn mức, không chờ: file đã nằm sẵn trong kho, ở đây
// chỉ phát lần lượt.
//
// Ba điểm phải giữ khi sửa file này:
//
// 1. iOS chỉ cho phát tiếng nếu `play()` được gọi NGAY trong luồng của cú chạm.
//    Nên `speakAudioFiles` phát một đoạn im lặng cực ngắn ngay lập tức để "mở
//    khoá" thẻ audio. Đừng chèn `await` nào trước lời gọi mở khoá đó.
// 2. Dùng lại ĐÚNG MỘT thẻ audio cho cả vòng đời trang. Mở khoá gắn với thẻ,
//    tạo thẻ mới là mất quyền phát.
// 3. Mọi lượt đọc mang một số thứ tự (`generation`). Bấm dừng là tăng số đó lên,
//    nên lượt cũ đang chạy tự biết mình đã cũ và im lặng thoát.

import { DEFAULT_RATE, stripForSpeech } from "./speech";

/** WAV 8kHz mono, ~5ms im lặng — chỉ để mở khoá audio trên iOS. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

/**
 * Đổi tốc độ của Web Speech (0.55 / 0.7 / 0.9) sang `playbackRate` của thẻ
 * audio, nơi 1.0 mới là bình thường.
 *
 * Biên độ hẹp quanh 1.0: file đã được đọc ở nhịp cố định, kéo giãn nhiều là
 * nghe méo tiếng.
 */
export function mapRateToSpeed(rate: number): number {
  if (!Number.isFinite(rate)) return 1.0;
  if (rate <= 0.6) return 0.85;
  if (rate >= 0.85) return 1.15;
  return 1.0;
}

export type AudioSegment = {
  /** Chỉ dùng để bên gọi biết đang đọc câu nào (cuộn theo, tô sáng…). */
  mark?: number;
  /** File của câu này. Không có thì câu đó bị bỏ qua. */
  url?: string;
};

let audioEl: HTMLAudioElement | null = null;
let generation = 0;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/** Câu nào của đề đã có file gắn sẵn. */
export function audioSegments(
  questions: { audioUrl?: string }[]
): AudioSegment[] {
  return questions.map((q, i) => ({ mark: i, url: q.audioUrl }));
}

/**
 * Phát một file, trả về khi phát xong.
 *
 * Trên iOS sự kiện `ended` KHÔNG phải lúc nào cũng bắn — đúng cái bẫy đã gặp
 * với Web Speech (xem ghi chú `onend` trong lib/speech.ts). Chuỗi đọc chờ
 * `ended` để sang câu sau, nên thiếu nó là đứng luôn ở câu đầu. Vì vậy có thêm
 * hẹn giờ dự phòng tính theo độ dài thật của file.
 */
function playOne(el: HTMLAudioElement, url: string, speed: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let guard: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      el.onended = null;
      el.onerror = null;
      el.onloadedmetadata = null;
      if (guard) clearTimeout(guard);
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const fail = (e: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(e);
    };

    el.onended = finish;
    el.onerror = () => fail(new Error("audio-error"));

    el.onloadedmetadata = () => {
      // Biết độ dài thật rồi thì hẹn giờ sát hơn. Cộng dư 3 giây phòng khi máy
      // phát chậm hơn dự kiến, để không cắt ngang câu đang đọc.
      const d = el.duration;
      if (Number.isFinite(d) && d > 0) {
        if (guard) clearTimeout(guard);
        guard = setTimeout(finish, (d / speed) * 1000 + 3000);
      }
      // iOS đặt lại playbackRate khi nạp nguồn mới, nên đặt lại ở đây.
      el.playbackRate = speed;
    };

    el.src = url;
    el.playbackRate = speed;
    // Phòng cả trường hợp metadata cũng không bao giờ tới.
    guard = setTimeout(finish, 60000);
    el.play().catch((e) => fail(e));
  });
}

export type SpeakAudioOptions = {
  rate?: number;
  onSegmentStart?: (mark: number | undefined) => void;
  onEnd?: () => void;
  /**
   * Đọc xong nhưng có câu bị bỏ qua vì chưa gắn file. Bắt buộc phải báo: im
   * lặng thì người nghe chỉ thấy bài đọc nhảy cóc mà không hiểu vì sao.
   */
  onIncomplete?: (skipped: number, total: number) => void;
};

/** Phát lần lượt các câu đã có file. Câu chưa gắn file thì bỏ qua. */
export function speakAudioFiles(
  segments: AudioSegment[],
  opts: SpeakAudioOptions = {}
): void {
  const el = getAudio();
  const gen = ++generation;

  // Phải là lệnh đầu tiên, trước mọi `await` — xem ghi chú (1) ở đầu file.
  el.pause();
  el.src = SILENT_WAV;
  el.play().catch(() => {});

  const speed = mapRateToSpeed(opts.rate ?? DEFAULT_RATE);

  (async () => {
    let played = 0;

    for (const seg of segments) {
      if (gen !== generation) return;
      if (!seg.url) continue;
      opts.onSegmentStart?.(seg.mark);
      played++;
      try {
        await playOne(el, seg.url, speed);
      } catch {
        if (gen !== generation) return;
        // Hỏng một file không nên làm đứt cả lượt đọc.
      }
    }

    if (gen !== generation) return;
    const skipped = segments.length - played;
    if (skipped > 0) opts.onIncomplete?.(skipped, segments.length);
    opts.onEnd?.();
  })();
}

/** Dừng phát và vô hiệu hoá lượt đọc đang chạy. */
export function stopAudioFiles() {
  generation++;
  if (audioEl) {
    audioEl.pause();
    audioEl.onended = null;
    audioEl.onerror = null;
  }
}

/** Text để đọc một câu — chỉ dùng khi xuất bản văn bản cho người sinh file. */
export function readingTextFor(question: string, options: string[]): string {
  const LABELS = ["A", "B", "C", "D", "E", "F"];
  return [
    stripForSpeech(question),
    ...options.map((o, j) => `${LABELS[j] ?? j + 1}. ${stripForSpeech(o)}`),
  ]
    .filter((s) => s.trim().length > 0)
    .join("\n");
}
