import { getSupabaseServer } from '../supabase/server'
import type { Subject } from '../types'

export async function getSubjects(): Promise<Subject[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('subjects')
      .select('*')
      .order('order_index')
    return data ?? []
  } catch {
    return []
  }
}

export async function getSubjectsByGrade(gradeId: string): Promise<Subject[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('subject_id, subjects(*)')
      .eq('grade_id', gradeId)

    const seen = new Set<string>()
    const subjects: Subject[] = []
    ;(data ?? []).forEach((row: any) => {
      if (!seen.has(row.subject_id) && row.subjects) {
        seen.add(row.subject_id)
        subjects.push(row.subjects as Subject)
      }
    })
    return subjects.sort((a, b) => a.order_index - b.order_index)
  } catch {
    return []
  }
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  try {
    const { data } = await getSupabaseServer()
      .from('subjects')
      .select('*')
      .eq('slug', slug)
      .single()
    return data
  } catch {
    return null
  }
}
