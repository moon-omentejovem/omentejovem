'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { seriesDescriptor } from '@/types/descriptors'
import type { UpdateSeries } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type SeriesRow = Database['public']['Tables']['series']['Row'] & {
  series_artworks?: {
    artworks: Database['public']['Tables']['artworks']['Row']
  }[]
}

export default function EditSeriesPage({ params }: { params: { id: string } }) {
  const [series, setSeries] = useState<SeriesRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setFetchLoading(true)
        const response = await fetch(`/api/admin/series/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSeries(data)
        } else {
          console.error('Series not found')
          toast.error('Series not found')
          router.push('/admin/series')
        }
      } catch (error) {
        console.error('Error fetching series:', error)
        toast.error('Error fetching series')
        router.push('/admin/series')
      } finally {
        setFetchLoading(false)
      }
    }

    if (params.id) {
      fetchSeries()
    }
  }, [params.id, router])

  const handleSubmit = async (data: UpdateSeries) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/series/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Series updated successfully')
        router.push('/admin/series')
      } else {
        const error = await response.json()
        console.error('Error updating series:', error)
        toast.error('Failed to update series: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating series:', error)
      toast.error('Failed to update series')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/series')
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading series...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!series) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Series not found</div>
        </div>
      </AdminLayout>
    )
  }

  // Transform the series data to match the form schema expectations
  const transformSeriesForForm = (series: SeriesRow) => {
    return {
      ...series,
      artworks: series.series_artworks?.map((sa) => sa.artworks.id) || []
    }
  }

  return (
    <AdminLayout>
      <AdminForm
        descriptor={seriesDescriptor}
        data={transformSeriesForForm(series)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}
