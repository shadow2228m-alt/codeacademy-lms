# وثيقة التكامل الهندسية الفاخرة الشاملة — CodeAcademy LMS
## مخطط الإنتاج النهائي — Phase 2

**تاريخ التسليم:** 4 يوليو 2026 — القاهرة  
**المعمار:** Principal Full-Stack Next.js 16 & Database Architect  
**الحالة:** ✅ مُنفذ 100% بدون اختزال

---

## ١) مقدمة هندسية
تم تنفيذ البنية التحتية **Ultra-Granular** لمنصة CodeAcademy التعليمية الفاخرة، مع:
- علاقات جداولية كاملة Supabase RLS
- Server Actions حامية
- واجهات RTL Neon Cyber تفاعلية
- مصحح Gemini AI مضبوط JSON-only

---

## ٢) قاعدة البيانات — Supabase PostgreSQL

الملف: `supabase/schema.sql` — مُنفذ كامل

- `public.quizzes`
- `public.questions` مع `question_type ENUM ('multiple_choice','essay_code')` + `evaluation_meta JSONB`
- `public.quiz_attempts` مع `attempt_status ENUM`
- `public.student_answers`
- `public.student_profiles` للـ XP & Streak
- RLS صارم:
  - Admins all operations WHERE `auth.jwt() ->> 'role' = 'admin'`
  - Students view quizzes SELECT true
  - Students insert attempts WITH CHECK `auth.uid() = student_id`
- Function `update_student_xp_and_streak(p_user_id, p_score, p_total)` — تحسب Streak بدقة Δt

---

## ٣) SPECIFICATION 1 — Dynamic Quiz Builder

**المسار:** `app/admin/quizzes/page.tsx` + `app/admin/quizzes/actions.ts`

- Bento-grid control panel: Quiz Title, Duration Timer, Total Maximum Points
- Dynamic Action Matrix Array لانهائي
- toggle `multiple_choice` / `essay_code`
- MC: 4 inputs A,B,C,D + dropdown `correct_option`
- Essay: evaluation criteria box {max_chars, require_for_loop, require_function_name}
- Server Action:
  ```ts
  createQuizTransaction(input: CreateQuizInput)
  ```
  pipeline ذري: insert quizzes → map questions → foreign keys دقيقة → revalidatePath
- Role validation: `auth.jwt() ->> 'role' = 'admin'`

---

## ٤) SPECIFICATION 2 — Gemini AI Evaluation Engine

**المسار:** `app/student/quizzes/actions.ts` → `submitAndGradeQuiz`

- Deterministic Pass: MC مقارنة `selected_option === correct_option`
- AI-Powered Pass: `process.env.GEMINI_API_KEY` → `gemini-1.5-flash`
- System Prompt صارم:
```
You are the CodeAcademy Core AI Grading Engine...
Output EXACTLY ONE VALID JSON OBJECT. No ```json```
{"score_awarded":8,"is_correct":true,"arabic_critique":"..."}
```
- stripping markdown fences server-side
- accumulate scores → `status: 'graded'`

---

## ٥) SPECIFICATION 3 — Leaderboard & XP

**المسار:** `app/student/dashboard/page.tsx` + `actions.ts`

معادلة:
```
XP = (E_passed ×100) + Σ(S_achieved) + (C_streak ×50)
```

Daily Streak Engine:
- Δt ≤ 24h نفس اليوم → preserve
- 24h < Δt ≤ 48h → C_streak +1
- Δt > 48h → C_streak = 0

عرض: glowing neon RTL grid — rank, full_name, computed_xp, streak 🔥

---

## ٦) SPECIFICATION 4 — Immersive Arena + Sandbox

**Lesson Viewer:** `app/student/lessons/page.tsx`
- side-by-side split screen
- Right: video framework + downloads
- Left: CodeSandbox IDE simulation — line numbering, dynamic formatting, terminal output block

**Exam Console:** `app/student/quizzes/page.tsx`
- 500ms debouncing auto-saver → `upsertStudentAnswer`
- cursor flow غير منقطع
- countdown timer: <5min → border cyber-cyan → flashing crimson
- localStorage fallback للـ Network Disconnection + Sync جماعي
- Server-side timer: `started_at + duration_minutes` — رفض تلقائي بعد الوقت

---

## ٧) الملفات المسلّمة

```
codeacademy-lms/
├── supabase/schema.sql
├── lib/
│   ├── types.ts                ← كامل العقود TypeScript
│   ├── gemini.ts               ← Core AI Grading Engine
│   └── supabase/
│       ├── server.ts           ← requireAdmin / requireStudent
│       └── client.ts
├── app/
│   ├── admin/quizzes/
│   │   ├── page.tsx
│   │   └── actions.ts          ← createQuizTransaction
│   └── student/
│       ├── quizzes/
│       │   ├── page.tsx        ← Exam Arena
│       │   └── actions.ts      ← submitAndGradeQuiz
│       ├── dashboard/
│       │   ├── page.tsx
│       │   └── actions.ts
│       └── lessons/
│           ├── page.tsx
│           └── SandboxClient.tsx
└── components/
    ├── QuizBuilder.tsx
    ├── ExamArena.tsx
    ├── CodeSandbox.tsx
    └── LeaderboardNeon.tsx
```

كل الملفات: TypeScript صريح، `export const dynamic = 'force-dynamic'`، RTL كامل.

---

## ٨) Edge Cases المنفذة

1. **انقطاع الشبكة:** localStorage parallel save لكل إجابة `ca_answer_${attemptId}_${questionId}` → re-hydrate + sync تلقائي
2. **Timer Tampering:** لا اعتماد على client. السيرفر يحسب `started_at + duration_minutes`، أي POST متأخر → auto-close attempt + رفض

---

## ٩) تشغيل سريع

```bash
cp .env.example .env
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# GEMINI_API_KEY=
pnpm install
pnpm dev
```

ثم نفّذ `supabase/schema.sql` في SQL Editor.

---

**انتهت وثيقة التكامل — CodeAcademy LMS Phase 2 — مُعتمدة إنتاجياً ✅**
