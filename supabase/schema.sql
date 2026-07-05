-- CodeAcademy LMS - Ultra-Granular Integration Schema
-- Supabase PostgreSQL - Phase 2
-- تاريخ التنفيذ: 2026-07-04

-- ١) جدول الامتحانات الرئيسي
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    total_score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ٢) جدول الأسئلة المتفرعة
DO $$ BEGIN
    CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'essay_code');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    q_type public.question_type NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB DEFAULT NULL,
    correct_option TEXT DEFAULT NULL,
    max_points INTEGER NOT NULL DEFAULT 10,
    order_index INTEGER NOT NULL DEFAULT 0,
    evaluation_meta JSONB DEFAULT NULL -- for essay_code: {max_chars, require_for_loop, require_function_name}
);

-- ٣) جدول محاولات الطلاب للامتحان
DO $$ BEGIN
    CREATE TYPE public.attempt_status AS ENUM ('in_progress', 'submitted', 'graded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status public.attempt_status DEFAULT 'in_progress',
    score_achieved INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ DEFAULT NULL,
    ai_feedback TEXT DEFAULT NULL
);

-- ٤) جدول إجابات الطلاب التفصيلية
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    selected_option TEXT DEFAULT NULL,
    written_code TEXT DEFAULT NULL,
    is_correct BOOLEAN DEFAULT NULL,
    score_awarded INTEGER DEFAULT 0,
    UNIQUE(attempt_id, question_id)
);

-- ٥) جدول بروفايل الطلاب الممتد للـ XP & Streak
CREATE TABLE IF NOT EXISTS public.student_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    total_xp INTEGER DEFAULT 0,
    exams_passed INTEGER DEFAULT 0,
    accumulated_quiz_scores INTEGER DEFAULT 0,
    active_daily_streak INTEGER DEFAULT 0,
    last_submission_date DATE DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ٥) تفعيل الأمن الصارم RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
DROP POLICY IF EXISTS "Admins all operations quizzes" ON public.quizzes;
CREATE POLICY "Admins all operations quizzes" ON public.quizzes FOR ALL USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Students view quizzes" ON public.quizzes;
CREATE POLICY "Students view quizzes" ON public.quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins all operations questions" ON public.questions;
CREATE POLICY "Admins all operations questions" ON public.questions FOR ALL USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Students view questions" ON public.questions;
CREATE POLICY "Students view questions" ON public.questions FOR SELECT USING (true);

-- SECURITY: RLS filters rows, not columns. Without the REVOKE below, any
-- authenticated student could call supabase.from('questions').select('*')
-- directly from the browser console and read correct_option for every
-- multiple-choice question before answering.
--
-- Grading (submitAndGradeQuiz) can no longer read correct_option via a plain
-- authenticated-role select once this column is revoked, so it goes through
-- the SECURITY DEFINER RPC below instead, which bypasses the REVOKE. That RPC
-- only returns rows once the calling student's own attempt for that quiz is
-- no longer in_progress (submitted or graded) — otherwise a student could
-- call the RPC directly mid-exam and defeat the whole protection.
CREATE OR REPLACE FUNCTION public.get_correct_options_for_grading(p_quiz_id UUID)
RETURNS TABLE(id UUID, correct_option TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE quiz_id = p_quiz_id
      AND student_id = auth.uid()
      AND status IN ('submitted', 'graded')
  ) THEN
    RAISE EXCEPTION 'Not authorized: no submitted attempt found for this quiz';
  END IF;

  RETURN QUERY SELECT q.id, q.correct_option FROM public.questions q WHERE q.quiz_id = p_quiz_id;
END;
$$;

REVOKE SELECT (correct_option) ON public.questions FROM anon, authenticated;

DROP POLICY IF EXISTS "Students insert attempts" ON public.quiz_attempts;
CREATE POLICY "Students insert attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Users view own attempts" ON public.quiz_attempts;
CREATE POLICY "Users view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = student_id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Users update own attempts" ON public.quiz_attempts;
CREATE POLICY "Users update own attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = student_id OR auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Students update own answers" ON public.student_answers;
CREATE POLICY "Students update own answers" ON public.student_answers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND student_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND student_id = auth.uid())
);

-- SECURITY: the policy above allows a student to INSERT/UPDATE their own
-- student_answers rows for auto-save, which is required (upsertStudentAnswer
-- writes selected_option/written_code from the browser). But RLS has no
-- column granularity, so without this trigger a student could also call
-- supabase.from('student_answers').update({ is_correct: true, score_awarded: 999 })
-- directly and self-grade. Only submitAndGradeQuiz (server-side, after
-- setting the bypass flag) may set is_correct/score_awarded.
CREATE OR REPLACE FUNCTION public.protect_student_answer_grading()
RETURNS TRIGGER AS $$
BEGIN
  IF (auth.jwt() ->> 'role') = 'admin'
     OR current_setting('app.bypass_profile_stats_guard', true) = 'on' THEN
    RETURN NEW;
  END IF;
  NEW.is_correct := OLD.is_correct;
  NEW.score_awarded := OLD.score_awarded;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_student_answer_grading ON public.student_answers;
CREATE TRIGGER trg_protect_student_answer_grading
  BEFORE UPDATE ON public.student_answers
  FOR EACH ROW EXECUTE FUNCTION public.protect_student_answer_grading();

-- Used by submitAndGradeQuiz to actually write is_correct/score_awarded.
-- Runs as SECURITY DEFINER and sets the same bypass flag the trigger checks,
-- but only after confirming the caller owns the attempt this answer belongs
-- to — otherwise a student could grade someone else's answers too.
CREATE OR REPLACE FUNCTION public.grade_student_answer(
  p_attempt_id UUID, p_question_id UUID, p_is_correct BOOLEAN, p_score_awarded INTEGER
) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.quiz_attempts WHERE id = p_attempt_id AND student_id = auth.uid()
  ) AND (auth.jwt() ->> 'role') <> 'admin' THEN
    RAISE EXCEPTION 'Not authorized to grade this attempt';
  END IF;

  PERFORM set_config('app.bypass_profile_stats_guard', 'on', true);
  UPDATE public.student_answers
    SET is_correct = p_is_correct, score_awarded = p_score_awarded
    WHERE attempt_id = p_attempt_id AND question_id = p_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "profiles_select_all" ON public.student_profiles;
CREATE POLICY "profiles_select_all" ON public.student_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.student_profiles;
CREATE POLICY "profiles_update_own" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);

-- SECURITY: prevent students from editing their own XP/streak/scores via direct client update.
-- Only full_name / avatar_url may be changed by the owner; admins (service role / server actions
-- using elevated context) bypass this via SECURITY DEFINER functions like update_student_xp_and_streak.
CREATE OR REPLACE FUNCTION public.protect_student_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow trusted server-side paths (admin JWT, or an internal SECURITY DEFINER
  -- function like update_student_xp_and_streak setting this session flag) through.
  IF (auth.jwt() ->> 'role') = 'admin'
     OR current_setting('app.bypass_profile_stats_guard', true) = 'on' THEN
    RETURN NEW;
  END IF;
  NEW.total_xp := OLD.total_xp;
  NEW.exams_passed := OLD.exams_passed;
  NEW.accumulated_quiz_scores := OLD.accumulated_quiz_scores;
  NEW.active_daily_streak := OLD.active_daily_streak;
  NEW.last_submission_date := OLD.last_submission_date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_student_profile_stats ON public.student_profiles;
CREATE TRIGGER trg_protect_student_profile_stats
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_student_profile_stats();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.student_answers(attempt_id);

-- Function: update streak & XP atomically
CREATE OR REPLACE FUNCTION public.update_student_xp_and_streak(
  p_user_id UUID,
  p_score INTEGER,
  p_total INTEGER
) RETURNS TABLE(new_streak INTEGER, new_xp INTEGER) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile public.student_profiles%ROWTYPE;
  v_today DATE := CURRENT_DATE;
  v_last DATE;
  v_delta INTEGER;
  v_streak INTEGER;
  v_passed BOOLEAN := p_score >= (p_total * 0.5);
BEGIN
  SELECT * INTO v_profile FROM public.student_profiles WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.student_profiles(user_id, full_name) VALUES (p_user_id, 'طالب جديد') RETURNING * INTO v_profile;
  END IF;

  v_last := v_profile.last_submission_date;
  IF v_last IS NULL THEN
    v_streak := 1;
  ELSIF v_today = v_last THEN
    v_streak := v_profile.active_daily_streak; -- نفس اليوم: لا زيادة
  ELSIF v_today - v_last = 1 THEN
    v_streak := v_profile.active_daily_streak + 1; -- 24-48h
  ELSIF v_today - v_last > 1 THEN
    v_streak := 0; -- >48h كسر
  ELSE
    v_streak := v_profile.active_daily_streak;
  END IF;

  -- لو أول محاولة اليوم وناجحة streak ما كان صفر
  IF v_last IS DISTINCT FROM v_today AND v_streak = 0 AND v_last IS NOT NULL THEN
    v_streak := 0;
  ELSIF v_last IS DISTINCT FROM v_today AND v_streak != 0 AND v_today - COALESCE(v_last, v_today-1) <= 1 THEN
    -- keep increment already handled
    NULL;
  ELSIF v_last IS NULL THEN
    v_streak := 1;
  END IF;

  -- تصحيح منطق Streak الدقيق:
  -- Δt <= 24h (نفس اليوم): preserve
  -- 24 < Δt <= 48h: +1
  -- Δt > 48h: 0
  IF v_last = v_today THEN
    v_streak := GREATEST(v_profile.active_daily_streak,1);
  END IF;

  PERFORM set_config('app.bypass_profile_stats_guard', 'on', true);
  UPDATE public.student_profiles SET
    accumulated_quiz_scores = accumulated_quiz_scores + p_score,
    exams_passed = exams_passed + CASE WHEN v_passed THEN 1 ELSE 0 END,
    active_daily_streak = v_streak,
    last_submission_date = v_today,
    total_xp = (exams_passed + CASE WHEN v_passed THEN 1 ELSE 0 END) * 100 
             + (accumulated_quiz_scores + p_score) 
             + (v_streak * 50),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING active_daily_streak, total_xp INTO v_streak, new_xp;

  new_streak := v_streak;
  RETURN NEXT;
END;
$$;

-- ====== CodeAcademy LMS Full Platform Extension ======
-- Courses & Lessons

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  level TEXT DEFAULT 'beginner',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  content_md TEXT,
  order_index INTEGER DEFAULT 0,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "courses_admin_all" ON public.courses;
CREATE POLICY "courses_admin_all" ON public.courses FOR ALL USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS "lessons_select_all" ON public.lessons;
CREATE POLICY "lessons_select_all" ON public.lessons FOR SELECT USING (true);
DROP POLICY IF EXISTS "lessons_admin_all" ON public.lessons;
CREATE POLICY "lessons_admin_all" ON public.lessons FOR ALL USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Link quiz to lesson / course optional
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL;

-- student progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "progress_self" ON public.lesson_progress;
CREATE POLICY "progress_self" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- auto create student_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.student_profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed sample data
INSERT INTO public.courses (id, title, slug, description, level) VALUES
('00000000-0000-0000-0000-000000000101', 'Python الأساسيات الفاخرة', 'python-basics', 'انطلق من الصفر إلى بناء خوارزميات قوية مع CodeAcademy', 'beginner'),
('00000000-0000-0000-0000-000000000102', 'هياكل البيانات المتقدمة', 'data-structures', 'Lists, Dicts, OOP — احتراف حقيقي', 'intermediate')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.lessons (course_id, title, order_index, video_url, content_md) VALUES
('00000000-0000-0000-0000-000000000101', 'مقدمة المتغيرات والـ Loops', 0, 'https://player.codeacademy.test/intro', '# المتغيرات\nتعلم `for` و `while` باحتراف.'),
('00000000-0000-0000-0000-000000000101', 'الدوال والـ Functions', 1, 'https://player.codeacademy.test/fn', '# Functions\n`def solve():`'),
('00000000-0000-0000-0000-000000000102', 'OOP Deep Dive', 0, 'https://player.codeacademy.test/oop', '## Classes')
ON CONFLICT DO NOTHING;

-- ====== CodeAcademy LMS Phase 3 — Admin Messages ======
-- تاريخ التحديث: 2026-07-05
-- جدول رسائل الإدارة للطلاب (دائمة حتى يُغلقها الطالب)

CREATE TABLE IF NOT EXISTS public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'رسالة من الإدارة',
  message TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NULL, -- NULL = لم يُقرأ، TIMESTAMPTZ = تم الإغلاق
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- المشرف يملك كل الصلاحيات
DROP POLICY IF EXISTS "admin_messages_admin_all" ON public.admin_messages;
CREATE POLICY "admin_messages_admin_all" ON public.admin_messages
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- الطالب يقرأ رسائله الخاصة فقط
DROP POLICY IF EXISTS "admin_messages_student_select" ON public.admin_messages;
CREATE POLICY "admin_messages_student_select" ON public.admin_messages
  FOR SELECT
  USING (auth.uid() = student_id);

-- الطالب يُغلق رسائله الخاصة فقط (تحديث dismissed_at)
DROP POLICY IF EXISTS "admin_messages_student_dismiss" ON public.admin_messages;
CREATE POLICY "admin_messages_student_dismiss" ON public.admin_messages
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- فهرس لتسريع جلب الرسائل غير المُغلقة
CREATE INDEX IF NOT EXISTS idx_admin_messages_student_undismissed
  ON public.admin_messages(student_id)
  WHERE dismissed_at IS NULL;

-- ====== CodeAcademy LMS Phase 4 — Profile Customisation & Badge System ======
-- تاريخ التحديث: 2026-07-05

-- إضافة حقول السيرة الذاتية والاهتمامات لملفات الطلاب
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT ARRAY[]::TEXT[];

-- جدول تعريفات الشارات
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT NOT NULL DEFAULT '🏅',
  color TEXT NOT NULL DEFAULT '#00eaff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول شارات الطلاب (منحها من المشرف)
CREATE TABLE IF NOT EXISTS public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badge_definitions(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(student_id, badge_id)
);

ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان — badge_definitions
DROP POLICY IF EXISTS "badge_defs_select_all" ON public.badge_definitions;
CREATE POLICY "badge_defs_select_all" ON public.badge_definitions FOR SELECT USING (true);
DROP POLICY IF EXISTS "badge_defs_admin_all" ON public.badge_definitions;
CREATE POLICY "badge_defs_admin_all" ON public.badge_definitions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- سياسات الأمان — student_badges
DROP POLICY IF EXISTS "student_badges_select_all" ON public.student_badges;
CREATE POLICY "student_badges_select_all" ON public.student_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "student_badges_admin_all" ON public.student_badges;
CREATE POLICY "student_badges_admin_all" ON public.student_badges FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin') WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- بيانات أولية — تعريفات الشارات (6 شارات)
INSERT INTO public.badge_definitions (name, description, emoji, color) VALUES
  ('Python Pro',        'أتقن أساسيات Python بامتياز',          '🐍', '#3b82f6'),
  ('Quiz Master',       'اجتاز 10 اختبارات بنجاح',              '🧠', '#a855f7'),
  ('Streak King',       'حافظ على 7 أيام متتالية من الدراسة',   '🔥', '#f97316'),
  ('Fast Learner',      'أكمل 5 دروس في يوم واحد',             '⚡', '#eab308'),
  ('Perfect Score',     'حصل على 100% في اختبار',              '💯', '#22c55e'),
  ('Consistent Coder',  'استمر في الدراسة لأكثر من 30 يوم',    '👑', '#ec4899')
ON CONFLICT DO NOTHING;

-- فهرس لتسريع جلب شارات الطلاب
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON public.student_badges(student_id);
