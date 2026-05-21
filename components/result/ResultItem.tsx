import { Question, LABELS, scoreAnswer } from "@/lib/quizData";
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

function parseList(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch {
    return [];
  }
}

export default function ResultItem({ question, userAnswer, index }: ResultItemProps) {
  const isSkipped = userAnswer === null || userAnswer === "" || userAnswer === "[]";
  const isCorrect = !isSkipped && scoreAnswer(question, userAnswer);
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

      {question.imageUrl && (
        <div className="ml-10 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt={`Hình minh hoạ câu ${index + 1}`}
            className="max-h-48 max-w-full rounded-lg border border-gray-200 object-contain"
          />
        </div>
      )}

      {(question.type === "mcq" || question.type === "multi") && (
        <McqMultiBody question={question} userAnswer={userAnswer} />
      )}

      {(question.type === "short" || question.type === "numeric") && (
        <ShortBody question={question} userAnswer={userAnswer} isSkipped={isSkipped} isCorrect={isCorrect} />
      )}
    </div>
  );
}

function McqMultiBody({ question, userAnswer }: { question: Question; userAnswer: string | null }) {
  const userSet =
    question.type === "multi"
      ? new Set(userAnswer ? parseList(userAnswer) : [])
      : new Set(userAnswer ? [userAnswer] : []);
  const rightSet =
    question.type === "multi"
      ? new Set(parseList(question.correctAnswer))
      : new Set([question.correctAnswer]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
      {question.options.map((opt, i) => {
        const isRight = rightSet.has(opt);
        const isUser = userSet.has(opt);
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
          <div key={opt + i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${optCls}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${circleCls}`}>
              {LABELS[i]}
            </span>
            <span className="truncate"><MathText text={opt} /></span>
            {isRight && <span className="ml-auto font-bold">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

function ShortBody({
  question,
  userAnswer,
  isSkipped,
  isCorrect,
}: {
  question: Question;
  userAnswer: string | null;
  isSkipped: boolean;
  isCorrect: boolean;
}) {
  const accepted =
    question.type === "short"
      ? question.correctAnswer.split("|").map((s) => s.trim())
      : [question.correctAnswer];

  return (
    <div className="ml-10 space-y-1.5 text-xs">
      <div>
        <span className="text-gray-400">Đáp án của bạn: </span>
        {isSkipped ? (
          <span className="italic text-gray-400">(không trả lời)</span>
        ) : (
          <span className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-600"}`}>
            <MathText text={userAnswer ?? ""} />
          </span>
        )}
      </div>
      <div>
        <span className="text-gray-400">Đáp án đúng: </span>
        <span className="font-semibold text-green-700">
          {accepted.map((a, i) => (
            <span key={i}>
              {i > 0 && <span className="text-gray-400 mx-1">hoặc</span>}
              <MathText text={a} />
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
