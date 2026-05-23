# Workflow Guide — Ôn Tập Tiểu Học

Reference: `.claude/ai-context/` · `CLAUDE.md`

## App flows (current)

```
/  →  /lop/[grade]  →  /quiz?lessonId=  →  /result
         ↓
      /de-thi (all exams)

/import | /import/exam  →  create  →  /quiz?lessonId=
/import/edit/[id]       →  update
/import/chapter/[id]    →  chapter dashboard

/login  →  /progress (quiz history)
```

## Dev workflow (feature build)

### 1. UI
- Match existing Header, cards, grade colors
- Vietnamese strings; `MathText` for math content

### 2. Components
- Place under `components/<area>/`
- Server page in `app/` fetches data; pass props to client child

### 3. Logic (client)
- Quiz: `QuizClient` — `started` gates timer; `scoreAnswer` for grading
- Import: `ImportClient` — draft `localStorage`, API save

### 4. Data
- Reads/writes: `lib/db.ts` or `app/api/*` with service role
- Paste import: `lib/examParser.ts` + `mathNormalizer.ts`
- Bulk external: `scripts/nxbgd-import*.mjs` (offline)

### 5. Refactor
- Behavior unchanged; no drive-by renames

## Rules

- One concern per PR-sized change
- Test manually: `npm run dev` — no automated test suite
- `await` dynamic route `params` / `searchParams` in server components

## Obsolete (ignore)

- `homepage → exam list → quiz` with local JSON only
- `/teacher` as separate editor
- AI import route (not shipped)
