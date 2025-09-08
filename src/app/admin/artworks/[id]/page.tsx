'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { artworksDescriptor } from '@/types/descriptors'
import type { UpdateArtwork } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ArtworkRow = Database['public']['Tables']['artworks']['Row']

export default function EditArtworkPage({
  params
}: {
  params: { id: string }
}) {
  const [artwork, setArtwork] = useState<ArtworkRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchArtwork()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchArtwork = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/admin/artworks/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setArtwork(data)
      } else {
        console.error('Artwork not found')
        toast.error('Artwork not found')
        router.push('/admin/artworks')
      }
    } catch (error) {
      console.error('Error fetching artwork:', error)
      toast.error('Error fetching artwork')
      router.push('/admin/artworks')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (data: UpdateArtwork) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/artworks/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Artwork updated successfully')
        router.push('/admin/artworks')
      } else {
        const error = await response.json()
        console.error('Error updating artwork:', error)
        toast.error(
          'Failed to update artwork: ' + (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      console.error('Error updating artwork:', error)
      toast.error('Failed to update artwork')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/artworks')
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading artwork...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!artwork) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Artwork not found</div>
        </div>
      </AdminLayout>
    )
  }

  // Transform the artwork data to match the form schema expectations
  const transformArtworkForForm = (artwork: ArtworkRow) => {
    return {
      ...artwork,
      is_featured: artwork.is_featured ?? false,
      is_one_of_one: artwork.is_one_of_one ?? false,
      posted_at: artwork.posted_at ?? new Date().toISOString()
    }
  }

  return (
    <AdminLayout>
      <AdminForm
        descriptor={artworksDescriptor}
        data={transformArtworkForForm(artwork)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}
