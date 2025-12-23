'use client'

import { ImageModal } from '@/components/Modals/ImageModal'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import { cn, getProxiedImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface ArtifactInternalGalleryProps {
  title: string
  images: string[]
}

export function ArtifactInternalGallery({
  title,
  images
}: ArtifactInternalGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  if (!images.length) {
    return null
  }

  const activeImage = images[activeIndex]

  const handlePrevious = () => {
    if (images.length <= 1) return
    setIsLoading(true)
    setActiveIndex((previous) =>
      previous === 0 ? images.length - 1 : previous - 1
    )
  }

  const handleNext = () => {
    if (images.length <= 1) return
    setIsLoading(true)
    setActiveIndex((previous) =>
      previous === images.length - 1 ? 0 : previous + 1
    )
  }

  return (
    <div className="flex flex-col gap-[2px]">
      <div className="relative w-full max-w-[712px] aspect-[16/9] md:aspect-[712/580] bg-black xl:w-[712px] xl:h-[580px]">
        <ImageModal detailedImage={activeImage}>
          <Image
            src={getProxiedImageUrl(activeImage)}
            alt={title}
            fill
            className={cn(
              'object-contain transition-opacity',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 712px"
            onLoadingComplete={() => setIsLoading(false)}
            priority
          />
        </ImageModal>

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <LoadingSpinner size="md" className="text-primary-50 mb-2" />
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-200">
              Loading
            </p>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid w-full max-w-[712px] grid-cols-3 gap-[2px]">
          {images.slice(0, 4).map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => {
                setIsLoading(true)
                setActiveIndex(index)
              }}
              className={cn(
                'relative bg-black aspect-[4/3] w-full border border-transparent',
                index === activeIndex && 'border-secondary-100'
              )}
            >
              <Image
                src={getProxiedImageUrl(src)}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 236px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
