-- CodeAcademy Seed — اختبار بايثون فاخر
INSERT INTO public.quizzes (id, title, duration_minutes, total_score, course_id) VALUES
('11111111-1111-1111-1111-111111111111', 'اختبار بايثون المتقدم #1', 30, 100, '00000000-0000-0000-0000-000000000101')
ON CONFLICT (id) DO NOTHING;

-- أسئلة MC
INSERT INTO public.questions (quiz_id, q_type, question_text, options, correct_option, max_points, order_index) VALUES
('11111111-1111-1111-1111-111111111111', 'multiple_choice', 'أي مما يلي يطبع الأرقام الزوجية من 0 إلى 9 في Python؟',
  '{"A":"for i in range(10): if i%2: print(i)", "B":"for i in range(0,10,2): print(i)", "C":"while i<10: print(i*2)", "D":"print([x for x in range(10)])"}'::jsonb,
  'B', 10, 0),
('11111111-1111-1111-1111-111111111111', 'multiple_choice', 'ناتج: len({"a":1, "b":2, "a":3}) ؟',
  '{"A":"2", "B":"3", "C":"1", "D":"Error"}'::jsonb,
  'A', 10, 1),
('11111111-1111-1111-1111-111111111111', 'multiple_choice', 'أي دالة تعكس String؟',
  '{"A":"reverse()", "B":"s[::-1]", "C":"invert(s)", "D":"flip()"}'::jsonb,
  'B', 10, 2)
ON CONFLICT DO NOTHING;

-- أسئلة Essay Code
INSERT INTO public.questions (quiz_id, q_type, question_text, max_points, order_index, evaluation_meta) VALUES
('11111111-1111-1111-1111-111111111111', 'essay_code',
'اكتب دالة solve(n) تطبع أرقام فيبوناتشي حتى n باستخدام for loop. يجب استخدام for.',
20, 3, '{"require_for_loop": true, "require_function_name": "solve", "max_chars": 2000}'::jsonb),
('11111111-1111-1111-1111-111111111111', 'essay_code',
'اكتب دالة is_prime(x) ترجع True لو العدد أولي. استخدم for loop وتحسين حتى sqrt.',
25, 4, '{"require_for_loop": true, "require_function_name": "is_prime", "max_chars": 2500}'::jsonb),
('11111111-1111-1111-1111-111111111111', 'essay_code',
'نفذ solve_list(nums) ترجع مجموع الأعداد الزوجية فقط.',
25, 5, '{"require_for_loop": false, "require_function_name": "solve_list", "max_chars": 2000}'::jsonb)
ON CONFLICT DO NOTHING;

-- مستخدمين تجريبيين (يُنشئهم Supabase Auth يدوياً)
-- admin@codeacademy.test / Admin123!  role=admin
-- student@codeacademy.test / Student123! role=student
-- ثم:
-- INSERT INTO public.student_profiles (user_id, full_name, total_xp, exams_passed, accumulated_quiz_scores, active_daily_streak)
-- VALUES ('<student-uuid>', 'عمر الطالب الأسطوري', 1250, 8, 340, 5);
