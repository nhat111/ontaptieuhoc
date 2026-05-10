'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, SUBJECT_COLORS } from '@/lib/utils'
import type { Grade, Subject } from '@/lib/types'

interface Props {
  grade: Grade
  subjects: Subject[]
  activeSubjectSlug?: string
}

export function SubjectTabs({ grade, subjects, activeSubjectSlug }: Props) {
  const pathname = usePathname()

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-1">
      <div className="flex gap-2 min-w-max">
        {subjects.map(s => {
          const active = activeSubjectSlug === s.slug || pathname.includes(s.slug)
          return (
            <Link
              key={s.id}
              href={`/grade/${grade.slug}/subject/${s.slug}`}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border',
                active
                  ? cn(SUBJECT_COLORS[s.color], 'shadow-sm')
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
