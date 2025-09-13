'use client'

import { SimplifiedArtMainContent } from '@/components/ArtContent/SimplifiedArtMainContent'
import { Artwork } from '@/types/artwork'
import { ReactElement } from 'react'

interface EditionsContentProps {
  artworks: Artwork[]
}

export default function EditionsContent({
  artworks
}: EditionsContentProps): ReactElement {
  return (
    <SimplifiedArtMainContent
      artworks={artworks}
      source="editions"
      email="contact@omentejovem.com"
      enableFilters={true}
      showGridView={true}
    />
  )
}
