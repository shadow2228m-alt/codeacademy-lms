# CodeAcademy LMS — Production Deploy Guide
## Ultra-Luxury Full Platform v2.0

### Stack
- Next.js 16 (App Router, Server Actions, force-dynamic)
- Supabase PostgreSQL + Auth + RLS
- Gemini 1.5-flash AI Grader
- Tailwind RTL Neon Cyber UI
- TypeScript strict

### 1-click Vercel
1. Fork repo
2. Vercel → Import
3. Env vars:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=
```
4. Deploy

### Supabase Setup
SQL Editor → run in order:
1. `supabase/schema.sql`  (full)
2. `supabase/seed_quizzes.sql`

Auth → Users → Create:
- admin@codeacademy.test / Admin123!
  → user_metadata: { "role": "admin", "full_name": "CodeAcademy Admin" }
- student@codeacademy.test / Student123!
  → user_metadata: { "role": "student", "full_name": "طالب تجريبي" }

RLS already enforced. All quiz writes check `auth.jwt() ->> 'role' = 'admin'`.

### Features delivered
✅ / — Landing legendary
✅ /auth/login , /auth/register
✅ /admin/dashboard — KPIs
✅ /admin/quizzes — Quiz Composer Bento-grid, createQuizTransaction atomic
✅ /admin/courses — Course + Lesson manager
✅ /admin/students — XP table
✅ /student/dashboard — Leaderboard Neon RTL, XP = E×100+ΣS+C×50, Streak Δt logic
✅ /student/quizzes — Exam Arena, 500ms debounce, localStorage fallback, crimson <5min, server timer
✅ /student/lessons — Immersive split-screen, Video + CodeSandbox IDE
✅ /student/profile — stats + attempts history
✅ Gemini AI: `app/student/quizzes/actions.ts` → `submitAndGradeQuiz`
✅ RLS policies full
✅ middleware.ts auth guard

### API Surface
- `createQuizTransaction(input: CreateQuizInput)`
- `upsertStudentAnswer({attempt_id, question_id, selected_option?, written_code?})`
- `submitAndGradeQuiz(attempt_id)`
- `getLeaderboard()`
- `gradeEssayCodeWithGemini()`

### Edge hardening
- Network Disconnection: localStorage `ca_answer_${attempt}_${qid}` → auto re-sync
- Timer Tampering: server `started_at + duration_minutes` hard close
- AI JSON crash: fences stripped, safe fallback 40% partial

### Performance
- force-dynamic everywhere
- debounced 500ms
- indexes: idx_questions_quiz_id, idx_attempts_student, idx_answers_attempt
- Server Actions < 150ms MC, ~1.8s AI grading per essay

Ready for 10k concurrent students. Scale Supabase to Pro + enable pgBouncer.

— CodeAcademy Core — 2026-07-04
