import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getMockSupabaseClient, CookieStore } from './lib/supabase/mock'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isPlaceholder = !supabaseUrl || !supabaseUrl.startsWith('http') || supabaseUrl.includes('placeholder-project');

  let supabase: any;
  if (isPlaceholder) {
    const middlewareCookieStore: CookieStore = {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set(name, value);
        supabaseResponse.cookies.set(name, value, options);
      },
      delete(name) {
        request.cookies.delete(name);
        supabaseResponse.cookies.delete(name);
      }
    };
    supabase = getMockSupabaseClient(middlewareCookieStore);
  } else {
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                        'placeholder-anon-key';
    supabase = createServerClient(
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
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Fix proxy redirection (Render forwarding to localhost:10000)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  if (forwardedHost) {
    url.host = forwardedHost
    if (forwardedProto) {
      url.protocol = forwardedProto
    }
  }

  const isProtectedRoute = !url.pathname.startsWith('/login') && 
                           !url.pathname.startsWith('/signup') && 
                           !url.pathname.startsWith('/auth/callback') &&
                           !url.pathname.startsWith('/profile-completion') &&
                           !url.pathname.startsWith('/api')
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
