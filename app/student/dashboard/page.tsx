export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getMyStats } from './actions'
import LeaderboardNeon from '@/components/LeaderboardNeon'
import AnimatedStatCard from '@/components/AnimatedStatCard'
import { XPInfoButton } from '@/components/XPExplainModal'

export const metadata = { title: 'CodeAcademy | Dashboard' }

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let board: Awaited<ReturnType<typeof import('./actions').getLeaderboard>> = []
  let my: Awaited<ReturnType<typeof getMyStats>> = null
  let loadError: string | null = null

  try {
    const { getLeaderboard } = await import('./actions')
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
      <header className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[34px] font-black tracking-tight text-white">
            لوحة التحكم <span className="text-cyan-400">التنافسية</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-sm font-mono">XP = (E×100) + Σ(S) + (C×50)</p>
        </div>
        {my && (
          <XPInfoButton
            currentXP={my.computed_xp}
            exams={my.exams_passed}
            scores={my.accumulated_quiz_scores}
            streak={my.active_daily_streak}
          />
        )}
      </header>

      {/* بطاقات الإحصاء المتحركة */}
      {my && (
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <AnimatedStatCard label="إجمالي XP" value={my.computed_xp} color="text-cyan-300" icon="⚡" delay={0} />
          <AnimatedStatCard label="اختبارات ناجحة" value={my.exams_passed} color="text-emerald-300" icon="✅" delay={0.1} />
          <AnimatedStatCard label="مجموع الدرجات" value={my.accumulated_quiz_scores} color="text-amber-300" icon="🎯" delay={0.2} />
          <AnimatedStatCard label="Streak يومي" value={my.active_daily_streak} color="text-fuchsia-300" icon="🔥" suffix=" يوم" delay={0.3} />
        </div>
      )}

      <LeaderboardNeon
        rows={board.map(b => ({
          rank: b.rank,
          full_name: b.full_name,
          computed_xp: b.computed_xp,
          active_daily_streak: b.active_daily_streak,
          avatar_url: b.avatar_url
        }))}
        myUserId={user?.id}
      />
    </div>
  )
}
