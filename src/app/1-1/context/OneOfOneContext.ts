import { createContext } from 'react'
import { ProcessedArtwork } from '@/types/artwork'

export interface OneOfOneContextProperties {
  email: string
  unfilteredArtworks: ProcessedArtwork[]
  artworks: ProcessedArtwork[]
  onChangeArtworks: (artworks: ProcessedArtwork[]) => void
  selectedArtworkIndex: number
  onChangeSelectedArtworkIndex: (index: number) => void
}

export const OneOfOneContext = createContext<
  OneOfOneContextProperties | undefined
>(undefined)
