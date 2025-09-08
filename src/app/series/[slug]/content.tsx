'use client'

import { ProcessedArtwork } from '@/types/artwork'
import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ReactElement } from 'react'
import { useCollectionsContext } from './context/useCollectionsContext'

interface InnerCollectionContentProperties {
  email: string
  slug: string
  artworks: ProcessedArtwork[]
}

export default function InnerCollectionContent({
  email,
  slug,
  artworks
}: InnerCollectionContentProperties): ReactElement {
  const {
    artworks: currentArtworks,
    selectedArtworkIndex,
    unfilteredArtworks,
    onChangeArtworks,
    onChangeSelectedArtworkIndex
  } = useCollectionsContext()

  return (
    <ArtMainContent
      email={email}
      source={`series/${slug}`}
      artworks={currentArtworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={unfilteredArtworks}
    />
  )
}
