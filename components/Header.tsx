export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">Ô</span>
          </div>
          <span className="text-xl font-bold text-blue-600">
            Ôn Tập <span className="text-orange-500">Tiểu Học</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-blue-600 transition-colors">Trang chủ</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Môn học</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Đề thi</a>
          <a href="/import" className="hover:text-blue-600 transition-colors">Nhập đề</a>
        </nav>

        {/* CTA */}
        <button className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Bắt đầu học
        </button>
      </div>
    </header>
  );
}
