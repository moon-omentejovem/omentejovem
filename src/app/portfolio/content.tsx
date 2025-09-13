'use client'

import { SimplifiedArtMainContent } from '@/components/ArtContent/SimplifiedArtMainContent'
import { Artwork } from '@/types/artwork'
import { ReactElement } from 'react'

interface PortfolioContentProps {
  artworks: Artwork[]
  initialSelectedIndex?: number
}

export default function PortfolioContent({
  artworks,
  initialSelectedIndex
}: PortfolioContentProps): ReactElement {
  // Clean, simple component without complex state management
  return (
    <SimplifiedArtMainContent
      artworks={artworks}
      initialSelectedIndex={initialSelectedIndex}
      source="portfolio"
      email="contact@omentejovem.com"
      enableFilters={true}
      showGridView={true}
    />
  )
}
