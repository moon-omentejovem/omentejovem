'use client'

import { NFT } from '@/api/resolver/types'
import { ArtInfosCollections } from '@/components/ArtContent/ArtInfosCollections'
import { HorizontalInCarousel } from '@/components/Carousels/HorizontalInCarousel/HorizontalInCarousel'
import { ReactElement, useState } from 'react'

interface InnerCollectionContentProperties {
  email: string
  images: Omit<NFT, 'contracts'>[]
}

export function InnerCollectionContent({
  email,
  images
}: InnerCollectionContentProperties): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const selectedArt = images[activeIndex]

  function onChangeSelectedArtIndex(index: number): void {
    setActiveIndex(index)
  }

  function handleMoreSlides() {
    // Busca mais slides
  }

  return (
    <main className="flex flex-col gap-12 px-6 pb-16 xl:px-20 xl:pt-10 xl:pb-8 xl:h-screenMinusHeader">
      <ArtInfosCollections
        email={email}
        selectedArt={selectedArt}
        slides={images}
        onChangeSlideIndex={onChangeSelectedArtIndex}
      />

      {/* <div className="hidden w-[100vw] self-center xl:block">
				<HorizontalInCarousel
					onChangeSlideIndex={onChangeSelectedArtIndex}
					slides={images}
					slideIndex={activeIndex}
					getMoreSlides={() => handleMoreSlides()}
				/>
			</div> */}
    </main>
  )
}
