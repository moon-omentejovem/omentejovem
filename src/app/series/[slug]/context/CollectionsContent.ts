import { createContext } from 'react'
import { ProcessedArtwork } from '@/types/artwork'

export interface CollectionsContextProperties {
  email: string
  unfilteredArtworks: ProcessedArtwork[]
  artworks: ProcessedArtwork[]
  onChangeArtworks: (artworks: ProcessedArtwork[]) => void
  selectedArtworkIndex: number
  onChangeSelectedArtworkIndex: (index: number) => void
}

export const CollectionsContext = createContext<
  CollectionsContextProperties | undefined
>(undefined)
