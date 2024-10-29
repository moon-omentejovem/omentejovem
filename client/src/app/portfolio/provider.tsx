'use client'

import { ReactElement } from 'react'
import { PortfolioProvider } from './context/PortfolioProvider'
import PortfolioContent from './content'
import { NFT } from '@/components/ArtContent/types'
import { Filter } from '@/components/Filter'

interface PortfolioContentProviderProperties {
  email: string
  images: NFT[]
}

export function PortfolioContentProvider({
  email,
  images
}: PortfolioContentProviderProperties): ReactElement {
  return (
    <PortfolioProvider email={email} images={images}>
      <PortfolioContent />
    </PortfolioProvider>
  )
}
