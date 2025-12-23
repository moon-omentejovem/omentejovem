'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import { artifactInternalPagesDescriptor } from '@/types/descriptors'
import type { UpdateArtifactInternalPage } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ArtifactInternalPageRow =
  Database['public']['Tables']['artifact_internal_pages']['Row']

export default function EditArtifactInternalPage({
  params
}: {
  params: { id: string }
}) {
  const [pageData, setPageData] = useState<ArtifactInternalPageRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setFetchLoading(true)
        const response = await fetch(
          `/api/admin/artifact-internal-pages/${params.id}`
        )
        if (response.ok) {
          const data = await response.json()
          setPageData(data)
        } else {
          toast.error('Artifact internal page not found')
          router.push('/admin/artifacts')
        }
      } catch (error) {
        console.error('Error fetching artifact internal page:', error)
        toast.error('Error fetching artifact internal page')
        router.push('/admin/artifacts')
      } finally {
        setFetchLoading(false)
      }
    }

    if (params.id) {
      fetchPage()
    }
  }, [params.id, router])

  const handleSubmit = async (data: UpdateArtifactInternalPage) => {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/admin/artifact-internal-pages/${params.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      )

      if (response.ok) {
        toast.success('Artifact internal page updated successfully')
        router.push('/admin/artifacts')
      } else {
        const error = await response.json()
        console.error('Error updating artifact internal page:', error)
        toast.error(
          'Failed to update internal page: ' +
            (error.error || 'Unknown error')
        )
      }
    } catch (error) {
      console.error('Error updating artifact internal page:', error)
      toast.error('Failed to update internal page')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/artifacts')
  }

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  if (!pageData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Artifact internal page not found</div>
        </div>
      </AdminLayout>
    )
  }

  const transformForForm = (
    page: ArtifactInternalPageRow
  ): UpdateArtifactInternalPage => {
    return {
      ...page,
      status: (page.status === 'draft' ? 'draft' : 'published') as
        | 'draft'
        | 'published'
    }
  }

  return (
    <AdminLayout>
      <AdminForm
        descriptor={artifactInternalPagesDescriptor}
        data={transformForForm(pageData)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}

