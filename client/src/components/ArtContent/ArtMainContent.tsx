'use client'

import { ReactElement, useCallback, useState } from 'react'
import { ArtFilter } from '../ArtFilter/ArtFilter'
import { HorizontalCarousel } from '../Carousels/HorizontalCarousel/HorizontalCarousel'
import { VerticalCarousel } from '../Carousels/VerticalCarousel/VerticalCarousel'
import { ArtInfos } from './ArtInfos'
import { NFT } from './types'
import { ChainedFilter } from '../ArtFilter/filters'

interface ArtMainContentProperties {
  email: string
  source: 'portfolio' | '1-1' | 'editions'
  filters: ChainedFilter[]
  unfilteredImages: NFT[]
  onChangeArtImages: (images: NFT[]) => void
  artImages: NFT[]
  selectedArtIndex: number
  onChangeSelectedArtIndex: (index: number) => void
}

export function ArtMainContent({
  email,
  source,
  onChangeArtImages,
  artImages,
  selectedArtIndex,
  onChangeSelectedArtIndex
}: ArtMainContentProperties): ReactElement {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  function onRedirect(index: number): void {
    onChangeSelectedArtIndex(index)
  }

  const renderContent = useCallback((): ReactElement => {
    return (
      <ArtInfos
        email={email}
        selectedArt={artImages[selectedArtIndex]}
        slides={artImages}
        onChangeSlideIndex={onChangeSelectedArtIndex}
        source={source}
      />
    )
  }, [selectedArtIndex])

  if (selectedArtIndex === -1) {
    return (
      <main className="flex flex-col pt-6 h-screenMinusHeader justify-center">
        <HorizontalCarousel
          currentPage={page}
          loading={loading}
          slides={artImages?.map((art) => ({
            name: art.name || '',
            nftCompressedHdUrl: art.image_url || ''
          }))}
          redirectSource={source}
          onRedirect={onRedirect}
        />

        <ArtFilter
          currentPage={page}
          artImages={artImages}
          onChangeArtImages={onChangeArtImages}
        />
      </main>
    )
  }

  return (
    <main className="flex flex-col px-6 2xl:pb-16 2xl:px-20 2xl:pb-8 xl:h-screenMinusHeader">
      <VerticalCarousel
        slideIndex={selectedArtIndex}
        onChangeSlideIndex={onChangeSelectedArtIndex}
        slides={artImages.map((art) => ({
          name: art.name || '',
          nftCompressedHdUrl: art.image_url || ''
        }))}
      />

      {renderContent()}
    </main>
  )
}
