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
    <section className="flex w-full">
      <div className="flex flex-col w-full h-full justify-end">
        <ImageModal detailedImage={detailedImage}>
          <Image
            src={image}
            width={0}
            height={0}
            alt={name}
            className="w-full h-auto xl:w-auto xl:h-full xl:max-h-[75vh]"
            id="active-image"
          />
        </ImageModal>
      </div>
    </section>
  )
}
