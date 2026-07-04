import NavBar from '@/components/NavBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/student/dashboard')

  // ensure profile exists
  const { data: profile } = await supabase.from('student_profiles').select('full_name').eq('user_id', user.id).maybeSingle()
  if (!profile) {
    await supabase.from('student_profiles').insert({
      user_id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'طالب'
    })
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#05070f] text-white">
      <NavBar role="student" userName={profile?.full_name || user.email || ''} />
      {children}
    </div>
  )
}
