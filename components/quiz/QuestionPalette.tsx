interface QuestionPaletteProps {
  total: number;
  current: number;
  answers: (string | null)[];
  onJump: (index: number) => void;
  onSubmit: () => void;
}

export default function QuestionPalette({ total, current, answers, onJump, onSubmit }: QuestionPaletteProps) {
  const answered = answers.filter(Boolean).length;
  const progress = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
      <h3 className="text-sm font-bold text-blue-600 mb-1">Bảng câu hỏi</h3>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-bold text-orange-500 whitespace-nowrap">
          {answered}/{total}
        </span>
      </div>

      <div className="grid grid-cols-6 gap-1.5 mb-5">
        {Array.from({ length: total }).map((_, i) => {
          const isAnswered = answers[i] !== null;
          const isCurrent = i === current;
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`h-9 w-full rounded-lg text-xs font-semibold transition-all ${
                isCurrent
                  ? "border-2 border-blue-500 text-blue-600 bg-white"
                  : isAnswered
                  ? "bg-orange-400 text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm mb-4"
      >
        Nộp bài
      </button>

      <div className="space-y-1.5 text-xs text-gray-500">
        {[
          { cls: "border-2 border-blue-500", label: "Câu hiện tại" },
          { cls: "bg-orange-400", label: "Đã trả lời" },
          { cls: "bg-gray-100 border border-gray-200", label: "Chưa trả lời" },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded flex-shrink-0 ${cls}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
