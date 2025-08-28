import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface AdminProtectionProps {
  children: ReactNode
}

export default async function AdminProtection({
  children
}: AdminProtectionProps) {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  // If no user, redirect to admin login
  if (!user || userError) {
    redirect('/admin')
  }

  try {
    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // If there's an error or user is not admin, redirect with error
    if (roleError || roleData?.role !== 'admin') {
      redirect('/admin?error=access_denied')
    }

    // User is admin, render children
    return <>{children}</>
  } catch (error) {
    redirect('/admin?error=access_denied')
  }
}
