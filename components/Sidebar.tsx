import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/db";

// Ba hạng đầu: chỉ tô màu ô số hạng (vàng, bạc, đồng), không dùng emoji huy chương.
const RANK_STYLE = ["bg-amber-100 text-amber-700", "bg-slate-200 text-slate-700", "bg-orange-100 text-orange-700"];

const LEVELS = [
  { label: "Giỏi", desc: "từ 80%", dot: "bg-emerald-500" },
  { label: "Khá", desc: "từ 65%", dot: "bg-blue-500" },
  { label: "Trung bình", desc: "từ 50%", dot: "bg-amber-500" },
  { label: "Cố gắng thêm", desc: "dưới 50%", dot: "bg-slate-300" },
];

export default function Sidebar({
  leaderboard = [],
  grade,
}: {
  leaderboard?: LeaderboardEntry[];
  grade?: number;
}) {
  return (
    <div className="space-y-4">
      {/* Leaderboard */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
          Bảng xếp hạng{grade ? ` lớp ${grade}` : ""}
        </h3>
        <p className="mt-1 mb-4 text-xs leading-relaxed text-slate-500">
          Mỗi bài tính lần làm tốt nhất, tối đa 100 điểm — làm càng nhiều bài càng nhiều điểm.
        </p>

        {leaderboard.length === 0 ? (
          <p className="rounded-lg bg-slate-50 py-6 text-center text-xs text-slate-400">Chưa có ai làm bài trong lớp này.</p>
        ) : (
          <ol className="-mx-2 space-y-0.5">
            {leaderboard.map((row) => (
              <li key={row.rank} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
                    RANK_STYLE[row.rank - 1] ?? "text-slate-400"
                  }`}
                >
                  {row.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{row.name}</p>
                  <p className="text-xs text-slate-400">
                    {row.lessonCount} bài · đúng TB {row.avgScore}%
                  </p>
                </div>
                <span className="flex-shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900">
                  {row.points}
                  <span className="ml-0.5 text-xs font-normal text-slate-400">đ</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Mức xếp loại */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Xếp loại theo điểm</h3>
        <ul className="space-y-2">
          {LEVELS.map((l) => (
            <li key={l.label} className="flex items-center gap-2.5 text-sm">
              <span className={`h-2 w-2 rounded-full ${l.dot}`} aria-hidden />
              <span className="font-medium text-slate-700">{l.label}</span>
              <span className="ml-auto text-xs text-slate-400">{l.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
