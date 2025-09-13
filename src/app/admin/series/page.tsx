'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { seriesDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type SeriesRow = Database['public']['Tables']['series']['Row'] & {
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
        onSearch={() => {}} // TODO: Implement search
        onSort={() => {}} // TODO: Implement sorting
        renderCell={renderCell}
        onLoadMore={() => fetchSeries()}
        hasMore={hasMore}
      />

      {/* Action Buttons Section */}
      {series.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {series.map((seriesItem) => (
              <div
                key={seriesItem.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {seriesItem.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {seriesItem.series_artworks?.length || 0} artworks
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleDelete(seriesItem)}
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
