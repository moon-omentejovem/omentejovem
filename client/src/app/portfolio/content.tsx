'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ReactElement } from 'react'
import { usePortfolioContext } from './context/usePortfolioContext'

export default function PortfolioContent(): ReactElement {
  const {
    email,
    artImages,
    selectedArtIndex,
    unfilteredImages,
    onChangeArtImages,
    onChangeSelectedArtIndex
  } = usePortfolioContext()

  console.log('!!!!', artImages)

  return (
    <ArtMainContent
      email={email}
      source="portfolio"
      artImages={artImages}
      onChangeArtImages={onChangeArtImages}
      onChangeSelectedArtIndex={onChangeSelectedArtIndex}
      selectedArtIndex={selectedArtIndex}
      unfilteredImages={unfilteredImages}
    />
  )
}
