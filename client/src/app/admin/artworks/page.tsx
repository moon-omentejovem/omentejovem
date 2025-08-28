'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { artworksDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ArtworkRow = Database['public']['Tables']['artworks']['Row']

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<ArtworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/artworks')
      if (response.ok) {
        const data = await response.json()
        setArtworks(data)
      }
    } catch (error) {
      console.error('Error fetching artworks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (artwork: ArtworkRow) => {
    router.push(`/admin/artworks/${artwork.id}`)
  }

  const handleDuplicate = async (artwork: ArtworkRow) => {
    try {
      // Create a copy without id and with modified title
      const duplicateData = {
        ...artwork,
        id: undefined,
        title: `${artwork.title} (Copy)`,
        slug: `${artwork.slug}-copy`,
        created_at: undefined,
        updated_at: undefined
      }

      const response = await fetch('/api/admin/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateData)
      })

      if (response.ok) {
        fetchArtworks() // Refresh the list
      }
    } catch (error) {
      console.error('Error duplicating artwork:', error)
    }
  }

  const handleDelete = async (artwork: ArtworkRow) => {
    if (confirm(`Are you sure you want to delete "${artwork.title}"?`)) {
      try {
        const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchArtworks() // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting artwork:', error)
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
      />
    </AdminLayout>
  )
}
