import { Filter } from '@/components/Filter'
import { createContext } from 'react'
import { ArtImage, NftArt } from '@/api/resolver/types'

export interface EditionsContextProperties {
	email: string
	unfilteredImages: ArtImage[]
	artImages: (ArtImage | NftArt)[]
	onChangeArtImages: (images: (ArtImage | NftArt)[]) => void
	filters: Filter[]
	selectedArtIndex: number
	onChangeSelectedArtIndex: (index: number) => void
	totalPages: number
	artTotalPages: number
	onChangeTotalPages: (newTotal: number) => void
}

export const EditionsContext = createContext<EditionsContextProperties | undefined>(undefined)
