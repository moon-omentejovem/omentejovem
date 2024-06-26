import type { ReactElement, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { NftArt } from '@/api/resolver/types'
import { Filter } from '@/components/Filter'
import { OneOfOneContext, type OneOfOneContextProperties } from './OneOfOneContext'
import { ChainedFilter } from '@/components/ArtFilter/filters'

interface OneOfOneProviderProperties {
	email: string
	images: NftArt[]
	filters: ChainedFilter[]
	totalPages: number
	children: ReactNode
}

export function OneOfOneProvider({
	email,
	images,
	filters,
	totalPages,
	children,
}: OneOfOneProviderProperties): ReactElement {
	const [artImages, setArtImages] = useState<NftArt[]>(images)
	const [artTotalPages, setArtTotalPages] = useState(totalPages)
	const [selectedArtIndex, setSelectedArtIndex] = useState(-1)

	function onChangeSelectedArtIndex(index: number): void {
		setSelectedArtIndex(index)
	}

	function onChangeArtImages(images: NftArt[]): void {
		setArtImages(images)
	}

	function onChangeTotalPages(newTotal: number): void {
		setArtTotalPages(newTotal)
	}

	const values = useMemo<OneOfOneContextProperties>(
		() => ({
			email,
			unfilteredImages: images,
			artImages,
			onChangeArtImages,
			filters,
			selectedArtIndex,
			onChangeSelectedArtIndex,
			totalPages,
			artTotalPages,
			onChangeTotalPages,
		}),
		[images, filters, selectedArtIndex, artImages, onChangeArtImages, onChangeSelectedArtIndex],
	)

	return <OneOfOneContext.Provider value={values}>{children}</OneOfOneContext.Provider>
}
