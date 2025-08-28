'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { artifactsDescriptor } from '@/types/descriptors'
import type { UpdateArtifact } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

export default function EditArtifactPage({
  params
}: {
  params: { id: string }
}) {
  const [artifact, setArtifact] = useState<ArtifactRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        setFetchLoading(true)
        const response = await fetch(`/api/admin/artifacts/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setArtifact(data)
        } else {
          console.error('Artifact not found')
          router.push('/admin/artifacts')
        }
      } catch (error) {
        console.error('Error fetching artifact:', error)
        router.push('/admin/artifacts')
      } finally {
        setFetchLoading(false)
      }
    }

    if (params.id) {
      fetchArtifact()
    }
  }, [params.id, router])

  const handleSubmit = async (data: UpdateArtifact) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/artifacts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        router.push('/admin/artifacts')
      } else {
        const error = await response.json()
        console.error('Error updating artifact:', error)
        alert('Failed to update artifact: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating artifact:', error)
      alert('Failed to update artifact')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/artifacts')
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-400">Loading artifact...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!artifact) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Artifact not found</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <AdminForm
        descriptor={artifactsDescriptor}
        data={artifact}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}
