'use client'

import ClientAdminProtection from '@/components/ClientAdminProtection'
import { Flowbite } from 'flowbite-react'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Don't apply protection on the root /admin page (login page)
  const isLoginPage = pathname === '/admin'

  if (isLoginPage) {
    return <Flowbite>{children}</Flowbite>
  }

  // Apply protection for all other admin routes
  return (
    <Flowbite>
      <ClientAdminProtection>{children}</ClientAdminProtection>
    </Flowbite>
  )
}
