import type { ReactElement, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { NFT } from '@/api/resolver/types'
import { Filter } from '@/components/Filter'
import {
  OneOfOneContext,
  type OneOfOneContextProperties
} from './OneOfOneContext'
import { ChainedFilter } from '@/components/ArtFilter/filters'

interface OneOfOneProviderProperties {
  email: string
  images: NFT[]
  filters: ChainedFilter[]
  totalPages: number
  children: ReactNode
}

export function OneOfOneProvider({
  email,
  images,
  filters,
  totalPages,
  children
}: OneOfOneProviderProperties): ReactElement {
  const [artImages, setArtImages] = useState<NFT[]>(images)
  const [artTotalPages, setArtTotalPages] = useState(totalPages)
  const [selectedArtIndex, setSelectedArtIndex] = useState(-1)

  const onChangeSelectedArtIndex = useCallback((index: number): void => {
    setSelectedArtIndex(index)
  }, [])

  const onChangeArtImages = useCallback((images: NFT[]): void => {
    setArtImages([...images])
  }, [])

  const onChangeTotalPages = useCallback((newTotal: number): void => {
    setArtTotalPages(newTotal)
  }, [])

  const values = useMemo<OneOfOneContextProperties>(
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
      email,
      images,
      filters,
      selectedArtIndex,
      artImages,
      artTotalPages,
      onChangeArtImages,
      onChangeSelectedArtIndex,
      onChangeTotalPages,
      totalPages
    ]
  )

  return (
    <OneOfOneContext.Provider value={values}>
      {children}
    </OneOfOneContext.Provider>
  )
}
