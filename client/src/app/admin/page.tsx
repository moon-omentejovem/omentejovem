'use client'

import { signInWithMagicLink } from '@/utils/auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function AdminPageContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for access denied error from middleware
    const errorParam = searchParams.get('error')
    if (errorParam === 'access_denied') {
      setError(
        'Access denied. You need admin permissions to access the admin panel.'
      )
    } else if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await signInWithMagicLink(email, '/admin/artworks')

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for the login link!')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
        <p className="text-neutral-400 text-sm text-center mb-6">
          Enter your email to receive a magic link for secure access to the
          admin panel.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-white bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-2 rounded-md text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all duration-200 ease-in-out"
          >
            {loading ? 'Sending Magic Link...' : 'Send Magic Link'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
          <Link
            href="/"
            className="text-neutral-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
          <div className="bg-neutral-900 p-8 rounded-lg shadow-xl w-96">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-700 rounded mb-6"></div>
              <div className="h-4 bg-neutral-700 rounded mb-6"></div>
              <div className="h-12 bg-neutral-700 rounded mb-4"></div>
              <div className="h-12 bg-neutral-700 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  )
}
