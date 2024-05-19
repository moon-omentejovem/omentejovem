import type { ReactElement, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { ArtImage, NftArt } from '@/api/resolver/types'
import { Filter } from '@/components/Filter'
import { PortfolioContext, type PortfolioContextProperties } from './PortfolioContext'

interface PortfolioProviderProperties {
	email: string
	images: NftArt[]
	children: ReactNode
}

export function PortfolioProvider({
	email,
	images,
	children,
}: PortfolioProviderProperties): ReactElement {
	const [artImages, setArtImages] = useState<NftArt[]>(images)
	const [selectedArtIndex, setSelectedArtIndex] = useState(-1)

	function onChangeSelectedArtIndex(index: number): void {
		setSelectedArtIndex(index)
	}

	function onChangeArtImages(images: NftArt[]): void {
		setArtImages(images)
	}

	// function onChangeTotalPages(newTotal: number): void {
	// 	setArtTotalPages(newTotal)
	// }

	const values = useMemo<PortfolioContextProperties>(
		() => ({
			email,
			unfilteredImages: images,
			artImages,
			onChangeArtImages,
			selectedArtIndex,
			onChangeSelectedArtIndex
		}),
		[images, selectedArtIndex, artImages],
	)

	return <PortfolioContext.Provider value={values}>{children}</PortfolioContext.Provider>
}
