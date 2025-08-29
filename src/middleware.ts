import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '../utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // First, update the session using the helper function
  let supabaseResponse = await updateSession(request)

  // Create a new Supabase client for basic auth checking
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  // Get the user after session refresh
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Check if the request is for the admin dashboard (protected routes)
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    request.nextUrl.pathname !== '/admin'
  ) {
    // If no user is authenticated, redirect to admin login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }

    // Check if user has admin role
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      // If there's an error or user is not admin, redirect with error
      if (roleError || roleData?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        url.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(url)
      }
    } catch (error) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      url.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in and tries to access admin login page, check if they're admin
  if (request.nextUrl.pathname === '/admin' && user) {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      // If user is admin, redirect to dashboard
      if (!roleError && roleData?.role === 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/artworks'
        return NextResponse.redirect(url)
      }
      // If user is not admin, stay on login page with error
      if (roleError || roleData?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        url.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // On error, show access denied
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      url.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
