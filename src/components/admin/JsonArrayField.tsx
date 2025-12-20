'use client'

import { Button, Label, TextInput } from 'flowbite-react'
import { PlusIcon, TrashIcon } from 'lucide-react'
import type { FormField } from '@/types/descriptors'

interface JsonArrayFieldProps {
  field: FormField
  value: any
  onChange: (value: any[]) => void
  error?: string
}

export default function JsonArrayField({
  field,
  value = [],
  onChange,
  error
}: JsonArrayFieldProps) {
  let normalized: any = value

  if (typeof normalized === 'string') {
    try {
      normalized = JSON.parse(normalized)
    } catch {
      normalized = []
    }
  }

  const items = Array.isArray(normalized) ? normalized : []
  const schema = field.schema
  
  // Only support object items for now, as required by the use case
  if (schema?.type !== 'array' || schema.items?.type !== 'object') {
    return <div className="text-red-500">Unsupported JSON schema</div>
  }

  const itemProperties = schema.items.properties || {}
  const maxItems = field.validation?.max || 5

  const handleAddItem = () => {
    if (items.length >= maxItems) return
    const newItem: Record<string, any> = {}
    Object.keys(itemProperties).forEach(key => {
      newItem[key] = ''
    })
    onChange([...items, newItem])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const handleItemChange = (index: number, key: string, val: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [key]: val }
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={field.key} value={field.label || field.key} />
        {items.length < maxItems && (
          <Button size="xs" color="light" onClick={handleAddItem} className="flex items-center">
            <PlusIcon className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>
      
      {items.length === 0 && (
        <p className="text-sm text-gray-500 italic">No items added.</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
              {Object.entries(itemProperties).map(([propKey, propSchema]: [string, any]) => (
                <div key={propKey}>
                  <TextInput
                    placeholder={propSchema.title || propKey}
                    value={item[propKey] || ''}
                    onChange={(e) => handleItemChange(index, propKey, e.target.value)}
                    type={propKey.includes('link') || propKey.includes('url') ? 'url' : 'text'}
                    sizing="sm"
                  />
                </div>
              ))}
            </div>
            <Button 
              size="xs" 
              color="failure" 
              className="mt-1"
              onClick={() => handleRemoveItem(index)}
            >
              <TrashIcon className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
      
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
