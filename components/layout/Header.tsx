'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Grade } from '@/lib/types'

interface Props {
  grades: Grade[]
}

export function Header({ grades }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">📖</span>
          <span className="text-xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
            ÔnTập
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {grades.map(g => (
            <Link
              key={g.id}
              href={`/grade/${g.slug}`}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {g.name}
            </Link>
          ))}
          <Link
            href="/teacher/create-exam"
            className="ml-3 px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Giáo viên
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 bg-gray-600 mb-1" />
          <div className="w-5 h-0.5 bg-gray-600 mb-1" />
          <div className="w-5 h-0.5 bg-gray-600" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {grades.map(g => (
            <Link
              key={g.id}
              href={`/grade/${g.slug}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {g.name}
            </Link>
          ))}
          <Link
            href="/teacher/create-exam"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Giáo viên
          </Link>
        </div>
      )}
    </header>
  )
}
