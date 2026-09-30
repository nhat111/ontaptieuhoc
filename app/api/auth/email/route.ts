import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/supabase/server-client'
import { safeNext } from '@/lib/safeRedirect'

// Các thao tác Supabase Auth có GỬI EMAIL: đăng ký, quên mật khẩu, gửi lại
// email xác nhận. Chạy ở server thay vì gọi thẳng từ trình duyệt.
//
// Vì sao: gọi từ trình duyệt, những request này báo "Failed to fetch" dù thư
// vẫn được gửi — Supabase xử lý lâu/lỗi lúc gửi thư và trả về phản hồi mà trình
// duyệt không đọc được (không có header CORS), nên người dùng thấy "mất mạng"
// còn ta không biết lỗi thật. Ở server không có CORS: đọc được status thật, ghi
// vào log Vercel, và trả câu báo đúng.
//
// Dùng session client (cookie) để mã PKCE nằm trong cookie của trình duyệt,
// giống như khi gọi từ trình duyệt — /auth/callback vẫn đổi được `?code=`.

type Body = {
  action?: unknown
  email?: unknown
  password?: unknown
  next?: unknown
}

type ErrOut = { status?: number; code?: string; message?: string; name?: string; ms?: number }

function fail(err: ErrOut, httpStatus = 200) {
  return NextResponse.json({ ok: false, error: err }, { status: httpStatus })
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return fail({ message: 'Yêu cầu không hợp lệ.' }, 400)
  }

  const action = body.action
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || email.length > 254) return fail({ code: 'email_address_invalid' }, 400)

  // Link trong email luôn về đúng tên miền đang chạy; đích sau đó chỉ nhận
  // đường dẫn nội bộ.
  const origin = new URL(req.url).origin
  const next = safeNext(typeof body.next === 'string' ? body.next : null)
  const callback = (to: string) => `${origin}/auth/callback?next=${encodeURIComponent(to)}`

  const sb = await createSessionClient()
  const started = Date.now()
  try {
    if (action === 'signup') {
      if (password.length < 6 || password.length > 72) return fail({ code: 'weak_password' }, 400)
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: callback(next) } })
      if (error) return logFail('signup', error, started)
      if (data.session) return NextResponse.json({ ok: true, result: 'session' })
      // Email đã có tài khoản: Supabase không báo lỗi mà trả identities rỗng.
      if (data.user && data.user.identities?.length === 0) return NextResponse.json({ ok: true, result: 'exists' })
      return NextResponse.json({ ok: true, result: 'sent' })
    }

    if (action === 'recover') {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: callback('/reset-password') })
      if (error) return logFail('recover', error, started)
      return NextResponse.json({ ok: true, result: 'sent' })
    }

    if (action === 'resend') {
      const { error } = await sb.auth.resend({ type: 'signup', email, options: { emailRedirectTo: callback(next) } })
      if (error) return logFail('resend', error, started)
      return NextResponse.json({ ok: true, result: 'sent' })
    }

    return fail({ message: 'Thao tác không hợp lệ.' }, 400)
  } catch (e) {
    const ms = Date.now() - started
    console.error('[api/auth/email] exception', action, `${ms}ms`, e)
    return fail({ status: 0, message: e instanceof Error ? e.message : String(e), ms })
  }
}

function logFail(action: string, error: { status?: number; code?: string; message: string; name: string }, started: number) {
  const ms = Date.now() - started
  // Ghi đủ để đối chiếu với Supabase → Logs → Auth.
  console.error('[api/auth/email]', action, error.status, error.code, error.message, `${ms}ms`)
  return fail({ status: error.status, code: error.code, message: error.message, name: error.name, ms })
}
