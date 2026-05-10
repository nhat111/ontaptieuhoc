'use client'

import { cn } from '@/lib/utils'
import { MathRenderer } from '@/components/ui/MathRenderer'
import type { Option } from '@/lib/types'

interface Props {
  option: Option
  selected: boolean
  revealed: boolean
  onSelect: (id: string) => void
}

export function AnswerOption({ option, selected, revealed, onSelect }: Props) {
  const correct = revealed && option.is_correct
  const wrong   = revealed && selected && !option.is_correct

  return (
    <button
      onClick={() => !revealed && onSelect(option.id)}
      disabled={revealed}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200',
        !revealed && !selected && 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50',
        !revealed && selected  && 'border-indigo-500 bg-indigo-50',
        correct                && 'border-green-500 bg-green-50',
        wrong                  && 'border-red-400 bg-red-50',
        revealed && !selected && !option.is_correct && 'opacity-60'
      )}
    >
      <span className={cn(
        'flex-shrink-0 w-7 h-7 rounded-lg border-2 text-xs font-bold flex items-center justify-center transition-all',
        !revealed && !selected && 'border-gray-300 text-gray-500',
        !revealed && selected  && 'border-indigo-500 bg-indigo-500 text-white',
        correct                && 'border-green-500 bg-green-500 text-white',
        wrong                  && 'border-red-400 bg-red-400 text-white',
      )}>
        {correct ? '✓' : wrong ? '✗' : option.label}
      </span>
      <span className="flex-1 text-sm text-gray-700 leading-relaxed">
        <MathRenderer content={option.content} />
      </span>
    </button>
  )
}
