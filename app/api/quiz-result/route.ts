import { getSupabaseServer } from '@/lib/supabase/server'
import { createSessionClient } from '@/lib/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { lessonId, score, total } = await req.json()

  if (!lessonId || score == null || !total) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  const sb = getSupabaseServer()
  const { error } = await sb.from('quiz_results').insert({
    lesson_id: lessonId,
    score,
    total,
    user_id: user?.id ?? null,
  })

  if (error) {
    console.error('[/api/quiz-result]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
