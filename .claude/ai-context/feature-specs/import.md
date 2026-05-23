# Import — Tạo / Sửa bài học & đề kiểm tra

Một component trung tâm: `ImportClient.tsx`. Khác nhau qua props `examMode` và `initialData`.

| Route | Mode |
|-------|------|
| `/import` | Bài học mới (`type: 'lesson'`) |
| `/import/exam` | Đề kiểm tra mới (`type: 'exam'`) |
| `/import/edit/[id]` | Sửa — load `GET /api/lesson/[id]` |

## Components
- `ImportClient` — form meta + danh sách câu
- `QuestionCard` (import) — editor từng câu, 4 loại `QType`
- `PasteImportModal` — paste text/HTML → `examParser.ts` (+ `mathNormalizer`)
- `TiptapEditor` — nội dung rich text / LaTeX
- `MathText` — preview trong sidebar

## QDraft (`components/import/QuestionCard.tsx`)

```ts
type QType = "mcq" | "multi" | "short" | "numeric";

type QDraft = {
  id: string;           // nanoid — client only
  type: QType;
  content: string;      // có thể chứa $KaTeX$
  options: string[];    // 2–6 cho mcq/multi; [] cho short/numeric
  correctIdx: number;   // mcq
  correctIdxs: number[]; // multi
  answer: string;       // short: pipe-delimited; numeric: số
  imageUrl?: string;    // lưu JSON trong explanation khi save
};
```

## Create flow
1. Chọn lớp → môn (`GET /api/subjects?grade=`) → chương (`GET /api/chapters?subjectId=`)
   - Nút **+** tạo chương mới → `POST /api/chapters`
2. `index_label`, title, `duration_minutes` (đề/bài)
3. Thêm/sửa câu thủ công hoặc paste modal
4. `POST /api/create-lesson` → link `/quiz?lessonId=`

## Edit flow (`/import/edit/[id]`)
1. `GET /api/lesson/[id]` → `initialData`
2. `POST /api/update-lesson` — cập nhật lesson, **xóa hết** questions cũ, insert lại
3. Không autosave `localStorage`

## Autosave (create only)
- Key: `ontap_import_draft_v1` (lesson) hoặc `ontap_exam_draft_v1` (exam)
- Debounce 500ms
- Hydration: giữ `pendingSubjectId` / `pendingChapterId` refs khi restore draft — đừng phá khi refactor effect cascade

## Keyboard
- `Ctrl/Cmd+S` — lưu
- `Ctrl/Cmd+Enter` — thêm câu trống

## Paste import (`lib/examParser.ts`)
- Nhận plain text hoặc HTML (strip tags trước khi parse)
- Nhận diện: `Câu N.` / `Câu N:`, options `A.` … (1 hoặc 2 cột), đáp án `Đáp án:`, `Answer:`, `Chọn X.` (loigiaihay)
- **Suy luận type lúc commit** (không từ marker riêng):
  - ≥2 options + 1 chữ cái → `mcq`
  - ≥2 options + nhiều chữ cái → `multi`
  - Không options + số → `numeric`
  - Không options + text → `short`
- Pattern `Đáp án: B` chỉ map chữ cái khi **đã có options** (tránh nhầm `Cần Thơ`)

## Ảnh
- `POST /api/upload-image` — max 10MB, jpg/png/webp/gif/svg
- Bucket public `question-images` (service role upload)

## LaTeX sidebar
- `focusedEditor.ts` — insert vào Tiptap đang focus
- Nút cheat-sheet: `onMouseDown` + `preventDefault`

## APIs liên quan

| Method | Path | Ghi chú |
|--------|------|---------|
| GET | `/api/subjects?grade=N` | |
| GET/POST | `/api/chapters` | POST tạo chương |
| GET | `/api/lesson/[id]` | Edit hydrate |
| POST | `/api/create-lesson` | Insert lesson + questions |
| POST | `/api/update-lesson` | Replace questions |
| GET | `/api/fetch-exam?url=` | Scrape URL cho paste |
| POST | `/api/upload-image` | multipart `file` |

## Chapter dashboard
`/import/chapter/[id]` — server page: `getChapterContext` + `getLessonsInChapter`, thống kê bài đã có câu / trống, link sửa từng bài.

## proxy.ts
Matcher `/import/:path*` — refresh session cookie; **guest vẫn vào được** import.
