'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar({role='student', userName=''}:{role?:'admin'|'student', userName?:string}){
  const path = usePathname()
  const studentLinks = [
    { href:'/student/dashboard', label:'لوحة التنافس' },
    { href:'/student/lessons', label:'الدروس' },
    { href:'/student/quizzes', label:'ساحة الاختبارات' },
    { href:'/student/profile', label:'حسابي' },
  ]
  const adminLinks = [
    { href:'/admin/dashboard', label:'Dashboard' },
    { href:'/admin/courses', label:'الكورسات' },
    { href:'/admin/quizzes', label:'Quiz Composer' },
    { href:'/admin/students', label:'الطلاب' },
  ]
  const links = role==='admin' ? adminLinks : studentLinks
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05070f]/85 border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-5 py-3.5 flex items-center justify-between" dir="rtl">
        <Link href={role==='admin'?'/admin/dashboard':'/student/dashboard'} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-black font-black">CA</div>
          <div>
            <div className="font-black text-white leading-tight">CodeAcademy</div>
            <div className="text-[10px] text-cyan-300 -mt-0.5 tracking-widest">LMS • ULTRA</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {links.map(l=>{
            const active = path.startsWith(l.href)
            return <Link key={l.href} href={l.href} className={active ? 'text-cyan-300 font-bold' : 'text-zinc-300 hover:text-white'}>{l.label}</Link>
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-400 hidden sm:block">{userName || (role==='admin' ? 'Admin' : 'طالب')}</span>
          <form action="/auth/signout" method="post">
            <button className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:border-red-500/40 hover:text-red-300 text-xs">خروج</button>
          </form>
        </div>
      </div>
    </header>
  )
}
