'use server'
import { requireAdmin } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// حذف طالب — يستخدم Supabase Admin API (service role key) لحذف المستخدم من auth.users.
// الـ ON DELETE CASCADE في الـ schema يتكفل تلقائياً بحذف:
// student_profiles, quiz_attempts, student_answers, lesson_progress, admin_messages
export async function deleteStudent(userId: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin() // التحقق من صلاحية المشرف قبل أي إجراء

  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) {
    return { success: false, error: 'فشل حذف المستخدم: ' + error.message }
  }

  revalidatePath('/admin/students')
  return { success: true }
}

// إضافة طالب جديد يدوياً — يستخدم Admin API لإنشاء مستخدم مع تأكيد البريد مباشرةً
export async function addStudent(input: {
  email: string
  password: string
  fullName: string
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin()

  const adminClient = createAdminClient()

  const { data, error } = await adminClient.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName, role: 'student' }
  })

  if (error) return { success: false, error: 'فشل إنشاء الحساب: ' + error.message }
  if (!data.user) return { success: false, error: 'لم يُنشأ المستخدم' }

  // on_auth_user_created trigger in schema.sql creates the student_profile automatically.
  // Upsert here as a safety net in case the trigger hasn't fired yet.
  await adminClient.from('student_profiles').upsert({
    user_id: data.user.id,
    full_name: input.fullName
  }, { onConflict: 'user_id' })

  revalidatePath('/admin/students')
  return { success: true }
}

// إرسال رسالة دائمة من المشرف لطالب أو لجميع الطلاب
export async function sendMessageToStudent(input: {
  studentId: string | 'all'
  message: string
  title?: string
}): Promise<{ success: boolean; error?: string }> {
  const { supabase } = await requireAdmin()

  if (input.studentId === 'all') {
    const { data: profiles } = await supabase.from('student_profiles').select('user_id')
    const rows = (profiles ?? []).map(p => ({
      student_id: p.user_id,
      title: input.title?.trim() || 'رسالة من الإدارة',
      message: input.message.trim()
    }))
    if (rows.length > 0) {
      const { error } = await supabase.from('admin_messages').insert(rows)
      if (error) return { success: false, error: 'فشل الإرسال الجماعي: ' + error.message }
    }
  } else {
    const { error } = await supabase.from('admin_messages').insert({
      student_id: input.studentId,
      title: input.title?.trim() || 'رسالة من الإدارة',
      message: input.message.trim()
    })
    if (error) return { success: false, error: 'فشل الإرسال: ' + error.message }
  }

  revalidatePath('/admin/students')
  return { success: true }
}

// جلب الرسائل غير المُغلقة للطالب الحالي
export async function getUnreadMessages() {
  const { requireStudent } = await import('@/lib/supabase/server')
  let supabase: any, user: any
  try {
    const res = await requireStudent()
    supabase = res.supabase
    user = res.user
  } catch {
    return []
  }
  if (!user) return []
  const { data } = await supabase
    .from('admin_messages')
    .select('id, title, message, created_at')
    .eq('student_id', user.id)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false })
  return data ?? []
}

// إغلاق رسالة — الطالب يُغلقها لحسابه فقط
export async function dismissMessage(messageId: string): Promise<{ success: boolean }> {
  const { requireStudent } = await import('@/lib/supabase/server')
  const { supabase, user } = await requireStudent()
  await supabase
    .from('admin_messages')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('student_id', user.id)
  return { success: true }
}
