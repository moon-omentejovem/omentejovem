'use client'

import type { FormField, ResourceDescriptor } from '@/types/descriptors'
import { SaveIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import RelationPicker from './RelationPicker'
import TiptapEditor from './TiptapEditor'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

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

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null

    const value = formData[field.key] || ''
    const error = errors[field.key]

    const baseClasses = `w-full px-3 py-2 bg-neutral-800 border ${
      error ? 'border-red-500' : 'border-neutral-700'
    } rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
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
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )

      case 'slug':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) =>
                handleInputChange(field.key, Number(e.target.value))
              }
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value ? value.split('T')[0] : ''}
              onChange={(e) => {
                // Only set value if it's not empty, otherwise set null
                const dateValue = e.target.value || null
                handleInputChange(field.key, dateValue)
              }}
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={baseClasses}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={baseClasses}
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
            </select>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        )

      case 'switch':
        return (
          <div
            key={field.key}
            className="flex items-center justify-between py-2"
          >
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
            </label>
            <button
              type="button"
              onClick={() => handleInputChange(field.key, !value)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                value ? 'bg-orange-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  value ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )

      case 'tiptap':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
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
              const filePath = `${descriptor.table}/${Date.now()}-${file.name}`
              const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(filePath, file)
              if (uploadError) throw uploadError
              const {
                data: { publicUrl }
              } = supabase.storage.from('media').getPublicUrl(filePath)
              handleInputChange(field.key, publicUrl)
            })(),
            {
              loading: 'Uploading image...',
              success: 'Image uploaded',
              error: 'Failed to upload image'
            }
          )
        }

        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">
              {field.label || field.key}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={value}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={baseClasses}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm text-neutral-400"
              />
            </div>
            {value && (
              <div className="mt-2">
                <Image
                  src={value}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
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
        <h1 className="text-2xl font-semibold text-white">
          {data ? 'Edit' : 'Create'} {descriptor.title.slice(0, -1)}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-neutral-900 p-6 rounded-lg"
      >
        {descriptor.form.map(renderField)}

        <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-neutral-400 hover:text-neutral-300 flex items-center space-x-2"
          >
            <XIcon className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <SaveIcon className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
