'use server'
import { createClient } from '@/lib/supabase/server'
import { StudentProfile } from '@/lib/types'


// SPECIFICATION 3: COMPETITIVE STUDENT LEADERBOARD & XP SCORE ARCHITECTURE
export async function getLeaderboard(limit = 50): Promise<Array<StudentProfile & { rank: number; computed_xp: number }>> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .order('total_xp', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  // إعادة حساب XP ديناميكياً للتأكد:
  // XP = (exams_passed * 100) + (accumulated_quiz_scores) + (active_daily_streak * 50)
  const ranked = (data ?? []).map((p: StudentProfile, idx) => {
    const computed_xp = (p.exams_passed * 100) + p.accumulated_quiz_scores + (p.active_daily_streak * 50)
    return { ...p, computed_xp, rank: idx + 1 }
  })

  // sort by computed_xp just in case
  ranked.sort((a,b) => b.computed_xp - a.computed_xp)
  ranked.forEach((r, i) => r.rank = i + 1)
  return ranked
}

export async function getMyStats(userId?: string) {
  const supabase = createClient()
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id
  }
  if (!userId) return null
  const { data } = await supabase.from('student_profiles').select('*').eq('user_id', userId).maybeSingle()
  if (!data) return null
  const computed_xp = (data.exams_passed * 100) + data.accumulated_quiz_scores + (data.active_daily_streak * 50)
  return { ...data, computed_xp }
}
