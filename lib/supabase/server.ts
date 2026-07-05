import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'


export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // called from a Server Component — safe to ignore since middleware refreshes sessions
          }
        },
      },
    }
  )
}

export async function requireAdmin() {
  const supabase = await createClient()
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}
