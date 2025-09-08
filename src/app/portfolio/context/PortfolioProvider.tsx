import type { ReactElement, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { ProcessedArtwork } from '@/types/artwork'
import {
  PortfolioContext,
  type PortfolioContextProperties
} from './PortfolioContext'

interface PortfolioProviderProperties {
  email: string
  artworks: ProcessedArtwork[]
  children: ReactNode
}

export function PortfolioProvider({
  email,
  artworks,
  children
}: PortfolioProviderProperties): ReactElement {
  const [currentArtworks, setCurrentArtworks] = useState<ProcessedArtwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeSelectedArtworkIndex = useCallback((index: number): void => {
    setSelectedArtworkIndex(index)
  }, [])

  const onChangeArtworks = useCallback((artworks: ProcessedArtwork[]): void => {
    setCurrentArtworks([...artworks])
  }, [])

  const values = useMemo<PortfolioContextProperties>(
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
      selectedArtworkIndex,
      currentArtworks,
      onChangeArtworks,
      onChangeSelectedArtworkIndex
    ]
  )

  return (
    <PortfolioContext.Provider value={values}>
      {children}
    </PortfolioContext.Provider>
  )
}
