'use client'

import { ArtContent } from '@/components/ArtContent/ArtContent'
import { Artwork } from '@/types/artwork'
import { ReactElement } from 'react'

interface ArtworkContentProps {
  artworks: Artwork[]
  initialSelectedIndex: number
}

export default function ArtworkContent({
  artworks,
  initialSelectedIndex
}: ArtworkContentProps): ReactElement {
  return (
    <ArtContent
      artworks={artworks}
      initialSelectedIndex={initialSelectedIndex}
      source="1-1"
      email="contact@omentejovem.com"
    />
  )
}
