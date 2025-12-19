'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface ClientAdminProtectionProps {
  children: ReactNode
}

export default function ClientAdminProtection({
  children
}: ClientAdminProtectionProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAdminStatus = async () => {
    try {
      // Get current user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (!user || userError) {
        router.push('/admin')
        return
      }

      const { data: isAdminData, error: isAdminError } =
        await supabase.rpc('is_admin')

      if (!isAdminError && typeof isAdminData === 'boolean') {
        if (!isAdminData) {
          router.push('/admin?error=access_denied')
          return
        }

        setIsAdmin(true)
        return
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (roleError || roleData?.role !== 'admin') {
        router.push('/admin?error=access_denied')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      router.push('/admin?error=access_denied')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
