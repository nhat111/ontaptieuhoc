import { createSessionClient } from '@/lib/supabase/server-client'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const client = await createSessionClient()
  await client.auth.signOut()
  // 303 để trình duyệt chuyển sang GET; 307 mặc định sẽ POST lại lên trang chủ.
  return NextResponse.redirect(new URL('/', req.url), 303)
}
