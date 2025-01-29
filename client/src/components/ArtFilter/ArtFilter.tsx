'use client'

import { NFT } from '@/components/ArtContent/types'
import { Filter } from '@/components/Filter'
import { useEffect, useState } from 'react'
import filters, { ChainedFilter, getLastFilterHistoryParent } from './filters'
import { orderBy } from '@/utils/arrays'

interface ArtFilterProperties {
  currentPage: number
  artImages: NFT[]
  onChangeArtImages: (images: NFT[]) => void
}

interface FilterArtHistory extends ChainedFilter {
  filteredImages: NFT[]
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
  }, [filterHistory])

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

  function onChangeFilter(filter?: ChainedFilter): void {
    const lastFilter = filterHistory[filterHistory.length - 1]

    console.log('!!!lastFilter', lastFilter)
    console.log('!!!filter', filter)

    if (filter?.label === lastFilter.label) {
      return
    }

    const currentImages = lastFilter.filteredImages

    if (!filter) {
      if (filterHistory.length > 1) {
        const count = getSliceCount()
        setFilterHistory([...filterHistory.slice(0, -count)])
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
          filter.sortApply.key,
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
        filter.sortApply.key,
        filter.sortApply.option
      )
    }

    setFilterHistory([
      ...filterHistory,
      { ...filter, filteredImages: appliedImages }
    ])
  }

  return (
    <Filter filterHistory={filterHistory} onChangeFilter={onChangeFilter} />
  )
}
