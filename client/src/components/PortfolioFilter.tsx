'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface FilterOption {
  label: string
  value: string
}

interface FilterGroup {
  key: string
  label: string
  options: FilterOption[]
}

interface PortfolioFilterProps {
  filters: FilterGroup[]
  currentValues: Record<string, string | undefined>
}

export function PortfolioFilter({
  filters,
  currentValues
}: PortfolioFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [openFilter, setOpenFilter] = useState<string | null>(null)

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/portfolio?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/portfolio')
  }

  const hasActiveFilters = Object.values(currentValues).some(
    (value) => value && value !== ''
  )

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <button
          onClick={() => setOpenFilter(openFilter ? null : 'mobile')}
          className="bg-neutral-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      <div
        className={`
        ${openFilter === 'mobile' ? 'block' : 'hidden'} md:block
        w-full max-w-4xl
      `}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filters.map((filterGroup) => (
            <div key={filterGroup.key} className="relative">
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                {filterGroup.label}
              </label>
              <select
                value={currentValues[filterGroup.key] || ''}
                onChange={(e) => updateFilter(filterGroup.key, e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                {filterGroup.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4 text-center">
            <button
              onClick={clearAllFilters}
              className="text-neutral-400 hover:text-white underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
