'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
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
  const router = useRouter()

  const fetchArtifacts = async (targetPage = 1, status = statusFilter) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE)
      })
      if (status !== 'all') params.set('status', status)
      const response = await fetch(`/api/admin/artifacts?${params.toString()}`)
      if (response.ok) {
        const { data, total } = await response.json()
        setArtifacts(data)
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)))
        setPage(targetPage)
      } else {
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
    fetchArtifacts(1, statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleEdit = (artifact: ArtifactRow) => {
    router.push(`/admin/artifacts/${artifact.id}`)
  }

  const handleDuplicate = async (artifact: ArtifactRow) => {
    if (confirm(`Are you sure you want to duplicate "${artifact.title}"?`)) {
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

  return (
    <AdminLayout>
      <AdminTable
        descriptor={artifactsDescriptor}
        data={artifacts}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onToggleDraft={handleDraft}
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
