'use client'

import type { ListColumn, ResourceDescriptor } from '@/types/descriptors'
import { getImageUrlFromId } from '@/utils/storage'
import {
  Cell,
  ColumnDef,
  Header,
  HeaderGroup,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Button, Select, Table, TextInput } from 'flowbite-react'
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import AdminTableActions from './AdminTableActions'

interface AdminTableProps<T = any> {
  descriptor: ResourceDescriptor
  data: T[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDuplicate?: (item: T) => void
  renderCell?: (item: T, column: ListColumn) => React.ReactNode
  onToggleDraft?: (item: T) => void
  onDelete?: (item: T) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
}

export default function AdminTable<T extends Record<string, any>>({
  descriptor,
  data,
  loading = false,
  onEdit,
  onDuplicate,
  renderCell,
  onToggleDraft,
  onDelete,
  page = 1,
  totalPages = 1,
  onPageChange,
  statusFilter = 'all',
  onStatusFilterChange
}: AdminTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>(
    descriptor.defaultSort
      ? [
          {
            id: descriptor.defaultSort.key,
            desc: descriptor.defaultSort.direction === 'desc'
          }
        ]
      : []
  )
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value)
  }

  const defaultRenderCell = useCallback(
    (item: T, column: ListColumn): React.ReactNode => {
      if (renderCell) {
        const custom = renderCell(item, column)
        if (custom !== undefined) return custom
      }
      const value = item[column.key]

      switch (column.render) {
        case 'image':
          // Inferir resourceType do descriptor ou do contexto da tabela
          // Use descriptor.table como resourceType (artworks, series, artifacts)
          const resourceType = descriptor?.table || 'artworks'
          const filename =
            (value as string | undefined) ||
            ((item as Record<string, any>)?.image_filename as string | undefined) ||
            null
          const imageUrl =
            filename && item.id
              ? getImageUrlFromId(
                  item.id,
                  filename,
                  resourceType,
                  'optimized'
                )
              : ''
          return imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title || item.name || 'Image'}
              width={96}
              height={96}
              className="rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <span className="text-gray-400">No image</span>
          )
        case 'link':
          return value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              link
            </a>
          ) : (
            <span className="text-gray-500">—</span>
          )
        case 'clamp':
          return <span className="line-clamp-2">{value}</span>
        case 'badge':
          return (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
              {value}
            </span>
          )
        default:
          return value as React.ReactNode
      }
    },
    [renderCell, descriptor?.table]
  )

  const hasActions = Boolean(
    descriptor.actions?.edit ||
      descriptor.actions?.duplicate ||
      onToggleDraft ||
      (descriptor.actions?.delete && onDelete)
  )

  const columns = useMemo<ColumnDef<T>[]>(
    () => [
      ...descriptor.list.map((column) => ({
        accessorKey: column.key,
        header: () => column.label,
        cell: ({ row }: { row: Row<T> }) =>
          defaultRenderCell(row.original as T, column)
      })),
      {
        id: 'actions',
        header: () => (hasActions ? 'Actions' : null),
        cell: ({ row }: { row: Row<T> }) => (
          <AdminTableActions
            item={row.original as T}
            descriptor={descriptor}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onToggleDraft={onToggleDraft}
            onDelete={onDelete}
          />
        )
      }
    ],
    [
      descriptor,
      onEdit,
      onDuplicate,
      onToggleDraft,
      onDelete,
      hasActions,
      defaultRenderCell
    ]
  )

  const globalFilterFn = (
    row: Row<T>,
    _columnId: string,
    filterValue: string
  ) => {
    const search = filterValue.toLowerCase()
    const fields = descriptor.searchFields || []
    if (fields.length === 0) return true
    return fields.some((field) => {
      const value = row.original[field]
      return String(value ?? '')
        .toLowerCase()
        .includes(search)
    })
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {descriptor.actions?.create && (
            <Link href={`/admin/${descriptor.table}/new`}>
              <Button color="warning" size="sm" className="flex items-center">
                <PlusIcon className="w-4 h-4 mr-1" />
                Create New
              </Button>
            </Link>
          )}
          {onStatusFilterChange && (
            <Select
              sizing="sm"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          )}
        </div>
        {descriptor.searchFields && (
          <div className="w-full md:w-64">
            <TextInput
              type="text"
              placeholder={`Search by ${descriptor.searchFields.join(', ')}...`}
              value={globalFilter}
              onChange={handleSearchChange}
            />
          </div>
        )}
      </div>

      {loading && data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="w-full overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <Table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {table
                  .getHeaderGroups()
                  .flatMap((headerGroup: HeaderGroup<T>) => headerGroup.headers)
                  .map((header: Header<T, unknown>) => (
                    <Table.HeadCell
                      key={header.id}
                      className="py-3 px-4 text-left text-gray-600 font-medium"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )
                        ) : null}
                      </div>
                    </Table.HeadCell>
                  ))}
              </tr>
            </thead>
            <Table.Body className="divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <Table.Row>
                  <Table.Cell
                    colSpan={descriptor.list.length + (hasActions ? 1 : 0)}
                    className="py-8 text-center text-gray-500"
                  >
                    {globalFilter
                      ? 'No results found'
                      : `No ${descriptor.title.toLowerCase()} yet`}
                  </Table.Cell>
                </Table.Row>
              ) : (
                table.getRowModel().rows.map((row: Row<T>) => (
                  <Table.Row key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                      <Table.Cell
                        key={cell.id}
                        className="py-4 px-4 text-gray-700"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      )}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
