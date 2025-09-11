'use client'

import { CachedImage } from './CachedImage'
import { ImageModal } from './Modals/ImageModal'

interface ArtDetails {
  detailedImage?: string
  image: string
  name: string
}

export function ArtDetails({ image, detailedImage, name }: ArtDetails) {
  return (
    <section className="flex items-end sm:px-0 max-h-full">
      <div className="flex flex-1 sm:w-auto justify-center max-h-full d-block">
        <ImageModal detailedImage={detailedImage}>
          <CachedImage
            src={image}
            width={800}
            height={800}
            alt={name}
            className="flex flex-1 h-full w-auto xl:mb-[48px]"
            sizes="(max-width: 768px) 100vw, 800px"
            priority={true}
          />
        </ImageModal>
      </div>
    </section>
  )
}
