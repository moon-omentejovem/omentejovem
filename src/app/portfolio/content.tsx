'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { useArtworks } from '@/hooks'
import { ProcessedArtwork } from '@/types/artwork'
import { ReactElement, useCallback, useEffect, useState } from 'react'

interface PortfolioContentProps {
  email: string
  initialArtworks?: ProcessedArtwork[]
  searchParams?: {
    type?: 'single' | 'edition'
    series?: string
    featured?: 'true'
    one_of_one?: 'true'
  }
}

export default function PortfolioContent({
  email,
  initialArtworks = [],
  searchParams = {}
}: PortfolioContentProps): ReactElement {
  // Use hook with server data as initial data and current filters
  const {
    data: artworks = initialArtworks,
    isLoading,
    error
  } = useArtworks({
    featured: searchParams.featured === 'true',
    oneOfOne: searchParams.one_of_one === 'true',
    seriesSlug: searchParams.series,
    enabled: true
  })

  // Local state for filtering and selection
  const [filteredArtworks, setFilteredArtworks] =
    useState<ProcessedArtwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeArtworks = useCallback((newArtworks: ProcessedArtwork[]) => {
    setFilteredArtworks(newArtworks)
  }, [])

  const onChangeSelectedArtworkIndex = useCallback((index: number) => {
    setSelectedArtworkIndex(index)
  }, [])

  // Update filtered artworks when data changes
  useEffect(() => {
    if (artworks && artworks !== filteredArtworks) {
      setFilteredArtworks(artworks)
    }
  }, [artworks, filteredArtworks])

  // Filter options for the portfolio filter component
  const filterGroups = [
    {
      key: 'type',
      label: 'Type',
      options: [
        { label: 'All Types', value: '' },
        { label: '1/1 Artworks', value: 'single' },
        { label: 'Editions', value: 'edition' }
      ]
    },
    {
      key: 'featured',
      label: 'Featured',
      options: [
        { label: 'All', value: '' },
        { label: 'Featured Only', value: 'true' }
      ]
    },
    {
      key: 'one_of_one',
      label: 'Rarity',
      options: [
        { label: 'All', value: '' },
        { label: '1/1 Only', value: 'true' }
      ]
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screenflex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Portfolio</h1>
          <p className="text-neutral-400">
            {(error as Error)?.message || 'An error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ArtMainContent
      email={email}
      source="portfolio"
      artworks={filteredArtworks}
      onChangeArtworks={onChangeArtworks}
      onChangeSelectedArtworkIndex={onChangeSelectedArtworkIndex}
      selectedArtworkIndex={selectedArtworkIndex}
      unfilteredArtworks={artworks}
    />
  )
}
