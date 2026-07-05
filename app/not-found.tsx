import Link from 'next/link'

export default function NotFound() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#05070f] text-white flex items-center justify-center px-6" style={{fontFamily:'Cairo, system-ui'}}>
      <div className="text-center max-w-md">
        <div className="text-7xl font-black text-cyan-400 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-zinc-400 mb-8">الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-bold">الرئيسية</Link>
          <Link href="/student/dashboard" className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-200">لوحة التحكم</Link>
        </div>
      </div>
    </main>
  )
}
