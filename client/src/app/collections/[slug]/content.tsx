'use client'

import { NFT } from '@/api/resolver/types'
import { ArtInfosCollections } from '@/components/ArtContent/ArtInfosCollections'
import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { HorizontalInCarousel } from '@/components/Carousels/HorizontalInCarousel/HorizontalInCarousel'
import { ReactElement, useState } from 'react'
import { useCollectionsContext } from './context/useCollectionsContext'

interface InnerCollectionContentProperties {
  email: string
  slug: string
  images: Omit<NFT, 'contracts'>[]
}

export default function InnerCollectionContent({
  email,
  slug,
  images
}: InnerCollectionContentProperties): ReactElement {
  const {
    artImages,
    selectedArtIndex,
    filters,
    unfilteredImages,
    onChangeArtImages,
    onChangeSelectedArtIndex,
    artTotalPages,
    onChangeTotalPages
  } = useCollectionsContext()

  return (
    <ArtMainContent
      email={email}
      source={`collections/${slug}`}
      artImages={images}
      onChangeArtImages={onChangeArtImages}
      onChangeSelectedArtIndex={onChangeSelectedArtIndex}
      selectedArtIndex={selectedArtIndex}
      unfilteredImages={unfilteredImages}
    />
  )
}
