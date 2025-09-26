'use client'

import { ArtContent } from '@/components/ArtContent/ArtContent'
import { Artwork } from '@/types/artwork'
import { ReactElement } from 'react'

interface SeriesContentWrapperProperties {
  artworks: Artwork[]
  initialSelectedIndex?: number
  seriesInfo?: any
}

export default function SeriesContentWrapper({
  artworks,
  initialSelectedIndex,
  seriesInfo
}: SeriesContentWrapperProperties): ReactElement {
  if (artworks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Artworks Found</h1>
          <p className="text-neutral-400">
            This series doesn&apos;t have any artworks yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ArtContent
      artworks={artworks}
      initialSelectedIndex={initialSelectedIndex}
      source={`series/${seriesInfo?.slug || 'unknown'}`}
      contactEmail="contact@omentejovem.com"
      enableGridView={true}
    />
  )
}
