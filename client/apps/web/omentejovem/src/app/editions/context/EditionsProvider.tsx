import type { ReactElement, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { Filter } from '@/components/Filter'
import { NftArt } from '@/api/resolver/types'
import { EditionsContext, type EditionsContextProperties } from './EditionsContext'

interface EditionsProviderProperties {
	email: string
	images: NftArt[]
	filters: Filter[]
	totalPages: number
	children: ReactNode
}

export function EditionsProvider({
	email,
	images,
	filters,
	totalPages,
	children,
}: EditionsProviderProperties): ReactElement {
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

	const values = useMemo<EditionsContextProperties>(
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
		[images, filters, selectedArtIndex, artImages, totalPages, artTotalPages],
	)

	return <EditionsContext.Provider value={values}>{children}</EditionsContext.Provider>
}
