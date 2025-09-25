'use client'

import { CalloutParallax } from '@/components/CalloutParallax'
import { useHomeArtworks } from '@/hooks'
import type { HomeImage } from '@/types/home'
import { getImageUrlFromId } from '@/utils/storage'
import { ReactElement } from 'react'

interface HomeContentProperties {
  initialImages: HomeImage[]
  title: string
  subtitle: string
}

export default function HomeContent({
  initialImages,
  title,
  subtitle
}: HomeContentProperties): ReactElement {
  const { data } = useHomeArtworks(10)

  const images: HomeImage[] = data
    ? data.map((artwork) => ({
        title: artwork.title,
        imageUrl:
          artwork.id && (artwork.image_filename || artwork.slug)
            ? getImageUrlFromId(
                artwork.id,
                artwork.image_filename || artwork.slug,
                'artworks',
                'optimized'
              )
            : '',
        createdAt: artwork.posted_at || artwork.created_at || ''
      }))
    : initialImages

  return (
    <main className="flex flex-col">
      <CalloutParallax
        title={title}
        subtitle={subtitle}
        calloutImages={images}
      />
    </main>
  )
}
