import type { ReactElement, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { NFT } from '@/api/resolver/types'
import {
  PortfolioContext,
  type PortfolioContextProperties
} from './PortfolioContext'

interface PortfolioProviderProperties {
  email: string
  images: NFT[]
  children: ReactNode
}

export function PortfolioProvider({
  email,
  images,
  children
}: PortfolioProviderProperties): ReactElement {
  const [artImages, setArtImages] = useState<NFT[]>(images)
  const [selectedArtIndex, setSelectedArtIndex] = useState(-1)

  const onChangeSelectedArtIndex = useCallback((index: number): void => {
    setSelectedArtIndex(index)
  }, [])

  const onChangeArtImages = useCallback((images: NFT[]): void => {
    setArtImages([...images])
  }, [])

  // function onChangeTotalPages(newTotal: number): void {
  // 	setArtTotalPages(newTotal)
  // }

  const values = useMemo<PortfolioContextProperties>(
    () => ({
      email,
      unfilteredImages: images,
      artImages,
      onChangeArtImages,
      selectedArtIndex,
      onChangeSelectedArtIndex
    }),
    [
      email,
      images,
      selectedArtIndex,
      artImages,
      onChangeArtImages,
      onChangeSelectedArtIndex
    ]
  )

  return (
    <PortfolioContext.Provider value={values}>
      {children}
    </PortfolioContext.Provider>
  )
}
