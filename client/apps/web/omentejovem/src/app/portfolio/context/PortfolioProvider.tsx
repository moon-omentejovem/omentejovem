import type { ReactElement, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { ArtImage } from '@/api/resolver/types'
import { Filter } from '@/components/Filter'
import { PortfolioContext, type PortfolioContextProperties } from './PortfolioContext'

interface PortfolioProviderProperties {
	email: string
	images: ArtImage[]
	filters: Filter[]
	totalPages: number
	children: ReactNode
}

export function PortfolioProvider({
	email,
	images,
	filters,
	totalPages,
	children,
}: PortfolioProviderProperties): ReactElement {
	const [artImages, setArtImages] = useState<ArtImage[]>(images)
	const [artTotalPages, setArtTotalPages] = useState(totalPages)
	const [selectedArtIndex, setSelectedArtIndex] = useState(-1)

	function onChangeSelectedArtIndex(index: number): void {
		setSelectedArtIndex(index)
	}

	function onChangeArtImages(images: ArtImage[]): void {
		setArtImages(images)
	}

	function onChangeTotalPages(newTotal: number): void {
		setArtTotalPages(newTotal)
	}

	const values = useMemo<PortfolioContextProperties>(
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

	return <PortfolioContext.Provider value={values}>{children}</PortfolioContext.Provider>
}
