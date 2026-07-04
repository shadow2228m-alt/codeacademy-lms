export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import ExamArena from '@/components/ExamArena'
import { startQuizAttempt, getQuizWithQuestions, getMyAttempt } from './actions'
import Link from 'next/link'

export default async function StudentQuizzesPage({ searchParams }:{ searchParams?: { quiz?: string }}) {
  const supabase = createClient()
  const quizId = searchParams?.quiz

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
  if (!quiz) return <div>Quiz not found</div>
  let attempt = await getMyAttempt(quizId)
  if (!attempt || attempt.status !== 'in_progress') {
    // auto start if not active
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
