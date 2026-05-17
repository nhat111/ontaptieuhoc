import { getSupabaseServer } from './supabase/server'
import type { Question as QuizQuestion, LessonMeta } from './quizData'

// ---- Database row types ----

export type SubjectRow = {
  id: number
  name: string
  grade: number
  order_index: number
}

export type Subject = SubjectRow

export type Chapter = {
  id: number
  title: string
  subject_id: number
  order_index: number
}

export type Lesson = {
  id: number
  title: string
  index_label: string
  chapter_id: number
  status: 'completed' | 'active' | 'locked'
  order_index: number
}

export type Question = {
  id: number
  content: string
  options: string[]
  correct_answer: string
  explanation: string | null
}

// ---- Component types (used by server-side pages) ----

type ComponentLesson = {
  id: number
  index: string
  title: string
  questionCount: number
  status: 'completed' | 'active' | 'locked'
}

type ComponentChapter = {
  id: number
  title: string
  questionCount: number
  lessons: ComponentLesson[]
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

// ---- Chapters (server-side, returns rich component types for server pages) ----

export async function getChaptersWithLessons(subjectId: number): Promise<ComponentChapter[]> {
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
      const lessons: ComponentLesson[] = (ch.lessons ?? [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((l: any) => ({
          id: l.id,
          index: l.index_label,
          title: l.title,
          questionCount: l.questions?.[0]?.count ?? 0,
          status: l.status as ComponentLesson['status'],
        }))

      const questionCount = lessons.reduce((s, l) => s + l.questionCount, 0)

      return { id: ch.id, title: ch.title, questionCount, lessons }
    })
  } catch {
    return []
  }
}

// ---- Server-side quiz functions (for server components) ----

export async function getQuestionsFromDB(lessonId: number): Promise<QuizQuestion[]> {
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

export async function getLessonMetaFromDB(lessonId: number): Promise<LessonMeta> {
  try {
    const sb = getSupabaseServer()
    const { data: lesson } = await sb
      .from('lessons')
      .select('id, title, chapter_id')
      .eq('id', lessonId)
      .single()
    if (!lesson) return { id: lessonId, title: `Bài ${lessonId}` }

    const { data: chapter } = await sb
      .from('chapters')
      .select('subject_id')
      .eq('id', lesson.chapter_id)
      .single()

    let grade: number | null = null
    let subjectName: string | null = null
    if (chapter) {
      const { data: subject } = await sb
        .from('subjects')
        .select('grade, name')
        .eq('id', chapter.subject_id)
        .single()
      if (subject) { grade = subject.grade; subjectName = subject.name }
    }

    return { id: lesson.id, title: lesson.title, grade, subjectName }
  } catch {}
  return { id: lessonId, title: `Bài ${lessonId}` }
}
