import Link from 'next/link'

export default function HomePage(){
  return (
    <main dir="rtl" className="min-h-screen bg-[#05070f] text-white" style={{fontFamily:'Cairo, system-ui, sans-serif'}}>
      <div className="max-w-7xl mx-auto px-6">
        {/* hero */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-black font-black">CA</div>
            <span className="font-black text-xl">CodeAcademy</span>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/auth/login" className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:border-cyan-500/50">دخول</Link>
            <Link href="/auth/register" className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold">ابدأ مجاناً</Link>
          </div>
        </nav>

        <section className="py-20 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 text-cyan-300 text-xs mb-5">Ultra-Granular • Gemini AI • RLS • Next.js 16</div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            منصة <span className="text-cyan-300 neon-text">CodeAcademy</span><br/>التعليمية الفاخرة
          </h1>
          <p className="text-zinc-400 mt-6 text-lg max-w-2xl mx-auto leading-8">
            محرك اختبارات ديناميكي • مصحح ذكاء اصطناعي فوري • نظام تصنيف تنافسي XP & Streak<br/>
            صُممت للشركات الأسطورية — جاهزة للإنتاج 100%
          </p>
          <div className="flex items-center justify-center gap-4 mt-9">
            <Link href="/student/dashboard" className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black">ادخل ساحة الطلاب</Link>
            <Link href="/admin/dashboard" className="px-7 py-3.5 rounded-2xl border border-zinc-700 text-zinc-200">لوحة المشرف</Link>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-16 text-right max-w-5xl mx-auto">
            {[
              {t:'Quiz Builder', d:'Bento-grid + MC + Essay Code + evaluation_meta'},
              {t:'Gemini AI Grader', d:'JSON-only strict • Arabic critique • auto score'},
              {t:'XP Leaderboard', d:'XP = E×100 + ΣS + C×50 • Daily Streak Δt'},
              {t:'Exam Arena', d:'500ms auto-save • localStorage • crimson timer'},
            ].map(x=>(
              <div key={x.t} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
                <div className="text-cyan-300 font-bold">{x.t}</div>
                <div className="text-zinc-400 text-sm mt-2 leading-6">{x.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-24">
          <div className="rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-zinc-950 to-black p-10 text-center neon-border">
            <div className="text-2xl font-black">جاهزة للرفع Production-Ready</div>
            <div className="text-zinc-400 mt-3">Supabase RLS • Server Actions Atomic • TypeScript Strict • Tailwind RTL Neon • Vercel Deploy 1-Click</div>
            <div className="mt-6 text-xs text-zinc-500">admin@codeacademy.test / Admin123! • student@codeacademy.test / Student123!</div>
          </div>
        </section>

        <footer className="pb-12 text-center text-zinc-500 text-xs">
          CodeAcademy LMS • Phase 2 Ultra-Granular Integration • © 2026
        </footer>
      </div>
    </main>
  )
}
