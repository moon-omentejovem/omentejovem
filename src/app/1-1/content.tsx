'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ReactElement } from 'react'
import { useOneOfOneContext } from './context/useOneOfOneContext'

export default function OneOfOneContent(): ReactElement {
  const {
    email,
    artworks,
    selectedArtworkIndex,
    unfilteredArtworks,
    onChangeArtworks,
    onChangeSelectedArtworkIndex
  } = useOneOfOneContext()

  return (
    <ArtMainContent
      email={email}
      source="1-1"
      artworks={artworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={unfilteredArtworks}
    />
  )
}
