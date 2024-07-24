import { modalAnimations } from '@/animations'
import * as Dialog from '@radix-ui/react-dialog'
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState
} from 'react'
import { Icons } from '../Icons'

interface OfferModalProperties {
  email: string
  children: ReactNode
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function OfferModal({
  email,
  children,
  open,
  setOpen
}: OfferModalProperties) {
  const [isAnimating, setIsAnimating] = useState(false)

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger asChild aria-label="Infos button">
        {children}
      </Dialog.Trigger>

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
            <p className="underline font-heading">MAKE OFFER</p>
            <Dialog.Close
              onClick={() => {
                setOpen(false)
              }}
            >
              <Icons.X />
            </Dialog.Close>
          </header>
          <p className="py-12 px-8 font-heading leading-5">
            Thank you for your interest in purchasing my art!
            <br />
            <br />
            Please contact me via email at{' '}
            <a className="text-primary-50 underline" href={`mailto:${email}`}>
              {email}
            </a>{' '}
            or send me a direct message on{' '}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://twitter.com/omentejovem"
            >
              Twitter
            </a>{' '}
            for further info.
            <br />
            <br />I will be more than happy to get back to you!
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
