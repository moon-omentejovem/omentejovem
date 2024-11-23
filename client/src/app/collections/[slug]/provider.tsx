'use client'

import { ReactElement } from 'react'
import InnerCollectionContent from './content'
import { Filter } from '@/components/Filter'
import { ChainedFilter } from '@/components/ArtFilter/filters'
import { NFT } from '@/api/resolver/types'
import { CollectionsProvider } from './context/CollectionsProvider'

interface CollectionsContentProviderProperties {
  email: string
  images: NFT[]
  filters: ChainedFilter[]
  totalPages: number
  slug: string
}

export function CollectionsContentProvider({
  email,
  filters,
  images,
  totalPages,
  slug
}: CollectionsContentProviderProperties): ReactElement {
  return (
    <CollectionsProvider
      email={email}
      images={images}
      filters={filters}
      totalPages={totalPages}
    >
      <InnerCollectionContent email={email} images={images} slug={slug} />
    </CollectionsProvider>
  )
}
