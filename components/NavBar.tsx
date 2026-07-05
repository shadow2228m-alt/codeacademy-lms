'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

type NavLink = { href: string; label: string }

const STUDENT_LINKS: NavLink[] = [
  { href: '/student/dashboard', label: '🏆 المتصدرين' },
  { href: '/student/quizzes', label: '🧩 الاختبارات' },
  { href: '/student/lessons', label: '📚 الدروس' },
  { href: '/student/profile', label: '👤 حسابي' },
]

const ADMIN_LINKS: NavLink[] = [
  { href: '/admin/dashboard', label: '📊 لوحة التحكم' },
  { href: '/admin/quizzes', label: '🧩 الاختبارات' },
  { href: '/admin/courses', label: '📚 الكورسات' },
  { href: '/admin/students', label: '👥 الطلاب' },
]

export default function NavBar({ role, userName }: { role: 'admin' | 'student'; userName: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const signOut = () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    })
  }

  const links = role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS

  return (
    <nav
      dir="rtl"
      className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#05070f]/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* الشعار */}
        <Link
          href={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
          className="font-black text-lg tracking-tight text-cyan-300 hover:text-cyan-200 transition neon-text"
        >
          CodeAcademy
        </Link>

        {/* الروابط */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* اسم المستخدم + خروج */}
        <div className="flex items-center gap-3 shrink-0">
          {role === 'admin' && (
            <span className="text-[10px] px-2 py-1 rounded-full border border-amber-500/30 text-amber-400">مشرف</span>
          )}
          <span className="text-zinc-500 text-sm hidden sm:block truncate max-w-[120px]">{userName}</span>
          <button
            disabled={isPending}
            onClick={signOut}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:border-red-500/40 hover:text-red-400 transition disabled:opacity-50"
          >
            خروج
          </button>
        </div>
      </div>
    </nav>
  )
}
