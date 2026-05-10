import { getSupabaseServer } from '../supabase/server'
import type { Grade } from '../types'

export async function getGrades(): Promise<Grade[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('grades')
      .select('*')
      .order('order_index')
    return data ?? []
  } catch {
    return []
  }
}

export async function getGradeBySlug(slug: string): Promise<Grade | null> {
  try {
    const { data } = await getSupabaseServer()
      .from('grades')
      .select('*')
      .eq('slug', slug)
      .single()
    return data
  } catch {
    return null
  }
}
