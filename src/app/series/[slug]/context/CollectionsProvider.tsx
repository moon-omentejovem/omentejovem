import type { ReactElement, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { ProcessedArtwork } from '@/types/artwork'
import {
  CollectionsContext,
  type CollectionsContextProperties
} from './CollectionsContent'

interface CollectionsProviderProperties {
  email: string
  artworks: ProcessedArtwork[]
  children: ReactNode
}

export function CollectionsProvider({
  email,
  artworks,
  children
}: CollectionsProviderProperties): ReactElement {
  const [currentArtworks, setCurrentArtworks] = useState<ProcessedArtwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeSelectedArtworkIndex = useCallback((index: number): void => {
    setSelectedArtworkIndex(index)
  }, [])

  const onChangeArtworks = useCallback((artworks: ProcessedArtwork[]): void => {
    setCurrentArtworks([...artworks])
  }, [])

  const values = useMemo<CollectionsContextProperties>(
    () => ({
      email,
      unfilteredArtworks: artworks,
      artworks: currentArtworks,
      onChangeArtworks,
      selectedArtworkIndex,
      onChangeSelectedArtworkIndex
    }),
    [
      email,
      artworks,
      currentArtworks,
      selectedArtworkIndex,
      onChangeArtworks,
      onChangeSelectedArtworkIndex
    ]
  )

  return (
    <CollectionsContext.Provider value={values}>
      {children}
    </CollectionsContext.Provider>
  )
}
