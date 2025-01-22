import { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { CustomIcons } from '@/assets/icons'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import Image from 'next/image'

interface ImageModalProperties {
  children: ReactNode
  detailedImage?: string
  collectionsMode?: boolean
}

export function ImageModal({
  children,
  detailedImage,
  collectionsMode
}: ImageModalProperties) {
  const [scaleX, setScaleX] = useState(1)
  const [scaleY, setScaleY] = useState(1)
  const [rotation, setRotation] = useState(0)

  function flipImage() {
    const imageElement = document.querySelector<HTMLImageElement>(
      '#modal-wrapper #active-image'
    )

    if (imageElement) {
      imageElement.style.scale = `${scaleX} ${scaleY}`
    }
  }

  function rotateImage() {
    const imageElement = document.querySelector<HTMLImageElement>(
      '#modal-wrapper #active-image'
    )

    if (imageElement) {
      imageElement.style.rotate = `${rotation}deg`
    }
  }

  function removeOverflowHidden() {
    const modalWrapper = document.querySelector<HTMLImageElement>(
      '#modal-wrapper .react-transform-wrapper'
    )

    if (modalWrapper) {
      modalWrapper.style.overflow = 'visible'
    }
  }

  function updateContainerSize() {
    const imageElement = document.querySelector<HTMLImageElement>(
      '#modal-wrapper #active-image'
    )
    const container = document.querySelector<HTMLElement>('#modal-wrapper')

    if (imageElement && container) {
      const isRotated = rotation % 180 !== 0
      if (isRotated) {
        container.style.height = '70vh'
        container.style.maxHeight = 'none'
      } else {
        container.style.height = 'auto'
        container.style.maxHeight = '70vh'
      }
    }
  }

  useEffect(() => {
    flipImage()
  }, [scaleX, scaleY])

  useEffect(() => {
    rotateImage()
    updateContainerSize()
  }, [rotation])

  return (
    <Dialog.Root
      onOpenChange={() => {
        setScaleX(1)
        setScaleY(1)
        setRotation(0)
      }}
    >
      <Dialog.Trigger
        aria-label="Image modal"
        className={cn(collectionsMode && 'flex items-end')}
      >
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/[30%] backdrop-blur-sm z-20" />
        <Dialog.Content>
          <div
            id="modal-wrapper"
            className="fixed w-auto h-auto flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 md:w-auto overflow-visible"
          >
            <TransformWrapper onInit={() => removeOverflowHidden()}>
              <TransformComponent>
                <div
                  className={cn(
                    'grid place-content-center',
                    collectionsMode ? '*:!max-h-[60vh]' : '*:max-h-[65vh]'
                  )}
                >
                  {!!detailedImage ? (
                    <Image
                      src={detailedImage}
                      width={0}
                      height={0}
                      alt={'High resolution'}
                      className="w-auto h-auto object-contain"
                      id="active-image"
                    />
                  ) : (
                    children
                  )}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>

          <div className="flex fixed bottom-8 left-1/2 -translate-x-1/2 justify-center gap-2 z-30">
            <button
              onClick={() => {
                setScaleX((previousX) => -previousX)
              }}
              aria-label="Flip image horizontally"
              className="group grid place-content-center"
            >
              <CustomIcons.FlipHorizontal className="text-black group-hover:text-primary-50" />
            </button>
            <button
              onClick={() => {
                setScaleY((previousY) => -previousY)
              }}
              aria-label="Flip image vertically"
              className="group grid place-content-center"
            >
              <CustomIcons.FlipVertical className="text-black group-hover:text-primary-50" />
            </button>
            <button
              onClick={() => {
                setRotation((oldRotation) => {
                  let orientation = (oldRotation + 90) % 360
                  if (orientation < 0) orientation += 360

                  return orientation
                })
              }}
              aria-label="Rotate image 90 degrees clockwise"
              className="group grid place-content-center"
            >
              <CustomIcons.RotateClockwise className="text-black group-hover:text-primary-50" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
