import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Làm mới cookie phiên Supabase trên các trang /import.
//
// KHÔNG gác quyền truy cập ở đây: bản build production không đăng ký được proxy
// thành Edge Function trên Vercel, nên gác ở đây chạy đúng lúc `next start` ở
// máy nhưng im lặng vô hiệu khi deploy. Việc chặn nằm ở `app/import/layout.tsx`
// và ở từng route API.
export async function proxy(request: NextRequest) {
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

