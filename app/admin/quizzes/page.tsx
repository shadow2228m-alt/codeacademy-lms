export const dynamic = 'force-dynamic'

import QuizBuilder from '@/components/QuizBuilder'
import QuizList from './QuizList'
import { listQuizzesAdmin } from './actions'

export const metadata = { title: 'CodeAcademy | Quiz Builder Admin' }

export default async function AdminQuizzesPage() {
  const quizzes = await listQuizzesAdmin()

  return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight"
              style={{ textShadow: '0 0 18px rgba(0,255,255,0.35)' }}>
              أكاديمية الكود <span className="text-cyan-400">منشئ الاختبارات</span>
            </h1>
            <p className="text-zinc-400 mt-2">محرك بناء الاختبارات الديناميكي — فائق الدقة</p>
          </div>
          <div className="text-sm px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-300">
            الصلاحية: مشرف • بيئة Next.js 16 • حماية RLS نشطة
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-cyan-200 mb-4">الاختبارات الموجودة ({quizzes.length})</h2>
          <QuizList initialQuizzes={quizzes as any} />
        </section>

        <section>
          <h2 className="text-xl font-bold text-fuchsia-200 mb-4">إنشاء اختبار جديد</h2>
          <QuizBuilder />
        </section>

        <footer className="mt-16 text-center text-zinc-500 text-xs">
          منصة أكاديمية الكود • تكامل النظام • إجراءات خادم برمجية مؤمنة
        </footer>
      </div>
  )
}
