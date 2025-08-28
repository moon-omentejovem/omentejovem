import type { ReactElement, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Filter } from '@/components/Filter'
import { NFT } from '@/api/resolver/types'
import {
  EditionsContext,
  type EditionsContextProperties
} from './EditionsContext'
import { ChainedFilter } from '@/components/ArtFilter/filters'

interface EditionsProviderProperties {
  email: string
  images: NFT[]
  filters: ChainedFilter[]
  totalPages: number
  children: ReactNode
}

export function EditionsProvider({
  email,
  images,
  filters,
  totalPages,
  children
}: EditionsProviderProperties): ReactElement {
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

  const values = useMemo<EditionsContextProperties>(
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
    <EditionsContext.Provider value={values}>
      {children}
    </EditionsContext.Provider>
  )
}
