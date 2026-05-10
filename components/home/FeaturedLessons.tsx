import Link from 'next/link'
import { GradeBadge, SubjectBadge, CountBadge } from '@/components/ui/Badge'
import type { Lesson } from '@/lib/types'

interface Props {
  lessons: Lesson[]
}

export function FeaturedLessons({ lessons }: Props) {
  if (lessons.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Bài học mới nhất</h2>
          <p className="text-gray-500 mt-1">Được cập nhật thường xuyên bởi giáo viên</p>
        </div>
        <Link href="/grade/lop-10" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          Xem tất cả →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lessons.map(lesson => (
          <Link
            key={lesson.id}
            href={`/lesson/${lesson.slug}`}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden"
          >
            {lesson.thumbnail ? (
              <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-5xl">
                📝
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {lesson.grade && <GradeBadge name={lesson.grade.name} />}
                {lesson.subject && (
                  <SubjectBadge name={lesson.subject.name} color={lesson.subject.color} />
                )}
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors line-clamp-2 mb-2">
                {lesson.title}
              </h3>
              <div className="flex items-center justify-between mt-3">
                <CountBadge count={lesson.question_count ?? 0} label="câu hỏi" />
                <span className="text-xs text-indigo-600 font-medium group-hover:underline">
                  Luyện tập →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
