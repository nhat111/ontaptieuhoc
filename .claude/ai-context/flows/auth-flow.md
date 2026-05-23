# Auth Flow

## Implemented (Supabase Auth)

### Pages
| Route | Vai trò |
|-------|---------|
| `/login` | Email + password; link reset |
| `/reset-password` | Đặt lại mật khẩu |
| `/auth/callback` | `GET` — đổi `?code=` từ magic link → session cookie |

### Client
- `lib/supabase/client.ts` — `createClient()` cho browser
- `Header.tsx`: `getUser()`, `onAuthStateChange`, menu user, logout → `signOut()` + refresh

### Server
- `lib/supabase/server-client.ts` — `createSessionClient()`, `getUser()`
- `proxy.ts` — matcher `/import/:path*`, gọi `auth.getUser()` để **refresh cookie** (không redirect nếu chưa login)

### Logout
- `POST /api/auth/logout` — xóa session phía server (nếu dùng)
- Header cũng gọi `signOut()` client-side

## Guest vs logged-in

| Hành vi | Guest | Logged-in |
|---------|-------|-----------|
| Browse `/`, `/lop`, `/de-thi` | ✓ | ✓ |
| Làm `/quiz` | ✓ | ✓ |
| `quiz_results.user_id` | `null` | `auth.users.id` |
| `/progress` | Redirect login | Lịch sử quiz |
| `/import/*` | ✓ (guest được phép tạo nội dung) | ✓ |

## Quiz result tie-in

```
POST /api/quiz-result
  sessionClient.auth.getUser() → user?.id
  service role insert { lesson_id, score, total, user_id }
```

## Progress page

```
/progress (server)
  getUser() → null → hiện CTA đăng nhập
  else getUserResults(userId) + join lesson/subject metadata
```

## Không có
- Social OAuth UI (có thể bật trên Supabase dashboard)
- Role admin / teacher flag trong DB
- Protected import (chỉ refresh cookie)

## Thêm auth mới

Chỉ khi user yêu cầu. Nếu khóa import: sửa `proxy.ts` redirect + RLS, không chỉ refresh token.
