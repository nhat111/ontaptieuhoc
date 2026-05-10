import { formatDate } from '@/lib/utils'
import type { QuizResult } from '@/lib/types'

interface Props {
  results: QuizResult[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export function RankingSidebar({ results }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>🏆</span> Bảng xếp hạng
      </h3>

      {results.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Chưa có kết quả nào</p>
      ) : (
        <div className="space-y-2">
          {results.map((r, i) => {
            const pct = Math.round((r.score / r.total_questions) * 100)
            return (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="text-lg w-7 text-center">{MEDALS[i] ?? `${i + 1}.`}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{pct}%</span>
                    <span className="text-xs text-gray-400">{r.score}/{r.total_questions}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
