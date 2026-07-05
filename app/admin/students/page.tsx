export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'

export default async function AdminStudentsPage(){
  const supabase = await createClient()
  const { data: students } = await supabase.from('student_profiles')
    .select('*')
    .order('total_xp', { ascending: false })

  const { data: attempts } = await supabase.from('quiz_attempts')
    .select('student_id, score_achieved, status')
    .eq('status','graded')

  const attemptCount = new Map()
  ;(attempts ?? []).forEach(a=>{
    attemptCount.set(a.student_id, (attemptCount.get(a.student_id)||0)+1)
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-emerald-300">إدارة الطلاب</h1>
      <div className="mt-6 rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="text-right p-3">#</th>
              <th className="text-right p-3">الاسم</th>
              <th className="text-right p-3">XP</th>
              <th className="text-right p-3">Passed</th>
              <th className="text-right p-3">Scores Σ</th>
              <th className="text-right p-3">Streak</th>
              <th className="text-right p-3">محاولات</th>
              <th className="text-right p-3">آخر تسليم</th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((s:any,i:number)=>(
              <tr key={s.user_id} className="border-t border-zinc-900 hover:bg-zinc-950/60">
                <td className="p-3">{i+1}</td>
                <td className="p-3 font-bold">{s.full_name}</td>
                <td className="p-3 text-cyan-300 font-mono">{s.total_xp}</td>
                <td className="p-3">{s.exams_passed}</td>
                <td className="p-3">{s.accumulated_quiz_scores}</td>
                <td className="p-3">🔥 {s.active_daily_streak}</td>
                <td className="p-3">{attemptCount.get(s.user_id)||0}</td>
                <td className="p-3 text-zinc-400 text-xs">{s.last_submission_date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
