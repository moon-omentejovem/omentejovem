'use client'

import { ReactElement } from 'react'
import { CollectionsProvider } from './context/CollectionsProvider'
import InnerCollectionContent from './content'
import { ProcessedArtwork } from '@/types/artwork'

interface CollectionsContentProviderProperties {
  email: string
  slug: string
  artworks: ProcessedArtwork[]
}

export function CollectionsContentProvider({
  email,
  slug,
  artworks
}: CollectionsContentProviderProperties): ReactElement {
  return (
    <CollectionsProvider
      email={email}
      artworks={artworks}
    >
      <InnerCollectionContent 
        email={email} 
        slug={slug} 
        artworks={artworks} 
      />
    </CollectionsProvider>
  )
}
