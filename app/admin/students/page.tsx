export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import AdminStudentsClient from '@/components/AdminStudentsClient'
import { getBadgeDefinitions, getStudentBadgesMap } from '@/app/admin/students/badge-actions'

export const metadata = { title: 'CodeAcademy | إدارة الطلاب' }

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('student_profiles')
    .select('*')
    .order('total_xp', { ascending: false })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('student_id')
    .eq('status', 'graded')

  const attemptCounts: Record<string, number> = {}
  ;(attempts ?? []).forEach(a => {
    attemptCounts[a.student_id] = (attemptCounts[a.student_id] || 0) + 1
  })

  // جلب بيانات الشارات
  const [badgeDefinitions, studentBadgesMap] = await Promise.all([
    getBadgeDefinitions(),
    getStudentBadgesMap(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-emerald-300">إدارة الطلاب</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            {students?.length ?? 0} طالب مسجّل • حذف • إضافة • مراسلة • منح الشارات
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
          صلاحية الإدارة • واجهة التحكم البرمجية (Admin API)
        </div>
      </header>

      <AdminStudentsClient
        students={students ?? []}
        attemptCounts={attemptCounts}
        badgeDefinitions={badgeDefinitions}
        studentBadgesMap={studentBadgesMap}
      />
    </div>
  )
}
