# RLS Rules

## Runtime thực tế

App **đọc/ghi hầu hết bảng nội dung qua service role** (`getSupabaseServer()`), bypass RLS. Điều này có nghĩa policy trên `subjects`/`lessons`/… ít ảnh hưởng tới SSR và API — miễn key service role không lộ client.

## Session client (RLS áp dụng)

`createSessionClient()` chỉ dùng cho:
- `auth.getUser()` trong API / pages
- Không query trực tiếp `questions` qua session client trong code hiện tại

## Khuyến nghị policy (nếu cấu hình Supabase)

### Public read (anon)
- `SELECT` trên `subjects`, `chapters`, `lessons`, `questions` — nếu sau này đọc bằng anon key thay vì service role

### Write
- `INSERT/UPDATE/DELETE` lessons & questions: **service_role** (hoặc role admin) — khớp với `/api/create-lesson`, `update-lesson`
- `INSERT` `quiz_results`: cho phép anon + authenticated; app ghi qua service role API nhưng guest vẫn insert `user_id = null`

### Storage `question-images`
- Public read
- Write chỉ service role (app upload qua `/api/upload-image`)

## Authenticated users

- `quiz_results.user_id` set khi có session (`POST /api/quiz-result`)
- `/progress` đọc `quiz_results` filter `.eq('user_id', userId)` qua service role (server page)

## Future tightening

Nếu bỏ service role cho read public:
- Giữ write API server-only
- RLS progress: user chỉ `SELECT` rows có `user_id = auth.uid()`
- Import routes: có thể yêu cầu login thật (hiện `proxy.ts` không gate)
