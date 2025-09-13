'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ProcessedArtwork } from '@/types/artwork'
import { ReactElement, useCallback, useState } from 'react'

interface SeriesContentWrapperProperties {
  email: string
  slug: string
  initialArtworks: ProcessedArtwork[]
}

function InnerCollectionContent({
  email,
  slug,
  artworks
}: {
  email: string
  slug: string
  artworks: ProcessedArtwork[]
}): ReactElement {
  const [currentArtworks, setCurrentArtworks] =
    useState<ProcessedArtwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeArtworks = useCallback((newArtworks: ProcessedArtwork[]) => {
    setCurrentArtworks([...newArtworks])
  }, [])

  const onChangeSelectedArtworkIndex = useCallback((index: number) => {
    setSelectedArtworkIndex(index)
  }, [])

  return (
    <ArtMainContent
      email={email}
      source={`series/${slug}`}
      artworks={currentArtworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={artworks}
    />
  )
}

export default function SeriesContentWrapper({
  email,
  slug,
  initialArtworks
}: SeriesContentWrapperProperties): ReactElement {
  if (initialArtworks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Artworks Found</h1>
          <p className="text-neutral-400">
            This series doesn&apos;t have any artworks yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <InnerCollectionContent
      email={email}
      slug={slug}
      artworks={initialArtworks}
    />
  )
}
