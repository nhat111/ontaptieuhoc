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
- `proxy.ts` — matcher `/import/:path*`, gọi `auth.getUser()` để **refresh cookie**. **Chỉ có vậy** — không có kiểm tra quyền nào ở đây, và cũng đừng thêm vào (xem `feature-specs/access-control.md`)

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
| `/import/*` | Tuỳ `IMPORT_PASSWORD` (xem dưới) | Như guest — tài khoản Supabase không mở khoá import |

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

## Hai cơ chế tách rời

Đăng nhập Supabase và khoá import **không liên quan gì tới nhau**:

| | Đăng nhập Supabase | `IMPORT_PASSWORD` |
|---|---|---|
| Cho ai | học sinh / phụ huynh | người quản trị nội dung |
| Bảo vệ gì | `/progress`, `quiz_results.user_id` | `/import/*` + mọi API ghi |
| Giữ ở đâu | cookie phiên Supabase | cookie `ontap_import` = SHA-256 của passphrase |

Đăng nhập tài khoản **không** mở khoá `/import`, và ngược lại. Chi tiết: `feature-specs/access-control.md`.

## Không có
- Social OAuth UI (có thể bật trên Supabase dashboard)
- Role admin / teacher flag trong DB — vai trò quản trị là "biết mật khẩu chung", không phải cột trong DB

## Thêm auth mới

Chỉ khi user yêu cầu. Và **đừng đặt kiểm tra quyền vào `proxy.ts`** — trên Vercel nó không được đăng ký nên im lặng vô hiệu; đặt ở layout của segment hoặc trong chính route.
