'use client'

import type { Artwork } from '@/types/artwork'
import { ReactElement, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { FilterButton, FilterState } from '@/components/FilterButton'
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
  
  // Initialize slug based on initial index
  const initialSlug = useMemo(() => {
    if (initialSelectedIndex >= 0 && initialSelectedIndex < artworks.length) {
      return artworks[initialSelectedIndex].slug
    }
    return null
  }, [artworks, initialSelectedIndex])

  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialSlug)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Filter state initialized from URL
  const [filters, setFilters] = useState<FilterState>({
    sort: searchParams.get('sort') || 'latest',
    contract: searchParams.get('contract') || '',
    network: searchParams.get('network') || '',
    year: searchParams.get('year') || ''
  })

  // Derive available filter options from artworks
  const { availableYears, availableContracts, availableNetworks } = useMemo(() => {
    const years = new Set<number>()
    const contracts = new Set<string>()
    const networks = new Set<string>()

    artworks.forEach(artwork => {
      // Collect Contracts
      if (artwork.contract) contracts.add(artwork.contract)
      
      // Collect Networks/Blockchains
      if (artwork.blockchain) {
        networks.add(artwork.blockchain.toLowerCase())
      } else if (artwork.network) {
        // Fallback to legacy network field if blockchain is not set
        const legacy = artwork.network.toLowerCase()
        if (legacy === 'eth') networks.add('ethereum')
        else if (legacy === 'xtz') networks.add('tezos')
        else networks.add(legacy)
      }

      // Collect Years (using same priority logic as filtering)
      if (artwork.mint_date) {
        years.add(new Date(artwork.mint_date).getFullYear())
      } else if (artwork.creation_date) {
        years.add(new Date(artwork.creation_date).getFullYear())
      } else if (artwork.created_at) {
        years.add(new Date(artwork.created_at).getFullYear())
      }
    })

    return {
      availableYears: Array.from(years).sort((a, b) => b - a),
      availableContracts: Array.from(contracts).sort(),
      availableNetworks: Array.from(networks).sort()
    }
  }, [artworks])

  // Derived filtered artworks
  const filteredArtworks = useMemo(() => {
    let result = [...artworks]

    // Filter
    if (filters.contract) {
      result = result.filter(a => a.contract === filters.contract)
    }
    if (filters.network) {
      const filterVal = filters.network.toLowerCase()
      result = result.filter(a => {
        // Check blockchain field (primary)
        if (a.blockchain?.toLowerCase() === filterVal) return true
        
        // Check legacy network field if blockchain is missing
        if (!a.blockchain && a.network) {
          const legacy = a.network.toLowerCase()
          if (filterVal === 'ethereum' && legacy === 'eth') return true
          if (filterVal === 'tezos' && legacy === 'xtz') return true
          if (legacy === filterVal) return true
        }
        return false
      })
    }
    if (filters.year) {
      const filterYear = parseInt(filters.year)
      result = result.filter(a => {
        // 1. Check mint_date
        if (a.mint_date) {
          const mintYear = new Date(a.mint_date).getFullYear()
          if (mintYear === filterYear) return true
        }

        // 2. Check creation_date
        if (a.creation_date) {
          const creationYear = new Date(a.creation_date).getFullYear()
          if (creationYear === filterYear) return true
        }
        
        // 3. Fallback to created_at
        if (a.created_at) {
          const createdYear = new Date(a.created_at).getFullYear()
          if (createdYear === filterYear) return true
        }

        return false
      })
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.creation_date || a.created_at || 0).getTime()
      const dateB = new Date(b.creation_date || b.created_at || 0).getTime()
      
      if (filters.sort === 'oldest') {
        return dateA - dateB
      }
      // Default latest
      return dateB - dateA
    })

    return result
  }, [artworks, filters])

  // Derived selected index based on filtered list
  const selectedIndex = useMemo(() => {
    if (!selectedSlug) return -1
    return filteredArtworks.findIndex(a => a.slug === selectedSlug)
  }, [selectedSlug, filteredArtworks])

  // Sync initialSlug prop changes (if any)
  useEffect(() => {
    setSelectedSlug(initialSlug)
  }, [initialSlug])

  const slides = useMemo(
    () =>
      filteredArtworks.map((artwork) => ({
        name: artwork.title || '',
        imageUrl: artwork.imageoptimizedurl || null,
        slug: artwork.slug
      })),
    [filteredArtworks]
  )

  const handleSelectArtwork = useCallback(
    (index: number) => {
      if (index < 0 || index >= filteredArtworks.length) {
        setSelectedSlug(null)
        return
      }

      setSelectedSlug(filteredArtworks[index].slug)
    },
    [filteredArtworks]
  )

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleClearFilters = () => {
    setFilters({
      sort: 'latest',
      contract: '',
      network: '',
      year: ''
    })
    
    // Clear only filter params from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('sort')
    params.delete('contract')
    params.delete('network')
    params.delete('year')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Sync state with URL params (e.g. on back/forward navigation)
  useEffect(() => {
    setFilters({
      sort: searchParams.get('sort') || 'latest',
      contract: searchParams.get('contract') || '',
      network: searchParams.get('network') || '',
      year: searchParams.get('year') || ''
    })
  }, [searchParams])

  // Determine view state
  // If selectedIndex is -1, show grid (if enabled)
  // If selectedIndex is valid, show single view
  // If selectedIndex is -1 but selectedSlug is set (meaning item was filtered out), show grid?
  // Yes, selectedIndex -1 handles "not found in current list" case naturally.

  const showGrid = selectedIndex === -1 && enableGridView
  const showSingle = selectedIndex !== -1

  // Empty state (no artworks match filters)
  if (filteredArtworks.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center h-screenMinusHeader gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No artworks found</h2>
          <p className="text-sm text-neutral-400">
            Try adjusting your filters or check back later.
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4">
           <Suspense fallback={null}>
            <FilterButton 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              availableYears={availableYears}
              availableContracts={availableContracts}
              availableNetworks={availableNetworks}
            />
          </Suspense>
        </div>
      </main>
    )
  }

  if (showGrid) {
    return (
      <main className="flex flex-col pt-6 h-screenMinusHeader justify-center">
        <HorizontalCarousel
          slides={slides}
          redirectSource={source}
          // onSelect={handleSelectArtwork} // Assuming HorizontalCarousel uses links or internal selection
        />

        <div className="flex flex-col items-center justify-center py-4 gap-4">
          <div className="text-sm text-gray-400">
            Showing {filteredArtworks.length} artworks
          </div>
          <Suspense fallback={null}>
            <FilterButton 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              availableYears={availableYears}
              availableContracts={availableContracts}
              availableNetworks={availableNetworks}
            />
          </Suspense>
        </div>
      </main>
    )
  }

  // Single View
  const artwork = filteredArtworks[selectedIndex]

  if (!artwork) {
    // Should be covered by showGrid check if selectedIndex is -1
    // But if enableGridView is false, or some other edge case:
    return (
      <main className="flex items-center justify-center h-screenMinusHeader">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artwork not found</h2>
          <button
            onClick={() => setSelectedSlug(null)}
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
        artworks={filteredArtworks}
        onSelectArtwork={handleSelectArtwork}
      />
    </main>
  )
}
