// Phát giọng đọc tiếng Anh lấy từ `/api/tts` (file mp3 hoặc wav đã sinh sẵn).
//
// Khác Web Speech ở chỗ nội dung là file audio thật, nên giọng giống người và
// giống nhau trên mọi máy — không phụ thuộc bé đang dùng iPhone hay máy tính.
//
// Ba điểm phải giữ khi sửa file này:
//
// 1. iOS chỉ cho phát tiếng nếu `play()` được gọi NGAY trong luồng của cú chạm.
//    Ta không kịp gọi API rồi mới phát, nên `speakCloud` phát một đoạn im lặng
//    cực ngắn ngay lập tức để "mở khoá" thẻ audio, sau đó mới tải file thật.
//    Đừng chèn `await` nào trước lời gọi mở khoá đó.
// 2. Dùng lại ĐÚNG MỘT thẻ audio cho cả vòng đời trang. Mở khoá gắn với thẻ,
//    tạo thẻ mới là mất quyền phát.
// 3. Mọi lượt đọc mang một số thứ tự (`generation`). Bấm dừng là tăng số đó lên,
//    nên các promise đang bay của lượt cũ tự biết mình đã cũ và im lặng thoát.

import { DEFAULT_RATE, stripForSpeech } from "./speech";
import type { TtsVoice } from "./ttsVoices";

/** WAV 8kHz mono, ~5ms im lặng — chỉ để mở khoá audio trên iOS. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

/** Số câu tải song song. Đủ nhanh mà không đập vào giới hạn tần suất của API. */
const CONCURRENCY = 4;

export type CloudSegment = { text: string; mark?: number };

let audioEl: HTMLAudioElement | null = null;
let generation = 0;
/** Lượt tải đang chạy, để bấm dừng là huỷ luôn — mỗi request bỏ dở vẫn tính tiền. */
let inflight: AbortController | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/**
 * Ghép mỗi câu hỏi + toàn bộ đáp án thành MỘT đoạn text.
 *
 * Một file cho cả câu chứ không phải mỗi đáp án một file: ít lượt gọi API hơn
 * hẳn, và model đọc liền mạch cả câu thì ngữ điệu tự nhiên hơn là ghép các mẩu
 * rời. Xuống dòng giữa các phần để model tự ngắt nghỉ.
 *
 * Xướng "Question N" bằng tiếng Anh (không phải "Câu N") vì cả file là một
 * giọng Anh duy nhất — chen tiếng Việt vào sẽ thành giọng Anh đọc tiếng Việt.
 */
export function cloudSegments(
  questions: { question: string; options: string[] }[]
): CloudSegment[] {
  const LABELS = ["A", "B", "C", "D", "E", "F"];
  return questions.map((q, i) => ({
    mark: i,
    text: [
      `Question ${i + 1}.`,
      stripForSpeech(q.question),
      ...q.options.map((o, j) => `${LABELS[j] ?? j + 1}. ${stripForSpeech(o)}`),
    ]
      .filter((s) => s.trim().length > 0)
      .join("\n"),
  }));
}

/** Đọc một câu lẻ (nút 🔊 trên từng câu). */
export function cloudSegmentFor(question: string, options: string[]): CloudSegment[] {
  return cloudSegments([{ question, options }]).map((s) => ({
    ...s,
    // Bỏ phần xướng số vì người dùng đang bấm đúng câu đó rồi.
    text: s.text.replace(/^Question \d+\.\n?/, ""),
  }));
}

type FetchResult = { url: string } | { error: string };

/**
 * Giữ lại THÔNG ĐIỆP lỗi chứ không chỉ trả null. Nuốt lỗi ở đây thì phía người
 * dùng chỉ thấy "không tải được" mà không ai biết vì sao — hết hạn mức, sai
 * model hay lỗi kho lưu trữ đều trông giống hệt nhau.
 */
async function fetchAudioUrl(
  text: string,
  voice: TtsVoice,
  rate: number,
  signal: AbortSignal
): Promise<FetchResult> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, rate }),
      signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: typeof data?.error === "string" ? data.error : `Lỗi ${res.status}` };
    }
    return typeof data?.url === "string" ? { url: data.url } : { error: "Máy chủ không trả về file" };
  } catch (e) {
    // Huỷ giữa chừng cũng vào đây; bên gọi tự bỏ qua nhờ số thứ tự lượt đọc.
    return { error: e instanceof Error ? e.message : "Không gọi được máy chủ" };
  }
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

function playOne(el: HTMLAudioElement, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = (fn: () => void) => {
      el.onended = null;
      el.onerror = null;
      fn();
    };
    el.onended = () => done(resolve);
    el.onerror = () => done(() => reject(new Error("audio-error")));
    el.src = url;
    el.play().catch((e) => done(() => reject(e)));
  });
}

export type SpeakCloudOptions = {
  rate?: number;
  voice?: TtsVoice;
  /** Số câu đã tải xong / tổng — để hiện "Đang chuẩn bị… 3/20". */
  onProgress?: (done: number, total: number) => void;
  onSegmentStart?: (mark: number | undefined) => void;
  onEnd?: () => void;
  /** Không tải được file nào; kèm lý do để hiện cho người dùng. */
  onFail?: (reason: string) => void;
};

/**
 * Tải rồi phát lần lượt các đoạn.
 *
 * Tải HẾT trước khi phát chứ không vừa phát vừa tải câu sau: lần đầu mỗi câu
 * phải sinh audio mất vài giây, nếu vừa phát vừa tải thì giữa các câu sẽ có
 * quãng lặng dài không đoán trước. Tải xong rồi phát thì chờ một lần ở đầu,
 * sau đó liền mạch. Lần nghe sau file đã nằm trong cache nên gần như tức thì.
 */
export function speakCloud(segments: CloudSegment[], opts: SpeakCloudOptions = {}): void {
  const el = getAudio();
  const gen = ++generation;

  // Phải là lệnh đầu tiên, trước mọi `await` — xem ghi chú (1) ở đầu file.
  el.pause();
  el.src = SILENT_WAV;
  el.play().catch(() => {});

  inflight?.abort();
  const controller = new AbortController();
  inflight = controller;

  const clean = segments.filter((s) => s.text.trim().length > 0);
  if (!clean.length) {
    opts.onEnd?.();
    return;
  }

  // Bỏ trống thì máy chủ tự dùng giọng mặc định của nhà cung cấp đang bật.
  const voice = opts.voice ?? "";
  const rate = opts.rate ?? DEFAULT_RATE;

  (async () => {
    let done = 0;
    opts.onProgress?.(0, clean.length);

    const results = await mapLimit(clean, CONCURRENCY, async (seg) => {
      const r = await fetchAudioUrl(seg.text, voice, rate, controller.signal);
      done++;
      if (gen === generation) opts.onProgress?.(done, clean.length);
      return r;
    });

    if (gen !== generation) return; // đã bấm dừng trong lúc tải

    const urls = results.map((r) => ("url" in r ? r.url : null));
    if (urls.every((u) => !u)) {
      const first = results.find((r) => "error" in r) as { error: string } | undefined;
      opts.onFail?.(first?.error ?? "Không rõ nguyên nhân");
      return;
    }

    for (let i = 0; i < clean.length; i++) {
      if (gen !== generation) return;
      const url = urls[i];
      if (!url) continue; // câu lỗi thì bỏ qua, không chặn cả bài
      opts.onSegmentStart?.(clean[i].mark);
      try {
        await playOne(el, url);
      } catch {
        if (gen !== generation) return;
        // Lỗi phát một file không nên làm đứt cả lượt đọc.
      }
    }

    if (gen === generation) opts.onEnd?.();
  })();
}

/** Dừng phát và vô hiệu hoá lượt đọc đang chạy. */
export function stopCloud() {
  generation++;
  inflight?.abort();
  inflight = null;
  if (audioEl) {
    audioEl.pause();
    audioEl.onended = null;
    audioEl.onerror = null;
  }
}
