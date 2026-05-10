'use client'

import { useState } from 'react'
import { MathRenderer } from '@/components/ui/MathRenderer'
import { cn } from '@/lib/utils'

interface OptionDraft {
  label: string
  content: string
  is_correct: boolean
}

interface QuestionDraft {
  type: 'single' | 'multiple'
  difficulty: 'easy' | 'medium' | 'hard'
  content: string
  explanation: string
  options: OptionDraft[]
}

interface Props {
  index: number
  value: QuestionDraft
  onChange: (q: QuestionDraft) => void
  onRemove: () => void
  onDuplicate: () => void
}

const LABELS = ['A', 'B', 'C', 'D', 'E']

export function QuestionEditor({ index, value, onChange, onRemove, onDuplicate }: Props) {
  const [previewMath, setPreviewMath] = useState(false)

  const update = (patch: Partial<QuestionDraft>) => onChange({ ...value, ...patch })

  const updateOption = (i: number, patch: Partial<OptionDraft>) => {
    const options = [...value.options]
    options[i] = { ...options[i], ...patch }
    if (value.type === 'single' && patch.is_correct) {
      options.forEach((o, j) => { if (j !== i) o.is_correct = false })
    }
    update({ options })
  }

  const addOption = () => {
    if (value.options.length >= 5) return
    update({ options: [...value.options, { label: LABELS[value.options.length], content: '', is_correct: false }] })
  }

  const removeOption = (i: number) => {
    update({ options: value.options.filter((_, j) => j !== i).map((o, j) => ({ ...o, label: LABELS[j] })) })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Câu {index + 1}
        </span>
        <div className="flex gap-2">
          <select
            value={value.type}
            onChange={e => update({ type: e.target.value as 'single' | 'multiple' })}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          >
            <option value="single">Một đáp án</option>
            <option value="multiple">Nhiều đáp án</option>
          </select>
          <select
            value={value.difficulty}
            onChange={e => update({ difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
          <button onClick={onDuplicate} title="Nhân đôi" className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">📋</button>
          <button onClick={onRemove} title="Xóa" className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">🗑️</button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-600">Nội dung câu hỏi (hỗ trợ $LaTeX$)</label>
          <button
            onClick={() => setPreviewMath(p => !p)}
            className="text-xs text-indigo-600 hover:underline"
          >
            {previewMath ? 'Chỉnh sửa' : 'Xem trước'}
          </button>
        </div>
        {previewMath ? (
          <div className="min-h-[80px] border border-gray-200 rounded-xl p-3 bg-gray-50 text-sm">
            <MathRenderer content={value.content} />
          </div>
        ) : (
          <textarea
            value={value.content}
            onChange={e => update({ content: e.target.value })}
            rows={3}
            placeholder="Nhập nội dung câu hỏi, dùng $...$ cho công thức toán..."
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {value.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => updateOption(i, { is_correct: !opt.is_correct })}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-lg border-2 text-xs font-bold transition-all',
                opt.is_correct ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-500 hover:border-green-400'
              )}
            >
              {opt.label}
            </button>
            <input
              value={opt.content}
              onChange={e => updateOption(i, { content: e.target.value })}
              placeholder={`Đáp án ${opt.label}`}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {value.options.length > 2 && (
              <button onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500 transition-colors text-xs">✕</button>
            )}
          </div>
        ))}
        {value.options.length < 5 && (
          <button onClick={addOption} className="text-xs text-indigo-600 hover:underline mt-1">
            + Thêm đáp án
          </button>
        )}
      </div>

      {/* Explanation */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Giải thích (tuỳ chọn)</label>
        <textarea
          value={value.explanation}
          onChange={e => update({ explanation: e.target.value })}
          rows={2}
          placeholder="Giải thích đáp án đúng..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
    </div>
  )
}
