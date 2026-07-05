import NavBar from '@/components/NavBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // غير مسجل → صفحة تسجيل الدخول العادية (لا يُوجَّه لـ /mgmt-9f3c)
  if (!user) redirect('/auth/login')

  // الطالب يحاول الوصول → لوحة الطالب (مسار طبيعي وغير مريب)
  const role = (user.app_metadata as any)?.role || user.user_metadata?.role
  if (role !== 'admin') redirect('/student/dashboard')

  return (
    <div dir="rtl" className="min-h-screen bg-[#05070f] text-white">
      <NavBar role="admin" userName={user.email ?? 'مشرف'} />
      {children}
    </div>
  )
}
