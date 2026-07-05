import NavBar from '@/components/NavBar'
import StudentMessageModal from '@/components/StudentMessageModal'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/student/dashboard')

  // إنشاء ملف شخصي إن لم يكن موجوداً
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.from('student_profiles').insert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'طالب'
    })
  }

  // جلب الرسائل غير المُغلقة
  const { data: messages } = await supabase
    .from('admin_messages')
    .select('id, title, message, created_at')
    .eq('student_id', user.id)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })

  return (
    <div dir="rtl" className="min-h-screen bg-[#05070f] text-white">
      <NavBar role="student" userName={profile?.full_name || user.email || ''} />
      {/* مودال الرسائل — يظهر فوق كل شيء إن وجدت رسائل غير مُقروءة */}
      <StudentMessageModal messages={messages ?? []} />
      {children}
    </div>
  )
}
