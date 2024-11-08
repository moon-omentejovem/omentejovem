'use client'

import Image from 'next/image'
import { ImageModal } from './Modals/ImageModal'

interface ArtDetails {
  detailedImage?: string
  image: string
  name: string
}

export function ArtDetails({ image, detailedImage, name }: ArtDetails) {
  return (
    <section className="flex items-center min-h-[50vh] sm:h-full px-4 sm:px-0">
      <div className="flex flex-col w-full justify-center">
        <ImageModal detailedImage={detailedImage}>
          <Image
            src={image}
            width={0}
            height={0}
            alt={name}
            className="w-full h-auto max-w-full max-h-[50vh] sm:max-h-[70vh] object-contain mx-auto"
            id="active-image"
          />
        </ImageModal>
      </div>
    </section>
  )
}
