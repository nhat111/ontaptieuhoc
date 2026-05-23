# NXBGD Offline Import Scripts

Chạy **ngoài** Next.js — Node 20.6+, cần `.env.local` với Supabase service role.

## Files

| Script | Mục đích |
|--------|----------|
| `scripts/nxbgd-import.mjs` | Import skeleton chapters + lessons từ API NXBGD |
| `scripts/nxbgd-import-questions.mjs` | Kéo câu hỏi vào bảng `questions` |

## Thứ tự chạy

1. `nxbgd-import.mjs` — tạo chapters/lessons (`source_id`, `source_url`)
2. `nxbgd-import-questions.mjs` — lessons đã có skeleton, chưa có câu

## Env

- `NEXT_PUBLIC_SUPABASE_URL` (hoặc `SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `NXBGD_TOKEN` — cho API hanhtrangso.nxbgd.vn
- `NXBGD_MAX_PER_LESSON` (optional, default cap per lesson)

## Type mapping (questions script)

| NXBGD | App type |
|-------|----------|
| MCQ 1 đáp án | `mcq` |
| MCQ nhiều đáp án | `multi` |
| fill_blank (1 ô) | `short` |
| math_col, multi-blank, … | **SKIP** (log) |

HTML trong content được strip; Wiris `<img alt="X over Y">` → `$\frac{X}{Y}$` heuristic.

## Idempotency

- Chapters/lessons: unique partial index on `source_id`
- Questions: lesson đã có ≥1 câu → skip; xóa questions thủ công để import lại

## Usage example

```bash
node --env-file=.env.local scripts/nxbgd-import-questions.mjs --books 402
node --env-file=.env.local scripts/nxbgd-import-questions.mjs --books 402 --dry-run
node --env-file=.env.local scripts/nxbgd-import-questions.mjs --lessons 123,456
```

## App integration

Sau import, bài xuất hiện trên `/lop/[grade]` và làm được qua `/quiz?lessonId=`. Dashboard: `/import/chapter/[chapterId]`.
