'use client'

import { signInWithMagicLink, signInWithGoogle } from '@/utils/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Alert, Button, Card, Label, TextInput } from 'flowbite-react'
import { Suspense, useEffect, useState } from 'react'

function AdminPageContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for access denied error from middleware
    const errorParam = searchParams.get('error')
    if (
      errorParam === 'access_denied' ||
      errorParam === 'auth_failed' ||
      errorParam === 'session_failed'
    ) {
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

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await signInWithGoogle('/admin/artworks')

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
      <Card className="w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Admin Access
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Sign in with Google or receive a magic link for secure access to the
          admin panel.
        </p>

        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          isProcessing={loading}
          className="w-full mb-4"
        >
          Continue with Google
        </Button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" value="Email Address" />
            <TextInput
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <Alert color="failure">{error}</Alert>
          )}

          {message && <Alert color="success">{message}</Alert>}

          <Button
            type="submit"
            disabled={loading}
            isProcessing={loading}
            className="w-full"
          >
            Send Magic Link
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            ← Back to Website
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow w-96 border border-gray-200">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-6"></div>
              <div className="h-4 bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  )
}
