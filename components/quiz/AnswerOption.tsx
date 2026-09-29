import { LABELS } from "@/lib/quizData";
import MathText from "@/components/MathText";

interface AnswerOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  variant?: "radio" | "checkbox";
}

/**
 * Một đáp án dạng thẻ to, cả thẻ là vùng bấm (ngón tay bé dễ trúng), có ô chữ
 * cái A/B/C/D giống trang kết quả. Chọn thì thẻ chuyển xanh và "lún" xuống.
 */
export default function AnswerOption({
  option,
  index,
  isSelected,
  onSelect,
  variant = "radio",
}: AnswerOptionProps) {
  const isCheckbox = variant === "checkbox";
  return (
    <button
      type="button"
      role={isCheckbox ? "checkbox" : "radio"}
      aria-checked={isSelected}
      onClick={onSelect}
      className={`flex w-full min-h-[52px] items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 border-b-2 translate-y-0.5"
          : "border-gray-200 border-b-[5px] bg-white hover:border-blue-300 active:translate-y-0.5 active:border-b-2"
      }`}
    >
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center text-sm font-extrabold transition-colors ${
          isCheckbox ? "rounded-lg" : "rounded-full"
        } ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}
      >
        {isSelected && isCheckbox ? "✓" : LABELS[index]}
      </span>
      <span className={`text-base leading-snug ${isSelected ? "font-semibold text-blue-900" : "text-gray-800"}`}>
        <MathText text={option} />
      </span>
    </button>
  );
}
