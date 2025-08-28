'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SetupAdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roleStatus, setRoleStatus] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function checkUser() {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin')
        return
      }

      setUser(user)

      // Check current role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setRoleStatus({ role: roleData, error: roleError })
    } catch (err) {
      setError('Failed to check user status')
    } finally {
      setLoading(false)
    }
  }

  async function createAdminRole() {
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        })
        .select()
        .single()

      if (error) {
        setError(`Failed to create admin role: ${error.message}`)
      } else {
        setSuccess('Admin role created successfully! Redirecting...')
        setTimeout(() => {
          router.push('/admin/artworks')
        }, 2000)
      }
    } catch (err) {
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Setup</h1>

        {user && (
          <div className="mb-6 p-4 bg-neutral-800 rounded">
            <h3 className="font-semibold mb-2">Current User</h3>
            <p className="text-sm text-neutral-400">Email: {user.email}</p>
            <p className="text-sm text-neutral-400">ID: {user.id}</p>
          </div>
        )}

        {roleStatus && (
          <div className="mb-6 p-4 bg-neutral-800 rounded">
            <h3 className="font-semibold mb-2">Role Status</h3>
            {roleStatus.role ? (
              <p className="text-green-400">✅ Role: {roleStatus.role.role}</p>
            ) : (
              <p className="text-yellow-400">⚠️ No admin role found</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-2 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-2 rounded-md text-sm mb-4">
            {success}
          </div>
        )}

        {roleStatus && !roleStatus.role && (
          <button
            onClick={createAdminRole}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Creating Admin Role...' : 'Grant Admin Access'}
          </button>
        )}

        {roleStatus && roleStatus.role && (
          <button
            onClick={() => router.push('/admin/artworks')}
            className="w-full bg-green-600 text-white py-2.5 px-4 rounded-md hover:bg-green-700 mb-4"
          >
            Go to Admin Dashboard
          </button>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push('/admin')}
            className="text-neutral-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}
