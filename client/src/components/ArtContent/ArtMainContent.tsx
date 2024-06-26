'use client'

import { ReactElement, useCallback, useMemo, useState } from 'react'
import { ArtFilter } from '../ArtFilter/ArtFilter'
import { HorizontalCarousel } from '../Carousels/HorizontalCarousel/HorizontalCarousel'
import { VerticalCarousel } from '../Carousels/VerticalCarousel/VerticalCarousel'
import { Filter } from '../Filter'
import { ArtInfos } from './ArtInfos'
import { NftArt } from './types'
import { ChainedFilter } from '../ArtFilter/filters'

interface ArtMainContentProperties {
	email: string
	source: 'portfolio' | '1-1' | 'editions'
	filters: ChainedFilter[]
	unfilteredImages: (NftArt)[]
	onChangeArtImages: (images: (NftArt)[]) => void
	artImages: (NftArt)[]
	selectedArtIndex: number
	onChangeSelectedArtIndex: (index: number) => void
}

export function ArtMainContent({
	email,
	source,
	onChangeArtImages,
	artImages,
	selectedArtIndex,
	onChangeSelectedArtIndex,
}: ArtMainContentProperties): ReactElement {
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const selectedArt = artImages[selectedArtIndex]

	function onRedirect(index: number): void {
		onChangeSelectedArtIndex(index)
	}

	const renderContent = useCallback((): ReactElement => {
		return (
			<ArtInfos
				email={email}
				selectedArt={selectedArt}
				slides={artImages}
				onChangeSlideIndex={onChangeSelectedArtIndex}
			/>
		)
	}, [selectedArtIndex])

	if (selectedArtIndex === -1) {
		return (
			<main className="flex flex-col pt-6 h-screenMinusHeader justify-center">
				<HorizontalCarousel
					currentPage={page}
					loading={loading}
					slides={artImages}
					redirectSource={source}
					onRedirect={onRedirect}
				/>

				<ArtFilter
					currentPage={page}
					artImages={artImages}
					onChangeArtImages={onChangeArtImages}
				/>
			</main>
		)
	}

	return (
		<main className="flex flex-col px-6 pb-16 xl:px-20 xl:pt-10 xl:pb-8 xl:h-screenMinusHeader">
			<VerticalCarousel
				slideIndex={selectedArtIndex}
				onChangeSlideIndex={onChangeSelectedArtIndex}
				slides={artImages}
			/>

			{renderContent()}
		</main>
	)
}
