import { LABELS } from "@/lib/quizData";
import MathText from "@/components/MathText";

interface AnswerOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  variant?: "radio" | "checkbox";
}

export default function AnswerOption({
  option,
  index,
  isSelected,
  onSelect,
  variant = "radio",
}: AnswerOptionProps) {
  const isCheckbox = variant === "checkbox";
  return (
    <label
      onClick={onSelect}
      className="flex items-center gap-3 cursor-pointer group py-1.5"
    >
      <div
        className={`w-5 h-5 ${isCheckbox ? "rounded-md" : "rounded-full"} border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isSelected
            ? "border-orange-500 bg-orange-500"
            : "border-gray-300 group-hover:border-orange-400"
        }`}
      >
        {isSelected && (
          isCheckbox ? (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className="w-2 h-2 rounded-full bg-white" />
          )
        )}
      </div>

      <span className={`text-sm leading-relaxed ${isSelected ? "font-medium text-gray-900" : "text-gray-700"}`}>
        {LABELS[index]}. <MathText text={option} />
      </span>
    </label>
  );
}
