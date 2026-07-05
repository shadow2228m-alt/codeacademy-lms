'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TIERS, getTier, xpToNextTier } from '@/lib/xp'



interface XPInfoButtonProps {
  currentXP?: number
  exams?: number
  scores?: number
  streak?: number
}

export function XPInfoButton({ currentXP = 0, exams = 0, scores = 0, streak = 0 }: XPInfoButtonProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('xp_modal_seen')
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('xp_modal_seen', '1')
    setOpen(false)
  }

  return (
    <>
      <button
        id="xp-info-btn"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition font-bold"
      >
        <span>❓</span> كيف تُحسب؟
      </button>

      <AnimatePresence>
        {open && (
          <XPExplainModal
            currentXP={currentXP}
            exams={exams}
            scores={scores}
            streak={streak}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  )
}

interface ModalProps {
  currentXP: number
  exams: number
  scores: number
  streak: number
  onClose: () => void
}

export default function XPExplainModal({ currentXP, exams, scores, streak, onClose }: ModalProps) {
  const tier = getTier(currentXP)
  const toNext = xpToNextTier(currentXP)
  const currentTierIdx = TIERS.findIndex(t => t.name === tier.name)

  // حساب الشريط التقدمي للمستوى الحالي
  const tierMin = tier.min
  const tierMax = tier.max ?? (tier.min + 5000)
  const progress = Math.min(100, ((currentXP - tierMin) / (tierMax - tierMin)) * 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      dir="rtl"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-cyan-500/25 bg-gradient-to-b from-[#0a0f1d] to-[#060912] shadow-[0_0_80px_rgba(0,234,255,0.15)] p-8"
      >
        {/* رأس المودال */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">🏅 نظام XP والرتب</h2>
            <p className="text-zinc-400 text-sm mt-1">كيف تعمل نقاطك ومستوياتك؟</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition">
            ✕
          </button>
        </div>

        {/* معادلة XP */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-5 mb-6">
          <div className="text-xs text-cyan-400 font-bold mb-3 uppercase tracking-wider">معادلة النقاط</div>
          <div className="font-mono text-center text-lg text-white font-bold mb-4">
            XP = (E × 100) + S + (C × 50)
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {[
              { sym: 'E', label: 'الاختبارات الناجحة', val: exams, color: 'text-emerald-300' },
              { sym: 'S', label: 'مجموع الدرجات', val: scores, color: 'text-amber-300' },
              { sym: 'C', label: 'Streak يومي', val: streak, color: 'text-fuchsia-300' },
            ].map(x => (
              <div key={x.sym} className="rounded-xl border border-zinc-800 bg-black/30 p-3">
                <div className={`text-2xl font-black ${x.color}`}>{x.val}</div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono">{x.sym} = {x.label}</div>
              </div>
            ))}
          </div>

          {/* نقاطك الحالية */}
          <div className="mt-4 text-center">
            <span className="text-zinc-400 text-sm">إجمالي نقاطك: </span>
            <span className="text-cyan-300 font-black text-xl">{currentXP.toLocaleString('ar-EG')} XP</span>
          </div>
        </div>

        {/* مستواك الحالي + شريط التقدم */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-zinc-400 mb-1">مستواك الحالي</div>
              <div className={`text-xl font-black ${tier.textClass}`}>{tier.emoji} {tier.name}</div>
            </div>
            {toNext !== null && (
              <div className="text-right">
                <div className="text-xs text-zinc-400 mb-1">للمستوى التالي</div>
                <div className="text-lg font-black text-white">{toNext.toLocaleString('ar-EG')} XP</div>
              </div>
            )}
          </div>
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
            />
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">{progress.toFixed(0)}% من المستوى الحالي</div>
        </div>

        {/* جدول المستويات */}
        <div className="mb-6">
          <div className="text-xs text-zinc-400 font-bold mb-3 uppercase tracking-wider">مسار المستويات</div>
          <div className="grid grid-cols-5 gap-2">
            {TIERS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-xl border p-3 text-center transition ${
                  t.name === tier.name
                    ? `${t.borderClass} ${t.bgClass} ring-2 ring-offset-1 ring-offset-[#0a0f1d] ring-current`
                    : 'border-zinc-800 bg-black/20'
                }`}
              >
                <div className="text-xl mb-1">{t.emoji}</div>
                <div className={`text-xs font-black ${t.textClass}`}>{t.name}</div>
                <div className="text-[10px] text-zinc-500 mt-1">
                  {t.min.toLocaleString('ar-EG')}
                  {t.max ? `–${t.max.toLocaleString('ar-EG')}` : '+'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* قواعد الـ Streak */}
        <div>
          <div className="text-xs text-zinc-400 font-bold mb-3 uppercase tracking-wider">🔥 قواعد Daily Streak</div>
          <div className="space-y-2">
            {[
              { icon: '🟢', label: 'نفس اليوم (Δt ≤ 24h)', desc: 'يُحافَظ على الـ Streak بدون زيادة' },
              { icon: '🔥', label: 'يوم تالٍ (24h < Δt ≤ 48h)', desc: 'C_streak = C_streak + 1' },
              { icon: '💔', label: 'غياب (Δt > 48h)', desc: 'C_streak = 0 — انكسار السلسلة' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm">
                <span className="text-xl shrink-0">{r.icon}</span>
                <div>
                  <div className="font-bold text-white text-xs">{r.label}</div>
                  <div className="text-zinc-400 text-[11px]">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black hover:opacity-90 transition"
        >
          فهمت! 🚀
        </button>
      </motion.div>
    </motion.div>
  )
}
