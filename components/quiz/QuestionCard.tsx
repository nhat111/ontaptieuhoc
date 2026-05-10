'use client'

import { MathRenderer } from '@/components/ui/MathRenderer'
import { DifficultyBadge } from '@/components/ui/Badge'
import { AnswerOption } from './AnswerOption'
import type { Question } from '@/lib/types'

interface Props {
  question: Question
  index: number
  total: number
  selected: string[]
  revealed: boolean
  onSelect: (optionId: string) => void
}

export function QuestionCard({ question, index, total, selected, revealed, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500">Câu {index + 1}/{total}</span>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <div className="text-gray-800 font-medium leading-relaxed mb-5 text-base">
        <MathRenderer content={question.content} />
      </div>

      {question.image_url && (
        <img
          src={question.image_url}
          alt="Question"
          className="rounded-xl mb-5 max-h-60 object-contain border border-gray-100"
        />
      )}

      <div className="space-y-2.5">
        {(question.options ?? []).map(opt => (
          <AnswerOption
            key={opt.id}
            option={opt}
            selected={selected.includes(opt.id)}
            revealed={revealed}
            onSelect={onSelect}
          />
        ))}
      </div>

      {revealed && question.explanation && (
        <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs font-semibold text-blue-700 mb-1">Giải thích</p>
          <div className="text-sm text-blue-800 leading-relaxed">
            <MathRenderer content={question.explanation} />
          </div>
        </div>
      )}
    </div>
  )
}
