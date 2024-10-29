import { createContext } from 'react'
import { NFT } from '@/api/resolver/types'

export interface PortfolioContextProperties {
  email: string
  unfilteredImages: NFT[]
  artImages: NFT[]
  onChangeArtImages: (images: NFT[]) => void
  selectedArtIndex: number
  onChangeSelectedArtIndex: (index: number) => void
  // totalPages: number
  // artTotalPages: number
  // onChangeTotalPages: (newTotal: number) => void
}

export const PortfolioContext = createContext<
  PortfolioContextProperties | undefined
>(undefined)
