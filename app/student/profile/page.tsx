export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getMyStats } from '../dashboard/actions'
import ProfileClient from './ProfileClient'
import { getTier, xpToNextTier } from '@/lib/xp'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const stats = await getMyStats(user.id)

  const { data: attempts } = await supabase.from('quiz_attempts')
    .select('*, quizzes(title)')
    .eq('student_id', user.id)
    .order('started_at', { ascending: false })
    .limit(20)

  // شارات الطالب
  const { data: badges } = await supabase
    .from('student_badges')
    .select('id, badge_id, granted_at, badge_definitions(name, emoji, color, description)')
    .eq('student_id', user.id)
    .order('granted_at', { ascending: false })

  const xp = stats?.computed_xp ?? 0
  const tier = getTier(xp)
  const toNext = xpToNextTier(xp)
  const tierMin = tier.min
  const tierMax = tier.max ?? tier.min + 5000
  const progress = Math.min(100, ((xp - tierMin) / (tierMax - tierMin)) * 100)

  const initials = stats?.full_name
    ? stats.full_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '؟'

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-black text-white">حسابي</h1>
      <div className="grid md:grid-cols-3 gap-5 mt-8">
        {/* البطاقة الجانبية */}
        <div className="md:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          {/* الصورة الشخصية */}
          <div className="flex justify-center mb-3">
            {stats?.avatar_url ? (
              <img
                src={stats.avatar_url}
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-2xl font-black text-black border-2 border-transparent">
                {initials}
              </div>
            )}
          </div>

          <div className="text-center font-bold text-lg">{stats?.full_name}</div>
          <div className="text-center text-zinc-400 text-sm">{user.email}</div>

          {/* Bio */}
          {stats?.bio && (
            <p className="text-center text-zinc-300 text-xs mt-2 leading-5">{stats.bio}</p>
          )}

          {/* الاهتمامات */}
          {stats?.interests && stats.interests.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {(stats.interests as string[]).map((tag: string) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* المستوى + XP */}
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <div className="flex justify-between">
              <span>المستوى</span>
              <span className={`font-bold ${tier.textClass}`}>{tier.emoji} {tier.name}</span>
            </div>
            <div className="flex justify-between">
              <span>النقاط (XP)</span>
              <b className="text-cyan-300">{xp.toLocaleString('ar-EG')}</b>
            </div>
            <div className="flex justify-between">
              <span>الاختبارات الناجحة</span>
              <b>{stats?.exams_passed}</b>
            </div>
            <div className="flex justify-between">
              <span>السلسلة اليومية</span>
              <b className="text-fuchsia-300">🔥 {stats?.active_daily_streak}</b>
            </div>
          </div>

          {/* شريط التقدم للمستوى التالي */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-zinc-500 mb-1">
              <span>التقدم نحو {toNext !== null ? 'المستوى التالي' : 'الذروة'}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            {toNext !== null && (
              <div className="text-[11px] text-zinc-500 mt-1">{toNext.toLocaleString('ar-EG')} XP للمستوى التالي</div>
            )}
          </div>

          {/* الشارات */}
          {badges && badges.length > 0 && (
            <div className="mt-5">
              <div className="text-xs text-zinc-400 font-bold mb-2">🏅 شاراتي</div>
              <div className="flex flex-wrap gap-2">
                {badges.map((b: any) => (
                  <div
                    key={b.id}
                    title={b.badge_definitions?.description ?? ''}
                    className="flex items-center gap-1 px-2 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold"
                    style={{ borderColor: b.badge_definitions?.color + '50' }}
                  >
                    <span>{b.badge_definitions?.emoji}</span>
                    <span style={{ color: b.badge_definitions?.color }}>{b.badge_definitions?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ProfileClient
            initialName={stats?.full_name || ''}
            initialBio={stats?.bio || ''}
            initialInterests={stats?.interests || []}
            initialAvatarUrl={stats?.avatar_url || null}
            userId={user.id}
          />
        </div>

        {/* سجل المحاولات */}
        <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
          <div className="font-bold text-cyan-300 mb-3">سجل المحاولات</div>
          <div className="space-y-2 max-h-[520px] overflow-auto pr-2">
            {(attempts ?? []).map((a: any) => (
              <div key={a.id} className="flex justify-between items-center bg-black/30 border border-zinc-900 rounded-xl px-4 py-3 text-sm">
                <div>
                  <div className="font-semibold">{a.quizzes?.title || 'اختبار'}</div>
                  <div className="text-xs text-zinc-500">{new Date(a.started_at).toLocaleString('ar-EG')}</div>
                </div>
                <div className="text-left">
                  <div className={`font-bold ${a.status === 'graded' ? 'text-emerald-300' : 'text-amber-300'}`}>{a.score_achieved} درجات</div>
                  <div className="text-[11px] text-zinc-500">
                    {a.status === 'graded' ? 'تم التصحيح ✅' : a.status === 'submitted' ? 'قيد التصحيح ⏳' : 'قيد التقدم 📝'}
                  </div>
                </div>
              </div>
            ))}
            {(!attempts || attempts.length === 0) && <div className="text-zinc-500">لا محاولات بعد</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
