import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Render (and most reverse proxies) run Next.js on an internal port (e.g. localhost:10000)
  // and forward requests via a proxy. The real public URL is available via forwarded headers.
  // Priority: env var > x-forwarded headers > raw origin (local dev fallback)
  const headersList = await headers()
  const forwardedHost = headersList.get('x-forwarded-host')
  const forwardedProto = headersList.get('x-forwarded-proto') ?? 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  const baseUrl = siteUrl
    ?? (forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const hasProfile = user.user_metadata?.student_profile || user.user_metadata?.farmer_profile;
        if (!hasProfile) {
          return NextResponse.redirect(`${baseUrl}/profile-completion`)
        }
      }
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_failed`)
}

