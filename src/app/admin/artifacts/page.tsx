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
type ArtifactInternalPageRow =
  Database['public']['Tables']['artifact_internal_pages']['Row']

type MainArtifactListItem = ArtifactRow & {
  __kind: 'main'
  type: 'Main'
}

type InternalArtifactListItem = ArtifactInternalPageRow & {
  __kind: 'internal'
  type: 'Internal'
}

type ArtifactListItem = MainArtifactListItem | InternalArtifactListItem

export default function ArtifactsPage() {
  const PAGE_SIZE = 10
  const [artifacts, setArtifacts] = useState<ArtifactListItem[]>([])
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
        page: '1',
        limit: '1000'
      })
      if (status !== 'all') params.set('status', status)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())

      const [artifactsRes, internalRes] = await Promise.all([
        fetch(`/api/admin/artifacts?${params.toString()}`),
        fetch(`/api/admin/artifact-internal-pages?${params.toString()}`)
      ])

      if (!artifactsRes.ok || !internalRes.ok) {
        toast.error('Failed to load artifacts')
        return
      }

      const { data: artifactsData = [] } = await artifactsRes.json()
      const { data: internalData = [] } = await internalRes.json()

      const combined: ArtifactListItem[] = [
        ...artifactsData.map((item: ArtifactRow) => ({
          ...item,
          __kind: 'main' as const,
          type: 'Main' as const
        })),
        ...internalData.map((item: ArtifactInternalPageRow) => ({
          ...item,
          __kind: 'internal' as const,
          type: 'Internal' as const
        }))
      ]

      combined.sort((a, b) => {
        const aDate = a.created_at || a.updated_at || ''
        const bDate = b.created_at || b.updated_at || ''
        return (bDate || '').localeCompare(aDate || '')
      })

      const startIndex = (targetPage - 1) * PAGE_SIZE
      const endIndex = startIndex + PAGE_SIZE
      const paginated = combined.slice(startIndex, endIndex)

      setArtifacts(paginated)
      setTotalPages(Math.max(1, Math.ceil(combined.length / PAGE_SIZE)))
      setPage(targetPage)
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

  const handleEdit = (artifact: ArtifactListItem) => {
    if (artifact.__kind === 'internal') {
      router.push(`/admin/artifacts/internal/${artifact.id}`)
      return
    }
    router.push(`/admin/artifacts/${artifact.id}`)
  }

  const handleDuplicate = async (artifact: ArtifactListItem) => {
    if (artifact.__kind === 'internal') {
      const ok = await confirm({
        title: 'Duplicate internal page',
        message: `Are you sure you want to duplicate "${artifact.title}"?`
      })
      if (!ok) return

      try {
        const timestamp = Date.now()
        const duplicateData = {
          slug: `${artifact.slug}-copy-${timestamp}`,
          title: `${artifact.title} (Copy)`,
          description: artifact.description,
          image1_url: artifact.image1_url,
          image2_url: artifact.image2_url,
          image3_url: artifact.image3_url,
          image4_url: artifact.image4_url,
          status: artifact.status,
          artifact_id: (artifact as ArtifactInternalPageRow).artifact_id
        }

        const response = await fetch('/api/admin/artifact-internal-pages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(duplicateData)
        })

        if (response.ok) {
          await fetchArtifacts(page, statusFilter, search)
          toast.success('Artifact internal page duplicated successfully!')
        } else {
          const error = await response.json()
          console.error('Error duplicating artifact internal page:', error)
          toast.error(
            'Failed to duplicate internal page: ' +
              (error.error || 'Unknown error')
          )
        }
      } catch (error) {
        console.error('Error duplicating artifact internal page:', error)
        toast.error('Failed to duplicate internal page')
      }
      return
    }
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

  const handleToggleDraft = async (artifact: ArtifactListItem) => {
    if (artifact.__kind === 'internal') {
      const newStatus = artifact.status === 'draft' ? 'published' : 'draft'
      try {
        const response = await fetch(
          `/api/admin/artifact-internal-pages/${artifact.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
          }
        )

        if (response.ok) {
          await fetchArtifacts(page, statusFilter, search)
          toast.success(`Artifact internal page marked as ${newStatus}`)
        } else {
          const error = await response.json()
          console.error(
            'Error updating artifact internal page status:',
            error
          )
          toast.error(
            'Failed to update internal page status: ' +
              (error.error || 'Unknown error')
          )
        }
      } catch (error) {
        console.error('Error updating artifact internal page status:', error)
        toast.error('Failed to update internal page status')
      }
      return
    }
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

  const handleDelete = async (artifact: ArtifactListItem) => {
    if (artifact.__kind === 'internal') {
      const ok = await confirm({
        title: 'Delete artifact internal page',
        message: `Delete "${artifact.title}" permanently?`
      })
      if (!ok) return

      try {
        const response = await fetch(
          `/api/admin/artifact-internal-pages/${artifact.id}`,
          {
            method: 'DELETE'
          }
        )

        if (response.ok) {
          await fetchArtifacts(page, statusFilter, search)
          toast.success('Artifact internal page deleted successfully!')
        } else {
          const error = await response.json()
          console.error('Error deleting artifact internal page:', error)
          toast.error(
            'Failed to delete internal page: ' +
              (error.error || 'Unknown error')
          )
        }
      } catch (error) {
        console.error('Error deleting artifact internal page:', error)
        toast.error('Failed to delete internal page')
      }
      return
    }
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
