'use client'

import ClientAdminProtection from '@/components/ClientAdminProtection'
import { Flowbite } from 'flowbite-react'
import { usePathname } from 'next/navigation'
import { ConfirmProvider } from '@/hooks/useConfirm'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Don't apply protection on the root /admin page (login page)
  const isLoginPage = pathname === '/admin'

  return (
    <Flowbite>
      <ConfirmProvider>
        {isLoginPage ? (
          children
        ) : (
          <ClientAdminProtection>{children}</ClientAdminProtection>
        )}
      </ConfirmProvider>
    </Flowbite>
  )
}
