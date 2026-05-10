import Link from 'next/link'

export function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 lg:p-16 text-center border border-indigo-100">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
          Sẵn sàng bắt đầu chưa?
        </h2>
        <p className="text-gray-600 text-lg max-w-xl mx-auto mb-8">
          Hàng nghìn câu hỏi đang chờ bạn. Luyện tập mỗi ngày, tiến bộ mỗi ngày.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/grade/lop-10"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Bắt đầu luyện tập
          </Link>
          <Link
            href="/teacher/create-exam"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            Tạo đề thi
          </Link>
        </div>
      </div>
    </section>
  )
}
