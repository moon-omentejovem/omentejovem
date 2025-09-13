'use client'

import { useCarouselNavigation } from '@/hooks/useCarouselNavigation'
import { Artwork } from '@/types/artwork'
import { getArtworkImageUrls } from '@/utils/storage'
import { ReactElement, useCallback, useState } from 'react'
import { ArtFilterNew as ArtFilter } from '../ArtFilter/ArtFilterNew'
import { HorizontalCarousel } from '../HorizontalCarousel/HorizontalCarousel'
import { VerticalCarousel } from '../VerticalCarousel/VerticalCarousel'
import { ArtInfosNew as ArtInfos } from './ArtInfosNew'

interface ArtMainContentProperties {
  email: string
  source: 'portfolio' | '1-1' | 'editions' | string
  unfilteredArtworks: Artwork[]
  onChangeArtworks: (artworks: Artwork[]) => void
  artworks: Artwork[]
  selectedArtworkIndex: number
  onChangeSelectedArtworkIndex: (index: number) => void
}

export function ArtMainContent({
  email,
  source,
  onChangeArtworks,
  artworks,
  selectedArtworkIndex,
  onChangeSelectedArtworkIndex
}: ArtMainContentProperties): ReactElement {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const { handleNavigation } = useCarouselNavigation({
    source,
    artworks,
    onChangeIndex: onChangeSelectedArtworkIndex
  })

  // Wrapper para controlar o tipo de navegação
  const handleNavigationWrapper = useCallback(
    (index: number, replace = false) => {
      handleNavigation(index, replace)
    },
    [handleNavigation]
  )

  const renderContent = useCallback((): ReactElement => {
    return (
      <ArtInfos
        email={email}
        selectedArtwork={artworks[selectedArtworkIndex]}
        slides={artworks}
        onChangeSlideIndex={onChangeSelectedArtworkIndex}
        source={source}
      />
    )
  }, [
    artworks,
    email,
    onChangeSelectedArtworkIndex,
    selectedArtworkIndex,
    source
  ])

  if (selectedArtworkIndex === -1) {
    return (
      <main className="flex flex-col pt-6 h-screenMinusHeader justify-center">
        <HorizontalCarousel
          currentPage={page}
          loading={loading}
          slides={artworks?.map((artwork) => {
            const imageUrls = getArtworkImageUrls(artwork)
            return {
              name: artwork.title || '',
              nftCompressedHdUrl: imageUrls.optimizedUrl || '',
              slug: artwork.slug
            }
          })}
          redirectSource={source}
          onRedirect={handleNavigationWrapper}
        />

        <ArtFilter
          currentPage={page}
          artImages={artworks}
          onChangeArtImages={onChangeArtworks}
        />
      </main>
    )
  }

  return (
    <main className="p-8 md:px-12 lg:px-20 flex flex-col sm:px-6 2xl:pb-8 2xl:px-20 xl:h-screenMinusHeader overflow-hidden xl:overflow-auto">
      <VerticalCarousel
        slideIndex={selectedArtworkIndex}
        onChangeSlideIndex={onChangeSelectedArtworkIndex}
        slides={artworks.map((artwork) => {
          const imageUrls = getArtworkImageUrls(artwork)
          return {
            name: artwork.title || '',
            nftCompressedHdUrl: imageUrls.optimizedUrl || '',
            slug: artwork.slug
          }
        })}
        redirectSource={source}
        onRedirect={handleNavigationWrapper}
      />
      {renderContent()}
    </main>
  )
}
