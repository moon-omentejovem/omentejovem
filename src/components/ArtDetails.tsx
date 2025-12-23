"use client"

import { LoadingSpinner } from '@/components/ui/Skeleton'
import { getProxiedImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ImageModal } from './Modals/ImageModal'

interface ArtDetails {
  detailedImage?: string
  image: string
  name: string
}

export function ArtDetails({ image, detailedImage, name }: ArtDetails) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
  }, [image])

  return (
    <section className="flex items-end sm:px-0">
      <div className="relative flex sm:w-auto justify-start">
        <ImageModal detailedImage={detailedImage}>
          <Image
            src={getProxiedImageUrl(image)}
            width={1200}
            height={1200}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            alt={name}
            className={`h-auto w-auto max-h-[calc(100vh-12rem)] max-w-full object-contain ${
              isLoading ? 'opacity-0' : ''
            }`}
            id="active-image"
            onLoadingComplete={() => setIsLoading(false)}
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </ImageModal>

        {isLoading ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-background">
            <LoadingSpinner size="md" className="text-primary-50 mb-1" />
            <p className="text-xs uppercase tracking-[0.2em] text-secondary-200">
              Loading
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
