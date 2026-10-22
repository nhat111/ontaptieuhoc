import { CheckCircle2, XCircle } from "lucide-react";
import { Question, displayAnswer, scoreAnswer } from "@/lib/quizData";
import AnswerOption from "./AnswerOption";
import MathText from "@/components/MathText";
import SpeakButton from "@/components/SpeakButton";
import { questionSegments } from "@/lib/speech";

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  /** Hiện nút Nghe (lớp 1–2, đề Tiếng Anh — xem lib/readAloud.ts). Mặc định có. */
  speak?: boolean;
  /**
   * Chế độ luyện tập (bài Toán theo sách): đã chọn đáp án thì có nút "Kiểm tra"; bấm rồi
   * câu bị khoá, hiện đúng/sai, đáp án đúng và lời giải. `undefined` = không có nút.
   */
  checked?: boolean;
  onCheck?: () => void;
}

const TYPE_BADGE: Record<Question["type"], string> = {
  mcq: "Trắc nghiệm",
  multi: "Nhiều đáp án",
  short: "Tự luận ngắn",
  numeric: "Trả lời số",
};

export default function QuestionCard({ question, index, selectedAnswer, onSelect, speak = true, checked, onCheck }: QuestionCardProps) {
  // Đã kiểm tra thì khoá câu: đổi đáp án sau khi xem lời giải là tự chấm cho mình.
  const locked = !!checked;
  const select = (answer: string) => { if (!locked) onSelect(answer); };
  // For "multi", selectedAnswer is JSON-stringified string[] of chosen option texts.
  let multiSelected: Set<string> = new Set();
  if (question.type === "multi" && selectedAnswer) {
    try {
      const arr = JSON.parse(selectedAnswer) as string[];
      if (Array.isArray(arr)) multiSelected = new Set(arr);
    } catch {}
  }

  function toggleMulti(opt: string) {
    const next = new Set(multiSelected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    select(JSON.stringify([...next]));
  }

  // Normalize images so legacy `imageUrl` (without `images` array) still renders.
  const allImages =
    question.images && question.images.length > 0
      ? question.images
      : question.imageUrl
      ? [{ url: question.imageUrl, position: "after" as const }]
      : [];
  const imagesBefore = allImages.filter((img) => img.position === "before");
  const imagesAfter = allImages.filter((img) => img.position !== "before");

  return (
    <div id={`question-${index}`} className="p-4 sm:p-6 scroll-mt-20">
      {/* Hàng nhãn riêng phía trên: để câu hỏi được trải hết bề ngang. Trước đây
          nút Nghe + nhãn nằm cùng hàng làm câu hỏi bị ép còn ~100px trên điện thoại. */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-extrabold text-white">Câu {index + 1}</span>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-600">
          {TYPE_BADGE[question.type]}
        </span>
        {speak && (
          <span className="ml-auto">
            {/* Đọc câu hỏi + đáp án cho bé nghe (đề tiếng Anh, hoặc bé lớp 1-2 chưa đọc thạo). */}
            <SpeakButton
              segments={questionSegments(question.question, question.options)}
              audioUrl={question.audioUrl}
              label="Nghe"
            />
          </span>
        )}
      </div>

      {imagesBefore.length > 0 && (
        <div className="mb-3 space-y-3">
          {imagesBefore.map((img, ii) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`b-${ii}`}
              src={img.url}
              alt={`Hình minh hoạ câu ${index + 1}`}
              className="max-h-72 max-w-full rounded-xl border border-gray-200 object-contain"
            />
          ))}
        </div>
      )}
      <p className="mb-4 text-lg font-semibold leading-relaxed text-gray-900 whitespace-pre-wrap">
        <MathText text={question.question} />
      </p>

      {imagesAfter.length > 0 && (
        <div className="mb-4 space-y-3">
          {imagesAfter.map((img, ii) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`a-${ii}`}
              src={img.url}
              alt={`Hình minh hoạ câu ${index + 1}`}
              className="max-h-72 max-w-full rounded-xl border border-gray-200 object-contain"
            />
          ))}
        </div>
      )}

      <div>
        {(question.type === "mcq" || question.type === "multi") && (
          <div className="space-y-2.5">
            {question.options.map((opt, i) => {
              const isSelected =
                question.type === "mcq"
                  ? selectedAnswer === opt
                  : multiSelected.has(opt);
              return (
                <AnswerOption
                  key={opt + i}
                  option={opt}
                  index={i}
                  isSelected={isSelected}
                  variant={question.type === "multi" ? "checkbox" : "radio"}
                  disabled={locked}
                  onSelect={() => (question.type === "multi" ? toggleMulti(opt) : select(opt))}
                />
              );
            })}
          </div>
        )}

        {question.type === "short" && (
          <div>
            <input
              type="text"
              value={selectedAnswer ?? ""}
              onChange={(e) => select(e.target.value)}
              readOnly={locked}
              placeholder="Nhập câu trả lời của bạn..."
              className="w-full max-w-md border-2 border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Không phân biệt hoa-thường và khoảng trắng đầu/cuối.
            </p>
          </div>
        )}

        {question.type === "numeric" && (
          <div>
            <input
              type="text"
              inputMode="decimal"
              value={selectedAnswer ?? ""}
              onChange={(e) => select(e.target.value)}
              readOnly={locked}
              placeholder="Nhập số (vd: 42, 3.14)"
              className="w-full max-w-xs border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Chấp nhận cả dấu phẩy và dấu chấm thập phân.
            </p>
          </div>
        )}
      </div>

      {onCheck && !checked && selectedAnswer !== null && (
        <button
          type="button"
          onClick={onCheck}
          className="mt-4 inline-flex min-h-11 items-center rounded-xl border-2 border-primary-200 bg-white px-4 text-sm font-bold text-primary-700 hover:bg-primary-50"
        >
          Kiểm tra
        </button>
      )}
      {checked && <CheckResult question={question} answer={selectedAnswer} />}
    </div>
  );
}

function CheckResult({ question, answer }: { question: Question; answer: string | null }) {
  const right = scoreAnswer(question, answer);
  return (
    <div className="mt-4 space-y-2" role="status">
      <p className={`flex items-center gap-1.5 text-sm font-bold ${right ? "text-success-700" : "text-coral-700"}`}>
        {right ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <XCircle className="h-5 w-5" aria-hidden />}
        {right ? "Đúng rồi!" : "Chưa đúng."}
        {!right && (
          <span className="font-semibold text-slate-700">
            Đáp án đúng: <MathText text={displayAnswer(question)} />
          </span>
        )}
      </p>
      {question.explanation?.trim() && (
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-slate-700">
          <p className="mb-0.5 text-xs font-semibold text-amber-700">Lời giải</p>
          <div className="whitespace-pre-wrap leading-relaxed">
            <MathText text={question.explanation} />
          </div>
        </div>
      )}
    </div>
  );
}
