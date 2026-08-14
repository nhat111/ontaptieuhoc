# Khoá khu soạn nội dung (`IMPORT_PASSWORD`)

## Vì sao

`/import/edit/[id]` mở cho khách, mà `POST /api/update-lesson` **xoá sạch câu hỏi rồi chèn lại**. Ai đoán được id bài là xoá trắng được nội dung, và **không có bản sao lưu nào**.

Cố ý **không** dựng hệ thống tài khoản: đây là site một người quản trị: một mật khẩu chung chặn gần hết rủi ro mà không đẻ thêm bảng, thêm màn hình. Đăng nhập Supabase vẫn tồn tại song song nhưng chỉ phục vụ `/progress` của học sinh, không liên quan gì tới khoá này.

**Bỏ trống `IMPORT_PASSWORD` thì mọi cổng đều là no-op** — dev và bản đang chạy không gãy khi cập nhật.

## Chốt chặn nằm ở đâu

| Bề mặt | Chặn ở |
|--------|--------|
| Trang `/import/*` | `app/import/layout.tsx` — redirect `/import-khoa` |
| Mọi API ghi | `blockIfNoImportAccess(req)` gọi trong **từng route** |
| Trang nhập mật khẩu | `/import-khoa` — **ngoài** segment `/import` |

Route ghi có gọi: `create-lesson`, `update-lesson`, `chapters` (POST), `upload-image`, `upload-audio`, `lesson-audio`, `ocr-exam`.

## ĐỪNG chặn trong `proxy.ts`

`next build` ở repo này để `middleware-manifest.json` **rỗng**, nên trên Vercel `proxy.ts` không được đăng ký thành Edge Function. Chặn ở đó:

- chạy đúng khi `next start` dưới máy,
- **im lặng vô hiệu** khi deploy.

Trông như đã khoá mà thực ra mở toang. Đã kiểm bằng tay: cùng commit, cùng env — bản production dưới máy redirect, bản preview trên Vercel thì không. `app/import/layout.tsx` chạy cùng runtime với các API route, mà những route đó chứng minh được là đọc env trên Vercel.

`proxy.ts` giờ **chỉ** refresh cookie phiên Supabase trên `/import/*`.

## Vì sao trang khoá nằm ngoài `/import`

Để `/import/khoa` thì chính trang nhập mật khẩu cũng bị layout chặn → vòng lặp redirect. Nên nó ở `/import-khoa`.

## `/api/*` không có layout

Đây mới là chỗ nội dung bị phá. Chặn mỗi trang là để hở đúng chỗ nguy hiểm nhất, nên mỗi route ghi **tự** gọi `blockIfNoImportAccess`, trả `401` + thông báo tiếng Việt chỉ sang `/import-khoa`.

## Cơ chế (`lib/importAuth.ts`)

- Cookie `ontap_import` giữ **SHA-256 của `"ontap-import-v1:<mật khẩu>"`**, không phải mật khẩu. Lộ cookie cũng không suy ra được mật khẩu để dùng chỗ khác.
- Token **suy ra được**, không lưu ở đâu → không cần bảng session.
- Dùng **Web Crypto** (`crypto.subtle`) chứ không phải `node:crypto`, vì hàm này chạy cả trong `proxy.ts` nơi không chắc có API của Node.
- So sánh bằng `safeEqual` — không phụ thuộc thời gian, không rò rỉ độ dài khớp.
- `isImportProtected()` false → `hasImportAccess` trả `true` và `blockIfNoImportAccess` trả `null`.

## API cookie

`POST /api/import-login` (nhập mật khẩu, set cookie) · `GET` (hỏi trạng thái) · `DELETE` (thoát). Form ở `components/import/ImportLoginForm.tsx`.

## Cấu hình trên Vercel

Đặt `IMPORT_PASSWORD` cho **đủ cả Production lẫn Preview** — tick mỗi Preview là bản production vẫn hở.

## Premium — không phải cơ chế chặn

`profiles.is_premium`, `lib/premium.ts`, `GET /api/me/premium`, `/nang-cap` vẫn còn code nhưng **hiện không chặn tính năng nào**. Tải đề Word/PDF **mở cho mọi người**: mục đích của nút đó là để phụ huynh in cho bé làm trên giấy, dựng rào là chặn đúng người cần dùng. Muốn dùng `isPremium` thì gắn vào tính năng mới, đừng cho rằng phần tải đề vẫn còn bị khoá.
