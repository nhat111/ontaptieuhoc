import { getSupabaseServer } from '../supabase/server'
import type { Lesson } from '../types'

function withCount(row: any): Lesson {
  return { ...row, question_count: row.questions?.[0]?.count ?? 0 }
}

export async function getLessonsBySubject(
  gradeId: string,
  subjectId: string
): Promise<Lesson[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('*, grades(*), subjects(*), questions(count)')
      .eq('grade_id', gradeId)
      .eq('subject_id', subjectId)
      .order('order_index')
    return (data ?? []).map(withCount)
  } catch {
    return []
  }
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('*, grades(*), subjects(*), questions(count)')
      .eq('slug', slug)
      .single()
    return data ? withCount(data) : null
  } catch {
    return null
  }
}

export async function getFeaturedLessons(limit = 6): Promise<Lesson[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('*, grades(*), subjects(*), questions(count)')
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).map(withCount)
  } catch {
    return []
  }
}

export async function getLessonsByGrade(gradeId: string): Promise<Lesson[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('*, grades(*), subjects(*), questions(count)')
      .eq('grade_id', gradeId)
      .order('order_index')
    return (data ?? []).map(withCount)
  } catch {
    return []
  }
}
