'use client'

import { filterAnimations } from '@/animations/client'
import { cn } from '@/lib/utils'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { ChainedFilter } from './ArtFilter/filters'
import { Icons } from './Icons'

export interface Filter {
  name: string
  subfilters?: {
    name: string
  }[]
}

interface FilterProperties {
  filterHistory: ChainedFilter[]
  onChangeFilter: (filterHistory?: ChainedFilter) => void
  availableFilters: ChainedFilter[] // Add this line
}

export function Filter({
  filterHistory,
  onChangeFilter,
  availableFilters
}: FilterProperties): ReactElement {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState([] as ChainedFilter[])
  const [selected, setSelected] = useState<string>('')

  const refreshFilters = useCallback(() => {
    setFilters(availableFilters)
  }, [availableFilters])

  useEffect(() => {
    refreshFilters()
  }, [filterHistory, refreshFilters])

  useEffect(() => {
    if (filters.length > 0 && open) {
      filterAnimations(false)
    }
  }, [filters, open])

  function updateFilters(content: ChainedFilter) {
    if (!content.children?.length) {
      setSelected(content.label!)
    }

    onChangeFilter(content)
  }

  function leaveFilter() {
    if (selected) {
      setSelected('')
    }
    onChangeFilter()
  }

  function clickX() {
    if (filterHistory.length === 1) {
      filterAnimations(open)
      setOpen(!open)
    } else if (open) {
      leaveFilter()
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-8 items-center">
      <button
        onClick={clickX}
        aria-label="Filter Menu"
        className="group grid relative place-items-center w-12 h-12 cursor-none hover:cursor-none"
      >
        <Icons.X
          className={cn(
            open ? 'scale-100' : 'scale-0',
            'absolute stroke-secondary-100 stroke-1 transition-all group-hover:opacity-60 w-8 h-8'
          )}
        />
        <Icons.Menu
          className={cn(
            open ? 'scale-0' : 'scale-100',
            'absolute stroke-secondary-100 stroke-1 transition-all group-hover:opacity-60 w-8 h-8'
          )}
        />
      </button>

      <div
        className={cn(
          'grid grid-cols-[repeat(auto-fit,140px)] place-content-center w-full max-w-[100vw] gap-x-12 gap-y-8 px-4 overflow-hidden',
          'md:gap-x-20',
          !open && 'pointer-events-none'
        )}
      >
        {filters.map((filter, index) => (
          <button
            key={index}
            onClick={(_) => {
              updateFilters(filter)
            }}
            className={cn(
              'filter-option text-secondary-100 text-sm uppercase body-variant overflow-y-hidden md:text-base',
              selected === filter.label && 'text-secondary-200 underline'
            )}
            aria-label={filter.label}
          >
            <p className="translate-y-12">{filter.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
