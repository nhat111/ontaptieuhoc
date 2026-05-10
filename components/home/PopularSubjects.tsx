import Link from 'next/link'
import { cn, SUBJECT_COLORS } from '@/lib/utils'
import type { Subject } from '@/lib/types'

interface Props {
  subjects: Subject[]
}

export function PopularSubjects({ subjects }: Props) {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Môn học phổ biến</h2>
          <p className="text-gray-500 mt-2">Chọn môn học yêu thích của bạn</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {subjects.map(s => (
            <Link
              key={s.id}
              href={`/grade/lop-10/subject/${s.slug}`}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5 duration-200',
                SUBJECT_COLORS[s.color] ?? 'bg-white text-gray-600 border-gray-200'
              )}
            >
              <span className="text-xl">{s.icon}</span>
              <span>{s.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
