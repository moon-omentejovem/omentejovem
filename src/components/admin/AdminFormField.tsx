'use client'

import { ImageUploadService } from '@/services/image-upload.service'
import type { FormField, ResourceDescriptor } from '@/types/descriptors'
import { FileInput, Label, Select, TextInput, Textarea, ToggleSwitch } from 'flowbite-react'
import Image from 'next/image'
import { toast } from 'sonner'
import RelationPicker from './RelationPicker'
import TiptapEditor from './TiptapEditor'
import type { SupabaseClient } from '@supabase/supabase-js'

interface AdminFormFieldProps {
  field: FormField
  value: any
  error?: string
  onChange: (value: any) => void
  onExtraChange?: (key: string, value: any) => void
  descriptor: ResourceDescriptor
  supabase: SupabaseClient
}

export default function AdminFormField({
  field,
  value,
  error,
  onChange,
  onExtraChange,
  descriptor,
  supabase
}: AdminFormFieldProps) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <TextInput
            id={field.key}
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            color={error ? 'failure' : undefined}
            helperText={error}
          />
        </div>
      )
    case 'slug':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <TextInput
            id={field.key}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            color={error ? 'failure' : undefined}
            helperText={error}
          />
        </div>
      )
    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <TextInput
            id={field.key}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
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
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <TextInput
            id={field.key}
            type="date"
            value={value ? String(value).split('T')[0] : ''}
            onChange={(e) => onChange(e.target.value || null)}
            color={error ? 'failure' : undefined}
            helperText={error}
          />
        </div>
      )
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <Textarea
            id={field.key}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            color={error ? 'failure' : undefined}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      )
    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <Select
            id={field.key}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            color={error ? 'failure' : undefined}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => {
              const optValue = typeof option === 'string' ? option : option.value
              const optLabel = typeof option === 'string' ? option : option.label
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
        <div className="py-2">
          <ToggleSwitch
            checked={!!value}
            label={field.label || field.key}
            onChange={(val) => onChange(val)}
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
      )
    case 'tiptap':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <TiptapEditor
            content={value}
            onChange={(content) => onChange(content)}
            placeholder={field.placeholder}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )
    case 'image':
      const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const file = e.target.files?.[0]
        if (!file) return

        await toast.promise(
          (async () => {
            const result = await ImageUploadService.uploadImageWithValidation(
              file,
              supabase,
              descriptor.table
            )
            onChange(result.optimizedPath)
            onExtraChange?.('raw_image_path', result.rawPath)
          })(),
          {
            loading: 'Uploading image...',
            success: 'Image uploaded successfully!',
            error: (err) => `Upload failed: ${err.message}`
          }
        )
      }
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <div className="flex items-center gap-2">
            <FileInput
              accept="image/*"
              onChange={handleFileChange}
              sizing="lg"
              placeholder={field.placeholder || 'Upload an image'}
            />
          </div>
          {value && (
            <div className="mt-2">
              <Image
                src={value}
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
    case 'relation-multi':
      return (
        <RelationPicker
          field={field}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          error={error}
        />
      )
    default:
      return null
  }
}

