# CodeAcademy LMS — منصة متكاملة فاخرة جاهزة للإنتاج

**Next.js 16 • Supabase • Gemini AI • Tailwind RTL Neon**

> تنفيذ أمر صارم: منصة كاملة، شغل شركات أسطوري، لا شيء ناقص، جاهزة للرفع الآن.

---

## ما الذي تم تسليمه؟

### الواجهات (13 Route Production)
- `/` — Landing أسطوري
- `/auth/login` + `/auth/register` + `/auth/callback` + `/auth/signout`
- `/admin/dashboard` — Mission Control KPIs
- `/admin/quizzes` — Quiz Composer Bento-grid
- `/admin/courses` — Course & Lesson Manager
- `/admin/students` — Students XP Table
- `/student/dashboard` — Leaderboard Neon Competitive
- `/student/quizzes` — Exam Arena Console
- `/student/lessons` — Immersive Split-Screen Sandbox
- `/student/profile` — حسابي + سجل المحاولات

### المحرك الأساسي
- **createQuizTransaction** — atomic Server Action، RLS admin only
- **upsertStudentAnswer** — 500ms debounce + localStorage fallback
- **submitAndGradeQuiz** — Gemini AI 1.5-flash، JSON-only strict Arabic critique
- **XP Engine:** `XP = (E_passed×100) + Σ(S_achieved) + (C_streak×50)`
- **Streak:** Δt≤24h preserve • 24-48h +1 • >48h =0
- **Timer Anti-Tamper:** server `started_at + duration_minutes`

### قاعدة البيانات
`supabase/schema.sql` كامل:
- quizzes, questions (MC + essay_code + evaluation_meta)
- quiz_attempts, student_answers
- student_profiles (XP, streak)
- courses, lessons, lesson_progress
- RLS كامل + trigger `handle_new_user()` auto profile
- Function `update_student_xp_and_streak()`

Seed جاهز: `supabase/seed_quizzes.sql`
- اختبار بايثون المتقدم #1 — 3 MC + 3 Essay
- كورسين + 3 دروس

### المكونات الفاخرة
- `QuizBuilder.tsx` — Bento-grid
- `ExamArena.tsx` — countdown crimson <5min
- `CodeSandbox.tsx` — IDE line numbers + terminal
- `LeaderboardNeon.tsx` — RTL glow
- `NavBar.tsx` — admin/student switch

---

## تشغيل محلي (دقيقتين)

```bash
git clone <repo>
cd codeacademy-lms
pnpm install
cp .env.example .env
# ضع مفاتيح Supabase + GEMINI_API_KEY
pnpm dev
# http://localhost:3000
```

Supabase SQL:
1. شغّل `supabase/schema.sql`
2. شغّل `supabase/seed_quizzes.sql`
3. أنشئ مستخدمين:
   - admin@codeacademy.test / Admin123!  role: admin
   - student@codeacademy.test / Student123! role: student

---

## Deploy Production
Vercel 1-Click — انظر `DEPLOY.md`

Env:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Checklist تسليم شركات أسطوري ✅
- [x] Auth كامل Supabase SSR + middleware
- [x] RLS على كل الجداول
- [x] Admin Guard + Student Guard
- [x] Quiz Builder ديناميكي لانهائي
- [x] Gemini AI grader JSON strict عربي
- [x] Exam Arena 500ms + localStorage + crimson timer
- [x] Leaderboard XP + Streak Δt دقيق
- [x] Courses & Lessons CRUD Admin
- [x] Lesson Viewer Split-Screen Sandbox
- [x] Profile + Attempts History
- [x] Landing Page تسويقية فاخرة
- [x] Tailwind RTL Neon + Cairo/Tajawal fonts
- [x] TypeScript strict 100%
- [x] force-dynamic exports
- [x] Seed data production
- [x] DEPLOY.md + README كامل عربي/إنجليزي
- [x] .env.example
- [x] next.config + tsconfig production

**الحالة: جاهزة للرفع — لا شيء ناقص ✅**

CodeAcademy Core Team — 2026-07-04 — Cairo
