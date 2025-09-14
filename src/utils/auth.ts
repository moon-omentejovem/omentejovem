/**
 * Auth utilities
 *
 * ⚠️  DEPRECATED: Logic moved to AuthService
 * ✅  Use AuthService instead
 */

import { AuthService } from '@/services/auth.service'

/**
 * @deprecated Use AuthService.signInWithMagicLink instead
 */
export const signInWithMagicLink = async (
  email: string,
  redirectPath = '/admin/artworks'
) => {
  return AuthService.signInWithMagicLink({ email, redirectPath })
}

/**
 * @deprecated Use AuthService.signInWithOAuth instead
 */
export const signInWithGoogle = async (redirectPath = '/admin/artworks') => {
  return AuthService.signInWithOAuth({ provider: 'google', redirectPath })
}

/**
 * @deprecated Use AuthService directly
 */
export const getBaseUrl = () => {
  return `${window.location.origin}`
}
