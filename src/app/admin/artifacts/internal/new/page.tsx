'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { artifactInternalPagesDescriptor } from '@/types/descriptors'
import type { CreateArtifactInternalPage } from '@/types/schemas'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function NewArtifactInternalPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: CreateArtifactInternalPage) => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/artifact-internal-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Artifact internal page created successfully')
        router.push('/admin/artifacts')
      } else {
        const error = await response.json()
        console.error('Error creating artifact internal page:', error)
        toast.error(
          'Failed to create internal page: ' + (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      console.error('Error creating artifact internal page:', error)
      toast.error('Failed to create internal page')
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
        descriptor={artifactInternalPagesDescriptor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}

