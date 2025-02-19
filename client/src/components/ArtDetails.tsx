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
    <section className="flex items-end sm:px-0 max-h-full">
      <div className="flex flex-1 sm:w-auto justify-center max-h-full d-block">
        <ImageModal detailedImage={detailedImage}>
          <Image
            src={image}
            width={0}
            height={0}
            alt={name}
            className="flex flex-1 h-full w-auto xl:mb-[48px]"
            id="active-image"
          />
        </ImageModal>
      </div>
    </section>
  )
}
