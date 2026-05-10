import { getSupabaseServer } from './supabase/server'
import type { Question, LessonMeta } from './quizData'
import type { Chapter } from '@/components/ChapterItem'
import type { Lesson } from '@/components/LessonItem'

// ---- Types ----

export type SubjectRow = {
  id: number
  name: string
  grade: number
  order_index: number
}

// ---- Subjects ----

export async function getSubjectsByGrade(grade: number): Promise<SubjectRow[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('subjects')
      .select('*')
      .eq('grade', grade)
      .order('order_index')
    return data ?? []
  } catch {
    return []
  }
}

// ---- Chapters + Lessons ----

export async function getChaptersWithLessons(subjectId: number): Promise<Chapter[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('chapters')
      .select(`
        id, title, order_index,
        lessons ( id, title, index_label, chapter_id, status, order_index, questions(count) )
      `)
      .eq('subject_id', subjectId)
      .order('order_index')

    return (data ?? []).map((ch: any) => {
      const lessons: Lesson[] = (ch.lessons ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((l: any) => ({
          id: l.id,
          index: l.index_label,
          title: l.title,
          questionCount: l.questions?.[0]?.count ?? 0,
          status: l.status as Lesson['status'],
        }))

      const questionCount = lessons.reduce((s, l) => s + l.questionCount, 0)

      return { id: ch.id, title: ch.title, questionCount, lessons }
    })
  } catch {
    return []
  }
}

// ---- Questions ----

export async function getQuestionsFromDB(lessonId: number): Promise<Question[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('questions')
      .select('id, content, options, correct_answer')
      .eq('lesson_id', lessonId)
      .order('order_index')

    return (data ?? []).map((q: any) => ({
      id: q.id,
      question: q.content,
      options: q.options as string[],
      correctAnswer: q.correct_answer,
    }))
  } catch {
    return []
  }
}

// ---- Lesson meta ----

export async function getLessonMetaFromDB(lessonId: number): Promise<LessonMeta> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('id, title')
      .eq('id', lessonId)
      .single()
    if (data) return { id: data.id, title: data.title }
  } catch {}
  return { id: lessonId, title: `Bài ${lessonId}` }
}
