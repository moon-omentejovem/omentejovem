'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ReactElement } from 'react'
import { usePortfolioContext } from './context/usePortfolioContext'

export default function PortfolioContent(): ReactElement {
  const {
    email,
    artworks,
    selectedArtworkIndex,
    unfilteredArtworks,
    onChangeArtworks,
    onChangeSelectedArtworkIndex
  } = usePortfolioContext()

  return (
    <ArtMainContent
      email={email}
      source="portfolio"
      artworks={artworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={unfilteredArtworks}
    />
  )
}
