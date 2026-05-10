import Link from 'next/link'
import { cn, getGradeColor, SUBJECT_COLORS } from '@/lib/utils'
import type { Grade, Subject } from '@/lib/types'

interface Props {
  grades: Grade[]
  subjects: Subject[]
  currentGradeSlug?: string
  currentSubjectSlug?: string
}

export function SidebarNavigation({ grades, subjects, currentGradeSlug, currentSubjectSlug }: Props) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lớp học</h3>
        <div className="space-y-1 mb-5">
          {grades.map(g => (
            <Link
              key={g.id}
              href={`/grade/${g.slug}`}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                g.slug === currentGradeSlug
                  ? `bg-gradient-to-r ${getGradeColor(g.order_index)} text-white`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              {g.name}
            </Link>
          ))}
        </div>

        {subjects.length > 0 && (
          <>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Môn học</h3>
            <div className="space-y-1">
              {subjects.map(s => (
                <Link
                  key={s.id}
                  href={currentGradeSlug ? `/grade/${currentGradeSlug}/subject/${s.slug}` : '#'}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    s.slug === currentSubjectSlug
                      ? cn(SUBJECT_COLORS[s.color], 'border')
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
