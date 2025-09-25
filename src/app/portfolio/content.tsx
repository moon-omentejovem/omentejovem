import { ArtContent } from '@/components/ArtContent/ArtContent'
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
    <ArtContent
      artworks={artworks}
      initialSelectedIndex={initialSelectedIndex}
      source="portfolio"
      email="contact@omentejovem.com"
      showGridView={true}
    />
  )
}
