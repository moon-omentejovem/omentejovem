'use client'

import { ReactElement } from 'react'
import { PortfolioProvider } from './context/PortfolioProvider'
import PortfolioContent from './content'
import { ProcessedArtwork } from '@/types/artwork'

interface PortfolioContentProviderProperties {
  email: string
  artworks: ProcessedArtwork[]
}

export function PortfolioContentProvider({
  email,
  artworks
}: PortfolioContentProviderProperties): ReactElement {
  return (
    <PortfolioProvider email={email} artworks={artworks}>
      <PortfolioContent />
    </PortfolioProvider>
  )
}
