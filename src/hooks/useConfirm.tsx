import { createContext, useContext, useState, type ReactNode } from 'react'
import { Button, Modal } from 'flowbite-react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)

  const confirm: ConfirmFn = (opts) => {
    setOptions(opts)
    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }

  const handleClose = (result: boolean) => {
    resolver?.(result)
    setOptions(null)
    setResolver(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal show={!!options} onClose={() => handleClose(false)} popup>
        <Modal.Header>{options?.title || 'Confirm'}</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <p className="mb-5 text-sm text-gray-500">{options?.message}</p>
            <div className="flex justify-center gap-4">
              <Button color="gray" onClick={() => handleClose(false)}>
                {options?.cancelText || 'Cancel'}
              </Button>
              <Button color="failure" onClick={() => handleClose(true)}>
                {options?.confirmText || 'Confirm'}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context
}
