import NavBar from '@/components/NavBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin/dashboard')
  // role check soft (RLS is hard guard)
  return (
    <div dir="rtl" className="min-h-screen bg-[#05070f] text-white">
      <NavBar role="admin" userName={user.email ?? 'Admin'} />
      {children}
    </div>
  )
}
