# RLS Rules

## Current state: No authentication

The app has no user auth (no Supabase Auth, no login). All data access is anonymous.

## Recommended RLS setup (for current no-auth app)

### Public read (all tables)
- `subjects`, `chapters`, `lessons`, `questions` — SELECT allowed for `anon` role
- Allows the grade/quiz pages to fetch content without auth

### Restricted write
- `questions`, `lessons` — INSERT restricted to `service_role` only  
  (create-lesson API uses the server Supabase client with service role key)
- `quiz_results` — INSERT allowed for `anon` (anonymous score tracking)

## Future: if auth is added

When Supabase Auth is added later:
- `quiz_results` should include `user_id` FK → `auth.users.id`
- RLS: users can INSERT/SELECT own results only
- Teacher/admin writes should require a role check
