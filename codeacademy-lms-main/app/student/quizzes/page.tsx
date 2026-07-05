export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import ExamArena from '@/components/ExamArena'
import { startQuizAttempt, getQuizWithQuestions, getMyAttempt } from './actions'
import Link from 'next/link'
import RetryGradingButton from './RetryGradingButton'

export default async function StudentQuizzesPage({ searchParams }:{ searchParams?: Promise<{ quiz?: string }>}) {
  const supabase = await createClient()
  const sp = await searchParams
  const quizId = sp?.quiz

  const { data: quizzes } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false })

  if (!quizId) {
    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-black text-cyan-300 neon-text">ساحة الامتحانات — Exam Console</h1>
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {(quizzes ?? []).map(q=>(
              <Link key={q.id} href={`/student/quizzes?quiz=${q.id}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 hover:border-cyan-500/50 transition neon-border">
                <div className="text-lg font-bold">{q.title}</div>
                <div className="text-sm text-zinc-400 mt-2">{q.duration_minutes} دقيقة • {q.total_score} نقطة</div>
              </Link>
            ))}
            {(!quizzes || quizzes.length===0) && <div className="text-zinc-500">لا توجد اختبارات متاحة حالياً.</div>}
          </div>
        </div>
    )
  }

  const { quiz, questions } = await getQuizWithQuestions(quizId)
  if (!quiz) return <div className="max-w-6xl mx-auto px-6 py-10 text-zinc-400">الاختبار غير موجود.</div>

  let attempt = await getMyAttempt(quizId)

  // لو المحاولة اتصححت بالفعل، اعرض النتيجة ولا تبدأ محاولة جديدة تلقائياً
  if (attempt && attempt.status === 'graded') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/student/quizzes" className="text-cyan-400 text-sm">← العودة للقائمة</Link>
        </div>
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="text-emerald-300 font-bold text-lg mb-2">لقد أتممت هذا الاختبار من قبل ✅</div>
          <div className="text-3xl font-black">{attempt.score_achieved} / {quiz.total_score}</div>
          {attempt.ai_feedback && (
            <pre className="mt-4 whitespace-pre-wrap text-sm text-zinc-300 leading-7" dir="rtl">{attempt.ai_feedback}</pre>
          )}
        </div>
      </div>
    )
  }

  // المحاولة اتسلمت لكن التصحيح لم يكتمل بعد (تصحيح جارٍ أو انقطع لسبب ما).
  // لا تبدأ محاولة جديدة فوقها أبداً — بدلاً من ذلك اعرض حالة انتظار واضحة.
  if (attempt && attempt.status === 'submitted') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/student/quizzes" className="text-cyan-400 text-sm">← العودة للقائمة</Link>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="text-amber-300 font-bold text-lg mb-2">جارٍ تصحيح إجاباتك…</div>
          <p className="text-sm text-zinc-400">تم تسليم محاولتك بنجاح. إذا استمر هذا الأمر لفترة طويلة، اضغط الزر أدناه لإعادة محاولة التصحيح.</p>
          <RetryGradingButton attemptId={attempt.id} />
        </div>
      </div>
    )
  }

  if (!attempt || attempt.status !== 'in_progress') {
    attempt = await startQuizAttempt(quizId)
  }

  return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/student/quizzes" className="text-cyan-400 text-sm">← العودة للقائمة</Link>
          <div className="text-xs text-zinc-400">Attempt: {attempt.id.slice(0,8)} • {attempt.status}</div>
        </div>
        <ExamArena quiz={quiz as any} questions={questions as any} attempt={attempt as any} />
      </div>
  )
}
