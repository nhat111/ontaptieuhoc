// Đọc câu hỏi thành tiếng bằng Web Speech API có sẵn trong trình duyệt.
// Không cần API key, không tốn phí, chạy offline sau khi giọng đã tải.
//
// Giọng phụ thuộc thiết bị: en-US gần như máy nào cũng có; vi-VN có trên hầu
// hết Android/iOS/Chrome đời mới nhưng không phải tất cả. `pickVoice` rơi về
// giọng mặc định khi không tìm được giọng đúng ngôn ngữ.

export type SpeechLang = "vi-VN" | "en-US";

/** Ký tự chỉ có trong tiếng Việt (không kể ký tự chung với tiếng Anh). */
const VI_CHARS =
  /[ăâđêôơưĂÂĐÊÔƠƯàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵÀÁẢÃẠẰẮẲẴẶẦẤẨẪẬÈÉẺẼẸỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌỒỐỔỖỘỜỚỞỠỢÙÚỦŨỤỪỨỬỮỰỲÝỶỸỴ]/;

/**
 * Đoán ngôn ngữ của một đoạn text.
 * Có dấu tiếng Việt → vi-VN, còn lại → en-US. Đủ dùng vì đề tiếng Anh hầu như
 * không có dấu, còn đề tiếng Việt thì gần như câu nào cũng có ít nhất một dấu.
 */
export function detectLang(text: string): SpeechLang {
  return VI_CHARS.test(text) ? "vi-VN" : "en-US";
}

/**
 * Bỏ phần không đọc được thành tiếng: công thức LaTeX, lệnh LaTeX còn sót,
 * khoảng trắng thừa. Đọc nguyên `$\frac{1}{2}$` sẽ ra một tràng vô nghĩa.
 */
export function stripForSpeech(text: string): string {
  return text
    // $$...$$, $...$, \(...\), \[...\]
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]*\$/g, " ")
    .replace(/\\\([\s\S]*?\\\)/g, " ")
    .replace(/\\\[[\s\S]*?\\\]/g, " ")
    // lệnh LaTeX lẻ còn sót ngoài cặp dấu
    .replace(/\\[a-zA-Z]+\s*/g, " ")
    .replace(/[{}]/g, " ")
    // thẻ HTML nếu nội dung được dán từ Tiptap
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Danh sách giọng nạp bất đồng bộ trên Chrome — lần gọi đầu thường trả mảng
 * rỗng rồi mới bắn `voiceschanged`. Chờ tối đa `timeoutMs` rồi chạy tiếp với
 * những gì đang có.
 */
function loadVoices(timeoutMs = 1000): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = finish;
    setTimeout(finish, timeoutMs);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: SpeechLang) {
  const prefix = lang.slice(0, 2);
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang?.replace("_", "-") === lang) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ??
    null
  );
}

export function cancelSpeech() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

export type SpeakSegment = {
  text: string;
  lang?: SpeechLang;
  /** Nhãn tuỳ ý của bên gọi (vd: chỉ số câu hỏi) để biết đang đọc tới đâu. */
  mark?: number;
};

// ── Tốc độ đọc ───────────────────────────────────────────────────────────────

const RATE_KEY = "ontap_speech_rate";

/** Chậm hơn hẳn mặc định của trình duyệt — bé tiểu học cần thời gian nghe kịp. */
export const DEFAULT_RATE = 0.7;
export const RATE_OPTIONS = [
  { label: "Chậm", value: 0.55 },
  { label: "Vừa", value: 0.7 },
  { label: "Nhanh", value: 0.9 },
] as const;

export function getSpeechRate(): number {
  if (typeof window === "undefined") return DEFAULT_RATE;
  try {
    const n = Number(window.localStorage.getItem(RATE_KEY));
    // Chặn giá trị rác trong localStorage khỏi tạo ra tốc độ vô lý.
    return Number.isFinite(n) && n >= 0.3 && n <= 1.5 ? n : DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

// localStorage là state ngoài React; dùng store nhỏ để component subscribe qua
// useSyncExternalStore, tránh setState-trong-effect và lệch hydration.
const rateListeners = new Set<() => void>();

export function subscribeSpeechRate(cb: () => void) {
  rateListeners.add(cb);
  return () => {
    rateListeners.delete(cb);
  };
}

export function setSpeechRate(rate: number) {
  try {
    window.localStorage.setItem(RATE_KEY, String(rate));
  } catch {/* ignore */}
  rateListeners.forEach((l) => l());
}

/**
 * Đọc lần lượt các đoạn, mỗi đoạn có thể một ngôn ngữ khác nhau (đề tiếng Anh
 * hay có câu lệnh tiếng Việt kèm đáp án tiếng Anh).
 *
 * Trả về promise chạy xong hoặc bị huỷ. Luôn `cancel()` trước để không chồng
 * lên lượt đọc đang chạy.
 */
export async function speakSegments(
  segments: SpeakSegment[],
  opts: {
    rate?: number;
    /** Gọi khi bắt đầu đọc một đoạn, kèm `mark` của đoạn đó. */
    onSegmentStart?: (mark: number | undefined) => void;
    onEnd?: () => void;
  } = {}
): Promise<void> {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();

  const clean = segments
    .map((s) => ({ ...s, text: stripForSpeech(s.text) }))
    .filter((s) => s.text.length > 0);
  if (!clean.length) {
    opts.onEnd?.();
    return;
  }

  const voices = await loadVoices();
  const rate = opts.rate ?? getSpeechRate();

  await new Promise<void>((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= clean.length) {
        opts.onEnd?.();
        return resolve();
      }
      const seg = clean[i++];
      opts.onSegmentStart?.(seg.mark);
      const lang = seg.lang ?? detectLang(seg.text);
      const u = new SpeechSynthesisUtterance(seg.text);
      u.lang = lang;
      u.rate = rate;
      const voice = pickVoice(voices, lang);
      if (voice) u.voice = voice;
      u.onend = next;
      // Huỷ giữa chừng cũng bắn `error`; coi như kết thúc, không đọc tiếp.
      u.onerror = () => {
        opts.onEnd?.();
        resolve();
      };
      window.speechSynthesis.speak(u);
    };
    next();
  });
}

/** Có chữ cái Latin không — đáp án kiểu "12" hay "3,5" thì không. */
function hasLetters(text: string): boolean {
  return /\p{L}/u.test(text);
}

/**
 * Ghép câu hỏi + các đáp án thành chuỗi đoạn để đọc một lượt.
 *
 * Đáp án thuần số ("1", "3,5") không có dấu hiệu ngôn ngữ nào nên phải mượn
 * ngôn ngữ của câu hỏi — nếu không, câu Toán tiếng Việt sẽ bị đọc "one, two"
 * bằng giọng Anh thay vì "một, hai".
 */
export function questionSegments(
  question: string,
  options: string[],
  mark?: number
): SpeakSegment[] {
  const LABELS = ["A", "B", "C", "D", "E", "F"];
  const baseLang = detectLang(stripForSpeech(question));

  return [
    { text: question, lang: baseLang, mark },
    ...options.map((opt, i) => ({
      text: `${LABELS[i] ?? i + 1}. ${opt}`,
      lang: hasLetters(opt) ? detectLang(opt) : baseLang,
      mark,
    })),
  ];
}

/**
 * Ghép cả bài để đọc một mạch từ câu 1 tới hết.
 *
 * Xướng "Câu N" trước mỗi câu để bé biết đang tới đâu; câu số đọc bằng giọng
 * Việt kể cả khi đề tiếng Anh, vì đó là lời của app chứ không phải nội dung đề.
 */
export function allQuestionsSegments(
  questions: { question: string; options: string[] }[]
): SpeakSegment[] {
  return questions.flatMap((q, i) => [
    { text: `Câu ${i + 1}`, lang: "vi-VN" as const, mark: i },
    ...questionSegments(q.question, q.options, i),
  ]);
}
