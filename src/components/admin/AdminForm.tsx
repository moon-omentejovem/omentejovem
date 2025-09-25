'use client'

import { useConfirm } from '@/hooks/useConfirm'
import type { FormField, ResourceDescriptor } from '@/types/descriptors'
import { createClient } from '@/utils/supabase/client'
import { Button } from 'flowbite-react'
import { SaveIcon, XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import AdminFormField from './AdminFormField'

interface AdminFormProps<T = any> {
  descriptor: ResourceDescriptor
  data?: T
  onSubmit: (data: T) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function AdminForm<T extends Record<string, any>>({
  descriptor,
  data,
  onSubmit,
  onCancel,
  loading = false
}: AdminFormProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClient()
  const router = useRouter()
  const confirm = useConfirm()

  useEffect(() => {
    if (data) {
      // Se vier imageurl mas não image, preenche image para evitar erro de required
      const patchedData = { ...data }
      if (patchedData.imageurl && !patchedData.image) {
        ;(patchedData as Record<string, any>)['image'] = patchedData.imageurl
      }
      setFormData(patchedData)
    } else {
      // Initialize form with default values
      const initialData: Record<string, any> = {}
      descriptor.form.forEach((field) => {
        if (field.type === 'switch') {
          initialData[field.key] = false
        } else if (field.type === 'relation-multi') {
          initialData[field.key] = []
        }
      })
      setFormData(initialData)
    }
  }, [data, descriptor.form])

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }))

    // Auto-generate slug if field has 'from' property
    const slugField = descriptor.form.find(
      (f) => f.type === 'slug' && f.from === key
    )
    if (slugField && value && typeof value === 'string') {
      setFormData((prev) => ({
        ...prev,
        [slugField.key]: generateSlug(value)
      }))
    }

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    descriptor.form.forEach((field) => {
      const fieldValue = formData[field.key]

      if (field.required) {
        // Check if required field is empty
        if (
          fieldValue === undefined ||
          fieldValue === null ||
          fieldValue === ''
        ) {
          newErrors[field.key] = `${field.label || field.key} is required`
        }
      }

      // Additional validation based on field type (only if value exists)
      if (
        fieldValue !== undefined &&
        fieldValue !== null &&
        fieldValue !== ''
      ) {
        if (field.type === 'email' && !isValidEmail(fieldValue)) {
          newErrors[field.key] = 'Please enter a valid email'
        }
        if (field.type === 'number' && isNaN(Number(fieldValue))) {
          newErrors[field.key] = 'Please enter a valid number'
        }
        if (
          field.validation?.min &&
          Number(fieldValue) < field.validation.min
        ) {
          newErrors[field.key] = `Minimum value is ${field.validation.min}`
        }
        if (
          field.validation?.max &&
          Number(fieldValue) > field.validation.max
        ) {
          newErrors[field.key] = `Maximum value is ${field.validation.max}`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const shouldShowField = (field: FormField): boolean => {
    if (!field.when) return true

    return Object.entries(field.when).every(([key, value]) => {
      return formData[key] === value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit(formData as T)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to submit form')
    }
  }

  const handlePermanentDelete = async () => {
    if (!data || !descriptor.actions?.delete) return

    const ok = await confirm({
      title: 'Delete permanently',
      message: `Are you sure you want to permanently delete this ${descriptor.title.slice(
        0,
        -1
      )}? This action cannot be undone.`
    })

    if (!ok) return

    try {
      await toast.promise(
        (async () => {
          const id = (data as any).id
          const response = await fetch(`/api/admin/${descriptor.table}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          })

          if (!response.ok) {
            const err = await response.json()
            throw new Error(err?.error || 'Failed to delete')
          }

          return true
        })(),
        {
          loading: 'Deleting...',
          success: `${descriptor.title.slice(0, -1)} deleted`,
          error: (e) => `Delete failed: ${e.message}`
        }
      )

      // Navigate back to list
      router.push(`/admin/${descriptor.table}`)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null

    // Passa o formData inteiro para o AdminFormField para acesso ao slug/id
    return (
      <AdminFormField
        key={field.key}
        field={field}
        value={formData[field.key]}
        error={errors[field.key]}
        onChange={(value) => handleInputChange(field.key, value)}
        onExtraChange={(key, value) => handleInputChange(key, value)}
        descriptor={descriptor}
        supabase={supabase}
        formData={formData}
      />
    )
  }
  if (!data) return <div>Loading...</div>
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {data ? 'Edit' : 'Create'} {descriptor.title.slice(0, -1)}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-4 sm:p-6 rounded-lg border border-gray-200"
      >
        {descriptor.form.map(renderField)}

        <div className="flex flex-col items-stretch gap-4 pt-6 border-t border-gray-200 sm:flex-row sm:justify-end">
          {data && descriptor.actions?.delete && (
            <Button
              type="button"
              color="failure"
              onClick={handlePermanentDelete}
              className="flex items-center justify-center space-x-2 mr-auto"
            >
              <span>Delete Permanently</span>
            </Button>
          )}
          <Button
            type="button"
            onClick={onCancel}
            color="gray"
            className="flex items-center justify-center space-x-2"
          >
            <XIcon className="w-4 h-4" />
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            disabled={loading}
            isProcessing={loading}
            className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
          >
            <SaveIcon className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
