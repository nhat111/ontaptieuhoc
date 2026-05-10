import { MathRenderer } from '@/components/ui/MathRenderer'
import { DifficultyBadge } from '@/components/ui/Badge'
import type { Question, AnswerRecord } from '@/lib/types'

interface Props {
  question: Question
  record: AnswerRecord
  index: number
}

export function ResultItem({ question, record, index }: Props) {
  return (
    <div className={`rounded-2xl border p-5 ${record.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className={`flex-shrink-0 w-8 h-8 rounded-xl text-sm font-bold flex items-center justify-center ${record.is_correct ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
          {record.is_correct ? '✓' : '✗'}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500">Câu {index + 1}</span>
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
          <div className="text-sm text-gray-800 font-medium">
            <MathRenderer content={question.content} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 ml-11">
        {(question.options ?? []).map(opt => {
          const userSelected = record.selected.includes(opt.id)
          return (
            <div
              key={opt.id}
              className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                opt.is_correct      ? 'bg-green-100 text-green-800'
                : userSelected      ? 'bg-red-100 text-red-800'
                :                     'text-gray-600'
              }`}
            >
              <span className="font-bold flex-shrink-0">{opt.label}.</span>
              <MathRenderer content={opt.content} />
              {opt.is_correct  && <span className="ml-auto text-green-600 font-bold text-xs flex-shrink-0">✓</span>}
              {userSelected && !opt.is_correct && <span className="ml-auto text-red-500 font-bold text-xs flex-shrink-0">✗</span>}
            </div>
          )
        })}
      </div>

      {question.explanation && (
        <div className="ml-11 mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs font-semibold text-blue-700 mb-1">Giải thích</p>
          <div className="text-xs text-blue-800">
            <MathRenderer content={question.explanation} />
          </div>
        </div>
      )}
    </div>
  )
}
