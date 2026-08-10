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
import { mapRateToSpeed, type TtsVoice } from "./ttsVoices";

/** WAV 8kHz mono, ~5ms im lặng — chỉ để mở khoá audio trên iOS. */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

/**
 * Chờ bao lâu trước mỗi lần thử lại khi bị 429.
 *
 * Kéo dài tới hơn một phút vì hạn mức của gói miễn phí tính THEO PHÚT — bỏ cuộc
 * sau 20 giây là chưa kịp qua cửa sổ đó. Chờ lâu không làm người nghe sốt ruột:
 * việc tải chạy nền trong lúc các câu trước đang được đọc.
 */
const RETRY_DELAYS_MS = [5000, 15000, 30000, 60000];

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new Error("aborted"));
    }, { once: true });
  });
}

export type CloudSegment = {
  text: string;
  mark?: number;
  /**
   * File đã gắn sẵn cho câu này (sinh ngoài bằng Piper). Có thì phát thẳng,
   * không gọi `/api/tts` — nên vẫn nghe được kể cả khi máy chủ không cấu hình
   * nhà cung cấp TTS nào.
   */
  url?: string;
};

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
  questions: { question: string; options: string[]; audioUrl?: string }[]
): CloudSegment[] {
  const LABELS = ["A", "B", "C", "D", "E", "F"];
  return questions.map((q, i) => ({
    mark: i,
    url: q.audioUrl,
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
  signal: AbortSignal,
  onRetry: (seconds: number, reason: string) => void
): Promise<FetchResult> {
  let last = "Không gọi được máy chủ";

  // Bị 429 thì chờ rồi thử lại: giới hạn của gói miễn phí tính theo phút, nên
  // đợi một lát là qua. Hết hạn mức theo NGÀY thì thử lại cũng vô ích, nhưng
  // vẫn trả về đúng thông điệp để người dùng biết.
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
        signal,
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return typeof data?.url === "string"
          ? { url: data.url }
          : { error: "Máy chủ không trả về file" };
      }
      last = typeof data?.error === "string" ? data.error : `Lỗi ${res.status}`;
      if (res.status !== 429 || attempt >= RETRY_DELAYS_MS.length) return { error: last };
      const wait = RETRY_DELAYS_MS[attempt];
      // Kèm lý do NGAY từ lần chặn đầu. Chỉ báo "đang chờ" thì người dùng phải
      // đợi hết vòng thử lại (gần hai phút) mới biết vì sao — quá muộn.
      onRetry(Math.round(wait / 1000), last);
      await sleep(wait, signal);
    } catch (e) {
      // Huỷ giữa chừng cũng vào đây; bên gọi tự bỏ qua nhờ số thứ tự lượt đọc.
      return { error: e instanceof Error ? e.message : last };
    }
  }
}

/**
 * Phát một file, trả về khi phát xong.
 *
 * Trên iOS sự kiện `ended` KHÔNG phải lúc nào cũng bắn — đúng cái bẫy đã gặp
 * với Web Speech (xem ghi chú `onend` trong lib/speech.ts). Chuỗi đọc chờ
 * `ended` để sang câu sau, nên thiếu nó là đứng luôn ở câu 1. Vì vậy có thêm
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

export type SpeakCloudOptions = {
  rate?: number;
  voice?: TtsVoice;
  /** Số câu đã xong / tổng, kèm ghi chú trạng thái để không trông như treo máy. */
  onProgress?: (done: number, total: number, note?: string) => void;
  onSegmentStart?: (mark: number | undefined) => void;
  onEnd?: () => void;
  /** Không tải được file nào; kèm lý do để hiện cho người dùng. */
  onFail?: (reason: string) => void;
  /**
   * Đọc xong nhưng có câu bị bỏ qua. Bắt buộc phải báo: im lặng thì người nghe
   * chỉ thấy bài đọc dừng ngang mà không hiểu vì sao.
   */
  onIncomplete?: (skipped: number, total: number, reason: string) => void;
};

/**
 * Vừa tải vừa phát: phát câu 1 ngay khi nó xong, các câu sau sinh tiếp ở nền.
 *
 * Trước đây tải hết rồi mới phát, để tránh quãng lặng giữa các câu. Nhưng gói
 * miễn phí bắt gọi lần lượt, nên "tải hết" nghĩa là ngồi chờ cả 8 câu trước khi
 * nghe được tiếng nào — chờ quá lâu. Phát ngay câu đầu thì chỉ chờ một câu, và
 * trong lúc bé nghe câu đó (cỡ 15 giây) thì câu sau thường đã sinh xong, nên
 * thực tế không có quãng lặng nào.
 *
 * Lần nghe sau file đã nằm trong cache nên chạy gần như tức thì.
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
  const speed = mapRateToSpeed(opts.rate ?? DEFAULT_RATE);

  // Một ô chờ cho mỗi câu: bên tải điền vào, bên phát lấy ra theo đúng thứ tự.
  const slots = clean.map(() => {
    let fill: (r: FetchResult) => void = () => {};
    const ready = new Promise<FetchResult>((res) => { fill = res; });
    return { ready, fill };
  });

  // Bên TẢI — chạy nền, lần lượt từng câu.
  (async () => {
    for (let i = 0; i < clean.length; i++) {
      if (gen !== generation) break;
      // Báo TRƯỚC khi gọi: sinh một câu mất cả chục giây, đứng im ở "0/8" suốt
      // thời gian đó thì người dùng tưởng hỏng.
      // Câu đã có file gắn sẵn thì dùng luôn, khỏi gọi API.
      if (clean[i].url) {
        slots[i].fill({ url: clean[i].url! });
        opts.onProgress?.(i + 1, clean.length);
        continue;
      }
      opts.onProgress?.(i, clean.length, `đang tạo câu ${i + 1}`);
      const r = await fetchAudioUrl(clean[i].text, voice, controller.signal, (secs, why) => {
        if (gen === generation) {
          opts.onProgress?.(i, clean.length, `thử lại sau ${secs}s · ${why}`);
        }
      });
      slots[i].fill(r);
      if (gen === generation) opts.onProgress?.(i + 1, clean.length);
    }
    // Bấm dừng giữa chừng: phải điền nốt các ô còn trống, không thì bên phát
    // đứng chờ mãi một promise không bao giờ được giải quyết.
    for (const s of slots) s.fill({ error: "đã dừng" });
  })();

  // Bên PHÁT — chờ đúng câu cần rồi phát ngay, không đợi các câu sau.
  (async () => {
    opts.onProgress?.(0, clean.length);
    let played = 0;
    let firstError: string | null = null;

    for (let i = 0; i < clean.length; i++) {
      const r = await slots[i].ready;
      if (gen !== generation) return;
      if ("error" in r) {
        firstError ??= r.error;
        continue; // câu lỗi thì bỏ qua, không chặn cả bài
      }
      opts.onSegmentStart?.(clean[i].mark);
      played++;
      try {
        await playOne(el, r.url, speed);
      } catch {
        if (gen !== generation) return;
        // Lỗi phát một file không nên làm đứt cả lượt đọc.
      }
    }

    if (gen !== generation) return;
    if (played === 0) {
      opts.onFail?.(firstError ?? "Không rõ nguyên nhân");
    } else {
      const skipped = clean.length - played;
      if (skipped > 0) {
        opts.onIncomplete?.(skipped, clean.length, firstError ?? "Không rõ nguyên nhân");
      }
      opts.onEnd?.();
    }
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

// ── Chuẩn bị trước ───────────────────────────────────────────────────────────
//
// Tách việc SINH giọng khỏi việc NGHE. Hạn mức nhỏ không phiền nếu người lớn
// chuẩn bị sẵn lúc rảnh; chỉ phiền khi nó cạn đúng lúc đứa trẻ đang ngồi học.
// Câu nào sinh được là lưu vĩnh viễn, nên chuẩn bị dở dang hôm nay thì mai bấm
// tiếp là đầy dần.

/** Đếm xem đề đã có sẵn giọng cho bao nhiêu câu — không tiêu hạn mức. */
export async function countPrepared(
  segments: CloudSegment[],
  voice: TtsVoice
): Promise<number> {
  const results = await Promise.all(
    segments.map(async (seg) => {
      if (seg.url) return true; // đã gắn file thủ công
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: seg.text, voice, probe: true }),
        });
        const data = await res.json().catch(() => null);
        return res.ok && data?.ready === true;
      } catch {
        return false;
      }
    })
  );
  return results.filter(Boolean).length;
}

export type PrepareOptions = {
  voice?: TtsVoice;
  onProgress?: (done: number, total: number, note?: string) => void;
  onDone?: (ready: number, total: number, lastError: string | null) => void;
};

/**
 * Sinh sẵn giọng cho cả đề, không phát tiếng.
 *
 * Đi lần lượt và KHÔNG dừng khi gặp lỗi: hết hạn mức ở câu 4 thì các câu trước
 * vẫn đã lưu, lần sau bấm lại chỉ phải làm phần còn thiếu.
 */
export function prepareAll(segments: CloudSegment[], opts: PrepareOptions = {}): () => void {
  const controller = new AbortController();
  const clean = segments.filter((s) => s.text.trim().length > 0);
  const voice = opts.voice ?? "";

  (async () => {
    let ready = 0;
    let lastError: string | null = null;

    for (let i = 0; i < clean.length; i++) {
      if (controller.signal.aborted) return;
      if (clean[i].url) {
        ready++;
        opts.onProgress?.(ready, clean.length);
        continue;
      }
      opts.onProgress?.(ready, clean.length, `đang tạo câu ${i + 1}`);
      const r = await fetchAudioUrl(clean[i].text, voice, controller.signal, (secs, why) => {
        opts.onProgress?.(ready, clean.length, `thử lại sau ${secs}s · ${why}`);
      });
      if ("url" in r) ready++;
      else lastError = r.error;
      opts.onProgress?.(ready, clean.length);
    }

    if (!controller.signal.aborted) opts.onDone?.(ready, clean.length, lastError);
  })();

  return () => controller.abort();
}
