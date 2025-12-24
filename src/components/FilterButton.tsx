'use client'

import { useState, useEffect } from 'react'

export interface FilterState {
  sort: string
  contract: string
  network: string
  year: string
}

interface FilterButtonProps {
  filters: FilterState
  onFilterChange: (key: keyof FilterState, value: string) => void
  onClearFilters: () => void
  availableYears?: number[]
  availableContracts?: string[]
  availableNetworks?: string[]
}

export function FilterButton({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  availableYears,
  availableContracts,
  availableNetworks
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close on click outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('.filter-container')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block filter-container">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:opacity-70 transition-opacity"
        aria-label="Filters"
      >
        {/* Horizontal lines icon (riscos horizontais) */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono text-sm uppercase font-bold">Filters</h3>
            <button onClick={() => setIsOpen(false)} className="text-sm hover:underline">Close</button>
          </div>
          
          <div className="space-y-4">
            {/* Sort */}
            <div className="space-y-1">
              <label htmlFor="filter-sort" className="text-xs text-gray-500 uppercase">Sort By</label>
              <select 
                id="filter-sort"
                value={filters.sort}
                onChange={(e) => onFilterChange('sort', e.target.value)}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-2 text-sm font-mono"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {/* Contract */}
            <div className="space-y-1">
              <label htmlFor="filter-contract" className="text-xs text-gray-500 uppercase">Contract</label>
              <select 
                id="filter-contract"
                value={filters.contract}
                onChange={(e) => onFilterChange('contract', e.target.value)}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-2 text-sm font-mono"
              >
                <option value="">All Contracts</option>
                {availableContracts ? (
                  availableContracts.map(contract => (
                    <option key={contract} value={contract}>{contract}</option>
                  ))
                ) : (
                  <>
                    <option value="Manifold">Manifold</option>
                    <option value="Transient Labs">Transient Labs</option>
                    <option value="SuperRare">SuperRare</option>
                    <option value="OpenSea">OpenSea</option>
                    <option value="Rarible">Rarible</option>
                  </>
                )}
              </select>
            </div>

            {/* Blockchain (formerly Network) */}
            <div className="space-y-1">
              <label htmlFor="filter-blockchain" className="text-xs text-gray-500 uppercase">Blockchain</label>
              <select 
                id="filter-blockchain"
                value={filters.network}
                onChange={(e) => onFilterChange('network', e.target.value)}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-2 text-sm font-mono"
              >
                <option value="">All Blockchains</option>
                {availableNetworks ? (
                  availableNetworks.map(network => {
                    // Helper to format network/blockchain label
                    // network value is expected to be lowercase 'ethereum', 'tezos', etc. from ArtContent normalization
                    let label = network.charAt(0).toUpperCase() + network.slice(1)
                    
                    return (
                      <option key={network} value={network}>{label}</option>
                    )
                  })
                ) : (
                  <>
                    <option value="ethereum">Ethereum</option>
                    <option value="tezos">Tezos</option>
                  </>
                )}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label htmlFor="filter-year" className="text-xs text-gray-500 uppercase">Year</label>
              <select 
                id="filter-year"
                value={filters.year}
                onChange={(e) => onFilterChange('year', e.target.value)}
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded p-2 text-sm font-mono"
              >
                <option value="">All Years</option>
                {availableYears ? (
                  availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))
                ) : (
                  <>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </>
                )}
              </select>
            </div>
            
            <button 
              onClick={() => {
                onClearFilters()
                setIsOpen(false)
              }}
              className="w-full mt-2 text-xs text-gray-500 hover:text-black dark:hover:text-white underline"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
