# Database Schema

PostgreSQL trên Supabase. File nguồn: `schema.sql`. Một số cột production có thể cần `ALTER` thủ công — xem comment trong file và `CLAUDE.md`.

## subjects
| column | type | notes |
|--------|------|-------|
| id | serial PK | |
| name | text | VD "Toán" |
| grade | int | 1–5 |
| order_index | int | |

## chapters
| column | type | notes |
|--------|------|-------|
| id | serial PK | |
| title | text | |
| subject_id | int FK | |
| order_index | int | |
| source_id | text? | NXBGD id — unique partial index |
| source_url | text? | |
| source_parent_id | text? | |

## lessons
| column | type | notes |
|--------|------|-------|
| id | serial PK | **URL lessonId** |
| title | text | |
| index_label | text | "01", "02"… |
| chapter_id | int FK | |
| status | text | `completed` \| `active` \| `locked` |
| order_index | int | |
| duration_minutes | int | default 15 — timer quiz |
| type | text? | `'lesson'` \| `'exam'` — có thể chưa trong schema.sql cũ |
| source_id | text? | NXBGD |
| source_url | text? | |

## questions
| column | type | notes |
|--------|------|-------|
| id | serial PK | |
| lesson_id | int FK | |
| content | text | KaTeX raw |
| type | text | `mcq` \| `multi` \| `short` \| `numeric` |
| options | jsonb | string[] — 2–6 (mcq/multi), `[]` (short/numeric) |
| correct_answer | text | encoding theo type — **sai = chấm điểm lệch im lặng** |
| explanation | text? | **blob JSON đa dụng** — xem dưới |
| order_index | int | |

### `explanation` — không chỉ là lời giải

Không có cột riêng cho ảnh / lời giải / audio; tất cả nhét chung vào JSON ở `explanation`:

```json
{
  "images":   [{ "url": "https://…", "position": "below" }],
  "imageUrl": "https://…",
  "solution": "Lấy 12 chia 4 …",
  "audioUrl": "https://…/question-audio/<hash>.wav"
}
```

- Dòng cũ có thể chỉ có `{ imageUrl }`, hoặc là văn bản thường (không phải JSON) — đọc phải chịu được cả hai.
- Ghi thì **đọc-trộn-ghi**, đừng đè cả blob: `POST /api/lesson-audio` chỉ trộn `audioUrl` vào, giữ nguyên ảnh và lời giải.
- `POST /api/update-lesson` xoá sạch câu hỏi rồi chèn lại, nên nó gắn lại `audioUrl` **theo nội dung câu hỏi** — sửa bài không còn làm mất giọng đọc.

### correct_answer encoding
- **mcq**: text đúng trùng một phần tử `options`
- **multi**: `JSON.stringify(string[])` các option đúng
- **short**: `"Hà Nội|Ha Noi|hà nội"`
- **numeric**: `"42.5"` (string)

## quiz_results
| column | type | notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| lesson_id | int FK | |
| score | int | số câu đúng |
| total | int | tổng câu |
| user_id | uuid? FK | `auth.users` — nullable (guest) |
| created_at | timestamptz | |

## profiles
| column | type | notes |
|--------|------|-------|
| user_id | uuid PK FK | `auth.users` |
| is_premium | bool | default false |
| premium_until | timestamptz? | NULL + `is_premium` ⇒ vĩnh viễn |
| note | text? | mã chuyển khoản, kích hoạt tay |
| created_at | timestamptz | |

**Hiện không chặn tính năng nào.** `lib/premium.ts` và `GET /api/me/premium` vẫn đọc bảng này, nhưng tải đề Word/PDF đã mở cho mọi người (comment "gated behind is_premium" trong `schema.sql` là dấu tích của bản cũ). Không có phần nào của app đọc `isPremium` nữa.

## Storage
| bucket | nội dung | ghi |
|--------|----------|-----|
| `question-images` | ảnh đính câu hỏi | `POST /api/upload-image` |
| `question-audio` | file giọng đọc, đặt tên theo hash nội dung | `POST /api/upload-audio` |

Cả hai **phải public read** (URL trả về là public URL), ghi qua service role nên Storage RLS không cần mở cho anon.

## Auth (Supabase managed)
- `auth.users` — email/password, magic link

## Chưa dùng
- subscriptions, user_progress table, AI sessions
