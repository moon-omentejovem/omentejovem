import { Filter } from '@/components/Filter'
import { createContext } from 'react'
import { ArtImage, NftArt } from '@/api/resolver/types'

export interface PortfolioContextProperties {
	email: string
	unfilteredImages: NftArt[]
	artImages: (NftArt)[]
	onChangeArtImages: (images: (NftArt)[]) => void
	filters: Filter[]
	selectedArtIndex: number
	onChangeSelectedArtIndex: (index: number) => void
	totalPages: number
	artTotalPages: number
	onChangeTotalPages: (newTotal: number) => void
}

export const PortfolioContext = createContext<PortfolioContextProperties | undefined>(undefined)
