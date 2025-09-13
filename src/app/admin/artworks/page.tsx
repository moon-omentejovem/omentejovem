'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { artworksDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ArtworkRow = Database['public']['Tables']['artworks']['Row']

export default function ArtworksPage() {
  const PAGE_SIZE = 10
  const [artworks, setArtworks] = useState<ArtworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()

  const fetchArtworks = async (targetPage = 1, status = statusFilter) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE)
      })
      if (status !== 'all') params.set('status', status)
      const response = await fetch(`/api/admin/artworks?${params.toString()}`)
      if (response.ok) {
        const { data, total } = await response.json()
        setArtworks(data)
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)))
        setPage(targetPage)
      } else {
        toast.error('Failed to load artworks')
      }
    } catch (error) {
      console.error('Error fetching artworks:', error)
      toast.error('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtworks(1, statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleEdit = (artwork: ArtworkRow) => {
    router.push(`/admin/artworks/${artwork.id}`)
  }

  const handleDuplicate = async (artwork: ArtworkRow) => {
    if (confirm(`Are you sure you want to duplicate "${artwork.title}"?`)) {
      try {
        // Create a copy without id and with modified title and slug
        const timestamp = Date.now()
        const duplicateData = {
          ...artwork,
          title: `${artwork.title} (Copy)`,
          slug: `${artwork.slug}-copy-${timestamp}`
        }

        const response = await fetch('/api/admin/artworks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(duplicateData)
        })

        if (response.ok) {
          fetchArtworks(page)
          toast.success('Artwork duplicated successfully!')
        } else {
          const error = await response.json()
          console.error('Error duplicating artwork:', error)
          toast.error(
            'Failed to duplicate artwork: ' + (error.error || 'Unknown error')
          )
        }
      } catch (error) {
        console.error('Error duplicating artwork:', error)
        toast.error('Failed to duplicate artwork')
      }
    }
  }

  const handleToggleDraft = async (artwork: ArtworkRow) => {
    const newStatus = artwork.status === 'draft' ? 'published' : 'draft'
    try {
      const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        fetchArtworks(page)
        toast.success(`Artwork marked as ${newStatus}`)
      } else {
        const error = await response.json()
        toast.error(
          'Failed to update status: ' + (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (artwork: ArtworkRow) => {
    if (!confirm(`Delete "${artwork.title}" permanently?`)) return

    try {
      const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchArtworks(page)
        toast.success('Artwork deleted')
      } else {
        const error = await response.json()
        toast.error(
          'Failed to delete artwork: ' + (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      toast.error('Failed to delete artwork')
    }
  }

  return (
    <AdminLayout>
      <AdminTable
        descriptor={artworksDescriptor}
        data={artworks}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchArtworks(p)}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s)
          fetchArtworks(1, s)
        }}
        onToggleDraft={handleToggleDraft}
        onDelete={handleDelete}
      />
    </AdminLayout>
  )
}
