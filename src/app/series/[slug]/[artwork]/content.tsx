'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { Artwork } from '@/types/artwork'
import { ReactElement, useCallback, useState } from 'react'

interface ArtworkContentProps {
  email: string
  initialArtworks: Artwork[]
  initialSelectedIndex: number
  seriesSlug: string
}

export default function ArtworkContent({
  email,
  initialArtworks,
  initialSelectedIndex,
  seriesSlug
}: ArtworkContentProps): ReactElement {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] =
    useState(initialSelectedIndex)

  const onChangeArtworks = useCallback((newArtworks: Artwork[]) => {
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
