import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📖</span>
              <span className="text-xl font-bold text-indigo-600">ÔnTập</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Nền tảng luyện tập trực tuyến dành cho học sinh THCS &amp; THPT với hàng nghìn câu hỏi được biên soạn kỹ lưỡng.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Lớp học</h4>
            <ul className="space-y-2">
              {['Lớp 10', 'Lớp 11', 'Lớp 12'].map(g => (
                <li key={g}>
                  <Link href={`/grade/${g.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Môn học</h4>
            <ul className="space-y-2">
              {['Toán', 'Vật Lý', 'Hóa Học', 'Sinh Học'].map(s => (
                <li key={s}>
                  <Link href={`/grade/lop-10/subject/${s.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-xs text-gray-400">
          © 2026 ÔnTập. Bản quyền thuộc về nhóm phát triển.
        </div>
      </div>
    </footer>
  )
}
