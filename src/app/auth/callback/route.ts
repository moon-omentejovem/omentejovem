import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_REDIRECT_PATHS = [
  '/admin',
  '/admin/artworks',
  '/admin/users',
  '/admin/setup',
  '/admin/settings'
] as const

const DEFAULT_ADMIN_PATH = '/admin/artworks'

const isValidRedirectPath = (path: string): boolean => {
  if (!path || typeof path !== 'string') return false

  const cleanPath = path.split('?')[0].split('#')[0]

  if (!cleanPath.startsWith('/') || cleanPath.includes('../')) {
    return false
  }

  return ALLOWED_REDIRECT_PATHS.some(
    (allowed) => cleanPath === allowed || cleanPath.startsWith(`${allowed}/`)
  )
}

const buildRedirectUrl = (path: string): string => {
  const headersList = headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') || 'http'

  const origin = `${proto}://${host}`
  return `${origin}${path}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? DEFAULT_ADMIN_PATH

  const redirectPath = isValidRedirectPath(nextParam)
    ? nextParam
    : DEFAULT_ADMIN_PATH

  if (!code) {
    console.error('Auth callback: No authorization code provided')
    return NextResponse.redirect(buildRedirectUrl('/auth/auth-code-error'))
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback: Session exchange failed:', error)
      return NextResponse.redirect(buildRedirectUrl('/auth/auth-code-error'))
    }

    // If user is going to setup page, automatically create admin role
    if (redirectPath === '/admin/setup') {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (user) {
          // Check if user already has a role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

          // If no role exists, create admin role (assuming they were invited)
          if (!existingRole) {
            await supabase.from('user_roles').insert({
              user_id: user.id,
              role: 'admin'
            })

            console.log(
              'Auth callback: Admin role created, redirecting to dashboard'
            )
            return NextResponse.redirect(buildRedirectUrl(DEFAULT_ADMIN_PATH))
          }
        }
      } catch (roleError) {
        console.error('Auth callback: Error handling admin role:', roleError)
        // Continue with normal flow if there's an error
      }
    }

    console.log('Auth callback: Success! Redirecting to:', redirectPath)
    return NextResponse.redirect(buildRedirectUrl(redirectPath))
  } catch (error) {
    console.error('Auth callback: Unexpected error:', error)
    return NextResponse.redirect(buildRedirectUrl('/auth/auth-code-error'))
  }
}
