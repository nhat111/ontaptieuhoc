import Link from 'next/link'
import { getGradeColor } from '@/lib/utils'
import type { Grade } from '@/lib/types'

const GRADE_ICONS: Record<number, string> = {
  6: '🌱', 7: '📚', 8: '🔬', 9: '⚡', 10: '🎯', 11: '🚀', 12: '🏆'
}

interface Props {
  grades: Grade[]
}

export function GradeCards({ grades }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Chọn lớp học</h2>
        <p className="text-gray-500 mt-2">Từ lớp 6 đến lớp 12, đầy đủ tất cả các môn</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        {grades.map(g => (
          <Link
            key={g.id}
            href={`/grade/${g.slug}`}
            className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`bg-gradient-to-br ${getGradeColor(g.order_index)} p-5 text-white text-center h-full`}>
              <div className="text-4xl mb-2">{GRADE_ICONS[g.order_index] ?? '📖'}</div>
              <div className="font-bold text-lg">{g.name}</div>
              <div className="text-xs text-white/70 mt-1">Luyện tập ngay</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
