'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { getBaseUrl } from '@/utils/auth'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  role: string
  created_at: string
}

interface UserStats {
  users: User[]
  total: number
  admins: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
        setStats(data)
      } else {
        toast.error(data.error || 'Failed to load users')
      }
    } catch (error) {
      toast.error('Failed to load users')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setInviting(true)

    const baseUrl = getBaseUrl()
    try {
      // First, send magic link to the user
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: inviteEmail.trim(),
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?next=/admin/setup`
        }
      })

      if (authError) {
        toast.error(`Failed to send invite: ${authError.message}`)
        return
      }

      // Then, handle the admin role creation/update
      const response = await fetch('/api/admin/invite-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail.trim() })
      })

      const result = await response.json()

      if (response.ok) {
        if (result.alreadyAdmin) {
          toast.success(`Magic link sent! ${inviteEmail} is already an admin.`)
        } else if (result.pending) {
          toast.success(
            `Invitation sent! ${inviteEmail} will become admin after first login.`
          )
        } else {
          toast.success(result.message)
        }

        setInviteEmail('')
        setShowInviteForm(false)
        loadUsers() // Refresh the list
      } else {
        toast.error(result.error || 'Failed to process invitation')
      }
    } catch (error) {
      toast.error('Failed to send invitation')
      console.error('Error inviting user:', error)
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${userEmail} from the CMS? They will lose admin access.`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('User removed from CMS successfully')
        loadUsers() // Refresh the list
      } else {
        toast.error(result.error || 'Failed to remove user')
      }
    } catch (error) {
      toast.error('Failed to remove user')
      console.error('Error removing user:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-800 rounded w-48 mb-6"></div>
          <div className="bg-neutral-900 rounded-lg p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-neutral-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-neutral-400 mt-2">
              Manage admin access and user roles
            </p>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Invite New Admin
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-neutral-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-400">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-neutral-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-400">Admins</h3>
              <p className="text-3xl font-bold text-green-400">
                {stats.admins}
              </p>
            </div>
            <div className="bg-neutral-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-400">
                Regular Users
              </h3>
              <p className="text-3xl font-bold text-neutral-400">0</p>
              <p className="text-sm text-neutral-500 mt-1">
                All CMS users are admins
              </p>
            </div>
          </div>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-neutral-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Invite New Admin</h2>
            <form onSubmit={handleInviteUser} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={inviting}
                />
              </div>
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                {inviting ? 'Inviting...' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false)
                  setInviteEmail('')
                }}
                className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </form>
            <p className="text-sm text-neutral-400 mt-2">
              A magic link will be sent to the user, and they will automatically
              have admin access to the CMS.
            </p>
          </div>
        )}

        {/* Users List */}
        <div className="bg-neutral-900 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800">
            <h2 className="text-xl font-semibold">CMS Administrators</h2>
          </div>
          <div className="divide-y divide-neutral-800">
            {users.length === 0 ? (
              <div className="px-6 py-8 text-center text-neutral-400">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-neutral-400">
                      Joined{' '}
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                      Admin
                    </div>
                    <button
                      onClick={() => handleRemoveUser(user.id, user.email)}
                      className="px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
