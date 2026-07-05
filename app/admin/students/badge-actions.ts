'use server'
import { requireAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BadgeDefinition } from '@/lib/types'

export async function getBadgeDefinitions(): Promise<BadgeDefinition[]> {
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('badge_definitions').select('*').order('created_at')
  return (data ?? []) as BadgeDefinition[]
}

export async function grantBadge(
  studentId: string,
  badgeId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireAdmin()
  const { error } = await supabase.from('student_badges').insert({
    student_id: studentId,
    badge_id: badgeId,
    granted_by: user.id,
  })
  if (error) return { success: false, error: 'فشل منح الشارة: ' + error.message }
  revalidatePath('/admin/students')
  return { success: true }
}

export async function revokeBadge(
  studentBadgeId: string
): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('student_badges').delete().eq('id', studentBadgeId)
  if (error) return { success: false, error: 'فشل سحب الشارة: ' + error.message }
  revalidatePath('/admin/students')
  return { success: true }
}

export async function getStudentBadgesMap(): Promise<
  Record<string, Array<{ id: string; badge_id: string; badge_definitions: BadgeDefinition }>>
> {
  const { supabase } = await requireAdmin()
  const { data } = await supabase
    .from('student_badges')
    .select('id, student_id, badge_id, badge_definitions(*)')
  const map: Record<string, Array<{ id: string; badge_id: string; badge_definitions: BadgeDefinition }>> = {}
  for (const row of data ?? []) {
    const key = (row as any).student_id
    if (!map[key]) map[key] = []
    map[key].push({
      id: row.id,
      badge_id: row.badge_id,
      badge_definitions: (row as any).badge_definitions as BadgeDefinition,
    })
  }
  return map
}
