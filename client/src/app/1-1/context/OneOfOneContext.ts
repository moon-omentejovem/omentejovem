import { Filter } from '@/components/Filter'
import { createContext } from 'react'
import { NftArt } from '@/api/resolver/types'
import { ChainedFilter } from '@/components/ArtFilter/filters'

export interface OneOfOneContextProperties {
	email: string
	unfilteredImages: NftArt[]
	artImages: (NftArt)[]
	onChangeArtImages: (images: (NftArt)[]) => void
	filters: ChainedFilter[]
	selectedArtIndex: number
	onChangeSelectedArtIndex: (index: number) => void
	totalPages: number
	artTotalPages: number
	onChangeTotalPages: (newTotal: number) => void
}

export const OneOfOneContext = createContext<OneOfOneContextProperties | undefined>(undefined)
