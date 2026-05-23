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
| explanation | text? | JSON `{ imageUrl }` hoặc giải thích |
| order_index | int | |

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

## Storage
- Bucket `question-images` (public read) — upload qua API service role

## Auth (Supabase managed)
- `auth.users` — email/password, magic link
- Không có bảng `profiles` riêng trong app

## Chưa dùng
- subscriptions, user_progress table, AI sessions
