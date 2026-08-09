"use client";
import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Question, LessonMeta, formatTime, scoreAnswer, shuffleQuiz } from "@/lib/quizData";
import { buildExamHtml } from "@/lib/exportLesson";
import Header from "@/components/Header";
import QuestionCard from "./QuestionCard";
import QuestionPalette from "./QuestionPalette";
import VoicePicker from "./VoicePicker";
import {
  getCloudVoice,
  getCloudVoiceOn,
  getShuffleOptions,
  getShuffleQuestions,
  setCloudVoice,
  setCloudVoiceOn,
  setShuffleOptions,
  setShuffleQuestions,
  subscribeQuizPrefs,
} from "@/lib/quizPrefs";
import {
  allQuestionsSegments,
  detectLang,
  stopSpeaking,
  getSpeechRate,
  isSpeechSupported,
  setSpeechRate,
  speakSegments,
  subscribeSpeechRate,
  DEFAULT_RATE,
  RATE_OPTIONS,
} from "@/lib/speech";
import { cloudSegments, speakCloud, stopCloud } from "@/lib/cloudSpeech";

interface Props {
  initialQuestions: Question[];
  initialLesson: LessonMeta;
}

export default function QuizClient({ initialQuestions, initialLesson }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const lessonId = Number(searchParams.get("lessonId") ?? "1");

  // Câu hỏi là state vì có thể bị trộn khi bắt đầu làm bài.
  const [questions, setQuestions] = useState(initialQuestions);
  const lesson = initialLesson;
  const durationMinutes = lesson.durationMinutes ?? 15;
  const totalSeconds = durationMinutes * 60;

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(questions.length).fill(null));
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isPremium, setIsPremium] = useState(false);

  // Check premium status once so the start screen can gate the export buttons.
  useEffect(() => {
    fetch("/api/me/premium")
      .then((r) => r.json())
      .then((d) => setIsPremium(!!d.isPremium))
      .catch(() => {});
  }, []);

  // ── Trộn thứ tự ──────────────────────────────────────────────────────────
  const shuffleQ = useSyncExternalStore(subscribeQuizPrefs, getShuffleQuestions, () => false);
  const shuffleO = useSyncExternalStore(subscribeQuizPrefs, getShuffleOptions, () => false);

  // Trộn đúng một lần lúc bấm Bắt đầu, không trộn lại giữa chừng — nếu không
  // câu hỏi sẽ nhảy lung tung dưới tay bé đang làm.
  function start() {
    if (shuffleQ || shuffleO) {
      setQuestions(shuffleQuiz(initialQuestions, { questions: shuffleQ, options: shuffleO }));
    }
    setStarted(true);
  }

  // ── Giọng đám mây (chỉ cho đề tiếng Anh) ─────────────────────────────────
  //
  // Giọng máy sẵn có đủ dùng cho đề tiếng Việt, nhưng bé học tiếng Anh mà nghe
  // giọng máy thì dễ nhại sai trọng âm — nên đề tiếng Anh mới gọi giọng đám mây.
  // Danh mục giọng do máy chủ trả về: tên giọng khác nhau tuỳ nhà cung cấp
  // (Gemini dùng "Kore", OpenAI dùng "nova") nên client không giữ danh sách cứng.
  const [cloud, setCloud] = useState<{
    voices: { value: string; label: string }[];
    defaultVoice: string;
  } | null>(null);
  const [prep, setPrep] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/tts")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.available) return;
        setCloud({
          voices: Array.isArray(d.voices) ? d.voices : [],
          defaultVoice: typeof d.defaultVoice === "string" ? d.defaultVoice : "",
        });
      })
      .catch(() => {});
  }, []);

  const cloudAvailable = cloud !== null;
  const cloudOn = useSyncExternalStore(subscribeQuizPrefs, getCloudVoiceOn, () => true);
  const savedVoice = useSyncExternalStore(subscribeQuizPrefs, getCloudVoice, () => "");
  // Giọng đã lưu có thể là của nhà cung cấp cũ; chỉ dùng khi còn trong danh mục.
  const cloudVoice =
    cloud?.voices.some((v) => v.value === savedVoice) ? savedVoice : cloud?.defaultVoice ?? "";

  // Nhận diện tiếng Anh theo HAI dấu hiệu, chỉ cần một cái đúng:
  //
  // - Môn là "Tiếng Anh": người tạo đề đã nói thẳng ra rồi, tin.
  // - Quá nửa câu hỏi không có dấu tiếng Việt: bắt được cả đề tiếng Anh bị xếp
  //   nhầm môn.
  //
  // Chỉ dựa vào nội dung là hụt mất trường hợp rất hay gặp: đề tiếng Anh do
  // người Việt soạn, lời dẫn ("Chọn đáp án đúng") bằng tiếng Việt còn nội dung
  // mới là tiếng Anh — lúc đó quá nửa câu bị tính là tiếng Việt.
  const englishByContent =
    questions.length > 0 &&
    questions.filter((q) => detectLang(q.question) === "en-US").length * 2 >= questions.length;
  const isEnglishLesson = lesson.subjectName === "Tiếng Anh" || englishByContent;

  const useCloud = cloudAvailable && cloudOn && isEnglishLesson;

  // ── Nghe cả bài ──────────────────────────────────────────────────────────
  const [readingAll, setReadingAll] = useState(false);
  const [readingIdx, setReadingIdx] = useState<number | null>(null);
  // Tốc độ lưu ở localStorage: server trả mặc định, client đọc giá trị đã lưu.
  const rate = useSyncExternalStore(
    subscribeSpeechRate,
    getSpeechRate,
    () => DEFAULT_RATE
  );

  // Rời trang giữa chừng thì tắt tiếng, không để đọc tiếp ở trang khác.
  useEffect(() => () => { stopSpeaking(); stopCloud(); }, []);

  // Cuộn tới câu đang đọc để bé nhìn theo được, không chỉ nghe suông.
  function onSegmentStart(mark: number | undefined) {
    if (typeof mark !== "number") return;
    setReadingIdx(mark);
    setCurrent(mark);
    document.getElementById(`question-${mark}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function stopReading() {
    stopSpeaking();
    stopCloud();
    setReadingAll(false);
    setReadingIdx(null);
    setPrep(null);
  }

  function readWithDeviceVoice() {
    speakSegments(allQuestionsSegments(questions), {
      rate,
      onSegmentStart,
      onEnd: () => {
        setReadingAll(false);
        setReadingIdx(null);
      },
    });
  }

  // Giọng đám mây hỏng thì lượt bấm này coi như bỏ; lần bấm sau dùng giọng máy.
  // Không tự đọc bằng giọng máy ngay tại đây: lúc đó đã ra khỏi luồng cú chạm,
  // mà iOS chỉ cho phát tiếng trong luồng đó — sẽ câm mà không báo gì.
  const [cloudFailed, setCloudFailed] = useState<string | null>(null);

  function readAll() {
    if (readingAll) {
      stopReading();
      return;
    }
    setReadingAll(true);
    if (useCloud && !cloudFailed) {
      speakCloud(cloudSegments(questions), {
        rate,
        voice: cloudVoice,
        onProgress: (done, total) => setPrep(done >= total ? null : { done, total }),
        onSegmentStart,
        onEnd: () => {
          setReadingAll(false);
          setReadingIdx(null);
          setPrep(null);
        },
        onFail: (reason) => {
          setCloudFailed(reason);
          setReadingAll(false);
          setPrep(null);
        },
      });
      return;
    }
    readWithDeviceVoice();
  }

  function changeRate(value: number) {
    setSpeechRate(value);
    // Tốc độ chỉ áp dụng cho lượt đọc mới, nên dừng lượt đang chạy cho khỏi rối.
    if (readingAll) stopReading();
  }

  // Server không có speechSynthesis nên phải trả false lúc SSR.
  const speechOk = useSyncExternalStore(
    () => () => {},
    () => isSpeechSupported(),
    () => false
  );

  // Giọng đám mây là file mp3 nên phát được cả trên máy không có speechSynthesis.
  const canListen = speechOk || useCloud;

  // Dùng chung cho màn hình đầu và thanh điều khiển lúc đang làm bài.
  const cloudStatus = (
    <div className="w-full text-[11px]">
      {prep && (
        <span className="text-blue-600">
          Đang chuẩn bị giọng đọc… {prep.done}/{prep.total} câu
          <span className="text-gray-400"> (lần đầu hơi lâu, lần sau nghe ngay)</span>
        </span>
      )}
      {cloudFailed && (
        <span className="text-orange-600">
          Không tải được giọng chuẩn. Bấm lại để nghe bằng giọng máy của thiết bị.
          <br />
          <span className="text-gray-500">Lý do: {cloudFailed}</span>
        </span>
      )}
      {/* Không kích hoạt được thì phải NÓI RA lý do. Im lặng thì người dùng chỉ
          thấy "giọng chẳng thay đổi gì" mà không biết vướng ở đâu. */}
      {!prep && !cloudFailed && (
        cloudAvailable && isEnglishLesson ? (
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-gray-500">
            <input
              type="checkbox"
              checked={cloudOn}
              onChange={(e) => setCloudVoiceOn(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600"
            />
            Giọng đọc chuẩn cho đề tiếng Anh
          </label>
        ) : cloudAvailable ? (
          <span className="text-gray-400">
            Đề này không phải tiếng Anh nên đọc bằng giọng máy. Giọng chuẩn chỉ dùng cho
            môn Tiếng Anh hoặc đề có nội dung tiếng Anh.
          </span>
        ) : (
          <span className="text-gray-400">
            Đang đọc bằng giọng máy của thiết bị. Giọng chuẩn chưa bật trên máy chủ —{" "}
            <a href="/import/kiem-tra" className="text-blue-500 underline">
              xem trang kiểm tra
            </a>
            .
          </span>
        )
      )}
    </div>
  );

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submit = (finalAnswers: (string | null)[]) => {
    const score = finalAnswers.filter((a, i) => scoreAnswer(questions[i], a)).length;
    const total = questions.length;

    fetch("/api/quiz-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, score, total }),
    }).catch(() => {});

    sessionStorage.setItem(
      "quizResult",
      JSON.stringify({
        questions,
        answers: finalAnswers,
        lessonId,
        lessonTitle: lesson.title,
        grade: lesson.grade ?? null,
        subjectName: lesson.subjectName ?? null,
      })
    );
    router.push("/result");
  };

  // Timer only runs once user clicks Start.
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); submit(answersRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (questionIndex: number, answer: string) => {
    setCurrent(questionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = answer === "" || answer === "[]" ? null : answer;
      return next;
    });
  };

  const scrollToQuestion = (index: number) => {
    setCurrent(index);
    document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isLow = timeLeft < 60;

  const safeName = (lesson.title || `de-${lessonId}`).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");

  // Export is a Premium feature — non-premium users are sent to the upgrade page.
  function requirePremium(): boolean {
    if (isPremium) return true;
    router.push("/nang-cap");
    return false;
  }

  function downloadDoc(withAnswers: boolean) {
    if (!requirePremium()) return;
    const html = buildExamHtml(lesson, questions, { withAnswers });
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}${withAnswers ? "-co-dap-an" : ""}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPdf(withAnswers: boolean) {
    if (!requirePremium()) return;
    // autoPrint script in the document waits for images to load before
    // opening the print dialog, so figures aren't blank in the PDF.
    const html = buildExamHtml(lesson, questions, { withAnswers, autoPrint: true });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  // ── Start screen ─────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-10">
          <nav className="flex flex-wrap items-center gap-1 text-xs mb-6">
            <a href="/" className="text-blue-500 hover:underline">Trang chủ</a>
            <span className="text-gray-400">›</span>
            {lesson.grade && (
              <>
                <a href={`/lop/${lesson.grade}`} className="text-blue-500 hover:underline">Lớp {lesson.grade}</a>
                <span className="text-gray-400">›</span>
              </>
            )}
            <span className="text-orange-500 font-medium">{lesson.title}</span>
          </nav>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{lesson.title}</h1>
            {(lesson.grade || lesson.subjectName) && (
              <p className="text-sm text-gray-500 mb-6">
                {lesson.subjectName ?? ""}{lesson.subjectName && lesson.grade ? " · " : ""}
                {lesson.grade ? `Lớp ${lesson.grade}` : ""}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-7">
              <div className="bg-gray-50 rounded-xl border border-gray-100 py-4">
                <div className="text-2xl font-extrabold text-gray-800">{questions.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Câu hỏi</div>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 py-4">
                <div className="text-2xl font-extrabold text-gray-800">{durationMinutes}</div>
                <div className="text-xs text-gray-500 mt-0.5">Phút</div>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                Bài này chưa có câu hỏi nào.
              </div>
            ) : null}

            {questions.length > 0 && (
              <div className="mb-6 space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
                {/* Nghe cả bài ngay ở màn hình đầu — nghe trước khi đồng hồ chạy */}
                {canListen && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={readAll}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
                        readingAll
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {readingAll ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <rect x="5" y="5" width="10" height="10" rx="1.5" />
                          </svg>
                          Dừng đọc
                          {readingIdx !== null && (
                            <span className="font-normal opacity-90">· câu {readingIdx + 1}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
                            <path strokeLinecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
                          </svg>
                          Nghe cả bài ({questions.length} câu)
                        </>
                      )}
                    </button>
                    {useCloud ? (
                      // Đang dùng giọng đám mây thì danh sách giọng máy của
                      // thiết bị không còn liên quan — chọn trong giọng đám mây.
                      <label className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        Giọng Anh
                        <select
                          value={cloudVoice}
                          onChange={(e) => setCloudVoice(e.target.value)}
                          className="max-w-[10.5rem] rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          {(cloud?.voices ?? []).map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <>
                        <VoicePicker lang="vi-VN" label="Giọng Việt" />
                        <VoicePicker lang="en-US" label="Giọng Anh" />
                      </>
                    )}
                    <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-0.5">
                      <span className="px-1.5 text-[11px] text-gray-400">Tốc độ</span>
                      {RATE_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => changeRate(o.value)}
                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                            rate === o.value ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    {cloudStatus}
                  </div>
                )}

                {/* Trộn thứ tự — áp dụng khi bấm Bắt đầu */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={shuffleQ}
                      onChange={(e) => setShuffleQuestions(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    />
                    Trộn thứ tự câu hỏi
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={shuffleO}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    />
                    Trộn thứ tự đáp án
                  </label>
                </div>
                <p className="text-[11px] text-gray-400">
                  Trộn giúp bé không học vẹt theo vị trí. Áp dụng khi bấm Bắt đầu và giữ nguyên
                  suốt bài; lựa chọn được nhớ cho lần sau.
                </p>
              </div>
            )}

            <button
              onClick={start}
              disabled={questions.length === 0}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base px-10 py-3.5 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              Bắt đầu làm bài
            </button>

            <p className="text-[11px] text-gray-400 mt-3">
              Đồng hồ bắt đầu đếm sau khi bấm. Hết giờ tự nộp bài.
            </p>

            {questions.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-gray-400 mr-1">Tải đề{isPremium ? ":" : " 🔒:"}</span>
                <button
                  onClick={() => downloadDoc(false)}
                  className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Word (.doc)
                </button>
                <button
                  onClick={() => openPdf(false)}
                  className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  PDF
                </button>
                <button
                  onClick={() => downloadDoc(true)}
                  className="text-xs font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-colors"
                  title="Tải kèm đáp án"
                >
                  + Đáp án
                </button>
              </div>
            )}

            <a
              href={`/import/edit/${lessonId}`}
              className="inline-flex items-center gap-1 mt-5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
              Sửa đề
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz running ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-6">
          <nav className="flex flex-wrap items-center gap-1 text-xs mb-5">
            <span className="flex items-center gap-1">
              <a href="/" className="text-blue-500 hover:underline">Trang chủ</a>
              <span className="text-gray-400">›</span>
            </span>
            {lesson.grade && (
              <span className="flex items-center gap-1">
                <a href={`/lop/${lesson.grade}`} className="text-blue-500 hover:underline">Lớp {lesson.grade}</a>
                <span className="text-gray-400">›</span>
              </span>
            )}
            {lesson.subjectName && (
              <span className="flex items-center gap-1">
                <a href={lesson.grade ? `/lop/${lesson.grade}?subject=${encodeURIComponent(lesson.subjectName)}` : '#'} className="text-blue-500 hover:underline">
                  {lesson.subjectName}
                </a>
                <span className="text-gray-400">›</span>
              </span>
            )}
            <span className="text-orange-500 font-medium">{lesson.title}</span>
          </nav>

          <div className="flex items-center justify-center gap-3 mb-5">
            <h1 className="text-xl font-bold text-gray-800">{lesson.title}</h1>
            <a
              href={`/import/edit/${lessonId}`}
              title="Chỉnh sửa bài học"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
              Sửa đề
            </a>
          </div>

          <div className={`flex items-center justify-center gap-2 font-mono font-bold text-2xl ${isLow ? "text-red-500 animate-pulse" : "text-green-500"}`}>
            <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 7v5l3 2" />
            </svg>
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Nghe cả bài + tốc độ đọc — ẩn khi trình duyệt không hỗ trợ */}
          {canListen && questions.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={readAll}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  readingAll
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {readingAll ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="5" y="5" width="10" height="10" rx="1.5" />
                    </svg>
                    Dừng đọc
                    {readingIdx !== null && (
                      <span className="font-normal opacity-90">· câu {readingIdx + 1}</span>
                    )}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
                      <path strokeLinecap="round" d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" />
                    </svg>
                    Nghe cả bài ({questions.length} câu)
                  </>
                )}
              </button>

              <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 p-0.5">
                <span className="px-1.5 text-[11px] text-gray-400">Tốc độ</span>
                {RATE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => changeRate(o.value)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
                      rate === o.value
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {cloudStatus}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[70%_30%] gap-5 items-start">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              selectedAnswer={answers[i]}
              onSelect={(answer) => handleSelect(i, answer)}
              cloudVoice={useCloud ? cloudVoice : null}
            />
          ))}
        </div>

        <QuestionPalette
          total={questions.length}
          current={current}
          answers={answers}
          onJump={scrollToQuestion}
          onSubmit={() => submit(answers)}
        />
      </div>
    </div>
  );
}
