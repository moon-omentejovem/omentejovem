/**
 * ArtContent - Main component for displaying artwork galleries
 *
 * Optimized for SSR with minimal prop-drilling.
 * All data is received pre-processed from server components.
 */

'use client'

import { useCarouselNavigation } from '@/hooks/useCarouselNavigation'
import { Artwork } from '@/types/artwork'
import { getImageUrlFromId } from '@/utils/storage'
import { ReactElement, useCallback, useState } from 'react'
import { HorizontalCarousel } from '../HorizontalCarousel/HorizontalCarousel'
import { VerticalCarousel } from '../VerticalCarousel/VerticalCarousel'
import { ArtInfo } from './ArtInfo'

interface ArtContentProps {
  artworks: Artwork[]
  initialSelectedIndex?: number
  source: 'portfolio' | '1-1' | 'editions' | string
  email?: string
  showGridView?: boolean
}

export function ArtContent({
  artworks,
  initialSelectedIndex = -1,
  source,
  email = 'contact@omentejovem.com',
  showGridView = true
}: ArtContentProps): ReactElement {
  // Local state for UI interactions only
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
  const [filteredArtworks, setFilteredArtworks] = useState(artworks)
  const [currentPage, setCurrentPage] = useState(1)

  // Navigation hook for URL management
  const { handleNavigation } = useCarouselNavigation({
    source,
    artworks: filteredArtworks,
    onChangeIndex: setSelectedIndex
  })

  // Handle filter changes (client-side only for immediate feedback)
  const handleFilterChange = useCallback((filtered: Artwork[]) => {
    setFilteredArtworks(filtered)
    setSelectedIndex(-1) // Reset to grid view when filtering
  }, [])

  // Handle artwork selection
  const handleSelectArtwork = useCallback(
    (index: number, replace = false) => {
      setSelectedIndex(index)
      handleNavigation(index, replace)
    },
    [handleNavigation]
  )

  // Transform artworks to carousel format
  const carouselSlides = filteredArtworks.map((artwork) => ({
    name: artwork.title || '',
    imageUrl: getImageUrlFromId(
      artwork.id,
      artwork.slug,
      'artworks',
      'optimized'
    ),
    slug: artwork.slug
  }))

  // Grid view (selectedIndex === -1)
  if (selectedIndex === -1 && showGridView) {
    return (
      <main className="flex flex-col pt-6 h-screenMinusHeader justify-center">
        <HorizontalCarousel
          currentPage={currentPage}
          loading={false}
          slides={carouselSlides}
          redirectSource={source}
          onRedirect={handleSelectArtwork}
        />

        {/* Simples display da contagem de artworks - sem filtros complexos */}
        <div className="flex justify-center py-4">
          <div className="text-sm text-gray-400">
            Showing {filteredArtworks.length} artworks
          </div>
        </div>
      </main>
    )
  }

  // Detail view (selectedIndex >= 0)
  const selectedArtwork = filteredArtworks[selectedIndex]

  if (!selectedArtwork) {
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
    <main className="p-8 md:px-12 lg:px-20 flex flex-col sm:px-6 2xl:pb-8 2xl:px-20 xl:h-screenMinusHeader overflow-hidden xl:overflow-auto">
      <VerticalCarousel
        slideIndex={selectedIndex}
        onChangeSlideIndex={setSelectedIndex}
        slides={carouselSlides}
        redirectSource={source}
        onRedirect={handleSelectArtwork}
      />

      <ArtInfo
        email={email}
        selectedArtwork={selectedArtwork}
        slides={filteredArtworks}
        onChangeSlideIndex={setSelectedIndex}
        source={source}
      />
    </main>
  )
}
