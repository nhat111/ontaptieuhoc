# Current State

_Last synced with codebase: Oct 2026 (sau PR #105 + lời giải lớp 2–4)_

> **Bắt đầu phiên mới?** Đọc mục **Việc tiếp theo** ở cuối file trước. Chi tiết kỹ thuật của từng tính năng nằm trong `CLAUDE.md`.

## Done

### Browse & quiz
- Home: thẻ lớp 1–5, link `/de-thi`
- `/lop/[grade]`: tab môn (`?subject=`), toggle bài tập / đề KT (`?view=lesson|exam`), accordion chương, sidebar bảng xếp hạng (top 10 theo tổng điểm, mỗi bài lấy lần tốt nhất; email mask `abc***yz`)
- `/de-thi`: list động `lessons` với `type='exam'`
- `/quiz`: Start screen → timer theo `duration_minutes` → 4 loại câu → palette → nộp
- **Tải đề để in**: nút Word (.doc) / PDF / +Đáp án ở màn hình đầu, **mở cho mọi người** — mục đích là để phụ huynh in cho bé làm trên giấy
- **Trộn thứ tự**: 2 tuỳ chọn ở màn hình đầu (trộn câu hỏi / trộn đáp án), lưu localStorage (`lib/quizPrefs.ts`), trộn 1 lần lúc bấm Bắt đầu
- **Nghe**: nút 🔊 từng câu, và **"Nghe cả bài"** (có ở cả màn hình đầu lẫn lúc đang làm) đọc liền mạch cả đề (xướng "Câu N", tự cuộn tới câu đang đọc). Tốc độ Chậm/Vừa/Nhanh lưu ở localStorage, mặc định 0.7. Web Speech API của trình duyệt — miễn phí, không cần key
- **Giọng đọc gắn sẵn**: `/import/giong-doc/[id]` — sinh file ngoài (Piper…) rồi upload, ghép theo số trong tên file (`wav_1.wav` → câu 1), mỗi câu có nhãn đã lưu/chưa lưu và trình phát để nghe thử. Lưu `audioUrl` trong blob `questions.explanation`. **Không gọi dịch vụ ngoài nào, không cần key.**
- `/result`: breakdown điểm, làm lại, quay lại `/lop/[grade]` (breadcrumb lấy `grade`/`subjectName` từ payload `sessionStorage`)
- `POST /api/quiz-result`: ghi `quiz_results` (+ `user_id` nếu đăng nhập)

### Auth & progress
- `/login`, `/reset-password`, `/auth/callback`
- Header: menu user, link `/progress`, đăng xuất
- `/progress`: lịch sử 100 lần làm gần nhất (cần login)

### Import / content
- `/import`, `/import/exam`, `/import/edit/[id]` — `ImportClient` + Tiptap + paste modal + upload ảnh
- `/import/chapter/[id]` — dashboard tiến độ bài trong chương
- **Khoá khu soạn nội dung**: đặt `IMPORT_PASSWORD` thì `/import/*` chuyển hướng sang `/import-khoa` để nhập mật khẩu (chặn trong `app/import/layout.tsx`, KHÔNG dùng proxy — proxy không được đăng ký khi deploy), và mọi API ghi (`create-lesson`, `update-lesson`, `chapters` POST, `upload-image`, `upload-audio`, `lesson-audio`, `ocr-exam`) tự kiểm tra — proxy không chạy cho `/api/*`. Bỏ trống biến thì mở như cũ
- `/import/kiem-tra` — trang chẩn đoán (kết nối Supabase, số dòng mỗi bảng, đối chiếu môn code↔DB). Bản web của `scripts/check-subjects.mjs`, dùng khi chỉ có điện thoại
- API: chapters (GET/POST, theo `grade`+`subject`), lesson/[id], create-lesson, update-lesson, fetch-exam, upload-image, ocr-exam, upload-audio, lesson-audio, auth/logout — **không còn `/api/subjects`**
- Tạo bài/đề: **chương là tuỳ chọn** — bắt buộc chỉ còn môn + tên + câu hỏi. Không chọn chương thì máy chủ gom vào chương mặc định của môn (`ensureDefaultChapterId`), vì `lessons.chapter_id` NOT NULL và trang lớp nhóm bài theo chương
- `localStorage` draft: `ontap_import_draft_v1` / `ontap_exam_draft_v1` (debounce 500ms, tắt khi edit)
- KaTeX qua `MathText`; cheat-sheet LaTeX + `focusedEditor`
- **Quét ảnh đề**: nút trong `PasteImportModal` → `POST /api/ocr-exam` (Claude vision `claude-opus-5-5`, output theo `json_schema`). Đọc được cả đáp án khoanh bút; không thấy dấu khoanh thì trả `correctIndex: -1` và báo người dùng tự tick. Cần `ANTHROPIC_API_KEY` — chưa cấu hình thì `GET /api/ocr-exam` trả `{available:false}` và nút bị **ẩn hẳn**, không ai bấm vào lỗi.

### SEO
- `app/sitemap.ts` (`/sitemap.xml`, dynamic) + `app/robots.ts` (`/robots.txt`)
- `metadataBase` + title template `%s · Ôn Tập Cùng Con` + OG/Twitter mặc định trong `app/layout.tsx`
- `generateMetadata` cho `/lop/[grade]` (theo môn + `view=exam`, canonical bỏ môn mặc định) và `/quiz` (bài 0 câu → `noindex`)
- Trang editor/tài khoản (`/import*`, `/progress`, `/nang-cap`) → `robots: { index: false }`
- Base URL qua `lib/siteUrl.ts` (`NEXT_PUBLIC_SITE_URL` → `VERCEL_*` → localhost)

### Môn học (static)
- `lib/subjects.ts` là nguồn sự thật duy nhất — khai báo trong code, không query bảng `subjects`
- Bảng `subjects` chỉ còn là đích FK của `chapters.subject_id`, đối chiếu bằng cặp (grade, name)
- Đọc: join lồng `subjects!inner` · Ghi: `ensureSubjectId(grade, name)` (select-or-insert)
- Trang chủ + tab `/lop/[grade]` + sitemap + dropdown import đều đọc chung danh mục này
- Đối chiếu code ↔ DB: `node --env-file=.env.local scripts/check-subjects.mjs`

### Data & ops
- Supabase: subjects, chapters, lessons, questions, quiz_results, Storage `question-images`
- Scripts NXBGD: `scripts/nxbgd-import.mjs`, `scripts/nxbgd-import-questions.mjs`
- `scripts/check-subjects.mjs`: so danh mục môn trong code với DB (chỉ đọc)
- `schema.sql` + cột mở rộng (`type`, `source_id`, `duration_minutes`, …)

### Đã làm trong Oct 2026 (PR #98–#105)
- **Xoá bài / đề / chương** (#98): `DELETE /api/lesson/[id]`, `DELETE /api/chapters?id=`; nút xoá ở `/import/chapter/[id]` (từng dòng + cả chương) và trong trang sửa đề.
- **Tăng tốc** (#99): Supabase ở Mumbai nên mỗi truy vấn nối tiếp tốn ~0,3–0,7 s. Gộp truy vấn bằng embedded join (trang lớp, `/quiz`, `/de-thi`); bảng xếp hạng cache 5 phút và stream trong `Suspense`.
- **Tiếng Việt theo chủ điểm** (#100 lớp 4, #101 lớp 5, PR lớp 3): `lib/tvGuide/`, hiện trên tab Tiếng Việt của `/lop/3`, `/lop/4`, `/lop/5`. Phần Viết lớp 5 lấy dàn ý từ `lib/lamVan.ts`. Lớp 3 xếp bài khác (`ltvcBai: "chan"`: Luyện từ và câu + luyện viết đoạn nằm trong phần Luyện tập của bài chẵn; bài lẻ có Nghe – viết, Kể chuyện / Nói và nghe); một mục có thể trỏ tới hai dạng (`ky: ["…", "…"]`).
- **Toán 2–4 lời văn** (#107 viết lại lời giải thành “Bài giải”; PR “lời văn mới lớp 2–4” thêm 2 câu lời văn vào mỗi bài phép tính, đo lường, chu vi/diện tích, phân số — chi tiết trong `CLAUDE.md`, mục Toán tự sinh).
- **Phiếu hoạt động AI lớp 1–3** (`lib/aiSheets/lop1.ts`, `lop2.ts`, `lop3.ts`): 12 phiếu mỗi lớp theo QĐ 2422, đủ mã yêu cầu cần đạt cốt lõi; `/phieu-bai-tap?loai=ai` giờ có đủ lớp 1–5.
- **Bài tập Tiếng Việt 1 theo từng bài** (`/lop/1/tieng-viet`): 139 bài; tập một hỏi bằng tiếng bé đã học tới bài đó (`lib/tvGen/am.ts` tách tiếng thành âm, vần, dấu), tập hai theo 8 chủ đề.
- **Bài tập Tiếng Việt 2 theo từng bài** (`/lop/2/tieng-viet`): 62 bài, mỗi bài 10 câu trắc nghiệm theo đúng phần Nghe – viết và Luyện tập của bài; bộ sinh câu trong `lib/tvGen/`, sách trong `lib/sgk/books/tv2.ts`.
- **Tạo đề nhanh Tiếng Việt lớp 3**: `lib/exam5/tvContent3.ts` (8 bài đọc tự soạn, ngân hàng LTVC lớp 3, đề đoạn văn), nối vào `TV_CONTENT`.
- **Toán 1 lời văn**: “Viết phép tính thích hợp” gắn vào bài 10, 11, 29–32.
- **Toán theo sách**:
  - #102: ví dụ giải mẫu trên màn hình bắt đầu mỗi bài.
  - #103: nút "Kiểm tra" từng câu (chế độ `practice`, chỉ bài theo sách).
  - #104: bài toán có lời văn lớp 5 trình bày đủ "Bài giải" (`baiGiai()` trong `lib/mathGen/core.ts`, 12 dạng `lv*` mới trong `KNTT5`).
  - Lời giải lớp 2–4 theo mẫu "Bài giải": mọi dạng lời văn trong `lop{2,3,4}.ts`, `kntt/lop{2,3,4}.ts`, `exam5/toan1to4.ts` (đã kiểm: câu hỏi, đáp án và trạng thái `r()` giống hệt master trên mọi generator, đề in lớp 1–5 và bài sách lớp 1–5; file SQL chỉ đổi lời giải).

## Việc tiếp theo (ưu tiên từ trên xuống)

1. **Tiếng Việt theo chủ điểm lớp 1** (lớp 2 xong: `lib/tvGuide/lop2.ts`). Lớp 1 khác hẳn: tập 1 là bài âm, vần, không có Luyện từ và câu hay viết đoạn, nên kiểu `TvBai` (bắt buộc `viet`, Luyện từ và câu theo bài chẵn/lẻ) không vừa; cần quyết định có làm không, hay chỉ làm tập 2 (8 chủ đề).

### Cần chủ site làm hoặc duyệt (không phải việc code)
- **Bật sao lưu DB**: thêm secret `SUPABASE_DB_URL` (Session pooler) và `BACKUP_PASSPHRASE` trên GitHub, rồi chạy tay "Sao lưu DB" một lần — các bước ở `feature-specs/backup.md`.
- **Bật nhiều người soạn đề**: chạy `supabase/nguoi-soan.sql` trong Supabase SQL Editor (một lần), đặt `IMPORT_PASSWORD` trên Vercel nếu chưa, rồi mời người ở `/import/nguoi-soan`. Kiểm đã chạy SQL chưa ở `/import/kiem-tra`. Supabase Auth phải **bật xác nhận email** (mặc định đã bật) — người soạn chỉ được nhận quyền khi email đã xác nhận.
- **Vercel Function Region → `bom1` (Mumbai)** cho trùng với Supabase (`ap-south-1`). Đây là cách tăng tốc lớn nhất, chưa xác nhận đã đổi chưa. Đổi xong thì đo lại tốc độ: `curl -w "%{time_total}"` trên `/lop/1?view=exam`; trước khi đổi mất 1,7–2,6 s.
- **Duyệt nội dung viết tay**:
  - `lib/aiSheets/lop1.ts`, `lop2.ts`, `lop3.ts` (mới): tình huống, đáp án và tiến trình 36 phiếu AI; đối chiếu tên chủ đề, mã yêu cầu với QĐ 2422.
  - `lib/sgk/books/tv1.ts` (mới): tên bài tập một theo mục lục và kế hoạch dạy học, nên soát lại với sách in (đặc biệt bài 6, 7, 9: dấu thanh đi kèm, bài 62–67).
  - `lib/tvGen/am.ts`, `lop1.ts` (mới): kho tiếng lớp 1, câu điền từ theo chủ đề tập hai.
  - `lib/tvGen/spell.ts`, `ltvc.ts` (mới): kho vần lớp 2, từ hỏi/ngã, từ chỉ sự vật – hoạt động – đặc điểm, câu mẫu, chủ đề mở rộng vốn từ, tên riêng / câu viết hoa.
  - `lib/exam5/tvContent3.ts` (mới): 8 bài đọc lớp 3, câu hỏi, đáp án nhiễu, ngân hàng luyện từ và câu.
  - `lib/tvGuide/lop2.ts` (mới): tên phần Luyện từ và câu, viết đoạn của bài chẵn là tóm tắt từ yêu cầu bài tập; cách làm và ví dụ của 19 dạng bài; gợi ý đọc hiểu 9 chủ điểm.
  - `lib/tvGuide/lop3.ts`: tên phần Luyện tập của bài chẵn là tóm tắt từ các yêu cầu bài tập (mục lục chỉ ghi “Luyện tập”), cách làm và ví dụ của 26 dạng bài, gợi ý đọc hiểu.
  - `lib/tvGuide/lop4.ts`, `lop5.ts`: công dụng dấu gạch ngang (lớp 5 có ghi cả "phần chú thích"), dấu ngoặc kép, các gợi ý đọc hiểu (viết theo tên chủ điểm). TV5 tập 2 bài 6 chưa tìm được phần Nói và nghe.
  - Tình huống trong 12 dạng lời văn lớp 5 (`lv*` trong `lib/mathGen/kntt/lop5.ts`).
- **Dọn dữ liệu rác trong DB** bằng nút xoá: chương "tập đọc" lớp 1 (bài abc, fff), chương "aâ" lớp 3, đề "uu" lớp 1.

## Not done / deferred

- AI tutor, subscription
- Enforce `lessons.status` locked/completed trên UI (DB có, app chủ yếu dùng `active`)

## Removed / obsolete docs

- **`/teacher`** — không còn trong repo; dùng `/import/edit/[id]` để sửa bài có sẵn
- File `feature-specs/teacher.md` đã xóa — xem `feature-specs/import.md`

## Known notes

- Quiz data: chỉ từ DB qua server props — không fallback localStorage khi làm bài
- Refresh `/quiz` → về màn Start (timer không persist)
- Refresh `/result` không có `sessionStorage` → redirect `/`
- Guest vẫn làm quiz; `quiz_results.user_id` = null
- Leaderboard cần service role; tra email bằng `auth.admin.getUserById` cho top 10, cache 5 phút
- Có bộ test: `npm test` (`tests/*.test.ts`) và `npm run check` (lint + typecheck + test + mọi `scripts/*-check.ts`)

## Lưu ý vận hành (rút ra từ các phiên trước)

- **`next dev` tự sinh `AGENTS.md`** ở gốc repo: xoá trước khi commit, đừng đưa vào PR.
- **Tắt dev server:** đừng `pkill -f "next dev"` trong cùng lệnh vừa khởi động nó, vì pattern sẽ khớp với chính shell đó và giết luôn shell. Dùng `ps -eo pid,args | grep -E "[n]ext dev -p <port>|[n]ext-server"` ở một lệnh riêng.
- **Chạy thử không cần Supabase:** đặt `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:9`, các key là `x`. Trang theo sách (Toán, Tiếng Việt chủ điểm) vẫn chạy; lỗi "fetch failed" của Supabase là do chính cấu hình này.
- **Chromium cho Playwright:** `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- **Đọc thử DB thật:** publishable key nằm sẵn trong bundle JS của site nên dùng REST được, nhưng chỉ đọc (`GET /rest/v1/...`), không ghi.
- **Phân tích HTML từ loigiaihay:** trang dùng Unicode tổ hợp (NFD). Phải `unicodedata.normalize('NFC', …)` trước khi so chuỗi tiếng Việt. Mục lục bị chia trang (`.../e<id>/2.html`, `3.html`…), các trang sau không có tiêu đề "Tuần".
