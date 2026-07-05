export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'أكاديمية الكود | لوحة المشرف' }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const [{ count: quizzes }, { count: questions }, { count: attempts }, { data: top }] = await Promise.all([
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
    supabase.from('student_profiles').select('full_name, total_xp').order('total_xp', { ascending: false }).limit(5)
  ])

  const kpis = [
    { label: 'الاختبارات', value: quizzes ?? 0, color: 'text-cyan-300', icon: '🧩' },
    { label: 'الأسئلة', value: questions ?? 0, color: 'text-fuchsia-300', icon: '❓' },
    { label: 'المحاولات', value: attempts ?? 0, color: 'text-emerald-300', icon: '📝' },
    { label: 'أمان RLS', value: 'مُفعَّل', color: 'text-amber-300', icon: '🔒' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-black neon-text text-white">غرفة تحكم المشرف</h1>
        <p className="text-zinc-400 mt-2">أكاديمية الكود • محرك الاختبارات • مصحّح الذكاء الاصطناعي • لوحة المتصدرين</p>
      </header>

      {/* مؤشرات الأداء */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 neon-border">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-zinc-400 text-sm">{k.label}</div>
            <div className={`text-3xl font-black mt-1 ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* روابط سريعة */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="font-bold text-cyan-300 mb-4">⚡ روابط سريعة</div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Link href="/admin/quizzes" className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition">
              🧩 منشئ الاختبارات
            </Link>
            <Link href="/admin/courses" className="p-4 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 transition">
              📚 إدارة الكورسات
            </Link>
            <Link href="/admin/students" className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition">
              👥 إدارة الطلاب
            </Link>
            <Link href="/student/dashboard" className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition">
              🏆 لوحة المتصدرين
            </Link>
          </div>
        </div>

        {/* أعلى 5 XP */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="font-bold text-amber-300 mb-4">🏅 أعلى 5 XP</div>
          <ul className="space-y-2.5 text-sm">
            {(top ?? []).map((t: any, i: number) => (
              <li key={t.user_id ?? i} className="flex justify-between items-center">
                <span className="text-zinc-300">#{i + 1} {t.full_name}</span>
                <span className="text-cyan-300 font-bold">{t.total_xp?.toLocaleString('ar-EG')} XP</span>
              </li>
            ))}
            {(!top || top.length === 0) && <li className="text-zinc-500">لا بيانات بعد</li>}
          </ul>
        </div>
      </div>

      <div className="mt-10 text-xs text-zinc-600 border-t border-zinc-900 pt-4">
        إجراءات الخادم: إنشاء الاختبار • تصحيح تلقائي • حفظ تلقائي 500ms • ذكاء Gemini الاصطناعي • أمان RLS مفعّل
      </div>
    </div>
  )
}
