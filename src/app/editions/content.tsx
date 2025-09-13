'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { Artwork } from '@/types/artwork'
import { ReactElement, useCallback, useEffect, useState } from 'react'

interface EditionsContentProps {
  email: string
  artworks?: Artwork[]
}

export default function EditionsContent({
  email,
  artworks = []
}: EditionsContentProps): ReactElement {
  // Use hook with server data as initial data

  // Local state for filtering and selection
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeArtworks = useCallback((newArtworks: Artwork[]) => {
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

  return (
    <ArtMainContent
      email={email}
      source="editions"
      artworks={filteredArtworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={artworks}
    />
  )
}
