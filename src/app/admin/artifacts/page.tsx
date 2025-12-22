'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { useConfirm } from '@/hooks/useConfirm'
import { artifactsDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

export default function ArtifactsPage() {
  const PAGE_SIZE = 10
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const confirm = useConfirm()

  const fetchArtifacts = async (
    targetPage = 1,
    status = statusFilter,
    searchQuery = search
  ) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE)
      })
      if (status !== 'all') params.set('status', status)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())

      const response = await fetch(`/api/admin/artifacts?${params.toString()}`)

      if (response.ok) {
        const { data, total } = await response.json()
        setArtifacts(data)
        setTotalPages(Math.max(1, Math.ceil((total || 0) / PAGE_SIZE)))
        setPage(targetPage)
      } else {
        toast.error('Failed to load artifacts')
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error)
      toast.error('Failed to load artifacts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtifacts(1, statusFilter, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await fetchArtifacts(page, statusFilter, search)
        toast.success('Artifact duplicated successfully!')
      } else {
        const error = await response.json()
        console.error('Error duplicating artifact:', error)
        toast.error(
          'Failed to duplicate artifact: ' + (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      console.error('Error duplicating artifact:', error)
      toast.error('Failed to duplicate artifact')
    }
  }

  const handleToggleDraft = async (artifact: ArtifactRow) => {
    const newStatus = artifact.status === 'draft' ? 'published' : 'draft'
    try {
      const response = await fetch(`/api/admin/artifacts/${artifact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchArtifacts(page, statusFilter, search)
        toast.success(`Artifact marked as ${newStatus}`)
      } else {
        const error = await response.json()
        console.error('Error updating artifact status:', error)
        toast.error(
          'Failed to update status: ' + (error.error || 'Unknown error')
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
        await fetchArtifacts(page, statusFilter, search)
        toast.success('Artifact deleted successfully!')
      } else {
        const error = await response.json()
        console.error('Error deleting artifact:', error)
        toast.error(
          'Failed to delete artifact: ' + (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      console.error('Error deleting artifact:', error)
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
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchArtifacts(p, statusFilter, search)}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s)
          fetchArtifacts(1, s, search)
        }}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          fetchArtifacts(1, statusFilter, value)
        }}
        onToggleDraft={handleToggleDraft}
        onDelete={handleDelete}
      />
    </AdminLayout>
  )
}
