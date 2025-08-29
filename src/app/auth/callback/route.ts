import { getBaseUrl } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
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
  return `${getBaseUrl()}${path}`
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
    return NextResponse.redirect(buildRedirectUrl('/admin?error=no_code'))
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: sessionError
    } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Auth callback: Session exchange failed:', sessionError)
      return NextResponse.redirect(
        buildRedirectUrl('/admin?error=session_failed')
      )
    }

    if (!user) {
      console.error('Auth callback: No user returned after session exchange')
      return NextResponse.redirect(buildRedirectUrl('/admin?error=no_user'))
    }

    if (redirectPath === '/admin/setup') {
      try {
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (!existingRole) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'admin'
            })

          if (!roleError) {
            console.log(
              'Auth callback: Admin role created, redirecting to dashboard'
            )
            return NextResponse.redirect(buildRedirectUrl(DEFAULT_ADMIN_PATH))
          }
        }
      } catch (roleError) {
        console.error('Auth callback: Error handling admin role:', roleError)
      }
    }

    return NextResponse.redirect(buildRedirectUrl(redirectPath))
  } catch (error) {
    console.error('Auth callback: Unexpected error:', error)
    return NextResponse.redirect(buildRedirectUrl('/admin?error=unexpected'))
  }
}
