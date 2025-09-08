'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ReactElement } from 'react'
import { useEditionsContext } from './context/useEditionsContext'

export default function EditionsContent(): ReactElement {
  const {
    email,
    artworks,
    selectedArtworkIndex,
    unfilteredArtworks,
    onChangeArtworks,
    onChangeSelectedArtworkIndex
  } = useEditionsContext()

  return (
    <ArtMainContent
      email={email}
      source="editions"
      artworks={artworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={unfilteredArtworks}
    />
  )
}
