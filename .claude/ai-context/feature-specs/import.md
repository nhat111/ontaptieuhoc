# Import — Tạo / Sửa bài học & đề kiểm tra

Một component trung tâm: `ImportClient.tsx`. Khác nhau qua props `examMode` và `initialData`.

| Route | Mode |
|-------|------|
| `/import` | Bài học mới (`type: 'lesson'`) |
| `/import/exam` | Đề kiểm tra mới (`type: 'exam'`) |
| `/import/edit/[id]` | Sửa — load `GET /api/lesson/[id]` |
| `/import/chapter/[id]` | Dashboard tiến độ bài trong chương |
| `/import/giong-doc/[id]` | Ghép file giọng đọc vào từng câu |
| `/import/kiem-tra` | Chẩn đoán cấu hình (chỉ đọc) |

**Cả khu này bị khoá bằng `IMPORT_PASSWORD`** — chi tiết ở `access-control.md`. Chốt chặn nằm ở `app/import/layout.tsx` và trong từng API ghi, **không phải `proxy.ts`**.

## Components
- `ImportClient` — form meta + danh sách câu
- `QuestionCard` (import) — editor từng câu, 4 loại `QType`, ảnh, lời giải
- `PasteImportModal` — paste text/HTML/URL → parser; kèm nút **Quét ảnh đề** (OCR)
- `TiptapEditor` — nội dung rich text / LaTeX, có hook `onPasteText`
- `AudioMapper` — trang `/import/giong-doc/[id]`
- `MathText` — preview trong sidebar

## QDraft (`components/import/QuestionCard.tsx`)

```ts
type QType = "mcq" | "multi" | "short" | "numeric";
type QImage = { url: string; position: "before" | "after" };

type QDraft = {
  id: string;            // nanoid — client only
  type: QType;
  content: string;       // có thể chứa $KaTeX$
  options: string[];     // 2–6 cho mcq/multi; [] cho short/numeric
  correctIdx: number;    // mcq
  correctIdxs: number[]; // multi
  answer: string;        // short: pipe-delimited; numeric: số
  images: QImage[];      // nhiều ảnh, đặt trước/sau nội dung
  imageUrl?: string;     // @deprecated — dòng cũ chỉ có một ảnh
  solution?: string;     // lời giải, hiện ở /result
};
```

Khi lưu, `images` / `imageUrl` / `solution` / `audioUrl` gói chung vào blob JSON `questions.explanation`. Không có cột riêng. `ImportClient` chuẩn hoá `imageUrl` cũ thành `images: [{ url, position: "after" }]` lúc hydrate.

## Create flow
1. Chọn lớp → môn (tĩnh, `lib/subjects.ts`, không gọi API) → chương (`GET /api/chapters?grade=&subject=`)
   - Nút **+** tạo chương mới → `POST /api/chapters`
   - **Chương là tuỳ chọn**: bỏ trống thì gửi `grade` + `subject`, máy chủ gom vào chương mặc định (`ensureDefaultChapterId`) — `Đề kiểm tra` cho exam, `Chưa phân chương` cho lesson. Bắt buộc chỉ còn môn + tên + câu hỏi.
2. `index_label`, title, `duration_minutes`
3. Thêm/sửa câu thủ công, paste modal, hoặc quét ảnh
4. `POST /api/create-lesson` → link `/quiz?lessonId=`

## Edit flow (`/import/edit/[id]`)
1. `GET /api/lesson/[id]` → `initialData`
2. `POST /api/update-lesson` — cập nhật lesson, **xoá hết** questions cũ, insert lại
3. Không autosave `localStorage`

`update-lesson` **re-attach `audioUrl` theo nội dung câu**, nên sửa bài không còn xoá mất giọng đọc đã ghép. Đây cũng là lý do `/api/lesson-audio` không đi qua route này.

## Autosave (create only)
- Key: `ontap_import_draft_v1` (lesson) hoặc `ontap_exam_draft_v1` (exam)
- Debounce 500ms
- Hydration: giữ ref `pendingChapterId` khi restore draft — phá là draft mất chương đã chọn. Môn **không cần** ref: danh mục đọc đồng bộ từ `lib/subjects.ts`, selection là giá trị dẫn xuất.
- Draft lưu **tên môn**; draft cũ (lưu `subjectId` số) fallback về môn đầu tiên của lớp.

## Keyboard
- `Ctrl/Cmd+S` — lưu
- `Ctrl/Cmd+Enter` — thêm câu trống

## Dán cả cụm "câu hỏi + A/B/C/D" (`lib/optionSplitter.ts`)

Dán nguyên khối vào ô nội dung thì đáp án tự tách ra các ô riêng. Nối qua `onPasteText` của `TiptapEditor`.

Chỉ tách khi **chắc chắn** — dán nhầm là phá đúng thứ người dùng vừa dán:
- Dãy nhãn bắt đầu từ `A` và đúng thứ tự
- Phần thân câu hỏi không rỗng, không option nào rỗng
- Câu đang là `mcq`/`multi`
- Ô nội dung **và** mọi ô đáp án đều đang trống

Tách xong thì báo đã làm gì và cho **Hoàn tác** — hoàn tác trả lại **văn bản thô vừa dán**, không phải trạng thái trước khi dán: ở đây "undo" nghĩa là "đừng tách", chứ không phải "vứt luôn cái tôi vừa dán".

## Paste import (`PasteImportModal`)

- Nhận plain text hoặc HTML (strip tags trước khi parse)
- Parser chính `lib/examParser.ts`: `Câu N.` / `Câu N:`, options `A.` … (1 hoặc 2 cột), đáp án `Đáp án:`, `Answer:`, `Chọn X.`
- **URL import**: `GET /api/fetch-exam?url=` trả HTML/plain text; nếu trông như trang lời giải loigiaihay/vietjack thì dùng `lib/loigiaihayParser.ts → parseLoigiaihay` thay cho `examParser`
- `lib/mathNormalizer.ts` nâng cấp `sqrt(x)`, `n/m` thành LaTeX trước khi lưu (bỏ qua phần đã nằm trong dấu math)
- **Suy luận type lúc commit** (không từ marker riêng):
  - ≥2 options + 1 chữ cái → `mcq`
  - ≥2 options + nhiều chữ cái → `multi`
  - Không options + số → `numeric`
  - Không options + text → `short`
- Pattern `Đáp án: B` chỉ map chữ cái khi **đã có options** (tránh nhầm `Đáp án: Cần Thơ`)

## Quét ảnh đề (`POST /api/ocr-exam`)

- Multipart `file` (ảnh ≤10MB, jpg/png/webp/gif) → Claude vision (`claude-opus-5`) với ràng buộc output `json_schema` → `{ title, questions: [{content, options, correctIndex}], usage }`
- Đọc được **đáp án khoanh bút** — OCR thường không làm được. Không thấy dấu khoanh thì trả `correctIndex: -1`; model được dặn **không đoán**, UI báo người dùng tự tick.
- `stop_reason: 'refusal'` được kiểm trước khi đọc content
- Beta `fallbacks` là best-effort: gặp 400 nhắc tới nó thì thử lại một lần không bật
- Cần `ANTHROPIC_API_KEY`, thiếu thì 503. `GET /api/ocr-exam` → `{ available: boolean }` (probe năng lực, **không bao giờ trả key**); modal gọi lúc mở và **ẩn hẳn nút** khi chưa cấu hình, để không ai bấm vào một lỗi 503.

## Ảnh
- `POST /api/upload-image` — multipart `file`, max 10MB, jpg/png/webp/gif/svg
- Bucket public `question-images` (service role upload, khỏi mở RLS cho anon)
- Mỗi câu nhiều ảnh, đổi thứ tự và chọn đặt trước/sau nội dung

## Giọng đọc gắn sẵn
Xem `tts-audio.md`. Tóm tắt: `/import/giong-doc/[id]` ghép file theo **số trong tên file**, `POST /api/upload-audio` (đặt tên theo hash nội dung) + `POST /api/lesson-audio` (read-merge-write vào `explanation`).

## LaTeX sidebar
- `focusedEditor.ts` — insert vào Tiptap đang focus
- Nút cheat-sheet **bắt buộc** `onMouseDown` + `preventDefault`, không thì focus nhảy đi trước khi chèn

## APIs liên quan

| Method | Path | Ghi chú |
|--------|------|---------|
| GET/POST | `/api/chapters` | Theo (grade, subject); POST tạo chương |
| GET | `/api/lesson/[id]` | Edit hydrate |
| POST | `/api/create-lesson` | Insert lesson + questions |
| POST | `/api/update-lesson` | Replace questions (giữ lại `audioUrl` theo nội dung) |
| GET | `/api/fetch-exam?url=` | Scrape URL cho paste |
| POST | `/api/upload-image` | multipart `file` |
| POST | `/api/ocr-exam` | multipart ảnh → câu hỏi; GET → `{ available }` |
| POST | `/api/upload-audio` | multipart file audio |
| POST | `/api/lesson-audio` | Merge `audioUrl` vào `explanation` |

Mọi route ghi ở trên tự gọi `blockIfNoImportAccess(req)`.

## Chapter dashboard
`/import/chapter/[id]` — server page: `getChapterContext` + `getLessonsInChapter`, thống kê bài đã có câu / trống, link sửa từng bài.

## Chẩn đoán
`/import/kiem-tra` — kết nối Supabase, số dòng mỗi bảng, đối chiếu `lib/subjects.ts` ↔ bảng `subjects`. Bản web của `scripts/check-subjects.mjs`, cho lúc chỉ có điện thoại trong tay.
