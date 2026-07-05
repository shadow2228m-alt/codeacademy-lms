// هذا الملف يُستخدم فقط من Server Actions — لا يُرسل للعميل أبداً
// CRITICAL: NEVER import this from any client component
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('مفاتيح Supabase الإدارية غير مضبوطة — تأكد من SUPABASE_SERVICE_ROLE_KEY في البيئة')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
