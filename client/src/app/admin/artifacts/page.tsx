'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import AdminTable from '@/components/admin/AdminTable'
import { artifactsDescriptor } from '@/types/descriptors'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type ArtifactRow = Database['public']['Tables']['artifacts']['Row']

export default function ArtifactsPage() {
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchArtifacts()
  }, [])

  const fetchArtifacts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/artifacts')
      if (response.ok) {
        const data = await response.json()
        setArtifacts(data)
      }
    } catch (error) {
      console.error('Error fetching artifacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (artifact: ArtifactRow) => {
    router.push(`/admin/artifacts/${artifact.id}`)
  }

  const handleDuplicate = async (artifact: ArtifactRow) => {
    try {
      const duplicateData = {
        ...artifact,
        id: undefined,
        title: `${artifact.title} (Copy)`,
        created_at: undefined,
        updated_at: undefined
      }

      const response = await fetch('/api/admin/artifacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicateData)
      })

      if (response.ok) {
        fetchArtifacts()
      }
    } catch (error) {
      console.error('Error duplicating artifact:', error)
    }
  }

  const handleDelete = async (artifact: ArtifactRow) => {
    if (confirm(`Are you sure you want to delete "${artifact.title}"?`)) {
      try {
        const response = await fetch(`/api/admin/artifacts/${artifact.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchArtifacts()
        }
      } catch (error) {
        console.error('Error deleting artifact:', error)
      }
    }
  }

  return (
    <AdminLayout>
      <AdminTable
        descriptor={artifactsDescriptor}
        data={artifacts}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onSearch={() => {}}
        onSort={() => {}}
      />
    </AdminLayout>
  )
}
