import { createSessionClient } from '@/lib/supabase/server-client'
import { NextResponse } from 'next/server'

export async function POST() {
  const client = await createSessionClient()
  await client.auth.signOut()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}
