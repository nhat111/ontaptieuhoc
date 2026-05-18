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
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <rect width="36" height="36" rx="9" fill="#2563EB"/>
            {/* Left page */}
            <path d="M8 25V12C8 11.4 8.4 11 9 11H17V26H9C8.4 26 8 25.6 8 25Z" fill="white" fillOpacity="0.85"/>
            {/* Right page */}
            <path d="M28 25V12C28 11.4 27.6 11 27 11H19V26H27C27.6 26 28 25.6 28 25Z" fill="white"/>
            {/* Spine */}
            <rect x="17" y="11" width="2" height="15" rx="0.5" fill="#BFDBFE"/>
            {/* Text lines on left page */}
            <line x1="10" y1="15" x2="15.5" y2="15" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="18" x2="15.5" y2="18" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="21" x2="13.5" y2="21" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Checkmark on right page */}
            <path d="M21 19L23.5 22L27 16" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[17px] font-extrabold text-blue-700 tracking-tight leading-none">Ôn Tập</span>
            <span className="text-[11px] font-bold text-orange-500 tracking-widest leading-none uppercase">Tiểu Học</span>
          </div>
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
