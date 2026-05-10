interface ResultSummaryProps {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
}

function getGrade(pct: number) {
  if (pct >= 85) return { label: "Giỏi 🥇", textCls: "text-yellow-600", bgCls: "bg-yellow-50", borderCls: "border-yellow-200" };
  if (pct >= 70) return { label: "Khá 🥈", textCls: "text-blue-600", bgCls: "bg-blue-50", borderCls: "border-blue-200" };
  if (pct >= 50) return { label: "Trung bình 🥉", textCls: "text-orange-600", bgCls: "bg-orange-50", borderCls: "border-orange-200" };
  return { label: "Cần cố gắng 💪", textCls: "text-red-600", bgCls: "bg-red-50", borderCls: "border-red-200" };
}

export default function ResultSummary({ correct, wrong, unanswered, total }: ResultSummaryProps) {
  const pct = Math.round((correct / total) * 100);
  const { label, textCls, bgCls, borderCls } = getGrade(pct);

  return (
    <div className={`${bgCls} border ${borderCls} rounded-2xl p-6 mb-6`}>
      <div className="text-center mb-5">
        <div className={`text-6xl font-extrabold ${textCls} mb-1`}>
          {correct}/{total}
        </div>
        <div className={`text-sm font-bold ${textCls}`}>{pct}% · {label}</div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { value: correct, label: "Đúng", cls: "text-green-600" },
          { value: wrong, label: "Sai", cls: "text-red-500" },
          { value: unanswered, label: "Bỏ qua", cls: "text-gray-400" },
        ].map(({ value, label, cls }) => (
          <div key={label} className="bg-white rounded-xl py-3">
            <div className={`text-2xl font-bold ${cls}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
