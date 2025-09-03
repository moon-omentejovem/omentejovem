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
    try {
      // Create a copy without id and with modified title and slug
      const timestamp = Date.now()
      const duplicateData = {
        ...artwork,
        id: undefined,
        title: `${artwork.title} (Copy)`,
        slug: `${artwork.slug}-copy-${timestamp}`,
        created_at: undefined,
        updated_at: undefined,
        posted_at: new Date().toISOString()
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

  const handleDelete = async (artwork: ArtworkRow) => {
    if (
      confirm(
        `Are you sure you want to delete "${artwork.title}"? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchArtworks(true) // Refresh the list
          toast.success('Artwork deleted successfully!')
        } else {
          const error = await response.json()
          console.error('Error deleting artwork:', error)
          toast.error(
            'Failed to delete artwork: ' + (error.error || 'Unknown error')
          )
        }
      } catch (error) {
        console.error('Error deleting artwork:', error)
        toast.error('Failed to delete artwork')
      }
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
        onDelete={handleDelete}
        onSearch={() => {}} // TODO: Implement search
        onSort={() => {}} // TODO: Implement sorting
        onLoadMore={() => fetchArtworks()}
        hasMore={hasMore}
      />
    </AdminLayout>
  )
}
