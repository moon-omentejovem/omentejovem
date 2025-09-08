'use client'

import type { FormField } from '@/types/descriptors'
import type { Artifact, Artwork, Series } from '@/types/schemas'
import { ChevronDownIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RelationPickerProps {
  field: FormField
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

interface RelationOption {
  id: string
  label: string
}

// Type for API response items that can be used in relations
type RelationItem = Artwork | Series | Artifact

// Extended types for API responses with relations
interface ArtworkWithRelations extends Artwork {
  series_artworks?: Array<{
    series: Series | null
  }>
}

interface SeriesWithRelations extends Series {
  series_artworks?: Array<{
    artworks: Artwork | null
  }>
}

// Helper function to get label from relation item
const getItemLabel = (item: RelationItem, labelKey: string): string => {
  // Type-safe access to properties based on known label keys
  switch (labelKey) {
    case 'title':
      return (item as Artwork | Artifact).title || item.id || 'Unknown'
    case 'name':
      return (item as Series).name || item.id || 'Unknown'
    case 'slug':
      return (item as Artwork | Series).slug || item.id || 'Unknown'
    default:
      // Fallback for unknown label keys - use key as property accessor
      const value = (item as Record<string, unknown>)[labelKey]
      return (typeof value === 'string' ? value : item.id) || 'Unknown'
  }
}

export default function RelationPicker({
  field,
  value = [],
  onChange,
  error
}: RelationPickerProps) {
  const [options, setOptions] = useState<RelationOption[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      if (!field.relation?.table) return

      try {
        setLoading(true)
        let endpoint = ''

        switch (field.relation.table) {
          case 'series':
            endpoint = '/api/admin/series'
            break
          case 'artworks':
            endpoint = '/api/admin/artworks'
            break
          case 'artifacts':
            endpoint = '/api/admin/artifacts'
            break
          default:
            throw new Error(
              `Unsupported relation table: ${field.relation.table}`
            )
        }

        const response = await fetch(endpoint)
        if (response.ok) {
          const data: RelationItem[] = await response.json()
          const formattedOptions = data.map((item: RelationItem) => ({
            id: item.id!,
            label: getItemLabel(item, field.relation!.labelKey)
          }))
          setOptions(formattedOptions)
        }
      } catch (error) {
        console.error('Error fetching relation options:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [field.relation])

  const handleToggleItem = (option: RelationOption) => {
    const newValue = value.includes(option.id)
      ? value.filter((id) => id !== option.id)
      : [...value, option.id]

    onChange(newValue)
    setIsOpen(false)
  }

  const handleRemoveItem = (optionId: string) => {
    const newValue = value.filter((id) => id !== optionId)
    onChange(newValue)
  }

  const availableOptions = options.filter(
    (option) => !value.includes(option.id)
  )

  const selectedOptions = options.filter((option) => value.includes(option.id))

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label || field.key}
        {field.required && <span className="text-red-600 ml-1">*</span>}
      </label>

      {/* Selected Items */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
            >
              {item.label}
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading || availableOptions.length === 0}
          className={`w-full px-3 py-2 bg-white border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md text-gray-700 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center justify-between ${
            loading || availableOptions.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-gray-400'
          }`}
        >
          <span className="text-gray-500">
            {loading
              ? 'Loading...'
              : availableOptions.length === 0
                ? `No more ${field.relation?.table} available`
                : `Select ${field.relation?.table}...`}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && availableOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {availableOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleToggleItem(option)}
                className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
