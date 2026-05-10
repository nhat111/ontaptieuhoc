import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { QuizResult } from '@/lib/types'

interface Props {
  result: QuizResult
}

export function ResultSummary({ result }: Props) {
  const pct    = Math.round((result.score / result.total_questions) * 100)
  const lesson = result.lesson

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
      <div className="relative inline-flex items-center justify-center mb-6">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={pct >= 50 ? '#4f46e5' : '#ef4444'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-extrabold text-gray-900">{pct}%</div>
          <div className="text-xs text-gray-400">điểm</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        {pct >= 90 ? '🎉 Xuất sắc!' : pct >= 70 ? '👍 Tốt lắm!' : pct >= 50 ? '😊 Đạt yêu cầu' : '💪 Cố gắng thêm nhé!'}
      </h2>

      <div className="grid grid-cols-3 gap-4 mt-6 bg-gray-50 rounded-xl p-4">
        <div>
          <div className="text-2xl font-bold text-green-600">{result.score}</div>
          <div className="text-xs text-gray-500">Đúng</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-500">{result.total_questions - result.score}</div>
          <div className="text-xs text-gray-500">Sai</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-700">{result.total_questions}</div>
          <div className="text-xs text-gray-500">Tổng</div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">{formatDate(result.created_at)}</p>

      {lesson && (
        <div className="flex gap-3 mt-6">
          <Link
            href={`/quiz/${lesson.slug}`}
            className="flex-1 py-2.5 border border-indigo-200 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Làm lại
          </Link>
          <Link
            href={`/lesson/${lesson.slug}`}
            className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Xem bài
          </Link>
        </div>
      )}
    </div>
  )
}
