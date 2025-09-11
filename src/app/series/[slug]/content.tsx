'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { useSeriesArtworks } from '@/hooks/useSeries'
import { ProcessedArtwork } from '@/types/artwork'
import { ReactElement, useCallback, useState } from 'react'

interface SeriesContentWrapperProperties {
  email: string
  slug: string
}

interface InnerCollectionContentProperties {
  email: string
  slug: string
  artworks: ProcessedArtwork[]
}

function InnerCollectionContent({
  email,
  slug,
  artworks
}: InnerCollectionContentProperties): ReactElement {
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
  slug
}: SeriesContentWrapperProperties): ReactElement {
  const {
    data: artworks = [],
    isLoading,
    error
  } = useSeriesArtworks({
    seriesSlug: slug,
    enabled: true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading series artworks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Artworks</h1>
          <p className="text-neutral-400">
            {error instanceof Error ? error.message : 'Failed to load artworks'}
          </p>
        </div>
      </div>
    )
  }

  if (artworks.length === 0) {
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
    <InnerCollectionContent email={email} slug={slug} artworks={artworks} />
  )
}
