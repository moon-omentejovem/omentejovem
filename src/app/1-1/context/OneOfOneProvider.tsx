import type { ReactElement, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { ProcessedArtwork } from '@/types/artwork'
import {
  OneOfOneContext,
  type OneOfOneContextProperties
} from './OneOfOneContext'

interface OneOfOneProviderProperties {
  email: string
  artworks: ProcessedArtwork[]
  children: ReactNode
}

export function OneOfOneProvider({
  email,
  artworks,
  children
}: OneOfOneProviderProperties): ReactElement {
  const [currentArtworks, setCurrentArtworks] = useState<ProcessedArtwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeSelectedArtworkIndex = useCallback((index: number): void => {
    setSelectedArtworkIndex(index)
  }, [])

  const onChangeArtworks = useCallback((artworks: ProcessedArtwork[]): void => {
    setCurrentArtworks([...artworks])
  }, [])

  const values = useMemo<OneOfOneContextProperties>(
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
    <OneOfOneContext.Provider value={values}>
      {children}
    </OneOfOneContext.Provider>
  )
}
