'use client'

import { requestNfts } from '@/api/resolver/requestNfts'
import { usePathname } from 'next/navigation'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { ArtFilter } from '../ArtFilter/ArtFilter'
import { HorizontalCarousel } from '../Carousels/HorizontalCarousel/HorizontalCarousel'
import { VerticalCarousel } from '../Carousels/VerticalCarousel/VerticalCarousel'
import { Filter } from '../Filter'
import { ArtInfos } from './ArtInfos'
import { ArtImage, NftArt } from './types'
import { useIsFetching } from 'react-query'

interface ArtMainContentProperties {
	email: string
	source: 'portfolio' | '1-1' | 'editions'
	filters: Filter[]
	unfilteredImages: (NftArt)[]
	onChangeArtImages: (images: (NftArt)[]) => void
	artImages: (NftArt)[]
	selectedArtIndex: number
	onChangeSelectedArtIndex: (index: number) => void
	totalPages: number
	onChangeTotalPages: (newTotal: number) => void
}

export function ArtMainContent({
	email,
	source,
	unfilteredImages,
	filters,
	onChangeArtImages,
	artImages,
	selectedArtIndex,
	onChangeSelectedArtIndex,
	totalPages,
	onChangeTotalPages,
}: ArtMainContentProperties): ReactElement {
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const selectedArt = artImages[selectedArtIndex]

	function onRedirect(index: number): void {
		onChangeSelectedArtIndex(index)
	}

	function onChangeCurrentPage(newPage: number): void {
		setPage(newPage)
	}

	function onChangeLoading(loadingState: boolean): void {
		setLoading(loadingState)
	}

	const handleMoreSlides = useCallback(async () => {
		if (page >= totalPages || loading) {
			return
		}
		setPage((oldPage) => oldPage + 1)
	}, [page, loading, totalPages])

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
					getMoreSlides={() => handleMoreSlides()}
				/>

				<ArtFilter
					filters={filters}
					currentPage={page}
					artImages={artImages}
					onChangeLoading={onChangeLoading}
					onChangeCurrentPage={onChangeCurrentPage}
					onChangeArtImages={onChangeArtImages}
					unfilteredImages={unfilteredImages}
					onChangeTotalPages={onChangeTotalPages}
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
				getMoreSlides={() => handleMoreSlides()}
			/>

			{renderContent()}
		</main>
	)
}
