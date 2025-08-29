import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Paths permitidos para redirecionamento (whitelist)
const ALLOWED_REDIRECT_PATHS = [
  '/admin',
  '/admin/artworks',
  '/admin/users',
  '/admin/setup',
  '/admin/settings'
] as const

const isValidRedirectPath = (path: string): boolean => {
  // Remove query params e fragments
  const cleanPath = path.split('?')[0].split('#')[0]

  // Verifica se começa com / e não contém ../ (path traversal)
  if (!cleanPath.startsWith('/') || cleanPath.includes('../')) {
    return false
  }

  // Verifica se está na whitelist ou é subpath permitido
  return ALLOWED_REDIRECT_PATHS.some(
    (allowed) => cleanPath === allowed || cleanPath.startsWith(`${allowed}/`)
  )
}

const buildSecureRedirectUrl = (
  basePath: string,
  origin: string,
  forwardedHost?: string | null
): string => {
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv) {
    // Desenvolvimento: usa origin local
    return `${origin}${basePath}`
  } else if (forwardedHost && forwardedHost.includes('.vercel.app')) {
    // Vercel previews: valida pattern e usa HTTPS
    return `https://${forwardedHost}${basePath}`
  } else if (process.env.NEXT_PUBLIC_BASE_URL) {
    // Produção: usa variável de ambiente confiável
    return `${process.env.NEXT_PUBLIC_BASE_URL}${basePath}`
  } else {
    // Fallback: usa origin mas só em HTTPS em produção
    const safeOrigin = isLocalEnv
      ? origin
      : origin.replace('http://', 'https://')
    return `${safeOrigin}${basePath}`
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Validate and sanitize redirect path
  const nextParam = searchParams.get('next') ?? '/admin/artworks'
  const next = isValidRedirectPath(nextParam) ? nextParam : '/admin/artworks'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If user is going to setup page, automatically create admin role
      if (next === '/admin/setup') {
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

              // Redirect to admin dashboard instead of setup using secure URL builder
              const forwardedHost = request.headers.get('x-forwarded-host')
              const redirectPath = '/admin/artworks'
              const redirectUrl = buildSecureRedirectUrl(
                redirectPath,
                origin,
                forwardedHost
              )

              return NextResponse.redirect(redirectUrl)
            }
          }
        } catch (error) {
          console.error('Error auto-creating admin role:', error)
          // Continue with normal flow if there's an error
        }
      }

      // Use secure URL builder for all redirects
      const forwardedHost = request.headers.get('x-forwarded-host')
      const redirectUrl = buildSecureRedirectUrl(next, origin, forwardedHost)

      return NextResponse.redirect(redirectUrl)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/admin?error=auth_failed`)
}
