import { supabase } from '@/lib/supabase'

export const getBaseUrl = () => {
  return `${window.location.origin}`
}

export const signInWithMagicLink = async (
  email: string,
  redirectPath = '/admin/artworks'
) => {
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

export const signInWithGoogle = async (
  redirectPath = '/admin/artworks'
) => {
  const baseUrl = getBaseUrl()
  const redirectTo = `${baseUrl}/auth/callback?next=${redirectPath}`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo
    }
  })

  return { error }
}
