# CodeAcademy LMS — Production Deploy Guide
## Ultra-Luxury Full Platform v3.0

### Stack
- Next.js 16 (App Router, Server Actions, force-dynamic)
- Supabase PostgreSQL + Auth + RLS
- Gemini 2.5-flash AI Grader
- Tailwind RTL Neon Cyber UI
- TypeScript strict

### 1-click Vercel
1. Fork repo
2. Vercel → Import
3. Configure the following Environment Variables:
```ini
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # CRITICAL: Used for admin auth user deletion/creation
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=your-vercel-app-url
```
4. Deploy

> ⚠️ **SECURITY WARNING:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client-side code. It must only reside in environment variables and only be called within `'use server'` files (like `lib/supabase/admin.ts`).

---

### Supabase Setup
SQL Editor → run in order:
1. `supabase/schema.sql` (full, includes RLS and triggers)
2. `supabase/seed_quizzes.sql`

> ⚠️ **إعادة تشغيل قاعدة البيانات (CRITICAL RE-RUN):**
> إذا كان المشروع منشوراً بالفعل على Supabase، فإنه **يجب ويتحتم** إعادة تشغيل ملف `supabase/schema.sql` بالكامل لتطبيق التعديلات الأخيرة، وبخاصة جدول الرسائل الإدارية الجديد `admin_messages` وسياسات الحماية ومؤشرات السرعة التابعة له. تشغيل الملف مرة أخرى آمن تماماً ولن يقوم بتكرار أو إفساد البيانات الموجودة.

---

### Auth & Gatekeeping
1. **Secret Admin Login URL:**
   - The admin dashboard is protected and cannot be reached by guessing or standard navigation redirects.
   - The exact admin login route is: `/mgmt-9f3c`
   - *Security note:* Keep this URL private and share it only with authorised administrators. Although documented here for reference, do not publish it in public sitemaps or public documentation. (A `robots.txt` has been added to block crawlers from indexing this route).
2. **Standard Auth (Students):**
   - Students register at `/auth/register` and login at the public `/auth/login` portal.
   - Unauthorized attempts to access `/admin/*` routes are transparently redirected back to `/student/dashboard` (if logged in) or `/auth/login` (if logged out) to prevent leaking the secret path.

---

### Features Delivered
- **Landing Page (`/`):** Full 3D animated hero section using Framer Motion (with `prefers-reduced-motion` compliance), RTL support, and zero administrator links.
- **Student Dashboard (`/student/dashboard`):** Neon leaderboard with XP ranks (Bronze, Silver, Gold, Platinum, Diamond) and streak trackers.
- **Exam Arena (`/student/quizzes`):** Auto-saving quiz client, Gemini AI grader, and XP rank-up toast indicators.
- **Admin Control (`/admin/students`):** Complete student management portal to add students, delete accounts via Supabase Auth Admin client, and broadcast persistent messaging.
- **Lessons (`/student/lessons`):** Sandbox environment with video content side-by-side.

— CodeAcademy Core Team — 2026-07-05
