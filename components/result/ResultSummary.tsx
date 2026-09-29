import { Burst, Mascot } from "@/components/games/Fx";

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
  // Sao cho bé: 3 sao từ 85%, 2 sao từ 70%, 1 sao từ 50%.
  const stars = pct >= 85 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  const cheer =
    pct >= 85 ? "Xuất sắc! Bé giỏi quá!" : pct >= 70 ? "Làm tốt lắm!" : pct >= 50 ? "Khá rồi, cố thêm chút nữa nhé!" : "Không sao, mình làm lại nhé!";

  return (
    <div className={`relative ${bgCls} border ${borderCls} rounded-3xl p-6 mb-6 shadow-sm`}>
      {stars >= 2 && <Burst key={pct} id={pct} />}
      <Mascot mood={stars >= 1 ? "happy" : "idle"} text={cheer} beat={0} />
      <div className="flex justify-center gap-1 text-4xl mb-2" aria-label={`${stars} trên 3 sao`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`inline-block motion-safe:animate-pop ${i < stars ? "" : "opacity-20 grayscale"}`}
            style={{ animationDelay: `${150 + i * 200}ms` }}
          >
            ⭐
          </span>
        ))}
      </div>
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
          <div key={label} className="bg-white rounded-2xl py-3 shadow-sm">
            <div className={`text-2xl font-bold ${cls}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
