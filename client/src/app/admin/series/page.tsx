'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { seriesDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type SeriesRow = Database['public']['Tables']['series']['Row'] & {
  series_artworks?: {
    artworks: Database['public']['Tables']['artworks']['Row']
  }[]
}

export default function SeriesPage() {
  const [series, setSeries] = useState<SeriesRow[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSeries()
  }, [])

  const fetchSeries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/series')
      if (response.ok) {
        const data = await response.json()
        setSeries(data)
      }
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (seriesItem: SeriesRow) => {
    router.push(`/admin/series/${seriesItem.id}`)
  }

  const handleDelete = async (seriesItem: SeriesRow) => {
    if (confirm(`Are you sure you want to delete "${seriesItem.name}"?`)) {
      try {
        const response = await fetch(`/api/admin/series/${seriesItem.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchSeries() // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting series:', error)
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
        return <span className="text-neutral-500">No artworks</span>
      }
      return (
        <div>
          <div className="text-sm text-neutral-400 mb-1">
            {artworks.length} artwork{artworks.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-neutral-500 max-w-xs truncate">
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
        onDelete={handleDelete}
        onSearch={() => {}} // TODO: Implement search
        onSort={() => {}} // TODO: Implement sorting
        renderCell={renderCell}
      />
    </AdminLayout>
  )
}
