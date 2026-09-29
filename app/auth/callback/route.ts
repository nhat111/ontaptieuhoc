import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createSessionClient } from '@/lib/supabase/server-client'
import { safeNext } from '@/lib/safeRedirect'

// Đích của mọi link trong email (xác nhận đăng ký, đặt lại mật khẩu).
//
// Nhận hai dạng link:
// - `?code=` (mặc định, PKCE): chỉ đổi được trên ĐÚNG trình duyệt đã bấm đăng
//   ký / quên mật khẩu, vì mã xác minh nằm trong cookie của trình duyệt đó. Mở
//   email trên máy khác (đăng ký trên máy tính, mở Gmail trên điện thoại) sẽ
//   thất bại.
// - `?token_hash=&type=`: dùng được trên mọi máy. Cần sửa mẫu email trong
//   Supabase để trỏ link về đây (xem .claude/ai-context/feature-specs/auth.md).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'))

  const supabase = await createSessionClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] verifyOtp', error.code, error.message)
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
    console.error('[auth/callback] exchangeCode', error.code, error.message)
  }

  // Supabase tự gắn `error_code` khi link hỏng/hết hạn trước khi tới đây.
  return NextResponse.redirect(`${origin}/login?error=link_expired`)
}
