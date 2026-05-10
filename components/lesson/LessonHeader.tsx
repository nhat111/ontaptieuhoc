import Link from 'next/link'
import { GradeBadge, SubjectBadge, CountBadge } from '@/components/ui/Badge'
import type { Lesson } from '@/lib/types'

interface Props {
  lesson: Lesson
}

export function LessonHeader({ lesson }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-indigo-600">Trang chủ</Link>
        <span>/</span>
        {lesson.grade && (
          <>
            <Link href={`/grade/${lesson.grade.slug}`} className="hover:text-indigo-600">
              {lesson.grade.name}
            </Link>
            <span>/</span>
          </>
        )}
        {lesson.subject && lesson.grade && (
          <>
            <Link href={`/grade/${lesson.grade.slug}/subject/${lesson.subject.slug}`} className="hover:text-indigo-600">
              {lesson.subject.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-600 truncate">{lesson.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {lesson.thumbnail ? (
          <img src={lesson.thumbnail} alt={lesson.title} className="w-full lg:w-48 h-32 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-full lg:w-48 h-32 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-5xl flex-shrink-0">
            📝
          </div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            {lesson.grade && <GradeBadge name={lesson.grade.name} />}
            {lesson.subject && <SubjectBadge name={lesson.subject.name} color={lesson.subject.color} />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{lesson.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <CountBadge count={lesson.question_count ?? 0} label="câu hỏi" />
            <Link
              href={`/quiz/${lesson.slug}`}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Luyện tập ngay →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
