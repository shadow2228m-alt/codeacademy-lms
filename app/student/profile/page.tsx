export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getMyStats } from '../dashboard/actions'
import ProfileClient from './ProfileClient'

export default async function ProfilePage(){
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const stats = await getMyStats(user.id)

  const { data: attempts } = await supabase.from('quiz_attempts')
    .select('*, quizzes(title)')
    .eq('student_id', user.id)
    .order('started_at', { ascending:false })
    .limit(20)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-white">حسابي</h1>
      <div className="grid md:grid-cols-3 gap-5 mt-8">
        <div className="md:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 mx-auto mb-3"></div>
          <div className="text-center font-bold text-lg">{stats?.full_name}</div>
          <div className="text-center text-zinc-400 text-sm">{user.email}</div>
          <div className="mt-4 text-sm space-y-2 text-zinc-300">
            <div className="flex justify-between"><span>XP</span><b className="text-cyan-300">{stats?.computed_xp}</b></div>
            <div className="flex justify-between"><span>Passed</span><b>{stats?.exams_passed}</b></div>
            <div className="flex justify-between"><span>Streak</span><b className="text-fuchsia-300">🔥 {stats?.active_daily_streak}</b></div>
          </div>
          <ProfileClient initialName={stats?.full_name || ''} userId={user.id} />
        </div>
        <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
          <div className="font-bold text-cyan-300 mb-3">سجل المحاولات</div>
          <div className="space-y-2 max-h-[520px] overflow-auto pr-2">
            {(attempts ?? []).map((a:any)=>(
              <div key={a.id} className="flex justify-between items-center bg-black/30 border border-zinc-900 rounded-xl px-4 py-3 text-sm">
                <div>
                  <div className="font-semibold">{a.quizzes?.title || 'Quiz'}</div>
                  <div className="text-xs text-zinc-500">{new Date(a.started_at).toLocaleString('ar-EG')}</div>
                </div>
                <div className="text-left">
                  <div className={`font-bold ${a.status==='graded'?'text-emerald-300':'text-amber-300'}`}>{a.score_achieved} pts</div>
                  <div className="text-[11px] text-zinc-500">{a.status}</div>
                </div>
              </div>
            ))}
            {(!attempts || attempts.length===0) && <div className="text-zinc-500">لا محاولات بعد</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
