import Link from 'next/link'
import type { Grade } from '@/lib/types'

interface Props {
  grades: Grade[]
}

export function HeroSection({ grades }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Nền tảng học tập hàng đầu Việt Nam
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
            Luyện tập thông minh
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Học tập hiệu quả
            </span>
          </h1>

          <p className="text-lg text-indigo-200 mb-8 max-w-xl mx-auto">
            Hàng nghìn câu hỏi trắc nghiệm từ lớp 6 đến lớp 12, hỗ trợ công thức toán học với KaTeX.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href="/grade/lop-10"
              className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Bắt đầu luyện tập
            </Link>
            <Link
              href="/teacher/create-exam"
              className="px-8 py-3 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              Dành cho giáo viên
            </Link>
          </div>

          {/* Grade pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {grades.map(g => (
              <Link
                key={g.id}
                href={`/grade/${g.slug}`}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-medium transition-all"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
