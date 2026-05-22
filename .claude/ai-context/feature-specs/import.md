# Import / Create Lesson

There are two import paths. Both save via `/api/create-lesson` and produce the same DB output.

---

## Manual Import — `/import` · Edit — `/import/edit/[id]`

### Purpose
Create a new lesson + questions by typing or pasting raw exam text.  
The same `ImportClient` component handles both **create** and **edit** modes via the optional `initialData` prop.

### Flow (Create)
1. Select grade → subject (`/api/subjects`) → chapter (`/api/chapters`)
   - If chapter list is empty (or user wants a new one): click **+** button → inline form → POST `/api/chapters` → auto-selects new chapter
2. Enter `index_label` and lesson title
3. Add questions manually or open the paste-import modal
4. Save → POST `/api/create-lesson`

### Flow (Edit — `/import/edit/[id]`)
1. Page fetches `GET /api/lesson/[id]` → populates all fields
2. User edits lesson info and/or questions
3. Save → POST `/api/update-lesson` (replaces all questions for the lesson)
4. Form stays populated; success banner shows "Đã cập nhật bài học!"

### Components
- `ImportClient` — main page client component; accepts optional `initialData?: InitialData` prop; header links to `/teacher` (add to existing lesson) and `/import/ai`
- `QuestionCard` (import version) — editable question card with collapse/expand
- `PasteImportModal` — paste raw exam text (plain text **or HTML**) → `examParser.ts` → `QDraft[]`
- `TiptapEditor` — rich text / math editor for question content
- `MathText` — KaTeX preview in the right-side LaTeX cheatsheet

### Question draft type (QDraft)
```ts
type QDraft = {
  id: string;                           // nanoid, client-only
  content: string;                      // may include $KaTeX$
  options: [string, string, string, string];
  correctIdx: 0 | 1 | 2 | 3;          // index into options[]
  imageUrl?: string;                    // stored as JSON in explanation on save
}
```

### Auto-save
- Draft saved to `localStorage` key `"ontap_import_draft_v1"` (debounced 500ms)
- Restored on mount including grade/subject/chapter IDs
- Cleared after successful save
- **Disabled in edit mode** (`initialData` provided)

### Keyboard shortcuts
- `Ctrl+S` → save
- `Ctrl+Enter` → add new question

### Paste Import modal
- Format: `"Câu 1. ... A. ... B. ... Đáp án: C"`
- `examParser.ts` parses → `DraftQuestion[]`; `mathNormalizer.ts` converts plain-text math first
- Two modes: replace all existing questions OR append
- **HTML paste**: `onPaste` handler intercepts clipboard HTML (from browser, Word, Google Docs), strips tags/entities to plain text before inserting into textarea — user never sees raw HTML

### LaTeX sidebar
- Quick-insert buttons for common KaTeX patterns
- `focusedEditor.ts` inserts into whichever textarea is currently focused

---

## Save API — `/api/create-lesson` (shared)
- Creates `lessons` row with `title`, `index_label`, `chapter_id`, `status: "active"`
- Bulk inserts `questions` rows
- Returns `{ lessonId }` on success
- After save: shows link to `/quiz?lessonId=<id>`

## Edit APIs

### `POST /api/chapters`
- Body: `{ subjectId, title }`
- Creates a new chapter for the subject; `order_index` = max existing + 1
- Returns `{ id, title }` on success
- Used by inline chapter creation form in `ImportClient`

### `GET /api/lesson/[id]`
- Returns `{ lessonId, title, indexLabel, chapterId, subjectId, grade, questions: QDraft[] }`
- Used by `/import/edit/[id]` to pre-populate the form

### `POST /api/update-lesson`
- Body: `{ lessonId, chapterId, title, indexLabel, questions }`
- Updates `lessons` row in place
- Deletes all existing `questions` for the lesson, then bulk inserts new ones
- Returns `{ lessonId }` on success
