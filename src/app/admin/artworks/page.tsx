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

  const handleDelete = async (artwork: ArtworkRow) => {
    if (
      confirm(
        `Are you sure you want to permanently delete "${artwork.title}"? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          fetchArtworks(true)
          toast.success('Artwork deleted successfully')
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

      {/* Action Buttons Section */}
      {artworks.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {artwork.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Status:{' '}
                    <span
                      className={`font-medium ${artwork.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}
                    >
                      {artwork.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleDraft(artwork)}
                    className={`px-3 py-1 text-sm rounded ${
                      artwork.status === 'draft'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                    title={
                      artwork.status === 'draft' ? 'Publish' : 'Mark as Draft'
                    }
                  >
                    {artwork.status === 'draft' ? 'Publish' : 'Draft'}
                  </button>
                  <button
                    onClick={() => handleDelete(artwork)}
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
