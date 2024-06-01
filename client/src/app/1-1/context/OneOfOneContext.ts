import { Filter } from '@/components/Filter'
import { createContext } from 'react'
import { NftArt } from '@/api/resolver/types'

export interface OneOfOneContextProperties {
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

export const OneOfOneContext = createContext<OneOfOneContextProperties | undefined>(undefined)
