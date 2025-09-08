import type { ReactElement, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { ProcessedArtwork } from '@/types/artwork'
import {
  EditionsContext,
  type EditionsContextProperties
} from './EditionsContext'

interface EditionsProviderProperties {
  email: string
  artworks: ProcessedArtwork[]
  children: ReactNode
}

export function EditionsProvider({
  email,
  artworks,
  children
}: EditionsProviderProperties): ReactElement {
  const [currentArtworks, setCurrentArtworks] = useState<ProcessedArtwork[]>(artworks)
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(-1)

  const onChangeSelectedArtworkIndex = useCallback((index: number): void => {
    setSelectedArtworkIndex(index)
  }, [])

  const onChangeArtworks = useCallback((artworks: ProcessedArtwork[]): void => {
    setCurrentArtworks([...artworks])
  }, [])

  const values = useMemo<EditionsContextProperties>(
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
    <EditionsContext.Provider value={values}>
      {children}
    </EditionsContext.Provider>
  )
}
