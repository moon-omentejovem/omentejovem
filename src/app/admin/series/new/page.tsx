'use client'

import AdminForm from '@/components/admin/AdminForm'
import AdminLayout from '@/components/admin/AdminLayout'
import { seriesDescriptor } from '@/types/descriptors'
import type { CreateSeries } from '@/types/schemas'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function NewSeriesPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: CreateSeries) => {
    try {
      setLoading(true)

      const response = await fetch('/api/admin/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Series created successfully')
        router.push('/admin/series')
      } else {
        const error = await response.json()
        console.error('Error creating series:', error)
        toast.error('Failed to create series: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating series:', error)
      toast.error('Failed to create series')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/series')
  }

  return (
    <AdminLayout>
      <AdminForm
        descriptor={seriesDescriptor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </AdminLayout>
  )
}
