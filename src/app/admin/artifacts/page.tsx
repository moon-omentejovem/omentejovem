'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { artifactsDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'
import { useArtifactsPaginated, useDeleteArtifact, useCreateArtifact } from '@/hooks/useArtifacts'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

export default function ArtifactsPage() {
  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const confirm = useConfirm()

  // Use hooks instead of manual fetch
  const { 
    data: paginatedData, 
    isLoading: loading, 
    error 
  } = useArtifactsPaginated(page, PAGE_SIZE)

  const deleteArtifactMutation = useDeleteArtifact()
  const createArtifactMutation = useCreateArtifact()

  const artifacts = paginatedData?.data || []
  const totalPages = paginatedData?.totalPages || 1

  const handleEdit = (artifact: ArtifactRow) => {
    router.push(`/admin/artifacts/${artifact.id}`)
  }

  const handleDuplicate = async (artifact: ArtifactRow) => {
    const ok = await confirm({
      title: 'Duplicate artifact',
      message: `Are you sure you want to duplicate "${artifact.title}"?`
    })
    if (!ok) return

    try {
      const duplicateData = {
        ...artifact,
        id: undefined,
        title: `${artifact.title} (Copy)`,
        created_at: undefined,
        updated_at: undefined
      }

      await createArtifactMutation.mutateAsync(duplicateData)
      toast.success('Artifact duplicated successfully!')
    } catch (error: any) {
      console.error('Error duplicating artifact:', error)
      toast.error(`Failed to duplicate artifact: ${error?.message || 'Unknown error'}`)
    }
  }

  const handleDelete = async (artifact: ArtifactRow) => {
    const ok = await confirm({
      title: 'Delete artifact',
      message: `Delete "${artifact.title}" permanently?`
    })
    if (!ok) return

    try {
      await deleteArtifactMutation.mutateAsync(artifact.id)
      toast.success('Artifact deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting artifact:', error)
      toast.error(`Failed to delete artifact: ${error?.message || 'Unknown error'}`)
    }
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-red-500">
            Error loading artifacts. Please try again.
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <AdminTable
          descriptor={artifactsDescriptor}
          data={artifacts}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </AdminLayout>
  )
}