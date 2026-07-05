'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTier } from '@/lib/xp'
import confetti from 'canvas-confetti'

interface XPGainEvent {
  xpBefore: number
  xpAfter: number
  score: number
  passed: boolean
}

interface RankUpModalProps {
  tierName: string
  emoji: string
  textClass: string
  onClose: () => void
}

function RankUpModal({ tierName, emoji, textClass, onClose }: RankUpModalProps) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    // إطلاق الكونفيتي
    const canvas = document.createElement('canvas')
    canvas.style.position = 'fixed'
    canvas.style.inset = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '10000'
    document.body.appendChild(canvas)
    const c = confetti.create(canvas, { resize: true })
    c({ particleCount: 180, spread: 100, origin: { y: 0.6 }, colors: ['#00eaff', '#d946ef', '#eab308', '#34d399'] })
    setTimeout(() => document.body.removeChild(canvas), 4000)
  }, [])

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="text-center max-w-sm mx-4 rounded-[32px] border border-fuchsia-500/30 bg-zinc-950 p-10 shadow-[0_0_80px_rgba(217,70,239,0.3)]"
      >
        <div className="text-7xl mb-4">{emoji}</div>
        <div className="text-sm text-zinc-400 mb-2">لقد ارتقيت إلى رتبة</div>
        <div className={`text-4xl font-black ${textClass} mb-6`}>{tierName}</div>
        <p className="text-zinc-300 text-sm leading-6 mb-8">
          تهانينا! استمر في العمل الجاد وحافظ على سلسلتك اليومية للوصول للمستوى الأعلى.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black hover:opacity-90 transition"
        >
          رائع، شكراً! 🚀
        </button>
      </motion.div>
    </div>
  )
}

export default function XPToast({ event, onDone }: { event: XPGainEvent; onDone: () => void }) {
  const tierBefore = getTier(event.xpBefore)
  const tierAfter = getTier(event.xpAfter)
  const rankedUp = tierBefore.name !== tierAfter.name
  const [showRankUp, setShowRankUp] = useState(rankedUp)
  const xpGain = event.xpAfter - event.xpBefore

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!rankedUp) onDone()
    }, 3500)
    return () => clearTimeout(timer)
  }, [rankedUp, onDone])

  return (
    <>
      {/* توست XP عائم */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9997] flex items-center gap-4 px-6 py-4 rounded-2xl border border-cyan-500/30 bg-zinc-950/95 shadow-[0_0_40px_rgba(0,234,255,0.2)] backdrop-blur-md"
          dir="rtl"
        >
          <div className="text-3xl">{event.passed ? '🎯' : '📝'}</div>
          <div>
            <div className="font-black text-white text-base">
              {event.passed ? 'اجتزت الاختبار!' : 'إجابة مسجّلة'}
            </div>
            <div className="text-sm text-cyan-300 font-bold mt-0.5">
              +{xpGain > 0 ? xpGain.toLocaleString('ar-EG') : event.score.toLocaleString('ar-EG')} XP
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${tierAfter.borderClass} ${tierAfter.bgClass}`}>
            <span>{tierAfter.emoji}</span>
            <span className={`text-xs font-bold ${tierAfter.textClass}`}>{tierAfter.name}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* مودال ترقي الرتبة */}
      <AnimatePresence>
        {showRankUp && (
          <RankUpModal
            tierName={tierAfter.name}
            emoji={tierAfter.emoji}
            textClass={tierAfter.textClass}
            onClose={() => { setShowRankUp(false); onDone() }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
