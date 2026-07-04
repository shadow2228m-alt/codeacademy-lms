export const dynamic = 'force-dynamic'

import QuizBuilder from '@/components/QuizBuilder'

export const metadata = { title: 'CodeAcademy | Quiz Builder Admin' }

export default async function AdminQuizzesPage() {
  return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight"
              style={{ textShadow: '0 0 18px rgba(0,255,255,0.35)' }}>
              CodeAcademy <span className="text-cyan-400">Quiz Composer</span>
            </h1>
            <p className="text-zinc-400 mt-2">محرك بناء الاختبارات الديناميكي — Ultra-Granular</p>
          </div>
          <div className="text-sm px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-300">
            Role: admin • Next.js 16 • RLS Active
          </div>
        </header>

        <QuizBuilder />
        <footer className="mt-16 text-center text-zinc-500 text-xs">
          CodeAcademy LMS • Phase 2 System Integration • Server Actions Atomic Transaction
        </footer>
      </div>
  )
}
