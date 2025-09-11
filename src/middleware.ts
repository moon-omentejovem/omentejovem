import { supabaseConfig } from '@/lib/supabase/config'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '../utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for auth callback routes to avoid PKCE conflicts
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // Só exige autenticação para rotas do admin (exceto a página de login /admin)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Se é a página de login (/admin), permite acesso sem autenticação
    if (request.nextUrl.pathname === '/admin') {
      // Atualiza sessão e cria client para verificar se usuário já está logado
      let supabaseResponse = await updateSession(request)
      const supabase = createServerClient(
        supabaseConfig.url,
        supabaseConfig.anonKey,
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

      // Busca usuário
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      // Se já está logado e é admin, redireciona para dashboard
      if (user) {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()

          if (!roleError && roleData?.role === 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/artworks'
            return NextResponse.redirect(url)
          }
        } catch (error) {
          // Ignora erro e permite acesso à página de login
        }
      }

      return supabaseResponse
    }

    // Para outras rotas admin (não /admin), exige autenticação
    let supabaseResponse = await updateSession(request)
    const supabase = createServerClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
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

    // Busca usuário
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Auth error in middleware:', error.message)
    }

    // Se não autenticado, redireciona para login
    if (!user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Verifica role de admin
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

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

    return supabaseResponse
  }

  // Para rotas públicas, não faz nada de sessão
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth/callback (authentication callbacks)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
