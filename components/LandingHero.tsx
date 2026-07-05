'use client'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'

// بيانات ثابتة للأقسام
const FEATURES = [
  {
    icon: '🧩',
    title: 'اختبارات تفاعلية',
    desc: 'أسئلة متعددة الاختيارات وكود Python مع مؤقت دقيق وحفظ تلقائي كل 500ms',
    color: 'from-cyan-500/20 to-transparent',
    border: 'border-cyan-500/25',
  },
  {
    icon: '🤖',
    title: 'تصحيح بالذكاء الاصطناعي',
    desc: 'Gemini AI يصحّح كودك ويعطيك تقييماً عربياً تفصيلياً في ثوانٍ',
    color: 'from-fuchsia-500/20 to-transparent',
    border: 'border-fuchsia-500/25',
  },
  {
    icon: '🏆',
    title: 'لوحة متصدرين حية',
    desc: 'تنافس زملاءك بنظام XP وRank tiers وstreak يومي يشعل الحماس',
    color: 'from-amber-500/20 to-transparent',
    border: 'border-amber-500/25',
  },
  {
    icon: '📚',
    title: 'دروس تفاعلية',
    desc: 'محتوى فيديو + Python Sandbox مدمج لتطبيق ما تتعلمه فوراً',
    color: 'from-emerald-500/20 to-transparent',
    border: 'border-emerald-500/25',
  },
]

const TIERS = [
  { label: 'برونز', range: '0 – 499', color: 'text-amber-700', bg: 'from-amber-900/30 to-transparent', border: 'border-amber-700/30' },
  { label: 'فضي', range: '500 – 1,499', color: 'text-zinc-300', bg: 'from-zinc-700/30 to-transparent', border: 'border-zinc-500/30' },
  { label: 'ذهبي', range: '1,500 – 3,499', color: 'text-yellow-400', bg: 'from-yellow-900/30 to-transparent', border: 'border-yellow-500/30' },
  { label: 'بلاتيني', range: '3,500 – 6,999', color: 'text-cyan-300', bg: 'from-cyan-900/30 to-transparent', border: 'border-cyan-500/30' },
  { label: 'ألماس', range: '7,000+', color: 'text-fuchsia-300', bg: 'from-fuchsia-900/30 to-transparent', border: 'border-fuchsia-500/30' },
]

// مكوّن الشكل العائم ثلاثي الأبعاد
function FloatingShape({ className, delay = 0, size = 'md' }: { className: string, delay?: number, size?: string }) {
  const sizes: Record<string, string> = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-32 h-32', xl: 'w-48 h-48' }
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`absolute rounded-2xl opacity-20 ${sizes[size]} ${className}`}
      animate={shouldReduceMotion ? {} : {
        y: [0, -20, -10, 0],
        rotateX: [0, 8, -5, 0],
        rotateY: [0, 12, -8, 0],
      }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ transformStyle: 'preserve-3d' }}
    />
  )
}

export default function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const stagger = {
    hidden: {},
    show: shouldReduceMotion ? {} : { transition: { staggerChildren: 0.12 } },
  }
  const fadeUp = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: shouldReduceMotion 
        ? { duration: 0 } 
        : { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } 
    },
  }

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section
        ref={containerRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6"
        style={{ perspective: '1200px' }}
      >
        {/* خلفية متوهجة */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-cyan-500/8 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-fuchsia-500/8 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/6 blur-[80px]" />
        </div>

        {/* أشكال عائمة ثلاثية الأبعاد */}
        <FloatingShape className="top-16 left-10 bg-gradient-to-br from-cyan-400 to-cyan-600" delay={0} size="lg" />
        <FloatingShape className="top-24 right-8 bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-full" delay={1.5} size="md" />
        <FloatingShape className="bottom-32 left-20 bg-gradient-to-br from-amber-400 to-orange-600" delay={3} size="sm" />
        <FloatingShape className="bottom-20 right-12 bg-gradient-to-br from-emerald-400 to-cyan-600 rotate-45" delay={2} size="md" />
        <FloatingShape className="top-1/2 left-4 bg-gradient-to-br from-blue-400 to-fuchsia-600 rounded-full" delay={4} size="sm" />

        {/* محتوى Hero */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl"
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center gap-6"
          >
            {/* شارة */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-sm font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                منصة التعلم الأولى بالذكاء الاصطناعي
              </span>
            </motion.div>

            {/* العنوان الرئيسي */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl font-black leading-tight tracking-tight"
            >
              <span className="shimmer-text">CodeAcademy</span>
              <br />
              <span className="text-white">ساحة التميّز</span>
            </motion.h1>

            {/* الوصف */}
            <motion.p variants={fadeUp} className="text-zinc-400 text-lg sm:text-xl leading-8 max-w-2xl">
              تعلّم البرمجة بأسلوب لم تعرفه من قبل — اختبارات ذكية، تصحيح فوري بـ Gemini AI،
              وتنافس حقيقي مع زملائك على لوحة المتصدرين.
            </motion.p>

            {/* أزرار الإجراء — طلاب فقط، لا يوجد رابط للأدمن */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/register"
                id="hero-cta-register"
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black text-lg shadow-[0_0_40px_rgba(0,234,255,0.3)] hover:shadow-[0_0_60px_rgba(0,234,255,0.5)] transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">ادخل ساحة الطلاب ⚡</span>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              </Link>
              <Link
                href="/auth/login"
                id="hero-cta-login"
                className="px-8 py-4 rounded-2xl border border-zinc-700 text-zinc-300 font-bold text-lg hover:border-cyan-500/50 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                تسجيل الدخول
              </Link>
            </motion.div>

            {/* إحصائيات سريعة */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8 mt-4">
              {[
                { v: 'Python', l: 'اللغة الأساسية' },
                { v: 'Gemini AI', l: 'محرك التصحيح' },
                { v: '∞ XP', l: 'نقاط لا حدود لها' },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <div className="text-xl font-black text-cyan-300">{s.v}</div>
                  <div className="text-xs text-zinc-500 mt-1">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* سهم التمرير */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-cyan-400" />
          </div>
        </motion.div>
      </section>

      {/* ─── مميزات المنصة ─── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-white mb-4">لماذا CodeAcademy؟</h2>
          <p className="text-zinc-400 text-lg">كل ما تحتاجه للتفوق في البرمجة، في مكان واحد</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative rounded-[28px] border ${f.border} bg-gradient-to-b ${f.color} bg-zinc-950/60 p-6 overflow-hidden cursor-default`}
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-6">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── نظام XP والرتب ─── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-zinc-950/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-white mb-4">🏅 نظام الرتب التنافسية</h2>
            <p className="text-zinc-400 text-lg">
              XP = (الاختبارات الناجحة × 100) + مجموع الدرجات + (Streak يومي × 50)
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-5 gap-4">
            {TIERS.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className={`rounded-2xl border ${t.border} bg-gradient-to-b ${t.bg} bg-zinc-950/70 p-5 text-center`}
              >
                <div className={`text-2xl font-black ${t.color} mb-2`}>{t.label}</div>
                <div className="text-xs text-zinc-400 leading-5">{t.range} XP</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA النهائي ─── */}
      <section className="py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <div
            className="relative rounded-[40px] border border-cyan-500/25 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-16 glow-pulse overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-fuchsia-500/5" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                جاهز للانطلاق؟
              </h2>
              <p className="text-zinc-400 text-lg mb-10">
                سجّل الآن وابدأ رحلتك في عالم البرمجة مع CodeAcademy
              </p>
              <Link
                href="/auth/register"
                id="final-cta-register"
                className="inline-block px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black text-xl shadow-[0_0_50px_rgba(0,234,255,0.35)] hover:shadow-[0_0_80px_rgba(0,234,255,0.55)] transition-all duration-300"
              >
                ادخل ساحة الطلاب ⚡
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 px-6 text-center text-zinc-600 text-sm">
        <p>CodeAcademy LMS © 2026 — Gemini AI • Supabase • Next.js 16</p>
      </footer>
    </>
  )
}
