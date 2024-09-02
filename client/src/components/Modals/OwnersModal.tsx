import * as Dialog from '@radix-ui/react-dialog'
import { Dispatch, SetStateAction, useState } from 'react'
import { Icons } from '../Icons'
import { NftOwner } from '@/api/resolver/types'
import { modalAnimations } from '@/animations'

interface OwnersModalProps {
  owners: NftOwner[]
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function OwnersModal({ owners, open, setOpen }: OwnersModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger
        asChild
        aria-label="Previous Owners button"
      ></Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/[30%] backdrop-blur-sm z-20" />
        <Dialog.Content
          className="modal-content fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl border-[1px] border-black bg-background z-30"
          onOpenAutoFocus={() => {
            if (!isAnimating) {
              modalAnimations(setIsAnimating)
            }
          }}
          onInteractOutside={() => {
            setOpen(false)
          }}
        >
          <header className="flex flex-row justify-between px-8 py-4 border-b-[1px] border-black">
            <p className="underline font-heading">ALL OWNERS</p>
            <Dialog.Close
              onClick={() => {
                setOpen(false)
              }}
            >
              <Icons.X />
            </Dialog.Close>
          </header>
          <div className="py-12 px-8">
            <ul>
              {owners.map((owner, index) => (
                <li key={index} className="mb-2">
                  <a
                    href={owner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-50 underline"
                  >
                    {owner.address}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
