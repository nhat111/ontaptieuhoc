import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { IMPORT_COOKIE, hasImportAccess, isImportProtected } from './lib/importAuth'

// Làm mới cookie phiên Supabase, và chặn khu soạn nội dung sau một mật khẩu
// chung khi `IMPORT_PASSWORD` được đặt.
//
// Chặn ở đây mới chỉ giữ phần giao diện. Các route API ghi dữ liệu tự kiểm tra
// lấy — proxy không chạy cho `/api/*`, mà đó mới là chỗ xoá được nội dung.
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Trang nhập mật khẩu phải luôn vào được, không thì chuyển hướng vòng tròn.
  if (isImportProtected() && !path.startsWith('/import/khoa')) {
    const ok = await hasImportAccess(request.cookies.get(IMPORT_COOKIE)?.value)
    if (!ok) {
      const url = request.nextUrl.clone()
      url.pathname = '/import/khoa'
      url.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`
      return NextResponse.redirect(url)
    }
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Trigger token rotation if expired. Result is intentionally ignored.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/import/:path*'],
}

