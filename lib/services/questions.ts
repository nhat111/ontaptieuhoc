import { getSupabaseServer } from '../supabase/server'
import type { Question } from '../types'

export async function getQuestionsByLesson(lessonId: string): Promise<Question[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('questions')
      .select('*, options(*)')
      .eq('lesson_id', lessonId)
      .order('order_index')
    return (data ?? []).map((q: any) => ({
      ...q,
      options: (q.options ?? []).sort((a: any, b: any) =>
        a.label.localeCompare(b.label)
      ),
    }))
  } catch {
    return []
  }
}
