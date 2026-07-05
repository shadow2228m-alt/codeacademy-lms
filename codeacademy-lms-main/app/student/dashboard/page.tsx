export const dynamic = 'force-dynamic'
import { getLeaderboard, getMyStats } from './actions'
import LeaderboardNeon from '@/components/LeaderboardNeon'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'CodeAcademy | Dashboard' }

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let board: Awaited<ReturnType<typeof getLeaderboard>> = []
  let my: Awaited<ReturnType<typeof getMyStats>> = null
  let loadError: string | null = null

  try {
    const [b, m] = await Promise.all([
      getLeaderboard(30),
      user ? getMyStats(user.id) : Promise.resolve(null)
    ])
    board = b
    my = m
  } catch (e: any) {
    loadError = e?.message || 'تعذر تحميل بيانات لوحة التحكم حالياً.'
  }

  if (loadError) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-[34px] font-black tracking-tight text-white">
            لوحة التحكم <span className="text-cyan-400">التنافسية</span>
          </h1>
        </header>
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-red-300">
          <div className="font-bold mb-1">تعذر تحميل البيانات</div>
          <div className="text-sm text-red-400/90">{loadError}</div>
          <div className="text-xs text-zinc-500 mt-3">حاول تحديث الصفحة، أو تواصل مع الدعم إذا استمرت المشكلة.</div>
        </div>
      </div>
    )
  }

  return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-[34px] font-black tracking-tight text-white">
            لوحة التحكم <span className="text-cyan-400">التنافسية</span>
          </h1>
          <p className="text-zinc-400 mt-2">XP = (E_passed ×100) + Σ(S_achieved) + (C_streak ×50)</p>
        </header>

        {my && (
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {[
              {label:'إجمالي XP', v: my.computed_xp, color:'text-cyan-300'},
              {label:'اختبارات ناجحة', v: my.exams_passed, color:'text-emerald-300'},
              {label:'مجموع الدرجات', v: my.accumulated_quiz_scores, color:'text-amber-300'},
              {label:'Streak يومي', v: `${my.active_daily_streak} 🔥`, color:'text-fuchsia-300'},
            ].map(c=>(
              <div key={c.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                <div className="text-zinc-400 text-sm">{c.label}</div>
                <div className={`text-3xl font-black mt-2 ${c.color}`}>{c.v}</div>
              </div>
            ))}
          </div>
        )}

        <LeaderboardNeon rows={board.map(b=>({
          rank: b.rank,
          full_name: b.full_name,
          computed_xp: b.computed_xp,
          active_daily_streak: b.active_daily_streak,
          avatar_url: b.avatar_url
        }))} />

        <div className="mt-12 rounded-2xl border border-zinc-800 p-5 text-sm text-zinc-400 leading-7">
          <strong className="text-zinc-200">خوارزمية Daily Streak:</strong><br/>
          • Δt ≤ 24h (نفس اليوم): الحفاظ على الـStreak بدون زيادة<br/>
          • 24h &lt; Δt ≤ 48h: C_streak = C_streak + 1<br/>
          • Δt &gt; 48h: C_streak = 0 — كسر السلسلة<br/>
          — يتم احتساب نهاية الوقت Server-side عبر started_at + duration_minutes لمنع Timer Tampering.
        </div>
      </div>
  )
}
