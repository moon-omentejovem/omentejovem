'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { useConfirm } from '@/hooks/useConfirm'
import { useCreateSeries, useDeleteSeries, useSeries } from '@/hooks/useSeries'
import { seriesDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type SeriesRow = Database['public']['Tables']['series']['Row'] & {
  status?: 'draft' | 'published'
  series_artworks?: {
    artworks: Database['public']['Tables']['artworks']['Row']
  }[]
}

export default function SeriesPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const confirm = useConfirm()

  // Use hooks instead of manual fetch
  const { data: series = [], isLoading: loading, error } = useSeries()

  const deleteSeriesMutation = useDeleteSeries()
  const createSeriesMutation = useCreateSeries()

  const handleEdit = (series: SeriesRow) => {
    router.push(`/admin/series/${series.id}`)
  }

  const handleDuplicate = async (series: SeriesRow) => {
    const ok = await confirm({
      title: 'Duplicate series',
      message: `Are you sure you want to duplicate "${series.name}"?`
    })
    if (!ok) return

    try {
      const duplicateData = {
        ...series,
        id: undefined,
        name: `${series.name} (Copy)`,
        slug: `${series.slug}-copy`,
        created_at: undefined,
        updated_at: undefined
      }

      await createSeriesMutation.mutateAsync(duplicateData)
      toast.success('Series duplicated successfully!')
    } catch (error: any) {
      console.error('Error duplicating series:', error)
      toast.error(
        `Failed to duplicate series: ${error?.message || 'Unknown error'}`
      )
    }
  }

  const handleDelete = async (series: SeriesRow) => {
    const ok = await confirm({
      title: 'Delete series',
      message: `Delete "${series.name}" permanently?`
    })
    if (!ok) return

    try {
      await deleteSeriesMutation.mutateAsync(series.id)
      toast.success('Series deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting series:', error)
      toast.error(
        `Failed to delete series: ${error?.message || 'Unknown error'}`
      )
    }
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-red-500">
            Error loading series. Please try again.
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Ensure series_artworks.artworks is non-null and matches the expected type
  const normalizedSeries = series.map((s) => ({
    ...s,
    series_artworks: s.series_artworks
      ? s.series_artworks
          .filter((sa) => sa.artworks && typeof sa.artworks === 'object')
          .map((sa) => ({
            artworks:
              sa.artworks as Database['public']['Tables']['artworks']['Row']
          }))
      : []
  }))

  return (
    <AdminLayout>
      <div className="p-6">
        <AdminTable
          descriptor={seriesDescriptor}
          data={normalizedSeries}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </AdminLayout>
  )
}
