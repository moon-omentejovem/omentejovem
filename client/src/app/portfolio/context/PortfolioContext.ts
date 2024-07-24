import { createContext } from 'react'
import { NftArt } from '@/api/resolver/types'

export interface PortfolioContextProperties {
  email: string
  unfilteredImages: NftArt[]
  artImages: NftArt[]
  onChangeArtImages: (images: NftArt[]) => void
  selectedArtIndex: number
  onChangeSelectedArtIndex: (index: number) => void
  // totalPages: number
  // artTotalPages: number
  // onChangeTotalPages: (newTotal: number) => void
}

export const PortfolioContext = createContext<
  PortfolioContextProperties | undefined
>(undefined)
