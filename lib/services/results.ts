import { getSupabaseServer } from '../supabase/server'
import type { QuizResult } from '../types'

export async function getResultById(id: string): Promise<QuizResult | null> {
  try {
    const { data } = await getSupabaseServer()
      .from('quiz_results')
      .select('*, lessons(*, grades(*), subjects(*))')
      .eq('id', id)
      .single()
    return data
  } catch {
    return null
  }
}

export async function getResultsByLesson(lessonId: string, limit = 10): Promise<QuizResult[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('quiz_results')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('score', { ascending: false })
      .limit(limit)
    return data ?? []
  } catch {
    return []
  }
}
