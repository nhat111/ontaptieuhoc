import { cn, difficultyColor, difficultyLabel, SUBJECT_COLORS } from '@/lib/utils'
import type { Difficulty } from '@/lib/types'

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', difficultyColor(difficulty))}>
      {difficultyLabel(difficulty)}
    </span>
  )
}

export function SubjectBadge({ name, color }: { name: string; color: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', SUBJECT_COLORS[color] ?? 'bg-gray-100 text-gray-600')}>
      {name}
    </span>
  )
}

export function GradeBadge({ name }: { name: string }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
      {name}
    </span>
  )
}

export function CountBadge({ count, label }: { count: number; label: string }) {
  return (
    <span className="text-xs text-gray-500 flex items-center gap-1">
      <span className="font-semibold text-gray-700">{count}</span>
      {label}
    </span>
  )
}
