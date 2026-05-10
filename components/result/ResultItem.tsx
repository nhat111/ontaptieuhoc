import { Question, LABELS } from "@/lib/quizData";
import MathText from "@/components/MathText";

const STATUS = {
  skipped: { border: "border-gray-200", icon: "—", cls: "bg-gray-200 text-gray-600" },
  correct:  { border: "border-green-300", icon: "✓", cls: "bg-green-500 text-white" },
  incorrect: { border: "border-red-300", icon: "✗", cls: "bg-red-500 text-white" },
};

interface ResultItemProps {
  question: Question;
  userAnswer: string | null;
  index: number;
}

export default function ResultItem({ question, userAnswer, index }: ResultItemProps) {
  const isCorrect = userAnswer === question.correctAnswer;
  const isSkipped = userAnswer === null;
  const status = STATUS[isSkipped ? "skipped" : isCorrect ? "correct" : "incorrect"];

  return (
    <div className={`bg-white rounded-xl border-2 ${status.border} p-4`}>
      <div className="flex items-start gap-3 mb-3">
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${status.cls}`}>
          {status.icon}
        </span>
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          <span className="text-gray-400 mr-1">Câu {index + 1}.</span>
          <MathText text={question.question} />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 ml-10">
        {question.options.map((opt, i) => {
          const isRight = opt === question.correctAnswer;
          const isUser = opt === userAnswer;
          const optCls = isRight
            ? "bg-green-50 border-green-300 text-green-700"
            : isUser && !isRight
            ? "bg-red-50 border-red-300 text-red-700"
            : "border-gray-100 text-gray-500";
          const circleCls = isRight
            ? "bg-green-500 text-white"
            : isUser
            ? "bg-red-400 text-white"
            : "bg-gray-200 text-gray-500";

          return (
            <div key={opt} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${optCls}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${circleCls}`}>
                {LABELS[i]}
              </span>
              <span className="truncate"><MathText text={opt} /></span>
              {isRight && <span className="ml-auto font-bold">✓</span>}
            </div>
          );
        })}
      </div>

      {isSkipped && (
        <p className="ml-10 text-xs text-gray-400 mt-2">
          Đáp án đúng: <span className="font-semibold text-green-600"><MathText text={question.correctAnswer} /></span>
        </p>
      )}
    </div>
  );
}
