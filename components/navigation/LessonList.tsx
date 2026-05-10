import Link from 'next/link'
import { DifficultyBadge, CountBadge } from '@/components/ui/Badge'
import type { Lesson } from '@/lib/types'

interface Props {
  lessons: Lesson[]
}

export function LessonList({ lessons }: Props) {
  if (lessons.length === 0)
    return (
      <div className="py-16 text-center text-gray-400">
        <div className="text-5xl mb-3">📭</div>
        <p>Chưa có bài học nào trong phần này</p>
      </div>
    )

  return (
    <div className="space-y-3">
      {lessons.map((lesson, i) => (
        <Link
          key={lesson.id}
          href={`/lesson/${lesson.slug}`}
          className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate group-hover:text-indigo-700 transition-colors">
              {lesson.title}
            </p>
            {lesson.description && (
              <p className="text-sm text-gray-500 truncate mt-0.5">{lesson.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <CountBadge count={lesson.question_count ?? 0} label="câu" />
            <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}
