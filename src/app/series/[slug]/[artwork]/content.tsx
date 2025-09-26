'use client'

import { ArtContent } from '@/components/ArtContent/ArtContent'
import { Artwork } from '@/types/artwork'
import { ReactElement } from 'react'

interface ArtworkContentProps {
  artworks: Artwork[]
  initialSelectedIndex: number
  seriesSlug: string
}

export default function ArtworkContent({
  artworks,
  initialSelectedIndex,
  seriesSlug
}: ArtworkContentProps): ReactElement {
  return (
    <ArtContent
      artworks={artworks}
      initialSelectedIndex={initialSelectedIndex}
      source={`series/${seriesSlug}`}
      contactEmail="contact@omentejovem.com"
    />
  )
}
