'use client'

import { ReactElement } from 'react'
import { EditionsProvider } from './context/EditionsProvider'
import EditionsContent from './content'
import { NFT } from '@/components/ArtContent/types'
import { ChainedFilter } from '@/components/ArtFilter/filters'

interface EditionsContentProviderProperties {
  email: string
  images: NFT[]
  filters: ChainedFilter[]
  totalPages: number
}

export function EditionsContentProvider({
  email,
  filters,
  images,
  totalPages
}: EditionsContentProviderProperties): ReactElement {
  return (
    <EditionsProvider
      email={email}
      images={images}
      filters={filters}
      totalPages={totalPages}
    >
      <EditionsContent />
    </EditionsProvider>
  )
}
