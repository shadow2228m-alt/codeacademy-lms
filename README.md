# CodeAcademy LMS — Full Legendary Production Platform

**Ultra-Granular Phase 2 — Dynamic Quiz Engine • Gemini AI Grader • Competitive XP Leaderboard**

> Built to company-legendary standards. 100% complete. Ready to deploy. Zero missing pieces.

See full Arabic engineering integration document:
- `وثيقة_التكامل_الهندسية_CodeAcademy.md`
- `README_AR.md`
- `DEPLOY.md`

## Quick Start
```bash
pnpm install
cp .env.example .env
pnpm dev
```
Then run `supabase/schema.sql` + `supabase/seed_quizzes.sql`

Login:
- admin@codeacademy.test / Admin123!
- student@codeacademy.test / Student123!

## Routes
- `/` Landing
- `/auth/login` `/auth/register`
- `/admin/dashboard` `/admin/quizzes` `/admin/courses` `/admin/students`
- `/student/dashboard` `/student/quizzes` `/student/lessons` `/student/profile`

## Core Server Actions
- `createQuizTransaction`
- `upsertStudentAnswer` (500ms debounce)
- `submitAndGradeQuiz` (Gemini AI)
- `getLeaderboard` XP = E×100+ΣS+C×50

Production-ready — Next.js 16 • Supabase RLS • TypeScript strict • Tailwind RTL Neon
