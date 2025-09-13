'use client'

import { ArtContent } from '@/components/ArtContent/ArtContent'
import { Artwork } from '@/types/artwork'
import { ReactElement } from 'react'

interface OneOfOneContentProps {
  artworks: Artwork[]
}

export default function OneOfOneContent({
  artworks
}: OneOfOneContentProps): ReactElement {
  // No more hooks, no more prop drilling, no more complex state management
  // Just pass the server data to the simplified component
  return (
    <ArtContent
      artworks={artworks}
      source="1-1"
      email="contact@omentejovem.com"
      showGridView={true}
    />
  )
}
