'use client'

import { ReactElement } from 'react'
import { OneOfOneProvider } from './context/OneOfOneProvider'
import OneOfOneContent from './content'
import { Filter } from '@/components/Filter'
import { ChainedFilter } from '@/components/ArtFilter/filters'
import { NFT } from '@/api/resolver/types'

interface OneOfOneContentProviderProperties {
  email: string
  images: NFT[]
  filters: ChainedFilter[]
  totalPages: number
}

export function OneOfOneContentProvider({
  email,
  filters,
  images,
  totalPages
}: OneOfOneContentProviderProperties): ReactElement {
  return (
    <OneOfOneProvider
      email={email}
      images={images}
      filters={filters}
      totalPages={totalPages}
    >
      <OneOfOneContent />
    </OneOfOneProvider>
  )
}
