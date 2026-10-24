# Khoá khu soạn nội dung (`IMPORT_PASSWORD` + người soạn được mời)

## Vì sao

`/import/edit/[id]` mở cho khách, mà `POST /api/update-lesson` **xoá sạch câu hỏi rồi chèn lại**. Ai đoán được id bài là xoá trắng được nội dung, và **không có bản sao lưu nào**.

**Bỏ trống `IMPORT_PASSWORD` thì mọi người là quản trị** (trừ xoá, góp ý — luôn khoá) — dev và bản đang chạy không gãy khi cập nhật.

## Hai vai (`lib/editorRules.ts` thuần + `lib/editorAuth.ts` đọc phiên)

| Vai | Vào bằng | Được làm |
|-----|----------|----------|
| **Quản trị** | mật khẩu chung `IMPORT_PASSWORD` (cookie `ontap_import`); hoặc mọi người khi chưa đặt mật khẩu | mọi thứ: sửa / xoá mọi bài, xoá chương, mời người soạn, góp ý, thống kê, thu giọng trò chơi, chẩn đoán |
| **Người soạn được mời** | đăng nhập Supabase bằng email **đã xác nhận** có trong bảng `editors` | tạo bài, đề, chương; sửa / xoá / gắn giọng **chỉ bài có `lessons.owner_id` = mình**; upload ảnh, quét ảnh |

- Bài người soạn tạo mang `owner_id` của họ; quản trị tạo thì **không gửi** cột này (DB chưa chạy SQL vẫn tạo bài được). Bài cũ `owner_id = NULL` = của quản trị — người soạn không đụng được.
- **Phải đòi email đã xác nhận** (`email_confirmed_at`): nếu Supabase tắt xác nhận, ai cũng đăng ký được bằng email của người được mời.
- Lần đầu người được mời vào, `editors.user_id` được ghi lại để trang quản lý đếm bài theo người.
- Thôi mời (xoá khỏi `editors`): bài của họ giữ nguyên `owner_id`, họ hết vào được; quản trị vẫn sửa được.
- SQL: `supabase/nguoi-soan.sql` (cũng chép ở cuối `schema.sql`). Chưa chạy → `editorStatus().setupMissing`, chỉ còn đường mật khẩu như trước; `/import/nguoi-soan`, `/import/bai-cua-toi`, `/import/kiem-tra` báo cần chạy SQL.

## Chốt chặn nằm ở đâu

| Bề mặt | Chặn ở |
|--------|--------|
| Trang `/import/*` | `app/import/layout.tsx` → `currentEditor()`, không có thì redirect `/import-khoa` |
| Trang chỉ quản trị (`gop-y`, `thong-ke`, `kiem-tra`, `giong-tro-choi`, `nguoi-soan`) | `adminOnly()` (`components/import/AdminOnly.tsx`) ngay đầu trang |
| Trang theo chủ bài (`edit/[id]`, `giong-doc/[id]`, nút ở `chapter/[id]`) | `lessonRights` / `editableLessonIds` — chỉ để ẩn nút, API vẫn tự kiểm |
| Mọi API ghi | `require…()` của `lib/editorAuth.ts` trong **từng route** |
| Trang khoá | `/import-khoa` — **ngoài** segment `/import`; nói rõ vì sao chưa vào được (chưa đăng nhập / email chưa mời / chưa xác nhận / chưa chạy SQL) |

| Route | Cổng |
|-------|------|
| `create-lesson`, `chapters` POST, `upload-image`, `upload-audio`, `ocr-exam` | `requireEditor` |
| `update-lesson`, `lesson-audio` | `requireLessonEditor(lessonId)` |
| `DELETE /api/lesson/[id]` | `requireLessonDelete` (403 khi chưa đặt mật khẩu) |
| `DELETE /api/chapters`, `/api/editors`, `feedback/resolve`, `game-audio` POST/DELETE | `requireAdmin` (xoá chương, góp ý: thêm 403 khi chưa đặt mật khẩu) |

Đã kiểm đầu-cuối bằng một Supabase giả (auth + PostgREST) trong phiên làm PR này: khách / email chưa xác nhận / chưa mời → 401; người soạn sửa bài người khác hoặc bài cũ → 403; quản trị qua hết; `owner_id` chỉ gửi khi người soạn tạo.

## ĐỪNG chặn trong `proxy.ts`

`next build` ở repo này để `middleware-manifest.json` **rỗng**, nên trên Vercel `proxy.ts` không được đăng ký thành Edge Function. Chặn ở đó:

- chạy đúng khi `next start` dưới máy,
- **im lặng vô hiệu** khi deploy.

Trông như đã khoá mà thực ra mở toang. Đã kiểm bằng tay: cùng commit, cùng env — bản production dưới máy redirect, bản preview trên Vercel thì không. `app/import/layout.tsx` chạy cùng runtime với các API route, mà những route đó chứng minh được là đọc env trên Vercel.

`proxy.ts` giờ **chỉ** refresh cookie phiên Supabase trên `/import/*`.

## Vì sao trang khoá nằm ngoài `/import`

Để `/import/khoa` thì chính trang nhập mật khẩu cũng bị layout chặn → vòng lặp redirect. Nên nó ở `/import-khoa`.

## `/api/*` không có layout

Đây mới là chỗ nội dung bị phá. Chặn mỗi trang là để hở đúng chỗ nguy hiểm nhất, nên mỗi route ghi **tự** gọi một hàm `require…()`, trả `401`/`403` + thông báo tiếng Việt.

## Cơ chế (`lib/importAuth.ts`)

- Cookie `ontap_import` giữ **SHA-256 của `"ontap-import-v1:<mật khẩu>"`**, không phải mật khẩu. Lộ cookie cũng không suy ra được mật khẩu để dùng chỗ khác.
- Token **suy ra được**, không lưu ở đâu → không cần bảng session.
- Dùng **Web Crypto** (`crypto.subtle`) chứ không phải `node:crypto`, vì hàm này chạy cả trong `proxy.ts` nơi không chắc có API của Node.
- So sánh bằng `safeEqual` — không phụ thuộc thời gian, không rò rỉ độ dài khớp.
- `isImportProtected()` false → `hasImportAccess` trả `true` (mọi người là quản trị).

## API cookie

`POST /api/import-login` (nhập mật khẩu, set cookie) · `GET` (hỏi trạng thái) · `DELETE` (thoát). Form ở `components/import/ImportLoginForm.tsx`.

## Cấu hình trên Vercel

Đặt `IMPORT_PASSWORD` cho **đủ cả Production lẫn Preview** — tick mỗi Preview là bản production vẫn hở.

## Premium — không phải cơ chế chặn

`profiles.is_premium`, `lib/premium.ts`, `GET /api/me/premium`, `/nang-cap` vẫn còn code nhưng **hiện không chặn tính năng nào**. Tải đề Word/PDF **mở cho mọi người**: mục đích của nút đó là để phụ huynh in cho bé làm trên giấy, dựng rào là chặn đúng người cần dùng. Muốn dùng `isPremium` thì gắn vào tính năng mới, đừng cho rằng phần tải đề vẫn còn bị khoá.
