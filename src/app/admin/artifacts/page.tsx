'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { artifactsDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

interface OperationState {
  duplicating: string | null
  updatingStatus: string | null
}

export default function ArtifactsPage() {
  const PAGE_SIZE = 10
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [operations, setOperations] = useState<OperationState>({
    duplicating: null,
    updatingStatus: null
  })
  const router = useRouter()

  const fetchArtifacts = async (reset = false) => {
    try {
      setLoading(true)
      const from = reset ? 0 : artifacts.length
      const response = await fetch(
        `/api/admin/artifacts?from=${from}&limit=${PAGE_SIZE}`
      )
      if (response.ok) {
        const data = await response.json()
        setArtifacts((prev) => (reset ? data : [...prev, ...data]))
        setHasMore(data.length === PAGE_SIZE)
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
  }

  useEffect(() => {
    fetchArtifacts(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        await fetchArtifacts(true)
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

  const handleDraft = async (artifact: ArtifactRow) => {
    if (operations.updatingStatus) return // Prevent multiple simultaneous operations

    const currentStatus = artifact.status || 'published'
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft'

    try {
      setOperations((prev) => ({ ...prev, updatingStatus: artifact.id }))

      const response = await fetch(`/api/admin/artifacts/${artifact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchArtifacts(true)
        toast.success(`Artifact marked as ${newStatus}`)
      } else {
        const errorData = await response.json()
        console.error('Error updating artifact status:', errorData)
        toast.error(
          `Failed to update status: ${errorData.error || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error updating artifact status:', error)
      toast.error(
        error instanceof Error
          ? `Failed to update status: ${error.message}`
          : 'Failed to update status'
      )
    } finally {
      setOperations((prev) => ({ ...prev, updatingStatus: null }))
    }
  }

  const handleDelete = async (artifact: ArtifactRow) => {
    if (
      confirm(
        `Are you sure you want to permanently delete "${artifact.title}"? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/artifacts/${artifact.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          fetchArtifacts(true)
          toast.success('Artifact deleted successfully')
        } else {
          const error = await response.json()
          toast.error(
            'Failed to delete artifact: ' + (error.error || 'Unknown error')
          )
        }
      } catch (error) {
        toast.error('Failed to delete artifact')
      }
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
        onToggleDraft={handleDraft}
        onSearch={() => {}} // TODO: Implement search functionality
        onSort={() => {}} // TODO: Implement sort functionality
        onLoadMore={() => fetchArtifacts()}
        hasMore={hasMore}
      />

      {/* Action Buttons Section */}
      {artifacts.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {artifact.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Status:{' '}
                    <span
                      className={`font-medium ${artifact.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}
                    >
                      {artifact.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleDraft(artifact)}
                    className={`px-3 py-1 text-sm rounded ${
                      artifact.status === 'draft'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                    title={
                      artifact.status === 'draft' ? 'Publish' : 'Mark as Draft'
                    }
                  >
                    {artifact.status === 'draft' ? 'Publish' : 'Draft'}
                  </button>
                  <button
                    onClick={() => handleDelete(artifact)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded"
                    title="Delete permanently"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
