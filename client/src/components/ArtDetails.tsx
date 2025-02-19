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
    <section className="flex items-end sm:px-0 h-full">
      <div className="flex flex-col w-full sm:w-auto justify-center">
        <ImageModal detailedImage={detailedImage}>
          <Image
            src={image}
            width={0}
            height={0}
            alt={name}
            className="w-full h-auto max-w-full max-h-[50vh] xl:max-h-[70vh] object-contain mx-auto sm:mx-0 xl:mb-[48px]"
            id="active-image"
          />
        </ImageModal>
      </div>
    </section>
  )
}
