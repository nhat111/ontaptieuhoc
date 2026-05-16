import { getSupabaseServer } from './supabase/server'
import { supabase as supabaseClient } from './supabase/client'
import type { Question as QuizQuestion, LessonMeta } from './quizData'

// Re-export for client components
export { supabase } from './supabase/client'

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

// ---- Client-callable functions (raw row types for client components) ----

export async function getChaptersBySubject(subjectId: number): Promise<Chapter[]> {
  try {
    const { data } = await supabaseClient
      .from('chapters')
      .select('*')
      .eq('subject_id', subjectId)
      .order('order_index')
    return data ?? []
  } catch {
    return []
  }
}

export async function getLessonsByChapter(chapterId: number): Promise<Lesson[]> {
  try {
    const { data } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('order_index')
    return data ?? []
  } catch {
    return []
  }
}

export async function getQuestionsByLesson(lessonId: number): Promise<Question[]> {
  try {
    const { data } = await supabaseClient
      .from('questions')
      .select('id, content, options, correct_answer, explanation')
      .eq('lesson_id', lessonId)
      .order('order_index')
    return data ?? []
  } catch {
    return []
  }
}

export async function getLessonById(lessonId: number): Promise<Lesson | null> {
  try {
    const { data } = await supabaseClient
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single()
    return data ?? null
  } catch {
    return null
  }
}

export async function saveQuizResult(lessonId: number, score: number, total: number): Promise<void> {
  try {
    await supabaseClient.from('quiz_results').insert({ lesson_id: lessonId, score, total })
  } catch {}
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
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('id, title')
      .eq('id', lessonId)
      .single()
    if (data) return { id: data.id, title: data.title }
  } catch {}
  return { id: lessonId, title: `Bài ${lessonId}` }
}
