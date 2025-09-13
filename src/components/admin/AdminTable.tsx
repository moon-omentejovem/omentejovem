'use client'

import type { ListColumn, ResourceDescriptor } from '@/types/descriptors'
import { getPublicUrl } from '@/utils/storage'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState
} from '@tanstack/react-table'
import { Button, Table, TextInput } from 'flowbite-react'

interface AdminTableProps<T = any> {
  descriptor: ResourceDescriptor
  data: T[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDuplicate?: (item: T) => void
  onSearch?: (term: string) => void
  onSort?: (field: string, direction: 'asc' | 'desc') => void
  renderCell?: (item: T, column: ListColumn) => React.ReactNode
  onLoadMore?: () => void
  hasMore?: boolean
  onToggleDraft?: (item: T) => void
  onDelete?: (item: T) => void
}

export default function AdminTable<T extends Record<string, any>>({
  descriptor,
  data,
  loading = false,
  onEdit,
  onDuplicate,
  onSearch,
  onSort,
  renderCell,
  onLoadMore,
  hasMore = false,
  onToggleDraft,
  onDelete
}: AdminTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!onLoadMore || !hasMore) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        onLoadMore()
      }
    })
    const el = loadMoreRef.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
    }
  }, [onLoadMore, hasMore, loading])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value)
    onSearch?.(e.target.value)
  }

  const defaultRenderCell = (item: T, column: ListColumn): React.ReactNode => {
    if (renderCell) {
      const custom = renderCell(item, column)
      if (custom !== undefined) return custom
    }
    const value = item[column.key]

    switch (column.render) {
      case 'image':
        const imageUrl = getPublicUrl(value)
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
            className="text-blue-600 hover:underline"
          >
            {value}
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
  }

  const hasActions = Boolean(
    descriptor.actions?.edit ||
      descriptor.actions?.duplicate ||
      descriptor.actions?.delete ||
      onToggleDraft
  )

  const columns = useMemo<ColumnDef<T>[]>(
    () => [
      ...descriptor.list.map((column) => ({
        accessorKey: column.key,
        header: () => column.label,
        cell: ({ row }) => defaultRenderCell(row.original as T, column)
      })),
      {
        id: 'actions',
        header: () => (hasActions ? 'Actions' : null),
        cell: ({ row }) => {
          const item = row.original as T
          return hasActions ? (
            <div className="flex justify-end space-x-2">
              {descriptor.actions?.edit && onEdit && (
                <Button size="xs" color="light" onClick={() => onEdit(item)}>
                  Edit
                </Button>
              )}
              {descriptor.actions?.duplicate && onDuplicate && (
                <Button
                  size="xs"
                  color="light"
                  onClick={() => onDuplicate(item)}
                >
                  Duplicate
                </Button>
              )}
              {typeof onToggleDraft === 'function' && (
                <Button
                  size="xs"
                  color="light"
                  onClick={() => onToggleDraft(item)}
                >
                  {item.status === 'draft' ? 'Publish' : 'Draft'}
                </Button>
              )}
              {descriptor.actions?.delete && onDelete && (
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => onDelete(item)}
                >
                  Delete
                </Button>
              )}
            </div>
          ) : null
        }
      }
    ],
    [
      descriptor.list,
      descriptor.actions,
      onEdit,
      onDuplicate,
      onToggleDraft,
      onDelete,
      hasActions
    ]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: (updater) => {
      setSorting(updater)
      const sort = (typeof updater === 'function'
        ? updater(sorting)
        : updater)[0]
      if (sort) {
        onSort?.(String(sort.id), sort.desc ? 'desc' : 'asc')
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          {descriptor.actions?.create && (
            <Link href={`/admin/${descriptor.table}/new`}>
              <Button color="warning" size="sm" className="flex items-center">
                <PlusIcon className="w-4 h-4 mr-1" />
                Create New
              </Button>
            </Link>
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
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <Table className="min-w-full text-sm">
            <Table.Head className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row
                  key={headerGroup.id}
                  className="border-b border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
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
                </Table.Row>
              ))}
            </Table.Head>
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
                table.getRowModel().rows.map((row) => (
                  <Table.Row key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
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
      {hasMore && data.length > 0 && (
        <div ref={loadMoreRef} className="py-4 text-center text-gray-500">
          {loading ? 'Loading...' : ''}
        </div>
      )}
    </div>
  )
}
