/**
 * Auth Service - Authentication management
 *
 * Centralized authentication service following backend-oriented pattern.
 * Handles authentication, session management, and user roles.
 */

import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  roles?: string[]
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export interface LoginOptions {
  email: string
  redirectPath?: string
}

export interface OAuthOptions {
  provider: 'google'
  redirectPath?: string
}

/**
 * Authentication Service
 */
export class AuthService {
  private static supabase = createClient()

  /**
   * Get base URL for redirects
   */
  private static getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }

  /**
   * Build redirect URL with callback
   */
  private static buildRedirectUrl(redirectPath = '/admin/artworks'): string {
    const baseUrl = this.getBaseUrl()
    return `${baseUrl}/auth/callback?next=${redirectPath}`
  }

  /**
   * Sign in with magic link
   */
  static async signInWithMagicLink(options: LoginOptions) {
    try {
      const redirectTo = this.buildRedirectUrl(options.redirectPath)

      const { error } = await this.supabase.auth.signInWithOtp({
        email: options.email,
        options: {
          emailRedirectTo: redirectTo
        }
      })

      return { error }
    } catch (error) {
      console.error('Magic link sign in error:', error)
      return {
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(options: OAuthOptions) {
    try {
      const redirectTo = this.buildRedirectUrl(options.redirectPath)

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: options.provider,
        options: {
          redirectTo
        }
      })

      return { error }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      return {
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Sign out
   */
  static async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error
      } = await this.supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      // Get user roles
      const roles = await this.getUserRoles(user.id)

      return {
        ...user,
        roles
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Get user roles
   */
  static async getUserRoles(userId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)

      if (error) {
        console.error('Get user roles error:', error)
        return []
      }

      return data?.map((item) => item.role) || []
    } catch (error) {
      console.error('Get user roles error:', error)
      return []
    }
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(userId?: string): Promise<boolean> {
    try {
      if (!userId) {
        const user = await this.getCurrentUser()
        if (!user) return false
        userId = user.id
      }

      const roles = await this.getUserRoles(userId)
      return roles.includes('admin')
    } catch (error) {
      console.error('Check admin error:', error)
      return false
    }
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const roles = await this.getUserRoles(session.user.id)
        callback({
          ...session.user,
          roles
        })
      } else {
        callback(null)
      }
    })
  }

  /**
   * Get current session
   */
  static async getSession() {
    try {
      const {
        data: { session },
        error
      } = await this.supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      console.error('Get session error:', error)
      return {
        session: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Refresh session
   */
  static async refreshSession() {
    try {
      const {
        data: { session },
        error
      } = await this.supabase.auth.refreshSession()
      return { session, error }
    } catch (error) {
      console.error('Refresh session error:', error)
      return {
        session: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }
}
