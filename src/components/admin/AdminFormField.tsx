'use client'

import { ImageUploadService } from '@/services/image-upload.service'
import type { FormField, ResourceDescriptor } from '@/types/descriptors'
import { getImageUrlFromSlug } from '@/utils/storage'
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
import { toast } from 'sonner'
import RelationPicker from './RelationPicker'
import TiptapEditor from './TiptapEditor'

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
      // Novo sistema: upload e preview baseados em slug
      // O slug deve estar disponível no form (ex: via onExtraChange, prop, ou contexto)
      // Aqui assumimos que o valor do campo slug está em onExtraChange ou value do slug
      // Ajuste conforme a estrutura do seu form
      const slug =
        (typeof onExtraChange === 'function' &&
          (descriptor as any).currentSlug) ||
        value?.slug ||
        value ||
        ''
      // Importa o helper correto para gerar a URL baseada em slug
      // Supondo que existe getImageUrlFromSlug(slug, tipo, variante)
      // Ajuste o import se necessário
      const imageUrl = slug
        ? getImageUrlFromSlug(slug, descriptor.table, 'optimized')
        : undefined

      const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const file = e.target.files?.[0]
        if (!file || !slug) {
          toast.error('Slug obrigatório para upload de imagem.')
          return
        }

        await toast.promise(
          (async () => {
            await ImageUploadService.uploadImageBySlug(
              file,
              slug,
              supabase,
              descriptor.table
            )
            // Não salva path, apenas garante que slug está salvo no registro
            // Se o campo de imagem não for mais necessário, pode deixar onChange vazio
            onChange(slug)
          })(),
          {
            loading: 'Enviando imagem...',
            success: 'Imagem enviada com sucesso!',
            error: (err) => `Falha no upload: ${err.message}`
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
          {imageUrl && (
            <div className="mt-2">
              <Image
                src={imageUrl}
                alt="Preview"
                width={640}
                height={640}
                className="object-cover rounded-lg border border-gray-200"
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
