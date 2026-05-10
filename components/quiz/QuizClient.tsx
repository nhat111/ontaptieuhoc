'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionCard } from './QuestionCard'
import { QuestionPalette } from './QuestionPalette'
import { QuizTimer } from './QuizTimer'
import { saveQuizResult } from '@/lib/actions'
import type { Lesson, Question, AnswerRecord } from '@/lib/types'

interface Props {
  lesson: Lesson
  questions: Question[]
  durationSeconds?: number
}

export function QuizClient({ lesson, questions, durationSeconds = 30 * 60 }: Props) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [submitted, setSubmitted] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  const current = questions[currentIndex]
  const answeredSet = new Set(
    questions.map((_, i) => i).filter(i => (answers[questions[i]?.id] ?? []).length > 0)
  )

  const handleSelect = useCallback((optionId: string) => {
    if (submitted || !current) return
    setAnswers(prev => {
      const existing = prev[current.id] ?? []
      if (current.type === 'single') return { ...prev, [current.id]: [optionId] }
      return {
        ...prev,
        [current.id]: existing.includes(optionId)
          ? existing.filter(id => id !== optionId)
          : [...existing, optionId],
      }
    })
  }, [current, submitted])

  const handleSubmit = async () => {
    setSaving(true)
    setSubmitted(true)
    setShowConfirm(false)

    const records: AnswerRecord[] = questions.map(q => {
      const selected = answers[q.id] ?? []
      const correctIds = (q.options ?? []).filter(o => o.is_correct).map(o => o.id)
      const is_correct =
        selected.length > 0 &&
        selected.length === correctIds.length &&
        selected.every(id => correctIds.includes(id))
      return { question_id: q.id, selected, is_correct }
    })

    const score = records.filter(r => r.is_correct).length
    const id = await saveQuizResult(lesson.id, score, questions.length, records)
    setSaving(false)
    if (id) router.push(`/result/${id}`)
  }

  if (questions.length === 0)
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-5xl mb-3">📭</div>
        <p>Bài học này chưa có câu hỏi nào</p>
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-gray-900 text-lg line-clamp-1">{lesson.title}</h1>
          <p className="text-sm text-gray-500">{questions.length} câu hỏi</p>
        </div>
        <div className="flex items-center gap-3">
          <QuizTimer timeLeft={timeLeft} onTick={setTimeLeft} stopped={submitted} />
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitted || saving}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Nộp bài'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        <div>
          <QuestionCard
            question={current}
            index={currentIndex}
            total={questions.length}
            selected={answers[current.id] ?? []}
            revealed={submitted}
            onSelect={handleSelect}
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-500">{currentIndex + 1} / {questions.length}</span>
            <button
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Tiếp →
            </button>
          </div>
        </div>

        <QuestionPalette
          total={questions.length}
          current={currentIndex}
          answered={answeredSet}
          onJump={setCurrentIndex}
        />
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-3xl text-center mb-3">📋</div>
            <h2 className="text-lg font-bold text-center text-gray-900 mb-2">Xác nhận nộp bài</h2>
            <p className="text-sm text-gray-500 text-center mb-4">
              Bạn đã làm <strong>{answeredSet.size}/{questions.length}</strong> câu.{' '}
              {questions.length - answeredSet.size > 0 &&
                `Còn ${questions.length - answeredSet.size} câu chưa trả lời.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Tiếp tục làm
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
