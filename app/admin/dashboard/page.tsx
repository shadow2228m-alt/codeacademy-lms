export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard(){
  const supabase = await createClient()
  const [{ count: quizzes }, { count: questions }, { count: attempts }, { data: top }] = await Promise.all([
    supabase.from('quizzes').select('*', { count:'exact', head:true }),
    supabase.from('questions').select('*', { count:'exact', head:true }),
    supabase.from('quiz_attempts').select('*', { count:'exact', head:true }),
    supabase.from('student_profiles').select('*').order('total_xp', { ascending:false }).limit(5)
  ])

  const kpis = [
    { label:'اختبارات', value: quizzes ?? 0, color:'text-cyan-300' },
    { label:'أسئلة', value: questions ?? 0, color:'text-fuchsia-300' },
    { label:'محاولات', value: attempts ?? 0, color:'text-emerald-300' },
    { label:'Active RLS', value:'ON', color:'text-amber-300' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black neon-text text-white">Admin Mission Control</h1>
      <p className="text-zinc-400 mt-2">CodeAcademy • Quiz Engine • Gemini AI Grader • Leaderboard</p>

      <div className="grid md:grid-cols-4 gap-4 mt-8">
        {kpis.map(k=>(
          <div key={k.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 neon-border">
            <div className="text-zinc-400 text-sm">{k.label}</div>
            <div className={`text-3xl font-black mt-2 ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="font-bold text-cyan-300 mb-3">روابط سريعة</div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Link href="/admin/quizzes" className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10">🧩 Quiz Composer</Link>
            <Link href="/admin/courses" className="p-4 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 hover:bg-fuchsia-500/10">📚 إدارة الكورسات</Link>
            <Link href="/student/quizzes" className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">🎯 اختبر كطالب</Link>
            <Link href="/student/dashboard" className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">🏆 Leaderboard</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="font-bold text-amber-300 mb-3">Top 5 XP</div>
          <ul className="space-y-2 text-sm">
            {(top ?? []).map((t:any,i:number)=>(
              <li key={t.user_id} className="flex justify-between">
                <span>#{i+1} {t.full_name}</span>
                <span className="text-cyan-300">{t.total_xp} XP</span>
              </li>
            ))}
            {(!top || top.length===0) && <li className="text-zinc-500">لا بيانات بعد</li>}
          </ul>
        </div>
      </div>

      <div className="mt-10 text-xs text-zinc-500 border-t border-zinc-900 pt-4">
        Server Actions: createQuizTransaction • submitAndGradeQuiz • upsertStudentAnswer 500ms • Gemini AI • RLS enforced
      </div>
    </div>
  )
}
