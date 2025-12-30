'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import type { ListColumn } from '@/types/descriptors'
import { artworksDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, TextInput } from 'flowbite-react'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'

type ArtworkRow = Database['public']['Tables']['artworks']['Row']

export default function ArtworksPage() {
  const PAGE_SIZE = 10
  const [artworks, setArtworks] = useState<ArtworkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const confirm = useConfirm()
  const [savingDisplayOrderId, setSavingDisplayOrderId] = useState<string | null>(
    null
  )

  const handleDisplayOrderChange = (id: string, value: string) => {
    const parsedValue =
      value.trim() === '' ? null : Number.parseInt(value, 10) || null

    setArtworks((prev) =>
      prev.map((artwork) =>
        artwork.id === id ? { ...artwork, display_order: parsedValue } : artwork
      )
    )
  }

  const handleDisplayOrderSave = async (id: string) => {
    if (savingDisplayOrderId === id) return

    const artwork = artworks.find((item) => item.id === id)
    if (!artwork) return

    try {
      setSavingDisplayOrderId(id)

      const response = await fetch(`/api/admin/artworks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          display_order: artwork.display_order ?? null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error updating display order:', error)
        toast.error(
          'Failed to update display order: ' + (error.error || 'Unknown error')
        )
        return
        }

        toast.success('Display order updated')
        fetchArtworks(page, statusFilter, search)
      } catch (error) {
        console.error('Error updating display order:', error)
        toast.error('Failed to update display order')
      } finally {
        setSavingDisplayOrderId(null)
      }
  }

  const fetchArtworks = async (
    targetPage = 1,
    status = statusFilter,
    searchQuery = search
  ) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(PAGE_SIZE)
      })
      if (status !== 'all') params.set('status', status)
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      const response = await fetch(`/api/admin/artworks?${params.toString()}`)
      if (response.ok) {
        const { data, total } = await response.json()
        setArtworks(data)
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)))
        setPage(targetPage)
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
    fetchArtworks(1, statusFilter, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleEdit = (artwork: ArtworkRow) => {
    router.push(`/admin/artworks/${artwork.id}`)
  }

  const handleDuplicate = async (artwork: ArtworkRow) => {
    const ok = await confirm({
      title: 'Duplicate artwork',
      message: `Are you sure you want to duplicate "${artwork.title}"?`
    })
    if (!ok) return
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
        fetchArtworks(page, statusFilter, search)
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
        fetchArtworks(page, statusFilter, search)
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
    const ok = await confirm({
      title: 'Delete artwork',
      message: `Delete "${artwork.title}" permanently?`
    })
    if (!ok) return

    try {
      const response = await fetch(`/api/admin/artworks/${artwork.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchArtworks(page, statusFilter, search)
        toast.success('Artwork deleted')
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

  return (
    <AdminLayout>
      <AdminTable
        descriptor={artworksDescriptor}
        data={artworks}
        loading={loading}
        renderCell={(item: ArtworkRow, column: ListColumn) => {
          if (column.key === 'display_order') {
            const value =
              item.display_order === null || item.display_order === undefined
                ? ''
                : String(item.display_order)

            return (
              <div className="flex items-center gap-2">
                <TextInput
                  type="number"
                  sizing="sm"
                  className="w-24"
                  value={value}
                  onChange={(e) =>
                    handleDisplayOrderChange(item.id, e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleDisplayOrderSave(item.id)
                    }
                  }}
                />
                <Button
                  size="xs"
                  color="light"
                  disabled={savingDisplayOrderId === item.id}
                  onClick={() => handleDisplayOrderSave(item.id)}
                >
                  {savingDisplayOrderId === item.id ? 'Salvando...' : 'OK'}
                </Button>
              </div>
            )
          }
          return undefined
        }}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchArtworks(p, statusFilter, search)}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s)
          fetchArtworks(1, s, search)
        }}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          fetchArtworks(1, statusFilter, value)
        }}
        onToggleDraft={handleToggleDraft}
        onDelete={handleDelete}
      />
    </AdminLayout>
  )
}
