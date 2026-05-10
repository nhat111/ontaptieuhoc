const badges = [
  { emoji: "🥇", label: "Giỏi", desc: "Xuất sắc", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  { emoji: "🥈", label: "Khá", desc: "Hoàn thành tốt", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  { emoji: "🥉", label: "Trung bình", desc: "Đang học", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  { emoji: "⬜", label: "Chưa làm", desc: "Chưa bắt đầu", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500" },
];

const leaderboard = [
  { rank: 1, name: "Nguyễn An", score: 98 },
  { rank: 2, name: "Trần Bình", score: 95 },
  { rank: 3, name: "Lê Châu", score: 92 },
  { rank: 4, name: "Phạm Duy", score: 88 },
  { rank: 5, name: "Hoàng Em", score: 85 },
];

const rankMedal = ["🥇", "🥈", "🥉"];

export default function Sidebar() {
  return (
    <div className="space-y-5">
      {/* Badges */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">🏅 Huy hiệu học tập</h3>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((b) => (
            <div
              key={b.label}
              className={`${b.bg} border ${b.border} rounded-xl p-3 text-center`}
            >
              <div className="text-2xl mb-1">{b.emoji}</div>
              <p className={`text-xs font-bold ${b.text}`}>{b.label}</p>
              <p className={`text-xs ${b.text} opacity-70 mt-0.5`}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3">🏆 Bảng xếp hạng</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="pb-2 text-left font-medium">Hạng</th>
              <th className="pb-2 text-left font-medium">Họ tên</th>
              <th className="pb-2 text-right font-medium">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr key={row.rank} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 text-base w-10">
                  {row.rank <= 3 ? rankMedal[row.rank - 1] : <span className="text-gray-400 text-sm">{row.rank}</span>}
                </td>
                <td className="py-2.5 text-gray-700 font-medium">{row.name}</td>
                <td className="py-2.5 text-right font-bold text-blue-600">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
