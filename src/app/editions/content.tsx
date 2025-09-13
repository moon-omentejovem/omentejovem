'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { Artwork } from '@/types/artwork'
import { ReactElement, useCallback, useEffect, useState } from 'react'

interface EditionsContentProps {
  email: string
  initialArtworks?: Artwork[]
}

export default function EditionsContent({
  email,
  initialArtworks = []
}: EditionsContentProps): ReactElement {
  // Use hook with server data as initial data

  // Local state for filtering and selection
  const [filteredArtworks, setFilteredArtworks] =
    useState<Artwork[]>(initialArtworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeArtworks = useCallback((newArtworks: Artwork[]) => {
    setFilteredArtworks(newArtworks)
  }, [])

  const onChangeSelectedArtworkIndex = useCallback((index: number) => {
    setSelectedArtworkIndex(index)
  }, [])

  // Update filtered artworks when data changes
  useEffect(() => {
    if (initialArtworks && initialArtworks !== filteredArtworks) {
      setFilteredArtworks(initialArtworks)
    }
  }, [initialArtworks, filteredArtworks])

  return (
    <ArtMainContent
      email={email}
      source="editions"
      artworks={filteredArtworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={initialArtworks}
    />
  )
}
