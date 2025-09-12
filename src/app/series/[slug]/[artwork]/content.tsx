'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ProcessedArtwork } from '@/types/artwork'
import { ReactElement, useCallback, useState } from 'react'

interface ArtworkContentProps {
  email: string
  initialArtworks: ProcessedArtwork[]
  initialSelectedIndex: number
  seriesSlug: string
}

export default function ArtworkContent({
  email,
  initialArtworks,
  initialSelectedIndex,
  seriesSlug
}: ArtworkContentProps): ReactElement {
  const [artworks, setArtworks] = useState<ProcessedArtwork[]>(initialArtworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] =
    useState(initialSelectedIndex)

  const onChangeArtworks = useCallback((newArtworks: ProcessedArtwork[]) => {
    setArtworks(newArtworks)
  }, [])

  const onChangeSelectedArtworkIndex = useCallback((index: number) => {
    setSelectedArtworkIndex(index)
  }, [])

  return (
    <ArtMainContent
      email={email}
      source={`series/${seriesSlug}`}
      artworks={artworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={initialArtworks}
    />
  )
}
