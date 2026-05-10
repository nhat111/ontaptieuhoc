'use client'

import { cn } from '@/lib/utils'

interface Props {
  total: number
  current: number
  answered: Set<number>
  onJump: (i: number) => void
}

export function QuestionPalette({ total, current, answered, onJump }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-20">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Danh sách câu</h3>

      <div className="flex gap-3 text-xs mb-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> Đã làm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Chưa làm
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border-2 border-indigo-500 inline-block" /> Hiện tại
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={cn(
              'w-9 h-9 rounded-lg text-xs font-semibold transition-all',
              i === current   && 'ring-2 ring-indigo-500 ring-offset-1',
              answered.has(i) ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 text-center">
        {answered.size}/{total} câu đã làm
      </div>
    </div>
  )
}
