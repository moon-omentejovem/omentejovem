import { createContext } from 'react'
import { ProcessedArtwork } from '@/types/artwork'

export interface PortfolioContextProperties {
  email: string
  unfilteredArtworks: ProcessedArtwork[]
  artworks: ProcessedArtwork[]
  onChangeArtworks: (artworks: ProcessedArtwork[]) => void
  selectedArtworkIndex: number
  onChangeSelectedArtworkIndex: (index: number) => void
}

export const PortfolioContext = createContext<
  PortfolioContextProperties | undefined
>(undefined)
