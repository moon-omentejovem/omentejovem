'use client'

import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

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
  const [openDropdown, setOpenDropdown] = useState<'sort' | 'contract' | 'network' | 'year' | null>(null)

  const contractOptions =
    availableContracts && availableContracts.length > 0
      ? availableContracts
      : ['Manifold', 'Transient Labs', 'SuperRare', 'OpenSea', 'Rarible']

  const networkOptions =
    availableNetworks && availableNetworks.length > 0
      ? availableNetworks
      : ['ethereum', 'tezos']

  const yearOptions =
    availableYears && availableYears.length > 0
      ? availableYears
      : [2025, 2024, 2023, 2022, 2021]

  const sortLabel = filters.sort === 'oldest' ? 'Oldest' : 'Latest'
  const contractLabel = filters.contract || 'All Contracts'
  const networkLabel = filters.network
    ? filters.network.charAt(0).toUpperCase() + filters.network.slice(1)
    : 'All Blockchains'
  const yearLabel = filters.year || 'All Years'

  return (
    <div className="relative inline-block filter-container">
      <button 
        onClick={() => {
          if (isOpen) {
            setIsOpen(false)
            setOpenDropdown(null)
          } else {
            setIsOpen(true)
            setOpenDropdown(null)
          }
        }}
        className="flex h-[42px] w-[42px] items-center justify-center text-[#B1B1B1] hover:text-[#000000] transition-colors"
        aria-label={isOpen ? 'Close filters' : 'Filters'}
      >
        {isOpen ? (
          <span className="text-[42px] leading-none">
            ×
          </span>
        ) : (
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="mb-4 bg-transparent text-black dark:text-white z-50 w-full md:w-auto md:absolute md:bottom-full md:left-1/2 md:-translate-x-1/2">
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-start justify-center gap-4 md:gap-8 w-full max-w-[900px] mx-auto px-4 md:px-0">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] leading-[120%] uppercase tracking-[0] font-normal text-gray-400">
                  Sort By
                </span>
                <div className="relative w-full">
                  <button
                    type="button"
                    className="flex w-full md:w-48 items-center justify-between border border-transparent bg-gray-200 px-4 py-2 text-[16px] leading-[120%] font-normal text-gray-900 focus:outline-none"
                    onClick={() =>
                      setOpenDropdown((prev) => (prev === 'sort' ? null : 'sort'))
                    }
                  >
                    <span>{sortLabel}</span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-[#B1B1B1] transition-transform ${
                        openDropdown === 'sort' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openDropdown === 'sort' ? (
                    <div className="absolute left-0 right-0 bottom-full mb-1 max-h-60 overflow-y-auto rounded-md border border-transparent bg-transparent shadow-none z-50">
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange('sort', 'latest')
                          setOpenDropdown(null)
                        }}
                        className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                      >
                        Latest
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange('sort', 'oldest')
                          setOpenDropdown(null)
                        }}
                        className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                      >
                        Oldest
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] leading-[120%] uppercase tracking-[0] font-normal text-gray-400">
                  Contract
                </span>
                <div className="relative w-full">
                  <button
                    type="button"
                    className="flex w-full md:w-56 items-center justify-between border border-transparent bg-gray-200 px-4 py-2 text-[16px] leading-[120%] font-normal text-gray-900 focus:outline-none"
                    onClick={() =>
                      setOpenDropdown((prev) => (prev === 'contract' ? null : 'contract'))
                    }
                  >
                    <span>{contractLabel}</span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-[#B1B1B1] transition-transform ${
                        openDropdown === 'contract' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openDropdown === 'contract' ? (
                    <div className="absolute left-0 right-0 bottom-full mb-1 max-h-60 overflow-y-auto rounded-md border border-transparent bg-transparent shadow-none z-50">
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange('contract', '')
                          setOpenDropdown(null)
                        }}
                        className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                      >
                        All Contracts
                      </button>
                      {contractOptions.map((contract) => (
                        <button
                          key={contract}
                          type="button"
                          onClick={() => {
                            onFilterChange('contract', contract)
                            setOpenDropdown(null)
                          }}
                          className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                        >
                          {contract}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] leading-[120%] uppercase tracking-[0] font-normal text-gray-400">
                  Blockchain
                </span>
                <div className="relative w-full">
                  <button
                    type="button"
                    className="flex w-full md:w-56 items-center justify-between border border-transparent bg-gray-200 px-4 py-2 text-[16px] leading-[120%] font-normal text-gray-900 focus:outline-none"
                    onClick={() =>
                      setOpenDropdown((prev) => (prev === 'network' ? null : 'network'))
                    }
                  >
                    <span>{networkLabel}</span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-[#B1B1B1] transition-transform ${
                        openDropdown === 'network' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openDropdown === 'network' ? (
                    <div className="absolute left-0 right-0 bottom-full mb-1 max-h-60 overflow-y-auto rounded-md border border-transparent bg-transparent shadow-none z-50">
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange('network', '')
                          setOpenDropdown(null)
                        }}
                        className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                      >
                        All Blockchains
                      </button>
                      {networkOptions.map((network) => {
                        const label = network.charAt(0).toUpperCase() + network.slice(1)
                        return (
                          <button
                          key={network}
                          type="button"
                          onClick={() => {
                            onFilterChange('network', network)
                            setOpenDropdown(null)
                          }}
                          className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] leading-[120%] uppercase tracking-[0] font-normal text-gray-400">
                  Year
                </span>
                <div className="relative w-full">
                  <button
                    type="button"
                    className="flex w-full md:w-40 items-center justify-between border border-transparent bg-gray-200 px-4 py-2 text-[16px] leading-[120%] font-normal text-gray-900 focus:outline-none"
                    onClick={() =>
                      setOpenDropdown((prev) => (prev === 'year' ? null : 'year'))
                    }
                  >
                    <span>{yearLabel}</span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-[#B1B1B1] transition-transform ${
                        openDropdown === 'year' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openDropdown === 'year' ? (
                    <div className="absolute left-0 right-0 bottom-full mb-1 max-h-60 overflow-y-auto rounded-md border border-transparent bg-transparent shadow-none z-50">
                      <button
                        type="button"
                        onClick={() => {
                          onFilterChange('year', '')
                          setOpenDropdown(null)
                        }}
                        className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                      >
                        All Years
                      </button>
                      {yearOptions.map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            onFilterChange('year', String(year))
                            setOpenDropdown(null)
                          }}
                          className="block w-full px-4 py-2 text-left text-[16px] leading-[120%] font-normal bg-white text-gray-800 hover:bg-gray-100 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
                          >
                          {year}
                          </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
