'use client'

import { ArtContent } from '@/components/ArtContent/ArtContent'
import { Artwork } from '@/types/artwork'
import { ReactElement } from 'react'

interface EditionsContentProps {
  artworks: Artwork[]
}

export default function EditionsContent({
  artworks
}: EditionsContentProps): ReactElement {
  return (
    <ArtContent
      artworks={artworks}
      source="editions"
      contactEmail="contact@omentejovem.com"
      enableGridView={true}
    />
  )
}
