import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminPath = pathname.startsWith('/admin')
  const isStudentPath = pathname.startsWith('/student')
  const isAuthPath = pathname.startsWith('/auth')

  // لوجد مستخدم غير مسجل يحاول الوصول لمسارات محمية → صفحة تسجيل الدخول العادية
  if ((isAdminPath || isStudentPath) && !user && !isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // حماية مسارات /admin: الطلاب أو غير المعروفين يُوجَّهون لـ student/dashboard أو 404
  // IMPORTANT: لا يُوجَّه أحد نحو /mgmt-9f3c — ذلك سيكشف وجود الرابط السري
  if (user && isAdminPath) {
    const role = (user.app_metadata as any)?.role || user.user_metadata?.role
    if (role !== 'admin') {
      // الطالب المسجل → لوحة الطالب (مسار غير مريب)
      const url = request.nextUrl.clone()
      url.pathname = '/student/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/dashboard/:path*'],
}
