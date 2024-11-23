import type { ReactElement, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { NFT } from '@/api/resolver/types'
import { Filter } from '@/components/Filter'
import {
  CollectionsContext,
  type CollectionsContextProperties
} from './CollectionsContent'
import { ChainedFilter } from '@/components/ArtFilter/filters'

interface CollectionsProviderProperties {
  email: string
  images: NFT[]
  filters: ChainedFilter[]
  totalPages: number
  children: ReactNode
}

export function CollectionsProvider({
  email,
  images,
  filters,
  totalPages,
  children
}: CollectionsProviderProperties): ReactElement {
  const [artImages, setArtImages] = useState<NFT[]>(images)
  const [artTotalPages, setArtTotalPages] = useState(totalPages)
  const [selectedArtIndex, setSelectedArtIndex] = useState(-1)

  function onChangeSelectedArtIndex(index: number): void {
    setSelectedArtIndex(index)
  }

  function onChangeArtImages(images: NFT[]): void {
    setArtImages(images)
  }

  function onChangeTotalPages(newTotal: number): void {
    setArtTotalPages(newTotal)
  }

  const values = useMemo<CollectionsContextProperties>(
    () => ({
      email,
      unfilteredImages: images,
      artImages,
      onChangeArtImages,
      filters,
      selectedArtIndex,
      onChangeSelectedArtIndex,
      totalPages,
      artTotalPages,
      onChangeTotalPages
    }),
    [
      images,
      filters,
      selectedArtIndex,
      artImages,
      onChangeArtImages,
      onChangeSelectedArtIndex
    ]
  )

  return (
    <CollectionsContext.Provider value={values}>
      {children}
    </CollectionsContext.Provider>
  )
}
