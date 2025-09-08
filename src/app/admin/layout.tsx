'use client'

import { Flowbite } from 'flowbite-react'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <Flowbite>{children}</Flowbite>
}
