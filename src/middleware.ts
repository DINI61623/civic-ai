import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = 'https://placeholder-project.supabase.co';
  }
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  const isProtectedRoute = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/profile') || url.pathname.startsWith('/admin')
  const isProfileCompletionRoute = url.pathname === '/profile-completion'
  const isAuthRoute = url.pathname === '/login' || url.pathname === '/signup'

  if (user) {
    // Check if user has completed the essential profile steps
    const hasProfile = !!(user.user_metadata?.student_profile || user.user_metadata?.farmer_profile)

    if (isAuthRoute) {
      if (hasProfile) {
        url.pathname = '/dashboard'
      } else {
        url.pathname = '/profile-completion'
      }
      return NextResponse.redirect(url)
    }

    if (isProtectedRoute && !hasProfile) {
      url.pathname = '/profile-completion'
      return NextResponse.redirect(url)
    }

    if (isProfileCompletionRoute && hasProfile) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } else {
    // Guest accessing protected route or profile completion -> redirect to login
    if (isProtectedRoute || isProfileCompletionRoute) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
