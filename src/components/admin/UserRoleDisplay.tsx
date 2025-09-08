'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface UserRoleInfo {
  role: string
  isAdmin: boolean
  user: {
    id: string
    email: string
  }
}

export default function UserRoleDisplay() {
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRoleInfo()
  }, [])

  const fetchRoleInfo = async () => {
    try {
      const response = await fetch('/api/admin/user-role')
      if (response.ok) {
        const data = await response.json()
        setRoleInfo(data)
      }
    } catch (error) {
      console.error('Error fetching role info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-xs text-gray-500">Loading...</div>
  }

  if (!roleInfo) {
    return <div className="text-xs text-red-600">No role info available</div>
  }

  return (
    <div className="text-xs text-gray-500 space-y-1">
      <div>
        Logged in as: <span className="text-gray-900">{roleInfo.user.email}</span>
      </div>
      <div>
        Role:{' '}
        <span
          className={`font-semibold ${roleInfo.isAdmin ? 'text-green-600' : 'text-yellow-600'}`}
        >
          {roleInfo.role}
        </span>
      </div>
    </div>
  )
}
