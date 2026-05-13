"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Lớp 1–5", href: "/#grades" },
  { label: "Tạo bài", href: "/import" },
];

export default function Header() {
  const path = usePathname();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">Ô</span>
          </div>
          <span className="text-xl font-bold text-blue-600">
            Ôn Tập <span className="text-orange-500">Tiểu Học</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV.map(({ label, href }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href.replace("/#", "/"));
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger placeholder + CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/quiz?lessonId=1"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Bắt đầu học
          </Link>
        </div>
      </div>
    </header>
  );
}
