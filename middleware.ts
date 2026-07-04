import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname.startsWith('/admin')
  const isStudentPath = pathname.startsWith('/student')
  const isAuthPath = pathname.startsWith('/auth')

  if ((isAdminPath || isStudentPath) && !user && !isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // role guard (best-effort, RLS is real guard)
  if (user && isAdminPath) {
    const role = (user.app_metadata as any)?.role || user.user_metadata?.role
    // allow through, server actions will enforce
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/dashboard/:path*'],
}
