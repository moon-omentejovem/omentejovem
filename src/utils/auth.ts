export const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  if (process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  throw new Error(
    'Unable to determine base URL. Check VERCEL_URL environment variable.'
  )
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
