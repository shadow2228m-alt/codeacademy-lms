import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'


export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch {}
        },
      },
    }
  )
}

export async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  // role from JWT app_metadata
  const role = (user.app_metadata as any)?.role ?? user.user_metadata?.role
  // fallback to jwt claim
  const { data: { session } } = await supabase.auth.getSession()
  const jwtRole = (session?.access_token ? JSON.parse(Buffer.from(session.access_token.split('.')[1], 'base64').toString()).role : null)
  if (role !== 'admin' && jwtRole !== 'admin') {
    throw new Error('Admin role required')
  }
  return { supabase, user }
}

export async function requireStudent() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}
