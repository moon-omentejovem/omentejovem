'use client'

// Simplified filters for current backend structure
// This file needs to be refactored when NFT contract data is available

export interface ChainedFilter {
  label?: string
  filterApply?: (artwork: any) => boolean // Using any for legacy compatibility
  sortApply?: SortOption
  children: ChainedFilter[]
  inPlace?: boolean
}

export interface SortOption {
  key: string // Simplified to string for now
  option: 'asc' | 'desc'
}

// Simplified date functions for legacy compatibility
function extractYearFromISO(dateString: string): number {
  const date = new Date(dateString)
  return date.getFullYear()
}

function filterByDateMatchesYears(years: number[]) {
  return (artwork: any) => {
    const mintDate = artwork.mint_date || artwork.created_at
    if (!mintDate) return false
    const year = extractYearFromISO(mintDate)
    return years.includes(year)
  }
}

// Simplified filters - most legacy filters disabled for now
export const chains: ChainedFilter = {
  label: 'Chains',
  children: [
    {
      label: 'All Chains',
      children: []
    }
  ]
}

export const sortOptions: ChainedFilter = {
  label: 'Sort By',
  children: [
    {
      label: 'Date Created',
      sortApply: {
        key: 'created_at',
        option: 'desc'
      },
      children: []
    }
  ]
}

export const platforms: ChainedFilter = {
  label: 'Platform',
  children: [
    {
      label: 'All Platforms',
      children: []
    }
  ]
}

// Simplified date filters
export const years: ChainedFilter = {
  label: 'Year',
  children: [
    {
      label: '2025',
      filterApply: filterByDateMatchesYears([2025]),
      children: []
    },
    {
      label: '2024',
      filterApply: filterByDateMatchesYears([2024]),
      children: []
    },
    {
      label: '2023',
      filterApply: filterByDateMatchesYears([2023]),
      children: []
    },
    {
      label: '2022',
      filterApply: filterByDateMatchesYears([2022]),
      children: []
    }
  ]
}

export const status: ChainedFilter = {
  label: 'Status',
  children: [
    {
      label: 'All',
      children: []
    }
  ]
}

export const dateAvailable: ChainedFilter = {
  label: 'Date Available',
  children: [
    {
      label: 'All',
      children: []
    }
  ]
}

export function getLastFilterHistoryParent(
  filterHistory: ChainedFilter[]
): ChainedFilter {
  if (filterHistory.length === 0) {
    throw new Error('Filter history cannot be empty')
  }

  for (let i = filterHistory.length - 1; i >= 0; i--) {
    if (filterHistory[i].children.length > 0) {
      return filterHistory[i]
    }
  }
  return filterHistory[filterHistory.length - 1]
}

// Default export - simplified filter array
const filters: ChainedFilter[] = [
  chains,
  sortOptions,
  platforms,
  years,
  status,
  dateAvailable
]

export default filters
