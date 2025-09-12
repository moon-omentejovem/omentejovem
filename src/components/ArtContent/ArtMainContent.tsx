'use client'

import { ProcessedArtwork } from '@/types/artwork'
import { useRouter } from 'next/navigation'
import { ReactElement, useCallback, useState } from 'react'
import { ArtFilterNew as ArtFilter } from '../ArtFilter/ArtFilterNew'
import { HorizontalCarousel } from '../Carousels/HorizontalCarousel/HorizontalCarousel'
import { VerticalCarousel } from '../Carousels/VerticalCarousel/VerticalCarousel'
import { ArtInfosNew as ArtInfos } from './ArtInfosNew'

interface ArtMainContentProperties {
  email: string
  source: 'portfolio' | '1-1' | 'editions' | string
  unfilteredArtworks: ProcessedArtwork[]
  onChangeArtworks: (artworks: ProcessedArtwork[]) => void
  artworks: ProcessedArtwork[]
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
  const router = useRouter()

  function onRedirect(index: number): void {
    const artwork = artworks[index]
    if (artwork?.slug) {
      // Navegar para a página individual da arte
      router.push(`/${source}/${artwork.slug}`)
    } else {
      // Fallback para o comportamento anterior se não houver slug
      onChangeSelectedArtworkIndex(index)
    }
  }

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
          slides={artworks?.map((artwork) => ({
            name: artwork.title || '',
            nftCompressedHdUrl: artwork.image.url,
            slug: artwork.slug
          }))}
          redirectSource={source}
          onRedirect={onRedirect}
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
        slides={artworks.map((artwork) => ({
          name: artwork.title || '',
          nftCompressedHdUrl: artwork.image.url,
          slug: artwork.slug
        }))}
        redirectSource={source}
        onRedirect={onRedirect}
      />
      {renderContent()}
    </main>
  )
}
