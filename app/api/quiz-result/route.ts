import { getSupabaseServer } from '@/lib/supabase/server'
import { createSessionClient } from '@/lib/supabase/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { lessonId?: unknown; score?: unknown; total?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 })
  }
  const lessonId = Number(body.lessonId)
  const score = Number(body.score)
  const total = Number(body.total)

  // Điểm đi vào bảng xếp hạng: chặn số lạ (điểm âm, vượt số câu, số thập phân).
  if (
    !Number.isInteger(lessonId) || lessonId <= 0 ||
    !Number.isInteger(total) || total <= 0 || total > 500 ||
    !Number.isInteger(score) || score < 0 || score > total
  ) {
    return NextResponse.json({ error: 'Dữ liệu điểm không hợp lệ.' }, { status: 400 })
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
