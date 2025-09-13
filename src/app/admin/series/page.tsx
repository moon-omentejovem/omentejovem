'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { seriesDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type SeriesRow = Database['public']['Tables']['series']['Row'] & {
  status?: 'draft' | 'published'
  series_artworks?: {
    artworks: Database['public']['Tables']['artworks']['Row']
  }[]
}

export default function SeriesPage() {
  const PAGE_SIZE = 10
  const [series, setSeries] = useState<SeriesRow[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const fetchSeries = async (reset = false) => {
    try {
      setLoading(true)
      const from = reset ? 0 : series.length
      const response = await fetch(
        `/api/admin/series?from=${from}&limit=${PAGE_SIZE}`
      )
      if (response.ok) {
        const data = await response.json()
        setSeries((prev) => (reset ? data : [...prev, ...data]))
        setHasMore(data.length === PAGE_SIZE)
      } else {
        toast.error('Failed to load series')
      }
    } catch (error) {
      console.error('Error fetching series:', error)
      toast.error('Failed to load series')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSeries(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEdit = (seriesItem: SeriesRow) => {
    router.push(`/admin/series/${seriesItem.id}`)
  }

  const handleDuplicate = async (seriesItem: SeriesRow) => {
    if (confirm(`Are you sure you want to duplicate "${seriesItem.name}"?`)) {
      try {
        const timestamp = Date.now()
        const duplicateData = {
          ...seriesItem,
          name: `${seriesItem.name} (Copy)`,
          slug: `${seriesItem.slug}-copy-${timestamp}`
        }
        const response = await fetch('/api/admin/series', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(duplicateData)
        })
        if (response.ok) {
          fetchSeries(true)
          toast.success('Series duplicated successfully!')
        } else {
          const error = await response.json()
          toast.error('Failed to duplicate series: ' + (error.error || 'Unknown error'))
        }
      } catch (error) {
        toast.error('Failed to duplicate series')
      }
    }
  }

  const handleToggleDraft = async (seriesItem: SeriesRow) => {
    const newStatus = seriesItem.status === 'draft' ? 'published' : 'draft'
    try {
      const response = await fetch(`/api/admin/series/${seriesItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        fetchSeries(true)
        toast.success(`Series marked as ${newStatus}`)
      } else {
        const error = await response.json()
        toast.error('Failed to update status: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (seriesItem: SeriesRow) => {
    if (
      confirm(
        `Are you sure you want to delete "${seriesItem.name}"? This action cannot be undone.`
      )
    ) {
      try {
        const response = await fetch(`/api/admin/series/${seriesItem.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchSeries(true) // Refresh the list
          toast.success('Series deleted successfully!')
        } else {
          const error = await response.json()
          console.error('Error deleting series:', error)
          toast.error(
            'Failed to delete series: ' + (error.error || 'Unknown error')
          )
        }
      } catch (error) {
        console.error('Error deleting series:', error)
        toast.error('Failed to delete series')
      }
    }
  }

  // Custom rendering for artworks column to show count and names
  const renderCell = (
    item: SeriesRow,
    column: { key: string; label: string }
  ) => {
    if (column.key === 'artworks') {
      const artworks = item.series_artworks?.map((sa) => sa.artworks) || []
      if (artworks.length === 0) {
        return <span className="text-gray-500">No artworks</span>
      }
      return (
        <div>
          <div className="text-sm text-gray-500 mb-1">
            {artworks.length} artwork{artworks.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-400 max-w-xs truncate">
            {artworks
              .slice(0, 3)
              .map((a) => a.title)
              .join(', ')}
            {artworks.length > 3 && '...'}
          </div>
        </div>
      )
    }
    return undefined // Use default rendering
  }

  return (
    <AdminLayout>
      <AdminTable
        descriptor={seriesDescriptor}
        data={series}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        renderCell={renderCell}
        onLoadMore={() => fetchSeries()}
        hasMore={hasMore}
        onToggleDraft={handleToggleDraft}
        onDelete={handleDelete}
      />
    </AdminLayout>
  )
}
