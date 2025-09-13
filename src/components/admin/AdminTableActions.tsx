'use client'

import { Button } from 'flowbite-react'
import type { ResourceDescriptor } from '@/types/descriptors'
import {
  CopyIcon,
  PencilIcon,
  FileQuestionIcon,
  CheckCircle2Icon
} from 'lucide-react'

interface AdminTableActionsProps<T extends { status?: string }> {
  item: T
  descriptor: ResourceDescriptor
  onEdit?: (item: T) => void
  onDuplicate?: (item: T) => void
  onToggleDraft?: (item: T) => void
}

export default function AdminTableActions<T extends { status?: string }>(
  {
    item,
    descriptor,
    onEdit,
    onDuplicate,
    onToggleDraft
  }: AdminTableActionsProps<T>
) {
  const actions = descriptor.actions
  const hasActions = actions?.edit || actions?.duplicate || onToggleDraft

  if (!hasActions) return null

  return (
    <div className="flex flex-wrap justify-end gap-3">
      {actions?.edit && onEdit && (
        <Button
          size="sm"
          color="light"
          onClick={() => onEdit(item)}
          aria-label="Edit"
        >
          <PencilIcon className="w-5 h-5" />
        </Button>
      )}
      {actions?.duplicate && onDuplicate && (
        <Button
          size="sm"
          color="light"
          onClick={() => onDuplicate(item)}
          aria-label="Duplicate"
        >
          <CopyIcon className="w-5 h-5" />
        </Button>
      )}
      {onToggleDraft && (
        <Button
          size="sm"
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
            <CheckCircle2Icon className="w-5 h-5" />
          ) : (
            <FileQuestionIcon className="w-5 h-5" />
          )}
        </Button>
      )}
    </div>
  )
}

