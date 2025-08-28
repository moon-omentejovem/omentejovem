'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { artworksDescriptor } from '@/types/descriptors'
import type { CreateArtwork } from '@/types/schemas'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewArtworkPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: CreateArtwork) => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        router.push('/admin/artworks')
      } else {
        const error = await response.json()
        console.error('Error creating artwork:', error)
        alert('Failed to create artwork: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating artwork:', error)
      alert('Failed to create artwork')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/artworks')
  }

  return (
    <AdminLayout>
      <AdminForm
        descriptor={artworksDescriptor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}
