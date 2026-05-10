'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, getGradeColor } from '@/lib/utils'
import type { Grade } from '@/lib/types'

interface Props {
  grades: Grade[]
}

export function GradeMenu({ grades }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2">
      {grades.map(g => {
        const active = pathname.includes(g.slug)
        return (
          <Link
            key={g.id}
            href={`/grade/${g.slug}`}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
              active
                ? `bg-gradient-to-r ${getGradeColor(g.order_index)} text-white shadow-md`
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            )}
          >
            {g.name}
          </Link>
        )
      })}
    </div>
  )
}
