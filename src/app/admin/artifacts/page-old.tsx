'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { artifactsDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'
import { useArtifactsPaginated, useDeleteArtifact } from '@/hooks/useArtifacts'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

export default function ArtifactsPage() {
  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const confirm = useConfirm()

  // Use hook instead of manual fetch
  const { 
    data: paginatedData, 
    isLoading: loading, 
    error 
  } = useArtifactsPaginated(page, PAGE_SIZE)

  const deleteArtifactMutation = useDeleteArtifact()

  const artifacts = paginatedData?.data || []
  const totalPages = paginatedData?.totalPages || 1
  }, [statusFilter])

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

      const response = await fetch('/api/admin/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateData)
      })

      if (response.ok) {
        fetchArtifacts(page)
        toast.success('Artifact duplicated successfully!')
      } else {
        const errorData = await response.json()
        toast.error(
          `Failed to duplicate artifact: ${errorData.error || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error duplicating artifact:', error)
      toast.error('Failed to duplicate artifact')
    }
  }

  const handleDraft = async (artifact: ArtifactRow) => {
    const currentStatus = artifact.status || 'published'
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft'

    try {
      const response = await fetch(`/api/admin/artifacts/${artifact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchArtifacts(page)
        toast.success(`Artifact marked as ${newStatus}`)
      } else {
        const errorData = await response.json()
        toast.error(
          `Failed to update status: ${errorData.error || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error updating artifact status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (artifact: ArtifactRow) => {
    const ok = await confirm({
      title: 'Delete artifact',
      message: `Delete "${artifact.title}" permanently?`
    })
    if (!ok) return

    try {
      const response = await fetch(`/api/admin/artifacts/${artifact.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchArtifacts(page)
        toast.success('Artifact deleted')
      } else {
        const errorData = await response.json()
        toast.error(
          `Failed to delete artifact: ${errorData.error || 'Unknown error'}`
        )
      }
    } catch (error) {
      toast.error('Failed to delete artifact')
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
        onDelete={handleDelete}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchArtifacts(p)}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s)
          fetchArtifacts(1, s)
        }}
      />
    </AdminLayout>
  )
}
