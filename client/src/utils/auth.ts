const getBaseUrl = () => {
  // Sempre usar variável de ambiente se disponível
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Fallback para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  // Se não tem nada configurado, força erro
  throw new Error('NEXT_PUBLIC_BASE_URL must be set')
}

export const signInWithMagicLink = async (
  email: string,
  redirectPath = '/admin/artworks'
) => {
  const { createClient } = await import('@/utils/supabase/client')
  const supabase = createClient()

  const baseUrl = getBaseUrl()
  const redirectTo = `${baseUrl}/auth/callback?next=${redirectPath}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  })

  return { error }
}
