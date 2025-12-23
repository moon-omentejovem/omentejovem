'use client'

import { getProxiedImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { ImageModal } from './Modals/ImageModal'

interface ArtDetails {
  detailedImage?: string
  image: string
  name: string
}

export function ArtDetails({ image, detailedImage, name }: ArtDetails) {
  return (
    <section className="flex items-start sm:px-0 max-h-full">
      <div className="flex sm:w-auto justify-start max-h-full">
        <ImageModal detailedImage={detailedImage}>
          <Image
            src={getProxiedImageUrl(image)}
            width={1200}
            height={1200}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            alt={name}
            className="h-auto w-auto max-h-[calc(100vh-6rem)] max-w-full object-contain xl:mb-[48px]"
            id="active-image"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </ImageModal>
      </div>
    </section>
  )
}
