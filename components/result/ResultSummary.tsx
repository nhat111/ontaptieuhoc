import { Star } from "lucide-react";
import { Burst } from "@/components/games/Fx";

interface ResultSummaryProps {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
}

function getGrade(pct: number) {
  if (pct >= 85) return { label: "Giỏi", textCls: "text-emerald-600" };
  if (pct >= 70) return { label: "Khá", textCls: "text-blue-600" };
  if (pct >= 50) return { label: "Trung bình", textCls: "text-amber-600" };
  return { label: "Cần cố gắng", textCls: "text-rose-600" };
}

export default function ResultSummary({ correct, wrong, unanswered, total }: ResultSummaryProps) {
  const pct = Math.round((correct / total) * 100);
  const { label, textCls } = getGrade(pct);
  // Sao cho bé: 3 sao từ 85%, 2 sao từ 70%, 1 sao từ 50%.
  const stars = pct >= 85 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  const cheer =
    pct >= 85 ? "Xuất sắc! Bé giỏi quá!" : pct >= 70 ? "Làm tốt lắm!" : pct >= 50 ? "Khá rồi, cố thêm chút nữa nhé!" : "Không sao, mình làm lại nhé!";

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl p-6 mb-6">
      {stars >= 2 && <Burst key={pct} id={pct} />}
      <div className="flex justify-center gap-1.5 mb-3" aria-label={`${stars} trên 3 sao`}>
        {[0, 1, 2].map((i) => (
          <Star
            key={i}
            className={`h-8 w-8 motion-safe:animate-pop ${i < stars ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`}
            style={{ animationDelay: `${150 + i * 200}ms` }}
            aria-hidden
          />
        ))}
      </div>
      <div className="text-center mb-6">
        <div className="text-5xl font-bold tracking-tight tabular-nums text-slate-900">
          {correct}<span className="text-slate-300">/{total}</span>
        </div>
        <div className="mt-1 text-sm font-medium">
          <span className={textCls}>{pct}% · {label}</span>
          <span className="text-slate-500"> — {cheer}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 text-center">
        {[
          { value: correct, label: "Đúng", cls: "text-emerald-600" },
          { value: wrong, label: "Sai", cls: "text-rose-600" },
          { value: unanswered, label: "Bỏ qua", cls: "text-slate-400" },
        ].map(({ value, label, cls }) => (
          <div key={label} className="py-3">
            <div className={`text-xl font-semibold tabular-nums ${cls}`}>{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
