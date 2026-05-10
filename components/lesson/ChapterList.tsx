import Link from 'next/link'
import { DifficultyBadge } from '@/components/ui/Badge'
import { MathRenderer } from '@/components/ui/MathRenderer'
import type { Question } from '@/lib/types'

interface Props {
  lessonSlug: string
  questions: Question[]
}

export function ChapterList({ lessonSlug, questions }: Props) {
  if (questions.length === 0)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
        <div className="text-5xl mb-3">📭</div>
        <p>Chưa có câu hỏi nào</p>
      </div>
    )

  const easy   = questions.filter(q => q.difficulty === 'easy').length
  const medium = questions.filter(q => q.difficulty === 'medium').length
  const hard   = questions.filter(q => q.difficulty === 'hard').length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Summary bar */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-6 flex-wrap">
        <span className="font-semibold text-gray-800">
          {questions.length} câu hỏi
        </span>
        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{easy} dễ</span>
        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">{medium} trung bình</span>
        <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{hard} khó</span>
        <Link
          href={`/quiz/${lessonSlug}`}
          className="ml-auto px-4 py-1.5 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Làm bài
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {questions.map((q, i) => (
          <div key={q.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700 line-clamp-2">
                <MathRenderer content={q.content} />
              </div>
            </div>
            <DifficultyBadge difficulty={q.difficulty} />
          </div>
        ))}
      </div>
    </div>
  )
}
