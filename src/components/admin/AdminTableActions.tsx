'use client'

import { Button } from 'flowbite-react'
import type { ResourceDescriptor } from '@/types/descriptors'

interface AdminTableActionsProps<T extends { status?: string }> {
  item: T
  descriptor: ResourceDescriptor
  onEdit?: (item: T) => void
  onDuplicate?: (item: T) => void
  onToggleDraft?: (item: T) => void
  onDelete?: (item: T) => void
}

export default function AdminTableActions<T extends { status?: string }>(
  {
    item,
    descriptor,
    onEdit,
    onDuplicate,
    onToggleDraft,
    onDelete
  }: AdminTableActionsProps<T>
) {
  const actions = descriptor.actions
  const hasActions =
    actions?.edit || actions?.duplicate || actions?.delete || onToggleDraft

  if (!hasActions) return null

  return (
    <div className="flex justify-end space-x-2">
      {actions?.edit && onEdit && (
        <Button size="xs" color="light" onClick={() => onEdit(item)}>
          Edit
        </Button>
      )}
      {actions?.duplicate && onDuplicate && (
        <Button size="xs" color="light" onClick={() => onDuplicate(item)}>
          Duplicate
        </Button>
      )}
      {onToggleDraft && (
        <Button
          size="xs"
          color="light"
          onClick={() => onToggleDraft(item)}
        >
          {item.status === 'draft' ? 'Publish' : 'Draft'}
        </Button>
      )}
      {actions?.delete && onDelete && (
        <Button size="xs" color="failure" onClick={() => onDelete(item)}>
          Delete
        </Button>
      )}
    </div>
  )
}

