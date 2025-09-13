'use client'

import { Button } from 'flowbite-react'
import type { ResourceDescriptor } from '@/types/descriptors'
import {
  CopyIcon,
  PencilIcon,
  Trash2Icon,
  FileQuestionIcon,
  CheckCircle2Icon
} from 'lucide-react'

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
        <Button
          size="xs"
          color="light"
          onClick={() => onEdit(item)}
          aria-label="Edit"
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
      )}
      {actions?.duplicate && onDuplicate && (
        <Button
          size="xs"
          color="light"
          onClick={() => onDuplicate(item)}
          aria-label="Duplicate"
        >
          <CopyIcon className="w-4 h-4" />
        </Button>
      )}
      {onToggleDraft && (
        <Button
          size="xs"
          color={item.status === 'draft' ? 'success' : 'warning'}
          aria-label={item.status === 'draft' ? 'Publish' : 'Draft'}
          onClick={() => {
            const current = item.status || 'published'
            const next = current === 'draft' ? 'published' : 'draft'
            if (confirm(`Change status from ${current} to ${next}?`)) {
              onToggleDraft(item)
            }
          }}
        >
          {item.status === 'draft' ? (
            <CheckCircle2Icon className="w-4 h-4" />
          ) : (
            <FileQuestionIcon className="w-4 h-4" />
          )}
        </Button>
      )}
      {actions?.delete && onDelete && (
        <Button
          size="xs"
          color="failure"
          onClick={() => onDelete(item)}
          aria-label="Delete"
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}

