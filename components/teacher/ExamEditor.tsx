'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionEditor } from './QuestionEditor'
import { createLesson, createQuestion, createOptions } from '@/lib/actions'
import { slugify } from '@/lib/utils'
import type { Grade, Subject } from '@/lib/types'

interface OptionDraft { label: string; content: string; is_correct: boolean }
interface QuestionDraft {
  type: 'single' | 'multiple'
  difficulty: 'easy' | 'medium' | 'hard'
  content: string
  explanation: string
  options: OptionDraft[]
}

function defaultQuestion(index: number): QuestionDraft {
  return {
    type: 'single',
    difficulty: 'medium',
    content: '',
    explanation: '',
    options: [
      { label: 'A', content: '', is_correct: false },
      { label: 'B', content: '', is_correct: false },
      { label: 'C', content: '', is_correct: false },
      { label: 'D', content: '', is_correct: false },
    ],
  }
}

interface Props {
  grades: Grade[]
  subjects: Subject[]
}

export function ExamEditor({ grades, subjects }: Props) {
  const router = useRouter()
  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [gradeId, setGradeId]   = useState('')
  const [subjectId, setSubId]   = useState('')
  const [questions, setQuestions] = useState<QuestionDraft[]>([defaultQuestion(0)])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const addQuestion = () => setQuestions(prev => [...prev, defaultQuestion(prev.length)])

  const updateQuestion = (i: number, q: QuestionDraft) =>
    setQuestions(prev => { const next = [...prev]; next[i] = q; return next })

  const removeQuestion = (i: number) =>
    setQuestions(prev => prev.filter((_, j) => j !== i))

  const duplicateQuestion = (i: number) =>
    setQuestions(prev => {
      const next = [...prev]
      next.splice(i + 1, 0, JSON.parse(JSON.stringify(prev[i])))
      return next
    })

  const handleSave = async () => {
    if (!title.trim() || !gradeId || !subjectId) {
      setError('Vui lòng điền đầy đủ: tiêu đề, lớp và môn học')
      return
    }
    if (questions.some(q => !q.content.trim())) {
      setError('Mỗi câu hỏi phải có nội dung')
      return
    }
    setError('')
    setSaving(true)

    const lessonId = await createLesson({
      title: title.trim(),
      slug: `${slugify(title)}-${Date.now()}`,
      description: description.trim(),
      grade_id: gradeId,
      subject_id: subjectId,
      order_index: 0,
    })

    if (!lessonId) { setSaving(false); setError('Lỗi khi tạo bài học'); return }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const qId = await createQuestion({
        lesson_id: lessonId,
        type: q.type,
        difficulty: q.difficulty,
        content: q.content,
        explanation: q.explanation,
        order_index: i,
      })
      if (!qId) continue
      await createOptions(q.options.map(o => ({ question_id: qId, label: o.label, content: o.content, is_correct: o.is_correct })))
    }

    setSaving(false)
    router.push(`/lesson/${slugify(title)}-${Date.now()}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tạo bài kiểm tra mới</h1>
        <p className="text-gray-500 text-sm mt-1">Điền thông tin và thêm câu hỏi cho bài học</p>
      </div>

      {/* Lesson meta */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Tiêu đề bài học *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="VD: Chương 1: Mệnh đề và tập hợp"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Lớp *</label>
            <select
              value={gradeId}
              onChange={e => setGradeId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Chọn lớp</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Môn học *</label>
            <select
              value={subjectId}
              onChange={e => setSubId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Chọn môn</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Mô tả (tuỳ chọn)</label>
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            rows={2}
            placeholder="Mô tả ngắn về nội dung bài học..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-5">
        {questions.map((q, i) => (
          <QuestionEditor
            key={i}
            index={i}
            value={q}
            onChange={updated => updateQuestion(i, updated)}
            onRemove={() => removeQuestion(i)}
            onDuplicate={() => duplicateQuestion(i)}
          />
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-medium rounded-2xl hover:bg-indigo-50 transition-colors mb-6"
      >
        + Thêm câu hỏi
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Đang lưu...' : `Lưu bài kiểm tra (${questions.length} câu)`}
      </button>
    </div>
  )
}
