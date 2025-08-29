'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { artifactsDescriptor } from '@/types/descriptors'
import type { CreateArtifact } from '@/types/schemas'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewArtifactPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: CreateArtifact) => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        router.push('/admin/artifacts')
      } else {
        const error = await response.json()
        console.error('Error creating artifact:', error)
        alert('Failed to create artifact: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating artifact:', error)
      alert('Failed to create artifact')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/artifacts')
  }

  return (
    <AdminLayout>
      <AdminForm
        descriptor={artifactsDescriptor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}
