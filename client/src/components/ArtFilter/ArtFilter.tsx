'use client'

import { NftArt } from '@/components/ArtContent/types'
import { Filter } from '@/components/Filter'
import { useEffect, useState } from 'react'
import filters, { ChainedFilter, getLastFilterHistoryParent } from './filters'
import { orderBy } from '@/utils/arrays'

interface ArtFilterProperties {
  currentPage: number
  artImages: NftArt[]
  onChangeArtImages: (images: NftArt[]) => void
}

interface FilterArtHistory extends ChainedFilter {
  filteredImages: NftArt[]
}

export function ArtFilter({
  currentPage,
  artImages,
  onChangeArtImages
}: ArtFilterProperties) {
  const [filterHistory, setFilterHistory] = useState<FilterArtHistory[]>([{
    ...filters[0],
    filteredImages: [...artImages]
  }]);

  useEffect(() => {
    const lastFilter = getLastFilterHistoryParent(filterHistory)
    onChangeArtImages((lastFilter as FilterArtHistory).filteredImages)
  }, [artImages, currentPage, onChangeArtImages])

  useEffect(() => {
    const lastFilter = getLastFilterHistoryParent(filterHistory)
    const currentImages = (lastFilter as FilterArtHistory).filteredImages;
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
    const lastFilter = filterHistory[filterHistory.length - 1];
    const currentImages = lastFilter.filteredImages;

    if(!filter) {
      if (filterHistory.length > 1) {
        const count = getSliceCount()
        setFilterHistory([...filterHistory.slice(0, -count)]);
      }
      return
    }
    
    if (filter.label !== lastFilter.label) {
      let appliedImages = currentImages;

      if (filter.filterApply) {
        appliedImages = currentImages.filter(filter.filterApply);
      }
      if (filter.sortApply) {
        appliedImages = orderBy(currentImages, filter.sortApply.key, filter.sortApply.option);
      }

      setFilterHistory([...filterHistory, { ...filter, filteredImages: appliedImages }])
    }
  }

  return <Filter filterHistory={filterHistory} onChangeFilter={onChangeFilter} />
}
