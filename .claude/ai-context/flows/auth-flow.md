# Auth Flow

## Current state: NOT IMPLEMENTED

There is no authentication in this project. All pages are public, no login required.

- No Supabase Auth configured
- No login / register pages
- No session management
- No protected routes

## If auth is added in the future

Suggested flow with Supabase Auth:
```
/ → user not logged in → can still browse and do quizzes (anonymous)
/login → Supabase email+password or magic link
/register → create account
After login → quiz results saved with user_id
Progress tracking → user_progress table
```

Do NOT add auth unless explicitly requested. The current no-auth model is intentional.
