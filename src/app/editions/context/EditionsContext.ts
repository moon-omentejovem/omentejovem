import { Filter } from '@/components/Filter'
import { createContext } from 'react'
import { NFT } from '@/api/resolver/types'
import { ChainedFilter } from '@/components/ArtFilter/filters'

export interface EditionsContextProperties {
  email: string
  unfilteredImages: NFT[]
  artImages: NFT[]
  onChangeArtImages: (images: NFT[]) => void
  filters: ChainedFilter[]
  selectedArtIndex: number
  onChangeSelectedArtIndex: (index: number) => void
  totalPages: number
  artTotalPages: number
  onChangeTotalPages: (newTotal: number) => void
}

export const EditionsContext = createContext<
  EditionsContextProperties | undefined
>(undefined)
