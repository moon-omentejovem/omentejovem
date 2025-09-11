'use client'

import { Flowbite } from 'flowbite-react'
import { usePathname } from 'next/navigation'
import ClientAdminProtection from '@/components/ClientAdminProtection'

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
      <ClientAdminProtection>
        {children}
      </ClientAdminProtection>
    </Flowbite>
  )
}
