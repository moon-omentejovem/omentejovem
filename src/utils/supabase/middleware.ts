/**
 * Supabase Middleware Utilities
 *
 * This module provides utilities for session management and authentication
 * in Next.js middleware. It includes both basic session refresh and
 * admin authentication checking.
 */

import { supabaseConfig } from '@/lib/supabase/config'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for middleware use
 */
function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      }
    }
  })
}

/**
 * Basic session refresh - updates session cookies without authentication checks
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Check if Supabase environment variables are available
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn(
      'Supabase configuration missing - skipping auth check for public route:',
      request.nextUrl.pathname
    )
    return response
  }

  const supabase = createMiddlewareClient(request, response)

  // Refresh session
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Log only actual authentication errors (not missing sessions)
  if (error && error.message !== 'Auth session missing!') {
    console.error(
      'Auth error in middleware for route:',
      request.nextUrl.pathname,
      '- Error:',
      error.message
    )
  }

  // Optional: Add user info to headers for debugging (remove in production)
  if (user && process.env.NODE_ENV === 'development') {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email || '')
  }

  return response
}

/**
 * Admin authentication check with role verification
 */
export async function checkAdminAuth(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createMiddlewareClient(request, response)

  // Get user
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Auth error in admin middleware:', error.message)
    return { user: null, response, isAdmin: false }
  }

  if (!user) {
    return { user: null, response, isAdmin: false }
  }

  // Check admin role
  try {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = !roleError && roleData?.role === 'admin'

    return { user, response, isAdmin }
  } catch (error) {
    console.error('Error checking admin role:', error)
    return { user, response, isAdmin: false }
  }
}

/**
 * Complete admin middleware with login page logic
 */
export async function handleAdminRoutes(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle login page (/admin)
  if (pathname === '/admin') {
    const { user, response, isAdmin } = await checkAdminAuth(request)

    // If already logged in as admin, redirect to dashboard
    if (user && isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/artworks'
      return NextResponse.redirect(url)
    }

    // Allow access to login page
    return response
  }

  // Handle other admin routes - require authentication
  const { user, response, isAdmin } = await checkAdminAuth(request)

  // Not authenticated - redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Not admin - redirect to login with error
  if (!isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.searchParams.set('error', 'access_denied')
    return NextResponse.redirect(url)
  }

  // Authenticated admin - allow access
  return response
}
