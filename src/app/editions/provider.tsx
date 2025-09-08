'use client'

import { ReactElement } from 'react'
import { EditionsProvider } from './context/EditionsProvider'
import EditionsContent from './content'
import { ProcessedArtwork } from '@/types/artwork'

interface EditionsContentProviderProperties {
  email: string
  artworks: ProcessedArtwork[]
}

export function EditionsContentProvider({
  email,
  artworks
}: EditionsContentProviderProperties): ReactElement {
  return (
    <EditionsProvider
      email={email}
      artworks={artworks}
    >
      <EditionsContent />
    </EditionsProvider>
  )
}
