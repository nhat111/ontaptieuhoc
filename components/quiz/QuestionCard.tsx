import { Question } from "@/lib/quizData";
import AnswerOption from "./AnswerOption";
import MathText from "@/components/MathText";

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

  return (
    <div id={`question-${index}`} className="p-6 scroll-mt-20">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="font-bold text-gray-800 text-base flex-shrink-0">{index + 1}.</span>
          <p className="text-gray-800 font-medium text-base leading-relaxed">
            <MathText text={question.question} />
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            {TYPE_BADGE[question.type]}
          </span>
        </div>
      </div>

      {question.imageUrl && (
        <div className="pl-5 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt={`Hình minh hoạ câu ${index + 1}`}
            className="max-h-72 max-w-full rounded-xl border border-gray-200 object-contain"
          />
        </div>
      )}

      <div className="pl-5">
        {(question.type === "mcq" || question.type === "multi") && (
          <div className="space-y-1">
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
              className="w-full max-w-md border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
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
              className="w-full max-w-xs border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-300"
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
