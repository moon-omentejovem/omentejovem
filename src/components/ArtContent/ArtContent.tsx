/**
 * ArtContent - Main component for displaying artwork galleries
 *
 * Optimized for SSR with minimal prop-drilling.
 * All data is received pre-processed from server components.
 */

'use client'

import type { Artwork } from '@/types/artwork'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { HorizontalCarousel } from '../HorizontalCarousel/HorizontalCarousel'
import { VerticalCarousel } from '../VerticalCarousel/VerticalCarousel'
import { ArtInfo } from './ArtInfo'

interface ArtContentProps {
  artworks: Artwork[]
  initialSelectedIndex?: number
  source: 'portfolio' | '1-1' | 'editions' | string
  contactEmail?: string
  enableGridView?: boolean
}

export function ArtContent({
  artworks,
  initialSelectedIndex = -1,
  source,
  contactEmail = 'contact@omentejovem.com',
  enableGridView = true
}: ArtContentProps): ReactElement {
  const sanitizedInitialIndex = useMemo(() => {
    if (initialSelectedIndex < 0) {
      return -1
    }

    return initialSelectedIndex < artworks.length ? initialSelectedIndex : -1
  }, [artworks.length, initialSelectedIndex])

  const [selectedIndex, setSelectedIndex] = useState<number>(sanitizedInitialIndex)

  useEffect(() => {
    setSelectedIndex(sanitizedInitialIndex)
  }, [sanitizedInitialIndex, artworks])

  const slides = useMemo(
    () =>
      artworks.map((artwork) => ({
        name: artwork.title || '',
        imageUrl: artwork.imageoptimizedurl || null,
        slug: artwork.slug
      })),
    [artworks]
  )

  const handleSelectArtwork = useCallback(
    (index: number) => {
      if (index < 0 || index >= artworks.length) {
        setSelectedIndex(-1)
        return
      }

      setSelectedIndex(index)
    },
    [artworks.length]
  )

  if (artworks.length === 0) {
    return (
      <main className="flex items-center justify-center h-screenMinusHeader">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No artworks available</h2>
          <p className="text-sm text-neutral-400">
            Publish artworks in the admin dashboard to populate this view.
          </p>
        </div>
      </main>
    )
  }

  if (selectedIndex === -1 && enableGridView) {
    return (
      <main className="flex flex-col pt-6 h-screenMinusHeader justify-center">
        <HorizontalCarousel
          slides={slides}
          redirectSource={source}
          // onSelect={handleSelectArtwork}
        />

        <div className="flex justify-center py-4">
          <div className="text-sm text-gray-400">
            Showing {artworks.length} artworks
          </div>
        </div>
      </main>
    )
  }

  const artwork = artworks[selectedIndex]

  if (!artwork) {
    return (
      <main className="flex items-center justify-center h-screenMinusHeader">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artwork not found</h2>
          <button
            onClick={() => setSelectedIndex(-1)}
            className="text-blue-500 hover:underline"
          >
            Return to gallery
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="p-8 md:px-12 lg:px-20 pb-8 md:pb-10 flex flex-col 2xl:pb-10 2xl:px-20 xl:h-screenMinusHeader overflow-visible xl.overflow-auto">
      <VerticalCarousel
        slideIndex={selectedIndex}
        slides={slides}
        redirectSource={source}
        onSelect={handleSelectArtwork}
      />

      <ArtInfo
        contactEmail={contactEmail}
        artwork={artwork}
        artworks={artworks}
        onSelectArtwork={handleSelectArtwork}
      />
    </main>
  )
}
