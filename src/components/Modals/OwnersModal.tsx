import * as Dialog from '@radix-ui/react-dialog'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { Icons } from '../Icons'
import { NftOwner, Owner } from '@/api/resolver/types'
import { modalAnimations } from '@/animations'

interface OwnersModalProps {
  owners: Owner[]
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  children: ReactNode
}

export function OwnersModal({
  owners,
  open,
  setOpen,
  children
}: OwnersModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild aria-label="Infos button">
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 bg-black/[30%] backdrop-blur-sm z-20">
          <Dialog.Content
            className="modal-content fixed left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-full max-w-xl border-[1px] border-[#B1B1B1] bg-background z-30"
            onOpenAutoFocus={() => {
              if (!isAnimating) {
                modalAnimations(setIsAnimating)
              }
            }}
            onInteractOutside={() => {
              setOpen(false)
            }}
          >
            <header className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b-[1px] border-[#B1B1B1] bg-background">
              <p className="underline font-heading">ALL OWNERS</p>
              <Dialog.Close
                onClick={() => {
                  setOpen(false)
                }}
              >
                <Icons.X />
              </Dialog.Close>
            </header>
            <div className="flex-1 overflow-y-auto max-h-[50vh] px-8 py-4">
              <ul>
                {owners.map((owner, index) => (
                  <li key={index} className="mb-2">
                    <a
                      href={`https://etherscan.io/address/${owner.owner_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-50 underline break-all"
                    >
                      {owner.owner_address}
                    </a>{' '}
                    ({owner.quantity})
                  </li>
                ))}
              </ul>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
