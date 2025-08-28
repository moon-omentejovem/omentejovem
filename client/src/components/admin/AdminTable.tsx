'use client'

import type { ListColumn, ResourceDescriptor } from '@/types/descriptors'
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

interface AdminTableProps<T = any> {
  descriptor: ResourceDescriptor
  data: T[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDuplicate?: (item: T) => void
  onDelete?: (item: T) => void
  onSearch?: (term: string) => void
  onSort?: (field: string, direction: 'asc' | 'desc') => void
  renderCell?: (item: T, column: ListColumn) => React.ReactNode
}

export default function AdminTable<T extends Record<string, any>>({
  descriptor,
  data,
  loading = false,
  onEdit,
  onDuplicate,
  onDelete,
  onSearch,
  onSort,
  renderCell
}: AdminTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState(descriptor.defaultSort?.key || '')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    descriptor.defaultSort?.direction || 'desc'
  )

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || !descriptor.searchFields) return data

    return data.filter((item) =>
      descriptor.searchFields!.some((field) =>
        String(item[field] || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    )
  }, [data, searchTerm, descriptor.searchFields])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      let comparison = 0
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortField, sortDirection])

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    onSort?.(field, sortDirection === 'asc' ? 'desc' : 'asc')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onSearch?.(e.target.value)
  }

  const defaultRenderCell = (item: T, column: ListColumn): React.ReactNode => {
    if (renderCell) {
      const customRender = renderCell(item, column)
      if (customRender !== undefined) return customRender
    }

    const value = item[column.key]

    switch (column.render) {
      case 'image':
        return value ? (
          <Image
            src={value}
            alt={item.title || item.name || 'Image'}
            width={64}
            height={64}
            className="rounded object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-500">
            No image
          </div>
        )

      case 'clamp':
        // Handle Tiptap JSON content
        if (value && typeof value === 'object' && value.type === 'doc') {
          // Extract text content from Tiptap JSON
          const extractText = (node: any): string => {
            if (node.type === 'text') return node.text || ''
            if (node.content) {
              return node.content.map(extractText).join('')
            }
            return ''
          }

          const textContent = value.content
            ? value.content.map(extractText).join(' ')
            : ''

          return (
            <div className="max-w-xs">
              <div className="truncate" title={textContent}>
                {textContent || '-'}
              </div>
            </div>
          )
        }

        return (
          <div className="max-w-xs">
            <div className="truncate" title={String(value || '')}>
              {String(value || '')}
            </div>
          </div>
        )

      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-'

      case 'datetime':
        return value ? new Date(value).toLocaleString() : '-'

      case 'link':
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline"
          >
            Link
          </a>
        ) : (
          '-'
        )

      case 'badge':
        return value ? (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value === 'single'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            }`}
          >
            {value === 'single' ? '1/1' : 'Edition'}
          </span>
        ) : (
          '-'
        )

      case 'number':
        return value !== null && value !== undefined ? value : '-'

      case 'boolean':
        return value ? '✓' : '✗'

      case 'text':
      default:
        return String(value || '')
    }
  }

  const hasActions =
    descriptor.actions &&
    (descriptor.actions.edit ||
      descriptor.actions.duplicate ||
      descriptor.actions.delete)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          {descriptor.title}
        </h1>
        {descriptor.actions?.create && (
          <Link
            href={`/admin/${descriptor.table}/new`}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-400 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add {descriptor.title.slice(0, -1)}
          </Link>
        )}
      </div>

      {/* Search */}
      {descriptor.searchFields && descriptor.searchFields.length > 0 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder={`Search by ${descriptor.searchFields.join(', ')}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-neutral-400">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-neutral-900 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="border-b border-neutral-800">
              <tr>
                {descriptor.list.map((column) => (
                  <th
                    key={column.key}
                    className={`py-3 px-4 text-left text-neutral-400 font-medium ${
                      sortField === column.key
                        ? 'cursor-pointer hover:text-neutral-300'
                        : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortField === column.key && (
                        <div className="ml-1">
                          {sortDirection === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {hasActions && (
                  <th className="py-3 px-4 text-right text-neutral-400 font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={descriptor.list.length + (hasActions ? 1 : 0)}
                    className="py-8 px-4 text-center text-neutral-500"
                  >
                    {searchTerm
                      ? 'No results found'
                      : `No ${descriptor.title.toLowerCase()} yet`}
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="hover:bg-neutral-800/50"
                  >
                    {descriptor.list.map((column) => (
                      <td
                        key={column.key}
                        className={`py-4 px-4 text-neutral-200 ${column.className || ''}`}
                      >
                        {defaultRenderCell(item, column)}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="py-4 px-4 text-right space-x-2">
                        {descriptor.actions?.edit && onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit"
                          >
                            Edit
                          </button>
                        )}
                        {descriptor.actions?.duplicate && onDuplicate && (
                          <button
                            onClick={() => onDuplicate(item)}
                            className="text-green-400 hover:text-green-300 ml-2"
                            title="Duplicate"
                          >
                            Duplicate
                          </button>
                        )}
                        {descriptor.actions?.delete && onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="text-red-400 hover:text-red-300 ml-2"
                            title="Delete"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
