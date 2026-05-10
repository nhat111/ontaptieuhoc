'use server'

import { getSupabaseServer } from './supabase/server'
import type { AnswerRecord } from './types'

export async function saveQuizResult(
  lessonId: string,
  score: number,
  total: number,
  answers: AnswerRecord[]
): Promise<string | null> {
  try {
    const { data } = await getSupabaseServer()
      .from('quiz_results')
      .insert({ lesson_id: lessonId, score, total_questions: total, answers })
      .select('id')
      .single()
    return data?.id ?? null
  } catch {
    return null
  }
}

export async function createLesson(payload: {
  title: string
  slug: string
  description: string
  grade_id: string
  subject_id: string
  order_index: number
}): Promise<string | null> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .insert(payload)
      .select('id')
      .single()
    return data?.id ?? null
  } catch {
    return null
  }
}

export async function createQuestion(payload: {
  lesson_id: string
  type: string
  difficulty: string
  content: string
  explanation: string
  order_index: number
}): Promise<string | null> {
  try {
    const { data } = await getSupabaseServer()
      .from('questions')
      .insert(payload)
      .select('id')
      .single()
    return data?.id ?? null
  } catch {
    return null
  }
}

export async function createOptions(
  options: { question_id: string; label: string; content: string; is_correct: boolean }[]
): Promise<boolean> {
  try {
    const { error } = await getSupabaseServer().from('options').insert(options)
    return !error
  } catch {
    return false
  }
}
