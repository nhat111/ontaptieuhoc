import { Question } from "@/lib/quizData";
import AnswerOption from "./AnswerOption";
import MathText from "@/components/MathText";

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
}

export default function QuestionCard({ question, index, selectedAnswer, onSelect }: QuestionCardProps) {
  return (
    <div id={`question-${index}`} className="p-6 scroll-mt-20">
      {/* Question header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-2 flex-1">
          <span className="font-bold text-gray-800 text-base flex-shrink-0">{index + 1}.</span>
          <p className="text-gray-800 font-medium text-base leading-relaxed"><MathText text={question.question} /></p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Nhận biết</span>
          <span className="text-orange-400">🚩</span>
        </div>
      </div>

      {/* Options */}
      <div className="pl-5 space-y-1">
        {question.options.map((opt, i) => (
          <AnswerOption
            key={opt}
            option={opt}
            index={i}
            isSelected={selectedAnswer === opt}
            onSelect={() => onSelect(opt)}
          />
        ))}
      </div>
    </div>
  );
}
