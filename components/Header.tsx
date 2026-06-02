"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Lớp 1–5", href: "/#grades" },
  { label: "Đề kiểm tra", href: "/de-thi" },
  { label: "Tạo bài học", href: "/import" },
  { label: "Tạo đề kiểm tra", href: "/import/exam" },
];

function isActivePath(path: string, href: string) {
  if (href === "/") return path === "/";
  if (href.startsWith("/#")) return path === "/";
  return path.startsWith(href);
}

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sb = createClient();
    sb.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setMobileOpen(false); }, [path]);

  async function handleLogout() {
    const sb = createClient();
    await sb.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 rounded-xl px-1 py-0.5 transition-colors hover:bg-slate-50">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <rect width="36" height="36" rx="9" fill="#2563EB"/>
            <path d="M8 25V12C8 11.4 8.4 11 9 11H17V26H9C8.4 26 8 25.6 8 25Z" fill="white" fillOpacity="0.85"/>
            <path d="M28 25V12C28 11.4 27.6 11 27 11H19V26H27C27.6 26 28 25.6 28 25Z" fill="white"/>
            <rect x="17" y="11" width="2" height="15" rx="0.5" fill="#BFDBFE"/>
            <line x1="10" y1="15" x2="15.5" y2="15" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="18" x2="15.5" y2="18" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="21" x2="13.5" y2="21" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M21 19L23.5 22L27 16" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[17px] font-extrabold text-blue-700 tracking-tight leading-none">Ôn Tập</span>
            <span className="text-[11px] font-bold text-orange-500 tracking-widest leading-none uppercase">Tiểu Học</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/70 p-1 text-sm font-medium">
          {NAV.map(({ label, href }) => {
            const active = isActivePath(path, href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-3 py-1.5 transition-all ${
                  active
                    ? "bg-white text-blue-700 font-semibold shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white hover:text-blue-700"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-1.5">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-50"
              >
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:block text-sm text-gray-700 max-w-[120px] truncate">
                  {user.email}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="text-xs text-slate-400">Đăng nhập với</p>
                      <p className="truncate text-sm font-medium text-slate-700">{user.email}</p>
                    </div>
                    <Link
                      href="/progress"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Tiến độ học tập
                    </Link>
                    <Link
                      href="/import"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Tạo bài học
                    </Link>
                    <Link
                      href="/import/exam"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Tạo đề kiểm tra
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
            {NAV.map(({ label, href }) => {
              const active = isActivePath(path, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
