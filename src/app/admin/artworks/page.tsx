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
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const fetchArtworks = async (reset = false) => {
    try {
      setLoading(true)
      const from = reset ? 0 : artworks.length
      const response = await fetch(
        `/api/admin/artworks?from=${from}&limit=${PAGE_SIZE}`
      )
      if (response.ok) {
        const data = await response.json()
        setArtworks((prev) => (reset ? data : [...prev, ...data]))
        setHasMore(data.length === PAGE_SIZE)
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
    fetchArtworks(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          fetchArtworks(true) // Refresh the list
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
        fetchArtworks(true)
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

  return (
    <AdminLayout>
      <AdminTable
        descriptor={artworksDescriptor}
        data={artworks}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onSearch={() => {}} // TODO: Implement search
        onSort={() => {}} // TODO: Implement sorting
        onLoadMore={() => fetchArtworks()}
        hasMore={hasMore}
        onToggleDraft={handleToggleDraft}
      />
    </AdminLayout>
  )
}
