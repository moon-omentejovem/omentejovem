'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { useArtworks } from '@/hooks'
import { ProcessedArtwork } from '@/types/artwork'
import { ReactElement, useCallback, useEffect, useState } from 'react'

interface OneOfOneContentProps {
  email: string
  initialArtworks?: ProcessedArtwork[]
}

export default function OneOfOneContent({
  email,
  initialArtworks = []
}: OneOfOneContentProps): ReactElement {
  // Use hook with server data as initial data
  const {
    data: artworks = initialArtworks,
    isLoading,
    error
  } = useArtworks({ oneOfOne: true, enabled: true })

  // Local state for filtering and selection
  const [filteredArtworks, setFilteredArtworks] =
    useState<ProcessedArtwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeArtworks = useCallback((newArtworks: ProcessedArtwork[]) => {
    setFilteredArtworks(newArtworks)
  }, [])

  const onChangeSelectedArtworkIndex = useCallback((index: number) => {
    setSelectedArtworkIndex(index)
  }, [])

  // Update filtered artworks when data changes
  useEffect(() => {
    if (artworks && artworks !== filteredArtworks) {
      setFilteredArtworks(artworks)
    }
  }, [artworks, filteredArtworks])

  if (isLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading 1/1 artworks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Error Loading 1/1 Artworks
          </h1>
          <p className="text-neutral-400">
            {(error as Error)?.message || 'An error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ArtMainContent
      email={email}
      source="1-1"
      artworks={filteredArtworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={artworks}
    />
  )
}
