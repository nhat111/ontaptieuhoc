import { Question } from "@/lib/quizData";
import AnswerOption from "./AnswerOption";
import MathText from "@/components/MathText";
import SpeakButton from "@/components/SpeakButton";
import { questionSegments } from "@/lib/speech";

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
}

const TYPE_BADGE: Record<Question["type"], string> = {
  mcq: "Trắc nghiệm",
  multi: "Nhiều đáp án",
  short: "Tự luận ngắn",
  numeric: "Trả lời số",
};

export default function QuestionCard({ question, index, selectedAnswer, onSelect }: QuestionCardProps) {
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
    onSelect(JSON.stringify([...next]));
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
        <span className="ml-auto">
          {/* Đọc câu hỏi + đáp án cho bé nghe (đề tiếng Anh, hoặc bé lớp 1-2 chưa đọc thạo). */}
          <SpeakButton
            segments={questionSegments(question.question, question.options)}
            audioUrl={question.audioUrl}
            label="Nghe"
          />
        </span>
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
                  onSelect={() => (question.type === "multi" ? toggleMulti(opt) : onSelect(opt))}
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
              onChange={(e) => onSelect(e.target.value)}
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
              onChange={(e) => onSelect(e.target.value)}
              placeholder="Nhập số (vd: 42, 3.14)"
              className="w-full max-w-xs border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">
              Chấp nhận cả dấu phẩy và dấu chấm thập phân.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
