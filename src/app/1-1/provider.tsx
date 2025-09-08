'use client'

import { ReactElement } from 'react'
import { OneOfOneProvider } from './context/OneOfOneProvider'
import OneOfOneContent from './content'
import { ProcessedArtwork } from '@/types/artwork'

interface OneOfOneContentProviderProperties {
  email: string
  artworks: ProcessedArtwork[]
}

export function OneOfOneContentProvider({
  email,
  artworks
}: OneOfOneContentProviderProperties): ReactElement {
  return (
    <OneOfOneProvider
      email={email}
      artworks={artworks}
    >
      <OneOfOneContent />
    </OneOfOneProvider>
  )
}
