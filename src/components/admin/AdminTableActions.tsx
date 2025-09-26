'use client'

import { useConfirm } from '@/hooks/useConfirm'
import type { ResourceDescriptor } from '@/types/descriptors'
import { Button, Tooltip } from 'flowbite-react'
import {
  CheckCircle2Icon,
  CopyIcon,
  FileTextIcon,
  PencilIcon,
  Trash2Icon
} from 'lucide-react'

interface AdminTableActionsProps<T extends { status?: string }> {
  item: T
  descriptor: ResourceDescriptor
  onEdit?: (item: T) => void
  onDuplicate?: (item: T) => void
  onToggleDraft?: (item: T) => void
  onDelete?: (item: T) => void
}

export default function AdminTableActions<T extends { status?: string }>({
  item,
  descriptor,
  onEdit,
  onDuplicate,
  onToggleDraft,
  onDelete
}: AdminTableActionsProps<T>) {
  const confirm = useConfirm()
  const actions = descriptor.actions
  const hasActions =
    actions?.edit ||
    actions?.duplicate ||
    onToggleDraft ||
    (actions?.delete && onDelete)

  if (!hasActions) return null

  return (
    <div className="flex flex-wrap justify-end gap-3">
      {actions?.edit && onEdit && (
        <Tooltip content={'Edit'}>
          <Button
            size="sm"
            color="light"
            onClick={() => onEdit(item)}
            aria-label="Edit"
          >
            <PencilIcon className="w-5 h-5" />
          </Button>
        </Tooltip>
      )}
      {actions?.duplicate && onDuplicate && (
        <Tooltip content={'Duplicate'}>
          <Button
            size="sm"
            color="light"
            onClick={() => onDuplicate(item)}
            aria-label="Duplicate"
          >
            <CopyIcon className="w-5 h-5" />
          </Button>
        </Tooltip>
      )}
      {onToggleDraft && (
        <Tooltip content={item.status === 'draft' ? 'Publish' : 'Draft'}>
          <Button
            size="sm"
            color={item.status === 'draft' ? 'success' : 'warning'}
            aria-label={item.status === 'draft' ? 'Publish' : 'Draft'}
            onClick={async () => {
              const current = item.status || 'published'
              const next = current === 'draft' ? 'published' : 'draft'
              const ok = await confirm({
                title: 'Change status',
                message: `Change status from ${current} to ${next}?`
              })
              if (ok) {
                onToggleDraft(item)
              }
            }}
          >
            {item.status === 'draft' ? (
              <CheckCircle2Icon className="w-5 h-5" />
            ) : (
              <FileTextIcon className="w-5 h-5" />
            )}
          </Button>
        </Tooltip>
      )}
      {actions?.delete && onDelete && (
        <Tooltip content={'Delete'}>
          <Button
            size="sm"
            color="failure"
            onClick={async () => {
              const ok = await confirm({
                title: 'Delete item',
                message:
                  'Are you sure you want to delete this item permanently?'
              })
              if (ok) {
                onDelete(item)
              }
            }}
            aria-label="Delete"
          >
            <Trash2Icon className="w-5 h-5" />
          </Button>
        </Tooltip>
      )}
    </div>
  )
}
