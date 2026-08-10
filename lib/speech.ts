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

// ── Giọng đọc ────────────────────────────────────────────────────────────────
//
// Danh sách giọng nạp bất đồng bộ trên Chrome (lần gọi đầu trả mảng rỗng rồi
// mới bắn `voiceschanged`). Ta cache lại và KHÔNG `await` lúc bấm nút: trên iOS
// Safari, `speak()` phải chạy ngay trong luồng của cú chạm — chèn một `await`
// vào giữa là mất quyền phát tiếng.

let voiceCache: SpeechSynthesisVoice[] = [];

function refreshVoices() {
  if (!isSpeechSupported()) return;
  const v = window.speechSynthesis.getVoices();
  if (v.length) voiceCache = v;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

/** Giọng nghe tự nhiên hơn thường mang những từ khoá này trong tên. */
const NICE_VOICE = /google|enhanced|premium|neural|natural|siri|wavenet/i;

/**
 * Giọng "novelty" và giọng đời cũ của Apple (Boing, Bubbles, Zarvox, Fred…).
 *
 * Chúng nằm lẫn trong `getVoices()` như giọng en-US bình thường, nhưng đọc ra
 * tiếng robot/hiệu ứng hài chứ không phải giọng người — không bao giờ dùng để
 * đọc đề cho bé. Lọc hẳn khỏi danh sách thay vì chỉ cho điểm thấp: còn hiện
 * trong dropdown thì vẫn là cái bẫy để bấm nhầm.
 */
const NOVELTY_VOICES = new Set([
  "agnes", "albert", "bad news", "bahh", "bells", "boing", "bruce", "bubbles",
  "cellos", "deranged", "fred", "good news", "hysterical", "jester", "junior",
  "kathy", "organ", "princess", "ralph", "superstar", "trinoids", "victoria",
  "whisper", "wobble", "zarvox",
]);

function isNoveltyVoice(name: string): boolean {
  // Tên có thể kèm hậu tố ngôn ngữ, vd "Fred (English (United States))".
  const base = name.replace(/\s*\(.*$/, "").trim().toLowerCase();
  return NOVELTY_VOICES.has(base);
}

function score(v: SpeechSynthesisVoice, lang: SpeechLang): number {
  if (isNoveltyVoice(v.name ?? "")) return -1;
  const vlang = (v.lang ?? "").replace("_", "-");
  let n = 0;
  if (vlang === lang) n += 100;
  else if (vlang.toLowerCase().startsWith(lang.slice(0, 2))) n += 60;
  else return -1; // sai ngôn ngữ thì loại hẳn
  // Giọng "compact" của iOS nghe máy móc nhất, ưu tiên thấp nhất.
  if (/compact/i.test(v.name)) n -= 20;
  if (NICE_VOICE.test(v.name)) n += 30;
  if (v.default) n += 5;
  return n;
}

/** Các giọng dùng được cho một ngôn ngữ, xếp từ nghe hay nhất. */
export function voicesFor(lang: SpeechLang): SpeechSynthesisVoice[] {
  return voiceCache
    .map((v) => ({ v, s: score(v, lang) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v);
}

function pickVoice(lang: SpeechLang): SpeechSynthesisVoice | null {
  const preferred = getPreferredVoice(lang);
  if (preferred) {
    const hit = voiceCache.find((v) => v.voiceURI === preferred || v.name === preferred);
    if (hit) return hit;
  }
  return voicesFor(lang)[0] ?? null;
}

// Giọng người dùng tự chọn, lưu theo từng ngôn ngữ.
const VOICE_KEY = (lang: SpeechLang) => `ontap_voice_${lang}`;

export function getPreferredVoice(lang: SpeechLang): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(VOICE_KEY(lang));
  } catch {
    return null;
  }
}

export function setPreferredVoice(lang: SpeechLang, voiceURI: string | null) {
  try {
    if (voiceURI) window.localStorage.setItem(VOICE_KEY(lang), voiceURI);
    else window.localStorage.removeItem(VOICE_KEY(lang));
  } catch {/* ignore */}
  listenersVoice.forEach((l) => l());
}

const listenersVoice = new Set<() => void>();
export function subscribeVoice(cb: () => void) {
  listenersVoice.add(cb);
  return () => {
    listenersVoice.delete(cb);
  };
}

// ── Giữ cho tiếng không tự tắt giữa chừng ────────────────────────────────────
//
// Chrome và Safari tự dừng bộ đọc sau khoảng 15 giây. Đọc một câu thì không sao,
// đọc cả bài (vài phút) là đứt giữa chừng — đúng triệu chứng "một câu chạy, cả
// bài không". `resume()` định kỳ giữ cho nó chạy tiếp.

let keepAlive: ReturnType<typeof setInterval> | null = null;

function startKeepAlive() {
  stopKeepAlive();
  keepAlive = setInterval(() => {
    if (!isSpeechSupported()) return;
    if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
  }, 5000);
}

function stopKeepAlive() {
  if (keepAlive) {
    clearInterval(keepAlive);
    keepAlive = null;
  }
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
export function speakSegments(
  segments: SpeakSegment[],
  opts: {
    rate?: number;
    /** Gọi khi bắt đầu đọc một đoạn, kèm `mark` của đoạn đó. */
    onSegmentStart?: (mark: number | undefined) => void;
    onEnd?: () => void;
  } = {}
): void {
  if (!isSpeechSupported()) return;

  const ss = window.speechSynthesis;
  ss.cancel();
  stopKeepAlive();

  const clean = segments
    .map((s) => ({ ...s, text: stripForSpeech(s.text) }))
    .filter((s) => s.text.length > 0);
  if (!clean.length) {
    opts.onEnd?.();
    return;
  }

  const rate = opts.rate ?? getSpeechRate();
  // Giọng có thể chưa nạp xong ở lần bấm đầu; vẫn đọc được vì `lang` đủ để
  // trình duyệt tự chọn. Lần sau cache đã sẵn nên chọn được giọng hay hơn.
  refreshVoices();
  startKeepAlive();

  let i = 0;
  let stopped = false;

  const finish = () => {
    if (stopped) return;
    stopped = true;
    stopKeepAlive();
    opts.onEnd?.();
  };

  const next = () => {
    if (stopped) return;
    if (i >= clean.length) return finish();

    const seg = clean[i++];
    opts.onSegmentStart?.(seg.mark);

    const lang = seg.lang ?? detectLang(seg.text);
    const u = new SpeechSynthesisUtterance(seg.text);
    u.lang = lang;
    u.rate = rate;
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;

    // Trên iOS/Safari `onend` thỉnh thoảng không bắn, làm đứng cả chuỗi đọc.
    // Hẹn giờ dự phòng theo độ dài câu để vẫn đi tiếp được.
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      clearTimeout(guard);
      next();
    };
    const estimateMs = (seg.text.length / Math.max(rate, 0.3)) * 110 + 2500;
    const guard = setTimeout(advance, estimateMs);

    u.onend = advance;
    // Huỷ giữa chừng cũng bắn `error`; dừng hẳn thay vì đọc tiếp.
    u.onerror = () => {
      clearTimeout(guard);
      finish();
    };
    ss.speak(u);
  };

  next();
}

/** Dừng đọc và dọn bộ giữ tiếng. */
export function stopSpeaking() {
  stopKeepAlive();
  cancelSpeech();
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
