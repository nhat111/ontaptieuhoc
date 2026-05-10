import { LABELS } from "@/lib/quizData";
import MathText from "@/components/MathText";

interface AnswerOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export default function AnswerOption({ option, index, isSelected, onSelect }: AnswerOptionProps) {
  return (
    <label
      onClick={onSelect}
      className="flex items-center gap-3 cursor-pointer group py-1.5"
    >
      {/* Radio circle */}
      <div
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isSelected
            ? "border-orange-500 bg-orange-500"
            : "border-gray-300 group-hover:border-orange-400"
        }`}
      >
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>

      {/* Option text */}
      <span className={`text-sm leading-relaxed ${isSelected ? "font-medium text-gray-900" : "text-gray-700"}`}>
        {LABELS[index]}. <MathText text={option} />
      </span>
    </label>
  );
}
