'use client'

import { ImageUploadService } from '@/services/image-upload.service'
import type { FormField, ResourceDescriptor } from '@/types/descriptors'
import { createClient } from '@/utils/supabase/client'
import {
  Button,
  FileInput,
  Label,
  Select,
  TextInput,
  Textarea,
  ToggleSwitch
} from 'flowbite-react'
import { SaveIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import RelationPicker from './RelationPicker'
import TiptapEditor from './TiptapEditor'

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

  useEffect(() => {
    if (data) {
      setFormData(data)
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
        if (
          (field.type === 'url' || field.type === 'image') &&
          !isValidUrl(fieldValue)
        ) {
          newErrors[field.key] = 'Please enter a valid URL'
        }
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

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
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

    const ok = confirm(
      `Are you sure you want to permanently delete this ${descriptor.title.slice(
        0,
        -1
      )}? This action cannot be undone.`
    )

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

    const value = formData[field.key] || ''
    const error = errors[field.key]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <TextInput
              id={field.key}
              type={
                field.type === 'email'
                  ? 'email'
                  : field.type === 'url'
                    ? 'url'
                    : 'text'
              }
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              color={error ? 'failure' : undefined}
              helperText={error}
            />
          </div>
        )

      case 'slug':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <TextInput
              id={field.key}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              color={error ? 'failure' : undefined}
              helperText={error}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <TextInput
              id={field.key}
              type="number"
              value={value}
              onChange={(e) =>
                handleInputChange(field.key, Number(e.target.value))
              }
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              color={error ? 'failure' : undefined}
              helperText={error}
            />
          </div>
        )

      case 'date':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <TextInput
              id={field.key}
              type="date"
              value={value ? value.split('T')[0] : ''}
              onChange={(e) => {
                const dateValue = e.target.value || null
                handleInputChange(field.key, dateValue)
              }}
              color={error ? 'failure' : undefined}
              helperText={error}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              color={error ? 'failure' : undefined}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <Select
              id={field.key}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              color={error ? 'failure' : undefined}
            >
              <option value="">Select an option</option>
              {field.options?.map((option) => {
                const optValue =
                  typeof option === 'string' ? option : option.value
                const optLabel =
                  typeof option === 'string' ? option : option.label
                return (
                  <option key={optValue} value={optValue}>
                    {optLabel}
                  </option>
                )
              })}
            </Select>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        )

      case 'switch':
        return (
          <div key={field.key} className="py-2">
            <ToggleSwitch
              checked={!!value}
              label={field.label || field.key}
              onChange={(val) => handleInputChange(field.key, val)}
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'tiptap':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <TiptapEditor
              content={value}
              onChange={(content) => handleInputChange(field.key, content)}
              placeholder={field.placeholder}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )

      case 'image': {
        const handleFileChange = async (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          const file = e.target.files?.[0]
          if (!file) return

          await toast.promise(
            (async () => {
              // Usar o serviço de upload
              const result = await ImageUploadService.uploadImageWithValidation(
                file,
                supabase,
                descriptor.table
              )

              // Salvar ambos os paths
              handleInputChange(field.key, result.optimizedPath)
              handleInputChange('raw_image_path', result.rawPath)
            })(),
            {
              loading: 'Uploading image...',
              success: 'Image uploaded successfully!',
              error: (err) => `Upload failed: ${err.message}`
            }
          )
        }

        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} value={field.label || field.key} />
            <div className="flex items-center gap-2">
              <FileInput
                accept="image/*"
                onChange={handleFileChange}
                sizing="lg"
                placeholder={field.placeholder || 'Upload an image'}
              />
            </div>
            {formData['image_url'] && (
              <div className="mt-2">
                <Image
                  src={formData['image_url']}
                  alt="Preview"
                  width={640}
                  height={640}
                  sizes="640px; (max-width: 640px) 100vw"
                  className="object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        )
      }

      case 'relation-multi':
        return (
          <RelationPicker
            key={field.key}
            field={field}
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => handleInputChange(field.key, newValue)}
            error={error}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {data ? 'Edit' : 'Create'} {descriptor.title.slice(0, -1)}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg border border-gray-200"
      >
        {descriptor.form.map(renderField)}

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {data && descriptor.actions?.delete && (
            <Button
              type="button"
              color="failure"
              onClick={handlePermanentDelete}
              className="flex items-center space-x-2"
            >
              <span>Delete Permanently</span>
            </Button>
          )}
          <Button
            type="button"
            onClick={onCancel}
            color="gray"
            className="flex items-center space-x-2"
          >
            <XIcon className="w-4 h-4" />
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            disabled={loading}
            isProcessing={loading}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
          >
            <SaveIcon className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
