'use client'

import ImageUploadField from '@/components/admin/ImageUploadField'
import TiptapEditor from '@/components/admin/TiptapEditor'
import { useImageUpload } from '@/hooks/useImageUpload'
import type { FormField, ResourceDescriptor } from '@/types/descriptors'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  FileInput,
  Label,
  Select,
  TextInput,
  Textarea,
  ToggleSwitch
} from 'flowbite-react'
import Image from 'next/image'
import RelationPicker from './RelationPicker'
import JsonArrayField from './JsonArrayField'

interface AdminFormFieldProps {
  field: FormField
  value: any
  error?: string
  onChange: (value: any) => void
  onExtraChange?: (key: string, value: any) => void
  descriptor: ResourceDescriptor
  supabase: SupabaseClient
  formData?: Record<string, any>
}

export default function AdminFormField({
  field,
  value,
  error,
  onChange,
  onExtraChange,
  descriptor,
  supabase,
  formData
}: AdminFormFieldProps) {
  const { uploading, uploadImage, resetUploadState } = useImageUpload()

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      const formatMintHour = (raw: string) => {
        const digits = raw.replace(/\D/g, '').slice(0, 4)
        if (digits.length <= 2) return digits
        return `${digits.slice(0, 2)}:${digits.slice(2)}`
      }

      return (
        <div className="space-y-2">
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
            value={value || ''}
            onChange={(e) => {
              const next = e.target.value
              if (field.key === 'mint_hour') {
                onChange(formatMintHour(next))
              } else {
                onChange(next)
              }
            }}
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
            onChange={(e) => {
              const next = e.target.value
              onChange(next === '' ? null : Number(next))
            }}
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
      // Editor rich text (mantém padrão)
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          {/* Substitua por seu editor Tiptap customizado se necessário */}
          <TiptapEditor
            content={value || ''}
            onChange={(content) => onChange(content)}
            placeholder={field.placeholder}
            editorSlug={`${descriptor.table} + '-' + ${field.key}`}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      )
    case 'image': {
      const defaultValue =
        formData && field.key in formData
          ? ((formData[field.key] as string | null) ?? null)
          : formData?.imageurl || null

      return (
        <ImageUploadField
          defaultValue={defaultValue}
          supabase={supabase}
          onChange={onChange}
          onExtraChange={onExtraChange}
          label={field.label || field.key}
          placeholder={field.placeholder}
          error={error}
        />
      )
    }
    case 'image-multi': {
      const slotKeys = ['image1_url', 'image2_url', 'image3_url', 'image4_url']

      const slots = slotKeys.map((key) => ({
        key,
        url:
          formData && key in formData
            ? ((formData[key] as string | null) ?? null)
            : null
      }))

      const handleUploadMany = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        const currentValues = slotKeys.map((key) =>
          formData && key in formData
            ? ((formData[key] as string | null) ?? null)
            : null
        )

        let slotIndex = currentValues.findIndex((value) => !value)
        if (slotIndex === -1) {
          return
        }

        const filesArray = Array.from(files).slice(
          0,
          slotKeys.length - slotIndex
        )

        for (const file of filesArray) {
          if (slotIndex >= slotKeys.length) break

          const slotKey = slotKeys[slotIndex]
          const uploadId =
            typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(2, 15)

          const { originalUrl, optimizedUrl } = await uploadImage(
            file,
            uploadId
          )

          const url = optimizedUrl || originalUrl

          if (url) {
            if (onExtraChange) {
              onExtraChange(slotKey, url)
            }
            if (slotKey === field.key) {
              onChange(url)
            }
          }

          slotIndex += 1
        }
      }

      const handleRemove = (slotKey: string) => {
        if (onExtraChange) {
          onExtraChange(slotKey, null)
        }
        if (slotKey === field.key) {
          onChange(null)
        }
        resetUploadState()
      }

      const hasImages = slots.some((slot) => !!slot.url)

      return (
        <div className="space-y-2">
          <Label htmlFor={field.key} value={field.label || field.key} />
          <FileInput
            id={field.key}
            multiple
            accept="image/*"
            onChange={(e) => handleUploadMany(e.target.files)}
            disabled={uploading}
          />
          {uploading && (
            <p className="text-xs text-gray-400">Enviando imagens...</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {hasImages ? (
              slots.map((slot) =>
                slot.url ? (
                  <div
                    key={slot.key}
                    className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={slot.url}
                      alt={slot.key}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(slot.key)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/80 text-white text-xs leading-none"
                    >
                      ×
                    </button>
                  </div>
                ) : null
              )
            ) : (
              <span className="text-xs text-gray-400">
                Nenhuma imagem cadastrada
              </span>
            )}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      )
    }
    case 'video': {
      return (
        <ImageUploadField
          defaultValue={
            formData && field.key in formData
              ? (formData[field.key] as string | null)
              : null
          }
          supabase={supabase}
          onChange={onChange}
          onExtraChange={onExtraChange}
          label={field.label || field.key}
          placeholder={field.placeholder}
          error={error}
          mode="video"
          maxSizeMB={100}
          fieldKey={field.key}
        />
      )
    }
    case 'relation-multi':
      return (
        <RelationPicker
          field={field}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          error={error}
          formData={formData}
        />
      )
    case 'relation-single': {
      const arrayValue = value ? [value] : []

      const handleChangeSingle = (ids: string[]) => {
        onChange(ids[0] || null)
      }

      return (
        <RelationPicker
          field={field}
          value={arrayValue}
          onChange={handleChangeSingle}
          error={error}
          formData={formData}
        />
      )
    }
    case 'json':
      return (
        <JsonArrayField
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      )
    default:
      return null
  }
}
