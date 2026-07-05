'use client'
import { motion } from 'framer-motion'
import { getTier, formatXP } from '@/lib/xp'

type Row = {
  rank: number
  full_name: string
  computed_xp: number
  active_daily_streak: number
  avatar_url?: string | null
}

const RANK_MEDALS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-amber-400', text: 'text-black', label: '🥇' },
  2: { bg: 'bg-zinc-300', text: 'text-black', label: '🥈' },
  3: { bg: 'bg-orange-400', text: 'text-black', label: '🥉' },
}

export default function LeaderboardNeon({ rows, myUserId }: { rows: Row[]; myUserId?: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-8 text-center text-zinc-500" dir="rtl">
        لا توجد بيانات بعد — كن أول المتنافسين!
      </div>
    )
  }

  return (
    <div
      className="rounded-[28px] border border-cyan-500/20 bg-gradient-to-b from-[#0a0f1d]/95 to-[#060912]/98 p-6 shadow-[0_0_60px_rgba(0,255,255,0.07)]"
      dir="rtl"
    >
      <h3
        className="text-2xl font-black text-center mb-8 text-cyan-100"
        style={{ textShadow: '0 0 20px rgba(0,255,255,0.4)' }}
      >
        🏆 لوحة المتصدرين التنافسية
      </h3>

      <div className="space-y-3">
        {rows.map((r, i) => {
          const tier = getTier(r.computed_xp)
          const medal = RANK_MEDALS[r.rank]
          const isTop3 = r.rank <= 3

          return (
            <motion.div
              key={r.rank}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all lb-row ${
                isTop3
                  ? 'border-cyan-400/30 bg-cyan-950/30 shadow-[0_0_22px_rgba(0,255,255,0.1)]'
                  : 'border-zinc-800/70 bg-black/20 hover:border-zinc-700/60'
              }`}
            >
              {/* الرتبة والاسم */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    medal ? `${medal.bg} ${medal.text}` : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {medal ? medal.label : r.rank}
                </div>
                <div>
                  <div className="font-bold text-white text-[15px]">{r.full_name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* شارة الرتبة */}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tier.borderClass} ${tier.bgClass} ${tier.textClass} font-bold`}>
                      {tier.emoji} {tier.name}
                    </span>
                    {r.active_daily_streak > 0 && (
                      <span className="text-[11px] text-orange-400">🔥 {r.active_daily_streak} يوم</span>
                    )}
                  </div>
                </div>
              </div>

              {/* XP */}
              <div className="text-left shrink-0">
                <div
                  className="text-cyan-300 font-extrabold text-xl"
                  style={{ textShadow: '0 0 12px rgba(0,255,255,0.4)' }}
                >
                  {formatXP(r.computed_xp)}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">XP</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* تذييل بالمعادلة */}
      <div className="mt-6 text-center text-[11px] text-zinc-600 leading-5">
        XP = (الاختبارات الناجحة × 100) + مجموع الدرجات + (Streak يومي × 50)
      </div>
    </div>
  )
}
