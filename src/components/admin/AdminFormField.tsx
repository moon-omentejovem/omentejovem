'use client'

import ImageUploadField from '@/components/admin/ImageUploadField'
import TiptapEditor from '@/components/admin/TiptapEditor'
import type { FormField, ResourceDescriptor } from '@/types/descriptors'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  Label,
  Select,
  TextInput,
  Textarea,
  ToggleSwitch
} from 'flowbite-react'
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
  // Nenhum hook global para upload de imagem aqui. Tudo fica dentro do case 'image'.

  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
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
      return (
        <ImageUploadField
          defaultValue={formData?.imageurl || null}
          supabase={supabase}
          onChange={onChange}
          onExtraChange={onExtraChange}
          label={field.label || field.key}
          placeholder={field.placeholder}
          error={error}
        />
      )
    }
    case 'video': {
      return (
        <ImageUploadField
          defaultValue={formData?.video_url || null}
          supabase={supabase}
          onChange={onChange}
          onExtraChange={onExtraChange}
          label={field.label || field.key}
          placeholder={field.placeholder}
          error={error}
          mode="video"
          maxSizeMB={100}
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
        />
      )
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
