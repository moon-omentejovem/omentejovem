'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { artifactsDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

interface OperationState {
  duplicating: string | null
  deleting: string | null
}

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [operations, setOperations] = useState<OperationState>({
    duplicating: null,
    deleting: null
  })
  const router = useRouter()

  const fetchArtifacts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/artifacts')
      if (response.ok) {
        const data = await response.json()
        setArtifacts(data)
      } else {
        console.error('Failed to fetch artifacts:', response.statusText)
        toast.error('Failed to load artifacts. Please try again.')
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error)
      toast.error('Failed to load artifacts. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArtifacts()
  }, [fetchArtifacts])

  const handleEdit = (artifact: ArtifactRow) => {
    router.push(`/admin/artifacts/${artifact.id}`)
  }

  const handleDuplicate = async (artifact: ArtifactRow) => {
    if (operations.duplicating) return // Prevent multiple simultaneous operations

    try {
      setOperations((prev) => ({ ...prev, duplicating: artifact.id }))

      const duplicateData = {
        ...artifact,
        id: undefined,
        title: `${artifact.title} (Copy)`,
        created_at: undefined,
        updated_at: undefined
      }

      const response = await fetch('/api/admin/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateData)
      })

      if (response.ok) {
        await fetchArtifacts()
        toast.success('Artifact duplicated successfully!')
      } else {
        const errorData = await response.json()
        console.error('Error duplicating artifact:', errorData)
        toast.error(
          `Failed to duplicate artifact: ${errorData.error || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error duplicating artifact:', error)
      toast.error(
        error instanceof Error
          ? `Failed to duplicate artifact: ${error.message}`
          : 'Failed to duplicate artifact'
      )
    } finally {
      setOperations((prev) => ({ ...prev, duplicating: null }))
    }
  }

  const handleDelete = async (artifact: ArtifactRow) => {
    if (operations.deleting) return // Prevent multiple simultaneous operations

    const confirmDelete = confirm(
      `Are you sure you want to delete "${artifact.title}"?\n\nThis action cannot be undone.`
    )

    if (!confirmDelete) return

    try {
      setOperations((prev) => ({ ...prev, deleting: artifact.id }))

      const response = await fetch(`/api/admin/artifacts/${artifact.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchArtifacts()
        toast.success('Artifact deleted successfully!')
      } else {
        const errorData = await response.json()
        console.error('Error deleting artifact:', errorData)
        toast.error(
          `Failed to delete artifact: ${errorData.error || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error deleting artifact:', error)
      toast.error(
        error instanceof Error
          ? `Failed to delete artifact: ${error.message}`
          : 'Failed to delete artifact'
      )
    } finally {
      setOperations((prev) => ({ ...prev, deleting: null }))
    }
  }

  return (
    <AdminLayout>
      <AdminTable
        descriptor={artifactsDescriptor}
        data={artifacts}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onSearch={() => {}} // TODO: Implement search functionality
        onSort={() => {}} // TODO: Implement sort functionality
      />
    </AdminLayout>
  )
}
