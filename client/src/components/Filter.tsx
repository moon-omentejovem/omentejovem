'use client'

import { ReactElement, useEffect, useMemo, useState } from 'react'
import { Icons } from './Icons'
import { filterAnimations } from '@/animations'
import { cn } from '@/lib/utils'
import { ChainedFilter } from './ArtFilter/filters'

export interface Filter {
  name: string
  subfilters?: {
    name: string
  }[]
}

interface FilterProperties {
  filter: ChainedFilter[]
  onChangeFilter: (filterHistory: ChainedFilter[]) => void
}

export function Filter({
  filter,
  onChangeFilter
}: FilterProperties): ReactElement {
  const initialFilter = useMemo(() => filter, [filter])
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<ChainedFilter[]>(initialFilter)
  const [filterHistory, setFilterHistory] = useState<ChainedFilter[]>([])
  const [filterStep, setFilterStep] = useState(1)
  const [selected, setSelected] = useState<string>('latest')

  useEffect(() => {
    if (filters && open) {
      filterAnimations(false)
    }
  }, [filters])

  function updateFilters(content: ChainedFilter) {
    setFilterHistory([...filterHistory, content])
    if (content.children) setFilters(content.children)

    onChangeFilter(filterHistory)
  }

  function leaveFilter() {
    const historyCopy = [...filterHistory]
    historyCopy.pop()
    setFilterHistory(historyCopy)
    if (historyCopy.length) {
      setFilters(historyCopy[historyCopy.length - 1].children!)
    } else {
      setFilters(initialFilter)
    }

    onChangeFilter(filterHistory)
  }

  return (
    <div className="flex flex-col gap-2 mt-8 items-center">
      <button
        onClick={() => {
          if (filterHistory.length) leaveFilter()
          else {
            filterAnimations(open)
            setOpen(!open)
          }
        }}
        aria-label="Filter Menu"
        className="group grid relative place-items-center w-12 h-12 cursor-none hover:cursor-none"
      >
        <Icons.X
          className={cn(
            open ? 'scale-100' : 'scale-0',
            'absolute stroke-secondary-100 transition-all group-hover:opacity-60 w-8 h-8'
          )}
        />
        <Icons.Menu
          className={cn(
            open ? 'scale-0' : 'scale-100',
            'absolute stroke-secondary-100 transition-all group-hover:opacity-60 w-8 h-8'
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
