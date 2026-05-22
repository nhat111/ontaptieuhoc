# Database Schema

All tables are in Supabase (PostgreSQL). No auth tables used.

## subjects
| column       | type    | notes                          |
|-------------|---------|--------------------------------|
| id           | int     | PK                             |
| name         | text    | e.g. "Toán", "Tiếng Việt"     |
| grade        | int     | 1–5                            |
| order_index  | int     | display order within grade     |

## chapters
| column      | type | notes                        |
|------------|------|------------------------------|
| id          | int  | PK                           |
| title       | text | chapter name                 |
| subject_id  | int  | FK → subjects.id             |
| order_index | int  | display order within subject |

## lessons
| column      | type | notes                                        |
|------------|------|----------------------------------------------|
| id          | int  | PK                                           |
| title       | text | lesson name                                  |
| index_label | text | display label e.g. "01", "02"                |
| chapter_id  | int  | FK → chapters.id                             |
| status      | text | 'active' \| 'completed' \| 'locked'          |
| order_index | int  | display order within chapter                 |

## questions
| column       | type    | notes                                         |
|-------------|---------|-----------------------------------------------|
| id           | int     | PK                                            |
| content      | text    | question text (may contain KaTeX: $...$)      |
| options      | text[]  | array of 4 answer strings                     |
| correct_answer | text  | must match one of options[]                   |
| explanation  | text    | optional; may hold JSON `{imageUrl: "..."}` if image question |
| lesson_id    | int     | FK → lessons.id                               |
| order_index  | int     | display order within lesson                   |

## quiz_results
| column    | type | notes                        |
|----------|------|------------------------------|
| id        | int  | PK                           |
| lesson_id | int  | FK → lessons.id              |
| score     | int  | correct answer count         |
| total     | int  | total question count         |
| created_at | timestamp | auto                    |

## Tables NOT in use
- users / profiles (no auth)
- user_progress (not implemented)
- subscriptions (not implemented)
