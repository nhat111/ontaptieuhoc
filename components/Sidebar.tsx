import type { LeaderboardEntry } from "@/lib/db";

const rankMedal = ["🥇", "🥈", "🥉"];

export default function Sidebar({
  leaderboard = [],
  grade,
}: {
  leaderboard?: LeaderboardEntry[];
  grade?: number;
}) {
  return (
    <div className="space-y-5">
      {/* Leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-1">
          🏆 Bảng xếp hạng{grade ? ` Lớp ${grade}` : ""}
        </h3>
        <p className="text-xs text-gray-400 mb-4">Xếp hạng theo điểm trung bình tốt nhất</p>

        {leaderboard.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Chưa có ai làm bài trong lớp này.
          </p>
        ) : (
          <div className="space-y-1">
            {leaderboard.map((row) => (
              <div
                key={row.rank}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  row.rank <= 3 ? "bg-yellow-50" : "hover:bg-gray-50"
                }`}
              >
                {/* Rank */}
                <span className="w-6 text-center text-base flex-shrink-0">
                  {row.rank <= 3 ? rankMedal[row.rank - 1] : (
                    <span className="text-xs font-bold text-gray-400">{row.rank}</span>
                  )}
                </span>

                {/* Avatar */}
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {row.name.slice(0, 2).toUpperCase()}
                </span>

                {/* Name + lessons */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{row.name}</p>
                  <p className="text-xs text-gray-400">{row.lessonCount} bài đã làm</p>
                </div>

                {/* Score */}
                <span
                  className={`text-sm font-extrabold flex-shrink-0 ${
                    row.avgScore >= 80
                      ? "text-green-600"
                      : row.avgScore >= 50
                      ? "text-yellow-600"
                      : "text-red-500"
                  }`}
                >
                  {row.avgScore}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">🏅 Huy hiệu học tập</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: "🥇", label: "Giỏi", desc: "≥ 80%", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
            { emoji: "🥈", label: "Khá", desc: "≥ 65%", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
            { emoji: "🥉", label: "Trung bình", desc: "≥ 50%", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
            { emoji: "⬜", label: "Chưa làm", desc: "< 50%", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500" },
          ].map((b) => (
            <div key={b.label} className={`${b.bg} border ${b.border} rounded-xl p-3 text-center`}>
              <div className="text-2xl mb-1">{b.emoji}</div>
              <p className={`text-xs font-bold ${b.text}`}>{b.label}</p>
              <p className={`text-xs ${b.text} opacity-70 mt-0.5`}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
