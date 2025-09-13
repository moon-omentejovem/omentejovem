'use client'

import { Filter } from '@/components/Filter'
import { Artwork } from '@/types/artwork'
import { orderBy } from '@/utils/arrays'
import { useEffect, useState } from 'react'
import filters, { ChainedFilter, getLastFilterHistoryParent } from './filters'

interface ArtFilterProperties {
  currentPage: number
  artImages: Artwork[]
  onChangeArtImages: (images: Artwork[]) => void
}

interface FilterArtHistory extends ChainedFilter {
  filteredImages: Artwork[]
  label?: string
  children: ChainedFilter[]
  inPlace?: boolean
}

export function ArtFilter({
  currentPage,
  artImages,
  onChangeArtImages
}: ArtFilterProperties) {
  const [filterHistory, setFilterHistory] = useState<FilterArtHistory[]>([
    {
      ...filters[0],
      filteredImages: [...(artImages || [])]
    }
  ])

  useEffect(() => {
    const lastFilter = filterHistory[filterHistory.length - 1]
    const currentImages = lastFilter.filteredImages
    onChangeArtImages(currentImages)
  }, [filterHistory, onChangeArtImages])

  function getSliceCount() {
    let count = 1
    for (let i = filterHistory.length - 1; i > 0; i--) {
      if (filterHistory[i].children.length > 0) {
        return count
      }
      count++
    }
    return count
  }

  function testFilter(filter: ChainedFilter, images: Artwork[]): boolean {
    if (!filter.filterApply) return true

    // Test if applying this filter would result in any items
    return images.some(filter.filterApply)
  }

  function getAvailableFilters(
    currentImages: Artwork[],
    parentFilter: ChainedFilter
  ) {
    // If the filter has children, return only those that would produce results
    if (parentFilter.children.length > 0) {
      return parentFilter.children.filter((filter: any) =>
        testFilter(filter, currentImages)
      )
    }

    // If no children, get the parent's children (siblings)
    const parent = getLastFilterHistoryParent([...filterHistory])
    if (parent) {
      return parent.children.filter((filter: any) =>
        testFilter(filter, currentImages)
      )
    }

    // If no parent (root level), return empty array
    return []
  }

  function onChangeFilter(filter?: ChainedFilter): void {
    const lastFilter = filterHistory[filterHistory.length - 1]

    console.log('filter', filter)
    console.log('lastFilter', lastFilter)

    if (filter?.label === lastFilter.label) {
      return
    }

    const currentImages = lastFilter.filteredImages

    if (!filter) {
      if (filterHistory.length > 1) {
        setFilterHistory([...filterHistory.slice(0, -1)])
      }
      return
    }

    if (filter.inPlace && lastFilter.inPlace) {
      const previousFilter = filterHistory[filterHistory.length - 2]
      let appliedImages = previousFilter.filteredImages

      if (filter.filterApply) {
        appliedImages = appliedImages.filter(filter.filterApply)
      }

      if (filter.sortApply) {
        appliedImages = orderBy(
          appliedImages,
          filter.sortApply.key as keyof Artwork,
          filter.sortApply.option
        )
      }

      setFilterHistory([
        ...filterHistory.slice(0, -1),
        { ...filter, filteredImages: appliedImages }
      ])
      return
    }

    let appliedImages = currentImages

    if (filter.filterApply) {
      appliedImages = currentImages.filter(filter.filterApply)
    }

    if (filter.sortApply) {
      appliedImages = orderBy(
        appliedImages,
        filter.sortApply.key as keyof Artwork,
        filter.sortApply.option
      )
    }

    setFilterHistory([
      ...filterHistory,
      { ...filter, filteredImages: appliedImages }
    ])
  }

  // Modify the Filter component props to pass only available filters
  const lastFilter = filterHistory[filterHistory.length - 1]
  const availableFilters = getAvailableFilters(
    lastFilter.filteredImages,
    lastFilter
  )

  return (
    <Filter
      filterHistory={filterHistory}
      onChangeFilter={onChangeFilter}
      availableFilters={availableFilters}
    />
  )
}
