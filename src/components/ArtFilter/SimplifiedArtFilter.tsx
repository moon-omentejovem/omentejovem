/**
 * Simplified Art Filter Component - Client-side only UI
 *
 * This component provides basic filtering functionality without complex state management.
 * Server-side filtering should be handled via URL params and page re-renders.
 */

'use client'

import { Artwork } from '@/types/artwork'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface SimplifiedArtFilterProps {
  artworks: Artwork[]
  onFilterChange?: (filteredArtworks: Artwork[]) => void
  showTypeFilter?: boolean
  showFeaturedFilter?: boolean
  showSeriesFilter?: boolean
}

export function SimplifiedArtFilter({
  artworks,
  onFilterChange,
  showTypeFilter = true,
  showFeaturedFilter = true,
  showSeriesFilter = true
}: SimplifiedArtFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Local state for immediate UI feedback
  const [localFilters, setLocalFilters] = useState({
    type: searchParams.get('type') || '',
    featured: searchParams.get('featured') || '',
    series: searchParams.get('series') || ''
  })

  // Apply filters locally for immediate feedback
  const applyLocalFilters = useCallback(
    (filters: typeof localFilters) => {
      let filtered = artworks

      if (filters.type) {
        filtered = filtered.filter((artwork) => artwork.type === filters.type)
      }

      if (filters.featured === 'true') {
        filtered = filtered.filter((artwork) => artwork.is_featured)
      }

      if (filters.series) {
        filtered = filtered.filter((artwork) =>
          artwork.series_artworks?.some(
            (sa) => sa.series.slug === filters.series
          )
        )
      }

      onFilterChange?.(filtered)
    },
    [artworks, onFilterChange]
  )

  // Update URL for server-side filtering on next navigation
  const updateUrlFilters = useCallback(
    (newFilters: typeof localFilters) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...localFilters, [key]: value }
      setLocalFilters(newFilters)

      // Apply immediately for UI feedback
      applyLocalFilters(newFilters)

      // Update URL for persistence (debounced)
      setTimeout(() => updateUrlFilters(newFilters), 300)
    },
    [localFilters, applyLocalFilters, updateUrlFilters]
  )

  const clearFilters = useCallback(() => {
    const emptyFilters = { type: '', featured: '', series: '' }
    setLocalFilters(emptyFilters)
    applyLocalFilters(emptyFilters)
    updateUrlFilters(emptyFilters)
  }, [applyLocalFilters, updateUrlFilters])

  // Get unique series for filter options
  const availableSeries = Array.from(
    new Set(
      artworks.flatMap(
        (artwork) =>
          artwork.series_artworks?.map((sa) => ({
            slug: sa.series.slug,
            name: sa.series.name || sa.series.slug
          })) || []
      )
    )
  ).filter(
    (series, index, arr) =>
      arr.findIndex((s) => s.slug === series.slug) === index
  )

  const hasActiveFilters = Object.values(localFilters).some(Boolean)

  return (
    <div className="bg-black/50 backdrop-blur-sm border border-neutral-800 rounded-lg p-4 m-4">
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-sm font-medium text-neutral-300">Filters:</span>

        {showTypeFilter && (
          <select
            value={localFilters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="single">1/1 Artworks</option>
            <option value="edition">Editions</option>
          </select>
        )}

        {showFeaturedFilter && (
          <select
            value={localFilters.featured}
            onChange={(e) => handleFilterChange('featured', e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Artworks</option>
            <option value="true">Featured Only</option>
          </select>
        )}

        {showSeriesFilter && availableSeries.length > 0 && (
          <select
            value={localFilters.series}
            onChange={(e) => handleFilterChange('series', e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Series</option>
            {availableSeries.map((series) => (
              <option key={series.slug} value={series.slug}>
                {series.name}
              </option>
            ))}
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Clear All
          </button>
        )}

        <span className="text-xs text-neutral-400 ml-auto">
          {artworks.length} artworks
        </span>
      </div>
    </div>
  )
}
