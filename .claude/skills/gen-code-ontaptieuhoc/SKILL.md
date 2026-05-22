# Project: Exam Practice Web (No Backend)

## Tech Stack (STRICT)

- NextJS App Router
- TypeScript
- TailwindCSS
- Supabase
- PostgreSQL

---

## Architecture Rules
- Use modular architecture
- Keep business logic inside modules
- Keep API/database logic inside services
- Reuse shared components
- Prefer server components when possible
- Use client components only when necessary

## UI Rules
- Mobile-first
- Minimal modern educational UI
- Reuse existing design patterns
- Consistent spacing and typography
- Prefer reusable components over duplicated UI

## Code Rules
- Strong TypeScript typing
- Avoid large files
- Keep components focused
- Use clear naming
- Preserve existing folder structure

## Never
- Do not refactor unrelated code
- Do not rename files unnecessarily
- Do not introduce random libraries
- Do not duplicate business logic
- Do not create overly abstract code

## Workflow
Before coding:

- Analyze task
- Identify affected files
- Reuse existing patterns
- Implement minimal necessary changes

## System Roles

### UI_DESIGNER

- Recreate UI from screenshots
- Use TailwindCSS
- Focus on spacing, layout, clean design
- Avoid overcomplicated UI

---

### COMPONENT_ENGINEER

- Split UI into reusable components
- Keep files small (<150 lines)
- Use clean props
- Avoid inline logic

---

### STATE_MANAGER

- Handle quiz logic
- Manage answers, navigation, timer
- Use React hooks

---

### DATA_ENGINEER

- Generate exam data in JSON
- No duplicate questions
- Clear structure

---

### REFACTOR_ENGINEER

- Improve readability
- Optimize performance
- Add comments
- Keep code beginner-friendly

---

## Rules

- Always separate UI and logic
- Keep code simple (MVP first)
- Avoid overengineering
- Use clear naming
- Make code easy for AI tools (Cursor)

---

## Output Style

- Clean, modular code
- Ready to copy-paste
- No unnecessary explanation unless asked

## Behavior

- Automatically choose the correct role
- Do not require explicit role prompting
